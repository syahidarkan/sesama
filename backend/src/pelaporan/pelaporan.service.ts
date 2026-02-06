import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';
import { ArticleStatus, UserRole, AuditAction, ApprovalActionType } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class PelaporanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create new pelaporan (by PENGUSUL, CONTENT_MANAGER, or MANAGER)
   * MANAGER and SUPER_ADMIN can publish directly (auto-ACTIVE)
   */
  async create(
    authorId: string,
    authorRole: UserRole,
    data: {
      title: string;
      content: string;
      excerpt?: string;
      coverImageUrl?: string;
      programId?: string;
    },
  ) {
    // Validate program if programId is provided
    if (data.programId) {
      const program = await this.prisma.program.findUnique({
        where: { id: data.programId },
      });

      if (!program) {
        throw new BadRequestException('Program tidak ditemukan');
      }

      // Validate that program is completed (CLOSED or endDate has passed)
      const isClosed = program.status === 'CLOSED';
      const hasEndDatePassed = program.endDate && new Date(program.endDate) < new Date();

      if (!isClosed && !hasEndDatePassed) {
        throw new BadRequestException(
          'Pelaporan hanya dapat dibuat untuk program yang sudah selesai (CLOSED atau timeline sudah lewat)',
        );
      }

      // If PENGUSUL, validate they own the program
      if (authorRole === UserRole.PENGUSUL && program.createdBy !== authorId) {
        throw new ForbiddenException('Anda hanya dapat membuat pelaporan untuk program yang Anda buat');
      }
    }

    const slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();

    // MANAGER and SUPER_ADMIN bypass approval (auto-publish)
    const canAutoPublish = authorRole === UserRole.MANAGER || authorRole === UserRole.SUPER_ADMIN;
    const status = canAutoPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;

    const publishedAt = status === ArticleStatus.PUBLISHED ? new Date() : null;

    const pelaporan = await this.prisma.pelaporan.create({
      data: {
        ...data,
        slug,
        authorId,
        status,
        publishedAt,
      },
      include: {
        author: true,
        program: true,
      },
    });

    await this.auditLogService.log({
      userId: authorId,
      userRole: authorRole,
      action: AuditAction.CREATE,
      entityType: 'pelaporan',
      entityId: pelaporan.id,
      metadata: { title: pelaporan.title, autoPublished: status === ArticleStatus.PUBLISHED },
    });

    // If auto-published and linked to a program, notify all donors
    if (status === ArticleStatus.PUBLISHED && data.programId) {
      this.notifyDonorsOfPelaporan(pelaporan).catch((err) =>
        console.error('Failed to notify donors:', err.message),
      );
    }

    return pelaporan;
  }

  /**
   * Notify all donors of a program about a published pelaporan
   */
  private async notifyDonorsOfPelaporan(pelaporan: any) {
    if (!pelaporan.programId || !pelaporan.program) return;

    // Get unique donors with email for this program
    const donations = await this.prisma.donation.findMany({
      where: {
        programId: pelaporan.programId,
        status: 'SUCCESS',
        donorEmail: { not: null },
      },
      select: {
        donorEmail: true,
        donorName: true,
      },
    });

    // Deduplicate by email
    const uniqueDonors = new Map<string, string>();
    for (const d of donations) {
      if (d.donorEmail && !uniqueDonors.has(d.donorEmail)) {
        uniqueDonors.set(d.donorEmail, d.donorName);
      }
    }

    console.log(`📧 Sending pelaporan notification to ${uniqueDonors.size} donors for program "${pelaporan.program.title}"`);

    for (const [email, name] of uniqueDonors) {
      this.emailService.sendPelaporanNotification({
        donorEmail: email,
        donorName: name,
        programTitle: pelaporan.program.title,
        programSlug: pelaporan.program.slug,
        pelaporanTitle: pelaporan.title,
        pelaporanSlug: pelaporan.slug,
        pelaporanExcerpt: pelaporan.excerpt || undefined,
      }).catch((err) =>
        console.error(`Failed to notify ${email}:`, err.message),
      );
    }
  }

  /**
   * Update pelaporan (only if DRAFT or REJECTED)
   */
  async update(
    pelaporanId: string,
    userId: string,
    userRole: UserRole,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImageUrl?: string;
    },
  ) {
    const pelaporan = await this.prisma.pelaporan.findUnique({
      where: { id: pelaporanId },
      include: { author: true },
    });

    if (!pelaporan) {
      throw new NotFoundException('Pelaporan tidak ditemukan');
    }

    // Only author or SUPER_ADMIN can edit
    if (pelaporan.authorId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Anda hanya dapat mengedit pelaporan Anda sendiri');
    }

    // Can't edit published pelaporan (except SUPER_ADMIN)
    if (
      pelaporan.status === ArticleStatus.PUBLISHED &&
      userRole !== UserRole.SUPER_ADMIN
    ) {
      throw new BadRequestException('Tidak dapat mengedit pelaporan yang sudah dipublikasi');
    }

    // Save to history before updating
    await this.prisma.pelaporanHistory.create({
      data: {
        pelaporanId: pelaporan.id,
        title: pelaporan.title,
        content: pelaporan.content,
        editedBy: userId,
      },
    });

    // Update slug if title changed
    let slug = pelaporan.slug;
    if (data.title && data.title !== pelaporan.title) {
      slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    }

    const updated = await this.prisma.pelaporan.update({
      where: { id: pelaporanId },
      data: {
        ...data,
        slug,
      },
      include: {
        author: true,
        program: true,
      },
    });

    await this.auditLogService.log({
      userId,
      userRole,
      action: AuditAction.UPDATE,
      entityType: 'pelaporan',
      entityId: updated.id,
      metadata: { title: updated.title },
    });

    return updated;
  }

  /**
   * Submit pelaporan for approval
   */
  async submitForApproval(pelaporanId: string, userId: string) {
    const pelaporan = await this.prisma.pelaporan.findUnique({
      where: { id: pelaporanId },
    });

    if (!pelaporan) {
      throw new NotFoundException('Pelaporan tidak ditemukan');
    }

    if (pelaporan.authorId !== userId) {
      throw new ForbiddenException('Anda hanya dapat submit pelaporan Anda sendiri');
    }

    if (pelaporan.status !== ArticleStatus.DRAFT && pelaporan.status !== ArticleStatus.REJECTED) {
      throw new BadRequestException('Pelaporan tidak dalam status DRAFT atau REJECTED');
    }

    const updated = await this.prisma.pelaporan.update({
      where: { id: pelaporanId },
      data: {
        status: ArticleStatus.PENDING_APPROVAL,
      },
    });

    await this.auditLogService.log({
      userId,
      action: AuditAction.CREATE,
      entityType: 'pelaporan_approval_request',
      entityId: updated.id,
      metadata: { title: updated.title },
    });

    return updated;
  }

  /**
   * Approve or reject pelaporan (MANAGER or SUPER_ADMIN)
   */
  async approveOrReject(
    pelaporanId: string,
    managerId: string,
    managerRole: UserRole,
    action: 'approve' | 'reject',
    comment?: string,
  ) {
    if (managerRole !== UserRole.MANAGER && managerRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya MANAGER atau SUPER_ADMIN yang dapat menyetujui/menolak pelaporan');
    }

    const pelaporan = await this.prisma.pelaporan.findUnique({
      where: { id: pelaporanId },
      include: { author: true },
    });

    if (!pelaporan) {
      throw new NotFoundException('Pelaporan tidak ditemukan');
    }

    if (pelaporan.status !== ArticleStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Pelaporan tidak dalam status menunggu persetujuan');
    }

    const newStatus =
      action === 'approve' ? ArticleStatus.PUBLISHED : ArticleStatus.REJECTED;

    // Update pelaporan and create approval record
    const [updated] = await this.prisma.$transaction([
      this.prisma.pelaporan.update({
        where: { id: pelaporanId },
        data: {
          status: newStatus,
          publishedAt: action === 'approve' ? new Date() : null,
        },
      }),
      this.prisma.pelaporanApproval.create({
        data: {
          pelaporanId,
          approverId: managerId,
          action: action === 'approve' ? ApprovalActionType.APPROVE : ApprovalActionType.REJECT,
          comment,
        },
      }),
    ]);

    await this.auditLogService.log({
      userId: managerId,
      userRole: managerRole,
      action: action === 'approve' ? AuditAction.APPROVE : AuditAction.REJECT,
      entityType: 'pelaporan',
      entityId: updated.id,
      metadata: { title: updated.title, comment },
    });

    // If approved and linked to a program, notify all donors
    if (action === 'approve' && pelaporan.programId) {
      const fullPelaporan = await this.prisma.pelaporan.findUnique({
        where: { id: updated.id },
        include: { program: true },
      });
      if (fullPelaporan) {
        this.notifyDonorsOfPelaporan(fullPelaporan).catch((err) =>
          console.error('Failed to notify donors:', err.message),
        );
      }
    }

    return updated;
  }

  /**
   * Get all pelaporan (with filters)
   */
  async findAll(filters: {
    status?: ArticleStatus;
    programId?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.programId) where.programId = filters.programId;
    if (filters.authorId) where.authorId = filters.authorId;

    const [pelaporanList, total] = await Promise.all([
      this.prisma.pelaporan.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      this.prisma.pelaporan.count({ where }),
    ]);

    return {
      data: pelaporanList,
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get pelaporan by slug (public)
   */
  async findBySlug(slug: string) {
    const pelaporan = await this.prisma.pelaporan.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            targetAmount: true,
            collectedAmount: true,
          },
        },
      },
    });

    if (!pelaporan) {
      throw new NotFoundException('Pelaporan tidak ditemukan');
    }

    // Only show published pelaporan to public
    if (pelaporan.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Pelaporan tidak ditemukan');
    }

    return pelaporan;
  }

  /**
   * Get pelaporan history
   */
  async getHistory(pelaporanId: string) {
    return this.prisma.pelaporanHistory.findMany({
      where: { pelaporanId },
      orderBy: { editedAt: 'desc' },
    });
  }

  /**
   * Delete pelaporan (only DRAFT or author)
   */
  async delete(pelaporanId: string, userId: string, userRole: UserRole) {
    const pelaporan = await this.prisma.pelaporan.findUnique({
      where: { id: pelaporanId },
    });

    if (!pelaporan) {
      throw new NotFoundException('Pelaporan tidak ditemukan');
    }

    // Only author or SUPER_ADMIN can delete
    if (pelaporan.authorId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Anda hanya dapat menghapus pelaporan Anda sendiri');
    }

    // Can't delete published pelaporan (except SUPER_ADMIN)
    if (
      pelaporan.status === ArticleStatus.PUBLISHED &&
      userRole !== UserRole.SUPER_ADMIN
    ) {
      throw new BadRequestException('Tidak dapat menghapus pelaporan yang sudah dipublikasi');
    }

    await this.prisma.pelaporan.delete({
      where: { id: pelaporanId },
    });

    await this.auditLogService.log({
      userId,
      userRole,
      action: AuditAction.DELETE,
      entityType: 'pelaporan',
      entityId: pelaporanId,
      metadata: { title: pelaporan.title },
    });

    return { message: 'Pelaporan berhasil dihapus' };
  }
}

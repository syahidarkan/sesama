import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, BeritaCategory, ArticleStatus, AuditAction } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class BeritaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // Public: Get all published berita with optional category filter
  async findAll(category?: BeritaCategory) {
    const where: any = { status: ArticleStatus.PUBLISHED };
    if (category) {
      where.category = category;
    }

    return this.prisma.berita.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  // Public: Get single berita by slug
  async findBySlug(slug: string) {
    const berita = await this.prisma.berita.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!berita || berita.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    return berita;
  }

  // Admin: Get all berita (including drafts) for management
  async findAllForAdmin(userId: string, userRole: UserRole) {
    // Only CONTENT_MANAGER, MANAGER, SUPER_ADMIN can access
    const allowedRoles = [UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN];
    if (!allowedRoles.some(r => r === userRole)) {
      throw new ForbiddenException('Anda tidak memiliki akses ke manajemen berita');
    }

    const where: any = {};

    // CONTENT_MANAGER can only see their own berita
    if (userRole === UserRole.CONTENT_MANAGER) {
      where.authorId = userId;
    }
    // MANAGER and SUPER_ADMIN can see all

    return this.prisma.berita.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create berita (direct publish, no approval)
  async create(data: any, userId: string, userRole: UserRole) {
    // Only CONTENT_MANAGER, MANAGER, SUPER_ADMIN can create
    const allowedCreateRoles = [UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN];
    if (!allowedCreateRoles.some(r => r === userRole)) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk membuat berita');
    }

    // Generate slug from title
    const slug = this.generateSlug(data.title);

    // Create berita with PUBLISHED status (direct publish)
    const berita = await this.prisma.berita.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImageUrl: data.coverImageUrl,
        category: data.category || BeritaCategory.LAINNYA,
        authorId: userId,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.CREATE,
      entityType: 'berita',
      entityId: berita.id,
      metadata: { title: berita.title },
    });

    return berita;
  }

  // Update berita (only author or SUPER_ADMIN)
  async update(id: string, data: any, userId: string, userRole: UserRole) {
    const berita = await this.prisma.berita.findUnique({
      where: { id },
    });

    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    // Only author or SUPER_ADMIN can update
    if (berita.authorId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengedit berita ini');
    }

    // Update slug if title changed
    const updateData: any = { ...data };
    if (data.title && data.title !== berita.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    const updated = await this.prisma.berita.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.UPDATE,
      entityType: 'berita',
      entityId: updated.id,
      metadata: { title: updated.title },
    });

    return updated;
  }

  // Delete berita (only SUPER_ADMIN)
  async delete(id: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat menghapus berita');
    }

    const berita = await this.prisma.berita.findUnique({
      where: { id },
    });

    if (!berita) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    await this.prisma.berita.delete({
      where: { id },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.DELETE,
      entityType: 'berita',
      entityId: berita.id,
      metadata: { title: berita.title },
    });

    return { message: 'Berita berhasil dihapus' };
  }

  // Helper: Generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
}

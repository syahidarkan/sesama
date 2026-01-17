import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, AuditAction } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class StaticPagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // Public: Get static page by slug
  async getPage(slug: string) {
    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
      include: {
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Halaman tidak ditemukan');
    }

    return page;
  }

  // Admin: Get all static pages (for management)
  async getAllPages() {
    return this.prisma.staticPage.findMany({
      include: {
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Update static page (SUPER_ADMIN only)
  async updatePage(slug: string, data: any, userId: string, userRole: UserRole) {
    // Only SUPER_ADMIN can edit static pages
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat mengedit halaman ini');
    }

    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!page) {
      throw new NotFoundException('Halaman tidak ditemukan');
    }

    const updated = await this.prisma.staticPage.update({
      where: { slug },
      data: {
        title: data.title,
        content: data.content,
        lastEditedBy: userId,
      },
      include: {
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.UPDATE,
      entityType: 'static_page',
      entityId: updated.id,
      metadata: { slug: updated.slug },
    });

    return updated;
  }

  // Create static page (SUPER_ADMIN only, for future use)
  async createPage(data: any, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat membuat halaman baru');
    }

    const page = await this.prisma.staticPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        lastEditedBy: userId,
      },
      include: {
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.CREATE,
      entityType: 'static_page',
      entityId: page.id,
      metadata: { slug: page.slug },
    });

    return page;
  }

  // Delete static page (SUPER_ADMIN only, for future use)
  async deletePage(slug: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat menghapus halaman');
    }

    // Prevent deletion of critical pages
    if (['about-us', 'legal'].includes(slug)) {
      throw new ForbiddenException('Halaman ini tidak dapat dihapus');
    }

    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!page) {
      throw new NotFoundException('Halaman tidak ditemukan');
    }

    await this.prisma.staticPage.delete({
      where: { slug },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.DELETE,
      entityType: 'static_page',
      entityId: page.id,
      metadata: { slug },
    });

    return { message: 'Halaman berhasil dihapus' };
  }
}

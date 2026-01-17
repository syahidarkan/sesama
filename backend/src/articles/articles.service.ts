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
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create new article (by PENGUSUL, CONTENT_MANAGER, MANAGER, or SUPER_ADMIN)
   * MANAGER and SUPER_ADMIN can publish directly (auto-PUBLISHED)
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
    const slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();

    // MANAGER and SUPER_ADMIN bypass approval (auto-publish)
    const canAutoPublish = authorRole === UserRole.MANAGER || authorRole === UserRole.SUPER_ADMIN;
    const status = canAutoPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;
    const publishedAt = status === ArticleStatus.PUBLISHED ? new Date() : null;

    const article = await this.prisma.article.create({
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
      entityType: 'article',
      entityId: article.id,
      metadata: { title: article.title, autoPublished: status === ArticleStatus.PUBLISHED },
    });

    return article;
  }

  /**
   * Update article (only if DRAFT or REJECTED)
   */
  async update(
    articleId: string,
    userId: string,
    userRole: UserRole,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      coverImageUrl?: string;
    },
  ) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Only author or SUPER_ADMIN can edit
    if (article.authorId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    // Can't edit published articles (except SUPER_ADMIN)
    if (
      article.status === ArticleStatus.PUBLISHED &&
      userRole !== UserRole.SUPER_ADMIN
    ) {
      throw new BadRequestException('Cannot edit published articles');
    }

    // Save to history before updating
    await this.prisma.articleHistory.create({
      data: {
        articleId: article.id,
        title: article.title,
        content: article.content,
        editedBy: userId,
      },
    });

    // Update slug if title changed
    let slug = article.slug;
    if (data.title && data.title !== article.title) {
      slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    }

    const updated = await this.prisma.article.update({
      where: { id: articleId },
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
      entityType: 'article',
      entityId: updated.id,
      metadata: { title: updated.title },
    });

    return updated;
  }

  /**
   * Submit article for approval
   */
  async submitForApproval(articleId: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only submit your own articles');
    }

    if (article.status !== ArticleStatus.DRAFT && article.status !== ArticleStatus.REJECTED) {
      throw new BadRequestException('Article is not in DRAFT or REJECTED status');
    }

    const updated = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PENDING_APPROVAL,
      },
    });

    await this.auditLogService.log({
      userId,
      action: AuditAction.CREATE,
      entityType: 'article_approval_request',
      entityId: updated.id,
      metadata: { title: updated.title },
    });

    return updated;
  }

  /**
   * Approve or reject article (MANAGER only)
   */
  async approveOrReject(
    articleId: string,
    managerId: string,
    managerRole: UserRole,
    action: 'approve' | 'reject',
    comment?: string,
  ) {
    if (managerRole !== UserRole.MANAGER && managerRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only MANAGER or SUPER_ADMIN can approve/reject articles');
    }

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.status !== ArticleStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Article is not pending approval');
    }

    const newStatus =
      action === 'approve' ? ArticleStatus.PUBLISHED : ArticleStatus.REJECTED;

    // Update article and create approval record
    const [updated] = await this.prisma.$transaction([
      this.prisma.article.update({
        where: { id: articleId },
        data: {
          status: newStatus,
          publishedAt: action === 'approve' ? new Date() : null,
        },
      }),
      this.prisma.articleApproval.create({
        data: {
          articleId,
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
      entityType: 'article',
      entityId: updated.id,
      metadata: { title: updated.title, comment },
    });

    return updated;
  }

  /**
   * Get all articles (with filters)
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

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
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
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles,
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get article by slug (public)
   */
  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
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

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Only show published articles to public
    if (article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  /**
   * Get article history
   */
  async getHistory(articleId: string) {
    return this.prisma.articleHistory.findMany({
      where: { articleId },
      orderBy: { editedAt: 'desc' },
    });
  }

  /**
   * Delete article (only DRAFT or author)
   */
  async delete(articleId: string, userId: string, userRole: UserRole) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Only author or SUPER_ADMIN can delete
    if (article.authorId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    // Can't delete published articles (except SUPER_ADMIN)
    if (
      article.status === ArticleStatus.PUBLISHED &&
      userRole !== UserRole.SUPER_ADMIN
    ) {
      throw new BadRequestException('Cannot delete published articles');
    }

    await this.prisma.article.delete({
      where: { id: articleId },
    });

    await this.auditLogService.log({
      userId,
      userRole,
      action: AuditAction.DELETE,
      entityType: 'article',
      entityId: articleId,
      metadata: { title: article.title },
    });

    return { message: 'Article deleted successfully' };
  }
}

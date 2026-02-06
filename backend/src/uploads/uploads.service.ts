import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { FileCategory, UserRole, AuditAction } from '@prisma/client';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class UploadsService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Save file metadata to database
   */
  async saveFile(
    file: Express.Multer.File,
    userId: string,
    userRole: UserRole,
    options: {
      category?: FileCategory;
      entityType?: string;
      entityId?: string;
      fieldName?: string;
      isPublic?: boolean;
    } = {},
  ) {
    const uploadedFile = await this.prisma.uploadedFile.create({
      data: {
        filename: file.originalname,
        storedFilename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        category: options.category || FileCategory.OTHER,
        entityType: options.entityType,
        entityId: options.entityId,
        fieldName: options.fieldName,
        uploadedBy: userId,
        isPublic: options.isPublic || false,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.auditLogService.log({
      userId,
      userRole,
      action: AuditAction.CREATE,
      entityType: 'uploaded_file',
      entityId: uploadedFile.id,
      metadata: {
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        category: options.category,
      },
    });

    return uploadedFile;
  }

  /**
   * Save multiple files
   */
  async saveMultipleFiles(
    files: Express.Multer.File[],
    userId: string,
    userRole: UserRole,
    options: {
      category?: FileCategory;
      entityType?: string;
      entityId?: string;
      fieldName?: string;
      isPublic?: boolean;
    } = {},
  ) {
    const uploadedFiles = await Promise.all(
      files.map((file) => this.saveFile(file, userId, userRole, options)),
    );
    return uploadedFiles;
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string) {
    const file = await this.prisma.uploadedFile.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    return file;
  }

  /**
   * Get file path for serving
   */
  async getFilePath(storedFilename: string) {
    const file = await this.prisma.uploadedFile.findUnique({
      where: { storedFilename },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    const filePath = join(this.uploadsDir, storedFilename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan di server');
    }

    return {
      path: filePath,
      mimeType: file.mimeType,
      filename: file.filename,
    };
  }

  /**
   * Get all files (for admin dashboard)
   */
  async getAllFiles(filters: {
    category?: FileCategory;
    entityType?: string;
    entityId?: string;
    uploadedBy?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.uploadedBy) where.uploadedBy = filters.uploadedBy;

    const [files, total] = await Promise.all([
      this.prisma.uploadedFile.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { uploadedAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.uploadedFile.count({ where }),
    ]);

    return {
      data: files,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get files by entity (program, user, etc.)
   */
  async getFilesByEntity(entityType: string, entityId: string) {
    return this.prisma.uploadedFile.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * Update file entity association
   */
  async associateFileWithEntity(
    fileId: string,
    entityType: string,
    entityId: string,
    fieldName?: string,
  ) {
    return this.prisma.uploadedFile.update({
      where: { id: fileId },
      data: {
        entityType,
        entityId,
        fieldName,
      },
    });
  }

  /**
   * Delete file (SUPER_ADMIN or uploader only)
   */
  async deleteFile(fileId: string, userId: string, userRole: UserRole) {
    const file = await this.prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    // Only uploader or SUPER_ADMIN can delete
    if (file.uploadedBy !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Anda tidak memiliki izin untuk menghapus file ini');
    }

    // Delete physical file
    const filePath = join(this.uploadsDir, file.storedFilename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Delete database record
    await this.prisma.uploadedFile.delete({
      where: { id: fileId },
    });

    await this.auditLogService.log({
      userId,
      userRole,
      action: AuditAction.DELETE,
      entityType: 'uploaded_file',
      entityId: fileId,
      metadata: {
        filename: file.filename,
      },
    });

    return { message: 'File berhasil dihapus' };
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    const stats = await this.prisma.uploadedFile.aggregate({
      _count: { id: true },
      _sum: { size: true },
    });

    const byCategory = await this.prisma.uploadedFile.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { size: true },
    });

    return {
      totalFiles: stats._count.id,
      totalSize: stats._sum.size || 0,
      totalSizeFormatted: this.formatFileSize(stats._sum.size || 0),
      byCategory: byCategory.map((cat) => ({
        category: cat.category,
        count: cat._count.id,
        size: cat._sum.size || 0,
        sizeFormatted: this.formatFileSize(cat._sum.size || 0),
      })),
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

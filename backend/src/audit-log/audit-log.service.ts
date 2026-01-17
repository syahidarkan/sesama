import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, UserRole } from '@prisma/client';

export interface AuditLogData {
  userId?: string;
  userRole?: UserRole;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create immutable audit log entry
   * This is called automatically by interceptors and guards
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      // In development mode, show detailed audit log in console
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        console.log('\n📊 [AUDIT LOG] ═══════════════════════════════');
        console.log(`Action: ${data.action}`);
        if (data.userId) console.log(`User ID: ${data.userId.slice(0, 8)}...`);
        if (data.userRole) console.log(`User Role: ${data.userRole}`);
        if (data.entityType) console.log(`Entity Type: ${data.entityType}`);
        if (data.entityId) console.log(`Entity ID: ${data.entityId.slice(0, 8)}...`);
        if (data.ipAddress) console.log(`IP Address: ${data.ipAddress} ${data.ipAddress === '::1' ? '(localhost IPv6)' : ''}`);
        if (data.metadata && Object.keys(data.metadata).length > 0) {
          console.log(`Metadata: ${JSON.stringify(data.metadata)}`);
          // Add explanation for common metadata patterns
          if (data.metadata.method === 'otp') {
            console.log(`  ↳ Penjelasan: Login berhasil menggunakan 2FA/OTP`);
          }
          if (data.metadata.reason) {
            console.log(`  ↳ Alasan: ${data.metadata.reason}`);
          }
        }
        console.log(`Timestamp: ${new Date().toLocaleString('id-ID')}`);
        console.log('════════════════════════════════════════════════\n');
      }

      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userRole: data.userRole,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Log to console but don't throw - audit failures shouldn't break the app
      console.error('❌ [AUDIT LOG] Failed to create audit log:', error.message);
    }
  }

  /**
   * Get audit logs with filters (for SUPERVISOR and SUPER_ADMIN)
   */
  async getLogs(filters: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return logs;
  }

  /**
   * Clean old audit logs (run periodically via cron)
   */
  async cleanOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

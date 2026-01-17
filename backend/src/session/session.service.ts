import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  private readonly idleTimeout: number;
  private readonly maxAge: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.idleTimeout = Number(
      this.configService.get('SESSION_IDLE_TIMEOUT', 600000),
    ); // 10 minutes
    this.maxAge = Number(
      this.configService.get('SESSION_MAX_AGE', 86400000),
    ); // 24 hours
  }

  /**
   * Create new session
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.maxAge);

    await this.prisma.userSession.create({
      data: {
        userId,
        token,
        ipAddress,
        userAgent,
        expiresAt,
        lastActivityAt: new Date(),
      },
    });

    return token;
  }

  /**
   * Validate session and check for idle timeout
   */
  async validateSession(token: string): Promise<{
    isValid: boolean;
    userId?: string;
    requiresReauth?: boolean;
  }> {
    const session = await this.prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return { isValid: false };
    }

    const now = new Date();

    // Check if session expired
    if (session.expiresAt < now) {
      await this.destroySession(token);
      await this.auditLogService.log({
        userId: session.userId,
        userRole: session.user.role,
        action: AuditAction.SESSION_EXPIRED,
        metadata: { reason: 'max_age_exceeded' },
      });
      return { isValid: false };
    }

    // Check idle timeout
    const idleTime = now.getTime() - session.lastActivityAt.getTime();
    if (idleTime > this.idleTimeout) {
      await this.destroySession(token);
      await this.auditLogService.log({
        userId: session.userId,
        userRole: session.user.role,
        action: AuditAction.SESSION_EXPIRED,
        metadata: { reason: 'idle_timeout', idleTime },
      });
      return { isValid: false, requiresReauth: true };
    }

    // Update last activity
    await this.prisma.userSession.update({
      where: { token },
      data: { lastActivityAt: now },
    });

    return { isValid: true, userId: session.userId };
  }

  /**
   * Destroy session
   */
  async destroySession(token: string): Promise<void> {
    await this.prisma.userSession.delete({
      where: { token },
    });
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  /**
   * Clean expired sessions (run periodically via cron)
   */
  async cleanExpiredSessions(): Promise<number> {
    const result = await this.prisma.userSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}

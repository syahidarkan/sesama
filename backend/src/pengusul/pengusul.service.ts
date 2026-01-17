import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';
import { PengusulStatus, UserRole, AuditAction, ActionType, ApprovalStatus } from '@prisma/client';

@Injectable()
export class PengusulService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Register as pengusul (submit verification request)
   */
  async register(
    userId: string,
    data: {
      ktpNumber: string;
      ktpImageUrl: string;
      phone: string;
      address: string;
      institutionName?: string;
      institutionProfile?: string;
      supportingDocuments?: string[]; // Array of URLs
    },
  ) {
    // Check if user already registered as pengusul
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.pengusulStatus) {
      throw new BadRequestException(
        'You have already submitted a pengusul registration. Status: ' +
          user.pengusulStatus,
      );
    }

    // Check if KTP already used
    const existingKtp = await this.prisma.user.findUnique({
      where: { ktpNumber: data.ktpNumber },
    });

    if (existingKtp) {
      throw new BadRequestException('KTP number already registered');
    }

    // Update user with pengusul data
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        pengusulStatus: PengusulStatus.PENDING_VERIFICATION,
        ktpNumber: data.ktpNumber,
        ktpImageUrl: data.ktpImageUrl,
        phone: data.phone,
        address: data.address,
        institutionName: data.institutionName,
        institutionProfile: data.institutionProfile,
        supportingDocuments: data.supportingDocuments || [],
      },
    });

    // Create approval request
    await this.prisma.approval.create({
      data: {
        entityType: 'user',
        entityId: userId,
        actionType: ActionType.PENGUSUL_REGISTRATION,
        requestedBy: userId,
        metadata: {
          ktpNumber: data.ktpNumber,
          phone: data.phone,
          institutionName: data.institutionName,
        },
      },
    });

    await this.auditLogService.log({
      userId,
      userRole: user.role,
      action: AuditAction.CREATE,
      entityType: 'pengusul_registration',
      entityId: userId,
      metadata: { ktpNumber: data.ktpNumber },
    });

    return updated;
  }

  /**
   * Get all pending pengusul registrations (MANAGER only)
   */
  async getPendingRegistrations(limit: number = 20, offset: number = 0) {
    const [registrations, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          pengusulStatus: PengusulStatus.PENDING_VERIFICATION,
        },
        select: {
          id: true,
          email: true,
          name: true,
          ktpNumber: true,
          ktpImageUrl: true,
          phone: true,
          address: true,
          institutionName: true,
          institutionProfile: true,
          supportingDocuments: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({
        where: { pengusulStatus: PengusulStatus.PENDING_VERIFICATION },
      }),
    ]);

    return {
      data: registrations,
      total,
      limit,
      offset,
    };
  }

  /**
   * Approve or reject pengusul registration (MANAGER only)
   */
  async verifyPengusul(
    pengusulId: string,
    managerId: string,
    managerRole: UserRole,
    action: 'approve' | 'reject',
    notes?: string,
  ) {
    if (managerRole !== UserRole.MANAGER && managerRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only MANAGER or SUPER_ADMIN can verify pengusul');
    }

    const pengusul = await this.prisma.user.findUnique({
      where: { id: pengusulId },
    });

    if (!pengusul) {
      throw new NotFoundException('Pengusul not found');
    }

    if (pengusul.pengusulStatus !== PengusulStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Pengusul is not pending verification');
    }

    const newStatus =
      action === 'approve' ? PengusulStatus.APPROVED : PengusulStatus.REJECTED;

    // Update pengusul status
    const updated = await this.prisma.user.update({
      where: { id: pengusulId },
      data: {
        pengusulStatus: newStatus,
        verificationNotes: notes,
        verifiedAt: new Date(),
        verifiedBy: managerId,
        // If approved, upgrade role to PENGUSUL
        role: action === 'approve' ? UserRole.PENGUSUL : pengusul.role,
      },
    });

    // Update approval record
    const approval = await this.prisma.approval.findFirst({
      where: {
        entityType: 'user',
        entityId: pengusulId,
        actionType: ActionType.PENGUSUL_REGISTRATION,
        status: ApprovalStatus.PENDING,
      },
    });

    if (approval) {
      await this.prisma.approval.update({
        where: { id: approval.id },
        data: {
          status:
            action === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
        },
      });

      await this.prisma.approvalAction.create({
        data: {
          approvalId: approval.id,
          approverId: managerId,
          approverRole: managerRole,
          action: action === 'approve' ? 'APPROVE' : 'REJECT',
          comment: notes,
          requiresReauth: true,
        },
      });
    }

    // Send email notification
    await this.emailService.sendVerificationApproval(
      pengusul.email,
      pengusul.name,
      action === 'approve',
      notes,
    );

    await this.auditLogService.log({
      userId: managerId,
      userRole: managerRole,
      action: action === 'approve' ? AuditAction.VERIFY_PENGUSUL : AuditAction.REJECT,
      entityType: 'pengusul_verification',
      entityId: pengusulId,
      metadata: {
        pengusulEmail: pengusul.email,
        notes,
      },
    });

    return updated;
  }

  /**
   * Get pengusul profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        pengusulStatus: true,
        ktpNumber: true,
        ktpImageUrl: true,
        phone: true,
        address: true,
        institutionName: true,
        institutionProfile: true,
        supportingDocuments: true,
        verificationNotes: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get all pengusul (MANAGER/SUPERVISOR only)
   */
  async getAllPengusul(
    status?: PengusulStatus,
    limit: number = 20,
    offset: number = 0,
  ) {
    const where: any = {
      role: UserRole.PENGUSUL,
    };

    if (status) {
      where.pengusulStatus = status;
    }

    const [pengusuls, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          pengusulStatus: true,
          phone: true,
          institutionName: true,
          verifiedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: pengusuls,
      total,
      limit,
      offset,
    };
  }
}

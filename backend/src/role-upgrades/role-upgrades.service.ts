import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserRole,
  UpgradeRequestType,
  UpgradeRequestStatus,
} from '@prisma/client';

@Injectable()
export class RoleUpgradesService {
  constructor(private prisma: PrismaService) {}

  // Submit PENGUSUL upgrade request
  async submitPengusulUpgradeRequest(userId: string, dto: any) {
    // Check if user exists and is USER role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.USER) {
      throw new BadRequestException('Only USER role can request PENGUSUL upgrade');
    }

    // Check if there's already a pending request
    const existingRequest = await this.prisma.roleUpgradeRequest.findFirst({
      where: {
        userId,
        requestType: UpgradeRequestType.USER_TO_PENGUSUL,
        status: UpgradeRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException('You already have a pending upgrade request');
    }

    // Create the upgrade request
    const upgradeRequest = await this.prisma.roleUpgradeRequest.create({
      data: {
        userId,
        requestType: UpgradeRequestType.USER_TO_PENGUSUL,
        ktpNumber: dto.ktpNumber,
        ktpImageUrl: dto.ktpImageUrl,
        phone: dto.phone,
        address: dto.address,
        institutionName: dto.institutionName,
        institutionProfile: dto.institutionProfile,
        supportingDocuments: dto.supportingDocuments,
      },
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
    });

    return {
      message: 'Upgrade request submitted successfully',
      request: upgradeRequest,
    };
  }

  // Get all pending PENGUSUL requests
  async getPendingPengusulRequests() {
    return this.prisma.roleUpgradeRequest.findMany({
      where: {
        requestType: UpgradeRequestType.USER_TO_PENGUSUL,
        status: UpgradeRequestStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Get my upgrade request
  async getMyUpgradeRequest(userId: string) {
    const request = await this.prisma.roleUpgradeRequest.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return request;
  }

  // Approve PENGUSUL request
  async approvePengusulRequest(
    requestId: string,
    reviewerId: string,
    notes?: string,
  ) {
    const request = await this.prisma.roleUpgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Upgrade request not found');
    }

    if (request.status !== UpgradeRequestStatus.PENDING) {
      throw new BadRequestException('Request has already been processed');
    }

    // Update request status and user role in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Update the upgrade request
      const updatedRequest = await tx.roleUpgradeRequest.update({
        where: { id: requestId },
        data: {
          status: UpgradeRequestStatus.APPROVED,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      });

      // Upgrade user to PENGUSUL and copy data from request
      await tx.user.update({
        where: { id: request.userId },
        data: {
          role: UserRole.PENGUSUL,
          ktpNumber: request.ktpNumber,
          ktpImageUrl: request.ktpImageUrl,
          phone: request.phone,
          address: request.address,
          institutionName: request.institutionName,
          institutionProfile: request.institutionProfile,
          supportingDocuments: request.supportingDocuments,
          pengusulStatus: 'APPROVED',
          verifiedAt: new Date(),
          verifiedBy: reviewerId,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: 'UPGRADE_USER_ROLE',
          entityType: 'User',
          entityId: request.userId,
          metadata: {
            from: 'USER',
            to: 'PENGUSUL',
            requestId,
            notes,
          },
        },
      });

      return {
        message: 'User upgraded to PENGUSUL successfully',
        request: updatedRequest,
      };
    });
  }

  // Reject PENGUSUL request
  async rejectPengusulRequest(
    requestId: string,
    reviewerId: string,
    notes: string,
  ) {
    const request = await this.prisma.roleUpgradeRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Upgrade request not found');
    }

    if (request.status !== UpgradeRequestStatus.PENDING) {
      throw new BadRequestException('Request has already been processed');
    }

    const updatedRequest = await this.prisma.roleUpgradeRequest.update({
      where: { id: requestId },
      data: {
        status: UpgradeRequestStatus.REJECTED,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Upgrade request rejected',
      request: updatedRequest,
    };
  }

  // Get all users for role management (SUPER_ADMIN)
  async getAllUsersForRoleManagement() {
    return this.prisma.user.findMany({
      where: {
        role: {
          in: [
            UserRole.USER,
            UserRole.MANAGER,
            UserRole.CONTENT_MANAGER,
            UserRole.SUPERVISOR,
            UserRole.PENGUSUL,
          ],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // SUPER_ADMIN manually upgrade user role
  async upgradeUserRoleByAdmin(
    userId: string,
    targetRole: UserRole,
    adminId: string,
    notes?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.USER) {
      throw new BadRequestException('Can only upgrade users with USER role');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update user role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: targetRole,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPGRADE_USER_ROLE',
          entityType: 'User',
          entityId: userId,
          metadata: {
            from: UserRole.USER,
            to: targetRole,
            notes,
            upgradedBy: 'SUPER_ADMIN',
          },
        },
      });

      return {
        message: `User upgraded to ${targetRole} successfully`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      };
    });
  }

  // SUPER_ADMIN change user role (including downgrade)
  async changeUserRoleByAdmin(
    userId: string,
    targetRole: UserRole,
    adminId: string,
    notes?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === targetRole) {
      throw new BadRequestException('User already has this role');
    }

    // Prevent changing SUPER_ADMIN role
    if (user.role === UserRole.SUPER_ADMIN || targetRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot change SUPER_ADMIN role');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update user role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: targetRole,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPGRADE_USER_ROLE',
          entityType: 'User',
          entityId: userId,
          metadata: {
            from: user.role,
            to: targetRole,
            notes,
            changedBy: 'SUPER_ADMIN',
          },
        },
      });

      return {
        message: `User role changed from ${user.role} to ${targetRole} successfully`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          previousRole: user.role,
        },
      };
    });
  }
}

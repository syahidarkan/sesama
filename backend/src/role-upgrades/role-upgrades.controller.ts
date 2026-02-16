import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RoleUpgradesService } from './role-upgrades.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('role-upgrades')
export class RoleUpgradesController {
  constructor(private readonly roleUpgradesService: RoleUpgradesService) {}

  // Submit upgrade request to PENGUSUL (for USER role)
  @Post('pengusul/request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async requestPengusulUpgrade(@Request() req, @Body() dto: any) {
    return this.roleUpgradesService.submitPengusulUpgradeRequest(
      req.user.id,
      dto,
    );
  }

  // Get all pending PENGUSUL upgrade requests (for MANAGER)
  @Get('pengusul/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  async getPendingPengusulRequests(@Request() req) {
    return this.roleUpgradesService.getPendingPengusulRequests();
  }

  // Get my upgrade request status (for USER)
  @Get('my-request')
  @UseGuards(JwtAuthGuard)
  async getMyUpgradeRequest(@Request() req) {
    return this.roleUpgradesService.getMyUpgradeRequest(req.user.id);
  }

  // Approve PENGUSUL upgrade request (for MANAGER)
  @Patch('pengusul/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async approvePengusulRequest(
    @Param('id') requestId: string,
    @Request() req,
    @Body() dto: { notes?: string },
  ) {
    return this.roleUpgradesService.approvePengusulRequest(
      requestId,
      req.user.id,
      dto.notes,
    );
  }

  // Reject PENGUSUL upgrade request (for MANAGER)
  @Patch('pengusul/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async rejectPengusulRequest(
    @Param('id') requestId: string,
    @Request() req,
    @Body() dto: { notes: string },
  ) {
    if (!dto.notes) {
      throw new BadRequestException('Rejection notes are required');
    }
    return this.roleUpgradesService.rejectPengusulRequest(
      requestId,
      req.user.id,
      dto.notes,
    );
  }

  // SUPER_ADMIN: Get all users for role upgrade management
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getAllUsersForRoleUpgrade() {
    return this.roleUpgradesService.getAllUsersForRoleManagement();
  }

  // SUPER_ADMIN: Manually upgrade user role
  @Patch('user/:userId/upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async upgradeUserRole(
    @Param('userId') userId: string,
    @Request() req,
    @Body() dto: { targetRole: UserRole; notes?: string },
  ) {
    // Validate target role
    const allowedRoles: UserRole[] = [
      UserRole.MANAGER,
      UserRole.CONTENT_MANAGER,
      UserRole.SUPERVISOR,
    ];
    if (!(allowedRoles as readonly UserRole[]).includes(dto.targetRole)) {
      throw new BadRequestException(
        'Can only upgrade to MANAGER, CONTENT_MANAGER, or SUPERVISOR',
      );
    }

    return this.roleUpgradesService.upgradeUserRoleByAdmin(
      userId,
      dto.targetRole,
      req.user.id,
      dto.notes,
    );
  }

  // SUPER_ADMIN: Manually change user role (including downgrade)
  @Patch('user/:userId/change-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async changeUserRole(
    @Param('userId') userId: string,
    @Request() req,
    @Body() dto: { targetRole: UserRole; notes?: string },
  ) {
    return this.roleUpgradesService.changeUserRoleByAdmin(
      userId,
      dto.targetRole,
      req.user.id,
      dto.notes,
    );
  }
}

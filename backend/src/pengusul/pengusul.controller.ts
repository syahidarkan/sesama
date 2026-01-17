import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PengusulService } from './pengusul.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireReauth } from '../auth/decorators/require-reauth.decorator';
import { UserRole, PengusulStatus } from '@prisma/client';

@Controller('pengusul')
export class PengusulController {
  constructor(private readonly pengusulService: PengusulService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Req() req, @Body() body: any) {
    return this.pengusulService.register(req.user.id, body);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
  async getPendingRegistrations(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.pengusulService.getPendingRegistrations(
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @RequireReauth()
  async approve(
    @Param('id') id: string,
    @Req() req,
    @Body('notes') notes?: string,
  ) {
    return this.pengusulService.verifyPengusul(
      id,
      req.user.id,
      req.user.role,
      'approve',
      notes,
    );
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @RequireReauth()
  async reject(
    @Param('id') id: string,
    @Req() req,
    @Body('notes') notes?: string,
  ) {
    return this.pengusulService.verifyPengusul(
      id,
      req.user.id,
      req.user.role,
      'reject',
      notes,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.pengusulService.getProfile(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
  async getAllPengusul(
    @Query('status') status?: PengusulStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.pengusulService.getAllPengusul(
      status,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
  }
}

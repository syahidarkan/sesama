import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PelaporanService } from './pelaporan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireReauth } from '../auth/decorators/require-reauth.decorator';
import { UserRole, ArticleStatus } from '@prisma/client';

@Controller('pelaporan')
export class PelaporanController {
  constructor(private readonly pelaporanService: PelaporanService) {}

  @Get()
  async findAll(
    @Query('status') status?: ArticleStatus,
    @Query('programId') programId?: string,
    @Query('authorId') authorId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.pelaporanService.findAll({
      status,
      programId,
      authorId,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.pelaporanService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  async create(@Req() req, @Body() body: any) {
    return this.pelaporanService.create(req.user.id, req.user.role, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Req() req, @Body() body: any) {
    return this.pelaporanService.update(id, req.user.id, req.user.role, body);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER)
  async submitForApproval(@Param('id') id: string, @Req() req) {
    return this.pelaporanService.submitForApproval(id, req.user.id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @RequireReauth()
  async approve(
    @Param('id') id: string,
    @Req() req,
    @Body('comment') comment?: string,
  ) {
    return this.pelaporanService.approveOrReject(
      id,
      req.user.id,
      req.user.role,
      'approve',
      comment,
    );
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @RequireReauth()
  async reject(
    @Param('id') id: string,
    @Req() req,
    @Body('comment') comment?: string,
  ) {
    return this.pelaporanService.approveOrReject(
      id,
      req.user.id,
      req.user.role,
      'reject',
      comment,
    );
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
  async getHistory(@Param('id') id: string) {
    return this.pelaporanService.getHistory(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  async delete(@Param('id') id: string, @Req() req) {
    return this.pelaporanService.delete(id, req.user.id, req.user.role);
  }
}

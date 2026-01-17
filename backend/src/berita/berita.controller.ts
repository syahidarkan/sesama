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
import { BeritaService } from './berita.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, BeritaCategory } from '@prisma/client';

@Controller('berita')
export class BeritaController {
  constructor(private readonly beritaService: BeritaService) {}

  // Public: Get all published berita
  @Get()
  async findAll(@Query('category') category?: BeritaCategory) {
    return this.beritaService.findAll(category);
  }

  // Public: Get single berita by slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.beritaService.findBySlug(slug);
  }

  // Admin: Get all berita for management
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  async findAllForAdmin(@Req() req) {
    return this.beritaService.findAllForAdmin(req.user.id, req.user.role);
  }

  // Create berita (direct publish)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  async create(@Body() body: any, @Req() req) {
    return this.beritaService.create(body, req.user.id, req.user.role);
  }

  // Update berita (author or SUPER_ADMIN)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.beritaService.update(id, body, req.user.id, req.user.role);
  }

  // Delete berita (SUPER_ADMIN only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async delete(@Param('id') id: string, @Req() req) {
    return this.beritaService.delete(id, req.user.id, req.user.role);
  }
}

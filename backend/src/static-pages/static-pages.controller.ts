import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StaticPagesService } from './static-pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('static-pages')
export class StaticPagesController {
  constructor(private readonly staticPagesService: StaticPagesService) {}

  // Public: Get static page by slug
  @Get(':slug')
  async getPage(@Param('slug') slug: string) {
    return this.staticPagesService.getPage(slug);
  }

  // Admin: Get all static pages
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getAllPages() {
    return this.staticPagesService.getAllPages();
  }

  // Update static page (SUPER_ADMIN only)
  @Put(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updatePage(@Param('slug') slug: string, @Body() body: any, @Req() req) {
    return this.staticPagesService.updatePage(slug, body, req.user.id, req.user.role);
  }

  // Create static page (SUPER_ADMIN only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createPage(@Body() body: any, @Req() req) {
    return this.staticPagesService.createPage(body, req.user.id, req.user.role);
  }

  // Delete static page (SUPER_ADMIN only)
  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deletePage(@Param('slug') slug: string, @Req() req) {
    return this.staticPagesService.deletePage(slug, req.user.id, req.user.role);
  }
}

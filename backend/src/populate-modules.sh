#!/bin/bash

# SystemSettings Service
cat > system-settings/system-settings.service.ts << 'EOF'
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByCategory(category: string) {
    return this.prisma.systemSetting.findMany({
      where: { category, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: any, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can manage settings');
    }
    return this.prisma.systemSetting.create({ data });
  }

  async update(id: string, data: any, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can manage settings');
    }
    return this.prisma.systemSetting.update({ where: { id }, data });
  }

  async delete(id: string, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can manage settings');
    }
    return this.prisma.systemSetting.update({ where: { id }, data: { isActive: false } });
  }
}
EOF

# SystemSettings Controller
cat > system-settings/system-settings.controller.ts << 'EOF'
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get('category/:category')
  async getByCategory(@Param('category') category: string) {
    return this.service.getByCategory(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Body() body: any, @Req() req) {
    return this.service.create(body, req.user.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.service.update(id, body, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async delete(@Param('id') id: string, @Req() req) {
    return this.service.delete(id, req.user.role);
  }
}
EOF

echo "SystemSettings module populated"

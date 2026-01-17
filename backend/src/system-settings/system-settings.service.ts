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

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, AuditAction } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class FormFieldConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // Public: Get field config for a specific form type
  async getConfig(formType: string) {
    const configs = await this.prisma.formFieldConfig.findMany({
      where: { formType },
      orderBy: { fieldName: 'asc' },
    });

    // Convert to object for easier frontend consumption
    const configMap: Record<string, { isVisible: boolean; isRequired: boolean }> = {};
    for (const config of configs) {
      configMap[config.fieldName] = {
        isVisible: config.isVisible,
        isRequired: config.isRequired,
      };
    }

    return configMap;
  }

  // Admin: Get all configs (for management)
  async getAllConfigs() {
    const configs = await this.prisma.formFieldConfig.findMany({
      include: {
        updater: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ formType: 'asc' }, { fieldName: 'asc' }],
    });

    return configs;
  }

  // Update field config (SUPER_ADMIN only)
  async updateField(
    formType: string,
    fieldName: string,
    data: { isVisible?: boolean; isRequired?: boolean },
    userId: string,
    userRole: UserRole,
  ) {
    // Only SUPER_ADMIN can update field configs
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat mengelola konfigurasi field');
    }

    const config = await this.prisma.formFieldConfig.findUnique({
      where: { formType_fieldName: { formType, fieldName } },
    });

    if (!config) {
      throw new NotFoundException('Konfigurasi field tidak ditemukan');
    }

    const updated = await this.prisma.formFieldConfig.update({
      where: { formType_fieldName: { formType, fieldName } },
      data: {
        ...data,
        updatedBy: userId,
      },
      include: {
        updater: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.UPDATE,
      entityType: 'form_field_config',
      entityId: updated.id,
      metadata: { formType, fieldName, changes: data },
    });

    return updated;
  }

  // Create field config (SUPER_ADMIN only, for future use)
  async createField(
    data: {
      formType: string;
      fieldName: string;
      isVisible?: boolean;
      isRequired?: boolean;
    },
    userId: string,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat membuat konfigurasi field');
    }

    const config = await this.prisma.formFieldConfig.create({
      data: {
        formType: data.formType,
        fieldName: data.fieldName,
        isVisible: data.isVisible ?? true,
        isRequired: data.isRequired ?? false,
        updatedBy: userId,
      },
      include: {
        updater: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.CREATE,
      entityType: 'form_field_config',
      entityId: config.id,
      metadata: { formType: data.formType, fieldName: data.fieldName },
    });

    return config;
  }

  // Delete field config (SUPER_ADMIN only)
  async deleteField(formType: string, fieldName: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat menghapus konfigurasi field');
    }

    const config = await this.prisma.formFieldConfig.findUnique({
      where: { formType_fieldName: { formType, fieldName } },
    });

    if (!config) {
      throw new NotFoundException('Konfigurasi field tidak ditemukan');
    }

    await this.prisma.formFieldConfig.delete({
      where: { formType_fieldName: { formType, fieldName } },
    });

    // Log action
    await this.auditLog.log({
      userId,
      userRole,
      action: AuditAction.DELETE,
      entityType: 'form_field_config',
      entityId: config.id,
      metadata: { formType, fieldName },
    });

    return { message: 'Konfigurasi field berhasil dihapus' };
  }
}

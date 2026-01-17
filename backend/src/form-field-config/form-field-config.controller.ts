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
import { FormFieldConfigService } from './form-field-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('form-field-config')
export class FormFieldConfigController {
  constructor(private readonly formFieldConfigService: FormFieldConfigService) {}

  // Public: Get field config for a specific form type
  @Get(':formType')
  async getConfig(@Param('formType') formType: string) {
    return this.formFieldConfigService.getConfig(formType);
  }

  // Admin: Get all configs
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getAllConfigs() {
    return this.formFieldConfigService.getAllConfigs();
  }

  // Update field config (SUPER_ADMIN only)
  @Put(':formType/:fieldName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateField(
    @Param('formType') formType: string,
    @Param('fieldName') fieldName: string,
    @Body() body: { isVisible?: boolean; isRequired?: boolean },
    @Req() req,
  ) {
    return this.formFieldConfigService.updateField(
      formType,
      fieldName,
      body,
      req.user.id,
      req.user.role,
    );
  }

  // Create field config (SUPER_ADMIN only)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createField(@Body() body: any, @Req() req) {
    return this.formFieldConfigService.createField(body, req.user.id, req.user.role);
  }

  // Delete field config (SUPER_ADMIN only)
  @Delete(':formType/:fieldName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteField(
    @Param('formType') formType: string,
    @Param('fieldName') fieldName: string,
    @Req() req,
  ) {
    return this.formFieldConfigService.deleteField(formType, fieldName, req.user.id, req.user.role);
  }
}

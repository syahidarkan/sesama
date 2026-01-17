import { Module } from '@nestjs/common';
import { FormFieldConfigController } from './form-field-config.controller';
import { FormFieldConfigService } from './form-field-config.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [FormFieldConfigController],
  providers: [FormFieldConfigService],
  exports: [FormFieldConfigService],
})
export class FormFieldConfigModule {}

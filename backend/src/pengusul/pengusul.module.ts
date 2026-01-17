import { Module } from '@nestjs/common';
import { PengusulService } from './pengusul.service';
import { PengusulController } from './pengusul.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, AuditLogModule, EmailModule],
  controllers: [PengusulController],
  providers: [PengusulService],
  exports: [PengusulService],
})
export class PengusulModule {}

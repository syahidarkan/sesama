import { Module } from '@nestjs/common';
import { PelaporanService } from './pelaporan.service';
import { PelaporanController } from './pelaporan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, AuditLogModule, EmailModule],
  controllers: [PelaporanController],
  providers: [PelaporanService],
  exports: [PelaporanService],
})
export class PelaporanModule {}

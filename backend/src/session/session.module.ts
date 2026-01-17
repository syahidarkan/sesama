import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuditLogModule, ConfigModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

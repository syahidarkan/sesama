import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ConfigModule } from '@nestjs/config';
import { DonationsModule } from '../donations/donations.module';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [PrismaModule, AuditLogModule, ConfigModule, DonationsModule, ProgramsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

import { Module } from '@nestjs/common';
import { StaticPagesController } from './static-pages.controller';
import { StaticPagesService } from './static-pages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [StaticPagesController],
  providers: [StaticPagesService],
  exports: [StaticPagesService],
})
export class StaticPagesModule {}

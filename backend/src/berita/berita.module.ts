import { Module } from '@nestjs/common';
import { BeritaController } from './berita.controller';
import { BeritaService } from './berita.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [BeritaController],
  providers: [BeritaService],
  exports: [BeritaService],
})
export class BeritaModule {}

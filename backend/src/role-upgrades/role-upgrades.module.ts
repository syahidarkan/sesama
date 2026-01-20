import { Module } from '@nestjs/common';
import { RoleUpgradesController } from './role-upgrades.controller';
import { RoleUpgradesService } from './role-upgrades.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoleUpgradesController],
  providers: [RoleUpgradesService],
  exports: [RoleUpgradesService],
})
export class RoleUpgradesModule {}

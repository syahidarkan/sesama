import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalsController {
    constructor(private approvalsService: ApprovalsService) { }

    @Get()
    @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
    findAll(
        @Query('entityType') entityType?: string,
        @Query('status') status?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Req() req?: any,
    ) {
        return this.approvalsService.findAll({
            entityType,
            status,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
    }

    @Get(':id')
    @Roles(UserRole.MANAGER, UserRole.SUPERVISOR, UserRole.SUPER_ADMIN)
    findOne(@Param('id') id: string) {
        return this.approvalsService.findOne(id);
    }

    @Post(':id/approve')
    @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
    approve(@Param('id') id: string, @Req() req: any, @Body() body: { comment?: string }) {
        return this.approvalsService.approve(id, req.user.id, req.user.role, body.comment);
    }

    @Post(':id/reject')
    @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
    reject(@Param('id') id: string, @Req() req: any, @Body() body: { comment?: string }) {
        return this.approvalsService.reject(id, req.user.id, req.user.role, body.comment);
    }
}

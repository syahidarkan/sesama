import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('programs')
export class ProgramsController {
    constructor(private programsService: ProgramsService) { }

    @Get()
    findAll(
        @Query('status') status?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.programsService.findAll(
            status,
            limit ? parseInt(limit) : undefined,
            offset ? parseInt(offset) : undefined,
        );
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.programsService.findBySlug(slug);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
    create(@Body() data: any, @Req() req: any) {
        return this.programsService.create(data, req.user.id, req.user.role);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER, UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() data: any) {
        return this.programsService.update(id, data);
    }

    @Post(':id/submit')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PENGUSUL, UserRole.CONTENT_MANAGER)
    submit(@Param('id') id: string) {
        return this.programsService.submit(id);
    }

    @Post(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
    approve(@Param('id') id: string, @Body() body: { comment?: string }) {
        return this.programsService.approve(id, body.comment);
    }

    @Post(':id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
    reject(@Param('id') id: string, @Body() body: { comment?: string }) {
        return this.programsService.reject(id, body.comment);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    delete(@Param('id') id: string) {
        return this.programsService.delete(id);
    }
}

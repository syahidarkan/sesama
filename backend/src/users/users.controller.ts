import { Controller, Get, Param, UseGuards, Put, Body, Delete, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireReauth } from '../auth/decorators/require-reauth.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.SUPERVISOR)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() data: any) {
        return this.usersService.update(id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @RequireReauth()
    createUser(@Req() req, @Body() body: { email: string; name: string; password: string; role: UserRole }) {
        return this.usersService.createUser(body, req.user.id, req.user.role);
    }

    @Put(':id/role')
    @Roles(UserRole.SUPER_ADMIN)
    @RequireReauth()
    updateUserRole(@Param('id') id: string, @Req() req, @Body('role') role: UserRole) {
        return this.usersService.updateUserRole(id, role, req.user.id, req.user.role);
    }

    @Delete(':id/soft')
    @Roles(UserRole.SUPER_ADMIN)
    @RequireReauth()
    softDeleteUser(@Param('id') id: string, @Req() req) {
        return this.usersService.softDeleteUser(id, req.user.id, req.user.role);
    }
}

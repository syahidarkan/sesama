import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserRole, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private auditLogService: AuditLogService,
    ) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async update(id: string, data: any) {
        const { passwordHash, ...updateData } = data;
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });
    }

    async delete(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }

    /**
     * Create new user (SUPER_ADMIN only)
     */
    async createUser(
        data: {
            email: string;
            name: string;
            password: string;
            role: UserRole;
        },
        requesterId: string,
        requesterRole: UserRole,
    ) {
        // Only SUPER_ADMIN can create users
        if (requesterRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat membuat user baru');
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new BadRequestException('User dengan email ini sudah ada');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: hashedPassword,
                role: data.role,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        // Log action
        await this.auditLogService.log({
            userId: requesterId,
            userRole: requesterRole,
            action: AuditAction.CREATE,
            entityType: 'user',
            entityId: user.id,
            metadata: { email: user.email, name: user.name, role: user.role },
        });

        return user;
    }

    /**
     * Update user role (SUPER_ADMIN only)
     */
    async updateUserRole(
        userId: string,
        newRole: UserRole,
        requesterId: string,
        requesterRole: UserRole,
    ) {
        // Only SUPER_ADMIN can change roles
        if (requesterRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat mengubah role user');
        }

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan');
        }

        // Can't change own role
        if (userId === requesterId) {
            throw new ForbiddenException('Anda tidak dapat mengubah role Anda sendiri');
        }

        // Update role
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        // Log action
        await this.auditLogService.log({
            userId: requesterId,
            userRole: requesterRole,
            action: AuditAction.UPDATE,
            entityType: 'user_role',
            entityId: userId,
            metadata: { oldRole: user.role, newRole: newRole },
        });

        return updated;
    }

    /**
     * Soft delete user (SUPER_ADMIN only)
     */
    async softDeleteUser(userId: string, requesterId: string, requesterRole: UserRole) {
        // Only SUPER_ADMIN can delete users
        if (requesterRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Hanya SUPER_ADMIN yang dapat menghapus user');
        }

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User tidak ditemukan');
        }

        // Can't delete own account
        if (userId === requesterId) {
            throw new ForbiddenException('Anda tidak dapat menghapus akun Anda sendiri');
        }

        // Soft delete
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        // Log action
        await this.auditLogService.log({
            userId: requesterId,
            userRole: requesterRole,
            action: AuditAction.DELETE,
            entityType: 'user',
            entityId: userId,
            metadata: { email: user.email, name: user.name },
        });

        return updated;
    }
}

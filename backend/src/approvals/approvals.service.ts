import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ApprovalsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.approval.create({
            data,
            include: {
                requester: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }

    async findAll(filters?: {
        entityType?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.entityType) {
            where.entityType = filters.entityType;
        }

        const [data, total] = await Promise.all([
            this.prisma.approval.findMany({
                where,
                include: {
                    requester: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                    actions: {
                        include: {
                            approver: {
                                select: { id: true, name: true, email: true, role: true },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    program: true,
                },
                orderBy: { createdAt: 'desc' },
                take: filters?.limit,
                skip: filters?.offset,
            }),
            this.prisma.approval.count({ where }),
        ]);

        return {
            data,
            total,
            limit: filters?.limit || total,
            offset: filters?.offset || 0,
        };
    }

    async findOne(id: string) {
        return this.prisma.approval.findUnique({
            where: { id },
            include: {
                requester: {
                    select: { id: true, name: true, email: true, role: true },
                },
                actions: {
                    include: {
                        approver: {
                            select: { id: true, name: true, role: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                program: true,
            },
        });
    }

    async approve(approvalId: string, userId: string, role: string, comment?: string) {
        // Create approval action
        await this.prisma.approvalAction.create({
            data: {
                approvalId,
                approverId: userId,
                approverRole: role as any,
                action: 'APPROVE',
                comment,
            },
        });

        // In new system, MANAGER or SUPER_ADMIN can approve directly
        const canApproveDirectly =
            role === UserRole.MANAGER ||
            role === UserRole.SUPER_ADMIN;

        if (canApproveDirectly) {
            return this.prisma.approval.update({
                where: { id: approvalId },
                data: { status: 'APPROVED' },
            });
        }

        // For other roles, just record the action but don't finalize approval
        return this.findOne(approvalId);
    }

    async reject(approvalId: string, userId: string, role: string, comment?: string) {
        // Create rejection action
        await this.prisma.approvalAction.create({
            data: {
                approvalId,
                approverId: userId,
                approverRole: role as any,
                action: 'REJECT',
                comment,
            },
        });

        // Mark approval as rejected
        return this.prisma.approval.update({
            where: { id: approvalId },
            data: { status: 'REJECTED' },
        });
    }
}

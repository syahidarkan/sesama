import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DonationsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const orderId = `DON-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

        return this.prisma.donation.create({
            data: {
                ...data,
                actionpayOrderId: orderId,
                status: 'PENDING',
            },
        });
    }

    async findByOrderId(orderId: string) {
        return this.prisma.donation.findUnique({
            where: { id: orderId },
            include: {
                program: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        });
    }

    async findAll(programId?: string) {
        return this.prisma.donation.findMany({
            where: programId ? { programId } : {},
            include: {
                program: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: string, data: any) {
        return this.prisma.donation.update({
            where: { id },
            data,
        });
    }

    async getStats(programId?: string) {
        const baseWhere: any = programId ? { programId } : {};

        const [totalResult, successResult, pendingResult] = await Promise.all([
            // All donations
            this.prisma.donation.aggregate({
                where: baseWhere,
                _sum: { amount: true },
                _count: true,
            }),
            // Success donations
            this.prisma.donation.aggregate({
                where: { ...baseWhere, status: 'SUCCESS' },
                _sum: { amount: true },
                _count: true,
            }),
            // Pending donations
            this.prisma.donation.count({
                where: { ...baseWhere, status: 'PENDING' },
            }),
        ]);

        return {
            totalAmount: totalResult._sum.amount || 0,
            totalCount: totalResult._count || 0,
            successAmount: successResult._sum.amount || 0,
            successCount: successResult._count || 0,
            pendingCount: pendingResult || 0,
        };
    }
}

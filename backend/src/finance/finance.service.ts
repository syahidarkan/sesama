import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get overall financial statistics
   */
  async getOverallStatistics() {
    const [totalDonations, successfulDonations, pendingDonations, programStats] =
      await Promise.all([
        // Total amount (all donations)
        this.prisma.donation.aggregate({
          _sum: { amount: true },
          _count: true,
        }),

        // Successful donations
        this.prisma.donation.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
          _count: true,
        }),

        // Pending donations
        this.prisma.donation.aggregate({
          where: { status: 'PENDING' },
          _sum: { amount: true },
          _count: true,
        }),

        // Program statistics
        this.prisma.program.count({
          where: { status: 'ACTIVE' },
        }),
      ]);

    return {
      totalAmount: successfulDonations._sum.amount || 0,
      totalDonations: successfulDonations._count,
      pendingAmount: pendingDonations._sum.amount || 0,
      pendingDonations: pendingDonations._count,
      activePrograms: programStats,
      averageDonation:
        successfulDonations._count > 0
          ? Number(successfulDonations._sum.amount || 0) /
            successfulDonations._count
          : 0,
    };
  }

  /**
   * Get all transactions (mixed from all programs)
   */
  async getAllTransactions(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.DonationWhereInput = {};

    if (filters?.status) {
      where.status = filters.status as any;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset,
      }),
      this.prisma.donation.count({ where }),
    ]);

    return {
      data,
      total,
      limit: filters?.limit || total,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Get transactions by program
   */
  async getTransactionsByProgram(
    programId: string,
    limit?: number,
    offset?: number,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: { programId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.donation.count({ where: { programId } }),
    ]);

    return {
      data,
      total,
      limit: limit || total,
      offset: offset || 0,
    };
  }

  /**
   * Get all programs with their fund details (e-wallet)
   */
  async getProgramsFunds() {
    const programs = await this.prisma.program.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'CLOSED'],
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        targetAmount: true,
        collectedAmount: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        donations: {
          where: { status: 'SUCCESS' },
          select: {
            id: true,
            amount: true,
            donorName: true,
            isAnonymous: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
      orderBy: { collectedAmount: 'desc' },
    });

    return programs.map((program) => ({
      id: program.id,
      title: program.title,
      slug: program.slug,
      status: program.status,
      targetAmount: program.targetAmount,
      collectedAmount: program.collectedAmount,
      creator: program.creator,
      totalDonations: program._count.donations,
      donorCount: new Set(
        program.donations
          .filter((d) => !d.isAnonymous)
          .map((d) => d.donorName),
      ).size,
      recentDonations: program.donations.slice(0, 5),
      percentageReached:
        (Number(program.collectedAmount) / Number(program.targetAmount)) * 100,
    }));
  }

  /**
   * Get single program fund details
   */
  async getProgramFund(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        donations: {
          where: { status: 'SUCCESS' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!program) {
      throw new Error('Program not found');
    }

    // Calculate donor statistics
    const donorMap = new Map<string, number>();
    program.donations.forEach((donation) => {
      const donorKey = donation.isAnonymous
        ? 'anonymous'
        : donation.donorName || donation.user?.name || 'unknown';
      const current = donorMap.get(donorKey) || 0;
      donorMap.set(donorKey, current + Number(donation.amount));
    });

    const donors = Array.from(donorMap.entries()).map(([name, amount]) => ({
      name,
      totalAmount: amount,
      isAnonymous: name === 'anonymous',
    }));

    return {
      program: {
        id: program.id,
        title: program.title,
        slug: program.slug,
        status: program.status,
        targetAmount: program.targetAmount,
        collectedAmount: program.collectedAmount,
        creator: program.creator,
      },
      statistics: {
        totalDonations: program.donations.length,
        totalAmount: Number(program.collectedAmount),
        uniqueDonors: donors.filter((d) => !d.isAnonymous).length,
        averageDonation:
          program.donations.length > 0
            ? Number(program.collectedAmount) / program.donations.length
            : 0,
        percentageReached:
          (Number(program.collectedAmount) / Number(program.targetAmount)) *
          100,
      },
      donors: donors.sort((a, b) => b.totalAmount - a.totalAmount),
      recentTransactions: program.donations.slice(0, 10),
    };
  }

  /**
   * Get donor statistics per program
   */
  async getProgramDonors(programId: string, limit?: number, offset?: number) {
    const donations = await this.prisma.donation.findMany({
      where: {
        programId,
        status: 'SUCCESS',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by donor
    const donorMap = new Map<
      string,
      {
        donorId?: string;
        donorName: string;
        donorEmail?: string;
        totalAmount: number;
        donationCount: number;
        donations: any[];
        isAnonymous: boolean;
      }
    >();

    donations.forEach((donation) => {
      const key = donation.isAnonymous
        ? `anonymous-${donation.id}`
        : donation.userId || donation.donorEmail || donation.donorName;

      if (!donorMap.has(key)) {
        donorMap.set(key, {
          donorId: donation.userId,
          donorName: donation.isAnonymous
            ? 'Anonymous'
            : donation.donorName || donation.user?.name || 'Unknown',
          donorEmail: donation.donorEmail || donation.user?.email,
          totalAmount: 0,
          donationCount: 0,
          donations: [],
          isAnonymous: donation.isAnonymous,
        });
      }

      const donor = donorMap.get(key)!;
      donor.totalAmount += Number(donation.amount);
      donor.donationCount += 1;
      donor.donations.push({
        id: donation.id,
        amount: donation.amount,
        createdAt: donation.createdAt,
        orderId: donation.actionpayOrderId,
      });
    });

    const donors = Array.from(donorMap.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount,
    );

    const paginatedDonors = donors.slice(offset || 0, (offset || 0) + (limit || donors.length));

    return {
      data: paginatedDonors,
      total: donors.length,
      limit: limit || donors.length,
      offset: offset || 0,
    };
  }

  /**
   * Get top donors across all programs
   */
  async getTopDonors(limit: number = 10) {
    const donations = await this.prisma.donation.findMany({
      where: { status: 'SUCCESS', isAnonymous: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group by donor
    const donorMap = new Map<
      string,
      {
        donorId?: string;
        donorName: string;
        donorEmail?: string;
        totalAmount: number;
        donationCount: number;
        programsSupported: Set<string>;
      }
    >();

    donations.forEach((donation) => {
      const key = donation.userId || donation.donorEmail || donation.donorName;

      if (!donorMap.has(key)) {
        donorMap.set(key, {
          donorId: donation.userId,
          donorName: donation.donorName || donation.user?.name || 'Unknown',
          donorEmail: donation.donorEmail || donation.user?.email,
          totalAmount: 0,
          donationCount: 0,
          programsSupported: new Set(),
        });
      }

      const donor = donorMap.get(key)!;
      donor.totalAmount += Number(donation.amount);
      donor.donationCount += 1;
      donor.programsSupported.add(donation.programId);
    });

    const topDonors = Array.from(donorMap.values())
      .map((donor) => ({
        ...donor,
        programsSupported: donor.programsSupported.size,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);

    return topDonors;
  }

  /**
   * Get donation trends
   */
  async getDonationTrends(
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const donations = await this.prisma.donation.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by period
    const trends = new Map<string, { count: number; amount: number }>();

    donations.forEach((donation) => {
      let key: string;
      const date = new Date(donation.createdAt);

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!trends.has(key)) {
        trends.set(key, { count: 0, amount: 0 });
      }

      const trend = trends.get(key)!;
      trend.count += 1;
      trend.amount += Number(donation.amount);
    });

    return Array.from(trends.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        amount: data.amount,
        average: data.count > 0 ? data.amount / data.count : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get leaderboard with pagination
   */
  async getLeaderboard(limit: number = 10, offset: number = 0) {
    const [leaderboard, total] = await Promise.all([
      this.prisma.donorLeaderboard.findMany({
        where: {
          isAnonymous: false, // Only show non-anonymous donors
        },
        orderBy: {
          totalDonations: 'desc',
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          donorName: true,
          totalDonations: true,
          donationCount: true,
          title: true,
          lastDonationAt: true,
        },
      }),
      this.prisma.donorLeaderboard.count({
        where: { isAnonymous: false },
      }),
    ]);

    return {
      data: leaderboard,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get donor rank by identifier
   */
  async getDonorRank(donorIdentifier: string) {
    const donor = await this.prisma.donorLeaderboard.findUnique({
      where: { donorIdentifier },
    });

    if (!donor) {
      return null;
    }

    // Get rank (count how many donors have higher total donations)
    const rank = await this.prisma.donorLeaderboard.count({
      where: {
        totalDonations: {
          gt: donor.totalDonations,
        },
      },
    });

    return {
      rank: rank + 1,
      donorName: donor.donorName,
      totalDonations: donor.totalDonations,
      donationCount: donor.donationCount,
      title: donor.title,
      lastDonationAt: donor.lastDonationAt,
    };
  }

  /**
   * Get title info (for display)
   */
  getTitleInfo() {
    return [
      {
        title: 'PEMULA',
        minAmount: 0,
        maxAmount: 999999,
        color: '#6b7280',
        icon: '🌱',
      },
      {
        title: 'DERMAWAN',
        minAmount: 1000000,
        maxAmount: 9999999,
        color: '#3b82f6',
        icon: '💙',
      },
      {
        title: 'JURAGAN',
        minAmount: 10000000,
        maxAmount: 49999999,
        color: '#8b5cf6',
        icon: '👑',
      },
      {
        title: 'SULTAN',
        minAmount: 50000000,
        maxAmount: 99999999,
        color: '#eab308',
        icon: '⭐',
      },
      {
        title: 'LEGEND',
        minAmount: 100000000,
        maxAmount: null,
        color: '#ef4444',
        icon: '🔥',
      },
    ];
  }

  /**
   * Get leaderboard statistics
   */
  async getStatistics() {
    const stats = await this.prisma.donorLeaderboard.aggregate({
      _sum: {
        totalDonations: true,
        donationCount: true,
      },
      _count: {
        id: true,
      },
    });

    const topDonor = await this.prisma.donorLeaderboard.findFirst({
      where: { isAnonymous: false },
      orderBy: { totalDonations: 'desc' },
    });

    return {
      totalDonors: stats._count.id,
      totalDonations: stats._sum.totalDonations || 0,
      totalTransactions: stats._sum.donationCount || 0,
      topDonor: topDonor
        ? {
            name: topDonor.donorName,
            totalDonations: topDonor.totalDonations,
            title: topDonor.title,
          }
        : null,
    };
  }
}

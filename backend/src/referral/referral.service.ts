import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate or get existing referral code for a user
   */
  async getOrCreateReferralCode(userId: string): Promise<{ code: string }> {
    try {
      // Check for existing code
      const existing = await this.prisma.referralCode.findFirst({
        where: { userId },
      });

      if (existing) {
        return { code: existing.code };
      }

      // Generate unique code with retry logic
      let code: string;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        code = `REF-${randomBytes(4).toString('hex').toUpperCase()}`;

        // Check if code already exists
        const codeExists = await this.prisma.referralCode.findUnique({
          where: { code },
        });

        if (!codeExists) {
          break;
        }

        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique referral code');
      }

      const created = await this.prisma.referralCode.create({
        data: {
          code,
          userId,
        },
      });

      return { code: created.code };
    } catch (error) {
      console.error('Error in getOrCreateReferralCode:', error);
      throw error;
    }
  }

  /**
   * Get referral stats for a user (their referral dashboard)
   */
  async getMyReferralStats(userId: string) {
    const referralCode = await this.prisma.referralCode.findFirst({
      where: { userId },
    });

    if (!referralCode) {
      return {
        code: null,
        totalDonations: 0,
        totalDonors: 0,
        donations: [],
      };
    }

    const donations = await this.prisma.referralDonation.findMany({
      where: { referralCodeId: referralCode.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      code: referralCode.code,
      totalDonations: referralCode.totalDonations,
      totalDonors: referralCode.totalDonors,
      donations,
    };
  }

  /**
   * Get public referral leaderboard
   */
  async getLeaderboard(limit: number = 10, offset: number = 0) {
    const [leaderboard, total] = await Promise.all([
      this.prisma.referralCode.findMany({
        where: { totalDonors: { gt: 0 } },
        orderBy: { totalDonations: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.referralCode.count({
        where: { totalDonors: { gt: 0 } },
      }),
    ]);

    return {
      data: leaderboard.map((r) => ({
        id: r.id,
        code: r.code,
        userName: r.user.name,
        totalDonations: r.totalDonations,
        totalDonors: r.totalDonors,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get referral detail - all donors who donated via a referral code
   */
  async getReferralDetail(code: string, limit: number = 20, offset: number = 0) {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!referralCode) {
      throw new NotFoundException('Referral code tidak ditemukan');
    }

    const [donations, total] = await Promise.all([
      this.prisma.referralDonation.findMany({
        where: { referralCodeId: referralCode.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.referralDonation.count({
        where: { referralCodeId: referralCode.id },
      }),
    ]);

    return {
      referrer: referralCode.user.name,
      code: referralCode.code,
      totalDonations: referralCode.totalDonations,
      totalDonors: referralCode.totalDonors,
      donations: {
        data: donations,
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Track a donation from a referral code.
   * Called from PaymentsService after successful donation.
   */
  async trackReferralDonation(
    referralCodeStr: string,
    donationId: string,
    donorName: string,
    donorEmail: string | null,
    amount: number,
    programId: string,
    programTitle: string,
  ) {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code: referralCodeStr },
    });

    if (!referralCode) return;

    await this.prisma.$transaction([
      this.prisma.referralDonation.create({
        data: {
          referralCodeId: referralCode.id,
          donationId,
          donorName,
          donorEmail,
          amount,
          programId,
          programTitle,
        },
      }),
      this.prisma.referralCode.update({
        where: { id: referralCode.id },
        data: {
          totalDonations: { increment: amount },
          totalDonors: { increment: 1 },
        },
      }),
    ]);
  }
}

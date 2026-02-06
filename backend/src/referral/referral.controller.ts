import { Controller, Get, Post, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /**
   * Generate or get referral code for logged-in user
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateCode(@Request() req) {
    try {
      console.log('🔑 Generating referral code for user:', req.user.id);
      const result = await this.referralService.getOrCreateReferralCode(req.user.id);
      console.log('✅ Referral code generated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error generating referral code:', error);
      throw error;
    }
  }

  /**
   * Get my referral stats + history
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req) {
    return this.referralService.getMyReferralStats(req.user.id);
  }

  /**
   * Public referral leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.referralService.getLeaderboard(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * Get referral detail by code (public)
   */
  @Get('detail/:code')
  async getReferralDetail(
    @Param('code') code: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.referralService.getReferralDetail(
      code,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }
}

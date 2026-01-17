import { Controller, Get, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.gamificationService.getLeaderboard(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('rank')
  async getDonorRank(@Query('identifier') identifier: string) {
    return this.gamificationService.getDonorRank(identifier);
  }

  @Get('titles')
  getTitleInfo() {
    return this.gamificationService.getTitleInfo();
  }

  @Get('statistics')
  async getStatistics() {
    return this.gamificationService.getStatistics();
  }
}

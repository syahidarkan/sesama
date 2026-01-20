import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FINANCE, UserRole.SUPER_ADMIN)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Get overall financial statistics
  @Get('statistics')
  getStatistics() {
    return this.financeService.getOverallStatistics();
  }

  // Get all transactions (mixed from all programs)
  @Get('transactions')
  getAllTransactions(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.financeService.getAllTransactions({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  // Get transactions by program (e-wallet per program)
  @Get('transactions/by-program/:programId')
  getTransactionsByProgram(
    @Query('programId') programId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.financeService.getTransactionsByProgram(
      programId,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
  }

  // Get program fund details (e-wallet)
  @Get('programs/funds')
  getProgramsFunds() {
    return this.financeService.getProgramsFunds();
  }

  // Get single program fund details
  @Get('programs/:programId/fund')
  getProgramFund(@Query('programId') programId: string) {
    return this.financeService.getProgramFund(programId);
  }

  // Get donor statistics per program
  @Get('programs/:programId/donors')
  getProgramDonors(
    @Query('programId') programId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.financeService.getProgramDonors(
      programId,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
  }

  // Get top donors (leaderboard)
  @Get('donors/top')
  getTopDonors(@Query('limit') limit?: string) {
    return this.financeService.getTopDonors(limit ? parseInt(limit) : 10);
  }

  // Get donation trends (daily/weekly/monthly)
  @Get('trends')
  getDonationTrends(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('days') days?: string,
  ) {
    return this.financeService.getDonationTrends(
      period,
      days ? parseInt(days) : 30,
    );
  }
}

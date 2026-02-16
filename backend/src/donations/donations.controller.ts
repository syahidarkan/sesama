import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donations')
export class DonationsController {
    constructor(private donationsService: DonationsService) { }

    @Get()
    findAll(@Query('programId') programId?: string) {
        return this.donationsService.findAll(programId);
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    findMyDonations(@Request() req) {
        // Use req.user.id (from JWT strategy) instead of req.user.userId
        return this.donationsService.findByUserId(req.user.id);
    }

    @Get('stats')
    getStats(@Query('programId') programId?: string) {
        return this.donationsService.getStats(programId);
    }

    @Get(':orderId')
    findByOrderId(@Param('orderId') orderId: string) {
        return this.donationsService.findByOrderId(orderId);
    }
}

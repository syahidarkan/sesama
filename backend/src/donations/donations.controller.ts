import { Controller, Get, Query, Param } from '@nestjs/common';
import { DonationsService } from './donations.service';

@Controller('donations')
export class DonationsController {
    constructor(private donationsService: DonationsService) { }

    @Get()
    findAll(@Query('programId') programId?: string) {
        return this.donationsService.findAll(programId);
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

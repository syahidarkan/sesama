import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { DonationsService } from '../donations/donations.service';
import { ProgramsService } from '../programs/programs.service';

@Controller('payments')
export class PaymentsController {
    constructor(
        private paymentsService: PaymentsService,
        private donationsService: DonationsService,
        private programsService: ProgramsService,
    ) { }

    @Post('create')
    async createPayment(@Body() data: any) {
        try {
            const { programId, donorName, donorEmail, amount, referralCode } = data;

            // Create donation record
            const donation = await this.donationsService.create({
                programId,
                donorName,
                donorEmail,
                amount,
                referralCode: referralCode || null,
            });

            // Create ActionPay deposit transaction
            const transaction = await this.paymentsService.createTransaction(
                donation.actionpayOrderId,
                parseFloat(amount),
                {
                    name: donorName,
                    email: donorEmail || 'donor@example.com',
                },
                programId,
            );

            return {
                donationId: donation.id,
                paymentUrl: transaction.paymentUrl,
                orderId: transaction.orderId,
                trxId: transaction.trxId,
                type: transaction.type,
                address: transaction.address,
                amount: transaction.amount,
                totalAmount: transaction.totalAmount,
                channelName: transaction.channelName,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('routes')
    async getPaymentRoutes(@Query('type') type: 'va' | 'qris' = 'qris') {
        try {
            const routes = await this.paymentsService.getDepositRoutes(type);
            return { data: routes };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('status')
    async getPaymentStatus(@Query('refId') refId: string) {
        try {
            const status = await this.paymentsService.getTransactionStatus(refId);
            return { data: status };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('sandbox-simulate')
    @HttpCode(HttpStatus.OK)
    async sandboxSimulate(@Body() data: { refId: string; amount: number }) {
        const isProduction = process.env.ACTIONPAY_IS_PRODUCTION === 'true';
        if (isProduction) {
            throw new BadRequestException('Sandbox simulate is not available in production mode');
        }

        const result = await this.paymentsService.handleNotification({
            type: 'deposit',
            trxId: `SANDBOX_SIM_${Date.now()}`,
            refId: data.refId,
            status: 'completed',
            amount: data.amount,
            fee: 0,
            notes: 'Sandbox simulation',
        });
        return result;
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() notification: any) {
        try {
            console.log('📨 Webhook received from ActionPay');
            const result = await this.paymentsService.handleNotification(notification);
            return result;
        } catch (error) {
            console.error('❌ Webhook handling error:', error);
            throw new BadRequestException(error.message);
        }
    }
}

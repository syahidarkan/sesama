import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
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

            // Create Midtrans Snap transaction
            const transaction = await this.paymentsService.createTransaction(
                donation.id, // Use donation ID as order ID
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
                snapToken: transaction.snapToken,
                orderId: transaction.orderId,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() notification: any) {
        try {
            console.log('📨 Webhook received from Midtrans');

            // Handle Midtrans notification
            const result = await this.paymentsService.handleNotification(notification);

            return result;
        } catch (error) {
            console.error('❌ Webhook handling error:', error);
            throw new BadRequestException(error.message);
        }
    }

    private mapPaymentMethod(paymentType: string): string {
        const mapping: any = {
            qris: 'QRIS',
            gopay: 'GOPAY',
            shopeepay: 'SHOPEE_PAY',
            bank_transfer: 'BANK_TRANSFER',
            echannel: 'BANK_TRANSFER',
            credit_card: 'CREDIT_CARD',
        };

        return mapping[paymentType] || 'BANK_TRANSFER';
    }
}

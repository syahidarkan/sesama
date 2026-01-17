import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { createHash } from 'crypto';
import { AuditAction, DonationStatus } from '@prisma/client';

// Midtrans Snap SDK
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentsService {
  private snap: any;
  private readonly serverKey: string;
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.serverKey = this.configService.get('MIDTRANS_SERVER_KEY');
    this.isProduction = this.configService.get('MIDTRANS_IS_PRODUCTION') === 'true';

    // Initialize Midtrans Snap
    this.snap = new midtransClient.Snap({
      isProduction: this.isProduction,
      serverKey: this.serverKey,
    });
  }

  /**
   * Create Midtrans Snap payment transaction
   */
  async createTransaction(
    orderId: string,
    amount: number,
    customerDetails: {
      name: string;
      email?: string;
      phone?: string;
    },
    programId: string,
  ) {
    // Validate Midtrans credentials
    if (
      !this.serverKey ||
      this.serverKey.includes('YOUR_SERVER_KEY') ||
      this.serverKey === 'SB-Mid-server-YOUR_SERVER_KEY_HERE'
    ) {
      throw new BadRequestException(
        'Midtrans credentials not configured. Please update .env with valid keys from https://dashboard.sandbox.midtrans.com',
      );
    }

    try {
      // Get program details
      const program = await this.prisma.program.findUnique({
        where: { id: programId },
      });

      if (!program) {
        throw new BadRequestException('Program not found');
      }

      // Midtrans Snap parameter
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: customerDetails.name,
          email: customerDetails.email || 'donor@example.com',
          phone: customerDetails.phone || '08123456789',
        },
        item_details: [
          {
            id: programId,
            price: amount,
            quantity: 1,
            name: program.title,
            category: 'Donation',
          },
        ],
        callbacks: {
          finish: `${this.configService.get('FRONTEND_URL')}/donation/success?order_id=${orderId}`,
          error: `${this.configService.get('FRONTEND_URL')}/donation/failed?order_id=${orderId}`,
          pending: `${this.configService.get('FRONTEND_URL')}/donation/pending?order_id=${orderId}`,
        },
      };

      // Create transaction with Midtrans Snap
      const transaction = await this.snap.createTransaction(parameter);

      console.log('✅ Midtrans Snap transaction created:', {
        orderId,
        token: transaction.token,
        url: transaction.redirect_url,
      });

      return {
        paymentUrl: transaction.redirect_url,
        snapToken: transaction.token,
        orderId: orderId,
      };
    } catch (error) {
      console.error('Midtrans Create Transaction Error:', error);
      throw new BadRequestException(
        `Midtrans Error: ${error.message || 'Failed to create payment'}`,
      );
    }
  }

  /**
   * Verify Midtrans webhook notification signature
   * https://docs.midtrans.com/en/after-payment/http-notification#verifying-notification-authenticity
   */
  verifyNotificationSignature(notification: any): boolean {
    const { order_id, status_code, gross_amount } = notification;
    const serverKey = this.serverKey;

    // Generate signature key using SHA512 (not HMAC)
    // Format: SHA512(order_id + status_code + gross_amount + ServerKey)
    const signatureKey = createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    console.log('🔐 Signature verification:');
    console.log('  Expected:', signatureKey);
    console.log('  Received:', notification.signature_key);
    console.log('  Match:', signatureKey === notification.signature_key);

    return signatureKey === notification.signature_key;
  }

  /**
   * Handle Midtrans webhook notification
   * Docs: https://docs.midtrans.com/en/after-payment/http-notification
   */
  async handleNotification(notification: any) {
    console.log('📩 Midtrans Notification received:', notification);

    // Verify signature
    if (!this.verifyNotificationSignature(notification)) {
      console.error('❌ Invalid Midtrans signature');
      throw new BadRequestException('Invalid signature');
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      gross_amount,
      payment_type,
    } = notification;

    // Find donation by order ID
    const donation = await this.prisma.donation.findFirst({
      where: { id: order_id },
      include: { program: true },
    });

    if (!donation) {
      console.error('❌ Donation not found:', order_id);
      throw new BadRequestException('Donation not found');
    }

    // Check idempotency - prevent duplicate processing
    if (
      donation.status === DonationStatus.SUCCESS &&
      transaction_status === 'settlement'
    ) {
      console.log('⚠️ Already processed:', order_id);
      return { message: 'Already processed' };
    }

    // Map Midtrans transaction_status to our DonationStatus
    let donationStatus: DonationStatus;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        donationStatus = DonationStatus.SUCCESS;
      } else {
        donationStatus = DonationStatus.PENDING;
      }
    } else if (transaction_status === 'settlement') {
      donationStatus = DonationStatus.SUCCESS;
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      donationStatus = DonationStatus.FAILED;
    } else if (transaction_status === 'pending') {
      donationStatus = DonationStatus.PENDING;
    } else {
      donationStatus = DonationStatus.PENDING;
    }

    console.log(`🔄 Updating donation ${order_id} to status: ${donationStatus}`);

    // Update donation in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update donation status
      await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: donationStatus,
          actionpaySignature: notification.signature_key,
          actionpayResponse: notification,
          paidAt: donationStatus === DonationStatus.SUCCESS ? new Date() : null,
        },
      });

      // If success, update program collected amount
      if (donationStatus === DonationStatus.SUCCESS) {
        await tx.program.update({
          where: { id: donation.programId },
          data: {
            collectedAmount: {
              increment: donation.amount,
            },
          },
        });

        console.log(
          `💰 Program ${donation.program.title} collected amount increased by ${donation.amount}`,
        );

        // Update gamification leaderboard
        await this.updateLeaderboard(
          donation.userId || donation.donorEmail,
          donation.donorName,
          Number(donation.amount),
          donation.isAnonymous,
        );

        // Audit log
        await this.auditLogService.log({
          userId: donation.userId,
          action: AuditAction.DONATION_SUCCESS,
          entityType: 'donation',
          entityId: donation.id,
          metadata: {
            programId: donation.programId,
            programTitle: donation.program.title,
            amount: donation.amount,
            paymentType: payment_type,
          },
        });
      }
    });

    console.log('✅ Notification processed successfully:', order_id);
    return { message: 'Notification processed successfully' };
  }

  /**
   * Update donor leaderboard (gamification)
   */
  private async updateLeaderboard(
    donorIdentifier: string,
    donorName: string,
    amount: number,
    isAnonymous: boolean,
  ) {
    if (!donorIdentifier) return;

    const existingEntry = await this.prisma.donorLeaderboard.findUnique({
      where: { donorIdentifier },
    });

    const newTotalDonations = existingEntry
      ? Number(existingEntry.totalDonations) + Number(amount)
      : Number(amount);

    // Calculate title based on total donations
    let title;
    if (newTotalDonations < 1000000) title = 'PEMULA';
    else if (newTotalDonations < 10000000) title = 'DERMAWAN';
    else if (newTotalDonations < 50000000) title = 'JURAGAN';
    else if (newTotalDonations < 100000000) title = 'SULTAN';
    else title = 'LEGEND';

    if (existingEntry) {
      await this.prisma.donorLeaderboard.update({
        where: { donorIdentifier },
        data: {
          totalDonations: { increment: amount },
          donationCount: { increment: 1 },
          title: title as any,
          lastDonationAt: new Date(),
          isAnonymous,
        },
      });
    } else {
      await this.prisma.donorLeaderboard.create({
        data: {
          donorIdentifier,
          donorName,
          totalDonations: amount,
          donationCount: 1,
          title: title as any,
          isAnonymous,
          lastDonationAt: new Date(),
        },
      });
    }

    console.log(`🏆 Leaderboard updated for ${donorName}: ${title}`);
  }

  /**
   * Get transaction status from Midtrans
   */
  async getTransactionStatus(orderId: string) {
    try {
      const status = await this.snap.transaction.status(orderId);
      console.log('📊 Transaction status:', status);
      return status;
    } catch (error) {
      console.error('Midtrans Status Error:', error);
      throw new BadRequestException(
        `Midtrans Status Error: ${error.message || 'Failed to get status'}`,
      );
    }
  }
}

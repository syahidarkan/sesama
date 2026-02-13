import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';
import { ReferralService } from '../referral/referral.service';
import { createHmac } from 'crypto';
import { AuditAction, DonationStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly apiBaseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  // Cached access token
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
    private readonly referralService: ReferralService,
  ) {
    this.clientId = this.configService.get('ACTIONPAY_CLIENT_ID');
    this.clientSecret = this.configService.get('ACTIONPAY_CLIENT_SECRET');
    this.apiKey = this.configService.get('ACTIONPAY_API_KEY');
    this.secretKey = this.configService.get('ACTIONPAY_SECRET_KEY');

    const isProduction = this.configService.get('ACTIONPAY_IS_PRODUCTION') === 'true';
    this.apiBaseUrl = isProduction
      ? 'https://api.actionpay.id'
      : 'https://api-sandbox.actionpay.id';

    console.log(`💳 ActionPay configured: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
  }

  /**
   * Generate JWT Digital Signature for ActionPay
   * HMAC SHA256 of base64url(header) + "." + base64url(payload)
   */
  private generateSignature(payload: any): string {
    const header = { typ: 'JWT', alg: 'HS256' };

    const base64UrlEncode = (obj: any): string => {
      const json = JSON.stringify(obj);
      return Buffer.from(json)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const hmac = createHmac('sha256', this.secretKey);
    hmac.update(signatureInput);
    const signatureHash = hmac.digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `${signatureInput}.${signatureHash}`;
  }

  /**
   * Get access token from ActionPay OAuth2
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.apiBaseUrl}/v1/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({ grant_type: 'client_credentials' }),
    });

    const result = await response.json();

    if (result.status !== '0001' || !result.data) {
      console.error('ActionPay token error:', result);
      throw new BadRequestException('Failed to get ActionPay access token');
    }

    this.accessToken = result.data.accessToken || result.data.access_token || result.data.token;
    // Cache token for 50 minutes (typical JWT expiry is 60 min)
    this.tokenExpiresAt = Date.now() + 50 * 60 * 1000;

    console.log('🔑 ActionPay access token obtained');
    return this.accessToken;
  }

  /**
   * Get available deposit routes (VA/QRIS channels)
   */
  async getDepositRoutes(type: 'va' | 'qris' = 'qris') {
    const token = await this.getAccessToken();
    const signature = this.generateSignature({});

    const response = await fetch(`${this.apiBaseUrl}/v1/api/deposit/route`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accesstoken': `Bearer ${token}`,
        'signature': signature,
        'type': type,
        'platform': 'api',
      },
    });

    const result = await response.json();

    if (result.status !== '0001') {
      console.error('ActionPay deposit routes error:', result);
      throw new BadRequestException('Failed to get payment channels');
    }

    return result.data;
  }

  /**
   * Create ActionPay deposit transaction (VA or QRIS)
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
    // Validate ActionPay credentials
    if (!this.apiKey || !this.secretKey || !this.clientId) {
      throw new BadRequestException(
        'ActionPay credentials not configured. Please update .env with valid keys.',
      );
    }

    // Get program details
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new BadRequestException('Program not found');
    }

    try {
      const token = await this.getAccessToken();

      // Get available routes to find channelId
      const routes = await this.getDepositRoutes('qris');
      if (!routes || routes.length === 0) {
        throw new BadRequestException('No payment channels available');
      }

      // Use first available QRIS channel
      const channel = routes[0];

      // Build deposit payload
      const depositPayload = {
        amount: Math.round(amount),
        bankCode: channel.mId || channel.code,
        remarks: `Donasi ${program.title} - ${customerDetails.name}`,
        type: 'qris',
        addressName: customerDetails.name,
        channelId: channel.chId,
        refId: orderId,
      };

      // Generate signature with the payload
      const signature = this.generateSignature(depositPayload);

      const response = await fetch(`${this.apiBaseUrl}/v1/api/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accesstoken': `Bearer ${token}`,
          'signature': signature,
          'platform': 'api',
        },
        body: JSON.stringify(depositPayload),
      });

      const result = await response.json();

      if (result.status !== '0001' || !result.data) {
        console.error('ActionPay deposit error:', result);
        throw new BadRequestException(
          `ActionPay Error: ${result.message || 'Failed to create payment'}`,
        );
      }

      console.log('✅ ActionPay deposit created:', {
        orderId,
        trxId: result.data.trxId,
        type: result.data.type,
        address: result.data.address,
        amount: result.data.amount,
      });

      // Store ActionPay trxId in donation
      await this.prisma.donation.update({
        where: { actionpayOrderId: orderId },
        data: {
          actionpayResponse: result.data,
        },
      });

      // Build payment info for frontend
      const frontendUrl = this.configService.get('FRONTEND_URL');
      const paymentUrl = `${frontendUrl}/donation/pay?order_id=${orderId}&trx_id=${result.data.trxId}&type=${result.data.type}&address=${encodeURIComponent(result.data.address || '')}&amount=${result.data.totAmount || result.data.amount}&name=${encodeURIComponent(customerDetails.name)}`;

      return {
        paymentUrl,
        orderId,
        trxId: result.data.trxId,
        type: result.data.type,
        address: result.data.address,
        addressName: result.data.addressName,
        amount: result.data.amount,
        totalAmount: result.data.totAmount,
        feeAmount: result.data.feeAmount,
        status: result.data.status,
        channelName: result.data.channelName,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('ActionPay Create Transaction Error:', error);
      throw new BadRequestException(
        `ActionPay Error: ${error.message || 'Failed to create payment'}`,
      );
    }
  }

  /**
   * Handle ActionPay callback notification
   */
  async handleNotification(notification: any) {
    console.log('📩 ActionPay Callback received:', JSON.stringify(notification));

    const {
      type,
      trxId,
      refId,
      status,
      amount,
      fee,
      notes,
    } = notification;

    if (type !== 'deposit') {
      console.log('⚠️ Non-deposit callback, ignoring:', type);
      return { status: '0001', message: 'success', data: null };
    }

    // Find donation by refId (which is our actionpayOrderId)
    const donation = await this.prisma.donation.findFirst({
      where: { actionpayOrderId: refId },
      include: { program: true },
    });

    if (!donation) {
      console.error('❌ Donation not found for refId:', refId);
      throw new BadRequestException('Donation not found');
    }

    // Check idempotency
    if (donation.status === DonationStatus.SUCCESS && status === 'completed') {
      console.log('⚠️ Already processed:', refId);
      return { status: '0001', message: 'success', data: null };
    }

    // Map ActionPay status to DonationStatus
    let donationStatus: DonationStatus;
    if (status === 'completed') {
      donationStatus = DonationStatus.SUCCESS;
    } else if (status === 'failed') {
      donationStatus = DonationStatus.FAILED;
    } else {
      donationStatus = DonationStatus.PENDING;
    }

    console.log(`🔄 Updating donation ${refId} to status: ${donationStatus}`);

    // Update donation in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: donationStatus,
          actionpaySignature: trxId,
          actionpayResponse: notification,
          paidAt: donationStatus === DonationStatus.SUCCESS ? new Date() : null,
        },
      });

      if (donationStatus === DonationStatus.SUCCESS) {
        const donorCount = await tx.donation.count({
          where: {
            programId: donation.programId,
            status: DonationStatus.SUCCESS,
          },
        });

        await tx.program.update({
          where: { id: donation.programId },
          data: {
            collectedAmount: {
              increment: donation.amount,
            },
            donorCount,
          },
        });

        console.log(
          `💰 Program ${donation.program.title} collected +${donation.amount}, donors: ${uniqueDonors.length}`,
        );

        await this.updateLeaderboard(
          donation.userId || donation.donorEmail,
          donation.donorName,
          Number(donation.amount),
          donation.isAnonymous,
        );

        await this.auditLogService.log({
          userId: donation.userId,
          action: AuditAction.DONATION_SUCCESS,
          entityType: 'donation',
          entityId: donation.id,
          metadata: {
            programId: donation.programId,
            programTitle: donation.program.title,
            amount: donation.amount,
            paymentType: 'actionpay',
            trxId,
          },
        });
      }
    });

    // Send receipt email on success
    if (donationStatus === DonationStatus.SUCCESS && donation.donorEmail) {
      this.emailService.sendDonationReceipt({
        donorEmail: donation.donorEmail,
        donorName: donation.donorName,
        amount: Number(donation.amount),
        programTitle: donation.program.title,
        programSlug: donation.program.slug,
        orderId: donation.actionpayOrderId,
        paidAt: new Date(),
      }).catch((err) => {
        console.error('❌ Failed to send donation receipt:', err.message);
      });
    }

    // Track referral
    if (donationStatus === DonationStatus.SUCCESS && donation.referralCode) {
      this.referralService.trackReferralDonation(
        donation.referralCode,
        donation.id,
        donation.donorName,
        donation.donorEmail,
        Number(donation.amount),
        donation.programId,
        donation.program.title,
      ).catch((err) => {
        console.error('❌ Failed to track referral:', err.message);
      });
    }

    console.log('✅ ActionPay callback processed:', refId);
    // Return format expected by ActionPay
    return { status: '0001', message: 'success', data: null };
  }

  /**
   * Check transaction status from ActionPay
   */
  async getTransactionStatus(refId: string) {
    const token = await this.getAccessToken();
    const signature = this.generateSignature({});

    const response = await fetch(`${this.apiBaseUrl}/v1/api/transaction/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accesstoken': `Bearer ${token}`,
        'signature': signature,
        'platform': 'api',
        'refId': refId,
      },
    });

    const result = await response.json();

    if (result.status !== '0001') {
      throw new BadRequestException(
        `ActionPay Status Error: ${result.message || 'Failed to get status'}`,
      );
    }

    return result.data;
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
}

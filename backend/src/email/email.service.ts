import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private transporter: Transporter | null = null;
  private fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    // Priority 1: Gmail SMTP (if SMTP_USER is configured)
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPassword = this.configService.get('SMTP_PASSWORD');

    if (smtpUser && smtpUser !== 'your-email@gmail.com' && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
      this.fromAddress = `SobatBantu Platform <${smtpUser}>`;
      console.log(`📧 Email configured: Gmail SMTP (${smtpUser})`);
    }

    // Priority 2: Resend API (fallback if SMTP fails or not configured)
    const resendApiKey = this.configService.get('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      if (!this.transporter) {
        this.fromAddress = this.configService.get('EMAIL_FROM') || 'SobatBantu Platform <onboarding@resend.dev>';
      }
      console.log('📧 Email fallback: Resend API');
    }

    if (!this.transporter && !this.resend) {
      console.log('📧 WARNING: No email provider configured');
    }
  }

  /**
   * Route emails to the configured SMTP_USER
   * In testing/demo mode, all OTP and admin emails go to one inbox
   */
  private getActualRecipient(email: string): string {
    const smtpUser = this.configService.get('SMTP_USER');
    if (!smtpUser) return email;

    // Route dummy domain emails to SMTP_USER
    if (email.endsWith('@sobatbantu.org') || email.endsWith('@sobatbantu.org') || email.endsWith('@example.com')) {
      return smtpUser;
    }

    // In Resend testing mode (no verified domain), route all emails to SMTP_USER
    // Resend free tier only allows sending to the account owner's email
    if (this.resend && !this.configService.get('RESEND_DOMAIN_VERIFIED')) {
      return smtpUser;
    }

    return email;
  }

  /**
   * Send email - tries Gmail SMTP first, falls back to Resend if SMTP fails
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Try SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
        return true;
      } catch (smtpError) {
        console.error('❌ SMTP failed:', smtpError.message);
        // Fall through to Resend
        if (this.resend) {
          console.log('📧 Falling back to Resend API...');
        }
      }
    }

    // Try Resend as fallback
    if (this.resend) {
      const resendFrom = this.configService.get('EMAIL_FROM') || 'SobatBantu Platform <onboarding@resend.dev>';
      const result = await this.resend.emails.send({
        from: resendFrom,
        to: [to],
        subject,
        html,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
      return true;
    }

    throw new Error('No email provider configured');
  }

  /**
   * Send OTP email
   */
  async sendOTP(to: string, otp: string, userName: string): Promise<boolean> {
    const expiresIn = this.configService.get('OTP_EXPIRES_IN');
    const expiresInMinutes = Math.floor(Number(expiresIn) / 60000);
    const actualRecipient = this.getActualRecipient(to);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0284C7, #0369A1); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #0284C7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #0284C7; letter-spacing: 8px; }
          .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SobatBantu Platform</h1>
          </div>
          <div class="content">
            <h2>Halo, ${userName}!</h2>
            <p>Anda telah meminta kode OTP untuk login ke dashboard admin SobatBantu Platform.</p>

            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Kode OTP Anda:</p>
              <p class="otp-code">${otp}</p>
              <p style="margin: 0; font-size: 14px; color: #666;">Berlaku selama ${expiresInMinutes} menit</p>
            </div>

            <p><strong>Penting:</strong></p>
            <ul>
              <li>Jangan bagikan kode ini kepada siapapun</li>
              <li>Tim SobatBantu tidak akan pernah meminta kode OTP Anda</li>
              <li>Kode ini hanya berlaku untuk ${expiresInMinutes} menit</li>
            </ul>

            <p class="warning">Jika Anda tidak meminta kode ini, abaikan email ini dan segera hubungi administrator.</p>

            <div class="footer">
              <p>Email otomatis dari SobatBantu Platform</p>
              <p>Jangan balas email ini</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(actualRecipient, 'Kode OTP Login - SobatBantu Platform', html);
      console.log(`✅ OTP email sent to ${actualRecipient}${to !== actualRecipient ? ` (routed from ${to})` : ''}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      throw error;
    }
  }

  /**
   * Send verification approval notification (for pengusul)
   */
  async sendVerificationApproval(
    to: string,
    userName: string,
    isApproved: boolean,
    notes?: string,
  ): Promise<void> {
    const subject = isApproved
      ? 'Registrasi Pengusul Disetujui - SobatBantu Platform'
      : 'Registrasi Pengusul Ditolak - SobatBantu Platform';

    const statusColor = isApproved ? '#16a34a' : '#dc2626';
    const statusText = isApproved ? 'DISETUJUI' : 'DITOLAK';
    const message = isApproved
      ? 'Selamat! Registrasi Anda sebagai pengusul telah disetujui. Anda sekarang dapat mengajukan program donasi.'
      : 'Mohon maaf, registrasi Anda sebagai pengusul belum dapat disetujui.';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-box { background: white; border: 2px solid ${statusColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .status { font-size: 24px; font-weight: bold; color: ${statusColor}; }
          .notes { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SobatBantu Platform</h1>
          </div>
          <div class="content">
            <h2>Halo, ${userName}!</h2>

            <div class="status-box">
              <p class="status">${statusText}</p>
            </div>

            <p>${message}</p>

            ${notes ? `<div class="notes"><strong>Catatan dari Manager:</strong><br>${notes}</div>` : ''}

            ${isApproved ? '<p>Silakan login ke dashboard untuk mulai membuat program donasi.</p>' : '<p>Anda dapat melakukan registrasi ulang dengan melengkapi dokumen yang diperlukan.</p>'}

            <div class="footer">
              <p>Email otomatis dari SobatBantu Platform</p>
              <p>Jangan balas email ini</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
    }
  }

  /**
   * Send donation receipt + thank you (doa) email to donor
   */
  async sendDonationReceipt(data: {
    donorEmail: string;
    donorName: string;
    amount: number;
    programTitle: string;
    programSlug: string;
    orderId: string;
    paidAt: Date;
  }): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(data.amount);
    const formattedDate = new Date(data.paidAt).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0284C7, #0369A1); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
          .receipt-box { background: white; border: 2px solid #0284C7; border-radius: 12px; padding: 24px; margin: 20px 0; }
          .amount-highlight { font-size: 28px; font-weight: bold; color: #0284C7; text-align: center; margin: 16px 0; }
          .doa-box { background: linear-gradient(135deg, #E0F2FE, #BAE6FD); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; border: 1px solid #0284C7; }
          .doa-text { font-size: 16px; color: #075985; font-style: italic; line-height: 1.8; }
          .cta-button { display: inline-block; background: #0284C7; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .checkmark { font-size: 48px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="checkmark">&#10003;</div>
            <h1 style="margin:0; font-size:24px;">Donasi Berhasil!</h1>
            <p style="margin:8px 0 0; opacity:0.9;">Jazakallahu Khairan, ${data.donorName}</p>
          </div>
          <div class="content">
            <p>Assalamu'alaikum Wr. Wb.</p>
            <p>Terima kasih atas kebaikan hati Anda. Donasi Anda telah kami terima dan akan segera disalurkan kepada penerima manfaat.</p>

            <div class="receipt-box">
              <h3 style="margin:0 0 16px; color:#0284C7; text-align:center;">BUKTI DONASI</h3>
              <div class="amount-highlight">${formattedAmount}</div>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td style="padding:8px 0; color:#6b7280; font-size:14px;">ID Transaksi</td><td style="padding:8px 0; font-weight:bold; text-align:right; font-size:14px;">${data.orderId}</td></tr>
                <tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0; color:#6b7280; font-size:14px;">Program</td><td style="padding:8px 0; font-weight:bold; text-align:right; font-size:14px;">${data.programTitle}</td></tr>
                <tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0; color:#6b7280; font-size:14px;">Nama Donatur</td><td style="padding:8px 0; font-weight:bold; text-align:right; font-size:14px;">${data.donorName}</td></tr>
                <tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0; color:#6b7280; font-size:14px;">Tanggal</td><td style="padding:8px 0; font-weight:bold; text-align:right; font-size:14px;">${formattedDate}</td></tr>
                <tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0; color:#6b7280; font-size:14px;">Status</td><td style="padding:8px 0; font-weight:bold; text-align:right; font-size:14px; color:#16a34a;">BERHASIL</td></tr>
              </table>
            </div>

            <div class="doa-box">
              <p style="margin:0 0 8px; font-weight:bold; color:#075985; font-size:18px;">Doa Untuk Anda</p>
              <p class="doa-text">
                "Barangsiapa yang meringankan beban seorang mukmin dari beban-beban dunia, niscaya Allah akan meringankan bebannya dari beban-beban di hari kiamat."
              </p>
              <p style="margin:12px 0 0; color:#075985; font-size:13px;">- HR. Muslim</p>
              <br/>
              <p class="doa-text">
                Semoga Allah SWT membalas kebaikan Anda dengan berlipat ganda, memberikan keberkahan pada harta dan keluarga Anda, serta melapangkan rezeki Anda dari segala arah. Aamiin Ya Rabbal Alamin.
              </p>
            </div>

            <div style="text-align:center; margin-top:24px;">
              <p style="color:#6b7280; font-size:14px;">Lihat perkembangan program yang Anda dukung:</p>
              <a href="${frontendUrl}/programs/${data.programSlug}" class="cta-button">
                Lihat Program
              </a>
            </div>

            <div class="footer">
              <p style="margin-top:24px;">Simpan email ini sebagai bukti donasi Anda.</p>
              <p>Email otomatis dari SobatBantu Platform</p>
              <p>Jangan balas email ini</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(data.donorEmail, `Bukti Donasi & Terima Kasih - ${data.programTitle}`, html);
      console.log(`✅ Donation receipt email sent to ${data.donorEmail}`);
    } catch (error) {
      console.error('❌ Failed to send donation receipt email:', error.message);
    }
  }

  /**
   * Send pelaporan/report notification to all donors of a program
   */
  async sendPelaporanNotification(data: {
    donorEmail: string;
    donorName: string;
    programTitle: string;
    programSlug: string;
    pelaporanTitle: string;
    pelaporanSlug: string;
    pelaporanExcerpt?: string;
  }): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0284C7, #0369A1); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
          .report-box { background: white; border: 2px solid #0284C7; border-radius: 12px; padding: 24px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #0284C7; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px; }
          .cta-button-outline { display: inline-block; background: white; color: #0284C7; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px; border: 2px solid #0284C7; }
          .doa-box { background: linear-gradient(135deg, #E0F2FE, #BAE6FD); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; border: 1px solid #0284C7; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size:48px; margin-bottom:12px;">&#128230;</div>
            <h1 style="margin:0; font-size:24px;">Laporan Penyaluran Dana</h1>
            <p style="margin:8px 0 0; opacity:0.9;">${data.programTitle}</p>
          </div>
          <div class="content">
            <p>Assalamu'alaikum Wr. Wb.</p>
            <p>Halo <strong>${data.donorName}</strong>,</p>
            <p>Kami ingin menyampaikan kabar baik! Program <strong>"${data.programTitle}"</strong> yang Anda dukung telah mempublikasikan laporan penyaluran dana.</p>

            <div class="report-box">
              <h3 style="margin:0 0 12px; color:#0284C7;">&#128196; ${data.pelaporanTitle}</h3>
              ${data.pelaporanExcerpt ? `<p style="color:#6b7280; font-size:14px; margin:0 0 16px;">${data.pelaporanExcerpt}</p>` : ''}
              <p style="font-size:14px; color:#374151;">Donasi Anda telah disalurkan dan digunakan sesuai dengan tujuan program. Silakan baca laporan lengkapnya untuk mengetahui detail penyaluran.</p>
            </div>

            <div style="text-align:center; margin:24px 0;">
              <a href="${frontendUrl}/pelaporan/${data.pelaporanSlug}" class="cta-button">
                Baca Laporan Lengkap
              </a>
              <br/>
              <a href="${frontendUrl}/programs/${data.programSlug}" class="cta-button-outline">
                Lihat Program
              </a>
            </div>

            <div class="doa-box">
              <p style="margin:0; font-weight:bold; color:#075985; font-size:16px;">Terima Kasih Atas Kebaikan Anda</p>
              <p style="margin:8px 0 0; color:#075985; font-style:italic;">
                "Sedekah tidak akan mengurangi harta. Tidak ada orang yang memberi maaf kepada orang lain, melainkan Allah akan menambah kemuliaannya."
              </p>
              <p style="margin:8px 0 0; color:#075985; font-size:13px;">- HR. Muslim</p>
            </div>

            <div class="footer">
              <p>Anda menerima email ini karena Anda pernah berdonasi di program ini.</p>
              <p>Email otomatis dari SobatBantu Platform</p>
              <p>Jangan balas email ini</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(data.donorEmail, `Laporan Penyaluran Dana - ${data.programTitle}`, html);
      console.log(`✅ Pelaporan notification sent to ${data.donorEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send pelaporan notification to ${data.donorEmail}:`, error.message);
    }
  }

  /**
   * Send program approval notification
   */
  async sendProgramApproval(
    to: string,
    userName: string,
    programTitle: string,
    isApproved: boolean,
    notes?: string,
  ): Promise<void> {
    const subject = isApproved
      ? 'Program Donasi Disetujui - SobatBantu Platform'
      : 'Program Donasi Ditolak - SobatBantu Platform';

    const statusColor = isApproved ? '#16a34a' : '#dc2626';
    const statusText = isApproved ? 'DISETUJUI' : 'DITOLAK';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-box { background: white; border: 2px solid ${statusColor}; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .status { font-size: 24px; font-weight: bold; color: ${statusColor}; }
          .program-title { font-size: 18px; color: #333; margin: 10px 0; }
          .notes { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SobatBantu Platform</h1>
          </div>
          <div class="content">
            <h2>Halo, ${userName}!</h2>

            <div class="status-box">
              <p class="status">${statusText}</p>
              <p class="program-title">"${programTitle}"</p>
            </div>

            ${notes ? `<div class="notes"><strong>Catatan dari Manager:</strong><br>${notes}</div>` : ''}

            ${isApproved ? '<p>Program Anda sudah aktif dan dapat menerima donasi.</p>' : '<p>Silakan periksa kembali dan lengkapi informasi yang diperlukan.</p>'}

            <div class="footer">
              <p>Email otomatis dari SobatBantu Platform</p>
              <p>Jangan balas email ini</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('Failed to send program approval email:', error.message);
    }
  }
}

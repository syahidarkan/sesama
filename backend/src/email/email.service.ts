import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Send OTP email
   */
  async sendOTP(to: string, otp: string, userName: string): Promise<void> {
    const expiresIn = this.configService.get('OTP_EXPIRES_IN');
    const expiresInMinutes = Math.floor(Number(expiresIn) / 60000);

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject: 'Kode OTP Login - LAZISMU Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 8px; }
            .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LAZISMU Platform</h1>
            </div>
            <div class="content">
              <h2>Halo, ${userName}!</h2>
              <p>Anda telah meminta kode OTP untuk login ke dashboard admin LAZISMU Platform.</p>

              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Kode OTP Anda:</p>
                <p class="otp-code">${otp}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">Berlaku selama ${expiresInMinutes} menit</p>
              </div>

              <p><strong>Penting:</strong></p>
              <ul>
                <li>Jangan bagikan kode ini kepada siapapun</li>
                <li>Tim LAZISMU tidak akan pernah meminta kode OTP Anda</li>
                <li>Kode ini hanya berlaku untuk ${expiresInMinutes} menit</li>
              </ul>

              <p class="warning">⚠️ Jika Anda tidak meminta kode ini, abaikan email ini dan segera hubungi administrator.</p>

              <div class="footer">
                <p>Email otomatis dari LAZISMU Platform</p>
                <p>Jangan balas email ini</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // In development mode with placeholder credentials, log OTP to console
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';
    const smtpUser = this.configService.get('SMTP_USER');
    const isPlaceholder = smtpUser === 'your-email@gmail.com' || !smtpUser;

    if (isDevelopment && isPlaceholder) {
      console.log('\n=============================================');
      console.log('📧 OTP EMAIL (Development Mode)');
      console.log('=============================================');
      console.log(`To: ${to}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires in: ${expiresInMinutes} minutes`);
      console.log('=============================================\n');
      return; // Skip actual email sending in dev mode
    }

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      // In development, log OTP to console as fallback
      if (isDevelopment) {
        console.log('\n⚠️  Email failed, here\'s your OTP: ' + otp + '\n');
      } else {
        throw new Error('Failed to send OTP email');
      }
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
      ? 'Registrasi Pengusul Disetujui - LAZISMU Platform'
      : 'Registrasi Pengusul Ditolak - LAZISMU Platform';

    const statusColor = isApproved ? '#16a34a' : '#dc2626';
    const statusText = isApproved ? 'DISETUJUI' : 'DITOLAK';
    const message = isApproved
      ? 'Selamat! Registrasi Anda sebagai pengusul telah disetujui. Anda sekarang dapat mengajukan program donasi.'
      : 'Mohon maaf, registrasi Anda sebagai pengusul belum dapat disetujui.';

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      html: `
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
              <h1>LAZISMU Platform</h1>
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
                <p>Email otomatis dari LAZISMU Platform</p>
                <p>Jangan balas email ini</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send verification email:', error);
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
      ? 'Program Donasi Disetujui - LAZISMU Platform'
      : 'Program Donasi Ditolak - LAZISMU Platform';

    const statusColor = isApproved ? '#16a34a' : '#dc2626';
    const statusText = isApproved ? 'DISETUJUI' : 'DITOLAK';

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to,
      subject,
      html: `
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
              <h1>LAZISMU Platform</h1>
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
                <p>Email otomatis dari LAZISMU Platform</p>
                <p>Jangan balas email ini</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send program approval email:', error);
    }
  }
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string; phone?: string },
  ) {
    return this.authService.register(body.email, body.password, body.name, body.phone);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Req() req) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.authService.login(
      body.email,
      body.password,
      ipAddress,
      userAgent,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOTP(
    @Body() body: { userId: string; otp: string },
    @Req() req,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.authService.verifyOTP(
      body.userId,
      body.otp,
      ipAddress,
      userAgent,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  async resendOTP(@Body() body: { userId: string }) {
    return this.authService.requestNewOTP(body.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Body() body?: { sessionToken?: string }) {
    return this.authService.logout(req.user.id, body?.sessionToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('re-authenticate')
  @UseGuards(JwtAuthGuard)
  async reAuthenticate(@Req() req, @Body() body: { password: string }) {
    const result = await this.authService.reAuthenticate(
      req.user.id,
      body.password,
    );

    if (result) {
      return { verified: true, message: 'Re-authentication successful' };
    } else {
      return {
        verified: false,
        requiresOTP: true,
        message: 'OTP has been sent to your email',
      };
    }
  }
}

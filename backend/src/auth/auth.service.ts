import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SessionService } from '../session/session.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  private readonly adminRoles = [
    UserRole.MANAGER,
    UserRole.CONTENT_MANAGER,
    UserRole.SUPERVISOR,
    UserRole.FINANCE,
    UserRole.SUPER_ADMIN,
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
    private readonly auditLogService: AuditLogService,
  ) {
    // Configure OTP
    authenticator.options = {
      window: 1, // Allow 1 step before/after current time
    };
  }

  /**
   * Register new user (default role: USER)
   */
  async register(email: string, password: string, name: string, phone?: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash: hashedPassword,
        role: UserRole.USER,
      },
    });

    await this.auditLogService.log({
      userId: user.id,
      userRole: user.role,
      action: AuditAction.CREATE,
      entityType: 'user',
      entityId: user.id,
      metadata: { email },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Login - Step 1: Validate credentials
   * For admin roles: send OTP, for USER/PENGUSUL: return token
   */
  async login(
    email: string,
    password: string,
    portal: string = 'public',
    ipAddress?: string,
    userAgent?: string,
  ) {
    console.log('[LOGIN] Attempt:', { email, portal, hasPassword: !!password });
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('[LOGIN] User found:', user ? { id: user.id, role: user.role, isActive: user.isActive } : 'NOT FOUND');

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('[LOGIN] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Portal-based access control
    const publicRoles = ['USER', 'PENGUSUL'];
    const adminRoles = ['MANAGER', 'CONTENT_MANAGER', 'SUPERVISOR', 'FINANCE'];
    const superAdminRoles = ['SUPER_ADMIN'];

    if (portal === 'public' && !publicRoles.includes(user.role)) {
      throw new UnauthorizedException('Email atau password salah');
    }
    if (portal === 'admin' && !adminRoles.includes(user.role)) {
      throw new UnauthorizedException('Email atau password salah');
    }
    if (portal === 'superadmin' && !superAdminRoles.includes(user.role)) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Check if admin role (requires OTP)
    if (this.adminRoles.includes(user.role as any)) {
      // Generate and send OTP
      const { otp, emailSent } = await this.generateAndSendOTP(user.id, user.email, user.name);

      await this.auditLogService.log({
        userId: user.id,
        userRole: user.role,
        action: AuditAction.OTP_SENT,
        ipAddress,
        userAgent,
      });

      const response: any = {
        requiresOTP: true,
        userId: user.id,
        message: emailSent
          ? 'OTP has been sent to your email'
          : 'Email delivery failed - OTP shown directly',
      };

      // If email failed, include OTP in response so frontend can display it
      if (!emailSent) {
        response.otp = otp;
      }

      return response;
    }

    // For USER/PENGUSUL: direct login
    const sessionToken = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
    );

    const accessToken = this.generateAccessToken(user);

    await this.auditLogService.log({
      userId: user.id,
      userRole: user.role,
      action: AuditAction.LOGIN,
      ipAddress,
      userAgent,
    });

    return {
      requiresOTP: false,
      access_token: accessToken,
      session_token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Login - Step 2: Verify OTP (for admin roles)
   */
  async verifyOTP(
    userId: string,
    otp: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.otpSecret) {
      throw new BadRequestException('No OTP pending for this user');
    }

    // Check OTP expiry (5 minutes)
    const otpExpiresIn = Number(this.configService.get('OTP_EXPIRES_IN', 300000));
    const otpAge = Date.now() - (user.lastOtpAt?.getTime() || 0);

    if (otpAge > otpExpiresIn) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    const isValid = authenticator.verify({
      token: otp,
      secret: user.otpSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear OTP secret after successful verification
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: null,
        lastLoginAt: new Date(),
      },
    });

    // Create session
    const sessionToken = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
    );

    const accessToken = this.generateAccessToken(user);

    await this.auditLogService.log({
      userId: user.id,
      userRole: user.role,
      action: AuditAction.LOGIN,
      metadata: { method: 'otp' },
      ipAddress,
      userAgent,
    });

    return {
      access_token: accessToken,
      session_token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Generate and send OTP to user email
   */
  private async generateAndSendOTP(
    userId: string,
    email: string,
    name: string,
  ): Promise<{ otp: string; emailSent: boolean }> {
    // Generate OTP secret
    const secret = authenticator.generateSecret();
    const otp = authenticator.generate(secret);

    // Save OTP secret to user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: secret,
        lastOtpAt: new Date(),
      },
    });

    // Send OTP via email
    const emailSent = await this.emailService.sendOTP(email, otp, name);

    return { otp, emailSent };
  }

  /**
   * Request new OTP (if expired or lost)
   */
  async requestNewOTP(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!this.adminRoles.includes(user.role as any)) {
      throw new BadRequestException('OTP is only for admin users');
    }

    const { otp, emailSent } = await this.generateAndSendOTP(user.id, user.email, user.name);

    await this.auditLogService.log({
      userId: user.id,
      userRole: user.role,
      action: AuditAction.OTP_SENT,
      metadata: { reason: 'resend' },
    });

    const response: any = {
      message: emailSent
        ? 'New OTP has been sent to your email'
        : 'Email delivery failed - OTP shown directly',
    };

    if (!emailSent) {
      response.otp = otp;
    }

    return response;
  }

  /**
   * Re-authentication for sensitive actions
   */
  async reAuthenticate(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // For admin roles, also send OTP
    if (this.adminRoles.includes(user.role as any)) {
      await this.generateAndSendOTP(user.id, user.email, user.name);
      return false; // Requires OTP verification
    }

    return true; // Password verified
  }

  /**
   * Logout
   */
  async logout(userId: string, sessionToken?: string) {
    if (sessionToken) {
      await this.sessionService.destroySession(sessionToken);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    await this.auditLogService.log({
      userId,
      userRole: user?.role,
      action: AuditAction.LOGOUT,
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Validate user by ID (for JWT strategy)
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        pengusulStatus: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Refresh access token
   */
  async refreshToken(userId: string) {
    const user = await this.validateUser(userId);

    return {
      access_token: this.generateAccessToken(user),
    };
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { DonationsModule } from './donations/donations.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { EmailModule } from './email/email.module';
import { SessionModule } from './session/session.module';
import { PengusulModule } from './pengusul/pengusul.module';
import { ArticlesModule } from './articles/articles.module';
import { GamificationModule } from './gamification/gamification.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { BeritaModule } from './berita/berita.module';
import { StaticPagesModule } from './static-pages/static-pages.module';
import { FormFieldConfigModule } from './form-field-config/form-field-config.module';
import { PelaporanModule } from './pelaporan/pelaporan.module';
import { UploadsModule } from './uploads/uploads.module';
import { RoleUpgradesModule } from './role-upgrades/role-upgrades.module';
import { FinanceModule } from './finance/finance.module';
import { ReferralModule } from './referral/referral.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Rate Limiting (Security) — two tiers
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,  // 1 minute
        limit: 60,   // General: 60 req/min per IP
      },
      {
        name: 'auth',
        ttl: 60000,  // 1 minute
        limit: 5,    // Auth endpoints: 5 req/min per IP (brute-force protection)
      },
    ]),

    // Core Modules
    PrismaModule,
    AuthModule,
    UsersModule,
    RoleUpgradesModule,
    FinanceModule,

    // Feature Modules
    ProgramsModule,
    DonationsModule,
    PaymentsModule,
    ApprovalsModule,
    PengusulModule,
    ArticlesModule,
    PelaporanModule,
    BeritaModule,
    GamificationModule,
    ReferralModule,
    CommentsModule,

    // Utility Modules
    AuditLogModule,
    EmailModule,
    SessionModule,
    SystemSettingsModule,
    StaticPagesModule,
    FormFieldConfigModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard globally to ALL endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

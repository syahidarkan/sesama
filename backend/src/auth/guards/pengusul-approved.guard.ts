import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, PengusulStatus } from '@prisma/client';

/**
 * Guard to ensure pengusul is approved before creating programs
 */
@Injectable()
export class PengusulApprovedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Only check for PENGUSUL role
    if (user.role !== UserRole.PENGUSUL) {
      return true; // Other roles don't need this check
    }

    // Get full user data with verification status
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { pengusulStatus: true },
    });

    if (fullUser.pengusulStatus !== PengusulStatus.APPROVED) {
      throw new ForbiddenException(
        'Your pengusul account is not approved yet. Please wait for manager approval.',
      );
    }

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Guard to ensure only admin roles can access
 * Admin roles: MANAGER, CONTENT_MANAGER, SUPERVISOR, SUPER_ADMIN
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminRoles = [
    UserRole.MANAGER,
    UserRole.CONTENT_MANAGER,
    UserRole.SUPERVISOR,
    UserRole.SUPER_ADMIN,
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!this.adminRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: Admin role required');
    }

    return true;
  }
}

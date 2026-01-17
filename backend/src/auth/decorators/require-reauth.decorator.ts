import { SetMetadata } from '@nestjs/common';

export const REQUIRE_REAUTH_KEY = 'requireReauth';

/**
 * Decorator to mark routes that require re-authentication
 * Used for sensitive actions like approve, publish, delete
 */
export const RequireReauth = () => SetMetadata(REQUIRE_REAUTH_KEY, true);

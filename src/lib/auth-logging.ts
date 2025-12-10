/**
 * Authentication event logging utility
 * Logs sanitized auth events without storing sensitive data (tokens, passwords)
 * 
 * Development: Console logging
 * Production: Can be extended to write to database AuthEvent table
 */

export enum AuthEventType {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  SIGN_OUT = 'SIGN_OUT',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  EMAIL_VERIFICATION_REQUEST = 'EMAIL_VERIFICATION_REQUEST',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  OAUTH_LINKED = 'OAUTH_LINKED',
}

interface AuthEventMeta {
  email?: string;
  userId?: string;
  provider?: string;
  role?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Log an authentication event
 * @param type - Event type from AuthEventType enum
 * @param meta - Event metadata (sanitized, no passwords/tokens)
 */
export function logAuthEvent(
  type: AuthEventType,
  meta: AuthEventMeta = {}
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    ...meta,
  };

  // Development: Console logging
  console.log('[Auth Event]', JSON.stringify(logEntry, null, 2));

  // TODO: Production: Write to database AuthEvent table
  // if (process.env.NODE_ENV === 'production') {
  //   await prisma.authEvent.create({
  //     data: {
  //       type,
  //       userId: meta.userId,
  //       meta: meta as any,
  //       ipAddress: meta.ipAddress,
  //     },
  //   });
  // }
}

/**
 * Extract IP address from request headers
 * @param request - Request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

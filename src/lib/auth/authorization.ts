/**
 * Authorization Utilities
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article VI
 * Purpose: Zero-trust enforcement; server-side RBAC and ownership checks
 * 
 * Rules:
 * - Auth ≠ Authorization (being logged in doesn't grant permissions)
 * - Never trust frontend or middleware alone
 * - All sensitive operations must check role AND ownership
 */

import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface AuthContext {
  userId: string;
  role: UserRole;
  sessionVersion: number;
}

/**
 * Get authenticated user context from server session
 * 
 * @throws Error if not authenticated
 * @returns AuthContext with userId, role, sessionVersion
 */
export async function requireAuth(): Promise<AuthContext> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized: No active session');
  }

  return {
    userId: session.user.id,
    role: session.user.role as UserRole,
    sessionVersion: session.user.sessionVersion || 0,
  };
}

/**
 * Require specific role (RBAC enforcement)
 * 
 * @param requiredRole Role required for this operation
 * @throws Error if user lacks required role
 * @returns AuthContext
 * 
 * @example
 * const auth = await requireRole('ADMIN');
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthContext> {
  const auth = await requireAuth();

  if (auth.role !== requiredRole) {
    throw new Error(`Forbidden: Requires ${requiredRole} role, but user has ${auth.role}`);
  }

  return auth;
}

/**
 * Require one of multiple roles
 * 
 * @param allowedRoles Array of allowed roles
 * @throws Error if user doesn't have any of the allowed roles
 * @returns AuthContext
 * 
 * @example
 * const auth = await requireOneOfRoles(['ADMIN', 'INSTALLER']);
 */
export async function requireOneOfRoles(allowedRoles: UserRole[]): Promise<AuthContext> {
  const auth = await requireAuth();

  if (!allowedRoles.includes(auth.role)) {
    throw new Error(`Forbidden: Requires one of [${allowedRoles.join(', ')}], but user has ${auth.role}`);
  }

  return auth;
}

/**
 * Require resource ownership (context-based access control)
 * 
 * @param userId Current user ID
 * @param resourceOwnerId Resource owner ID
 * @param resourceType Resource type (for error messages)
 * @throws Error if ownership check fails
 * 
 * @example
 * requireOwnership(auth.userId, lead.homeownerId, 'Lead');
 */
export function requireOwnership(userId: string, resourceOwnerId: string, resourceType: string): void {
  if (userId !== resourceOwnerId) {
    throw new Error(`Forbidden: User does not own this ${resourceType}`);
  }
}

/**
 * Check if user has role OR owns resource (flexible access)
 * 
 * @param auth Auth context
 * @param allowedRole Role that can bypass ownership
 * @param resourceOwnerId Resource owner ID
 * @returns true if user has role or owns resource
 * 
 * @example
 * if (!canAccessResource(auth, 'ADMIN', lead.homeownerId)) {
 *   throw new Error('Forbidden');
 * }
 */
export function canAccessResource(
  auth: AuthContext,
  allowedRole: UserRole,
  resourceOwnerId: string
): boolean {
  return auth.role === allowedRole || auth.userId === resourceOwnerId;
}

/**
 * Require role OR ownership (throws if neither)
 * 
 * @param allowedRole Role that bypasses ownership check
 * @param resourceOwnerId Resource owner ID
 * @param resourceType Resource type for error message
 * @throws Error if user lacks role and ownership
 * @returns AuthContext
 * 
 * @example
 * const auth = await requireRoleOrOwnership('ADMIN', lead.homeownerId, 'Lead');
 */
export async function requireRoleOrOwnership(
  allowedRole: UserRole,
  resourceOwnerId: string,
  resourceType: string
): Promise<AuthContext> {
  const auth = await requireAuth();

  if (!canAccessResource(auth, allowedRole, resourceOwnerId)) {
    throw new Error(`Forbidden: User lacks ${allowedRole} role and does not own this ${resourceType}`);
  }

  return auth;
}

/**
 * Admin-only shorthand
 * 
 * @throws Error if not admin
 * @returns AuthContext
 */
export async function requireAdmin(): Promise<AuthContext> {
  return requireRole('ADMIN');
}

/**
 * Installer-only shorthand
 * 
 * @throws Error if not installer
 * @returns AuthContext
 */
export async function requireInstaller(): Promise<AuthContext> {
  return requireRole('INSTALLER');
}

/**
 * Homeowner-only shorthand
 * 
 * @throws Error if not homeowner
 * @returns AuthContext
 */
export async function requireHomeowner(): Promise<AuthContext> {
  return requireRole('HOMEOWNER');
}

/**
 * Deprecated: Clerk helper shims removed.
 *
 * This file remains temporarily to avoid breaking imports during cleanup.
 * Do not use. Migrate to NextAuth helpers (e.g., getServerSession) instead.
 */

import type { UserRole } from '@prisma/client';

export interface ClerkSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    phoneVerified: boolean;
    installerVerified: boolean;
    isActive: boolean;
  };
}

export async function getClerkSession(): Promise<ClerkSession | null> {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[clerk-auth-helpers] Deprecated shim used. Replace with NextAuth session calls.');
  }
  return null;
}

export async function requireAuth(): Promise<never> {
  throw new Error('Clerk helpers removed. Use NextAuth getServerSession/authorize.');
}

export function hasRole(session: ClerkSession | null, role: UserRole): boolean {
  return session?.user?.role === role;
}

export function hasAnyRole(session: ClerkSession | null, roles: UserRole[]): boolean {
  return session?.user ? roles.includes(session.user.role) : false;
}

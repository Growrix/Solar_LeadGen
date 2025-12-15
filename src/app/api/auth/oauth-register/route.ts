import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * OAuth Registration Endpoint (DEPRECATED - Clerk legacy)
 * 
 * This endpoint was used with Clerk OAuth flows.
 * With NextAuth, OAuth is handled by NextAuth.js providers directly.
 * Keep as stub to avoid breaking any stray references during migration.
 */
export async function POST(req: Request) {
  console.warn('[OAuth Register] DEPRECATED: This endpoint is no longer used with NextAuth.');
  
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use NextAuth OAuth providers instead.' },
    { status: 410 } // Gone
  );
}

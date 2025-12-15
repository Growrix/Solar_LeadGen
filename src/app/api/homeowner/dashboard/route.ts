/**
 * GET /api/homeowner/dashboard
 *
 * Returns homeowner dashboard summary including quota and recent leads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getHomeownerLeadSummary } from '@/lib/services/lead-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedHomeownerId = searchParams.get('homeownerId');

    const targetHomeownerId =
      session.user.role === 'ADMIN' && requestedHomeownerId
        ? requestedHomeownerId
        : session.user.id;

    if (session.user.role !== 'HOMEOWNER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only homeowners can access this resource' }, { status: 403 });
    }

    if (session.user.role === 'ADMIN' && !requestedHomeownerId) {
      return NextResponse.json(
        { error: 'homeownerId query parameter required for admin access' },
        { status: 400 },
      );
    }

    const summary = await getHomeownerLeadSummary(targetHomeownerId);

    return NextResponse.json(summary, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('❌ [GET /api/homeowner/dashboard] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load homeowner dashboard summary',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

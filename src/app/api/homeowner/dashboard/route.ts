/**
 * GET /api/homeowner/dashboard
 *
 * Returns homeowner dashboard summary including quota and leads.
 *
 * Query params:
 * - leadLimit=all   -> include all leads
 * - leadLimit=none  -> include 0 leads
 * - leadLimit=<n>   -> include up to n leads
 * - (default)       -> include a small recent subset
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
    const leadLimitParam = searchParams.get('leadLimit');

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


    // Default to returning ALL leads for the homeowner dashboard.
    let leadLimit: number | null | undefined = null;
    if (leadLimitParam) {
      if (leadLimitParam === 'all') {
        leadLimit = null;
      } else if (leadLimitParam === 'none') {
        leadLimit = 0;
      } else {
        const parsed = Number.parseInt(leadLimitParam, 10);
        if (!Number.isFinite(parsed) || parsed < 0) {
          return NextResponse.json(
            { error: 'Invalid leadLimit parameter. Use all, none, or a non-negative integer.' },
            { status: 400 },
          );
        }
        leadLimit = parsed;
      }
    }
    const summary = await getHomeownerLeadSummary(targetHomeownerId, { leadLimit });

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

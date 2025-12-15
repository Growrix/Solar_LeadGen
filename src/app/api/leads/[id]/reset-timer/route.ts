/**
 * POST /api/leads/[id]/reset-timer
 * 
 * Purpose: Reset lead countdown timer (extend expiry)
 * Auth: ADMIN role required
 * 
 * Body:
 * - days: number - Number of days to extend (default 7)
 * 
 * Returns: Updated lead with new expiry date
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resetLeadTimer } from '@/lib/services/lead-service';
import { UserRole } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Check admin role
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json().catch(() => ({}));
    const { days = 7 } = body;

    // 4. Validate days
    if (typeof days !== 'number' || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'days must be a number between 1 and 365' },
        { status: 400 }
      );
    }

    // 5. Reset timer
    const result = await resetLeadTimer(
      params.id,
      days,
      session.user.id
    );

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        lead: result.lead,
        newExpiryDate: result.newExpiryDate,
        daysExtended: result.daysExtended,
        message: `Lead timer reset. Expiry extended by ${days} day(s)`,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/leads/[id]/reset-timer error:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to reset timer' },
      { status: 500 }
    );
  }
}

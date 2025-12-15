/**
 * POST /api/leads/[id]/update-countdown
 * 
 * Purpose: Update lead countdown timer to specific days (absolute, not relative)
 * Difference from reset-timer: This SETS countdown, reset-timer ADDS days
 * Auth: ADMIN role required
 * 
 * Body:
 * - days: number - Number of days from now (1-90)
 * 
 * Returns: Updated lead with new expiry date
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateLeadCountdown } from '@/lib/services/lead-service';
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
    const { days } = body;

    // 4. Validate days
    if (!days) {
      return NextResponse.json(
        { error: 'days parameter is required' },
        { status: 400 }
      );
    }

    if (typeof days !== 'number' || days < 1 || days > 90) {
      return NextResponse.json(
        { error: 'days must be a number between 1 and 90' },
        { status: 400 }
      );
    }

    // 5. Update countdown
    const result = await updateLeadCountdown(
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
        daysSet: result.daysSet,
        message: `Countdown updated to ${days} day${days !== 1 ? 's' : ''}`,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/leads/[id]/update-countdown error:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('only update countdown')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update countdown' },
      { status: 500 }
    );
  }
}

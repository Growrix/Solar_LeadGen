/**
 * PATCH /api/admin/homeowners/[id]/bidding-limit
 *
 * Updates a homeowner's bidding lead submission limit. Admin only.
 * Phase 13S.2: Separate control for bidding lead quota
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateHomeownerBiddingLimit } from '@/lib/services/homeowner-admin-service';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { biddingLimit, notify = true, reason } = await request.json();

    if (!Number.isFinite(biddingLimit) || biddingLimit < 0) {
      return NextResponse.json(
        { error: 'biddingLimit must be a non-negative number' },
        { status: 400 },
      );
    }

    const updatedHomeowner = await updateHomeownerBiddingLimit({
      adminId: session.user.id,
      homeownerId: params.id,
      biddingLimit,
      notify,
      reason,
    });

    return NextResponse.json(
      {
        message: 'Homeowner bidding limit updated',
        homeowner: updatedHomeowner,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('❌ [PATCH /api/admin/homeowners/[id]/bidding-limit] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update homeowner bidding limit',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

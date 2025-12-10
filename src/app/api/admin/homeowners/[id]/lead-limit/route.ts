/**
 * PATCH /api/admin/homeowners/[id]/lead-limit
 *
 * Updates a homeowner's quote submission limit. Admin only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateHomeownerQuoteLimit } from '@/lib/services/homeowner-admin-service';

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
    const { quoteLimit, notify = true, reason } = await request.json();

    if (!Number.isFinite(quoteLimit) || quoteLimit <= 0) {
      return NextResponse.json(
        { error: 'quoteLimit must be a positive number' },
        { status: 400 },
      );
    }

    const updatedHomeowner = await updateHomeownerQuoteLimit({
      adminId: session.user.id,
      homeownerId: params.id,
      quoteLimit,
      notify,
      reason,
    });

    return NextResponse.json(
      {
        message: 'Homeowner quote limit updated',
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
    console.error('❌ [PATCH /api/admin/homeowners/[id]/lead-limit] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update homeowner quote limit',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

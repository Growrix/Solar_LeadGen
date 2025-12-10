/**
 * POST /api/leads/[id]/resell
 * 
 * Purpose: Resell lead - clear installer and optionally return to marketplace
 * Auth: ADMIN role required
 * 
 * Body:
 * - toMarketplace: boolean - If true, set visibility to PUBLIC
 * 
 * Returns: Updated lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resellLead } from '@/lib/services/lead-service';
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
    const body = await request.json();
    const { toMarketplace = false } = body;

    // 4. Resell lead
    const lead = await resellLead(
      params.id,
      toMarketplace,
      session.user.id
    );

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        lead,
        message: toMarketplace 
          ? 'Lead resold and returned to marketplace' 
          : 'Lead resold and set to private',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/leads/[id]/resell error:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('not been purchased')) {
      return NextResponse.json(
        { error: 'Lead has not been purchased yet' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to resell lead' },
      { status: 500 }
    );
  }
}

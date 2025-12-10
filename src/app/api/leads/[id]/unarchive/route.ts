/**
 * POST /api/leads/[id]/unarchive
 * 
 * Purpose: Unarchive lead (restore from soft delete)
 * Auth: ADMIN role required
 * 
 * Returns: Restored lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions} from '@/lib/auth';
import { unarchiveLead } from '@/lib/services/lead-service';
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

    // 3. Unarchive lead
    const lead = await unarchiveLead(
      params.id,
      session.user.id
    );

    // 4. Return success
    return NextResponse.json(
      {
        success: true,
        lead,
        message: 'Lead unarchived successfully',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/leads/[id]/unarchive error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to unarchive lead' },
      { status: 500 }
    );
  }
}

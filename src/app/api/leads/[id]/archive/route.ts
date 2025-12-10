/**
 * POST /api/leads/[id]/archive
 * 
 * Purpose: Archive lead (soft delete)
 * Auth: ADMIN role required
 * 
 * Body:
 * - reason?: string - Optional reason for archiving
 * 
 * Returns: Archived lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { archiveLead } from '@/lib/services/lead-service';
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
    const { reason } = body;

    // 4. Archive lead
    const lead = await archiveLead(
      params.id,
      session.user.id,
      reason
    );

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        lead,
        message: 'Lead archived successfully',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/leads/[id]/archive error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to archive lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads/[id]/assignments/[installerId]
 * 
 * Purpose: Remove specific installer assignment from lead
 * Auth: ADMIN role required
 * 
 * Returns: Success status with remaining assignment count
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { removeLeadAssignment } from '@/lib/services/lead-service';
import { UserRole } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; installerId: string } }
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

    // 3. Remove assignment
    const result = await removeLeadAssignment(
      params.id,
      params.installerId,
      session.user.id
    );

    // 4. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Assignment removed successfully',
        remainingAssignments: result.remainingAssignments,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] DELETE /api/admin/leads/[id]/assignments/[installerId] error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to remove assignment' },
      { status: 500 }
    );
  }
}

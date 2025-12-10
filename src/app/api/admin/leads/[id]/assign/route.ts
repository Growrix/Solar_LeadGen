/**
 * POST /api/admin/leads/[id]/assign
 * 
 * Purpose: Admin assigns lead to specific installer(s)
 * Auth: ADMIN role required
 * 
 * Body:
 * - installerIds: string[] - Array of installer user IDs
 * - mode: 'exclusive' | 'competitive' - Assignment mode
 * - notes?: string - Optional admin notes
 * - notifyInstallers?: boolean - Send notifications (default true)
 * 
 * Returns: LeadAssignment[] - Created assignment records
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assignLeadToInstallers } from '@/lib/services/lead-service';
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
    const { installerIds, mode, notes, notifyInstallers = true } = body;

    // 4. Validate input
    if (!installerIds || !Array.isArray(installerIds) || installerIds.length === 0) {
      return NextResponse.json(
        { error: 'installerIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!mode || !['exclusive', 'competitive'].includes(mode)) {
      return NextResponse.json(
        { error: 'mode must be either"exclusive" or"competitive"' },
        { status: 400 }
      );
    }

    if (mode === 'exclusive' && installerIds.length > 1) {
      return NextResponse.json(
        { error: 'Exclusive mode allows only one installer' },
        { status: 400 }
      );
    }

    // 5. Assign lead
    const assignments = await assignLeadToInstallers({
      leadId: params.id,
      installerIds,
      assignedBy: session.user.id,
      notes,
      mode,
      notifyInstallers,
    });

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        assignments,
        message: `Lead assigned to ${installerIds.length} installer(s) in ${mode} mode`,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] POST /api/admin/leads/[id]/assign error:', error);

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to assign lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads/[id]/assign?installerId=xxx
 * 
 * Purpose: Admin removes installer assignment from lead
 * Auth: ADMIN role required
 * 
 * Query:
 * - installerId: string - Installer user ID to remove
 * 
 * Returns: Success message
 */
export async function DELETE(
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

    // 3. Get installerId from query
    const { searchParams } = new URL(request.url);
    const installerId = searchParams.get('installerId');

    if (!installerId) {
      return NextResponse.json(
        { error: 'installerId query parameter is required' },
        { status: 400 }
      );
    }

    // 4. Remove assignment
    const { removeLeadAssignment } = await import('@/lib/services/lead-service');
    
    await removeLeadAssignment(
      params.id,
      installerId,
      session.user.id
    );

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Assignment removed successfully',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [API] DELETE /api/admin/leads/[id]/assign error:', error);

    if (error.message.includes('not found')) {
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

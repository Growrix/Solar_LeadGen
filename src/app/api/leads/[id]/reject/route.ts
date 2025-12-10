/**
 * Lead Rejection API Route
 * 
 * POST /api/leads/[id]/reject - Admin rejects lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/services/audit-logger';
import { createNotification } from '@/lib/services/notification-service';

/**
 * POST /api/leads/[id]/reject
 * Admin rejects a lead
 * 
 * @access Admin only
 * @param id - Lead ID
 * @body { reason: string }
 * @returns 200 OK + Updated lead
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Validate reason
    if (!body.reason || body.reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        homeowner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Validate status (can't reject already purchased/closed leads)
    const rejectableStatuses = ['DRAFT', 'PENDING_APPROVAL', 'PENDING_PHONE', 'APPROVED'];
    if (!rejectableStatuses.includes(lead.status)) {
      return NextResponse.json(
        { error: `Cannot reject lead with status ${lead.status}` },
        { status: 400 }
      );
    }

    // Update lead with rejection
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: 'REJECTED',
        visibility: 'HIDDEN',
        flaggedReason: body.reason,
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
      },
      include: {
        homeowner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.LEAD_REJECTED,
      entityType: 'lead',
      entityId: id,
      metadata: {
        previousStatus: lead.status,
        newStatus: 'REJECTED',
        reason: body.reason,
      },
    });

    // Notify homeowner
    await createNotification({
      userId: lead.homeowner.id,
      type: 'LEAD_REJECTED',
      title: 'Lead Request Update',
      message: `Your quote request was not approved. Reason: ${body.reason}`,
      actionUrl: `/homeowner/dashboard`,
      metadata: {
        leadId: id,
        entityType: 'lead',
        reason: body.reason,
      },
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });

  } catch (error) {
    console.error('Error rejecting lead:', error);
    return NextResponse.json(
      { error: 'Failed to reject lead' },
      { status: 500 }
    );
  }
}

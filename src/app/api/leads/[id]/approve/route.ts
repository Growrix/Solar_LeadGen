/**
 * Lead Approval API Route
 * 
 * POST /api/leads/[id]/approve - Admin approves lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/services/audit-logger';
import { createNotification } from '@/lib/services/notification-service';
import { transitionLeadStatus } from '@/lib/services/lead-state';
import { getSettingAsNumber } from '@/lib/services/settings-service';
import { 
  validateCountdownDuration, 
  calculateExpiresAt, 
  calculateCountdown 
} from '@/lib/services/countdown-service';

/**
 * POST /api/leads/[id]/approve
 * Admin approves a lead
 * 
 * @access Admin only
 * @param id - Lead ID
 * @body { 
 *   price?: number, 
 *   assignTo?: 'ALL' | string[], 
 *   isHot?: boolean,
 *   enableCountdown?: boolean,
 *   countdownDays?: number 
 * }
 * @returns 200 OK + Updated lead + countdown state
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

    // Validate status transition (DRAFT/PENDING_APPROVAL → APPROVED)
    const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'PENDING_PHONE'];
    if (!validStatuses.includes(lead.status)) {
      return NextResponse.json(
        { error: `Cannot approve lead with status ${lead.status}` },
        { status: 400 }
      );
    }

    // Get default lead price if not provided
    const leadPrice = body.price || lead.leadPrice || await getSettingAsNumber('lead_price_default');

    // Determine visibility based on assignment
    const visibility = body.assignTo === 'ALL' ? 'PUBLIC' : 'PRIVATE';

    // Handle countdown timer configuration
    const enableCountdown = body.enableCountdown !== undefined ? body.enableCountdown : true;
    let expiresAt: Date | null = null;

    if (enableCountdown) {
      // Get countdown days from request or default setting
      const defaultCountdownDays = await getSettingAsNumber('LEAD_COUNTDOWN_DEFAULT_DAYS');
      const countdownDays = body.countdownDays || defaultCountdownDays;

      // Validate countdown duration
      const validation = validateCountdownDuration(countdownDays);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Calculate expiry timestamp
      expiresAt = calculateExpiresAt(countdownDays);
    }

    // Update lead with approval
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: 'APPROVED',
        visibility,
        leadPrice,
        approvedAt: new Date(),
        expiresAt,
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
        ...(body.isHot !== undefined && { 
          adminNotes: body.isHot ? 'HOT LEAD - Priority' : lead.adminNotes 
        }),
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
      action: AUDIT_ACTIONS.LEAD_APPROVED,
      entityType: 'lead',
      entityId: id,
      metadata: {
        previousStatus: lead.status,
        newStatus: 'APPROVED',
        leadPrice,
        visibility,
        isHot: body.isHot || false,
        assignTo: body.assignTo || 'ALL',
        countdownEnabled: enableCountdown,
        countdownDays: enableCountdown ? body.countdownDays || await getSettingAsNumber('LEAD_COUNTDOWN_DEFAULT_DAYS') : null,
        expiresAt: expiresAt?.toISOString() || null,
      },
    });

    // Notify homeowner
    await createNotification({
      userId: lead.homeowner.id,
      type: 'LEAD_APPROVED',
      title: 'Lead Approved!',
      message: 'Your quote request has been approved and is now visible to installers.',
      actionUrl: `/homeowner/leads/${id}`,
      metadata: {
        leadId: id,
        entityType: 'lead',
      },
    });

    // Create LeadAssignment records and notify assigned installers (if specific assignment)
    if (body.assignTo && body.assignTo !== 'ALL' && Array.isArray(body.assignTo)) {
      // Create LeadAssignment records in database
      await prisma.leadAssignment.createMany({
        data: body.assignTo.map((installerId: string) => ({
          leadId: id,
          installerId,
          assignedBy: session.user.id,
          notes: body.assignmentNotes || null,
        })),
        skipDuplicates: true, // Handle re-approval gracefully
      });

      // Send notifications to assigned installers
      for (const installerId of body.assignTo) {
        await createNotification({
          userId: installerId,
          type: 'NEW_LEAD',
          title: 'New Lead Available',
          message: `A new ${body.isHot ? 'HOT ' : ''}lead has been assigned to you.`,
          actionUrl: `/installer/marketplace`,
          metadata: {
            leadId: id,
            entityType: 'lead',
            isHot: body.isHot || false,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      countdown: calculateCountdown(updatedLead.expiresAt),
    });

  } catch (error) {
    console.error('Error approving lead:', error);
    return NextResponse.json(
      { error: 'Failed to approve lead' },
      { status: 500 }
    );
  }
}

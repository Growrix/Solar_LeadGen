/**
 * Bid Winner Selection API
 * 
 * POST /api/bids/[bidId]/select - Homeowner selects winning bid
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/services/notification-service';

/**
 * POST /api/bids/[bidId]/select
 * Homeowner selects a bid as the winner
 * 
 * @access Homeowner only (must own the lead)
 * @body { leadId: string } for validation
 * @returns 200 OK + Selected bid ID
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bidId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Authentication check
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Role authorization
    if (session.user.role !== 'HOMEOWNER') {
      return NextResponse.json(
        { error: 'Only homeowners can select bids' },
        { status: 403 }
      );
    }

    const { bidId } = params;
    const body = await request.json();

    // Fetch bid with lead and installer data
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        lead: true,
        installer: {
          select: { id: true, email: true, companyName: true, name: true }
        }
      }
    });

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    // Validate homeowner owns the lead
    if (bid.lead.homeownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to select this bid' },
        { status: 403 }
      );
    }

    // Validate leadId matches (extra safety check)
    if (body.leadId && body.leadId !== bid.leadId) {
      return NextResponse.json(
        { error: 'Lead ID mismatch' },
        { status: 400 }
      );
    }

    // ✅ T184: Removed countdown validation - homeowners can select winner anytime
    // Countdown is a deadline for installers to submit bids, not for homeowner selection

    // Validate bid status is SUBMITTED (not already selected/rejected)
    if (bid.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'This bid has already been processed' },
        { status: 409 }
      );
    }

    // Check no other bid already selected for this lead
    const existingWinner = await prisma.bid.findFirst({
      where: {
        leadId: bid.leadId,
        status: 'SELECTED'
      }
    });

    if (existingWinner) {
      return NextResponse.json(
        { error: 'A winner has already been selected for this lead' },
        { status: 409 }
      );
    }

    // Use transaction to update bid statuses atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update selected bid to SELECTED
      const selectedBid = await tx.bid.update({
        where: { id: bidId },
        data: {
          status: 'SELECTED',
          selectedAt: new Date()
        }
      });

      // Update all other bids for this lead to REJECTED
      await tx.bid.updateMany({
        where: {
          leadId: bid.leadId,
          id: { not: bidId },
          status: 'SUBMITTED'
        },
        data: {
          status: 'REJECTED'
        }
      });

      // ✅ T195: Lead status remains APPROVED until installer pays
      // Flow: NEW → APPROVED → (winner selected) → APPROVED → (payment) → PURCHASED
      // installerId tracks winner, but status/purchasedAt only set after payment
      await tx.lead.update({
        where: { id: bid.leadId },
        data: {
          installerId: bid.installerId, // Track winning installer
          // status remains 'APPROVED' until payment completed
          // purchasedAt remains null until payment completed
        }
      });

      return selectedBid;
    });

    console.log('[POST /api/bids/[bidId]/select] Bid selected:', {
      bidId: result.id,
      leadId: bid.leadId,
      winnerId: bid.installer.id,
      homeownerId: session.user.id
    });

    // ✅ T185: Implement winner/loser notifications
    // Get all bids for this lead (to notify losers)
    const allBids = await prisma.bid.findMany({
      where: { leadId: bid.leadId },
      include: {
        installer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true
          }
        }
      }
    });

    const leadLocation = `${bid.lead.location}, ${bid.lead.state} ${bid.lead.postcode}`;

    // Send notification to WINNER
    await createNotification({
      userId: bid.installerId,
      type: 'BID_WON',
      title: '🎉 Congratulations! Your bid was selected',
      message: `The homeowner at ${leadLocation} has selected your bid! Proceed to payment to unlock full contact details and begin installation.`,
      actionUrl: `/installer/leads/${bid.leadId}`,
      metadata: {
        bidId: bid.id,
        leadId: bid.leadId,
        leadLocation: leadLocation,
        finalTotal: bid.finalTotal,
        systemSize: (bid.systemData as any)?.capacityKw || 'N/A'
      }
    });

    console.log('[POST /api/bids/[bidId]/select] Winner notification sent:', {
      bidId: bid.id,
      winnerId: bid.installerId,
      winnerEmail: bid.installer.email
    });

    // Send notifications to LOSERS (polite messages)
    const loserBids = allBids.filter(b => b.id !== bidId && b.status === 'REJECTED');

    for (const loserBid of loserBids) {
      await createNotification({
        userId: loserBid.installerId,
        type: 'BID_LOST',
        title: 'Bid Update',
        message: `Thank you for your bid on ${leadLocation}. The homeowner has selected another installer for this project. We appreciate your participation and encourage you to continue bidding on future leads.`,
        actionUrl: `/installer/leads`,
        metadata: {
          bidId: loserBid.id,
          leadId: bid.leadId,
          leadLocation: leadLocation,
          reason: 'Another bid selected'
        }
      });

      console.log('[POST /api/bids/[bidId]/select] Loser notification sent:', {
        bidId: loserBid.id,
        loserId: loserBid.installerId,
        loserEmail: loserBid.installer.email
      });
    }

    console.log('[POST /api/bids/[bidId]/select] Notifications complete:', {
      winnerId: bid.installerId,
      losersNotified: loserBids.length,
      totalBids: allBids.length
    });

    // ✅ T190: Add audit logging for bid selection
    await prisma.auditLog.create({
      data: {
        leadId: bid.leadId,
        userId: session.user.id, // Homeowner who selected winner
        action: 'BID_SELECTED_AS_WINNER',
        entityType: 'Bid',
        entityId: bid.id,
        metadata: {
          bidId: bid.id,
          winnerId: bid.installerId,
          winnerEmail: bid.installer.email,
          winnerCompany: bid.installer.companyName,
          finalTotal: bid.finalTotal,
          leadLocation: leadLocation,
          totalBidsReceived: allBids.length,
          losersNotified: loserBids.length,
          timestamp: new Date().toISOString()
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    console.log('[POST /api/bids/[bidId]/select] Audit log created:', {
      action: 'BID_SELECTED_AS_WINNER',
      leadId: bid.leadId,
      bidId: bid.id,
      homeownerId: session.user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Bid selected successfully',
      selectedBidId: result.id
    });

  } catch (error) {
    console.error('[POST /api/bids/[bidId]/select] Error:', error);
    return NextResponse.json(
      { error: 'Failed to select bid' },
      { status: 500 }
    );
  }
}

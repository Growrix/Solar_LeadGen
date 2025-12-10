/**
 * Bid Purchase API (Dev Mode)
 * 
 * POST /api/bids/[bidId]/purchase - Winner pays to unlock contact details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bids/[bidId]/purchase
 * Winning installer purchases lead to unlock contact details
 * 
 * @access Installer only (must be bid winner)
 * @body {} (dev mode: no payment processing)
 * @returns 200 OK + Full lead details with contact info
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
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
    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json(
        { error: 'Only installers can purchase leads' },
        { status: 403 }
      );
    }

    const { bidId } = params;

    // Fetch bid with lead and homeowner data
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        lead: {
          include: {
            homeowner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        installer: {
          select: { id: true, email: true, companyName: true }
        }
      }
    });

    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    // Validate installer owns this bid
    if (bid.installerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to purchase this bid' },
        { status: 403 }
      );
    }

    // Validate bid status is SELECTED
    if (bid.status !== 'SELECTED') {
      return NextResponse.json(
        { error: 'This bid has not been selected as winner' },
        { status: 403 }
      );
    }

    // TODO: Dev mode - skip payment processing
    // In production, integrate Stripe payment here:
    // - Validate paymentMethodId from request body
    // - Create payment intent with bid.finalTotal
    // - Handle payment success/failure
    console.log('[POST /api/bids/[bidId]/purchase] DEV MODE: Skipping payment processing');

    // Use transaction to update bid and lead atomically
    const result = await prisma.$transaction(async (tx) => {
      // T198: Update bid with payment timestamp
      const purchasedBid = await tx.bid.update({
        where: { id: bidId },
        data: {
          purchasedAt: new Date()
          // status remains 'SELECTED' (winner status)
        }
      });

      // T198: Update lead status to PURCHASED with payment timestamp
      const updatedLead = await tx.lead.update({
        where: { id: bid.leadId },
        data: {
          status: 'PURCHASED', // Now officially purchased with payment
          purchasedAt: new Date(), // Timestamp when payment completed
          // installerId already set when winner selected
        },
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      return { purchasedBid, updatedLead };
    });

    console.log('[POST /api/bids/[bidId]/purchase] Purchase completed:', {
      bidId: result.purchasedBid.id,
      leadId: bid.leadId,
      installerId: session.user.id,
      amount: bid.finalTotal
    });

    // TODO: Trigger notification to homeowner
    // await sendPurchaseCompletedEmail(bid.lead.homeowner.email, bid.installer.companyName);

    // Return full lead details with unmasked contact info
    return NextResponse.json({
      success: true,
      message: 'Contact details unlocked',
      lead: {
        id: result.updatedLead.id,
        homeowner: {
          name: result.updatedLead.homeowner.name,
          phone: result.updatedLead.homeowner.phone,
          email: result.updatedLead.homeowner.email
        },
        address: result.updatedLead.address,
        location: result.updatedLead.location,
        postcode: result.updatedLead.postcode,
        state: result.updatedLead.state,
        propertyType: result.updatedLead.propertyType,
        roofType: result.updatedLead.roofType,
        energyBill: result.updatedLead.energyBill,
        billType: result.updatedLead.billType,
        budgetRange: result.updatedLead.budgetRange,
        desiredOffset: result.updatedLead.desiredOffset,
        batteryRequired: result.updatedLead.batteryRequired,
        batteryCapacity: result.updatedLead.batteryCapacity,
        timeframe: result.updatedLead.timeframe,
        additionalNotes: result.updatedLead.additionalNotes,
        quoteData: result.updatedLead.quoteData,
        purchasedAt: result.updatedLead.purchasedAt?.toISOString()
      }
    });

  } catch (error) {
    console.error('[POST /api/bids/[bidId]/purchase] Error:', error);
    return NextResponse.json(
      { error: 'Failed to purchase lead' },
      { status: 500 }
    );
  }
}

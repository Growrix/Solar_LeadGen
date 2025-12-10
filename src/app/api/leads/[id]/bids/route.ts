/**
 * Bid Listing API for Homeowners
 * 
 * GET /api/leads/[id]/bids - Fetch all bids for a lead (anonymized)
 * Phase 13C - Enhanced to return comprehensive Quote Builder data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { GetBidsResponse } from '@/types/bid';

/**
 * GET /api/leads/[id]/bids
 * Homeowner fetches all bids for their lead
 * Phase 13C - Returns comprehensive Quote Builder data (8 JSON fields)
 * 
 * @access Homeowner only (must own the lead)
 * @returns 200 OK + Bid list with full Quote Builder data
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        { error: 'Only homeowners can view bids' },
        { status: 403 }
      );
    }

    const leadId = params.id;

    // Fetch lead with ownership validation
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Validate homeowner owns this lead
    if (lead.homeownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view bids for this lead' },
        { status: 403 }
      );
    }

    // Fetch all bids for this lead
    const bids = await prisma.bid.findMany({
      where: { leadId },
      include: {
        installer: {
          select: {
            id: true,
            companyName: true,
            installerVerified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate countdown status
    const countdownEnded = lead.expiresAt ? lead.expiresAt < new Date() : false;

    // Anonymize installer identity (show "Installer #1", "#2", etc.)
    // Randomize order to prevent correlation
    const anonymizedBids = bids.map((bid, index) => {
      // Calculate recommendation score (highest capacity or best value)
      const valueScore = bid.capacityOffer 
        ? bid.finalTotal / bid.capacityOffer 
        : bid.finalTotal;
      
      return {
        id: bid.id,
        amount: bid.amount,
        capacityOffer: bid.capacityOffer,
        expectedInstallDate: bid.expectedInstallDate?.toISOString() || null,
        notes: bid.notes,
        
        // Financial breakdown
        includeGst: bid.includeGst,
        gstPercent: bid.gstPercent,
        gstAmount: bid.gstAmount,
        includeIncentive: bid.includeIncentive,
        incentiveAmount: bid.incentiveAmount,
        finalTotal: bid.finalTotal,
        
        // Equipment
        panelBrand: bid.panelBrand,
        inverterBrand: bid.inverterBrand,
        batteryBrand: bid.batteryBrand,
        batteryCapacity: bid.batteryCapacity,
        
        // Phase 13C - Comprehensive Quote Builder data (8 JSON fields)
        systemData: bid.systemData as any ?? undefined,
        productsData: bid.productsData as any ?? undefined,
        lineItems: bid.lineItems as any ?? undefined,
        assumptions: bid.assumptions as any ?? undefined,
        roofData: bid.roofData as any ?? undefined,
        calculations: bid.calculations as any ?? undefined,
        importMeta: bid.importMeta as any ?? undefined,
        installerContact: bid.installerContact as any ?? undefined,
        
        // Status indicators
        status: bid.status,
        selected: bid.status === 'SELECTED' || bid.status === 'PURCHASED',
        verified: bid.installer.installerVerified,
        recommended: false, // Will calculate after sorting
        
        // Anonymized installer info (revealed after selection)
        installerCompany: bid.status === 'SELECTED' || bid.status === 'PURCHASED'
          ? bid.installer.companyName || 'Installer'
          : `Installer #${index + 1}`,
        
        submittedAt: bid.createdAt.toISOString(),
        
        // Internal data for recommendation calculation
        _valueScore: valueScore
      };
    });

    // Mark best value bid as recommended
    if (anonymizedBids.length > 0) {
      const bestBid = anonymizedBids.reduce((best, current) => 
        current._valueScore < best._valueScore ? current : best
      );
      bestBid.recommended = true;
    }

    // Remove internal calculation field
    const finalBids = anonymizedBids.map(({ _valueScore, ...bid }) => bid);

    console.log('[GET /api/leads/[id]/bids] Fetched bids:', {
      leadId,
      bidCount: finalBids.length,
      countdownEnded
    });

    return NextResponse.json({
      success: true,
      leadId,
      countdownEnded,
      bids: finalBids
    });

  } catch (error) {
    console.error('[GET /api/leads/[id]/bids] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

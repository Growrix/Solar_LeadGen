/**
 * Bid Submission API
 * 
 * POST /api/bids - Installer submits bid for a bidding lead
 * Phase 13B - Enhanced to accept comprehensive Quote Builder data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { CreateBidRequest, GetBidsResponse } from '@/types/bid';

/**
 * POST /api/bids
 * Installer submits a bid for a lead
 * Phase 13B - Accepts comprehensive Quote Builder data (8 JSON fields)
 * 
 * @access Installer only
 * @body CreateBidRequest - Legacy fields + comprehensive Quote Builder data
 * @returns 201 Created + Bid ID
 * @errors 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
 */
export async function POST(request: NextRequest) {
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
        { error: 'Only installers can submit bids' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.leadId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, amount' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Bid amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch lead with validation
    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      include: {
        homeowner: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Validate lead is BIDDING type
    if (lead.quoteType !== 'BIDDING') {
      return NextResponse.json(
        { error: 'This lead is not a bidding lead' },
        { status: 403 }
      );
    }

    // Validate countdown not expired
    if (lead.expiresAt && lead.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Bidding countdown has expired' },
        { status: 403 }
      );
    }

    // Check for duplicate bid from same installer
    const existingBid = await prisma.bid.findUnique({
      where: {
        leadId_installerId: {
          leadId: body.leadId,
          installerId: session.user.id
        }
      }
    });

    if (existingBid) {
      return NextResponse.json(
        { error: 'You have already submitted a bid for this lead' },
        { status: 403 }
      );
    }
    // Calculate financial totals
    const includeGst = body.includeGst !== undefined ? body.includeGst : true;
    const gstPercent = body.gstPercent || 10.0;
    const includeIncentive = body.includeIncentive || false;
    const incentiveAmount = body.incentiveAmount || 0;

    const gstAmount = includeGst ? (body.amount * (gstPercent / 100)) : 0;
    const finalTotal = body.amount + gstAmount - incentiveAmount;

    // Create bid record with comprehensive Quote Builder data (Phase 13B)
    const bid = await prisma.bid.create({
      data: {
        leadId: body.leadId,
        installerId: session.user.id,
        
        // Legacy fields (backward compatible)
        amount: body.amount,
        capacityOffer: body.capacityOffer || null,
        expectedInstallDate: body.expectedInstallDate ? new Date(body.expectedInstallDate) : null,
        notes: body.notes || null,
        panelBrand: body.panelBrand || null,
        inverterBrand: body.inverterBrand || null,
        batteryBrand: body.batteryBrand || null,
        batteryCapacity: body.batteryCapacity ? String(body.batteryCapacity) : null,
        includeGst,
        gstPercent,
        gstAmount,
        includeIncentive,
        incentiveAmount,
        finalTotal,
        status: 'SUBMITTED',
        
        // Phase 13B - Comprehensive Quote Builder data (8 JSON fields)
        systemData: body.systemData || null,
        productsData: body.productsData || null,
        lineItems: body.lineItems || null,
        assumptions: body.assumptions || null,
        roofData: body.roofData || null,
        calculations: body.calculations || null,
        importMeta: body.importMeta || null,
        installerContact: body.installerContact || null,
      }
    });

    // TODO: Trigger notification to homeowner
    console.log('[POST /api/bids] Bid submitted:', {
      bidId: bid.id,
      leadId: lead.id,
      installerId: session.user.id,
      amount: bid.amount,
      finalTotal: bid.finalTotal
    });

    // TODO: Send email notification to homeowner
    // await sendBidSubmittedEmail(lead.homeowner.email, lead.location);

    return NextResponse.json(
      {
        success: true,
        bidId: bid.id,
        message: 'Bid submitted successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[POST /api/bids] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit bid' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bids?leadId={leadId}
 * Retrieve all bids for a specific lead (for homeowner comparison)
 * Phase 13C - Returns comprehensive Quote Builder data
 * 
 * @access Authenticated users (homeowner for their leads, admin, installer for their bids)
 * @query leadId - Required lead ID
 * @returns GetBidsResponse - Array of bids with full data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Authentication check
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: leadId' },
        { status: 400 }
      );
    }

    // Fetch lead with authorization check
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { homeownerId: true }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Authorization: homeowner can see bids for their leads, admin can see all
    const isHomeowner = session.user.role === 'HOMEOWNER' && lead.homeownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isHomeowner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to view these bids' },
        { status: 403 }
      );
    }

    // Fetch all bids for the lead with installer details
    // T293: Include businessAddress for PURCHASED leads (winner contact unmasking)
    const bids = await prisma.bid.findMany({
      where: { leadId },
      include: {
        installer: {
          select: {
            id: true,
            email: true,
            phone: true,
            businessAddress: true, // T293: Add for contact unmasking
            installerProfile: {
              select: {
                companyName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response with comprehensive data
    const response: GetBidsResponse = {
      success: true,
      bids: bids.map(bid => ({
        id: bid.id,
        leadId: bid.leadId,
        installerId: bid.installerId,
        installer: {
          companyName: bid.installer.installerProfile?.companyName || 'Unknown Company',
          email: bid.installer.email || '',
          phone: bid.installer.phone || '',
          businessAddress: bid.installer.businessAddress || '' // T293: Include for contact unmasking
        },
        amount: bid.amount,
        finalTotal: bid.finalTotal,
        status: bid.status,
        createdAt: bid.createdAt.toISOString(),
        updatedAt: bid.updatedAt.toISOString(),
        
        // Legacy fields
        capacityOffer: bid.capacityOffer ?? undefined,
        expectedInstallDate: bid.expectedInstallDate?.toISOString(),
        notes: bid.notes ?? undefined,
        panelBrand: bid.panelBrand ?? undefined,
        inverterBrand: bid.inverterBrand ?? undefined,
        batteryBrand: bid.batteryBrand ?? undefined,
        batteryCapacity: bid.batteryCapacity ?? undefined,
        
        // Phase 13 - Comprehensive Quote Builder data
        systemData: bid.systemData as any ?? undefined,
        productsData: bid.productsData as any ?? undefined,
        lineItems: bid.lineItems as any ?? undefined,
        assumptions: bid.assumptions as any ?? undefined,
        roofData: bid.roofData as any ?? undefined,
        calculations: bid.calculations as any ?? undefined,
        importMeta: bid.importMeta as any ?? undefined,
        installerContact: bid.installerContact as any ?? undefined,
      }))
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[GET /api/bids] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

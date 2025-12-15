/**
 * Bid Submission API
 * 
 * POST /api/bids - Installer submits bid for a bidding lead
 * Phase 13B - Enhanced to accept comprehensive Quote Builder data
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 * Uses: requireRole from @/lib/auth/authorization
 * Uses: createLogger from @/lib/logger for structured logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification, createBulkNotifications } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import type { CreateBidRequest, GetBidsResponse } from '@/types/bid';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'BidsRoute' });

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
  const correlationId = request.headers.get('x-correlation-id') || `bid-${Date.now()}`;
  
  try {
    // Constitutional Article VI: Zero-trust authorization
    const auth = await requireRole('INSTALLER');

    const body = await request.json();
    
    logger.info('Bid submission initiated', { 
      leadId: body.leadId, 
      installerId: auth.userId,
      amount: body.amount,
      correlationId 
    });

    // Validate required fields
    if (!body.leadId || !body.amount) {
      logger.warn('Missing required fields', { body, correlationId });
      return NextResponse.json(
        { error: 'Missing required fields: leadId, amount' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      logger.warn('Invalid bid amount', { amount: body.amount, correlationId });
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
      logger.warn('Lead not found', { leadId: body.leadId, correlationId });
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Validate lead is BIDDING type
    if (lead.quoteType !== 'BIDDING') {
      logger.warn('Invalid quote type for bidding', { 
        leadId: body.leadId, 
        quoteType: lead.quoteType,
        correlationId 
      });
      return NextResponse.json(
        { error: 'This lead is not a bidding lead' },
        { status: 403 }
      );
    }

    // Validate countdown not expired
    if (lead.expiresAt && lead.expiresAt < new Date()) {
      logger.warn('Bidding countdown expired', { 
        leadId: body.leadId, 
        expiresAt: lead.expiresAt,
        correlationId 
      });
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
          installerId: auth.userId
        }
      }
    });

    if (existingBid) {
      logger.warn('Duplicate bid attempt', { 
        leadId: body.leadId, 
        installerId: auth.userId,
        existingBidId: existingBid.id,
        correlationId 
      });
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
        installerId: auth.userId,
        
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
    
    logger.info('Bid created successfully', { 
      bidId: bid.id, 
      leadId: body.leadId,
      installerId: auth.userId,
      amount: bid.amount,
      finalTotal: bid.finalTotal,
      correlationId 
    });

    // Phase 13P: Send notifications using new normalized system
    logger.info('Sending bid submission notifications', { 
      bidId: bid.id, 
      leadId: body.leadId,
      correlationId 
    });
    
    // Get admin users for notification
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });
    logger.debug('Admin users found', { count: admins.length });

    // Notification 1: Homeowner gets bid notification
    await createNotification({
      recipientUserId: lead.homeownerId,
      actionType: NotificationType.BID_SUBMITTED,
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.bid.received',
      routeKey: 'homeowner.requests.review',
      routeParams: { leadId: body.leadId, bidId: bid.id }
    });
    logger.debug('Homeowner notification created');

    // Notification 2: Admin gets notification about new bid
    if (admins.length > 0) {
      // Get installer email for admin to see
      const installer = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true }
      });
      
      await createBulkNotifications(
        admins.map(admin => ({
          recipientUserId: admin.id,
          actionType: NotificationType.BID_SUBMITTED,
          role: UserRole.ADMIN,
          messageKey: 'admin.bid.submitted',
          routeKey: 'admin.dashboard',
          routeParams: { leadId: body.leadId, bidId: bid.id, installerId: auth.userId },
          metadata: {
            actorEmail: installer?.email,
            leadId: body.leadId,
            bidId: bid.id
          }
        }))
      );
      logger.debug('Admin notifications created', { count: admins.length });
    }

    logger.info('Bid submission completed successfully', {
      bidId: bid.id,
      leadId: lead.id,
      installerId: auth.userId,
      amount: bid.amount,
      finalTotal: bid.finalTotal,
      homeownerId: lead.homeownerId,
      correlationId
    });

    return NextResponse.json(
      {
        success: true,
        bidId: bid.id,
        message: 'Bid submitted successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    logger.error('Bid submission failed', error, { correlationId });
    
    // Handle authorization errors
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
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
  const correlationId = request.headers.get('x-correlation-id') || `get-bids-${Date.now()}`;
  
  try {
    // Constitutional Article VI: Zero-trust authorization
    const auth = await requireAuth();

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
      logger.warn('Lead not found for bids retrieval', { leadId, correlationId });
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Authorization: homeowner can see bids for their leads, admin can see all
    const isHomeowner = auth.role === 'HOMEOWNER' && lead.homeownerId === auth.userId;
    const isAdmin = auth.role === 'ADMIN';

    if (!isHomeowner && !isAdmin) {
      logger.warn('Unauthorized bid access attempt', { 
        userId: auth.userId, 
        role: auth.role, 
        leadId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to view these bids' },
        { status: 403 }
      );
    }
    
    logger.debug('Fetching bids for lead', { leadId, role: auth.role, correlationId });

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

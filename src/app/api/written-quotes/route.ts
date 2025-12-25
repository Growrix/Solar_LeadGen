/**
 * Written Quote Submission API
 * 
 * POST /api/written-quotes - Installer submits written quote for a lead
 * GET /api/written-quotes?leadId={id} - Retrieve all written quotes for a lead
 * Phase 13W - Enhanced for negotiation flow (counter, revise, agree)
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
import type { CreateWrittenQuoteRequest, GetWrittenQuotesResponse } from '@/types/written-quote';
import { createLogger } from '@/lib/logger';
import { expireNegotiationIfNeeded } from '@/lib/written-quotes/negotiation-window';

const logger = createLogger({ context: 'WrittenQuotesRoute' });

/**
 * POST /api/written-quotes
 * Installer submits a written quote for a lead
 * Phase 13W - Accepts comprehensive Quote Builder data (8 JSON fields) + negotiation status
 * 
 * @access Installer only
 * @body CreateWrittenQuoteRequest - Legacy fields + comprehensive Quote Builder data
 * @returns 201 Created + Written Quote ID
 * @errors 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
 */
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `written-quote-${Date.now()}`;
  
  try {
    // Constitutional Article VI: Zero-trust authorization
    const auth = await requireRole('INSTALLER');

    const body: CreateWrittenQuoteRequest = await request.json();
    
    logger.info('Written quote submission initiated', { 
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
      logger.warn('Invalid quote amount', { amount: body.amount, correlationId });
      return NextResponse.json(
        { error: 'Quote amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch lead with validation
    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      include: {
        // Needed for countdown reset after quote submission
        // (keeps negotiation panel timer unchanged; lead-card uses Lead.expiresAt)
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

    // Check for duplicate written quote from same installer
    const existingQuote = await prisma.writtenQuote.findUnique({
      where: {
        leadId_installerId: {
          leadId: body.leadId,
          installerId: auth.userId
        }
      }
    });

    if (existingQuote) {
      logger.warn('Duplicate written quote attempt', { 
        leadId: body.leadId, 
        installerId: auth.userId,
        existingQuoteId: existingQuote.id,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You have already submitted a written quote for this lead' },
        { status: 403 }
      );
    }

    // Financial totals
    // NOTE: The Quote Builder already calculates totals; we preserve provided values to avoid
    // mismatches between installer view (finalTotal) and homeowner negotiation panel.
    const includeGst = body.includeGst !== undefined ? body.includeGst : true;
    const gstPercent = body.gstPercent || 10.0;
    const includeIncentive = body.includeIncentive || false;
    const incentiveAmount = body.incentiveAmount || 0;
    const gstAmount = body.gstAmount ?? (includeGst ? (body.amount * (gstPercent / 100)) : 0);
    const finalTotal = body.finalTotal ?? (body.amount + gstAmount - incentiveAmount);

    // Phase 13W.4 - Negotiation time window (default 72 hours)
    const negotiationDeadlineAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // Create written quote record with comprehensive Quote Builder data (Phase 13W)
    const writtenQuote = await (prisma.writtenQuote as any).create({
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
        
        // Phase 13W - Negotiation fields (default to PENDING)
        negotiationStatus: 'PENDING',

        // Phase 13W.4 - Negotiation time window + presence
        negotiationDeadlineAt,
        negotiationExpiredAt: null,
        homeownerModalActiveAt: null,
        installerModalActiveAt: null,
        homeownerExtensionUsed: false,
        installerExtensionUsed: false,
        adminExtensionCount: 0,
        adminLastExtendedAt: null,
        adminLastExtendedBy: null,
        
        // Phase 13W - Comprehensive Quote Builder data (8 JSON fields)
        systemData: (body.systemData as any) || undefined,
        productsData: (body.productsData as any) || undefined,
        lineItems: (body.lineItems as any) || undefined,
        assumptions: (body.assumptions as any) || undefined,
        roofData: (body.roofData as any) || undefined,
        calculations: (body.calculations as any) || undefined,
        importMeta: (body.importMeta as any) || undefined,
        installerContact: (body.installerContact as any) || undefined,
      }
    });

    // Lead-card countdown reset: sync to negotiation deadline.
    // Source of truth for negotiation timing remains WrittenQuote.negotiationDeadlineAt.
    // The lead-card timer (Lead.expiresAt) mirrors it so Installer/Homeowner/Admin see identical time.
    try {
      await (prisma.lead as any).update({
        where: { id: body.leadId },
        data: {
          expiresAt: negotiationDeadlineAt,
        },
      });
    } catch (err) {
      logger.warn('Failed to reset lead countdown after written quote submission', {
        leadId: body.leadId,
        correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    
    logger.info('Written quote created successfully', { 
      writtenQuoteId: writtenQuote.id, 
      leadId: body.leadId,
      installerId: auth.userId,
      amount: writtenQuote.amount,
      finalTotal: writtenQuote.finalTotal,
      correlationId 
    });

    // Phase 13W: Send notifications using normalized system
    logger.info('Sending written quote submission notifications', { 
      writtenQuoteId: writtenQuote.id, 
      leadId: body.leadId,
      correlationId 
    });
    
    // Get admin users for notification
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });
    logger.debug('Admin users found', { count: admins.length });

    // Notification 1: Homeowner gets written quote notification
    await createNotification({
      recipientUserId: lead.homeownerId,
      actionType: NotificationType.BID_SUBMITTED, // TODO: Create WRITTEN_QUOTE_SUBMITTED type
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.request.received',
      routeKey: 'homeowner.requests',
      routeParams: { leadId: body.leadId }
    });
    logger.debug('Homeowner notification created');

    // Notification 2: Admin gets notification about new written quote
    if (admins.length > 0) {
      const installer = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true }
      });
      
      await createBulkNotifications(
        admins.map(admin => ({
          recipientUserId: admin.id,
          actionType: NotificationType.BID_SUBMITTED, // TODO: Create WRITTEN_QUOTE_SUBMITTED type
          role: UserRole.ADMIN,
          messageKey: 'admin.bid.submitted',
          routeKey: 'admin.dashboard',
          routeParams: { leadId: body.leadId },
          metadata: {
            actorEmail: installer?.email,
            leadId: body.leadId,
            writtenQuoteId: writtenQuote.id
          }
        }))
      );
      logger.debug('Admin notifications created', { count: admins.length });
    }

    logger.info('Written quote submission completed successfully', {
      writtenQuoteId: writtenQuote.id,
      leadId: lead.id,
      installerId: auth.userId,
      amount: writtenQuote.amount,
      finalTotal: writtenQuote.finalTotal,
      homeownerId: lead.homeownerId,
      correlationId
    });

    return NextResponse.json(
      {
        success: true,
        writtenQuoteId: writtenQuote.id,
        message: 'Written quote submitted successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    logger.error('Written quote submission failed', error, { correlationId });
    
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
      { error: 'Failed to submit written quote' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/written-quotes?leadId={leadId}
 * Retrieve all written quotes for a specific lead (for homeowner comparison & negotiation)
 * Phase 13W - Returns comprehensive Quote Builder data + negotiation status
 * 
 * @access Authenticated users (homeowner for their leads, admin, installer for their quotes)
 * @query leadId - Required lead ID
 * @returns GetWrittenQuotesResponse - Array of written quotes with full data
 */
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `get-written-quotes-${Date.now()}`;
  
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
      logger.warn('Lead not found for written quotes retrieval', { leadId, correlationId });
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Authorization:
    // - homeowner can see all quotes for their own leads
    // - admin can see all
    // - installer can see ONLY their own quote for the lead
    const isHomeowner = auth.role === 'HOMEOWNER' && lead.homeownerId === auth.userId;
    const isAdmin = auth.role === 'ADMIN';
    const isInstaller = auth.role === 'INSTALLER';

    if (!isHomeowner && !isAdmin && !isInstaller) {
      logger.warn('Unauthorized written quote access attempt', { 
        userId: auth.userId, 
        role: auth.role, 
        leadId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to view these written quotes' },
        { status: 403 }
      );
    }
    
    logger.debug('Fetching written quotes for lead', { leadId, role: auth.role, correlationId });

    // Fetch written quotes with installer details.
    // Installers only see their own quote for this lead.
    const writtenQuotes = await prisma.writtenQuote.findMany({
      where: isInstaller ? { leadId, installerId: auth.userId } : { leadId },
      include: {
        installer: {
          select: {
            id: true,
            email: true,
            phone: true,
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

    // Phase 13W.4: Lazy expiry enforcement (no scheduler)
    await Promise.all(writtenQuotes.map((q) => expireNegotiationIfNeeded(q.id)));

    // Re-fetch after potential expiry updates so the response reflects latest state
    const writtenQuotesFresh = await prisma.writtenQuote.findMany({
      where: isInstaller ? { leadId, installerId: auth.userId } : { leadId },
      include: {
        installer: {
          select: {
            id: true,
            email: true,
            phone: true,
            installerProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response with comprehensive data
    const response: GetWrittenQuotesResponse = {
      success: true,
      writtenQuotes: writtenQuotesFresh.map(quote => ({
        id: quote.id,
        leadId: quote.leadId,
        installerId: quote.installerId,
        installer: {
          id: quote.installer.id,
          companyName: quote.installer.installerProfile?.companyName || 'Unknown Company',
          email: quote.installer.email,
          phone: quote.installer.phone || null
        },
        amount: quote.amount,
        finalTotal: quote.finalTotal,
        includeGst: quote.includeGst,
        gstPercent: quote.gstPercent,
        gstAmount: quote.gstAmount,
        includeIncentive: quote.includeIncentive,
        incentiveAmount: quote.incentiveAmount,
        status: quote.status,
        
        // Phase 13W - Negotiation fields
        negotiationStatus: quote.negotiationStatus,
        homeownerCounterAmount: quote.homeownerCounterAmount || null,
        homeownerCounterAt: quote.homeownerCounterAt?.toISOString() || null,
        installerRevisedAmount: quote.installerRevisedAmount || null,
        installerRevisedAt: quote.installerRevisedAt?.toISOString() || null,
        agreedAmount: quote.agreedAmount || null,
        agreedAt: quote.agreedAt?.toISOString() || null,
        agreedBy: quote.agreedBy || null,
        homeownerCounterCount: (quote as any).homeownerCounterCount ?? null,
        installerRevisionCount: (quote as any).installerRevisionCount ?? null,
        negotiationTurnCount: (quote as any).negotiationTurnCount ?? null,

        // Phase 13W.4 - Negotiation time window + presence
        negotiationDeadlineAt: (quote as any).negotiationDeadlineAt?.toISOString?.() || null,
        negotiationExpiredAt: (quote as any).negotiationExpiredAt?.toISOString?.() || null,
        homeownerModalActiveAt: (quote as any).homeownerModalActiveAt?.toISOString?.() || null,
        installerModalActiveAt: (quote as any).installerModalActiveAt?.toISOString?.() || null,
        homeownerExtensionUsed: (quote as any).homeownerExtensionUsed ?? null,
        installerExtensionUsed: (quote as any).installerExtensionUsed ?? null,
        adminExtensionCount: (quote as any).adminExtensionCount ?? null,
        adminLastExtendedAt: (quote as any).adminLastExtendedAt?.toISOString?.() || null,
        adminLastExtendedBy: (quote as any).adminLastExtendedBy ?? null,
        
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
        
        // Legacy fields
        capacityOffer: quote.capacityOffer || null,
        expectedInstallDate: quote.expectedInstallDate?.toISOString() || null,
        notes: quote.notes || null,
        panelBrand: quote.panelBrand || null,
        inverterBrand: quote.inverterBrand || null,
        batteryBrand: quote.batteryBrand || null,
        batteryCapacity: quote.batteryCapacity || null,
        
        selectedAt: quote.selectedAt?.toISOString() || null,
        purchasedAt: quote.purchasedAt?.toISOString() || null,
        rejectedAt: quote.rejectedAt?.toISOString() || null,
        rejectedByRole: (quote as any).rejectedByRole ?? null,
        rejectionReason: quote.rejectionReason || null,
        
        // Phase 13W - Comprehensive Quote Builder data
        systemData: quote.systemData as any || undefined,
        productsData: quote.productsData as any || undefined,
        lineItems: quote.lineItems as any || undefined,
        assumptions: quote.assumptions as any || undefined,
        roofData: quote.roofData as any || undefined,
        calculations: quote.calculations as any || undefined,
        importMeta: quote.importMeta as any || undefined,
        installerContact: quote.installerContact as any || undefined,
      }))
    };

    logger.info('Written quotes retrieved successfully', { 
      leadId, 
      count: writtenQuotes.length,
      correlationId 
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    logger.error('Failed to fetch written quotes', error, { correlationId });
    return NextResponse.json(
      { error: 'Failed to fetch written quotes' },
      { status: 500 }
    );
  }
}

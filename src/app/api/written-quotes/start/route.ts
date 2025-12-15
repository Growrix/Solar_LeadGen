/**
 * Written Quote Start API
 * 
 * POST /api/written-quotes/start - Installer initiates written quote negotiation
 * Phase 4.16.2 - Sprint 2D (T-WQ-209)
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteStart' });

interface StartWrittenQuoteRequest {
  leadId: string;
  initialPrice: number;
  notes?: string;
  // Comprehensive Quote Builder data (mirrors Bid structure)
  systemData?: any;
  productsData?: any;
  lineItems?: any;
  assumptions?: any;
  roofData?: any;
  calculations?: any;
  importMeta?: any;
  installerContact?: any;
}

/**
 * POST /api/written-quotes/start
 * Installer initiates written quote negotiation
 * 
 * @access Installer only
 * @body StartWrittenQuoteRequest
 * @returns 201 Created + WrittenQuote ID
 */
export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `wq-start-${Date.now()}`;
  
  try {
    const auth = await requireRole('INSTALLER');
    const body: StartWrittenQuoteRequest = await request.json();
    
    logger.info('Written quote start initiated', { 
      leadId: body.leadId, 
      installerId: auth.userId,
      initialPrice: body.initialPrice,
      correlationId 
    });

    // Validate required fields
    if (!body.leadId || !body.initialPrice) {
      logger.warn('Missing required fields', { body, correlationId });
      return NextResponse.json(
        { error: 'Missing required fields: leadId, initialPrice' },
        { status: 400 }
      );
    }

    // Validate price is positive
    if (body.initialPrice <= 0) {
      logger.warn('Invalid initial price', { price: body.initialPrice, correlationId });
      return NextResponse.json(
        { error: 'Initial price must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch lead with homeowner
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

    // Verify lead is available for written quote
    if (lead.status === 'CANCELLED' || lead.status === 'ARCHIVED') {
      logger.warn('Lead not available', { leadId: body.leadId, status: lead.status, correlationId });
      return NextResponse.json(
        { error: 'This lead is not available for written quotes' },
        { status: 400 }
      );
    }

    // Check if written quote already exists for this installer-lead pair
    const existingQuote = await prisma.writtenQuote.findUnique({
      where: {
        leadId_installerId: {
          leadId: body.leadId,
          installerId: auth.userId
        }
      }
    });

    if (existingQuote) {
      logger.warn('Written quote already exists', { 
        leadId: body.leadId, 
        installerId: auth.userId,
        existingQuoteId: existingQuote.id,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You already have a written quote for this lead', existingQuoteId: existingQuote.id },
        { status: 409 }
      );
    }

    // Create written quote
    const writtenQuote = await prisma.writtenQuote.create({
      data: {
        leadId: body.leadId,
        installerId: auth.userId,
        homeownerId: lead.homeownerId,
        currentPrice: body.initialPrice,
        currentStatus: 'HOMEOWNER_TURN',
        lastActionBy: 'installer',
        lastActionAt: new Date(),
        systemData: body.systemData || null,
        productsData: body.productsData || null,
        lineItems: body.lineItems || null,
        assumptions: body.assumptions || null,
        roofData: body.roofData || null,
        calculations: body.calculations || null,
        importMeta: body.importMeta || null,
        installerContact: body.installerContact || null
      }
    });

    // Create initial event
    await prisma.writtenQuoteEvent.create({
      data: {
        writtenQuoteId: writtenQuote.id,
        actorId: auth.userId,
        actorRole: 'installer',
        action: 'start',
        priceOffered: body.initialPrice,
        notes: body.notes || 'Initial written quote submitted'
      }
    });

    // Notify homeowner
    await createNotification({
      userId: lead.homeownerId,
      type: NotificationType.LEAD_UPDATE,
      title: 'New Written Quote Received',
      message: `An installer has sent you a written quote for $${body.initialPrice.toLocaleString()}. Review and respond in your dashboard.`,
      actionUrl: `/homeowner/leads/${body.leadId}`,
      actionLabel: 'Review Quote',
      metadata: {
        leadId: body.leadId,
        writtenQuoteId: writtenQuote.id,
        installerId: auth.userId,
        price: body.initialPrice
      }
    });

    logger.info('Written quote created successfully', {
      writtenQuoteId: writtenQuote.id,
      leadId: body.leadId,
      installerId: auth.userId,
      homeownerId: lead.homeownerId,
      initialPrice: body.initialPrice,
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
    logger.error('Failed to create written quote', { error, correlationId });
    return NextResponse.json(
      { error: 'Failed to create written quote' },
      { status: 500 }
    );
  }
}

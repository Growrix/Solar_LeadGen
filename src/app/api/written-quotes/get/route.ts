/**
 * Written Quote Get API
 * 
 * GET /api/written-quotes/get?leadId=X - Fetch written quote with history
 * Phase 4.16.2 - Sprint 2D (T-WQ-213)
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteGet' });

/**
 * GET /api/written-quotes/get?leadId=X
 * Fetch written quote with full event history
 * 
 * @access Authenticated users (installer or homeowner, must be involved in the quote)
 * @query leadId - Lead ID to fetch quote for
 * @returns 200 OK + Quote with events, or 404 if not found
 */
export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || `wq-get-${Date.now()}`;
  
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: leadId' },
        { status: 400 }
      );
    }

    logger.info('Fetching written quote', { 
      leadId,
      userId: auth.userId,
      correlationId 
    });

    // Fetch quote with full relations
    const quote = await prisma.writtenQuote.findFirst({
      where: {
        leadId,
        OR: [
          { installerId: auth.userId },
          { homeownerId: auth.userId }
        ]
      },
      include: {
        events: {
          orderBy: { timestamp: 'asc' },
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                companyName: true,
                role: true
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            name: true,
            location: true,
            propertyType: true,
            status: true
          }
        },
        installer: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        homeowner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!quote) {
      logger.info('No written quote found', { leadId, userId: auth.userId, correlationId });
      return NextResponse.json(
        { quote: null, message: 'No written quote found for this lead' },
        { status: 404 }
      );
    }

    // Transform events for frontend consumption
    const transformedEvents = quote.events.map(event => ({
      id: event.id,
      actorId: event.actorId,
      actorName: event.actor.companyName || event.actor.name || 'Unknown',
      actorRole: event.actorRole,
      action: event.action,
      priceOffered: event.priceOffered,
      notes: event.notes,
      timestamp: event.timestamp.toISOString()
    }));

    logger.info('Written quote fetched successfully', {
      quoteId: quote.id,
      leadId,
      eventsCount: transformedEvents.length,
      correlationId
    });

    return NextResponse.json({
      quote: {
        id: quote.id,
        leadId: quote.leadId,
        installerId: quote.installerId,
        homeownerId: quote.homeownerId,
        currentPrice: quote.currentPrice,
        currentStatus: quote.currentStatus,
        lastActionBy: quote.lastActionBy,
        lastActionAt: quote.lastActionAt?.toISOString(),
        createdAt: quote.createdAt.toISOString(),
        acceptedAt: quote.acceptedAt?.toISOString(),
        rejectedAt: quote.rejectedAt?.toISOString(),
        // Include comprehensive data
        systemData: quote.systemData,
        productsData: quote.productsData,
        lineItems: quote.lineItems,
        assumptions: quote.assumptions,
        roofData: quote.roofData,
        calculations: quote.calculations,
        installerContact: quote.installerContact,
        // Relations
        lead: quote.lead,
        installer: quote.installer,
        homeowner: quote.homeowner,
        events: transformedEvents
      }
    });

  } catch (error) {
    logger.error('Failed to fetch written quote', { error, correlationId });
    return NextResponse.json(
      { error: 'Failed to fetch written quote' },
      { status: 500 }
    );
  }
}

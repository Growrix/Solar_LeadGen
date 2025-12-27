/**
 * Written Quote Rejection API
 * 
 * POST /api/written-quotes/[id]/reject
 * Homeowner rejects the negotiated price
 * 
 * Phase 13W.2 - Purchase & Reject flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';
import { expireNegotiationIfNeeded } from '@/lib/written-quotes/negotiation-window';

const logger = createLogger({ context: 'WrittenQuoteRejectRoute' });

interface RejectRequest {
  // Legacy free-text reason
  reason?: string;
  // Structured reasons (multi-select)
  reasons?: string[];
  // Optional additional details
  otherText?: string;
}

function normalizeReasonPayload(body: RejectRequest): {
  reasons: string[];
  otherText: string;
  legacyReason: string;
  storedReason: string | null;
} {
  const reasons = Array.isArray(body.reasons)
    ? body.reasons
        .filter((r): r is string => typeof r === 'string')
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
    : [];

  const otherText = typeof body.otherText === 'string' ? body.otherText.trim() : '';
  const legacyReason = typeof body.reason === 'string' ? body.reason.trim() : '';

  const storedReason =
    reasons.length > 0 || otherText.length > 0
      ? JSON.stringify({ reasons, otherText: otherText.length > 0 ? otherText : null })
      : legacyReason.length > 0
        ? legacyReason
        : null;

  return { reasons, otherText, legacyReason, storedReason };
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const haystack = message.toLowerCase();
  const needle = columnName.toLowerCase();

  // Postgres (via Prisma) usually emits variants like:
  // - "column \"rejectedByRole\" does not exist"
  // - "The column `rejectedByRole` does not exist in the current database."
  return haystack.includes(needle) && haystack.includes('column') && haystack.includes('does not exist');
}

function isLikelySchemaDriftError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const haystack = message.toLowerCase();

  // Common Postgres/Prisma signatures when DB schema is behind:
  // - column "..." does not exist
  // - relation "..." does not exist
  // - The column `...` does not exist in the current database.
  const doesNotExist = haystack.includes('does not exist');
  const columnOrRelation = haystack.includes('column') || haystack.includes('relation');

  return doesNotExist && columnOrRelation;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `reject-${Date.now()}`;
  const { id } = await context.params;
  
  try {
    const auth = await requireAuth();

    let body: RejectRequest = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const normalized = normalizeReasonPayload(body);

    if (!normalized.storedReason) {
      return NextResponse.json(
        { error: 'Please select at least one reason or provide details.' },
        { status: 400 }
      );
    }
    
    logger.info('Quote rejection initiated', { 
      writtenQuoteId: id,
      userId: auth.userId,
      role: auth.role,
      correlationId 
    });

    // Fetch written quote with lead info
    const writtenQuote = await prisma.writtenQuote.findUnique({
      where: { id },
      include: {
        lead: {
          select: { 
            homeownerId: true,
            location: true,
            postcode: true
          }
        },
        installer: {
          select: { id: true, email: true, companyName: true }
        }
      }
    });

    if (!writtenQuote) {
      logger.warn('Written quote not found', { writtenQuoteId: id, correlationId });
      return NextResponse.json(
        { error: 'Written quote not found' },
        { status: 404 }
      );
    }

    const isHomeowner = writtenQuote.lead.homeownerId === auth.userId;
    const isInstaller = writtenQuote.installerId === auth.userId;

    if (!isHomeowner && !isInstaller) {
      logger.warn('Unauthorized reject attempt', { 
        writtenQuoteId: id,
        userId: auth.userId,
        homeownerId: writtenQuote.lead.homeownerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to reject this quote' },
        { status: 403 }
      );
    }

    const expireResult = await expireNegotiationIfNeeded(id);
    if (expireResult.expired) {
      logger.warn('Cannot reject expired negotiation', { writtenQuoteId: id, correlationId });
      return NextResponse.json(
        { error: 'Negotiation has expired and is now closed.' },
        { status: 403 }
      );
    }

    // Check if already rejected
    if (writtenQuote.negotiationStatus === 'REJECTED') {
      logger.warn('Duplicate reject attempt', { 
        writtenQuoteId: id,
        correlationId 
      });
      return NextResponse.json(
        { error: 'Quote has already been rejected' },
        { status: 403 }
      );
    }

    // Check if already agreed/purchased
    if (writtenQuote.negotiationStatus === 'AGREED' || writtenQuote.purchasedAt) {
      logger.warn('Cannot reject finalized quote', { 
        writtenQuoteId: id,
        status: writtenQuote.negotiationStatus,
        correlationId 
      });
      return NextResponse.json(
        { error: 'Cannot reject a finalized or purchased quote' },
        { status: 403 }
      );
    }

    // Update quote to REJECTED status
    // NOTE: If the DB was restored from an older backup, it may be missing newer columns
    // like `rejectedByRole`. In that case, we fall back to an update that avoids that column.
    try {
      await (prisma.writtenQuote as any).update({
        where: { id },
        data: {
          negotiationStatus: 'REJECTED',
          rejectedAt: new Date(),
          rejectedByRole: isInstaller ? UserRole.INSTALLER : UserRole.HOMEOWNER,
          rejectionReason: normalized.storedReason,
        },
      });
    } catch (updateError) {
      if (!isMissingColumnError(updateError, 'rejectedByRole')) {
        throw updateError;
      }

      logger.warn('DB schema drift detected; retrying rejection without rejectedByRole', {
        writtenQuoteId: id,
        correlationId,
        error: updateError instanceof Error ? updateError.message : String(updateError),
      });

      await prisma.writtenQuote.updateMany({
        where: { id },
        data: {
          negotiationStatus: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: normalized.storedReason,
        },
      });
    }

    logger.info('Quote rejected successfully', { 
      writtenQuoteId: id,
      reasonsCount: normalized.reasons.length,
      hasOtherText: normalized.otherText.length > 0,
      correlationId 
    });

    // Notify the other party about rejection
    try {
      if (isHomeowner) {
        await createNotification({
          recipientUserId: writtenQuote.installerId,
          actionType: NotificationType.QUOTE_REJECTED,
          role: UserRole.INSTALLER,
          messageKey: 'installer.written_quote.rejected',
          routeKey: 'installer.leads',
          routeParams: {
            leadId: writtenQuote.leadId,
          },
          metadata: {
            rejectedBy: 'HOMEOWNER',
            reason: normalized.storedReason,
            reasons: normalized.reasons,
            otherText: normalized.otherText || null,
            location: writtenQuote.lead.location,
            postcode: writtenQuote.lead.postcode,
          },
        });

        logger.debug('Installer rejection notification sent', {
          recipientId: writtenQuote.installerId,
        });
      } else if (isInstaller) {
        await createNotification({
          recipientUserId: writtenQuote.lead.homeownerId,
          actionType: NotificationType.QUOTE_REJECTED,
          role: UserRole.HOMEOWNER,
          messageKey: 'homeowner.written_quote.rejected',
          routeKey: 'homeowner.dashboard.review_written_quote',
          routeParams: {
            leadId: writtenQuote.leadId,
          },
          metadata: {
            rejectedBy: 'INSTALLER',
            reason: normalized.storedReason,
            reasons: normalized.reasons,
            otherText: normalized.otherText || null,
            location: writtenQuote.lead.location,
            postcode: writtenQuote.lead.postcode,
          },
        });

        logger.debug('Homeowner rejection notification sent', {
          recipientId: writtenQuote.lead.homeownerId,
        });
      }
    } catch (notifyError) {
      // Rejection must succeed even if notifications fail.
      logger.warn('Rejection notification failed', {
        writtenQuoteId: id,
        correlationId,
        error: notifyError instanceof Error ? notifyError.message : String(notifyError),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Quote rejected successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Quote rejection failed', {
      correlationId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    if (isLikelySchemaDriftError(error)) {
      return NextResponse.json(
        {
          error:
            'Database schema is out of date (pending migrations). Apply migrations and retry.',
          correlationId,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: 'Failed to reject quote', correlationId }, { status: 500 });
  }
}

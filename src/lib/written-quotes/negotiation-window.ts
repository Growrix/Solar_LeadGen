import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

// Prisma client types may lag behind migrations in this repo.
// Use a narrow escape hatch for fields added via SQL migrations.
const prismaAny = prisma as any;

const logger = createLogger({ context: 'NegotiationWindow' });

const HOURS_72_MS = 72 * 60 * 60 * 1000;
const HOURS_48_MS = 48 * 60 * 60 * 1000;

const CLOSED_NEGOTIATION_STATUSES = new Set<string>([
  'AGREED',
  'REJECTED',
  'PENDING_ACCEPTANCE',
  'NEGOTIATION_EXPIRED',
]);

export function computeDefaultNegotiationDeadline(createdAt: Date): Date {
  return new Date(createdAt.getTime() + HOURS_72_MS);
}

export function isNegotiationClosed(input: {
  negotiationStatus?: string | null;
  purchasedAt?: Date | null;
  negotiationExpiredAt?: Date | null;
}): boolean {
  if (input.purchasedAt) return true;
  if (input.negotiationExpiredAt) return true;
  const status = String(input.negotiationStatus || '');
  return CLOSED_NEGOTIATION_STATUSES.has(status);
}

export function isBothPartiesOnline(input: {
  homeownerModalActiveAt?: Date | null;
  installerModalActiveAt?: Date | null;
  now?: Date;
  thresholdMs?: number;
}): boolean {
  const now = input.now ?? new Date();
  const thresholdMs = input.thresholdMs ?? 15_000;
  const homeownerAt = input.homeownerModalActiveAt?.getTime() ?? 0;
  const installerAt = input.installerModalActiveAt?.getTime() ?? 0;
  if (!homeownerAt || !installerAt) return false;
  return now.getTime() - homeownerAt <= thresholdMs && now.getTime() - installerAt <= thresholdMs;
}

function isMissingColumnError(error: unknown, columnNames: string[]): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const haystack = message.toLowerCase();
  if (!haystack.includes('column') || !haystack.includes('does not exist')) return false;
  return columnNames.some((name) => haystack.includes(name.toLowerCase()));
}

async function ensureDeadlineIfMissing(writtenQuoteId: string, createdAt: Date): Promise<Date> {
  const fallback = computeDefaultNegotiationDeadline(createdAt);
  await prismaAny.writtenQuote.updateMany({
    where: { id: writtenQuoteId, negotiationDeadlineAt: null },
    data: { negotiationDeadlineAt: fallback },
  });
  return fallback;
}

export async function expireNegotiationIfNeeded(writtenQuoteId: string): Promise<{ expired: boolean }>{
  try {
    const now = new Date();

    const writtenQuote = await prisma.writtenQuote.findUnique({
      where: { id: writtenQuoteId },
      select: {
        id: true,
        leadId: true,
        installerId: true,
        createdAt: true,
        purchasedAt: true,
        negotiationStatus: true,
        negotiationDeadlineAt: true as any,
        negotiationExpiredAt: true as any,
        lead: { select: { homeownerId: true } },
      } as any,
    });

    const anyQ = writtenQuote as any;

    if (!writtenQuote) return { expired: false };

    if (isNegotiationClosed({
      negotiationStatus: writtenQuote.negotiationStatus,
      purchasedAt: writtenQuote.purchasedAt,
      negotiationExpiredAt: (writtenQuote as any).negotiationExpiredAt ?? null,
    })) {
      return { expired: writtenQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || !!(writtenQuote as any).negotiationExpiredAt };
    }

    const deadline =
      (writtenQuote as any).negotiationDeadlineAt instanceof Date
        ? ((writtenQuote as any).negotiationDeadlineAt as Date)
        : await ensureDeadlineIfMissing(writtenQuoteId, writtenQuote.createdAt);

    if (now.getTime() <= deadline.getTime()) {
      return { expired: false };
    }

    // Atomic-ish: only one request should flip expiredAt from null -> now
    const updated = await prismaAny.writtenQuote.updateMany({
      where: {
        id: writtenQuoteId,
        negotiationExpiredAt: null,
        purchasedAt: null,
        negotiationStatus: { notIn: ['AGREED', 'REJECTED', 'PENDING_ACCEPTANCE', 'NEGOTIATION_EXPIRED'] },
        negotiationDeadlineAt: { lte: now },
      },
      data: {
        negotiationExpiredAt: now,
        negotiationStatus: 'NEGOTIATION_EXPIRED',
      },
    });

    if (updated.count === 0) {
      // Someone else expired it first, or it got closed.
      return { expired: true };
    }

    // Update lead status
    await prismaAny.lead.update({
      where: { id: writtenQuote.leadId },
      data: { status: 'NEGOTIATION_EXPIRED' },
    });

    // Notify both parties via SYSTEM (email-enabled)
    await Promise.all([
      createNotification({
        recipientUserId: anyQ.lead?.homeownerId,
        actionType: NotificationType.SYSTEM,
        role: UserRole.HOMEOWNER,
        messageKey: 'homeowner.written_quote.negotiation_expired',
        routeKey: 'homeowner.dashboard.review_written_quote',
        routeParams: { leadId: writtenQuote.leadId },
        metadata: { writtenQuoteId },
      }),
      createNotification({
        recipientUserId: writtenQuote.installerId,
        actionType: NotificationType.SYSTEM,
        role: UserRole.INSTALLER,
        messageKey: 'installer.written_quote.negotiation_expired',
        routeKey: 'installer.leads',
        routeParams: { leadId: writtenQuote.leadId },
        metadata: { writtenQuoteId },
      }),
    ]);

    return { expired: true };
  } catch (error) {
    // If DB was restored from an older backup, these newer negotiation columns may be absent.
    // In that case, do not block primary actions (reject/accept/purchase) on an expiry check.
    if (isMissingColumnError(error, ['negotiationDeadlineAt', 'negotiationExpiredAt'])) {
      logger.warn('Schema drift detected; skipping negotiation expiry check', {
        writtenQuoteId,
        error: error instanceof Error ? error.message : String(error),
      });
      return { expired: false };
    }
    throw error;
  }
}

/**
 * Lead-card countdown endpoint behavior.
 *
 * When the lead-card countdown (Lead.expiresAt) reaches 0 for a WRITTEN_QUOTE lead,
 * the negotiation is closed automatically:
 * - Lead.status -> NEGOTIATION_EXPIRED
 * - Any open written quotes for the lead -> NEGOTIATION_EXPIRED
 * - Notifications are sent to homeowner + affected installers
 *
 * This does NOT change the negotiation panel countdown source-of-truth
 * (WrittenQuote.negotiationDeadlineAt); it only enforces closure.
 */
export async function expireLeadNegotiationsByCountdownIfNeeded(
  leadId: string,
): Promise<{ expired: boolean; expiredWrittenQuoteIds: string[] }> {
  const now = new Date();

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      quoteType: true,
      expiresAt: true,
      status: true,
      homeownerId: true,
    },
  });

  if (!lead) return { expired: false, expiredWrittenQuoteIds: [] };
  if (lead.quoteType !== 'WRITTEN_QUOTE') return { expired: false, expiredWrittenQuoteIds: [] };

  const expiresAtMs = lead.expiresAt instanceof Date ? lead.expiresAt.getTime() : null;
  if (!expiresAtMs) return { expired: false, expiredWrittenQuoteIds: [] };
  if (expiresAtMs > now.getTime()) return { expired: false, expiredWrittenQuoteIds: [] };

  // Find open negotiations for this lead.
  const openQuotes: Array<{ id: string; installerId: string }> = await prismaAny.writtenQuote.findMany({
    where: {
      leadId,
      negotiationExpiredAt: null,
      purchasedAt: null,
      negotiationStatus: { notIn: ['AGREED', 'REJECTED', 'PENDING_ACCEPTANCE', 'NEGOTIATION_EXPIRED'] },
    },
    select: {
      id: true,
      installerId: true,
    },
  });

  const openQuoteIds = openQuotes.map((q: { id: string; installerId: string }) => q.id);

  const quoteUpdate = openQuoteIds.length
    ? await prismaAny.writtenQuote.updateMany({
        where: {
          id: { in: openQuoteIds },
          negotiationExpiredAt: null,
          purchasedAt: null,
          negotiationStatus: { notIn: ['AGREED', 'REJECTED', 'PENDING_ACCEPTANCE', 'NEGOTIATION_EXPIRED'] },
        },
        data: {
          negotiationExpiredAt: now,
          negotiationStatus: 'NEGOTIATION_EXPIRED',
        },
      })
    : { count: 0 };

  const leadUpdate = await prismaAny.lead.updateMany({
    where: {
      id: leadId,
      status: { not: 'NEGOTIATION_EXPIRED' },
    },
    data: {
      status: 'NEGOTIATION_EXPIRED',
    },
  });

  const didExpire = quoteUpdate.count > 0 || leadUpdate.count > 0;
  if (!didExpire) return { expired: false, expiredWrittenQuoteIds: [] };

  // Notify homeowner once.
  await createNotification({
    recipientUserId: lead.homeownerId,
    actionType: NotificationType.SYSTEM,
    role: UserRole.HOMEOWNER,
    messageKey: 'homeowner.written_quote.negotiation_expired',
    routeKey: 'homeowner.dashboard.review_written_quote',
    routeParams: { leadId },
    metadata: { leadId, reason: 'lead_countdown_expired', writtenQuoteIds: openQuoteIds },
  });

  // Notify each affected installer.
  await Promise.all(
    openQuotes.map((q: { id: string; installerId: string }) =>
      createNotification({
        recipientUserId: q.installerId,
        actionType: NotificationType.SYSTEM,
        role: UserRole.INSTALLER,
        messageKey: 'installer.written_quote.negotiation_expired',
        routeKey: 'installer.leads',
        routeParams: { leadId },
        metadata: { writtenQuoteId: q.id, leadId, reason: 'lead_countdown_expired' },
      }),
    ),
  );

  return { expired: true, expiredWrittenQuoteIds: openQuoteIds };
}

export async function heartbeatPresence(input: {
  writtenQuoteId: string;
  userId: string;
  role: 'HOMEOWNER' | 'INSTALLER';
}): Promise<{ ok: boolean }>{
  const now = new Date();

  const writtenQuote = await prisma.writtenQuote.findUnique({
    where: { id: input.writtenQuoteId },
    include: { lead: { select: { homeownerId: true } } },
  });

  if (!writtenQuote) return { ok: false };

  if (input.role === 'HOMEOWNER') {
    if (writtenQuote.lead.homeownerId !== input.userId) return { ok: false };
    await prismaAny.writtenQuote.update({
      where: { id: input.writtenQuoteId },
      data: { homeownerModalActiveAt: now },
    });
    return { ok: true };
  }

  if (writtenQuote.installerId !== input.userId) return { ok: false };
  await prismaAny.writtenQuote.update({
    where: { id: input.writtenQuoteId },
    data: { installerModalActiveAt: now },
  });
  return { ok: true };
}

export async function extendNegotiationByParty(input: {
  writtenQuoteId: string;
  userId: string;
  role: 'HOMEOWNER' | 'INSTALLER';
}): Promise<{ ok: boolean; error?: string }>{
  const now = new Date();

  const writtenQuote = await prisma.writtenQuote.findUnique({
    where: { id: input.writtenQuoteId },
    include: { lead: { select: { homeownerId: true } } },
  });

  if (!writtenQuote) return { ok: false, error: 'Written quote not found' };

  await expireNegotiationIfNeeded(input.writtenQuoteId);

  const fresh = await prisma.writtenQuote.findUnique({
    where: { id: input.writtenQuoteId },
  });
  if (!fresh) return { ok: false, error: 'Written quote not found' };

  if (isNegotiationClosed({
    negotiationStatus: fresh.negotiationStatus,
    purchasedAt: fresh.purchasedAt,
    negotiationExpiredAt: (fresh as any).negotiationExpiredAt ?? null,
  })) {
    return { ok: false, error: 'Negotiation is closed' };
  }

  const deadline =
    (fresh as any).negotiationDeadlineAt instanceof Date
      ? ((fresh as any).negotiationDeadlineAt as Date)
      : await ensureDeadlineIfMissing(fresh.id, fresh.createdAt);

  if (now.getTime() > deadline.getTime()) {
    return { ok: false, error: 'Negotiation has expired' };
  }

  if (input.role === 'HOMEOWNER') {
    if (writtenQuote.lead.homeownerId !== input.userId) return { ok: false, error: 'Forbidden' };
    if ((fresh as any).homeownerExtensionUsed) return { ok: false, error: 'Extension already used' };

    const nextDeadlineAt = new Date(deadline.getTime() + HOURS_48_MS);

    await prismaAny.writtenQuote.update({
      where: { id: fresh.id },
      data: {
        negotiationDeadlineAt: nextDeadlineAt,
        homeownerExtensionUsed: true,
      },
    });

    // Sync lead-card countdown to negotiation deadline for all roles.
    await prismaAny.lead.update({
      where: { id: fresh.leadId },
      data: { expiresAt: nextDeadlineAt },
    });

    return { ok: true };
  }

  if (writtenQuote.installerId !== input.userId) return { ok: false, error: 'Forbidden' };
  if ((fresh as any).installerExtensionUsed) return { ok: false, error: 'Extension already used' };

  const nextDeadlineAt = new Date(deadline.getTime() + HOURS_48_MS);

  await prismaAny.writtenQuote.update({
    where: { id: fresh.id },
    data: {
      negotiationDeadlineAt: nextDeadlineAt,
      installerExtensionUsed: true,
    },
  });

  // Sync lead-card countdown to negotiation deadline for all roles.
  await prismaAny.lead.update({
    where: { id: fresh.leadId },
    data: { expiresAt: nextDeadlineAt },
  });

  return { ok: true };
}

export async function extendNegotiationByAdmin(input: {
  writtenQuoteId: string;
  adminUserId: string;
}): Promise<{ ok: boolean; error?: string }>{
  const now = new Date();

  await expireNegotiationIfNeeded(input.writtenQuoteId);

  const fresh = await prisma.writtenQuote.findUnique({
    where: { id: input.writtenQuoteId },
  });
  if (!fresh) return { ok: false, error: 'Written quote not found' };

  if (isNegotiationClosed({
    negotiationStatus: fresh.negotiationStatus,
    purchasedAt: fresh.purchasedAt,
    negotiationExpiredAt: (fresh as any).negotiationExpiredAt ?? null,
  })) {
    return { ok: false, error: 'Negotiation is closed' };
  }

  const deadline =
    (fresh as any).negotiationDeadlineAt instanceof Date
      ? ((fresh as any).negotiationDeadlineAt as Date)
      : await ensureDeadlineIfMissing(fresh.id, fresh.createdAt);

  const nextDeadlineAt = new Date(deadline.getTime() + HOURS_48_MS);

  await prismaAny.writtenQuote.update({
    where: { id: fresh.id },
    data: {
      negotiationDeadlineAt: nextDeadlineAt,
      adminExtensionCount: { increment: 1 },
      adminLastExtendedAt: now,
      adminLastExtendedBy: input.adminUserId,
    },
  });

  // Sync lead-card countdown to negotiation deadline for all roles.
  await prismaAny.lead.update({
    where: { id: fresh.leadId },
    data: { expiresAt: nextDeadlineAt },
  });

  return { ok: true };
}

export async function requestAdminExtension(input: {
  writtenQuoteId: string;
  requesterUserId: string;
  requesterRole: 'HOMEOWNER' | 'INSTALLER';
}): Promise<{ ok: boolean; error?: string }>{
  const writtenQuote = await prisma.writtenQuote.findUnique({
    where: { id: input.writtenQuoteId },
    include: { lead: { select: { homeownerId: true } }, installer: { select: { id: true } } },
  });

  if (!writtenQuote) return { ok: false, error: 'Written quote not found' };

  const isAllowed =
    (input.requesterRole === 'HOMEOWNER' && writtenQuote.lead.homeownerId === input.requesterUserId) ||
    (input.requesterRole === 'INSTALLER' && writtenQuote.installer.id === input.requesterUserId);

  if (!isAllowed) return { ok: false, error: 'Forbidden' };

  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  });

  if (admins.length === 0) return { ok: true };

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientUserId: admin.id,
        actionType: NotificationType.SYSTEM,
        role: UserRole.ADMIN,
        messageKey: 'admin.written_quote.extension_requested',
        routeKey: 'admin.dashboard',
        routeParams: { leadId: writtenQuote.leadId, writtenQuoteId: writtenQuote.id } as any,
        metadata: {
          writtenQuoteId: writtenQuote.id,
          leadId: writtenQuote.leadId,
          requestedBy: input.requesterUserId,
          requestedByRole: input.requesterRole,
        },
      })
    )
  );

  return { ok: true };
}

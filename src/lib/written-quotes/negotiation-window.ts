import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';

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

async function ensureDeadlineIfMissing(writtenQuoteId: string, createdAt: Date): Promise<Date> {
  const fallback = computeDefaultNegotiationDeadline(createdAt);
  await prisma.writtenQuote.updateMany({
    where: { id: writtenQuoteId, negotiationDeadlineAt: null },
    data: { negotiationDeadlineAt: fallback },
  });
  return fallback;
}

export async function expireNegotiationIfNeeded(writtenQuoteId: string): Promise<{ expired: boolean }>{
  const now = new Date();

  const writtenQuote = await prisma.writtenQuote.findUnique({
    where: { id: writtenQuoteId },
    include: {
      lead: { select: { id: true, homeownerId: true } },
      installer: { select: { id: true } },
    },
  });

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
  const updated = await prisma.writtenQuote.updateMany({
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
  await prisma.lead.update({
    where: { id: writtenQuote.leadId },
    data: { status: 'NEGOTIATION_EXPIRED' },
  });

  // Notify both parties via SYSTEM (email-enabled)
  await Promise.all([
    createNotification({
      recipientUserId: writtenQuote.lead.homeownerId,
      actionType: NotificationType.SYSTEM,
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.written_quote.negotiation_expired',
      routeKey: 'homeowner.requests',
      routeParams: { leadId: writtenQuote.leadId },
      metadata: { writtenQuoteId },
    }),
    createNotification({
      recipientUserId: writtenQuote.installer.id,
      actionType: NotificationType.SYSTEM,
      role: UserRole.INSTALLER,
      messageKey: 'installer.written_quote.negotiation_expired',
      routeKey: 'installer.leads',
      routeParams: { leadId: writtenQuote.leadId },
      metadata: { writtenQuoteId },
    }),
  ]);

  return { expired: true };
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
    await prisma.writtenQuote.update({
      where: { id: input.writtenQuoteId },
      data: { homeownerModalActiveAt: now },
    });
    return { ok: true };
  }

  if (writtenQuote.installerId !== input.userId) return { ok: false };
  await prisma.writtenQuote.update({
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

    await prisma.writtenQuote.update({
      where: { id: fresh.id },
      data: {
        negotiationDeadlineAt: new Date(deadline.getTime() + HOURS_48_MS),
        homeownerExtensionUsed: true,
      },
    });

    return { ok: true };
  }

  if (writtenQuote.installerId !== input.userId) return { ok: false, error: 'Forbidden' };
  if ((fresh as any).installerExtensionUsed) return { ok: false, error: 'Extension already used' };

  await prisma.writtenQuote.update({
    where: { id: fresh.id },
    data: {
      negotiationDeadlineAt: new Date(deadline.getTime() + HOURS_48_MS),
      installerExtensionUsed: true,
    },
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

  await prisma.writtenQuote.update({
    where: { id: fresh.id },
    data: {
      negotiationDeadlineAt: new Date(deadline.getTime() + HOURS_48_MS),
      adminExtensionCount: { increment: 1 },
      adminLastExtendedAt: now,
      adminLastExtendedBy: input.adminUserId,
    },
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

/**
 * Homeowner Admin Service
 *
 * Purpose: Admin helpers for managing homeowner-specific configuration.
 * Current responsibilities:
 * - Update homeowner quote submission limits with audit + notification side effects.
 */

import { prisma } from '@/lib/prisma';
import { AUDIT_ACTIONS, createAuditLog } from './audit-logger';
import { createBulkNotifications } from '../notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';

interface UpdateHomeownerQuoteLimitInput {
  adminId: string;
  homeownerId: string;
  quoteLimit: number;
  notify?: boolean;
  reason?: string;
}

export async function updateHomeownerQuoteLimit(
  input: UpdateHomeownerQuoteLimitInput
) {
  const { adminId, homeownerId, quoteLimit, notify = true, reason } = input;

  if (!Number.isFinite(quoteLimit) || quoteLimit <= 0) {
    throw new Error('Quote limit must be a positive number');
  }

  const homeowner = await prisma.user.findUnique({
    where: { id: homeownerId },
    select: {
      id: true,
      name: true,
      email: true,
      leadSubmissionLimit: true,
      leadSubmissionCount: true,
    },
  });

  if (!homeowner) {
    throw new Error('Homeowner not found');
  }

  const updatedHomeowner = await prisma.user.update({
    where: { id: homeownerId },
    data: {
      leadSubmissionLimit: Math.floor(quoteLimit),
    },
    select: {
      id: true,
      name: true,
      email: true,
      leadSubmissionLimit: true,
      leadSubmissionCount: true,
    },
  });

  await createAuditLog({
    action: AUDIT_ACTIONS.ADMIN_HOMEOWNER_QUOTE_LIMIT_UPDATED,
    entityType: 'user',
    entityId: homeownerId,
    userId: adminId,
    metadata: {
      previousLimit: homeowner.leadSubmissionLimit,
      newLimit: updatedHomeowner.leadSubmissionLimit,
      reason,
    },
  });

  if (notify) {
    const remainingAllowance = Math.max(
      updatedHomeowner.leadSubmissionLimit - updatedHomeowner.leadSubmissionCount,
      0,
    );

    await createBulkNotifications([{
      recipientUserId: homeownerId,
      role: UserRole.HOMEOWNER,
      actionType: NotificationType.SYSTEM,
      messageKey: 'homeowner.system.limit_updated',
      routeKey: 'homeowner.requests',
      metadata: {
        previousLimit: homeowner.leadSubmissionLimit,
        newLimit: updatedHomeowner.leadSubmissionLimit,
        remainingAllowance,
      },
    }]);
  }

  return updatedHomeowner;
}

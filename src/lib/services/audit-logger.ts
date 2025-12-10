/**
 * Audit Logger Service
 * 
 * Purpose: Log all important actions for compliance, debugging, and security
 * Used for: Admin audit trail, debugging issues, security investigations
 * 
 * What gets logged?
 * - Lead lifecycle changes (created, approved, purchased, etc.)
 * - Quote submissions and acceptances
 * - Chat messages (metadata only, not content)
 * - Payment transactions
 * - Admin actions (moderation, user management)
 * - Authentication events (logins, role changes)
 * 
 * Why audit logging?
 * - Compliance: Required for financial transactions (Stripe payments)
 * - Security: Track suspicious activity (multiple failed verifications)
 * - Debugging: Trace issues ("why did this lead expire?")
 * - Analytics: User behavior patterns
 */

import { prisma } from '@/lib/prisma';

/**
 * Audit log input
 */
export interface CreateAuditLogInput {
  action: string; // lead_created, lead_approved, quote_submitted, etc.
  entityType: string; // lead, quote, user, payment, etc.
  entityId?: string; // ID of the affected entity
  leadId?: string; // Related lead (if applicable)
  userId?: string; // User who performed the action
  metadata?: Record<string, any>; // Additional context
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 * 
 * @param data - Audit log data
 * @returns Created audit log
 * 
 * Example:
 *   await createAuditLog({
 *     action: 'lead_approved',
 *     entityType: 'lead',
 *     entityId: leadId,
 *     leadId,
 *     userId: adminId,
 *     metadata: { adminNotes: 'Verified phone and documents' },
 *   });
 */
export async function createAuditLog(data: CreateAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        leadId: data.leadId,
        userId: data.userId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: new Date(),
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 [Audit] ${data.action} - ${data.entityType} ${data.entityId || ''}`);
    }
  } catch (error) {
    // Never throw errors from audit logger (don't break main flow)
    console.error('❌ [Audit] Failed to create audit log:', error);
  }
}

/**
 * Get audit logs for a lead
 * 
 * @param leadId - Lead ID
 * @param limit - Max number of logs to return
 * @returns Array of audit logs (newest first)
 * 
 * Example:
 *   const logs = await getLeadAuditLogs(leadId, 20);
 *   // Returns: [{ action: 'lead_approved', ... }, ...]
 */
export async function getLeadAuditLogs(leadId: string, limit: number = 50) {
  return await prisma.auditLog.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs for a user
 * 
 * @param userId - User ID
 * @param limit - Max number of logs to return
 * @returns Array of audit logs (newest first)
 * 
 * Example:
 *   const logs = await getUserAuditLogs(userId, 50);
 */
export async function getUserAuditLogs(userId: string, limit: number = 100) {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs by action type
 * 
 * @param action - Action type (lead_approved, payment_completed, etc.)
 * @param limit - Max number of logs to return
 * @returns Array of audit logs (newest first)
 * 
 * Example:
 *   const logs = await getAuditLogsByAction('payment_completed', 100);
 */
export async function getAuditLogsByAction(action: string, limit: number = 100) {
  return await prisma.auditLog.findMany({
    where: { action },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get recent audit logs (admin dashboard)
 * 
 * @param limit - Max number of logs to return
 * @returns Array of audit logs with user details
 */
export async function getRecentAuditLogs(limit: number = 50) {
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      lead: {
        select: {
          id: true,
          postcode: true,
          location: true,
          homeowner: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });
}

/**
 * Search audit logs by date range
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @param action - Optional action filter
 * @returns Array of audit logs
 * 
 * Example:
 *   const logs = await searchAuditLogs(
 *     new Date('2025-01-01'),
 *     new Date('2025-01-31'),
 *     'payment_completed'
 *   );
 */
export async function searchAuditLogs(
  startDate: Date,
  endDate: Date,
  action?: string
) {
  return await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(action && { action }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get audit log statistics
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Statistics object
 * 
 * Example:
 *   const stats = await getAuditLogStats(
 *     new Date('2025-01-01'),
 *     new Date('2025-01-31')
 *   );
 *   // Returns: { total: 150, byAction: { lead_created: 50, ... } }
 */
export async function getAuditLogStats(startDate: Date, endDate: Date) {
  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { action: true },
  });

  const byAction: Record<string, number> = {};

  for (const log of logs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
  }

  return {
    total: logs.length,
    byAction,
  };
}

/**
 * Common audit actions (for type safety)
 */
export const AUDIT_ACTIONS = {
  // Lead lifecycle
  LEAD_CREATED: 'lead_created',
  LEAD_PHONE_VERIFIED: 'lead_phone_verified',
  LEAD_APPROVED: 'lead_approved',
  LEAD_REJECTED: 'lead_rejected',
  LEAD_FLAGGED: 'lead_flagged',
  LEAD_PURCHASED: 'lead_purchased',
  LEAD_EXPIRED: 'lead_expired',
  LEAD_CANCELLED: 'lead_cancelled',

  // Countdown timer management
  COUNTDOWN_TIMER_ADDED: 'countdown_timer_added',
  COUNTDOWN_TIMER_RESET: 'countdown_timer_reset',
  COUNTDOWN_TIMER_REMOVED: 'countdown_timer_removed',
  LEAD_REACTIVATED: 'lead_reactivated',

  // Quotes
  QUOTE_SUBMITTED: 'quote_submitted',
  QUOTE_ACCEPTED: 'quote_accepted',
  QUOTE_REJECTED: 'quote_rejected',

  // Chat
  CHAT_MESSAGE_SENT: 'chat_message_sent',

  // Payments
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REFUNDED: 'payment_refunded',

  // Authentication
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_ROLE_CHANGED: 'user_role_changed',

  // Admin actions
  ADMIN_USER_SUSPENDED: 'admin_user_suspended',
  ADMIN_USER_ACTIVATED: 'admin_user_activated',
  ADMIN_SETTINGS_CHANGED: 'admin_settings_changed',
  ADMIN_HOMEOWNER_QUOTE_LIMIT_UPDATED: 'admin_homeowner_quote_limit_updated',

  // Phase 7: Admin lead assignment and lifecycle
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_RESOLD: 'lead_resold',
  LEAD_ARCHIVED: 'lead_archived',
  LEAD_UNARCHIVED: 'lead_unarchived',
  TIMER_RESET: 'timer_reset',
  ASSIGNMENT_REMOVED: 'assignment_removed',
  ASSIGNMENT_ACCEPTED: 'assignment_accepted',
} as const;


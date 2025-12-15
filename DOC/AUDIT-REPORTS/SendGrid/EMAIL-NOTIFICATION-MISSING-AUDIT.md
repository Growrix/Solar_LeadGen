# SendGrid Email Notification Audit Report
**Date:** December 13, 2025  
**Issue:** No emails being sent when homeowner creates a lead  
**Status:** 🔴 **CRITICAL BUG IDENTIFIED**

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** The new notification service (`src/lib/notifications/notification-service.ts`) does NOT call `sendEmail()` at all. It only creates database records and does NOT trigger SendGrid emails.

**Impact:** Zero emails are being sent for ANY notification type, including:
- `NEW_LEAD` notifications to admins
- `LEAD_APPROVED` notifications to homeowners  
- `LEAD_PURCHASED` notifications to homeowners
- All other notification types

---

## Detailed Findings

### 1. Lead Creation Flow (✅ Working)

**File:** `src/lib/services/lead-service.ts` (lines 318-329)

```typescript
// Send notification to all admin users
const admins = await prisma.user.findMany({
  where: { role: UserRole.ADMIN },
  select: { id: true }
});

if (admins.length > 0) {
  console.log(`[createLead] Creating admin notifications for ${admins.length} admins`);
  await createBulkNotifications(
    admins.map(admin => ({
      recipientUserId: admin.id,
      role: UserRole.ADMIN,
      actionType: NotificationType.NEW_LEAD,
      messageKey: 'admin.lead.created',
      routeKey: 'admin.lead.manage',
      routeParams: { 
        leadId: lead.id,
        quoteType: input.quoteType,
        location: input.location,
        postcode: input.propertyPostcode
      }
    }))
  );
}
```

**Status:** ✅ This code IS being called and notifications ARE being created in the database.

---

### 2. New Notification Service (🔴 MISSING EMAIL LOGIC)

**File:** `src/lib/notifications/notification-service.ts` (complete file, lines 1-78)

```typescript
export async function createNotification(input: CreateNotificationInput) {
  try {
    const { title, message } = getNotificationText(input.messageKey);

    const notification = await prisma.notification.create({
      data: {
        userId: input.recipientUserId,
        role: input.role,
        type: input.actionType,
        title,
        message,
        messageKey: input.messageKey,
        routeKey: input.routeKey,
        routeParams: input.routeParams || {},
        metadata: input.metadata || {},
        isRead: false,
      },
    });

    console.log(`🔔 [Notification Service] Created notification ${notification.id} for user ${input.recipientUserId}`);
    return notification;
  } catch (error) {
    console.error('[Notification Service] Error creating notification:', error);
    throw error;
  }
}
```

**Status:** 🔴 **CRITICAL ISSUE - NO EMAIL LOGIC**

**Missing:**
- No `import { sendEmail } from '@/lib/sendgrid'`
- No `shouldSendEmail()` function
- No `sendEmailNotification()` function
- No Pusher integration

This service ONLY creates database records. It does NOT:
1. Send emails via SendGrid
2. Send real-time notifications via Pusher
3. Check if the notification type should trigger an email

---

### 3. Old Notification Service (✅ Has Email Logic)

**File:** `src/lib/services/notification-service.ts` (lines 116-156)

```typescript
export async function createNotification(
  data: CreateNotificationInput
): Promise<void> {
  try {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: validatedUrl,
        metadata: data.metadata,
        isRead: false,
        createdAt: new Date(),
      },
    });

    // 2. Send real-time notification via Pusher
    await triggerNotification(data.userId, {
      id: notification.id,
      type: data.type,
      title: data.title,
      message: data.message,
      timestamp: notification.createdAt,
    });

    // 3. Send email notification (for important notifications)
    if (shouldSendEmail(data.type)) {
      await sendEmailNotification(data);
    }
  }
}

function shouldSendEmail(type: NotificationType): boolean {
  const emailNotificationTypes: NotificationType[] = [
    // Admin notifications
    'NEW_LEAD',
    'LEAD_PURCHASED',
    'BID_SUBMITTED',
    
    // Homeowner notifications
    'LEAD_APPROVED',
    'REQUEST_RECEIVED',
    'INSTALLER_RESPONDED',
    'SELECTION_CONFIRMED',
    
    // Installer notifications
    'NEW_OPPORTUNITY',
    'BID_WON',
    'BID_LOST',
    'BID_OUTCOME_NOT_SELECTED',
    'PURCHASE_CONFIRMED',
    'BID_PURCHASE_COMPLETED',
    
    // Generic/shared
    'NEW_QUOTE',
    'QUOTE_ACCEPTED',
    'PAYMENT_RECEIVED',
  ];

  return emailNotificationTypes.includes(type);
}

async function sendEmailNotification(data: CreateNotificationInput): Promise<void> {
  try {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) return;

    const actionUrl = data.actionUrl
      ? `${process.env.NEXTAUTH_URL}${data.actionUrl}`
      : undefined;

    await sendEmail({
      to: user.email,
      subject: data.title,
      text: data.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFFFFF;">${data.title}</h2>
          <p style="color: #F5F5F5; line-height: 1.6;">${data.message}</p>
          ${actionUrl ? `
            <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #1A1A1A; color: white; text-decoration: none; border-radius: 6px; border: 1px solid #2C2C2C;">
              View Details
            </a>
          ` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #2C2C2C;">
          <p style="color: #A3A3A3; font-size: 14px;">
            This is an automated notification from Solar Match. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ [Notification] Failed to send email:', error);
  }
}
```

**Status:** ✅ This service HAS complete email logic but is NOT being used for lead creation.

---

### 4. SendGrid Configuration (✅ Working)

**File:** `.env` (lines 108-109)

```env
SENDGRID_API_KEY="SG.***************************" # API key configured (redacted for security)
SENDGRID_FROM_EMAIL="mohammadikramul7@gmail.com"
```

**Status:** ✅ Environment variables are properly configured.

**File:** `src/lib/sendgrid.ts` (lines 30-35)

```typescript
if (!process.env.SENDGRID_API_KEY) {
  console.warn('⚠️ [SendGrid] SENDGRID_API_KEY not configured - emails will not be sent');
} else {
  // Initialize SendGrid with API key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
```

**Status:** ✅ SendGrid is properly initialized.

---

### 5. Test Mode Check (✅ Not Active)

**File:** `src/lib/sendgrid.ts` (line 51)

```typescript
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1';
```

**Status:** ✅ Test mode is NOT active (neither environment variable is set in `.env`).

---

## Root Cause Analysis

### Timeline of Changes

1. **Original Implementation:** Used `src/lib/services/notification-service.ts` which had complete email logic (Pusher + SendGrid + shouldSendEmail)
2. **Refactor:** Created new `src/lib/notifications/notification-service.ts` with cleaner architecture
3. **Migration:** Updated lead-service.ts to use new notification service
4. **Bug Introduced:** New notification service was created WITHOUT email/Pusher logic

### Code Comparison

| Feature | Old Service | New Service |
|---------|-------------|-------------|
| Database creation | ✅ Yes | ✅ Yes |
| Pusher real-time | ✅ Yes | ❌ **NO** |
| SendGrid emails | ✅ Yes | ❌ **NO** |
| shouldSendEmail() | ✅ Yes | ❌ **NO** |
| Email templates | ✅ Yes | ❌ **NO** |

---

## Impact Assessment

### Affected Notification Types

**Admin Notifications (No emails sent):**
- `NEW_LEAD` - Admins don't get emails when leads are created
- `LEAD_PURCHASED` - Admins don't get emails when leads are purchased
- `BID_SUBMITTED` - Admins don't get emails when bids are submitted

**Homeowner Notifications (No emails sent):**
- `LEAD_APPROVED` - Homeowners don't get approval emails
- `INSTALLER_RESPONDED` - Homeowners don't get installer response emails
- `SELECTION_CONFIRMED` - Homeowners don't get selection confirmation emails

**Installer Notifications (No emails sent):**
- `NEW_OPPORTUNITY` - Installers don't get new lead emails
- `BID_WON` - Winners don't get win notification emails
- `BID_LOST` - Losers don't get outcome emails
- `PURCHASE_CONFIRMED` - Installers don't get purchase confirmation emails

**Total Impact:** ~15+ notification types are NOT sending emails

---

## Recommended Fixes

### Option 1: Add Email Logic to New Service (RECOMMENDED)

**File:** `src/lib/notifications/notification-service.ts`

Add the missing email logic from the old service:

```typescript
import { sendEmail } from '@/lib/sendgrid';
import { triggerNotification } from '@/lib/pusher';

export async function createNotification(input: CreateNotificationInput) {
  try {
    const { title, message } = getNotificationText(input.messageKey);

    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId: input.recipientUserId,
        role: input.role,
        type: input.actionType,
        title,
        message,
        messageKey: input.messageKey,
        routeKey: input.routeKey,
        routeParams: input.routeParams || {},
        metadata: input.metadata || {},
        isRead: false,
      },
    });

    // 2. Send real-time notification via Pusher
    try {
      await triggerNotification(input.recipientUserId, {
        id: notification.id,
        type: input.actionType,
        title,
        message,
        timestamp: notification.createdAt,
      });
    } catch (error) {
      console.error('[Notification Service] Pusher error:', error);
    }

    // 3. Send email notification (for important notifications)
    if (shouldSendEmail(input.actionType)) {
      await sendEmailNotification({
        userId: input.recipientUserId,
        type: input.actionType,
        title,
        message,
        routeKey: input.routeKey,
        routeParams: input.routeParams,
      });
    }

    console.log(`🔔 [Notification Service] Created notification ${notification.id} for user ${input.recipientUserId}`);
    return notification;
  } catch (error) {
    console.error('[Notification Service] Error creating notification:', error);
    throw error;
  }
}

function shouldSendEmail(type: NotificationType): boolean {
  const emailNotificationTypes: NotificationType[] = [
    'NEW_LEAD',
    'LEAD_PURCHASED',
    'BID_SUBMITTED',
    'LEAD_APPROVED',
    'REQUEST_RECEIVED',
    'INSTALLER_RESPONDED',
    'SELECTION_CONFIRMED',
    'NEW_OPPORTUNITY',
    'BID_WON',
    'BID_LOST',
    'BID_OUTCOME_NOT_SELECTED',
    'PURCHASE_CONFIRMED',
    'BID_PURCHASE_COMPLETED',
    'NEW_QUOTE',
    'QUOTE_ACCEPTED',
    'PAYMENT_RECEIVED',
  ];
  return emailNotificationTypes.includes(type);
}

async function sendEmailNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  routeKey: RouteKey;
  routeParams?: RouteParams;
}): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) return;

    // Build action URL from routeKey and routeParams
    const actionUrl = buildActionUrl(data.routeKey, data.routeParams);
    const fullActionUrl = actionUrl ? `${process.env.NEXTAUTH_URL}${actionUrl}` : undefined;

    await sendEmail({
      to: user.email,
      subject: data.title,
      text: data.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${data.title}</h2>
          <p style="line-height: 1.6;">${data.message}</p>
          ${fullActionUrl ? `
            <a href="${fullActionUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #1A1A1A; color: white; text-decoration: none; border-radius: 6px;">
              View Details
            </a>
          ` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from Solar Match.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[Notification Service] Failed to send email:', error);
  }
}

function buildActionUrl(routeKey: RouteKey, routeParams?: RouteParams): string | undefined {
  // Import route resolver logic
  // This needs to be implemented based on your route-resolver.ts
  // For now, return undefined to prevent errors
  return undefined;
}
```

### Option 2: Revert to Old Service (QUICK FIX)

**File:** `src/lib/services/lead-service.ts` (line 19)

```typescript
// Change this:
import { createBulkNotifications } from '../notifications/notification-service';

// To this:
import { createNotification as createBulkNotifications } from './notification-service';
```

**Note:** This is a quick fix but doesn't solve the long-term architecture problem.

---

## Action Items

### Immediate (HIGH PRIORITY)

1. ✅ **Add email logic to new notification service** (Option 1)
   - Add `sendEmail` import
   - Add `triggerNotification` import (Pusher)
   - Add `shouldSendEmail()` function
   - Add `sendEmailNotification()` function
   - Add `buildActionUrl()` helper

2. ✅ **Test email delivery**
   - Create a test lead as homeowner
   - Verify admin receives email
   - Check SendGrid logs

3. ✅ **Update route resolver**
   - Implement `buildActionUrl()` to convert routeKey → actual URL
   - Example: `admin.lead.manage` + `{ leadId: '123' }` → `/admin/leads/123`

### Medium Priority

4. ⚠️ **Migrate all notification calls**
   - Audit all files using old notification service
   - Update to use new service
   - Remove old service after migration

5. ⚠️ **Add integration tests**
   - Test email delivery for each notification type
   - Verify Pusher real-time delivery
   - Test test mode (PLAYWRIGHT_TEST=1)

### Low Priority

6. 📝 **Documentation**
   - Update notification service docs
   - Document email notification types
   - Add troubleshooting guide

---

## Testing Checklist

### Manual Testing

- [ ] Create lead as homeowner
- [ ] Check admin email inbox
- [ ] Verify email contains correct lead details
- [ ] Check SendGrid logs for delivery status
- [ ] Test Pusher real-time notification (if admin is online)

### Automated Testing

- [ ] Add test for `shouldSendEmail()`
- [ ] Add test for `sendEmailNotification()`
- [ ] Add E2E test for lead creation → email delivery
- [ ] Verify test mode works (emails captured, not sent)

---

## References

### Files Analyzed

1. `src/lib/services/lead-service.ts` - Lead creation logic (lines 1-1592)
2. `src/lib/notifications/notification-service.ts` - New notification service (lines 1-78)
3. `src/lib/services/notification-service.ts` - Old notification service (lines 1-444)
4. `src/lib/sendgrid.ts` - SendGrid client (lines 1-293)
5. `src/app/api/leads/route.ts` - Lead API endpoint (lines 1-300)
6. `.env` - Environment variables (lines 108-109)

### Related Documentation

- [DOC/AUDIT-REPORTS/SendGrid/SENDGRID-AUDIT-REPORT.md](../SENDGRID-AUDIT-REPORT.md)
- [DOC/AUDIT-REPORTS/SendGrid/TESTING-GUIDE.md](../TESTING-GUIDE.md)
- [specs/008-description-enhance-existing/tasks.md](../../specs/008-description-enhance-existing/tasks.md)

---

## Conclusion

**The bug is definitively identified:** The new notification service (`src/lib/notifications/notification-service.ts`) does NOT include email or Pusher logic. It only creates database records.

**Fix:** Add the missing `sendEmail()` and `triggerNotification()` logic from the old service to the new service.

**Priority:** 🔴 **CRITICAL** - Zero emails are being sent for any notification type.

**Estimated Fix Time:** 30-60 minutes (implementation + testing)

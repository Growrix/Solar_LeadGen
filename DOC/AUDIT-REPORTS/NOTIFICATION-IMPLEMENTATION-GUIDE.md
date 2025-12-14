# Notification Implementation Guide

**Date**: December 10, 2025  
**Purpose**: Step-by-step guide for implementing new notification types  
**Audience**: Developers adding features that require user notifications

---

## Table of Contents

1. [Overview](#overview)
2. [When to Create a Notification](#when-to-create-a-notification)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Design System Standards](#design-system-standards)
5. [Testing Checklist](#testing-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The notification system provides real-time updates to users via:
- **Modal Dropdown**: Bell icon in header → Recent notifications
- **Full Page**: `/notifications` → Complete notification history
- **Pusher (WebSockets)**: Real-time delivery without page refresh

**Tech Stack**:
- **Backend**: Next.js API routes + Prisma ORM
- **Frontend**: React components with design system tokens
- **Real-time**: Pusher (configured in `.env`)
- **Database**: PostgreSQL (NotificationType enum in schema)

---

## When to Create a Notification

✅ **Create notification when:**
- User action affects another user (e.g., bid submitted, lead purchased)
- System requires user response (e.g., payment failed, lead approved)
- Time-sensitive information (e.g., bid won with payment deadline)
- User-requested updates (e.g., quote accepted/rejected)

❌ **Don't create notification for:**
- User's own actions (they already know they did it)
- Background processes with no user impact
- Overly frequent events (group them instead)
- Non-actionable system logs

---

## Step-by-Step Implementation

### **STEP 1: Add Notification Type to Prisma Schema**

**File**: `prisma/schema.prisma`

Find the `NotificationType` enum (around line 495):

```prisma
enum NotificationType {
  NEW_LEAD
  LEAD_PURCHASED
  // ... existing types ...
  BID_SUBMITTED
  PAYMENT_FAILED
  
  // ADD YOUR NEW TYPE HERE:
  YOUR_NEW_TYPE
}
```

**Naming Convention**: 
- Use `SCREAMING_SNAKE_CASE`
- Be specific (not just "UPDATE")
- Think about clarity in UI (converts to "Your New Type" badge)

**After adding**:
```powershell
# DO NOT use `npx prisma migrate reset` (destroys all data)
# Instead, use incremental migration:

npx prisma generate  # Update TypeScript types
npx prisma migrate dev --name add_your_new_type_notification  # Create migration
```

✅ **Result**: New enum value available in code, database updated, NO data loss

---

### **STEP 2: Create Notification in Backend**

**Location**: API route or service where the event happens

**Example**: Installer submits bid → Notify homeowner

**File**: `src/app/api/bids/route.ts` (or relevant API file)

```typescript
import { createNotification } from '@/lib/services/notification-service';

// After the main action (e.g., bid creation)
const bid = await prisma.bid.create({ /* ... */ });

// Get related data for notification message
const lead = await prisma.lead.findUnique({
  where: { id: leadId },
  select: { homeownerId: true, location: true, postcode: true }
});

const installer = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { companyName: true, name: true }
});

// Create notification
await createNotification({
  userId: lead.homeownerId,  // WHO receives it
  type: 'YOUR_NEW_TYPE',     // MUST match Prisma enum
  title: 'Short Title (3-6 words)',  // Shows in dropdown header
  message: 'Detailed message with context. Include names, locations, amounts, etc.',  // Shows in card body
  actionUrl: '/path/to/relevant/page?param=value',  // Where clicking goes
  metadata: {  // Optional: Store extra data for analytics
    relatedId: bid.id,
    customField: 'value'
  }
});
```

**Best Practices**:
- **title**: Keep under 50 characters, action-focused
- **message**: Include all context (who, what, where, when, why)
- **actionUrl**: Use query params for modals (`?modal=reviewBids`)
- **userId**: Send to recipient (not the actor who triggered it)

**Role-Specific Routing**:
```typescript
// For homeowners:
actionUrl: `/homeowner/leads/${leadId}?modal=details`

// For installers:
actionUrl: `/installer/purchased-leads?tab=bidding&leadId=${leadId}`

// For admins:
actionUrl: `/admin/leads/${leadId}`
```

**validateActionUrl() Function** (in `notification-service.ts`):
The backend automatically validates routes are correct for user role. If you pass an invalid route, it auto-corrects or uses safe default.

---

### **STEP 3: Add Icon to Frontend**

**File**: `src/components/NotificationDropdown.tsx`

**Step 3.1**: Import icon from `lucide-react` (line ~7):

```tsx
import {
  // ... existing icons ...
  YourIconName  // Choose from https://lucide.dev/icons
} from 'lucide-react';
```

**Popular Choices**:
- Financial: `DollarSign`, `CreditCard`, `Coins`
- Actions: `Send`, `Upload`, `Download`, `Share`
- Status: `CheckCircle2`, `XCircle`, `AlertTriangle`, `Info`
- Objects: `FileText`, `Package`, `Tool`, `Calendar`

**Step 3.2**: Add to `getNotificationIcon()` function (around line 170):

```tsx
const getNotificationIcon = (type: string) => {
  switch (type) {
    // ... existing cases ...
    case 'YOUR_NEW_TYPE':
      return <YourIconName className="h-5 w-5" />;  // ⚠️ MUST use h-5 w-5
    default:
      return <BellIcon className="h-5 w-5" />;
  }
};
```

**Icon Selection Guidelines**:
- **Must be unique**: No two types share same icon (users rely on visual recognition)
- **Semantically meaningful**: Icon should hint at notification content
- **Consistent style**: All lucide-react icons have same line weight

---

### **STEP 4: Assign Priority Level**

**File**: `src/components/NotificationDropdown.tsx`

**Update**: `getNotificationPriority()` function (around line 180):

```tsx
const getNotificationPriority = (type: string): NotificationPriority => {
  switch (type) {
    // URGENT (Red) - Immediate action required, negative outcome
    case 'PAYMENT_FAILED':
    case 'BID_LOST':
    case 'YOUR_NEW_TYPE_IF_CRITICAL':  // ⚠️ Only if truly urgent
      return 'urgent';
    
    // HIGH (Orange) - Time-sensitive, requires response soon
    case 'BID_WON':  // Has payment deadline
    case 'NEW_MESSAGE':  // Awaiting reply
    case 'YOUR_NEW_TYPE_IF_TIME_SENSITIVE':
      return 'high';
    
    // MEDIUM (Blue) - Standard notifications, informational
    case 'NEW_LEAD':
    case 'LEAD_PURCHASED':
    case 'YOUR_NEW_TYPE':  // ⬅️ Most notifications go here
      return 'medium';
    
    // LOW (Green) - Positive confirmations, no action needed
    case 'LEAD_APPROVED':
    case 'QUOTE_ACCEPTED':
    case 'YOUR_NEW_TYPE_IF_POSITIVE':
      return 'low';
    
    // INFO (Gray) - System messages, low importance
    case 'SYSTEM':
      return 'info';
    
    default:
      return 'info';  // Fallback
  }
};
```

**Priority Guidelines**:
- **Urgent**: Financial failures, rejected items, removed access
- **High**: Deadlines, awaiting action, competitive situations
- **Medium**: Default for most events
- **Low**: Successes, approvals, completions
- **Info**: System announcements, maintenance notices

**Visual Impact**:
- Urgent → Red background, stands out most
- High → Orange/accent, noticeable
- Medium → Blue/primary, standard
- Low → Green, subtle positive
- Info → Gray, barely noticeable

---

### **STEP 5: Add Type Badge Label**

**File**: `src/components/NotificationDropdown.tsx`

**Update**: `getTypeLabel()` function (around line 220):

```tsx
const getTypeLabel = (type: string): string => {
  switch (type) {
    // ... existing cases ...
    case 'YOUR_NEW_TYPE':
      return 'Your New Type';  // Converts SCREAMING_SNAKE to Title Case
    default:
      return type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }
};
```

**Badge Styling** (already implemented in `getTypeBadgeClasses()`):
- Badge automatically matches priority color
- Text is small (text-caption) with medium font weight
- Appears next to notification title

---

### **STEP 6: Add Smart Action Button (Optional)**

**File**: `src/components/NotificationDropdown.tsx`

**If your notification needs a custom button** (not just "View"):

Update `getSmartActionButton()` function (around line 333):

```tsx
const getSmartActionButton = (notification: Notification) => {
  const baseClasses = "px-3 py-1.5 text-button rounded-button border border-primary text-primary bg-transparent hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary";
  
  switch (notification.type) {
    // ... existing cases ...
    case 'YOUR_NEW_TYPE':
      return (
        <button
          className={baseClasses}
          onClick={(e) => handleViewClick(notification, e)}
          disabled={isLoading}
        >
          <YourIconName className="h-4 w-4" />  // Optional icon
          Custom Button Text  // e.g., "Approve", "Download", "Reply"
        </button>
      );
    
    default:
      // Generic "View" button
      return (
        <button className={baseClasses} onClick={(e) => handleViewClick(notification, e)} disabled={isLoading}>
          View
        </button>
      );
  }
};
```

**Button Text Examples**:
- "Proceed to Payment" (BID_WON)
- "Review Bids" (BID_SUBMITTED)
- "Reply" (NEW_MESSAGE)
- "Download Receipt" (PAYMENT_RECEIVED)
- "View Details" (generic fallback)

---

### **STEP 7: Verify Design System Compliance**

**Run 6 Verification Commands** (in PowerShell):

```powershell
# All MUST return 0
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|border-gray-" | Measure-Object | Select-Object -ExpandProperty Count

Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "dark:text-|dark:bg-|dark:border-" | Measure-Object | Select-Object -ExpandProperty Count

Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" | Where-Object { $_.Line -notmatch "viewBox" } | Measure-Object | Select-Object -ExpandProperty Count

Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b" | Measure-Object | Select-Object -ExpandProperty Count

Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "bg-(blue|green|red|yellow|purple)-[0-9]" | Measure-Object | Select-Object -ExpandProperty Count

Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "text-xs|text-sm|text-lg|font-bold|font-semibold|font-medium" | Measure-Object | Select-Object -ExpandProperty Count
```

**Expected**: `0/0/0/0/0/0` ✅

**If any command returns > 0**: You have design system violations. Fix using semantic tokens:
- `text-gray-500` → `text-muted-foreground`
- `bg-white` → `bg-surface`
- `text-sm` → `text-body-small`
- `font-semibold` → Use `text-heading-4` (includes font-weight)

---

### **STEP 8: Test Implementation**

**Run TypeScript Check**:
```powershell
npx tsc --noEmit  # MUST return 0 errors
```

**Run Build**:
```powershell
npm run build  # MUST say "Compiled successfully" (no warnings)
```

**Start Dev Server**:
```powershell
npm run dev
```

**Manual Testing**:
1. Open browser → `http://localhost:3000`
2. Trigger your new notification type (via UI or API call)
3. Check bell icon → Unread count increases
4. Click bell → Notification appears in dropdown
5. Verify:
   - [ ] Icon is unique and visible
   - [ ] Priority color is correct
   - [ ] Badge shows type label
   - [ ] Message is clear and helpful
   - [ ] Action button (if any) is labeled correctly
   - [ ] Clicking routes to correct page
   - [ ] Mark as read works
   - [ ] No console errors

**Multi-Theme Testing**:
- Dark theme (default) ✅
- Light theme ✅
- Purple theme ✅

**Responsive Testing**:
- Mobile (320px, 375px) ✅
- Tablet (768px) ✅
- Desktop (1024px, 1440px) ✅

---

## Design System Standards

### **Color Tokens** (Never use hardcoded colors)

| Token | Usage | Example |
|-------|-------|---------|
| `bg-surface` | Card backgrounds | Notification card background |
| `bg-surface-hover` | Hover states | Notification hover |
| `text-foreground` | Primary text | Notification title |
| `text-foreground-secondary` | Secondary text | Notification message body |
| `text-muted-foreground` | Subtle text | Timestamps |
| `text-primary` | Links, buttons | Action button text |
| `bg-error` | Urgent background | Urgent priority icon background |
| `bg-accent` | High priority | High priority icon background |
| `bg-primary` | Medium priority | Medium priority icon background |
| `bg-success` | Low priority | Success/approval icon background |

### **Typography Tokens** (Never use raw sizes)

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-heading-3` | 18px | 600 | Modal header |
| `text-heading-4` | 16px | 600 | Notification title |
| `text-body` | 16px | 400 | Standard text |
| `text-body-small` | 14px | 400 | Notification message |
| `text-label` | 14px | 500 | Links with emphasis |
| `text-caption` | 12px | 400 | Timestamps, badges |
| `text-button` | 14px | 500 | Button text |

### **Spacing Tokens**

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-2` | 8px | Small gaps |
| `spacing-3` | 12px | Medium gaps |
| `spacing-4` | 16px | Standard padding |
| `spacing-6` | 24px | Large sections |

---

## Testing Checklist

Use this checklist for every new notification type:

- [ ] **Schema**: NotificationType enum updated, migration created
- [ ] **Backend**: createNotification() called after event
- [ ] **Icon**: Unique lucide-react icon added
- [ ] **Priority**: Correct level assigned (urgent/high/medium/low/info)
- [ ] **Badge**: Type label displays correctly
- [ ] **Button**: Smart action button (if needed) with clear label
- [ ] **Routing**: actionUrl points to correct page for user role
- [ ] **Message**: Clear, contextual, includes all relevant info
- [ ] **Design System**: 0/0/0/0/0/0 verification passed
- [ ] **TypeScript**: 0 errors
- [ ] **Build**: No warnings
- [ ] **Browser**: No console errors
- [ ] **Real-time**: Pusher delivers notification instantly
- [ ] **Themes**: Works in Dark, Light, Purple
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Accessibility**: Keyboard navigation works, ARIA labels present

---

## Troubleshooting

### **Problem**: "Type 'YOUR_NEW_TYPE' is not assignable to type 'NotificationType'"

**Solution**: You forgot to regenerate Prisma Client after schema change:
```powershell
npx prisma generate
```

---

### **Problem**: Notification doesn't appear in dropdown

**Checklist**:
1. Check browser console → Any errors?
2. Check Network tab → Was notification created (POST /api/notifications)?
3. Check Pusher connection → Console should show "Pusher connected"
4. Check userId → Is notification sent to correct user?
5. Check database → Does notification exist in Notification table?

---

### **Problem**: Icon doesn't show or is generic bell

**Solution**: You forgot to add case in `getNotificationIcon()` function. Check spelling matches Prisma enum exactly (case-sensitive).

---

### **Problem**: Priority color is wrong

**Solution**: Check `getNotificationPriority()` function. Make sure your notification type is in correct tier (urgent/high/medium/low/info).

---

### **Problem**: "Classname 'text-sm' is not a Tailwind CSS class" (ESLint error)

**Solution**: You used hardcoded typography. Replace with semantic token:
- `text-xs` → `text-caption`
- `text-sm` → `text-body-small`
- `text-lg` → `text-heading-3`
- `font-semibold` → Use `text-heading-4` (includes weight)

---

### **Problem**: Routing goes to 404 or wrong page

**Checklist**:
1. Check actionUrl spelling and format
2. Verify route exists in app router (`src/app/...`)
3. Check user role → Installer can't access homeowner routes
4. Backend `validateActionUrl()` should auto-correct if role mismatches

---

### **Problem**: Notification creates but Pusher doesn't deliver

**Checklist**:
1. Check `.env` → `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` correct?
2. Check Pusher dashboard → Are events being sent?
3. Check `usePusher` hook → Is user subscribed to correct channel?
4. Check browser console → "Pusher failed to connect" errors?

---

## Common Patterns

### **Pattern 1: Homeowner-to-Installer Notification**

```typescript
// Homeowner submits lead → Notify assigned installer
await createNotification({
  userId: installer.id,  // Installer receives it
  type: 'NEW_LEAD',
  title: 'New Lead Assigned',
  message: `You have been assigned a new ${lead.quoteType} lead in ${lead.location}, ${lead.postcode}.`,
  actionUrl: `/installer/leads/${lead.id}`,
  metadata: { leadId: lead.id }
});
```

### **Pattern 2: Installer-to-Homeowner Notification**

```typescript
// Installer submits bid → Notify homeowner
await createNotification({
  userId: lead.homeownerId,  // Homeowner receives it
  type: 'BID_SUBMITTED',
  title: 'New Bid Received',
  message: `${installer.companyName} has submitted a bid of $${bid.finalTotal} for your project.`,
  actionUrl: `/homeowner/leads/${lead.id}?modal=reviewBids`,
  metadata: { bidId: bid.id, installerId: installer.id }
});
```

### **Pattern 3: Admin-to-User Notification**

```typescript
// Admin approves lead → Notify homeowner
await createNotification({
  userId: lead.homeownerId,
  type: 'LEAD_APPROVED',
  title: 'Lead Approved',
  message: `Your ${lead.quoteType} lead for ${lead.location} has been approved and is now live.`,
  actionUrl: `/homeowner/leads/${lead.id}`,
  metadata: { leadId: lead.id, approvedBy: adminId }
});
```

### **Pattern 4: System-to-All Notification**

```typescript
// Broadcast system announcement
const allUsers = await prisma.user.findMany({ where: { role: { not: 'ADMIN' } } });

for (const user of allUsers) {
  await createNotification({
    userId: user.id,
    type: 'SYSTEM',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Dec 15, 2:00 AM - 4:00 AM. Platform will be unavailable.',
    actionUrl: null,  // No action needed
    metadata: { maintenanceDate: '2025-12-15' }
  });
}
```

---

## Quick Reference Card

**File Locations**:
- Schema: `prisma/schema.prisma` (line ~495)
- Backend Service: `src/lib/services/notification-service.ts`
- Frontend Component: `src/components/NotificationDropdown.tsx`
- Full Page: `src/app/notifications/page.tsx`
- Testing Checklist: `DOC/TESTING/PHASE-13M-MANUAL-TESTS.md`

**Key Functions**:
- `createNotification()` → Backend notification creation
- `validateActionUrl()` → Route validation
- `getNotificationIcon()` → Icon selection
- `getNotificationPriority()` → Color/urgency
- `getTypeLabel()` → Badge text
- `getSmartActionButton()` → Custom buttons

**Design Tokens**:
- Colors: `bg-surface`, `text-foreground`, `text-muted-foreground`
- Typography: `text-heading-4`, `text-body-small`, `text-caption`, `text-button`
- Spacing: `spacing-2`, `spacing-3`, `spacing-4`

**Verification Commands**:
```powershell
npx tsc --noEmit  # 0 errors required
npm run build     # "Compiled successfully" required
# Run 6 design system commands (see STEP 7)
```

---

**Guide Complete** ✅  
**Last Updated**: December 10, 2025  
**Questions?** Check `DOC/AUDIT-REPORTS/PHASE-13M-NOTIFICATION-ROUTING-AUDIT.md` for context

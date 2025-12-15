# Phase 13M: Notification Routing & Clarity - Manual Testing Checklist

**Date**: December 10, 2025  
**Phase**: Phase 13M  
**Tester**: [Your Name]  
**Test Environment**: Development (localhost:3000)

---

## Pre-Test Setup

- [ ] Dev server running: `npm run dev`
- [ ] Database seeded with test data
- [ ] At least 2 users created (1 homeowner, 1 installer)
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible (check for errors)
- [ ] Network tab ready (monitor API calls)

---

## Test Matrix: All 20 Notification Types

### 1. NEW_LEAD (Installer receives new lead)
- [ ] **Icon**: Briefcase (unique) ✅
- [ ] **Priority**: Medium (blue/primary color) ✅
- [ ] **Badge**: Shows "New Lead" type ✅
- [ ] **Message**: Clear description with lead location ✅
- [ ] **Action Button**: "View Lead" ✅
- [ ] **Routing**: Clicks → Opens `/installer/leads/{leadId}` ✅
- [ ] **Mark as Read**: Badge updates, count decreases ✅

### 2. LEAD_PURCHASED (Installer purchases lead)
- [ ] **Icon**: CreditCard ✅
- [ ] **Priority**: Medium (blue/primary) ✅
- [ ] **Badge**: "Lead Purchased" ✅
- [ ] **Routing**: Opens `/installer/purchased-leads?tab={quoteType}&leadId={id}` ✅
  - [ ] Call-visit lead → opens call-visit tab
  - [ ] Written quote lead → opens written-quotes tab
  - [ ] Bidding lead → opens bidding tab

### 3. LEAD_ASSIGNED (Admin assigns lead to installer)
- [ ] **Icon**: ClipboardCheck ✅
- [ ] **Priority**: High (orange/accent - time-sensitive with countdown) ✅
- [ ] **Badge**: "Lead Assigned" ✅
- [ ] **Routing**: Opens `/installer/leads/{leadId}` ✅

### 4. LEAD_APPROVED (Homeowner lead approved by admin)
- [ ] **Icon**: CheckCircle ✅
- [ ] **Priority**: Low (green/success - positive confirmation) ✅
- [ ] **Badge**: "Lead Approved" ✅
- [ ] **Routing**: Opens `/homeowner/leads/{leadId}` ✅

### 5. LEAD_REJECTED (Homeowner lead rejected by admin)
- [ ] **Icon**: XCircle ✅
- [ ] **Priority**: Urgent (red/error) ✅
- [ ] **Badge**: "Lead Rejected" ✅
- [ ] **Message**: Includes rejection reason ✅

### 6. NEW_QUOTE (Homeowner receives quote from installer)
- [ ] **Icon**: FileCheck ✅
- [ ] **Priority**: Medium (blue/primary) ✅
- [ ] **Badge**: "New Quote" ✅
- [ ] **Routing**: Opens `/homeowner/quotes/{quoteId}` or lead page with quote modal ✅

### 7. QUOTE_ACCEPTED (Installer's quote accepted)
- [ ] **Icon**: CheckCircle ✅
- [ ] **Priority**: Low (green/success) ✅
- [ ] **Badge**: "Quote Accepted" ✅
- [ ] **Routing**: Opens `/installer/leads/{leadId}` ✅

### 8. QUOTE_REJECTED (Installer's quote rejected)
- [ ] **Icon**: XCircle ✅
- [ ] **Priority**: Urgent (red/error) ✅
- [ ] **Badge**: "Quote Rejected" ✅

### 9. NEW_MESSAGE (User receives message)
- [ ] **Icon**: MessageSquare ✅
- [ ] **Priority**: High (orange/accent - requires response) ✅
- [ ] **Badge**: "New Message" ✅
- [ ] **Action Button**: "Reply" ✅
- [ ] **Routing**: Opens messaging page or thread ✅

### 10. PAYMENT_RECEIVED (Installer payment received)
- [ ] **Icon**: DollarSign ✅
- [ ] **Priority**: Low (green/success) ✅
- [ ] **Badge**: "Payment Received" ✅
- [ ] **Message**: Shows payment amount ✅

### 11. PAYMENT_FAILED (Payment failed)
- [ ] **Icon**: AlertCircle ✅
- [ ] **Priority**: Urgent (red/error - immediate action required) ✅
- [ ] **Badge**: "Payment Failed" ✅
- [ ] **Message**: Includes failure reason ✅

### 12. BID_WON (Installer wins bid)
- [ ] **Icon**: Trophy ✅
- [ ] **Priority**: High (orange/accent - payment deadline) ✅
- [ ] **Badge**: "Bid Won" ✅
- [ ] **Action Button**: "Proceed to Payment" ✅
- [ ] **Routing**: Opens `/installer/leads/{leadId}?action=payment&bidId={bidId}` ✅
  - [ ] Payment modal auto-opens with correct leadId and bidId

### 13. BID_LOST (Installer loses bid)
- [ ] **Icon**: XCircle ✅
- [ ] **Priority**: Urgent (red/error) ✅
- [ ] **Badge**: "Bid Lost" ✅

### 14. BID_SUBMITTED (Homeowner notified of new bid) **NEW in T351**
- [ ] **Icon**: Briefcase ✅
- [ ] **Priority**: High (orange/accent - homeowner should review) ✅
- [ ] **Badge**: "Bid Submitted" ✅
- [ ] **Action Button**: "Review Bids" ✅
- [ ] **Routing**: Opens `/homeowner/leads/{leadId}?modal=reviewBids` ✅
  - [ ] Review Bids modal auto-opens
  - [ ] New bid is visible in list

### 15. SYSTEM (System announcement)
- [ ] **Icon**: Info ✅
- [ ] **Priority**: Info (gray/muted) ✅
- [ ] **Badge**: "System" ✅

### 16. LEAD_REASSIGNED (Lead reassigned to different installer)
- [ ] **Icon**: RefreshCw (arrows cycling) ✅
- [ ] **Priority**: Medium (blue/primary) ✅
- [ ] **Badge**: "Lead Reassigned" ✅

### 17. LEAD_RESOLD (Lead resold to another installer)
- [ ] **Icon**: RefreshCw ✅
- [ ] **Priority**: Info (gray/muted) ✅
- [ ] **Badge**: "Lead Resold" ✅

### 18. ASSIGNMENT_REMOVED (Assignment removed from installer)
- [ ] **Icon**: UserMinus ✅
- [ ] **Priority**: Urgent (red/error) ✅
- [ ] **Badge**: "Assignment Removed" ✅

### 19. ASSIGNMENT_ACCEPTED_COMPETITIVE (Competitive assignment accepted)
- [ ] **Icon**: CheckCircle ✅
- [ ] **Priority**: High (orange/accent) ✅
- [ ] **Badge**: "Assignment Accepted" ✅

---

## Theme Testing (ALL 3 Themes Required)

### Dark Theme (Default)
- [ ] All notification icons visible and properly colored
- [ ] Priority colors distinct (urgent=red, high=orange, medium=blue, low=green, info=gray)
- [ ] Text readable (foreground/muted-foreground contrast passes)
- [ ] Badge backgrounds not too bright or too dark
- [ ] Hover states work (bg-surface-hover)
- [ ] No console errors

### Light Theme
- [ ] Switch to light theme in settings
- [ ] All colors adapt correctly (no hardcoded dark: classes)
- [ ] Icon colors remain visible on light backgrounds
- [ ] Priority system still distinguishable
- [ ] No WCAG contrast violations

### Purple Theme
- [ ] Switch to purple theme in settings
- [ ] Purple accent color applied to high-priority notifications
- [ ] Purple shadows visible on notification cards
- [ ] All icons remain legible
- [ ] Priority colors maintain hierarchy

---

## Responsive Testing (5 Breakpoints)

### Mobile (320px)
- [ ] Notification dropdown fits screen
- [ ] Icons not cut off
- [ ] Action buttons stack vertically if needed
- [ ] Touch targets ≥44px

### Mobile (375px)
- [ ] Notification cards readable
- [ ] Timestamps don't wrap awkwardly

### Tablet (768px)
- [ ] Dropdown width appropriate
- [ ] Icons and text scale well

### Desktop (1024px)
- [ ] Full layout displays correctly

### Large Desktop (1440px)
- [ ] No excessive whitespace
- [ ] Modal doesn't become too wide

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab to notification bell button
- [ ] Press Enter → Dropdown opens
- [ ] Tab through notifications (focus visible)
- [ ] Press Enter on notification → Routes correctly
- [ ] Press Escape → Dropdown closes

### Screen Reader (ARIA)
- [ ] Bell button has `aria-label="Notifications"`
- [ ] Unread count announced
- [ ] Each notification has proper `role` and labels
- [ ] Action buttons have descriptive `aria-label`

### Contrast Ratios
- [ ] All text passes WCAG 2.1 AA (4.5:1 for normal text)
- [ ] Icons pass 3:1 for graphical objects
- [ ] Priority colors distinguishable for colorblind users

---

## Functional Testing

### Real-Time Updates (Pusher)
- [ ] Create notification via different user → Appears instantly in dropdown
- [ ] Unread count badge updates live
- [ ] No page refresh required
- [ ] Console shows Pusher connection success

### Mark as Read
- [ ] Click notification → isRead becomes true
- [ ] Unread count decreases
- [ ] Visual styling changes (opacity/background)
- [ ] Database updated (check via Prisma Studio)

### Routing Validation (T358)
- [ ] Invalid actionUrl → Fallback to safe default (no 404 crash)
- [ ] Role mismatch → Validates and corrects (installer can't access homeowner routes)
- [ ] Missing leadId/bidId → Handles gracefully

### Action Buttons (T357)
- [ ] BID_WON → "Proceed to Payment" button appears
- [ ] BID_SUBMITTED → "Review Bids" button appears
- [ ] NEW_MESSAGE → "Reply" button appears
- [ ] Other types → Generic "View" button (or no button if no actionUrl)

---

## Browser Console Check

### No Errors Expected
- [ ] No React warnings (keys, props, deprecated APIs)
- [ ] No TypeScript errors
- [ ] No network errors (all API calls return 200/201)
- [ ] No Pusher connection errors

### Network Tab
- [ ] POST `/api/notifications/mark-read` → 200 OK
- [ ] Notification creation → 201 Created
- [ ] Pusher WebSocket connected

---

## Edge Cases

### Empty State
- [ ] No notifications → Shows "No new notifications" message
- [ ] Message uses text-body-small (not hardcoded text-sm)

### High Volume
- [ ] 50+ notifications → Scrollable list
- [ ] Performance acceptable (no lag)
- [ ] "View all notifications" link appears

### Long Text
- [ ] Notification with very long message → Truncates gracefully
- [ ] No layout breaks

### Missing Data
- [ ] Notification with null actionUrl → No button shown, no crash
- [ ] Notification with invalid type → Falls back to default icon/priority

---

## Design System Compliance Verification

Run these 6 commands in PowerShell:

```powershell
# Should all return 0
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "text-gray-|text-slate-|bg-gray-|border-gray-" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "dark:text-|dark:bg-|dark:border-" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "rgba\(|rgb\(|#[0-9a-fA-F]{3,6}" | Where-Object { $_.Line -notmatch "viewBox|fill=|d=" } | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "text-white\b|bg-white\b|text-black\b|bg-black\b" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "bg-(blue|green|red|yellow|purple)-[0-9]|text-(blue|green|red)-[0-9]" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src\components\NotificationDropdown.tsx" -Pattern "text-xs|text-sm|text-lg|text-xl|font-bold|font-semibold|font-medium" | Measure-Object | Select-Object -ExpandProperty Count
```

**Expected**: 0/0/0/0/0/0 ✅

---

## Test Results Summary

| Category | Pass | Fail | Notes |
|----------|------|------|-------|
| All 20 notification types | [ ] | [ ] | |
| Theme testing (3 themes) | [ ] | [ ] | |
| Responsive (5 breakpoints) | [ ] | [ ] | |
| Accessibility (keyboard, ARIA) | [ ] | [ ] | |
| Real-time updates (Pusher) | [ ] | [ ] | |
| Routing validation (T358) | [ ] | [ ] | |
| Action buttons (T357) | [ ] | [ ] | |
| Design system (0/0/0/0/0/0) | [ ] | [ ] | |
| Browser console (0 errors) | [ ] | [ ] | |
| Edge cases | [ ] | [ ] | |

---

## Issues Found

| Issue ID | Description | Severity | Status |
|----------|-------------|----------|--------|
| Example: N13M-001 | BID_WON routing opens wrong page | Critical | Fixed |
| | | | |

---

## Sign-Off

- **Tester Name**: _______________
- **Date**: _______________
- **Result**: ☐ PASS ☐ FAIL ☐ CONDITIONAL PASS
- **Ready for Production**: ☐ YES ☐ NO

**Notes**:

# Feature Specification: Lead Expiry Countdown Timer

**Feature Branch**: `003-countdown-timer-for`  
**Created**: October 22, 2025  
**Status**: Draft  
**Input**: User description: "Countdown Timer for Lead Expiry Feature - When admin approves leads, add 7-day countdown timer visible to admin, homeowner, and installers. Admin controls: add/remove/reset timer, set custom days. Auto-expire leads after countdown. Bidding leads keep timer until expiry, purchased leads (call/visit/written) turn off timer. Timer colors: green (5+ days), red (2 days). Admin can reactivate expired leads with new timer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Approves Lead with Countdown Timer (Priority: P1)

Admin reviews a pending lead and approves it with a customizable countdown timer. Upon approval, the system creates an expiry countdown (default 7 days) that is visible to the homeowner and any installers viewing the lead. The admin can choose to enable or disable the timer during approval, and set custom expiry duration.

**Why this priority**: Core feature that directly impacts lead lifecycle management and creates urgency for installers to act on leads before expiry.

**Independent Test**: Admin logs in → navigates to pending leads → selects a lead → clicks "Approve" → sees option to enable countdown timer with default 7 days → modifies to 10 days → approves → lead shows countdown timer on all dashboards (admin, homeowner).

**Acceptance Scenarios**:

1. **Given** admin is viewing a pending lead, **When** admin clicks "Approve" and enables countdown timer with default 7 days, **Then** lead is approved with status APPROVED, expiresAt is set to 7 days from now, countdown timer appears on lead card
2. **Given** admin is approving a lead, **When** admin sets custom countdown duration to 10 days, **Then** lead expiresAt is set to 10 days from now, timer shows "10 days left"
3. **Given** admin is approving a lead, **When** admin chooses to approve without countdown timer, **Then** lead is approved with expiresAt as null, no countdown timer appears
4. **Given** lead has 6 days remaining, **When** homeowner views their dashboard, **Then** countdown timer shows "6 days left" in green color
5. **Given** lead has 2 days remaining, **When** installer views the lead, **Then** countdown timer shows "2 days left" in red color

---

### User Story 2 - Automatic Lead Expiry (Priority: P1)

Leads with countdown timers automatically expire when the countdown reaches zero. The system updates lead status to EXPIRED, removes lead from public visibility (for installers), and notifies homeowner and admin of expiry.

**Why this priority**: Essential for maintaining data integrity and automating lead lifecycle without manual intervention.

**Independent Test**: Create approved lead with 1-day countdown → wait 24+ hours (or run cron job) → verify lead status changes to EXPIRED → verify lead no longer appears in installer marketplace → verify homeowner receives expiry notification.

**Acceptance Scenarios**:

1. **Given** lead countdown reaches 0 days, **When** system cron job runs, **Then** lead status changes from APPROVED to EXPIRED, visibility changes to HIDDEN
2. **Given** lead has just expired, **When** homeowner views their dashboard, **Then** lead shows status "Expired" with no countdown timer, homeowner sees option to request reactivation
3. **Given** lead has expired, **When** installer searches marketplace, **Then** expired lead does NOT appear in search results
4. **Given** lead expires, **When** expiry occurs, **Then** homeowner receives notification "Your lead for [location] has expired after [X] days"
5. **Given** lead is expired, **When** admin views leads list, **Then** expired lead appears with status EXPIRED and option to reactivate

---

### User Story 3 - Countdown Timer Auto-Disable on Purchase (Priority: P2)

When an installer purchases a CALL_VISIT or WRITTEN_QUOTE lead, the countdown timer automatically turns off. The lead remains active for that installer without time pressure. However, BIDDING leads retain the countdown timer until expiry or admin manually removes it.

**Why this priority**: Purchased leads should not expire while installer is working on them, but bidding leads need time constraints to maintain competitive urgency.

**Independent Test**: Installer purchases a CALL_VISIT lead with 5 days remaining → countdown timer disappears from installer's view → lead remains active indefinitely → installer can submit quote anytime. Separately, BIDDING lead with 5 days keeps timer visible to all bidding installers.

**Acceptance Scenarios**:

1. **Given** CALL_VISIT lead with 5 days countdown, **When** installer purchases lead, **Then** countdown timer disappears from all views, expiresAt is set to null, lead remains PURCHASED status
2. **Given** WRITTEN_QUOTE lead with 3 days countdown, **When** installer purchases lead, **Then** countdown timer turns off, lead remains active for installer
3. **Given** BIDDING lead with 4 days countdown, **When** installer submits a bid, **Then** countdown timer continues to display for all users, bid submission does not affect timer
4. **Given** BIDDING lead countdown reaches 0, **When** system expires lead, **Then** all bids are closed, lead becomes EXPIRED, no more bids accepted
5. **Given** purchased lead has timer disabled, **When** homeowner views lead, **Then** no countdown timer shown, status shows "Purchased by [Installer]"

---

### User Story 4 - Admin Manages Countdown Timers (Priority: P2)

Admin has full control to add, remove, reset, or adjust countdown timers for any lead at any time. This includes reactivating expired leads with new countdown timers, extending active timers, or removing timers entirely.

**Why this priority**: Provides flexibility for exceptional cases, homeowner requests, or business rule adjustments without developer intervention.

**Independent Test**: Admin views lead details → sees countdown timer controls → clicks "Reset Timer" → sets new duration (e.g., 14 days) → timer updates → homeowner sees new countdown. Admin can also remove timer entirely or reactivate expired lead with new timer.

**Acceptance Scenarios**:

1. **Given** approved lead with 2 days remaining, **When** admin clicks "Reset Timer" and sets 7 days, **Then** lead expiresAt is updated to 7 days from now, countdown shows "7 days left"
2. **Given** approved lead with active countdown, **When** admin clicks "Remove Timer", **Then** expiresAt is set to null, countdown timer disappears from all views
3. **Given** expired lead, **When** admin clicks "Reactivate" and sets 7 days countdown, **Then** lead status changes from EXPIRED to APPROVED, expiresAt is set to 7 days from now, visibility restored to PUBLIC
4. **Given** admin is reactivating expired lead, **When** admin sets custom 14 days countdown, **Then** lead shows "14 days left" countdown timer
5. **Given** admin removes countdown timer, **When** homeowner views lead, **Then** no countdown timer displayed, lead remains active indefinitely until manually changed

---

### User Story 5 - Visual Countdown Display (Priority: P3)

Countdown timer appears as a visual progress bar at the top of lead cards on all dashboards (admin, homeowner, installer). Color coding provides quick visual feedback: green (5+ days), yellow (3-4 days), red (1-2 days). Timer displays in human-readable format: "7 days left", "1 day left", "< 1 day left".

**Why this priority**: Enhances user experience and creates visual urgency, but core functionality works without sophisticated UI.

**Independent Test**: View leads with different time remainings → 7 days shows green bar "7 days left" → 4 days shows yellow bar "4 days left" → 1 day shows red bar "1 day left" → colors and text update correctly.

**Acceptance Scenarios**:

1. **Given** lead has 7 days remaining, **When** user views lead card, **Then** countdown bar is green, text shows "7 days left", bar is 100% full
2. **Given** lead has 4 days remaining, **When** user views lead card, **Then** countdown bar is yellow, text shows "4 days left", bar shows ~57% progress
3. **Given** lead has 1 day remaining, **When** user views lead card, **Then** countdown bar is red, text shows "1 day left", bar shows ~14% progress
4. **Given** lead has less than 1 day remaining, **When** user views lead card, **Then** countdown bar is red, text shows "< 1 day left", bar is nearly empty
5. **Given** lead has no countdown timer, **When** user views lead card, **Then** no countdown bar or timer text is displayed

---

---

### Edge Cases

- What happens when countdown timer reaches 0 while installer is viewing the lead? → Lead status updates to EXPIRED immediately, installer sees real-time update (via Pusher) or on next page refresh
- How does system handle timezone differences for expiry calculation? → All expiresAt timestamps stored in UTC, countdown calculation happens on server, displayed relative to server time
- What if admin reactivates expired lead but forgets to set countdown timer? → Default 7 days countdown applied automatically (configurable via settings)
- Can homeowner request timer extension? → No direct control, homeowner can contact admin who has full timer management controls
- What happens if cron job fails to run and lead should have expired? → Next cron job run will catch all overdue leads and expire them, also checked on-demand when lead is accessed
- What if admin approves multiple leads simultaneously with different countdown durations? → Each lead has independent expiresAt timestamp, timers calculate individually
- What happens to countdown timer if lead is flagged or cancelled? → Timer becomes irrelevant, lead is removed from public view, status takes precedence over countdown

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admin to enable/disable countdown timer when approving a lead
- **FR-002**: System MUST set default countdown duration of 7 days if admin enables timer without specifying custom duration
- **FR-003**: Admin MUST be able to set custom countdown duration (1-90 days) when approving or reactivating a lead
- **FR-004**: System MUST display countdown timer on lead cards for admin, homeowner, and installers (when lead is visible to them)
- **FR-005**: Countdown timer MUST show remaining time in days format: "X days left", "1 day left", "< 1 day left"
- **FR-006**: Countdown timer MUST use color coding: green (6+ days), yellow (3-5 days), red (1-2 days)
- **FR-007**: System MUST automatically expire leads when countdown reaches 0 (via scheduled cron job)
- **FR-008**: System MUST change lead status from APPROVED to EXPIRED when countdown expires
- **FR-009**: System MUST set lead visibility to HIDDEN when lead expires (removes from installer marketplace)
- **FR-010**: System MUST send notification to homeowner when their lead expires
- **FR-011**: System MUST automatically disable countdown timer when installer purchases CALL_VISIT or WRITTEN_QUOTE lead
- **FR-012**: System MUST retain countdown timer for BIDDING leads even after installers submit bids
- **FR-013**: Admin MUST be able to reset countdown timer for any lead to new duration
- **FR-014**: Admin MUST be able to remove countdown timer from any lead (set indefinite expiry)
- **FR-015**: Admin MUST be able to reactivate expired leads with new countdown timer
- **FR-016**: System MUST track countdown expiry timestamp (expiresAt) in UTC for each lead
- **FR-017**: System MUST validate countdown duration is between 1 and 90 days when set by admin
- **FR-018**: System MUST create audit log entry when countdown timer is added, reset, or removed
- **FR-019**: System MUST show "Expired" status badge on lead cards when countdown reaches 0
- **FR-020**: System MUST allow admin to approve lead without countdown timer (expiresAt remains null)

### Key Entities

- **Lead**: Existing entity with new fields - `expiresAt` (optional timestamp for countdown expiry), `countdownEnabled` (boolean flag, derived from expiresAt !== null)
- **LeadStatus**: Existing enum already includes EXPIRED status
- **AuditLog**: Existing entity logs countdown timer management actions (timer_added, timer_reset, timer_removed, lead_reactivated)
- **Notification**: Existing entity sends expiry notifications to homeowners
- **Setting**: Global setting for default countdown duration (LEAD_COUNTDOWN_DEFAULT_DAYS = 7)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can approve leads with countdown timer in under 30 seconds, including custom duration selection
- **SC-002**: 100% of leads with countdown timers automatically expire when timer reaches 0 (verified by cron job execution logs)
- **SC-003**: Countdown timer visibility is consistent across all dashboards (admin sees same time remaining as homeowner and installer)
- **SC-004**: 90% of installers see countdown timer as motivating factor to act faster on leads (measured via feedback survey)
- **SC-005**: Purchased CALL_VISIT and WRITTEN_QUOTE leads have countdown timer disabled within 1 second of purchase
- **SC-006**: Expired leads are removed from installer marketplace within 1 hour of expiry (cron job runs hourly)
- **SC-007**: Admin can reactivate expired lead with new countdown timer in under 20 seconds
- **SC-008**: Color-coded countdown timers (green/yellow/red) display correctly for 100% of leads with active timers
- **SC-009**: System handles 1000+ concurrent leads with countdown timers without performance degradation
- **SC-010**: Zero data loss - all countdown timer changes are audit logged with timestamp and admin ID

## Assumptions

- **A-001**: Existing Lead model has `expiresAt` field (already present in schema, currently set to 30 days on approval)
- **A-002**: LeadStatus enum includes EXPIRED status (verified in schema)
- **A-003**: System has scheduled cron job infrastructure for periodic tasks (verified in lead-state.ts checkAllExpiredLeads function)
- **A-004**: Pusher real-time updates are configured for live countdown updates (existing infrastructure)
- **A-005**: Admin approval flow exists at `/api/leads/[id]/approve` (verified)
- **A-006**: Countdown calculation happens on server to avoid client timezone issues
- **A-007**: Default expiry is currently 30 days (retrieved from settings), new default will be 7 days for countdown timer
- **A-008**: Countdown timer is optional - admin can approve without timer (expiresAt = null means no expiry)
- **A-009**: BIDDING quote type is distinct from CALL_VISIT and WRITTEN_QUOTE (verified in schema: LeadQuoteType enum)
- **A-010**: Lead purchase API exists and sets status to PURCHASED (verified in lead-service.ts)

## Dependencies

- **D-001**: Prisma schema Lead model (already has expiresAt field)
- **D-002**: Existing admin approval UI (`src/app/admin/leads/[id]/page.tsx`)
- **D-003**: Lead state transition service (`src/lib/services/lead-state.ts`)
- **D-004**: Cron job execution environment (scheduled tasks or Vercel Cron)
- **D-005**: Notification service for expiry alerts
- **D-006**: Settings service for default countdown duration
- **D-007**: Audit logging service for countdown timer actions

## Out of Scope

- **OOS-001**: Email reminders sent 24 hours before expiry (future enhancement)
- **OOS-002**: SMS notifications for lead expiry (future enhancement)
- **OOS-003**: Countdown timer in hours/minutes for final day (current: days only)
- **OOS-004**: Installer-initiated timer extension requests (admin-only control)
- **OOS-005**: Automatic timer extension based on bid activity (BIDDING leads)
- **OOS-006**: Historical countdown timer changes in UI (audit log only)
- **OOS-007**: Bulk countdown timer management for multiple leads (one at a time)
- **OOS-008**: Custom color coding thresholds (fixed: green 6+, yellow 3-5, red 1-2)

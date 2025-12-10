# Feature Specification: CALL_VISIT Lead Purchase Flow

**Feature Branch**: `007-call-visit-lead`  
**Created**: 2025-11-24  
**Status**: Draft  
**Input**: "CALL_VISIT lead purchase flow specification: Backend enforced purchase endpoint, server-driven masking, removal of mock data, atomic purchase, audit logging, unified installer feed cards, acceptance criteria from CALL-VISIT-LEAD-PLAN.md and gaps from LEADFEED-AUDIT.md"

## Overview & Scope
Enable reliable, backend-enforced purchase of CALL_VISIT leads within the unified installer feed. Replace mock/local unlock logic with a real atomic purchase endpoint, guarantee single-installer ownership, server-driven contact masking, audit logging, and consistent UI states (available / purchased-by-me / purchased-by-other / unavailable). Excludes WRITTEN_QUOTE and BIDDING flows, messaging, resell, or multi-channel notifications.

## Actors
- Verified Installer
- Admin
- Homeowner (passive status reflection only)

## Assumptions
- Lead status before purchase is APPROVED.
- Price set by admin; contact masked until purchase.
- Existing payment/credit logic internal to endpoint (not detailed here).

## Out of Scope
- Quote/bid flows, resell, chat, notifications.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available CALL_VISIT Lead (Priority: P1)
Installer views an APPROVED CALL_VISIT lead card showing summary (price, postcode, property info) with masked contact details and a Purchase CTA.
**Why this priority**: Baseline visibility is prerequisite for purchase.
**Independent Test**: Seed APPROVED lead; installer loads feed; sees masked card + purchase button.
**Acceptance Scenarios**:
1. **Given** an APPROVED CALL_VISIT lead, **When** installer loads feed, **Then** card shows masked contact and active Purchase CTA.
2. **Given** a CANCELLED lead, **When** feed loads, **Then** lead absent or disabled.

---

### User Story 2 - Purchase CALL_VISIT Lead (Priority: P2)
Installer confirms purchase; backend atomically assigns and returns unmasked contact.
**Why this priority**: Core monetization action.
**Independent Test**: Execute purchase endpoint; verify status/ownership/contact update.
**Acceptance Scenarios**:
1. **Given** APPROVED unpurchased lead, **When** installer confirms purchase, **Then** response has unmasked contact + status PURCHASED.
2. **Given** two simultaneous purchase attempts, **When** they execute, **Then** exactly one succeeds; other gets conflict.
3. **Given** successful purchase, **When** feed reloads, **Then** card shows purchased badge + contact.

---

### User Story 3 - Display Purchased-by-Other State (Priority: P3)
Non-purchasing installer sees disabled state and badge.
**Why this priority**: Prevents redundant attempts.
**Independent Test**: Seed purchased lead by installer A; installer B loads feed.
**Acceptance Scenarios**:
1. **Given** lead purchased by another, **When** I load feed, **Then** disabled card + badge is shown.
2. **Given** purchaser loads feed, **Then** full contact visible.

---

### User Story 4 - Handle Post-Purchase Cancellation/Archival (Priority: P4)
Lead becomes unavailable after admin/homeowner cancellation/archival.
**Why this priority**: Lifecycle integrity.
**Independent Test**: Archive purchased lead; verify visibility changes.
**Acceptance Scenarios**:
1. **Given** purchased lead archived, **When** non-purchaser loads feed, **Then** card gone.
2. **Given** purchased lead archived, **When** purchaser loads feed, **Then** lead hidden (assumed) or marked inactive per policy.

---

### Edge Cases
- Simultaneous purchase attempts.
- Status change during confirmation.
- Missing price value.
- Expiry reached mid-view.
- High latency causing optimistic mismatch.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Provide `POST /api/installer/leads/{id}/purchase` endpoint enforcing atomic single purchase.
- **FR-002**: Return masked contact for non-purchasers; unmasked after successful purchase for purchaser.
- **FR-003**: Enforce single-purchase constraint (conflict error on second attempt).
- **FR-004**: Log all purchase attempts (success/failure) with leadId, installerId, timestamp.
- **FR-005**: Update status → PURCHASED and set `purchasedAt`.
- **FR-006**: Derive card states solely from backend fields (no local unlock arrays).
- **FR-007**: Block purchase if status not APPROVED or lead expired/cancelled/archived.
- **FR-008**: Surface `leadPrice` and property fields directly from backend (no placeholders).
- **FR-009**: Provide clear conflict error message when already purchased.
- **FR-010**: Disable purchase if `expiresAt` passed (when provided).
- **FR-011**: Reflect archival/cancellation within next feed refresh (<30s).
- **FR-012**: Remove all mock data constructs (e.g., `mockLeads`).
- **FR-013**: Expose or enable derivation of permission flag `canPurchase`.

### Key Entities
- **Lead**: id, status, quoteType, leadPrice, purchasedAt, installerId, property fields, expiresAt (optional).
- **Purchase Log Entry**: leadId, installerId, timestamp, outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 100% successful purchases set PURCHASED + `purchasedAt` within 1s (dev baseline).
- **SC-002**: Concurrent purchase race always yields 1 success + ≥1 conflict, 0 double assignments.
- **SC-003**: 0 instances of unmasked contact for non-purchasers in test suite.
- **SC-004**: 95% purchase responses <800ms (dev baseline).
- **SC-005**: Audit log coverage = 100% of attempts.
- **SC-006**: Static analysis finds 0 occurrences of `mockLeads` after implementation.
- **SC-007**: Card state accuracy ≥99% across 100 randomized verification scenarios.
- **SC-008**: Cancellation/archival reflected within one refresh (<30s) in ≥95% tests.

## Open Clarifications
None (defaults applied; no critical ambiguity).

## Risks & Mitigations
- Race conditions → Atomic DB update + conflict response.
- Stale UI → Encourage periodic polling or manual refresh until real-time added.
- Missing price → Fail purchase with explicit error.

## Dependencies
- Existing Lead schema fields & audit logging infrastructure.

## Edge Case Handling Summary
- Simultaneous purchase: First wins; others conflict.
- Status change mid-flow: Modal confirms error; no assignment.
- Expired lead: Disabled state; no purchase.

## Exit Criteria
All SC-001–SC-008 met; all FR-001–FR-013 implemented; no mock data; ready for planning.

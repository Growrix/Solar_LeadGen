# Notifications + Emails — Industry Gaps & Implementation Plan

Date: 2025-12-27
Scope: In-app notifications (dropdown + /notifications page), realtime push payloads, and email CTAs across roles (HOMEOWNER / INSTALLER / ADMIN).

## Executive Summary
The system is trending toward an industry-standard design via normalized notification routing (`routeKey` + `routeParams`) and centralized copy (`messageKey`). The remaining gaps are mostly about governance and consistency: preventing homeowner trust violations everywhere (including CTA labels/badges), ensuring every notification deep-links to the exact relevant context, and adding reliability/observability and user controls typical of mature notification systems.

## Current State (What’s already in place)
- Normalized navigation exists via `routeKey` + `routeParams` resolved centrally.
- Notification copy can be hydrated via `messageKey` through the message catalog.
- Deep-link patterns exist for homeowner modals (e.g., dashboard query params).
- Email CTA URLs are now built from resolved route paths (not raw route keys).

## Key Gaps vs Industry Standards + Our SOT

### 1) Copy Governance & Role Safety (High)
**Problem:** Homeowner-facing UI surfaces can still drift into forbidden monetization language unless all surfaces (CTA labels, badges, titles, bodies) share one role-safe source.

**Why it matters:** Your Messaging Standards explicitly forbid homeowner-facing “Lead / Purchase / Payment” terms.

**Remediation direction:**
- Centralize CTA label selection and badge/type label selection (same function used by dropdown + /notifications page + email CTA).
- Add an automated check that fails CI if homeowner UI strings contain forbidden terms.

### 2) Event Taxonomy / Semantics (High)
**Problem:** Some events use operational types like `LEAD_PURCHASED` even when the homeowner-safe meaning is “details available / connection ready”. This is workable short-term if UI uses `messageKey` + role, but it increases long-term risk.

**Remediation direction:**
- Treat `messageKey` as the semantic “meaning” for copy.
- Optionally introduce homeowner-safe event types (or a `category`/`intent` field) so UI doesn’t infer meaning from operational enums.

### 3) Deep Linking Completeness (High)
**Problem:** Any notification that routes to a generic dashboard instead of the relevant record/modal is perceived as “broken”.

**Remediation direction:**
- Require `routeKey` for all new notifications; treat `actionUrl` as legacy-only.
- Require `routeParams` completeness (e.g., `leadId`) for events tied to a specific lead/quote.
- Add a lightweight runtime validator (or logging) that flags notifications missing required params.

### 4) Cross-Channel Consistency (Medium)
**Problem:** In-app CTA labels can diverge from email CTA labels and push payload expectations.

**Remediation direction:**
- Single “notification presentation” function:
  - `getTitleAndBody(messageKey, role)`
  - `getCtaLabel(type, messageKey, role)`
  - `resolveRoute(routeKey, params)`
- Keep the UI as a renderer of that normalized presentation.

### 5) Reliability, Idempotency, and Dedupe (Medium)
**Typical industry expectations:**
- Idempotent notification creation (avoid duplicates on retries).
- Per-event dedupe windows (e.g., don’t send 5 near-identical updates).
- Retry/backoff for email provider failures.

**Remediation direction:**
- Add idempotency keys for notification creation for key workflows.
- Add dedupe logic by `(recipientId, messageKey, routeKey, routeParamsHash)` within a time window.

### 6) User Controls / Preferences (Medium)
**Typical industry expectations:**
- Notification preferences per channel (in-app/email) and category.
- Quiet hours / rate limiting.

**Remediation direction:**
- Add preference storage and enforce it in the notification service.
- Provide a simple UI entry point later (can start with defaults).

### 7) Observability & QA Tooling (Medium)
**Problem:** It’s hard to know when notifications are “functionally broken” until a user reports it.

**Remediation direction:**
- Log route resolver failures and missing params.
- Add a nightly/CI script that:
  - scans homeowner-facing UI label sources for forbidden terms
  - verifies every routeKey used is valid
  - reports unknown routeKeys

## Implementation Plan (Phased)

### Phase 0 — Guardrails (1–2 hours)
- Add a script that scans homeowner-facing notification UI label sources for forbidden terms.
- Add a script that scans for unknown `routeKey` usage (must match resolver).

### Phase 1 — Normalize All Producers (0.5–1 day)
- Update remaining notification creators to always set `messageKey`, `routeKey`, and required `routeParams`.
- Reduce reliance on `actionUrl` (keep for legacy only).

### Phase 2 — Centralize Presentation (0.5–1 day)
- Create a single shared helper used by:
  - dropdown notification CTA label
  - /notifications CTA label
  - email CTA label (already resolves URL; align label logic too)
  - optional type badge label

### Phase 3 — Reliability & Dedupe (1–2 days)
- Add idempotency keys and dedupe window rules.
- Add provider retry/backoff (email) where safe.

### Phase 4 — Preferences + Analytics (2–4 days)
- Add preference model + defaults.
- Track email sent/open/click where available.
- Track in-app click-through per notification type/messageKey.

## Acceptance Criteria
- Homeowner-facing notification UI shows **zero** forbidden terms (“lead/purchase/payment/paid/invoice/bought/sold/resold”).
- Every notification with a specific record opens the correct destination (detail page or specific modal) without manual searching.
- Email CTAs always resolve to valid app URLs and match the in-app CTA intent.
- Route resolver failures are logged with enough context to fix quickly.

## Notes
- This plan intentionally keeps scope tight: it focuses on making existing notifications consistently actionable and policy-safe before adding new UX surfaces.

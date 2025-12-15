# Notification System — Deep Audit and Redesign Spec (Plan Only)

Status: Planning artifacts for review. No implementation performed.

## 1) Audit Summary
- Issues observed:
  - Homeowner "View" button sometimes routes to 404.
  - Deprecated destinations (e.g., marketplace) still referenced by backend actionUrls.
  - Payment CTA surfaced on lead detail while actual payment banner logic is in feed.
  - Banned words for homeowners: lead, purchased, paid.
  - No Admin notification bell/center parity.

## 2) Notification Sources (Backend)
- API routes/services creating notifications (representative; verify exact files in codebase during implementation approval):
  - Approve Lead: `src/app/api/leads/[id]/approve/route.ts` — creates "new opportunity" for installers.
  - Select Bid Winner: `src/app/api/bids/[bidId]/select/route.ts` — creates winner/loser notifications.
  - Other lifecycle events: lead assignment window start/end (Admin), installer responses (bids/quotes).

Risk: Several places embed hardcoded `actionUrl`, causing divergence from UI expectations.

## 3) Frontend Touchpoints
- NotificationDropdown and Notification Center Modal/Card.
- Installer feed (`/installer/leads`) contains payment banner logic for BID_WON.
- Homeowner review bids modal shows responses; tone must be service-friendly.

## 4) Role–Action Matrix (Canonical)

| Role | Action Type | Intent | Destination (routeKey) |
|------|-------------|--------|-------------------------|
| Admin | ASSIGNMENT_WINDOW_STARTED | Track assignment lifecycle | admin.dashboard |
| Admin | ASSIGNMENT_WINDOW_ENDED | Review installer responses | admin.dashboard |
| Admin | LEAD_CONFIG_UPDATED | Confirm changes saved | admin.lead.manage |
| Installer | NEW_OPPORTUNITY | See new request in feed | installer.leads |
| Installer | BID_WON | Proceed to payment banner in feed | installer.leads |
| Installer | BID_OUTCOME_NOT_SELECTED | Polite outcome message | installer.leads |
| Installer | DATA_UPDATE | Review updated request details | installer.leads |
| Homeowner | REQUEST_RECEIVED | Acknowledge receipt | homeowner.requests |
| Homeowner | RESPONSES_AVAILABLE | Review bids/responses | homeowner.requests.review |
| Homeowner | SELECTION_CONFIRMED | Next steps messaging | homeowner.requests |

Expanded mapping with `routeParams` examples:

| Role | Action | routeKey | routeParams (example) |
|------|--------|----------|-----------------------|
| Installer | BID_WON | installer.leads | { leadId: "L123", bidId: "B789" } |
| Installer | BID_OUTCOME_NOT_SELECTED | installer.leads | { leadId: "L124", bidId: "B790" } |
| Homeowner | RESPONSES_AVAILABLE | homeowner.requests.review | { requestId: "R456" } |
| Admin | LEAD_CONFIG_UPDATED | admin.lead.manage | { leadId: "L123" } |

Notes:
- Destination pages are validated by `routeKey` resolver; actual URLs resolved per role.
- Avoid detail-page routing when required UI exists in the feed.

## 5) Routing Policy (Validated Keys)

| routeKey | Role | Resolved Path (example) |
|----------|------|-------------------------|
| admin.dashboard | Admin | /admin/dashboard |
| admin.lead.manage | Admin | /admin/leads |
| installer.leads | Installer | /installer/leads |
| homeowner.requests | Homeowner | /homeowner/requests |
| homeowner.requests.review | Homeowner | /homeowner/requests/review |

All routing happens through a resolver; unknown/deprecated paths are rejected.

## 6) Homeowner Message Catalog (Banned Words Avoided)

| messageKey | Example Copy |
|------------|--------------|
| homeowner.request.received | Your request is received. We’ll keep you updated. |
| homeowner.responses.available | New installer responses are ready. Compare and choose. |
| homeowner.selection.confirmed | Selection confirmed. You can message your installer anytime. |
| homeowner.appointment.suggested | An installer suggested next steps. Review and confirm. |

## 7) Installer Message Catalog

| messageKey | Example Copy |
|------------|--------------|
| installer.new.opportunity | A new homeowner request is available in your feed. |
| installer.bid.won | You won this bid. Please proceed to payment to unlock contact details. |
| installer.bid.outcome.other | This bid was awarded to another installer. Better luck next time! |
| installer.data.update | The request details were updated. Review in your feed. |

## 8) Admin Message Catalog

| messageKey | Example Copy |
|------------|--------------|
| admin.assignment.started | Assignment window started for a request. Track responses. |
| admin.assignment.ended | Assignment window ended. Review responses and decide. |
| admin.config.updated | Configuration updated successfully. |

## 9) Schema Normalization (Plan)
- Replace `actionUrl` with:
  - `messageKey`: selects user-friendly copy
  - `routeKey`: validated destination
  - `routeParams`: contextual IDs (JSON)
  - `recipientUserId`, `role`, `actionType`, timestamps, `isRead`

Message Catalog Keys (master list, cross-role):
- homeowner.request.received
- homeowner.responses.available
- homeowner.selection.confirmed
- homeowner.appointment.suggested
- installer.new.opportunity
- installer.bid.won
- installer.bid.outcome.other
- installer.data.update
- admin.assignment.started
- admin.assignment.ended
- admin.config.updated

## 10) Validation & Guards
- A central resolver translates `routeKey` → actual path per role.
- Prevent deprecated/unknown routes; log audit events for diagnostics.

## 11) Test Plan (Playwright — Notifications Only)
- Route Validation: clicking each notification routes correctly for its role.
- Error Absence: no 404s; BID_WON routes to feed where payment banner exists.
- Tone Checks: homeowner notifications contain no banned words.
- Admin Bell Parity: unread counts visible; center opens; routing valid.

### 11.1) Fixtures & Seeding Outline
- Create lightweight test helpers to insert normalized notifications:
  - `role`, `recipientUserId`, `actionType`, `messageKey`, `routeKey`, `routeParams`.
- Seed scenarios:
  - Installer NEW_OPPORTUNITY → `installer.leads`.
  - Installer BID_WON → `installer.leads` with `routeParams: { leadId, bidId }`.
  - Installer BID_OUTCOME_NOT_SELECTED → polite message.
  - Homeowner RESPONSES_AVAILABLE → `homeowner.requests.review`.
  - Admin ASSIGNMENT_WINDOW_ENDED → `admin.dashboard`.
- Cleanup: remove seeded notifications post-test or use isolated test DB.

## 12) Implementation Sequencing (Post-Approval)
1) Create central notification service + schema migration.
2) Update backend sources to use service and remove hardcoded URLs.
3) Update frontend components to consume `messageKey` and resolver.
4) Add Admin bell + center; ensure accessibility and theming.
5) Write Playwright suites + fixtures; run and document results.

### 12.1) Current Code Reference Map (to verify during implementation)
- Backend sources likely to update:
  - `src/app/api/leads/[id]/approve/route.ts` — installer opportunity notifications.
  - `src/app/api/bids/[bidId]/select/route.ts` — winner/loser notifications.
  - Any legacy services under `src/lib` that emit notifications.
- Frontend consumers:
  - `src/components/NotificationDropdown.tsx` (or equivalent).
  - Notification Center modal/card components under `src/components`.
  - Installer feed: `src/app/installer/(dashboard)/leads/page.tsx`.
  - Homeowner requests: `src/app/homeowner/(dashboard)/requests/page.tsx` (or similar).

## 13) Exit Criteria for Redesign Approval
- All catalogs and route table reviewed/approved.
- Resolver contract accepted.
- Playwright coverage plan accepted.

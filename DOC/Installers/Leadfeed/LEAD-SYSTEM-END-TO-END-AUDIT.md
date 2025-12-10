# Lead System End-to-End Audit (Homeowners, Admin, Installers)

Date: 2025-11-24
Scope: Full stack (Frontend modals/components, API routes, service layer, Prisma schema, lifecycle/status transitions, data propagation). This audit documents current state precisely to establish a reliable baseline before any refactor or enhancement. No code changes were performed.

---
## 1. High-Level Architecture Overview

Layer Breakdown:
- UI (Next.js App Router client components) → fetch()/mutations against REST-style API route handlers in `src/app/api/...`.
- API Routes (request validation, role checks) → delegate business logic to service modules in `src/lib/services/*` or direct Prisma operations.
- Service Layer (`lead-service.ts`, `purchase-service.ts`, `countdown-service.ts`, helpers) → encapsulates domain logic: creation validation, submission limits, assignment, purchase, visibility, countdown.
- Persistence (Prisma schema models: `Lead`, `LeadAssignment`, `User`, `Quote`, associated enums) → PostgreSQL via Prisma.
- Cross-cutting: Audit logging (`AuditLog`), Notifications (`Notification`), Settings (`Settings`), Verification flows (Phone & Installer verification models).

Flow Separation:
1. Homeowner Lead Submission & Management (dashboard, instant quote → create lead → edit/preview → status progression).
2. Admin Lead Review & Assignment (approval, pricing, assignment to installers, moderation actions, lifecycle adjustments).
3. Installer Lead Consumption & Actions (assigned feed, purchase/unlock, quoting, bidding - partially implemented / some mock remnants).

---
## 2. Core Data Models (Prisma) & Fields Directly Influencing Flows
Location: `prisma/schema.prisma`

Key Models:
- `User`: Tracks role (HOMEOWNER | INSTALLER | ADMIN), contact info, submission counters (`leadSubmissionCount`, `leadSubmissionLimit`, `biddingLeadsSubmitted`), verification flags (`phoneVerified`, `installerVerified`), onboarding completion, stored name/phone backfilled from first lead.
- `Lead`: Central entity. Fields impacting flow: `status`, `visibility`, `quoteType` (CALL_VISIT | WRITTEN_QUOTE | BIDDING), contact fields (`name`, `phoneNumber`, `phoneVerified`), lifecycle timestamps (`createdAt`, `approvedAt`, `purchasedAt`, `expiresAt`, `cancelledAt`, `archivedAt`, `assignedAt`), commerce (`leadPrice`, `purchaseStatus`, `stripePaymentIntentId`), context (`quoteData` stores full form capture for prefill, commercial/residential distinctions), assignment relations & logs.
- `LeadAssignment`: Multi-installer association for competitive or exclusive assignment. Uniqueness constraint `(leadId, installerId)` prevents duplicates.
- `Quote`: Installer-submitted proposal for WRITTEN_QUOTE or (future) BIDDING expansions. Contains pricing, system details, status transitions.
- `InstallerVerification` / `InstallerProfile`: Source of company metadata displayed in assignment flows, table listings, and filtering.
- `AuditLog`: Trace changes across actions (creation, updates, assignments, purchases) capturing IP/UserAgent when passed through service.

Enums (critical for state machine mapping):
- `LeadStatus`: DRAFT → PENDING_PHONE → PENDING_APPROVAL → APPROVED → PURCHASED → QUOTED → ACCEPTED/REJECTED → EXPIRED/CANCELLED/FLAGGED.
- `LeadQuoteType`: CALL_VISIT | WRITTEN_QUOTE | BIDDING (currently partly collapsed in some UI mapping paths for installers).
- `LeadVisibility`: HIDDEN until admin approval unlocks marketplace exposure.
- `PurchaseStatus`: Tracks payment finalization; sometimes bypassed in dev mode.

Observations:
- `Lead.name`, `Lead.phoneNumber`, `Lead.address` may be inherited from first lead if not provided; ensures continuity for profiles created after sign-up without initial personal data.
- `quoteData` acts as flexible container for extended form attributes not normalized into top-level fields (commercial energy usage, equipment preferences, advanced tariff details).

---
## 3. Service Layer Responsibilities & Data Flow
Location: `src/lib/services/lead-service.ts`

Key functions (partial list based on file inspection):
- `createLead(input: CreateLeadInput)`: Performs quota checks (`leadSubmissionCount`, `biddingLeadsSubmitted`), phone verification gate (`MAX_LEAD_SUBMISSIONS_BEFORE_VERIFICATION`), limit enforcement (`MAX_LEAD_SUBMISSIONS_TOTAL`), default pricing per quote type (`LEAD_PRICE_*` settings), expiry scheduling (`LEAD_EXPIRY_DAYS`), field inheritance (name/phone/address from earliest lead), persists lead with `PENDING_APPROVAL` status + `HIDDEN` visibility. Increments counters and optionally syncs User model contact fields.
- `getHomeownerLeadSummary(userId)`: Produces dashboard summary (recent leads with full prefill context, status breakdown, verification requirement state, bidding quota remaining, countdown expiries). Drives homeowner dashboard rendering, conditional modals (verification, limit reached, distribution).
- `updateLead(...)`: (Imported dynamically in `PATCH /api/leads/[id]` for homeowner edits) Accepts broad form field set including extended attributes; merges into `quoteData` while updating top-level core fields. Guarded by ownership & status (cannot edit after approval).
- `assignLeadToInstallers(...)`: (Used in Admin assign route) Creates `LeadAssignment` records, sets `assignedAt`, stores notes, triggers optional notifications; enforces exclusive vs competitive constraints.
- Additional helpers: inheritance retrieval (`getNameFromFirstLead`, etc.), audit logging triggers, internal settings fetchers, permission checks (`canEditLead`, `canCancelLead`).

Data Flow Example (Homeowner first lead):
UI `InstantQuoteForm` → collects instant quote context → passes structured `quoteData` & standard fields to `POST /api/leads` → `createLead` persists record with price & expiry → response includes lead + updated summary → dashboard updates cards & triggers relevant success modal (e.g., `FirstQuoteSuccessModal`).

---
## 4. API Route Inventory & Role Enforcement

Homeowner-Facing:
- `POST /api/leads` (`src/app/api/leads/route.ts`): Validates presence of `quoteType`, `propertyPostcode`, `location`; instantiates lead via service; returns flags for verification/limit gating.
- `GET /api/leads` (same file): Role-based filtering; query params for marketplace/purchased/assigned toggles (installer usage); homeowner obtains own leads summary list.
- `PATCH /api/leads/[id]` (`src/app/api/leads/[id]/route.ts`): Homeowner full form edit when status still pending; merges extended structure; returns minimal updated fields.

Admin-Facing:
- `POST /api/leads/[id]/approve` / `reject` / `archive` / `unarchive` / `cancel` / `resell` / `reset-timer`: Distinct route handlers (from file search) adjust status, visibility, timers. Price adjustments via `PATCH /api/leads/[id]` with `leadPrice` / `adminNotes`.
- `POST /api/admin/leads/[id]/assign` (`src/app/api/admin/leads/[id]/assign/route.ts`): Validates admin role; enforces `exclusive` vs `competitive` constraints; creates assignments; returns created objects.
- `PATCH /api/leads/[id]` (admin branch): Update `leadPrice` and `adminNotes`—audited.
- `GET /api/admin/homeowners/[id]/lead-limit` (found in search): Adjust or read homeowner lead submission limit (used to tune quotas).

Installer-Facing:
- `GET /api/installer/leads/assigned` (`src/app/api/installer/leads/assigned/route.ts`): Returns assignments with masked contact until purchase; includes countdown computation.
- `POST /api/leads/[id]/purchase` (`src/app/api/leads/[id]/purchase/route.ts`): Initiate/confirm purchase; requires installer role + verification; updates `purchaseStatus`, `purchasedAt`; dev bypass supported.
- Missing (by gap analysis): Marketplace listing endpoints, quoting/bidding submission endpoints, unified lead detail for installers (currently relies on generic `/api/leads/[id]` with role filtering).

Verification & Preferences:
- `POST /api/installer/verification/submit`: Creates or updates installer verification request; auto-bootstraps `InstallerProfile` if absent.

Security / Role Observations:
- Role checks are explicit per route; homeowner editing restricted after approval; installer purchase blocked until `installerVerified` true; admin operations guarded via `UserRole.ADMIN` compare.

---
## 5. Frontend Components by Flow & Their Responsibilities

Homeowner Flow Components (Location: `src/components/homeowner/*` & dashboard page):
- `InstantQuoteForm` / `SimplifiedQuoteForm`: Data capture for system, usage, preferences—feeds `quoteData`.
- `QuoteOptionsModal`, `QuoteTypeDistributionModal`: Orchestrate distribution of remaining quota into multiple lead requests (with bidding count constraints).
- `FirstQuoteSuccessModal`, `ContactVerificationModal`, `OTPVerificationModal`, `LeadLimitReachedModal`: Conditional gating modals; rely on summary flags (e.g., `requiresVerification`, remaining quota, phone verified state).
- `LeadEditModal`: Issues PATCH with comprehensive dataset (maps many UI fields into canonical + `quoteData`). Depends on `recentLeads` prefill snapshot from summary.
- `LeadPreviewModal`: Read-only view of stored lead context.
- Dashboard page: Complex orchestration (1451 lines) mapping summary → interactive UI: status labels, property type iconization, dynamic modals, countdown integration.

Admin Flow Components:
- `AdminLeadManagementModal.tsx` (≈1000 lines): Unified UI shell for approval, pricing, assignment, notes, lifecycle resets, archiving. Performs client-side fetching of installers via `/api/admin/installers/list` (not inspected here but inferred) with filtering by `installerVerified` and postcode heuristics. Maintains local state for selection & confirmation; backend operations passed in via handler props (`onApprove`, `onAssign`, etc.). Data shape includes nested assignments with installer verification sub-objects.
- Related modals (e.g., `InstallerProfileModal`) provide company detail preview using `InstallerVerification` fields: `companyName`, `representativeName`, `postcodes`, `phone`, `status`.

Installer Flow Components:
- `InstallerAssignedLeads.tsx`: Fetches `/api/leads?assigned=true`, offers Accept (POST purchase with `adminAssigned: true` override) for assignment acceptance. Masks homeowner contact until purchase.
- `InstallerLeadFeed.tsx`: Legacy / partially integrated feed with mock leads & client-only unlock simulation. Does not yet reflect real backend states or BIDDING differentiation. Contains `StripeUnlockModal` placeholder payment UX.
- `QuoteBuilderModal` (referenced): For submitting quotes (not fully wired to backend quote endpoint yet).

Cross-cutting UI Observations:
- Semantic class usage improving; some legacy areas (InstallerLeadFeed) using mock or placeholder values (e.g., `quoteType="instant"`).
- BIDDING representation absent in installer feed; distribution modal supports one-time bidding request logic on homeowner side.

---
## 6. Lifecycle & State Machine (Current Behavior vs Intended)

Homeowner Lead Creation:
1. Submit via `POST /api/leads` → status `PENDING_APPROVAL`, visibility `HIDDEN` immediately (no intermediate DRAFT unless separate staging step used elsewhere).
2. If quota exceeded before verification threshold → 403 with `requiresVerification`; no lead created.
3. If total limit reached → 403 with `limitReached`; no lead created.
4. First lead may populate user contact fields (inheritance logic).

Admin Review:
- Approving sets status to `APPROVED`, visibility likely transitions to `PUBLIC` (approval route file not read yet but inferred from naming). Countdown active until expiry; after expiry status may move to `EXPIRED` (service logic not inspected here for auto-expiry job—missing scheduling system mention).
- Pricing can be updated anytime post-creation via PATCH (admin branch) but price initially defaulted from settings.
- Assignment (exclusive or competitive) creates `LeadAssignment` rows; does NOT immediately set `installerId` (purchase does that) but ties relationship for feed listing.

Installer Interaction:
- Assigned leads appear via `GET /api/installer/leads/assigned`; contact masked: `'***LOCKED***'` until purchase.
- Purchase (`POST /api/leads/[id]/purchase` with action) transitions `purchaseStatus` and sets `purchasedAt`; may set `Lead.installerId` (not directly shown but typical). After purchase contact unmasked server-side.
- Quoting for WRITTEN_QUOTE or bidding flows partially missing (no distinct endpoint discovered for quotes creation in audit list; likely planned to use `/api/leads/[id]/quotes`—not present yet).

BIDDING Specific:
- Homeowner distribution supports requesting BIDDING lead (limited to one). Backend enforces `biddingLeadsSubmitted < 1`. Installer side currently collapses BIDDING into WRITTEN or ignores entirely—no specialized lifecycle in UI.

---
## 7. Current Gaps & Pinpoint Issues

Homeowner Side:
- Editing relies on comprehensive PATCH; commercial vs residential specific fields mapping stored only in `quoteData`—future prefill risks if shape changes.
- Verification gating logic only triggers after threshold; no proactive explanation pre-threshold (UX improvement potential).
- Lead cancellation flow present via route but not highlighted in dashboard component snippet (need to confirm invocation logic).

Admin Side:
- Installer filtering by postcode is manual; no dedicated endpoint for proximity or service area matching; done client-side after fetching full list.
- Multi-installer notes: single `assignmentNotes` stored per lead vs per-installer note requirement (spec suggests need for per-installer notes on assignment; current `LeadAssignment.notes` supports this—UI partially aggregates).
- Lifecycle consolidation goal (pricing, assignment, notes, actions in one modal) implemented, but some redundancy remains (multiple states controlling similar timers vs single orchestrator).

Installer Side:
- `InstallerLeadFeed.tsx` still uses mock dataset & local unlock state; misaligned with real purchase/assignment logic—risk of divergence.
- BIDDING not represented: collapsed mapping causes strategic data loss (no UI differentiation, no bid submission path, no countdown differences preserved).
- Quote submission pathway unclear (no `/api/installer/leads/[id]/quotes` route); `QuoteBuilderModal` likely pending integration.
- Residential area display issues stem from placeholder mapping (roofType 'N/A', budget static) rather than API deficiency.

Cross-Cutting:
- No documented scheduled job for auto-expiration → reliance on real-time queries filtering expired leads without status mutation? Potential inconsistency in reporting.
- `expiresAt` enforcement logic not fully audited (reset-timer route exists; actual expiry transition not visible).
- Contact inheritance & syncing logic ensures first lead populates user profile but subsequent user edits vs lead fields may drift (e.g., editing user phone vs lead.phoneNumber). Need reconciliation strategy if divergence allowed.

---
## 8. File Path Mapping Per Flow

Homeowner:
- Dashboard: `src/app/homeowner/dashboard/page.tsx`
- Lead creation: `src/app/api/leads/route.ts` (POST)
- Lead listing summary: same file (GET) + service `getHomeownerLeadSummary`
- Lead edit modal: `src/components/homeowner/LeadEditModal.tsx` → `PATCH /api/leads/[id]`
- Distribution modal: `src/components/homeowner/QuoteTypeDistributionModal.tsx`
- Verification & OTP: `src/components/homeowner/ContactVerificationModal.tsx`, `src/app/api/verification/send-otp`, `verify-otp`

Admin:
- Management modal: `src/components/admin/AdminLeadManagementModal.tsx`
- Assignment API: `src/app/api/admin/leads/[id]/assign/route.ts`
- Lead detail update: `src/app/api/leads/[id]/route.ts` (PATCH admin branch)
- Approval/cancellation/etc: `src/app/api/leads/[id]/*` (approve, reject, archive, unarchive, resell, reset-timer, cancel)

Installers:
- Assigned leads listing: `src/app/api/installer/leads/assigned/route.ts` + UI `src/components/InstallerAssignedLeads.tsx`
- Purchase: `src/app/api/leads/[id]/purchase/route.ts`
- Lead feed (legacy/mock): `src/components/InstallerLeadFeed.tsx`
- Verification submission: `src/app/api/installer/verification/submit/route.ts`

Shared Service Logic:
- Lead business rules: `src/lib/services/lead-service.ts`
- Countdown calculation: `src/lib/services/countdown-service.ts`
- Purchase handling: `src/lib/services/purchase-service.ts` (not opened but referenced)
- Audit logging: `src/lib/services/audit-logger.ts`

---
## 9. Data Field Propagation Examples

Example A: Homeowner Instant Quote → Lead Creation
UI Fields (InstantQuoteForm) → Body (`quoteType`, `propertyPostcode`, `location`, `state`, usage, roof, battery prefs) + `quoteData` wrapper → `createLead()` populates normalized columns & persists extended attributes in `quoteData` for later prefill.

Example B: Admin Assignment
Admin selects installers IDs + mode + notes → `assignLeadToInstallers()` creates `LeadAssignment` rows; countdown unaffected; installers see assigned leads with masked contact until purchase.

Example C: Installer Purchase
Installer calls `POST /api/leads/[id]/purchase` with `action=initiate` (Stripe intent) then `action=confirm` (finalizes) → service updates lead `purchaseStatus`, `purchasedAt`, sets contact unmask condition (returned via assigned GET route mapping).

---
## 10. Current State Reliability & Integrity Assessment

Strengths:
- Role-based access consistently enforced at route layer.
- Lead creation robust with quota & verification gating; pricing/expiry settings externalized via `Settings`.
- Comprehensive audit logging hooks present for admin updates & creation events.
- Contact data inheritance reduces friction for first-time user submissions.

Weaknesses / Technical Debt:
- Installer feed still mock-based leading to mismatch in lifecycle and missing BIDDING UI—highest priority for alignment.
- Missing quote submission endpoints reduce WRITTEN_QUOTE/ BIDDING utility and secondary lifecycle transitions (QUOTED → ACCEPTED).
- Some duplication of logic across route handlers vs service centralization (e.g., admin patch logic partly direct Prisma).
- Lack of automated status transitions for expiry (EXPIRED) may rely on queries instead of state change—needs confirmation.
- Potential divergence between `User.phone` and `Lead.phoneNumber` over time without reconciliation strategy.

---
## 11. Risks Before Enhancement
- Adding new endpoints without first normalizing frontend installer feed can cause dual logic paths.
- Introducing bidding flows without distinct UI separation may confuse installers (currently no differentiation).
- Implementing per-installer notes requires verifying UI writes to `LeadAssignment.notes` not global lead notes.
- Increasing lead visibility without properly filtering expired or cancelled leads can leak stale data to marketplace.

---
## 12. Recommended Next Planning Categories (Not Implementation Yet)
1. Feed Normalization: Replace mock installer feed with real assignments + marketplace listing endpoints.
2. Bidding Enablement: Distinguish BIDDING leads in UI; add quoting/bidding endpoints; enforce acceptance pathway to unmask contact.
3. Quote Submission API: Standardize `POST /api/leads/[id]/quotes` + installer capability checks.
4. Expiry Automation: Confirm or implement scheduled job / cron or on-demand cleanup; reflect EXPIRED status transitions.
5. Data Consistency: Strategy for syncing `User.phone` ↔ latest purchased lead contact when updated (one-directional vs two-directional).
6. Admin Modal Consolidation: Evaluate moving direct Prisma updates inside service for consistency & audit augmentation.

---
## 13. Flow Summaries (Narrative)

Homeowner Flow (Current):
InstantQuote → Distribution (optional multi-type) → `POST /api/leads` (creates PENDING_APPROVAL) → Dashboard shows lead card with countdown & edit/preview until admin approval → After threshold, phone verification gating halts additional submissions until verified → Limit reached triggers limit modal.

Admin Flow (Current):
Views pending leads → Sets price / notes → Approves (status APPROVED, visibility likely PUBLIC) → Assigns installers via `assign` route (creates `LeadAssignment`) → Can reset timer / archive / cancel → Price updates anytime → Resell logic present for reintroducing lead (not inspected detail).

Installer Flow (Current Partial):
Sees `assigned` leads (contact masked) → Accept assignment via purchase route (bypass dev mode supported) → Contact unmasked → (Missing quoting & bidding specialized interactions) → Legacy feed shows mock leads not tied to backend.

---
## 14. Immediate Accuracy Verification Points
- Lead creation path uses `status=PENDING_APPROVAL` (not DRAFT) — confirmed in `createLead`.
- BIDDING quota enforced through `biddingLeadsSubmitted` increment (max 1) — present.
- Contact masking logic for assigned leads determined server-side (`'***LOCKED***'` substitution) — seen in `/api/installer/leads/assigned` mapping.
- Admin price changes do not trigger recalculation of any derived field—simple numeric update only.
- `quoteData` persists full original form for future editing; homeowner edit re-wraps updated values inside new quoteData snapshot.

---
## 15. Open Questions (To Clarify Before Planning Phase)
- Should WRITTEN_QUOTE leads require purchase before contact or only after homeowner accepts a quote?
- BIDDING flow: Is there a timed competitive window requiring all bids before homeowner selection, and how does visibility change then?
- Expiry semantics: Should EXPIRED leads become non-purchasable automatically (is any job marking them EXPIRED or only UI filtering)?
- Resell logic: Conditions under which a purchased lead can be resold (presence of `/api/leads/[id]/resell` suggests secondary marketplace). Need policy details.

---
## 16. Summary
The lead system foundation is solid in creation, gating, and assignment but partial in installer consumption and advanced lifecycle (quoting/bidding differentiation, marketplace exposure). Primary technical debt centers on the installer feed and missing specialized endpoints. This audit provides a granular baseline enabling precise incremental planning.

---
## 17. Next Step
Prepare structured enhancement plan segmented by: Data Normalization, API Additions, UI Refactors, Lifecycle Automation, Consistency & Synchronization—after stakeholder answers to Open Questions.

---
End of Audit.

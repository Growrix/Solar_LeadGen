---
description: "T061 logic audit (installer dashboard surfaces)"
---

# T061 Logic Audit — Installer Dashboard Surfaces

Scope (per SOT):
- `src/components/InstallerLeadFeed.tsx`
- `src/app/installer/(dashboard)/**`

Goal: DS-only UI migration with **zero logic changes** (state, handlers, effects, API calls, auth/redirects, and validation must remain identical).

## Key Flows To Preserve

### 1) Auth + Role Gating (pages)
- Pages use `useSession()` + `useRouter()` and redirect:
  - If `status === 'unauthenticated'` → `/api/auth/signin`
  - If authenticated but `session.user.role !== 'INSTALLER'` → `/`

### 2) Installer Marketplace (`src/app/installer/(dashboard)/marketplace/page.tsx`)
- Data fetch:
  - `fetch('/api/leads?marketplace=true')` → populates `leads`.
  - Error surfaced via `error` state.
- Purchase flow:
  - Guard: if `!session.user.installerVerified` then `alert(...)` and redirect to `/installer/dashboard`.
  - `handlePurchase(leadId)`:
    - POST `/api/leads/${leadId}/purchase` with `{ action: 'initiate' }`.
    - If `initiateData.bypassed` then confirm immediately.
    - Otherwise follow the existing Stripe/confirm path (as currently implemented).
  - UI uses `purchasing` state to disable the purchased lead’s button and show “Processing…”.
- Countdown:
  - `LiveCountdownBar` is rendered with lead timing props; must remain intact.

### 3) Installer Leads Feed Page (`src/app/installer/(dashboard)/leads/page.tsx`)
- Maps API lead shape to `InstallerLeadFeed`’s `Lead` type via `mapAssignedLeadToComponentLead`.
  - Preserves:
    - `isLocked` detection, `isPurchased` detection (multiple fields + status normalization), and `isExpired` computation.
    - Quote type mapping (lowercase + legacy uppercase support).
    - Status derivation (`REJECTED` / `PURCHASED` / `expired` / `new` / `unlocked`).
- Unified fetch:
  - GET `/api/installer/leads/unified?expired=true` → mapped leads.
- Purchase/unlock:
  - POST `/api/installer/leads/${leadId}/purchase`.
  - On success: refresh feed via `refreshUnifiedFeed()`.
- Messaging:
  - Controls `InstallerMessagingModal` via `showMessagingModal`.

### 4) Lead Detail (`src/app/installer/(dashboard)/leads/[id]/page.tsx`)
- Fetch:
  - GET `/api/leads/${params.id}` with explicit error messages for 404/403.
- Actions:
  - Call: `window.location.href = tel:`
  - Email: `window.location.href = mailto:`
  - Message: placeholder alert (must remain).
  - Back: `router.push('/installer/leads?tab=purchased')`.

### 5) Installer Lead Feed Component (`src/components/InstallerLeadFeed.tsx`)
- Large component with multiple UI states and modals.
- Critical invariants (do not change):
  - State variables, effects, and event handlers for lead unlock/purchase, quote submission flows, and messaging entry points.
  - Any business rules (e.g., lock/unlock states, expiration, purchased-by-another detection, and status transitions).

## Migration Notes (UI-only)
- Replace non-DS icon imports with DS icons (`@/ds`) without changing meaning.
- Replace slate/gray utility backgrounds and hard black/white overlays with DS primitives (`Section`, `Card`, `Skeleton`, `Modal`, `Button`, `Icon`) while keeping the same component tree semantics and handler wiring.

## Verification Checklist
- Six scans (hardcoded values + forbidden utilities) return 0 matches for the migrated files.
- Gate0 tasks pass:
  - `npx tsc -p tsconfig.gate.json --noEmit`
  - `npm run build`

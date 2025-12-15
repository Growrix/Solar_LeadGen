# Implementation Plan: Homeowners My Profile Feature

**Branch**: `001-homeowners-my-profile` | **Date**: 2025-10-13 | **Spec**: ../spec.md
**Input**: Feature specification from `/specs/001-homeowners-my-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable homeowners to view and edit their profile via a dashboard modal (including profile photo upload/remove), and provide admins with a searchable/filterable homeowners list and lightweight analytics (counts by postcode and location with time windows). Technical approach leverages existing stack: Next.js App Router, NextAuth sessions, Prisma to read/write `User` rows, and Tailwind for UI updates. New API routes will power profile read/update (homeowner) and listing/analytics (admin). No new external services are introduced.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 14 App Router
**Primary Dependencies**: next-auth, @next-auth/prisma-adapter, @prisma/client, prisma, bcryptjs, Tailwind CSS
**Storage**: PostgreSQL (via Prisma). Existing `User` model includes: id, email, name, phone, image, companyName, businessAddress, postcode, role, isActive, timestamps
**Testing**: Manual flows and minimal API validations (happy path + edge cases). Future: add automated tests.
**Target Platform**: Web (desktop and mobile responsive)
**Project Type**: Single web app (monorepo not used)
**Performance Goals**: Align with Success Criteria in spec (modal open <2s p95, list/filter <1s up to 5k rows)
**Constraints**: Use existing stack only; no external storage/CDN required short-term. Keep image size reasonable (e.g., max 2MB) to protect DB and UI perf.
**Scale/Scope**: Initial admin list up to ~5k homeowners without special infra; analytics computed on-demand via SQL aggregations.

## Constitution Check

Must comply with: Next.js App Router, TypeScript strict, Prisma-first DB, NextAuth for auth, Tailwind styling, documentation standards.

- Auth/Access: Homeowner operates only on their own profile (via session). Admin endpoints enforce ADMIN role. Middleware already supports ADMIN bypass.
- DB Changes: No schema change required; `User.image` string used for profile photo URL. If future enhancements need media storage, plan as separate feature.
- Security: Validate inputs server-side (email, phone format, field lengths). Limit image size/types. Do not leak other users’ data.
- Documentation: Update spec/plan/contracts; inline comments in new routes/components.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Single Next.js app with Server/Client components. New/updated files are under `src/app/api/...` for routes and `src/components/...` for UI. No separate backend folder. Contracts and docs live under `specs/001-homeowners-my-profile/`.

Planned edits/additions:

- API Routes
  - `src/app/api/homeowner/profile/route.ts` (GET: current user profile, PUT: update editable fields, image upload handling)
  - `src/app/api/admin/homeowners/route.ts` (GET: list with search, filters, pagination)
  - `src/app/api/admin/homeowners/analytics/route.ts` (GET: counts by postcode/location, with time window)

- UI Components
  - Update `src/components/ProfileManagement.tsx` to load data from API, edit fields, validate, and save; add image upload/remove UX
  - Admin dashboard: add a Homeowners modal/page entry (either a new component or integrate into existing Admin dashboard page) with list/search/filter + link to analytics panel
  - Admin analytics panel component rendering chart or table (initially table + simple chart via recharts already in dependencies)

- Docs
  - `specs/001-homeowners-my-profile/contracts/*.md` for request/response contracts
  - `specs/001-homeowners-my-profile/research.md` for Phase 0 code audit & decisions
  - `specs/001-homeowners-my-profile/data-model.md` mapping fields to UI
  - `specs/001-homeowners-my-profile/quickstart.md` for local testing instructions

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

No constitutional violations anticipated. Image storage is simplified by using the existing `User.image` field as a URL; future external storage (e.g., CDN) is deferred.

---

## Phased Execution

### Phase 0 – Research (DOC: research.md)
- Confirm `User` fields in `prisma/schema.prisma` (name, email, phone, image, postcode, timestamps)
- Identify existing `ProfileManagement.tsx` props/state and current modal UX
- Identify admin dashboard entry points for homeowners view
- Verify middleware and session role checks

Deliverable: research.md with findings and screenshots/links to files

### Phase 1 – Contracts & Data Model (DOC: contracts/, data-model.md)
- Define API contracts for:
  - GET/PUT `/api/homeowner/profile` (fields, validation, error cases)
  - GET `/api/admin/homeowners` (query params: q, postcode, status, from, to, page, pageSize)
  - GET `/api/admin/homeowners/analytics` (params: window=all|30d|90d)
- Map UI fields to DB fields (data-model.md) and mark read-only vs editable

Deliverables: contracts/*.md, data-model.md

### Phase 2 – Implementation (Backend)
- Create `/api/homeowner/profile` route: session auth; GET returns current user; PUT validates and updates allowed fields; handle image changes (new URL or clear)
- Create `/api/admin/homeowners` route: ADMIN auth; apply search/filter/pagination; return total and items
- Create `/api/admin/homeowners/analytics` route: ADMIN auth; aggregate counts by postcode; group by location if available; apply time window

### Phase 3 – Implementation (Frontend)
- Update `ProfileManagement.tsx` modal:
  - Load profile on open (spinner, error states)
  - Form with validations; inline errors
  - Image upload/remove UX with preview and size/type checks; save flow integrated
  - Accessibility: focus trap, keyboard navigation, labeled inputs
- Admin Homeowners list UI:
  - Search box, filter chips (postcode, status, date range), pagination
  - Empty/no-results state; loading and error states
- Admin Analytics panel:
  - Table + simple chart (optional) for counts by postcode/location; time window selector

### Phase 4 – Validation & UAT
- Verify Acceptance Scenarios from spec (P1–P3)
- Cross-browser sanity (Chromium/WebKit/Firefox optional)
- Data integrity checks (updates persisted, counts accurate)
- Performance spot checks vs Success Criteria

### Phase 5 – Documentation
- Update quickstart.md with how to test all flows locally
- Update README or admin docs if needed (navigation entry points)

---

## Risks & Mitigations
- Large images causing slow saves → Enforce size/type limits; compress client-side later if needed (future)
- Concurrent edits → Surface last updated; on conflict, prompt to refresh data
- Analytics gaps (missing location) → Fallback to postcode-only; label unknown
- Pagination performance → Apply sensible pageSize (e.g., 25/50) and server-side filters

## Acceptance Test Matrix (excerpt)
- Homeowner can open modal, edit, save, reopen and see changes
- Upload invalid file → blocked with clear message; valid image → saved, visible in header/avatar spots
- Admin search by email substring returns expected subset
- Admin filter by postcode + date window yields correct results
- Analytics totals equal the number of items in current filter scope

# Phase 0 Research — Homeowners My Profile Feature

Date: 2025-10-13  
Branch: 001-homeowners-my-profile  
Spec: ./spec.md  
Plan: ./plan.md

## 1) Current Architecture Snapshot
- Framework: Next.js 14 (App Router), TypeScript strict
- Auth: NextAuth (credentials + Prisma adapter), JWT sessions, roles: HOMEOWNER, INSTALLER, ADMIN
- ORM/DB: Prisma + PostgreSQL (Supabase), `User` model includes: id, email, password?, name, phone, image, companyName, businessAddress, postcode, role, isActive, timestamps
- Styling: Tailwind CSS (dark mode via class), ThemeProvider
- Middleware: `src/middleware.ts` with ADMIN bypass and role checks

## 2) Relevant Entities & Fields
- `User` (homeowner):
  - Core (edit/display): name, phone?, image (URL), postcode?, updatedAt
  - Read-only in modal: email (change flow out of scope)
  - Admin list fields: name, email, phone, postcode, createdAt, isActive

## 3) Existing UI & Code Touchpoints
- My Profile modal component: `src/components/ProfileManagement.tsx` (to confirm and extend)
- Root providers: `src/app/layout.tsx` includes `NextAuthProvider` and `ThemeProvider`
- Admin dashboards: `src/app/admin/...` with existing components and DevQuickAccessMenu

## 4) Existing API Endpoints (patterns)
- App Router API structure in `src/app/api/.../route.ts`
- Example endpoints: `newsletter/subscribe`, `auth/register/homeowner`, `admin/instant-quotes`
- Pattern: method exports (GET/POST/PATCH/DELETE), uses Prisma client from `src/lib/prisma.ts`

## 5) Gaps to Address
- No homeowner profile API (GET/PUT) exists yet
- No admin homeowners listing/analytics endpoints
- Image handling flow not implemented for profile picture
- Profile modal currently not wired to server persistence for full field set

## 6) Risks & Constraints
- Large image uploads can affect performance — enforce size/type limits (e.g., 2MB, jpeg/png/webp)
- Email changes could break auth if not verified — keep email read-only for now
- Analytics data quality depends on available location fields — fallback to postcode

## 7) Data Privacy & Security
- Enforce session auth; homeowner can only fetch/update own data
- Admin endpoints restricted to ADMIN role (server-side verified)
- Validate user input server-side; sanitize text fields; clamp lengths
- No secrets in client; use server routes for DB access

## 8) Performance Guards
- Modal open time < 2s (p95) with cached initial fetch
- Admin list server-side pagination (pageSize 25/50) and indexed fields
- Analytics computed via aggregate queries; scoped by time window

## 9) Open Questions (tracked but defaulted in spec)
- Email edit/verification flow deferred
- Optional fields (address granularity) — treat absent fields as optional for now

## 10) Next Steps
- Define contracts for:
  - GET/PUT /api/homeowner/profile
  - GET /api/admin/homeowners
  - GET /api/admin/homeowners/analytics
- Map UI ↔ DB fields in `data-model.md`
- Implement backend routes then wire up UI

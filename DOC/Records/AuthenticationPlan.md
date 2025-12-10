# Authentication Modernization Plan (Update + Rebuild)

Generated: 2025-11-11
Scope: Next.js 14 App Router + NextAuth.js (credentials + OAuth), Prisma (Postgres)
Source of truth for current system: `DOC/nextjsAuth.md/AuditNextjsAuth.md`

This plan has two parts:
1) Update the existing auth to reflect the redesigned, simplified modals and flows (email/password first)
2) Build the remaining auth capabilities from scratch: Google/Apple OAuth, Email Verification, Forgot Password, plus hardening

The plan is implementation-ready and includes mapping, timelines, acceptance criteria, and guardrails to keep lead-generation flows and theming intact.

---

## Part A — Update Existing Auth To New Modals/Flow (Email/Password first)

### A0. Discovery and Alignment (0.5–1 day)
- Confirm “new auth modals” UX/fields for each role (Homeowner, Installer, Admin)
	- Expected simplifications: fewer fields up-front, clearer CTAs, deferred profile completion
	- Validate design tokens and theme usage per `specs/006-component-by-component/DESIGN-SYSTEM-SOT.md`
- Inventory current inputs and validations (from the audit)
	- Homeowner: email, password (+ basic profile)
	- Installer: currently requires business info and postcode at registration
	- Admin: email/password only
- Decision for installers (to keep lead system safe): adopt “minimal account + profile completion” flow
	- Create Installer with minimal required fields (email, password, name)
	- Mark `installerVerified: false`; gate marketplace access until profile completion and admin approval
	- Move companyName, businessAddress, postcode to a guided profile completion step after sign-in

Deliverables:
- Finalized field list per modal with validation rules and copy
- Mapping spec (old → new) approved

Acceptance:
- Stakeholder sign-off on the mapping table and mini user flows

---

### A1. Old → New Flow Mapping (0.5 day)
Create an explicit mapping that will govern API and UI updates.

| Flow | Old Inputs | New Inputs | API/DB Changes | Redirects |
|------|------------|------------|----------------|-----------|
| Homeowner Sign-up | email, password, phone? | email, password | Keep phone optional; allow add later | → /homeowner/dashboard |
| Installer Sign-up | email, password, companyName, businessAddress, postcode | email, password (minimal) | Allow partial creation; move business fields to profile completion; keep `installerVerified=false` | → /installer/onboarding → completion wizard |
| Sign-in (all) | email, password | email, password | No change at API; improve error messages; preserve role-based redirects | role → respective dashboard |
| Forgot Password | n/a | email only | Add endpoints and pages in Part B | n/a |
| Email Verification | n/a | email token link | Add endpoints and pages in Part B | n/a |

Notes:
- Middleware and RBAC remain unchanged; admin bypass preserved
- Lead generation: no behavior changes; only when installers are verified and completed their profile they access marketplace

---

### A2. UI Wiring to Existing Endpoints (0.5–1 day)
- Update Homeowner and Installer signup modals to send only the new minimal fields
- Adjust success redirects to role dashboards or onboarding where applicable
- Ensure `SessionProvider` still wraps the app; `useSession()` consumers unchanged
- Follow UI migration workflow for classNames and themes: `specs/007-migration-and-build/plan.md` (UI ONLY rules)

Acceptance:
- New modals submit successfully and create accounts according to mapping
- Sign-in works; role-based redirects unchanged
- Dark/Light/Purple theme checks pass for modals

---

### A3. API Adjustments for Minimal Registration (0.5–1 day)
- Update `src/app/api/auth/register/installer/route.ts`
	- Make business fields optional at creation
	- Set `profileComplete: false` (add to schema if needed) and keep `installerVerified: false`
	- Return a flag indicating further steps are required
- Update `src/app/api/auth/register/homeowner/route.ts` if phone was previously required; make it optional
- Add a new “Profile Completion” API for installers (PATCH): saves companyName, businessAddress, postcode

Acceptance:
- Minimal installer registration works; attempting to access marketplace shows “complete profile” CTA and blocks until done
- Homeowner registration flows unchanged except reduced inputs

---

### A4. Onboarding UI for Installer Profile Completion (0.5–1 day)
- Add `/installer/onboarding` route (protected)
- Guided form for companyName, businessAddress, postcode; submit to new PATCH endpoint
- After save, show “Pending admin approval” if `installerVerified=false`

Acceptance:
- Completing onboarding flips `profileComplete=true`; marketplace remains gated by `installerVerified`
- Visual tokens and classes align with design system across 3 themes

---

### A5. QA & Non-Regression for Lead Flows (0.5 day)
- Run the Testing Checklist sections from the audit for Homeowner, Installer, Admin flows
- Validate middleware redirects and dashboards
- Validate phone verification flow remains intact

Acceptance:
- All existing lead-generation and management APIs behave identically
- No regression in protected routes and dashboards

Timeline for Part A: ~2.5–4.5 days total

---

## Part B — Build New Auth Capabilities From Scratch

### B1. Google/Apple OAuth (1.0–1.5 days)
- Enable OAuth providers in `src/lib/auth.ts`
	- Google: clientId/secret envs
	- Apple: clientId/teamId/keyId/privateKey envs
- Map provider profile → User fields; set sensible defaults
- Decide on adapter use:
	- Keep JWT strategy; store OAuth accounts in `Account` table already in Prisma schema
- Update UI modals: enable Google/Apple buttons; ensure proper loading/error states

Acceptance:
- Sign-in/up via Google and Apple works; accounts link to same user by email
- Session and middleware behavior unchanged

---

### B2. Email Verification (1 day)
- Use existing `verification_tokens` (Prisma) or add if missing
- Endpoint: `POST /api/auth/verify/request` → generate token, send email
- Endpoint: `GET /api/auth/verify` → consume token, set `emailVerified = now()`
- UI: Add “Verify email” nudge in dashboards if not verified
- Block risky actions until verified (configurable)

Acceptance:
- Token can be requested and redeemed; duplicate/replay guarded; tokens one-time use with expiry
- Email templates align with branding; link deep-links back to correct role area

---

### B3. Forgot/Reset Password (1 day)
- Endpoint: `POST /api/auth/password/forgot` (rate-limited per email/IP)
- Endpoint: `POST /api/auth/password/reset` with token + new password
- Add `/reset-password?token=...` page (public) with secure form
- Hash with bcrypt (10 rounds) and invalidate tokens after use

Acceptance:
- Flow works end-to-end; attempts with invalid/expired tokens are rejected with safe messaging
- Session invalidation on password change (force re-login)

---

### B4. Hardening & Rate Limiting (0.5 day)
- Add rate limits to credentials authorize, forgot-password, verify-email endpoints (e.g., Upstash Redis)
- Improve error responses and logging (no sensitive leakage)
- Rotate and enforce strong `NEXTAUTH_SECRET` in production

Acceptance:
- Rate limits verified manually (5/min default) and in logs
- Security checklist from the audit passes

---

### B5. QA, Docs, and Ops (1 day)
- Extend audit Testing Checklist to cover OAuth, verification, reset
- Update `DOC` with feature docs and `.env.example` additions
- Validate CI quality gates (Build, Lint, Typecheck, Tests) and storybook/theme snapshots if applicable

Acceptance:
- All quality gates PASS; documentation updated; envs validated

Timeline for Part B: ~3.5–5 days total

---

## Contracts (APIs and Pages)

Inputs/Outputs (success criteria and error modes):
- POST `/api/auth/register/homeowner` → 201
	- in: { email, password }
	- out: { success, user: { id, role, emailVerified } }
	- errors: 400 (validation), 409 (exists), 500
- POST `/api/auth/register/installer` → 201
	- in: { email, password }
	- out: { success, profileComplete: false }
	- errors: 400/409/500
- PATCH `/api/installer/profile` (new) → 200
	- in: { companyName, businessAddress, postcode }
	- out: { success, profileComplete: true }
- POST `/api/auth/verify/request` → 200
	- in: { email }
	- out: { success }
- GET `/api/auth/verify?token=...` → 302 redirect
	- effect: sets `emailVerified = now()`
- POST `/api/auth/password/forgot` → 200
	- in: { email }
	- out: { success }
- POST `/api/auth/password/reset` → 200
	- in: { token, password }
	- out: { success }

Pages:
- `/installer/onboarding` (protected)
- `/reset-password` (public with token)

---

## Quality Gates and Governance

Build/Lint/Typecheck/Tests:
- Build PASS: `npm run build`
- Typecheck PASS: `npx tsc --noEmit`
- Lint PASS: `npm run lint`
- Tests PASS: targeted integration for auth endpoints + minimal E2E

UI Migration Rules (for modals and onboarding UIs):
- Follow `specs/007-migration-and-build/plan.md` 13-step workflow
- UI ONLY when migrating classes; do not alter business logic in these steps
- Verify 3 themes (Dark/Light/Purple) and 5 breakpoints
- Post-migration verification must be 0/0/0/0/0/0 per commands in `.github/copilot-instructions.md`

Design System and Theming:
- Use tokens from `DESIGN-SYSTEM-SOT.md`
- No hardcoded colors/typography; no manual responsive classes

---

## Risks and Mitigations
- Installer data requirements vs simplified signup
	- Mitigation: defer to onboarding; gate marketplace until profileComplete && installerVerified
- Token email deliverability in dev/stage
	- Mitigation: local dev mail catcher; environment toggles
- OAuth provider configuration
	- Mitigation: guarded by feature flags; fallback to credentials
- Regression in lead flows
	- Mitigation: execute audit testing checklist end-to-end

---

## Timeline Summary
- Part A: 2.5–4.5 days
	- A0 Discovery 0.5–1
	- A1 Mapping 0.5
	- A2 UI wiring 0.5–1
	- A3 API adjustments 0.5–1
	- A4 Onboarding UI 0.5–1
	- A5 QA 0.5
- Part B: 3.5–5 days
	- B1 OAuth 1.0–1.5
	- B2 Email verification 1.0
	- B3 Forgot/reset 1.0
	- B4 Hardening 0.5
	- B5 QA/Docs 1.0

Total estimate: 6–9.5 days (can parallelize some UI and API tasks)

---

## Next Steps (immediately actionable)
1) Confirm the simplified field set per modal and finalize A1 mapping
2) Implement A3 installer minimal registration + A4 onboarding
3) Wire UI per A2 and validate theme checks
4) Proceed with Part B in order: OAuth → Email verification → Reset Password


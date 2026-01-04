# Backend Plan — Installer Profile & Verification (Updated for Current UI)

Date: 2025-11-19
Status: Planning + Initial API scaffolding
Scope: Implement backend to support the updated UI parity across Profile, Verification Modal, and Admin views.

## 1) Current State Audit (Summary)
- Prisma models do NOT yet include InstallerVerification, InstallerVerificationLog, or InstallerPreferences.
- `InstallerProfile` exists with minimal fields: companyName, businessAddress, postcode; no `operationalStatus`.
- Admin API exists for list: `GET /api/admin/installers/list`.
- No installer verification/profile aggregation APIs yet.
- UI parity achieved in Profile, Modal, and Admin UI (docs in `UI-Field-Audit.md`).

## 2) Data Model Changes (Prisma)
Add the following:
- `InstallerVerification`: single active application per user (PENDING/APPROVED/REJECTED/MORE_INFO)
- `InstallerVerificationLog`: immutable audit trail for admin actions
- `InstallerPreferences`: notification toggles
- Extend `InstallerProfile` with `operationalStatus: ACTIVE|PAUSED|INACTIVE` (default ACTIVE)

High-level schema additions (exact fields finalized in migration):
- InstallerVerification: companyName, representativeName, designation, email, phone, abnOrLicense, establishedYear, employeeCount, services[], serviceAreas[], postcodes[], website?, socialLinks (Json), companyDescription?, licenseDocKey?, abnDocKey?, logoKey?, status, adminNotes?, createdAt, updatedAt.
- InstallerVerificationLog: userId, adminId, action, notes, createdAt.
- InstallerPreferences: userId, alert flags, createdAt/updatedAt.
- InstallerProfile: add `operationalStatus`.

## 3) API Endpoints
Auth via `getServerSession` + role gates. All payloads validated with Zod (server).

Installer-facing:
- GET `/api/installer/profile` — Aggregate: User, InstallerProfile, latest InstallerVerification, InstallerPreferences, operationalStatus
- PUT `/api/installer/profile` — Update InstallerProfile + editable verification fields after approval (subset)
- POST `/api/installer/verification/submit` — Create/update verification (status=PENDING) + log
- GET `/api/installer/uploads/presign` — Presigned PUT for S3 uploads
- PUT `/api/installer/account/status` — Toggle ACTIVE/PAUSED
- POST `/api/installer/account/change-password` — Validate and update password; rotate session

Admin-facing:
- GET `/api/admin/installers/[id]/verification` — Details + presigned download URLs
- PUT `/api/admin/installers/[id]/verification` — APPROVE / REJECT / REQUEST_INFO + logs + User.installerVerified
- GET `/api/admin/installers/[id]/logs` — Verification logs
- PUT `/api/admin/installers/[id]/status` — Set ACTIVE/PAUSED/INACTIVE

## 4) Files/Storage (S3)
- Store only S3 keys (licenseDocKey, abnDocKey, logoKey)
- Upload via presigned PUT; download via presigned GET (admin)
- Validate content-type/size, sanitize filenames

## 5) Validation & Formats
- Phone: strictly E.164 (+61); normalize 04 → +614
- Zod schemas on server for all inputs
- Role checks on all routes

## 6) Rollout Phases
1) Migration: add models + `operationalStatus` (Prisma migrate + generate)
2) Core APIs: GET/PUT installer profile, submit verification, presign uploads
3) Admin APIs: verification detail/action/logs, status control
4) Wiring: connect Profile/Modal/Admin UI to APIs; add notifications
5) QA: theme/responsive/accessibility; OTP flows; uploads; admin actions; build checks

## 7) Risks & Mitigations
- Risk: Breaking existing installer data → Mitigate with mapping layer, additive migrations
- Risk: File handling vulnerabilities → Strict validation, size limits, allowed mime types
- Risk: Auth bypass → Centralized `authOptions` + role checks + server-only logic

## 8) Acceptance Criteria
- Installer can submit verification with docs; admin can approve/reject/request info with logs
- Profile reflects status; allows edits + preferences
- Operational status toggling works (installer + admin)
- Change password endpoint enforces complexity and rotates session
- All routes pass validation; builds succeed

## 9) Immediate Next Steps (Implementation)
- Add initial GET `/api/installer/profile` (works with existing models; returns nulls/placeholders for not-yet-migrated parts)
- Prepare Prisma migration draft (pending approval) for the new models and `operationalStatus`
- Define shared Zod schemas for verification payloads

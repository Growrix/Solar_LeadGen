# Universal System Audit — Blueprint-Aligned (2025-12-14)

This report follows the "UNIVERSAL SAAS SYSTEM AUDIT PROMPT" and references only existing repository artifacts.

---

### 🔍 AUDIT SUMMARY

- Overall system health: ⚠️
- Risk level: MEDIUM
- Blueprint compliance score: 82 / 100

Rationale: Strong RBAC signals (NextAuth + middleware), domain separation for leads/bids/notifications, Prisma singleton, and consolidated notification usage are present. Gaps remain in event-model formalization, role-gated login UX, and observability/deliverability hardening.

---

### 🚨 CRITICAL VIOLATIONS

- Role‑specific login enforcement is inconsistent
  - Violated rules: Constitution Articles VI (Zero trust, Auth ≠ Authorization), Blueprint P5 (Role‑ & context‑based access)
  - Evidence: `src/lib/auth.ts` supports an `expectedRole` from credentials; several pages rely on client-side redirects (`router.push('/api/auth/signin')`) rather than server‑side denial. Users have reported cross‑portal logins.
  - Danger: Privilege confusion, blurred trust zones, inconsistent user experience.

- Side effects not formalized as events
  - Violated rules: Blueprint §7 (Event‑driven), §6 (Workflow design)
  - Evidence: Notification flows call services directly across multiple domains (e.g., `purchase-service`, `lead-service`) without an explicit event bus or event contracts; retries/dead‑letter are not first‑class.
  - Danger: Hidden side effects, harder observability, coupling across domains.

- Email deliverability risks for admin/role messages
  - Violated rules: Observability/Auditability; Security & Trust Model
  - Evidence: Recent spam classification for admin email; SendGrid integration logs to console but doesn’t persist outcomes; domain link sources vary between `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`.
  - Danger: Missed critical communications; limited traceability for failures.

---

### ⚠️ STRUCTURAL WEAKNESSES

- Notification service duplication and drift potential
  - Evidence: `src/lib/notifications/notification-service.ts` and `src/lib/services/notification-service.ts` both exist and implement overlapping responsibilities; routes call the notifications library while other places call the services variant.

- Mixed link source for emails
  - Evidence: `src/lib/sendgrid.ts` composes links with `NEXTAUTH_URL`; `src/lib/mailer.ts` uses `NEXT_PUBLIC_APP_URL`. Inconsistent public vs. server domains increases risk of broken links.

- Client‑side gating in pages
  - Evidence: Many dashboard pages (installer) gate access via client-side checks and redirects. Middleware exists, but client enforcement should be a last resort.

- Observability is console‑heavy
  - Evidence: SendGrid outcomes and RBAC denials log to console; `audit-logger` exists but is not wired to email delivery events/bounces.

- Deliverability posture unspecified
  - Evidence: No repository doc references to DMARC/SPF/DKIM configuration; Verified sender enforced in code, but policy posture is not codified.

---

### 🛠 REQUIRED FIXES (NOT OPTIONAL)

- Harden role‑specific login end‑to‑end
  - What: Pass `expectedRole` from role portals into CredentialsProvider, deny on server if mismatch; ensure middleware definitively gates `(dashboard)` routes per role; reduce reliance on client redirects.
  - Aligns with: Constitution Articles II/VI; Blueprint P5.
  - Outcome: Clear trust zones; correct portal behavior.

- Establish an event orchestration layer
  - What: Define domain events (e.g., `LeadPurchased`, `BidPaymentCompleted`, `LeadApproved`, `PhoneVerified`) and route all side effects (notifications, emails, pusher, logs) through a single orchestrator.
  - Aligns with: Blueprint §7, §6.
  - Outcome: Traceable, testable side effects; lower coupling.

- Consolidate notification services into one canonical module
  - What: Merge duplicated notification implementations; expose a single API (`createNotification`, `createBulkNotifications`) and deprecate alternates.
  - Aligns with: P1 Single Source of Truth; Separation of Concerns.
  - Outcome: Reduced drift; consistent behavior.

- Unify link sources for outbound emails
  - What: Use a single config helper that resolves public app base URL for email links; avoid mixing `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`.
  - Aligns with: Separation of Concerns; Security/Trust.
  - Outcome: Correct links across environments.

- Persist email delivery outcomes for audit
  - What: Record provider response IDs, status, and role into `AuditLog` or `EmailDelivery` table; include retries/backoff and optional dead‑letter queue.
  - Aligns with: Constitution Article VII (Auditability).
  - Outcome: Reliable post‑mortems; SLA visibility.

- Document and enforce deliverability posture
  - What: Add ops docs for SPF/DKIM/DMARC; enforce verified sender; include brand header/footer, physical address, and preferences link where applicable.
  - Aligns with: Security & Trust Model; Observability.
  - Outcome: Lower spam risk; improved trust.

---

### 🧩 OPTIONAL IMPROVEMENTS

- Canonical responsive email templates (MJML/Handlebars) with design tokens; attach PDF invoices for installer confirmations via a utility.
- RBAC policy objects per route group, validated in middleware and server components, with clear deny logs.
- Metrics: Add counters for notifications per event/role and delivery latencies.

---

### 📌 FINAL VERDICT

- Blueprint‑compliant and saleable? Partial.
- System is close: RBAC foundations, Prisma singleton, consolidated notification usage, and typed NextAuth extensions are strong. To reach full compliance, implement the required fixes for role‑gated login, event orchestration, notification consolidation, link consistency, and delivery observability.

---

### REFERENCES (EVIDENCE PATHS)

- RBAC & Auth: `src/lib/auth.ts`, `src/middleware.ts`, `src/types/next-auth.d.ts`
- Notifications: `src/lib/notifications/notification-service.ts`, `src/lib/services/notification-service.ts`, `src/app/api/**` routes calling notifications
- Email & Deliverability: `src/lib/sendgrid.ts`, `src/lib/mailer.ts`
- Domain Services: `src/lib/services/lead-service.ts`, `src/lib/services/purchase-service.ts`, `src/lib/services/lead-state.ts`
- Observability: `src/lib/services/audit-logger.ts`

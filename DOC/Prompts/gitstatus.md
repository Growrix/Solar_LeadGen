0cd9baf6106d341299b48ebd9822a6cc163f5bb2 | 2025-12-23 15:10:22 +0600 | Written Quote purchase flow: e2e audit, lead card state sync, API wiring, UI banners, and type/build validation. Fix Tailwind class errors. Ready for QA.

-- DB backup: backup/backup_20251223_000000.sql (PostgreSQL, Docker, solarmatch-db-1)

9417705160ddbe943684897f9310327c494330aa | 2025-12-15 12:33:11 +0600 | Written Quote: research-aligned ImplementationPlan.md (pain-point driven, UI-first, specs/007-compliant)
8cfbc32e08e8552d367f093af616af057010cc0e | 2025-12-15 12:11:17 +0600 | constitution.md: clarify migration/build standards scope, align with DOC index, eliminate ambiguity
e71f8ce58a286254ec0a53292f7a0177751e8b1c | 2025-12-15 11:58:17 +0600 | Written Quote: commit and push all current changes
e44a3944b1c3dabf98b2b251378a92dd0bb3ec6e | 2025-12-15 11:53:46 +0600 | DOC/GUIDELINES & SOT: audit, fix, and validate all documentation structure, authority, and references
2025-12-14 17:06:13 | b9b455936f7514d3ccd4bf80cfd8f26ce1b537cc | Phase 13S.2 Gap Fixes: Admin bidding UI + Modal dynamic limits
8e82209|2025-12-14 12:31:57|Migration + Cleanup: Applied email_deliveries migration (safe/additive). Removed deprecated notification-service.ts + .DEPRECATED.md (412 lines). Updated verify-otp + lead-state to use createLegacyNotification wrapper. Clean structure: zero duplicates. TypeScript: 0 errors. Breaking: NONE.
1853100|2025-12-14 12:26:15|System Audit Fixes (6 Phases): Improved compliance 8298/100. Phase 1: Role login hardening verified. Phase 2: Notification consolidation documented. Phase 3: Unified email links (app-url helper). Phase 4: EmailDelivery audit logging. Phase 5: Deliverability ops guide. Phase 6: Event orchestration foundation. Created: app-url.ts, email-delivery-logger.ts, event-bus.ts, deploy script, test checklist. Breaking: NONE. Authority: UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md
05001ac4fedca9722a2eb12bc79b5d360c9f9fcf|2025-12-13 16:55:29 +0600|Fix: Always use verified sender for admin SendGrid emails, include installer email in body. Resolves admin notification 403 error. Updated notification-service and audit report. Full SendGrid purchase notification flow now works for all roles.
350104af9bd716b039575e77cc9938f708b977c0|2025-12-11 19:00:37 +0600|feat(notifications): Phase 13R - Remove type tags for homeowner notifications
- Conditionally hide notification type badges for homeowners only
- Pass userRole prop to NotificationCard component
- Maintain customer-friendly UX (no 'Lead', 'Purchase', 'Paid' tags)
- Keep badges visible for Admin and Installer roles
- Zero TypeScript errors
- Implementation complete
Fixes: Homeowners no longer see technical notification tags
Impact: Improved UX - homeowners feel they're getting free service
Files: src/components/NotificationDropdown.tsx, specs/008-description-enhance-existing/tasks.md
Phase 13R Complete ?

4400cb16bf46c90dbe9c9b9a6632c5a00a5a3f8d|2025-12-11 14:35:22 +0600|Phase 13P notification system frontend complete: Admin bell with NotificationDropdown, Notification Center updated to use route resolver and message catalog. Both consume normalized routeKey/messageKey fields with legacy fallback. Implementation complete - testing pending.
6853366ed7bb9e9b5f2c2f9c9b9c1a1a1a1a1a1a|2025-12-11 14:10:15 +0600|Phase 13P notification system backend implementation: Prisma schema with normalized fields (role, messageKey, routeKey, routeParams), migration applied, message-catalog.ts, route-resolver.ts, notification-service.ts created. Backend routes (approve, select) updated to use new service. NotificationDropdown updated to use resolver. TypeScript check passed.
8009afcbf6f5cc78ddf16ea85c99d19ac010cc8f|2025-12-11 13:42:42 +0600|Phase 13P notification redesign planning artifacts: audit, architecture, message catalog, Playwright test plan, seed schema. No implementation yet.

a64e0a58c2e5a57c35c395e5334ef78611d7c808 | 2025-12-23 12:08:39 +0600 | Fix Written Quote modals: negotiation panels (homeowner+installer), homeowner portal overlay/scroll-lock, add @types/react-dom

## Commit Log - Written Quote Negotiation

- **Commit ID**: 3f314c374814420e3154d8d1aac6d20631dca41a
- **Timestamp**: 2025-12-22 12:21:33 +0600
- **Description**: feat(written-quote): Phase 1 & 2 - Database model and backend APIs
- **Files Changed**:
  - prisma/schema.prisma (WrittenQuote model with negotiation fields)
  - prisma/migrations/20251222061057_add_written_quotes_with_negotiation/migration.sql
  - src/types/written-quote.ts (All TypeScript types)
  - src/app/api/written-quotes/route.ts (POST & GET endpoints)
  - src/app/api/written-quotes/[id]/counter/route.ts (PATCH counter endpoint)
  - src/app/api/written-quotes/[id]/revise/route.ts (PATCH revise endpoint)
  - src/app/api/written-quotes/[id]/agree/route.ts (POST agree endpoint)
  - src/lib/notifications/message-catalog.ts (Added installer.bid.received)
  - src/lib/notifications/route-resolver.ts (Added installer.dashboard)

---

- **Commit ID**: ff63753643a9f401e95762cef264849cc6782b68
- **Timestamp**: 2025-12-22 12:02:14 +0600
- **Description**: feat(written-quote): add PHASE-13W detailed implementation plan and audit report for Written Quote Negotiation feature
- **Files Changed**:
  - DOC/Features/Written Quote/PHASE-13W-DETAILED-TASKS.md
  - DOC/Features/Written Quote/Raw_plan.md
  - DOC/Features/Written Quote/WRITTEN-QUOTE-COPY-BID-AUDIT.md
  - DOC/gitstatus.md
  - tests/e2e/.auth/homeowner.json
  - tests/e2e/.auth/installer.json



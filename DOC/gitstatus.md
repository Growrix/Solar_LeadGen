# ---
#
# - Commit: ff0d6d1d27c4170d23218756eaf5d627f987d8bc
# - Date: 2025-12-24 19:07:16 +0600
# - Branch: NegotiationModal_Enhancement
# - Description: fix(admin): restore approve+assign by removing initialCountdownDays writes
---

- Commit: 3e5ee0972b8dba6b63cdad788cfd81022a2e2704
- Date: 2025-12-24 18:24:59 +0600
- Branch: NegotiationModal_Enhancement
- Description: Sync lead-card countdown to negotiation window and extension; auto-expiry and status sync across all roles. Type and build validation complete.
---

- Commit: c431b61b4d213fb5844a510c4ec5cfda4d3d96c1
- Date: 2025-12-24 16:37:51 +0600
- Branch: NegotiationModal_Enhancement
- Description: Installer Written Quote modal: Add in-modal payment CTA, sync purchase state with lead card, auto-disable after payment; update spec and audit docs; repo cleanup and build validation

# Git Commit Status Log

---

- Commit: 6af7fe9280a9c77ae65a24f4212d57316089045b
- Date: 2025-12-27 14:03:51 +0600
- Branch: NegotiationModal_Enhancement
- Description: Committing all staged changes before pushing to Notification&Email branch
---

---

- Commit: 0d222d7b8876c0c86db23bbac4138ed5664bdce6
- Date: 2025-12-25 14:23:50 +0600
- Branch: NegotiationModal_Enhancement
- Description: feat(written-quote): negotiation modal enhancements, dashboard lead visibility, review modal chart fix, and UI cleanup
---

- Commit: 0cd9baf6106d341299b48ebd9822a6cc163f5bb2
- Date: 2025-12-23 15:10:22 +0600
- Branch: Written_Quote
- Description: Written Quote purchase flow: e2e audit, lead card state sync, API wiring, UI banners, and type/build validation. Fix Tailwind class errors. Ready for QA.

-- DB backup: backup/backup_20251224_1425.sql (PostgreSQL, Docker, solarmatch-db-1)

This entry records the rollback to the Written_Quote branch for full restoration. All files now reflect the state of commit a7b5c7a4bec8c3cf74f8f944dfe42512afc0d91a as of 2025-12-22 11:08:03.

---

- Commit: 013200ce63f9339e0ebf8c80292f18e4239fa533
- Date: 2025-12-23 13:06:18 +0600
- Branch: New_WrittenQuote
- Description: Fix: stabilize negotiation panel input and polling, prevent input focus loss, improve UI update feedback.

---

- Commit: 533d04a31c62e55a4b57bd6a44fdbc88b4290636
- Date: 2025-12-23 19:12:28 +0600
- Branch: New_WrittenQuote
- Description: Fix installer modal negotiation history to use finalTotal; ensure payload and UI match homeowner modal; TypeScript validation passing

---

- Commit: cd3f5cd1d7461846069d029c5b899d0ee91b11c2
- Date: 2025-12-24 11:36:58 +0600
- Branch: New_WrittenQuote
- Description: Self-host Inter font: add woff2 files, update globals.css to use local @font-face, remove Google Fonts dependency. Fixes font loading reliability.

---

- Commit: c98453810d81da874e4628656d33c3f9011d43d8
- Date: 2025-12-24 14:23:48 +0600
- Branch: NegotiationModal_Enhancement
- Description: Enhance negotiation modals: add live presence, expiry, extension, admin controls; typecheck and production build clean
---

- Commit: 408ad02daad3356baa57dd9fdc797e7205c3c465
- Date: 2025-12-27 15:42:31 +0600
- Branch: Notification_IndustryStandard
- Description: Notification & CTA routing: All producers now use deep-link routeKeys and params; homeowner/admin/installer CTAs open correct modal/page; all labels policy-compliant. Typecheck clean. Ready for industry standardization.
---

- Commit: cf3daf3cd0d1e7dbe37a917e3f72321c94753cf2
- Date: 2025-12-28 11:44:32 +0600
- Branch: Notification_IndustryStandard
- Description: feat(installer-leads): add unified API endpoint, update canonical page to use single fetch, and fix Next.js build errors (pathname nullability, _document shim)
---

- Commit: 8c991006889f75d70a5cbca17c83933aa7d45d30
- Date: 2025-12-28 12:17:10 +0600
- Branch: Notification_IndustryStandard
- Description: docs(guidelines): move legacy-safe 6-phase framework into SOT and add feature SOT folderization rules
---

- Commit: afe8fbc1507ae32b5533f8dd98f215894ea5e9e0
- Date: 2025-12-28 13:09:11 +0600
- Branch: BLOG
- Description: Blog Feature SOT, audit, and implementation plan added. Next build verified. Ready for DB modeling phase.

-- DB backup: backup/backup_20251228_1315.sql (PostgreSQL, Docker, solarmatch-db-1)

This entry records the DB backup before Blog Feature DB modeling. All files now reflect the state of commit afe8fbc1507ae32b5533f8dd98f215894ea5e9e0 as of 2025-12-28 13:09:11.

---

- Commit: df1c50bc3e14d098b6dbe22cf86aa240d423b65c
- Date: 2025-12-28 14:33:22 +0600
- Branch: BLOG
- Description: docs: lock Blog Feature planning, clarify execution workflow (Docs Lock, SOT Index, frontend-first tasks, AI continuity). All docs now unambiguous for E2E AI-driven implementation.
---

- Commit: 8f1e39760a83c95d1e4af5f68bf5f6b979c08e68
- Date: 2025-12-28 15:28:42 +0600
- Branch: BLOG
- Description: chore(build): mark auth/session-dependent API routes as force-dynamic to eliminate build-time `Dynamic server usage` noise. `npm run build` verified clean.
---

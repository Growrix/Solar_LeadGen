# Lead System Next Phase Plan
Date: 2025-11-24
Baseline Reference: `LEAD-SYSTEM-END-TO-END-AUDIT.md`
Scope: Complete functional maturity of Lead System (Homeowner + Admin + Installer) from current partial integration to fully unified lifecycle including quoting & bidding, marketplace exposure, installer consumption, lifecycle automation, and consistency QA.

---
## 1. Objectives
- Eliminate mock / divergent logic (InstallerLeadFeed) and move to single source-of-truth APIs.
- Implement full quote & bidding lifecycle (submission, listing, status transitions) without breaking existing approved/purchased flows.
- Stabilize homeowner lead management (edit, cancel, preview, commercial fields) and ensure parity with admin & installer views.
- Provide admins a unified, efficient interface with per-installer notes clarity and reliable postcode filtering.
- Automate lead expiry and clarify resell rules.
- Achieve semantic UI compliance, multi-theme integrity, and zero hardcoded style violations across new/updated components.

---
## 2. Workstreams
1. Data & API Foundations
2. Installer UI Normalization & Enhancements
3. Homeowner Feature Completion (Phase 19 + 20)
4. Admin Enhancements & Assignment Quality
5. Lifecycle Automation & Policy Clarification
6. Consistency & QA (Verification, Accessibility, Performance)

---
## 3. Sequencing & Dependencies
Order is critical to avoid rework:
1. Data & API Foundations (provides endpoints required by UI changes)
2. Installer UI Normalization (consumes new API shapes)
3. Homeowner Feature Completion (commercial edit, property badges rely on stable quoteType semantics)
4. Admin Enhancements (per-installer notes uses updated assignment data model)
5. Lifecycle Automation (expiry + resell policy after base flows stable)
6. Consistency & QA (final stabilization prior to expansion)

---
## 4. Detailed Milestones
### 4.1 Data & API Foundations
- M1.1 Extend assigned leads API: add `roofType`, `budgetRange`, `purchaseStatus`, `purchasedAt`, `quotesCount`.
- M1.2 Marketplace listing endpoint: `GET /api/installer/leads/marketplace` (filters: quoteType, status=APPROVED, not expired, not purchased, visibility PUBLIC).
- M1.3 Quote submission endpoint: `POST /api/leads/{id}/quotes` (validation: installer verified, lead status APPROVED/PURCHASED depending on rule, lead.quoteType in [WRITTEN_QUOTE,BIDDING]).
- M1.4 Bidding listing endpoint: `GET /api/installer/leads/bidding` (returns active bidding leads with countdown + bid counts).
- M1.5 Optional: Bid submission alias - reuse quote endpoint with `quoteType=FORMAL` and mark context.
- M1.6 Purchase endpoint refinement: ensure idempotency, clarify `adminAssigned` override vs marketplace purchase.
- M1.7 Expiry detection helper: pure function for status transition (EXPIRED) or UI filtering; log audit on transition.

### 4.2 Installer UI Normalization
- M2.1 Remove `mockLeads`, introduce unified `FeedLead` interface using backend enums directly.
- M2.2 Integrate marketplace tab + assigned tab + bidding tab views.
- M2.3 Implement CALL_VISIT unlock card (masked contact until purchase).
- M2.4 Implement WRITTEN_QUOTE card with immediate QuoteBuilderModal launch (contact policy confirm).
- M2.5 Implement BIDDING card variant (countdown persistent, submit bid CTA, contact locked until homeowner selection - placeholder state).
- M2.6 Replace local unlock simulation with real purchase POST sequence.
- M2.7 Accessibility pass: ARIA labels for action buttons, focus order preserved.
- M2.8 Theming & semantic classes compliance verification (6-command set = 0/0/0/0/0/0).

### 4.3 Homeowner Feature Completion
- M3.1 Finalize edit API parity (confirm `updateLead` covers commercial fields; show commercial sections in edit modal).
- M3.2 Add property type badges (Residential/Commercial) across dashboard cards & modals.
- M3.3 Implement phone sync warning if user profile phone differs from latest lead phoneNumber.
- M3.4 Refine cancellation UI (ensure action only for eligible statuses per `canCancelLead`).
- M3.5 Verification gating messaging improvement (pre-threshold context panel).

### 4.4 Admin Enhancements
- M4.1 Display per-installer notes from `LeadAssignment.notes` distinctly; enable add/edit per assignment.
- M4.2 Postcode filter optimization (client-side indexing or server query param support). Avoid full fetch for large installer list.
- M4.3 Consolidate lifecycle actions: ensure archive/resell/reset-timer surfaces clear audit side-effects.
- M4.4 Add installer status filters (ACTIVE, PAUSED, INACTIVE) derived from `InstallerProfile.operationalStatus`.

### 4.5 Lifecycle Automation & Policy
- M5.1 Implement expiry transition job (manual invocation placeholder: endpoint or server cron stub) setting status=EXPIRED + audit.
- M5.2 Document resell conditions (status PURCHASED but not QUOTED within X days OR EXPIRED purchase revert) and implement guard.
- M5.3 Bidding acceptance placeholder: homeowner selection endpoint stub (future extension) + resulting unmask rule.

### 4.6 Consistency & QA
- M6.1 Run semantic class verification (6-command) on all touched files.
- M6.2 Audit logs coverage: ensure each major mutation writes consistent metadata (assign, purchase, quote, expire, resell).
- M6.3 Accessibility checklist (focus traps in modals, role attributes, color contrast validated across themes).
- M6.4 Performance sanity (avoid N+1 queries in new marketplace endpoints; confirm includes vs select minimal fields).
- M6.5 TypeScript strict build (`npx tsc --noEmit`) and production build (`npm run build`) before final approval.

---
## 5. Acceptance Criteria & Metrics
| Workstream | Metric | Target |
|------------|--------|--------|
| API Foundations | New endpoints response time (local dev) | <300ms average |
| Installer UI | Mock removal | 0 mock arrays remaining |
| Bidding | UI differentiation | Distinct card variant + bid count present |
| Homeowner Edit | Commercial field visibility | 100% of fields loaded & saved |
| Admin Notes | Per-installer notes | CRUD works; audit entries present |
| Expiry | Status transitions | EXPIRED leads hidden from marketplace within 1 min of job run |
| Semantic Classes | 6-command verification | 0 matches each command |
| Accessibility | Contrast & keyboard nav | Pass WCAG 2.1 AA manual checklist |
| Audit Logging | Mutation coverage | ≥95% of mutating endpoints emit audit log |
| Build Integrity | Type + build errors | 0 blocking errors |

---
## 6. Risk Register & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Endpoint shape drift between UI and API | Broken feed | Finalize interface types first; shared TypeScript types module |
| Purchase race condition (simultaneous unlock) | Double assignment/payment | Add transactional check: lead.installerId null check + unique constraint audit |
| Bidding complexity creep | Delay of other features | Implement minimal stub (listing + submission) then defer selection logic |
| Expiry job not running in production | Stale marketplace leads | Provide manual admin endpoint fallback + dashboard indicator |
| Performance regression in installer list | Slow admin assignment | Add query filters & pagination early |

---
## 7. Implementation Cadence (Suggested)
- Sprint 1 (Day 1-2): Complete M1.1–M1.4 + interface types.
- Sprint 2 (Day 3-4): Installer UI M2.1–M2.6 + basic accessibility.
- Sprint 3 (Day 5): Homeowner M3.1–M3.3 + Admin M4.1.
- Sprint 4 (Day 6): Remaining Admin + Lifecycle M5.1; Resell policy doc.
- Sprint 5 (Day 7): Bidding UI polish + QA (M6.*) + build verification.

---
## 8. Atomic Commit Protocol
- One functional unit per commit (e.g., API endpoint, UI card variant).
- Commit message format: `feat(lead-api): add marketplace endpoint` / `ui(installer-feed): bidding card variant` / `chore(lifecycle): expiry job stub`.
- Update `DOC/Prompts/gitstatus.md` with commit id, timestamp, summary after each commit (per user instruction).

---
## 9. Deferred / Out-of-Scope
- Homeowner dashboard redesign beyond badges & messaging.
- Advanced bidding winner selection & installer ranking algorithm.
- Real-time notifications (websocket) for assignments/purchases (future phase).
- Full performance benchmarking suite.

---
## 10. Immediate Next Actions
1. Confirm contact locking rules for WRITTEN_QUOTE vs CALL_VISIT (open question from audit).
2. Draft TypeScript shared types for `FeedLead`, `AssignedLeadExtended`, `MarketplaceLead`.
3. Implement M1.1 & M1.2 endpoints.
4. Replace mock data in InstallerLeadFeed with API fetch scaffolding (empty states until responses). 

---
## 11. Exit Criteria (Phase Completion Definition)
Phase considered complete when: all M1–M6 milestones achieved; acceptance metrics met; audit log coverage verified; semantic checks zero violations; build passes; installer feed shows real data for all three quote types; homeowner edit modal fully functional for commercial fields; admin assignment supports per-installer notes; expiry mechanism documented and testable.

---
End of Plan.

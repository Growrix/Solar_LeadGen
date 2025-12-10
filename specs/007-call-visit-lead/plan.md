# Implementation Plan: CALL_VISIT Lead Purchase Flow

**Branch**: `007-call-visit-lead` | **Date**: 2025-11-24 | **Spec**: `specs/007-call-visit-lead/spec.md`
**Input**: Feature specification (atomic purchase endpoint, backend masking, audit logging, removal of mock data).

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement backend-enforced purchase of CALL_VISIT leads: expose atomic `POST /api/installer/leads/{id}/purchase` endpoint, server-driven contact masking, single-installer ownership, audit logging, and UI card state normalization (available / purchased-by-me / purchased-by-other / unavailable). Remove all mock/local unlock logic. Performance target: <800ms response, conflict-safe under race.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Strict) / Next.js 14 (Server + Client components)  
**Primary Dependencies**: Next.js App Router, Prisma ORM, NextAuth, Tailwind (semantic tokens)  
**Storage**: PostgreSQL via Prisma (Lead table, audit log target)  
**Testing**: Jest + Integration fetch tests (existing test harness), manual UI verification  
**Target Platform**: Web (Desktop + Mobile browsers)  
**Project Type**: Single web monorepo (app router)  
**Performance Goals**: Purchase endpoint p95 < 800ms dev baseline; race safe (0 double-purchases)  
**Constraints**: Must preserve UI-first constitution rule (UI stub exists); no hardcoded styles; atomic DB write  
**Scale/Scope**: Single endpoint + feed state refactor (low complexity)  

NEEDS CLARIFICATION: None (all defaults acceptable)

## Constitution Check

Gate Review (Pre-Phase 0):
- UI-first requirement: Installer feed UI already exists (legacy) → OK, will refactor without backend-first violation.
- Spec alignment: Feature spec completed → OK.
- Multi-theme support: Changes will reuse existing semantic classes; plan enforces no hardcoded values → OK.
- Atomic commits: Implementation plan enforces one endpoint + UI refactor separately → OK.
- No violations detected. Proceed.

Post-Contracts Re-Check (Phase 1 Complete):
- Theming & Tokens (Constitution §8): Contracts + quickstart introduce no hardcoded styling. UI refactor plan still enforces token usage.
- Server-First Strategy (§1.4): Purchase logic concentrated server-side; masking derived there—compliant.
- Auditability (§1.9 / §11): Purchase endpoint will emit structured log + PurchaseLogEntry. Plan includes this—compliant.
- Least Privilege (§1.3): Endpoint scope limited to installer role; no broadened access introduced.
- Observability (§1.7 / §11): Logging plan retained; tracing hooks can be deferred but not removed—acceptable.
- Quality Gates (§3): Type safety unaffected by added JSON contracts; future code must pass `tsc --noEmit`.
Conclusion: Artifacts do not introduce constitutional violations. Proceed to detailed Phase 2 planning.

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

**Structure Decision**: Existing Next.js single app structure retained. Source impact limited to:
- `src/app/api/installer/leads/[id]/purchase/route.ts` (new)
- `src/lib/services/purchase-service.ts` (augment atomic logic if needed)
- `src/components/InstallerLeadFeed.tsx` (remove mockLeads, backend state mapping)
- `src/types/lead.ts` (ensure enums expose CALL_VISIT properly)

## Complexity Tracking

No violations to justify. Section omitted.

## Phase 0: Outline & Research

Research Targets (none critical). Still formalize decisions:
- Atomic purchase strategy: single Prisma transaction setting installerId if null & status APPROVED.
- Conflict detection: Use conditional update (WHERE status=APPROVED AND installerId IS NULL) then rowsAffected check.
- Audit logging: Insert PurchaseLog entry (leadId, installerId, timestamp, outcome).
- Contact masking: API response includes masked contact unless purchaser; backend decides based on installerId.

Artifact: `research.md` summarizing decisions & rejected alternatives.

## Phase 1: Design & Contracts

Artifacts to generate:
- `data-model.md`: Lead fields (subset), PurchaseLogEntry structure, state transition APPROVED → PURCHASED.
- `/contracts/purchase.openapi.json`: OpenAPI snippet for purchase endpoint.
- `/contracts/feed.openapi.json`: Document card state fields (canPurchase, purchasedByMe, purchasedByOther, maskedContact, leadPrice).
- `quickstart.md`: Step-by-step call (curl), expected responses, race condition test, UI verification checklist.
- Run `update-agent-context.ps1 -AgentType copilot` to record new endpoint.

## Phase 2: Implementation Planning

Sequenced Tasks:
1. Service Layer Preparation: Create/augment `src/lib/services/purchase-service.ts` with atomic Prisma transaction (conditional update + audit insert).
2. API Route: Implement `src/app/api/installer/leads/[id]/purchase/route.ts` calling service; map errors to 409/400/404.
3. Feed Query Normalization: Ensure existing feed resolver (or create) returns derived flags (`purchasedByMe`, `purchasedByOther`, `canPurchase`, `maskedContact`). Update TypeScript types in `src/types/lead.ts`.
4. UI Refactor: In `src/components/InstallerLeadFeed.tsx` remove mockLeads/unlock simulation; consume new flags; adjust purchase button visibility & disabled states.
5. Masked Contact Rendering: Introduce placeholder component when `maskedContact=true`; ensure accessibility (ARIA label indicating masked state).
6. Conflict UX: Implement toast/snackbar on 409; trigger feed refetch; maintain focus management (return focus to lead card).
7. Audit Logging Hook: Confirm PurchaseLogEntry insertion; add structured log (level=info, event=purchase_attempt/outcome) per Constitution §11.
8. Analytics (Optional/Deferred): Stub events for view/purchase if analytics infra present; wrap in feature flag.
9. Multi-Theme & Token Audit: Run 6-command verification on refactored component; resolve any hardcoded style findings.
10. Accessibility Pass: Keyboard navigation, focus states, masked vs unmasked contrast (WCAG 2.2 AA).
11. Testing – Race Condition: Write integration test (parallel POST) expecting one success + one 409; assert DB single ownership.
12. Testing – Feed Consistency: After purchase, fetch feed; verify flags & maskedContact flipped correctly.
13. Testing – Error Paths: Simulate invalid status (manually set in test fixture) returns 400.
14. Type & Lint Gates: Run `tsc --noEmit` and ESLint on touched files.
15. Performance Sanity: Log timing around transaction (duration field); ensure <800ms baseline locally.
16. Final Verification: SC-001–SC-008 mapping checklist; document evidence in tasks file.
17. Atomic Commit: Separate commits: (a) service+route, (b) UI refactor, (c) tests, (d) logging/analytics (if added).

Risk Mitigation Steps:
- Add transaction guard early before UI wiring.
- Log purchase failures for monitoring.

Exit after verifying Success Criteria SC-001–SC-008.

## Tasks (High-Level)
- Service + API endpoint implementation
- Feed resolver & derived flags
- UI refactor (card states + masking)
- Conflict handling UX & accessibility
- Audit logging + optional analytics stub
- Multi-theme + token verification
- Integration + race tests + error path tests
- Performance & quality gates validation

## Next Steps
Phase 1 complete. Proceed to Phase 2 execution following sequenced tasks. Capture evidence artifacts (race test output, feed diff, audit log sample, theme audit results) before final commit.

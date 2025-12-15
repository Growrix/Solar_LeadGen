# Agent Context Update: CALL_VISIT Purchase Flow (2025-11-24)

## Purpose
Record newly added artifacts and confirm constitutional alignment for agent referencing this feature.

## New Artifacts
- `contracts/purchase.openapi.json`
- `contracts/feed.openapi.json`
- `quickstart.md`
- Expanded Phase 2 tasks in `plan.md`

## Constitution Mapping
- Server-First (§1.4): Purchase logic centralized in service + API route.
- Theming (§8): No styling artifacts introduced; UI refactor plan enforces token usage.
- Auditability (§1.9 / §11): Purchase will generate PurchaseLogEntry + structured log.
- Least Privilege (§1.3): Endpoint scoped to authenticated installer role.
- Quality Gates (§3): Planned tsc, lint, integration tests, race test.
- Accessibility (§9): Masked contact placeholder + keyboard purchase flow scheduled.

## Implementation Commit Boundaries
1. Service + API route
2. UI refactor
3. Tests (race + feed correctness + error paths)
4. Logging / analytics stub (optional)

## Risk Register (Current)
| Risk | Description | Mitigation |
|------|-------------|------------|
| Race condition | Dual purchase attempt | Conditional update + 409 path + test |
| UI drift | Residual mock logic conflicts with backend flags | Remove mockLeads before wiring flags |
| Masking leak | Contact exposed before purchase | Server masks when `installerId` mismatch |
| Theme regression | Hardcoded classes slip in during refactor | Run 6-command audit pre-commit |

## Success Evidence Plan
Will capture: transaction log excerpt, race test output (one 200 / one 409), feed JSON before/after purchase, 6-command zero-match audit screenshot/text, accessibility tab order notes.

## Next Step
Proceed to Phase 2 execution per updated `plan.md`.

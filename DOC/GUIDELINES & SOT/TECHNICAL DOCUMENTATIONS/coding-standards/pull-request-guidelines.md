# Pull Request Guidelines

## What It Is
Standard for creating, reviewing, and merging PRs to maintain quality and transparency.

## Why It Matters
Reduces defects reaching production, encourages knowledge sharing, and enforces architectural consistency.

## PR Template Sections
1. Summary (one sentence objective)
2. Context / Rationale
3. Linked Issues / Audit IDs
4. Changes Overview (bulleted)
5. Screenshots (UI) / Metrics (perf)
6. Test Evidence (unit counts, E2E run)
7. Rollback Plan
8. Checklist (lint, type, coverage, accessibility)

## Review Standards
- Block on security/auth changes without explicit sign-off.
- Request reduction if PR > ~400 lines diff (consider splitting).
- Enforce design token compliance on UI changes.

## Merge Rules
- All checks green.
- At least one reviewer approval (two for critical path).
- No unresolved review threads.

## Pitfalls / Anti-Patterns
- Drive-by approvals without reading.
- Large PRs mixing refactors and features.
- Missing rollback instructions for risky migrations.

## AI Guidance
Ask: "Draft PR description using template for feature X; include checklist prefilled from test outputs." Provide change bullets.

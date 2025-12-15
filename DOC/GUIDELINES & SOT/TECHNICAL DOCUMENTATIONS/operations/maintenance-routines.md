# Maintenance Routines

## What It Is
Recurring tasks preserving system health: dependency updates, refactors, audits, cleanup.

## Why It Matters
Prevents tech debt accumulation, security exposure, and performance drift.

## Cadence Table
| Frequency | Tasks |
|----------|-------|
| Weekly | Dependency vulnerability scan, log volume check |
| Monthly | Performance budget review, DB index analysis |
| Quarterly | Architecture review, token set audit, ADR reconciliation |
| Yearly | Full disaster recovery drill, permission matrix audit |

## Workflow
1. Generate maintenance issue list.
2. Prioritize by risk & impact.
3. Execute with separate PRs.
4. Document changes in maintenance log.

## Pitfalls / Anti-Patterns
- Skipping audits after major refactors.
- Bundling unrelated maintenance tasks into feature PRs.
- Lack of measurable outcomes.

## AI Guidance
Ask: "Create quarterly maintenance plan issue templates with task breakdown." Provide current backlog summary.

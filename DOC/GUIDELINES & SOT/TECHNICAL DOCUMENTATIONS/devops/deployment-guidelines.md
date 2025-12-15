# Deployment Guidelines

## What It Is
Standard operating procedure for shipping code to production reliably with rollback readiness.

## Why It Matters
Minimizes downtime, prevents configuration mistakes, and ensures traceability.

## Pre-Deploy Checklist
- [ ] All CI stages green
- [ ] Migrations reviewed & reversible
- [ ] Feature flags configured
- [ ] Rollback plan documented
- [ ] Monitoring dashboards updated

## Strategy
- Atomic deploy (no partial merges).
- Progressive rollout using feature flags where feasible.
- Avoid large weekend releases (support coverage risk).

## Rollback Procedure
1. Identify issue scope & severity.
2. Revert to previous deployment via Vercel.
3. Execute rollback migration if needed.
4. Document incident & prevention steps.

## Pitfalls / Anti-Patterns
- Deploying with known test failures.
- Bundling refactors + features.
- Unannounced breaking API changes.

## AI Guidance
Ask: "Draft rollback plan for migration changing column type; include steps + verification queries." Provide migration diff.

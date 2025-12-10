# Lighthouse Standards

## What It Is
Quality thresholds for automated Lighthouse audits covering Performance, Accessibility, Best Practices, SEO.

## Why It Matters
Provides objective measurement gating regressions before production deploys.

## Targets
| Category | Score |
|----------|-------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 90 |

## Audit Integration
- Run Lighthouse CI on critical routes (home, dashboard, signup, pricing).
- Compare delta vs previous build; >5% drop requires justification.

## Remediation Workflow
1. Identify failing metric.
2. Trace waterfall / coverage.
3. Implement targeted resource reduction / optimization.
4. Re-run local Lighthouse to confirm improvement.

## Pitfalls / Anti-Patterns
- Chasing arbitrary 100 score at expense of maintainability.
- Ignoring accessibility sub-scores.
- Over-optimizing while introducing complexity.

## AI Guidance
Ask: "Suggest remediation steps for Lighthouse performance drop from 92→84 (include prioritized list)." Provide audit JSON excerpt.

# Test Coverage Standards

## What It Is
Quantitative baseline ensuring critical logic paths are validated by automated tests.

## Why It Matters
Balances confidence and effort, preventing silent erosion of test quality while avoiding meaningless coverage pursuit.

## Targets
| Area | Lines | Branches |
|------|-------|----------|
| Core services (billing, auth) | ≥ 85% | ≥ 80% |
| General services | ≥ 80% | ≥ 75% |
| UI components (logic-heavy) | ≥ 70% | ≥ 60% |
| Utility pure functions | ≥ 95% | ≥ 95% |

## Enforcement
- CI fails if critical path coverage falls below threshold.
- Coverage diff reported in PR; large drops require rationale.

## Strategy
- Prioritize edge cases (null, empty, boundary values).
- Prefer branch coverage for business rule complexity.
- Remove dead code rather than writing tests for it.

## Pitfalls / Anti-Patterns
- Chasing 100% ignoring diminishing returns.
- Ignoring branch coverage for nested conditionals.
- Not updating thresholds after intentional refactor simplification.

## AI Guidance
Ask: "Analyze coverage report; list uncovered critical branches in service X and propose targeted test cases." Provide coverage JSON.

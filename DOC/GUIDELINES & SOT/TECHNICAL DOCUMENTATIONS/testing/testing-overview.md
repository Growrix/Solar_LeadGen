# Testing Overview

## What It Is
Unified testing strategy covering unit, integration, end-to-end, coverage enforcement, and mocking patterns.

## Why It Matters
Prevents regressions, validates architectural contracts, supports confident refactors, and enforces reliability and performance expectations.

## Test Pyramid Adaptation
| Level | Purpose | Tools | Frequency |
|-------|---------|-------|-----------|
| Unit | Logic correctness in isolation | Vitest/Jest | On each commit |
| Integration | Module interaction & data boundaries | Vitest + test DB | On PR |
| E2E | User flows + cross-layer validation | Playwright | Nightly + PR critical |
| Performance (Light) | Budget guardrails | Lighthouse CI | CI build |

## Principles
- Deterministic: Avoid time/random flakiness (mock clocks, seeds).
- Fast feedback: Keep unit tests < 300ms each.
- Clear naming: `should <expected>` pattern.
- Isolated side-effects: Use ephemeral test database.
- Trust boundaries: Only test across layers when interaction risk is meaningful.

## Folder Structure
```
tests/
  unit/
  integration/
  e2e/
```

## Pitfalls / Anti-Patterns
- Over-mocking leading to false confidence.
- Duplicating test logic across layers.
- Skipping assertions ("smoke" tests with no value).

## AI Guidance
Ask: "Generate unit tests for service X covering success, failure, permission denial; diff only." Provide service path.

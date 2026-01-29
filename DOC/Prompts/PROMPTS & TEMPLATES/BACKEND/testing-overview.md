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


## Test Script Requirements (MANDATORY)
Each test script must include:
- Clear, descriptive name and purpose.
- Setup and teardown logic.
- Coverage for success, failure, and edge cases.
- Reference to the feature or requirement tested (in comments or tags).
- Use of mocks/stubs where appropriate.
- Assertions for all expected outcomes.

## Test Script Template
```js
describe('Feature/Service Name', () => {
  beforeEach(() => { /* setup */ });
  afterEach(() => { /* teardown */ });

  it('should <expected behavior>', () => {
    // Arrange
    // Act
    // Assert
  });

  // ...more tests
});
```

## Traceability & Maintenance
- Every test must reference the feature, requirement, or user story it covers.
- Test scripts must be updated as features evolve; obsolete tests should be removed or refactored.

## Expanded AI Guidance
- When generating tests, always:
  - Use the provided template and folder structure.
  - Cover success, failure, and permission/edge cases.
  - Structure test descriptions clearly ("should <expected>").
  - Use mocks/stubs for external dependencies.
  - Ensure tests are idempotent and repeatable.
  - Reference the feature or requirement in comments.
  - Output only the diff or new/changed test code.
Ask: "Generate unit tests for service X covering success, failure, permission denial; diff only." Provide service path.

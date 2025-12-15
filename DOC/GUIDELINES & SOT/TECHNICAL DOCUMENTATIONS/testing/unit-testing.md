# Unit Testing

## What It Is
Testing smallest functional units (pure functions, small classes, helpers) in isolation.

## Why It Matters
Rapid defect detection, documents expected behavior, enables confident incremental changes.

## Best Practices
- One assertion concept per test (allow multiple related assertions).
- Use factories/builders for complex inputs; avoid manual object noise.
- Mock external boundaries only (DB, network); never internal pure functions.
- Maintain strict typing of test data.

## Example (Vitest)
```ts
import { describe, it, expect } from 'vitest';
import { calculateProration } from '../billing/calc';

describe('calculateProration', () => {
  it('should return zero when same plan', () => {
    expect(calculateProration('pro','pro',30)).toBe(0);
  });
  it('should increase cost when upgrading mid-cycle', () => {
    expect(calculateProration('basic','pro',15)).toBeGreaterThan(0);
  });
});
```

## Pitfalls / Anti-Patterns
- Snapshot tests for dynamic numeric output.
- Losing meaningful test names (`test1`, `caseA`).
- Asserting implementation details rather than outcomes.

## AI Guidance
Ask: "Create unit tests for function X (current code snippet below) ensuring all branches exhaustive." Provide function code.

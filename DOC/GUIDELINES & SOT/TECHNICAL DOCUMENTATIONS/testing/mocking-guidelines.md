# Mocking Guidelines

## What It Is
Standards for substituting dependencies during tests without compromising behavioral realism.

## Why It Matters
Prevents brittle tests, maintains confidence that integration points behave as expected, and avoids logic duplication in mocks.

## Principles
- Mock only boundaries (network, DB, external providers).
- Avoid mocking pure functions—test real logic.
- Use factories for complex objects; keep mocks minimal.
- Prefer lightweight fakes over deep jest mocks when behavior is simple.

## Example
```ts
const stripeMock = { createSubscription: vi.fn() };
vi.mock('../integrations/stripe', () => ({ stripeProvider: stripeMock }));
```

## Anti-Patterns
- Over-specifying mocks with unused fields.
- Conditional logic inside mock implementations diverging from real provider.
- Global state mutation inside mocks.

## Refactoring Guidance
If mocks become complex, consider introducing contract tests or splitting responsibilities.

## AI Guidance
Ask: "Refactor tests for service X to replace deep jest mocks with lightweight fakes; diff only." Provide current mock snippet.

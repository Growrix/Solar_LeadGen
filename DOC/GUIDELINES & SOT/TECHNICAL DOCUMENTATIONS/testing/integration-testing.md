# Integration Testing

## What It Is
Validates correct collaboration between multiple modules (service + repository + external adapter) using controlled test doubles or ephemeral DB.

## Why It Matters
Ensures layering assumptions hold, data mapping correct, and side-effects orchestrated properly.

## Scope Guidelines
- Cover serialization/parsing boundaries.
- Test repository + service combined (avoid hitting full UI).
- Use isolated test schema seeded with minimal fixtures.

## Example
```ts
describe('SubscriptionService', () => {
  it('creates subscription record after Stripe success', async () => {
    stripeMock.createSubscription.mockResolvedValue({ id: 'sub_123', status: 'active' });
    const result = await subscriptionService.create({ userId: 'u1', planId: 'pro' });
    expect(result.status).toBe('active');
    expect(db.subscription.findFirst({ where: { userId: 'u1' } })).resolves.toBeDefined();
  });
});
```

## Pitfalls / Anti-Patterns
- Overusing full e2e flows for repository verification.
- Writing integration tests that duplicate unit coverage without added assurance.

## AI Guidance
Ask: "Add integration test for service X interacting with repository Y; provide diff including mock setup." Provide file paths.

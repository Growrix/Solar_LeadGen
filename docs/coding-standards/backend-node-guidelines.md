# Backend Node Guidelines

## What It Is
Conventions for server action logic, service orchestration, and integration usage on Node runtime.

## Why It Matters
Improves reliability, traceability, and performance while preventing tight coupling and duplication.

## Best Practices
- Keep server actions thin: validate, authorize, delegate.
- Isolate integration logic (Stripe, Auth) behind provider interfaces.
- Use async/await; avoid promise nesting.
- Enforce idempotency for external writes (store request keys where needed).
- Propagate correlation IDs through service calls.
- Set explicit timeouts for outbound HTTP requests.
- Centralize configuration in environment module; validate on boot.

## Code Examples
```ts
export async function action(input: unknown){
  const valid = schema.parse(input);
  assertPermission(valid.userId,"billing.manage");
  return billingService.upgrade(valid.userId, valid.planId);
}
```

## Pitfalls / Anti-Patterns
- Fat actions containing business rules.
- Direct usage of raw Stripe client in multiple files.
- Silent catch blocks swallowing errors.
- Environment variables used without validation.

## AI Guidance
Ask: "Introduce correlation ID propagation in <service>; show diff including logging wrapper." Provide current function signature.

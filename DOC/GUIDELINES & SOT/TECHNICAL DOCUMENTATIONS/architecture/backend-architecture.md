# Backend Architecture

## What It Is
Server-side composition of actions, services, repositories, and integration adapters executed within Next.js runtime (Node/Edge) and Supabase.

## Why It Matters
Controls data integrity, security, performance, and scalability; defines clear seams for monitoring and future worker/queue introduction.

## Server Actions
Entry points: minimal orchestration, input validation, permission checks, call services, return typed result.

## Services
Contain business rules: combining repositories and integrations; no direct UI references.

## Repositories
Wrap Supabase/Postgres queries; enforce RLS alignment; return domain models.

## Integrations
Adapters for Stripe, Auth; handle idempotency and retry strategies.

## Error Strategy
- Domain errors -> typed (`DomainError`)
- Validation errors -> aggregated reporting
- Unexpected -> logged & sanitized

## Code Example (Domain Error)
```ts
class DomainError extends Error { constructor(public code: string, msg: string){super(msg);} }
export async function upgradePlanService(userId: string, planId: string){
  const user = await usersRepo.findById(userId);
  if(!user) throw new DomainError("USER_NOT_FOUND","User missing");
  return billingProvider.upgrade(user.stripeId, planId);
}
```

## Observability
- Correlation ID propagated from request to logs.
- Structured logging wrappers in actions.
- Metrics: counters for action calls, histogram for DB latency.

## Performance Practices
- Batch reads, prefer server-side streaming for large datasets.
- Cache idempotent configuration data (feature flags) with short TTL.

## Pitfalls / Anti-Patterns
- Service making direct HTTP calls without adapter
- Repository leaking raw client details upward
- Swallowing errors losing debugging context

## AI Guidance
Request: "Implement new service for invoice reconciliation: inputs X, outputs Y, integrate Stripe list endpoints; show action + service + repository diff." Include existing repo interfaces.

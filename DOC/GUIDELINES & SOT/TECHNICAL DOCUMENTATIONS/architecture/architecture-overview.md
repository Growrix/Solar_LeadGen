# Architecture Overview

## What It Is
High-level structural blueprint describing layers, boundaries, and cross-cutting concerns of the SaaS platform.

## Why It Matters
Ensures consistent decision-making, reduces accidental coupling, enables parallel work, and provides clear extension points for scaling features and teams.

## Core Layer Model
| Layer | Purpose | Allowed Dependencies |
|-------|---------|----------------------|
| UI (App Router) | Presentation, routing, accessibility | Design tokens, UI primitives, server actions (invocation only) |
| Server Actions | Entry-point for business workflows | Services, validation schemas, data gateways |
| Services | Business logic orchestration | Repositories, external integration clients, helpers |
| Repositories | Persistent data operations | Supabase client, SQL, cache layer |
| Integrations | External provider adapters (Stripe, Auth) | HTTP clients, signing libs |
| Shared Kernel | Types, interfaces, constants, token definitions | None (leaf) |

## Dependency Direction Rules
- UI never calls repositories directly.
- Services never import UI modules.
- Integrations isolated; replaceable behind interface contracts.
- Shared kernel is acyclic: no module may cause circular imports.

## Rendering Strategy
Prefer server components; use client components only for interactivity (forms, dynamic charts). Limit client JS footprint by hoisting logic to server actions.

## Extensibility Patterns
- Feature folders with colocated server actions + UI components.
- Interfaces for integration boundaries (`BillingProvider`, `StorageProvider`).
- ADR required for introducing new layer or cross-cutting mechanism.

## Cross-Cutting Concerns
| Concern | Implementation |
|---------|----------------|
| Validation | Zod schemas in service boundary |
| AuthZ | Role/permission checks inside server actions |
| Logging | Structured JSON at action entry + error points |
| Error Handling | Centralized error utilities returning typed results |
| Metrics | Lightweight counters/timers around critical actions |

## Code Example (Service + Action)
```ts
// server-actions/createSubscription.ts
import { createSubscriptionService } from "../services/subscription";
export async function createSubscriptionAction(input: CreateSubscriptionInput) {
  const validated = schema.parse(input);
  return await createSubscriptionService(validated);
}

// services/subscription.ts
export async function createSubscriptionService(input: CreateSubscriptionInput) {
  const customer = await usersRepo.findById(input.userId);
  const stripeSub = await billingProvider.createSubscription(customer.stripeId, input.planId);
  return await subscriptionRepo.persist(stripeSub);
}
```

## Best Practices
- Keep functions < ~50 lines; compose instead of nesting complexity.
- Centralize schema validation at action boundary.
- Provide narrow repository interfaces, no broad `*getAll*` style methods unless justified.
- Document non-trivial flows with sequence diagrams.

## Pitfalls / Anti-Patterns
- UI initiating DB queries
- Hidden side-effects in repository getters
- Fat client components duplicating server logic
- Coupling services to specific integration SDK details

## AI Guidance
Ask: "Need service + action for billing upgrade with validation, repository interfaces, error strategy. Files: X, Y." Request diff of new modules, not full rewrites.

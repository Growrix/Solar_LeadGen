# System Diagrams

## What It Is
Textual/ASCII sequence and component diagrams illustrating data, control, and integration flows.

## Why It Matters
Clarifies runtime interactions, reduces misimplementation risk, and serves as reference during audits and scaling decisions.

## Component Diagram (ASCII)
```
 [Browser]
     |
     v
 [Next.js App Router]
     |
     v
 [Server Actions] ---> [Auth (Supabase)]
     |                      |
     v                      v
 [Service Layer] ----> [Stripe API]
     |                      |
     v                      v
 [Repositories] ---> [Postgres (Supabase)]
     |
     v
 [Storage (Supabase)]
```

## Subscription Creation Sequence
```
User -> UI Form -> createSubscriptionAction -> validation(schema) -> subscriptionService -> usersRepo -> billingProvider(Stripesub) -> subscriptionRepo.persist -> return result -> UI success state
```

## Error Logging Flow
```
Server Action catches domain error -> map to standard error object -> log structured {event:error, id, correlationId} -> return sanitized message to UI
```

## Data Access Flow
```
Action -> Service -> Repository -> Supabase Query -> Row Level Security -> Result -> Service (transform) -> Action (shape response)
```

## Best Practices
- Keep diagrams current; update when flow changes.
- Use consistent entity names across diagrams and code.
- Sequence diagrams for any multi-step external integration.

## Pitfalls / Anti-Patterns
- Diagrams diverging from code reality
- Overly complex diagrams with low signal
- Missing error/rollback paths depiction

## AI Guidance
When adding a feature, request: "Generate sequence diagram for <feature> invoking existing layers X,Y." Provide involved module paths.

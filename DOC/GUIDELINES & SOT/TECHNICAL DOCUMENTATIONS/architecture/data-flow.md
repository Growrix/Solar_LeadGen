# Data Flow

## What It Is
Lifecycle of data from user input through validation, persistence, transformation, retrieval, and presentation.

## Why It Matters
Optimizes correctness, performance, and maintainability; prevents duplication and inconsistent transformations.

## Flow Stages
| Stage | Description | Artifacts |
|-------|-------------|-----------|
| Input | User submits form/action | UI component, input schema |
| Validation | Shape & constraints enforced | Zod schema, error map |
| Authorization | Permission + RLS alignment | Permission helper, Supabase policy |
| Processing | Business logic & integration calls | Services, integration adapters |
| Persistence | Write to DB/storage | Repositories, migrations |
| Retrieval | Query & transform for output | Repositories, mappers |
| Presentation | Structured response to UI | Action result envelope |

## Example Flow (Update Profile)
```
Form -> submit -> action.validate(schema) -> assertPermission(user,"profile.update") -> service.applyChanges -> repo.updateRow -> action.return(sanitized profile)
```

## Data Transformation Rules
- Use DTO mappers (domain → response) to avoid leaking internal fields.
- Strip sensitive fields early (e.g., `stripe_customer_id` not exposed to UI).

## Caching (Future Consideration)
Read-most patterns eligible for short TTL caching at repository layer with invalidation on write.

## Best Practices
- Single source of truth for each entity.
- Avoid redundant parallel writes.
- Maintain idempotency for external integration updates (Stripe webhooks).

## Pitfalls / Anti-Patterns
- Validation scattered across multiple layers
- Returning raw database rows directly to UI
- Hidden implicit transformations in UI components

## AI Guidance
Ask: "Need profile update data flow verification; show each stage with existing file references; propose mapper addition diff." Provide current schema path.

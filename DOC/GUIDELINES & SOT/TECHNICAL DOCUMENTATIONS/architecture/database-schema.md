# Database Schema

## What It Is
Canonical relational model for core SaaS entities stored in PostgreSQL (Supabase), including naming, indexing, and security rules.

## Why It Matters
Defines data integrity, access control, performance characteristics, and evolution strategy through migrations.

## Core Tables (Conceptual)
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| users | Account identities | id (PK), email (unique), stripe_customer_id, created_at |
| roles | Role definitions | id, name (unique), description |
| user_roles | Mapping users→roles | user_id (FK), role_id (FK) |
| permissions | Atomic actions | id, code (unique), description |
| role_permissions | Role→permission map | role_id, permission_id |
| subscriptions | Billing state | id, user_id, plan_id, status, current_period_end |
| audit_logs | Immutable event trail | id, entity_type, entity_id, action, actor_id, timestamp |
| feature_flags | Configurable toggles | key (PK), enabled, rollout_ratio |

## Naming Conventions
- snake_case for columns, plural table names.
- Foreign keys `<referenced>_id`.
- Timestamp columns: `created_at`, `updated_at`.

## Index Strategy
- Primary key: surrogate UUID v4.
- Unique indexes: natural keys (email, permission code).
- Composite indexes for frequent filters (e.g., `subscriptions(user_id, status)`).

## Row Level Security (RLS)
- Enabled on all user-scoped tables.
- Policies: `user_is_self`, `role_based_access`, `public_read` (only if safe).

## Migration Guidelines
- Forward-only scripts; never edit past migrations.
- Add columns nullable, backfill, then set NOT NULL.
- Drop unused columns in two-phase (deprecate then remove).

## Example (Pseudo Migration)
```sql
ALTER TABLE subscriptions ADD COLUMN trial_ends_at TIMESTAMPTZ NULL;
-- backfill logic external
ALTER TABLE subscriptions ALTER COLUMN trial_ends_at SET NOT NULL; -- after backfill
```

## Best Practices
- Explicit default values.
- Avoid polymorphic foreign keys; use join tables.
- Normalize until read performance demands selective denormalization.

## Pitfalls / Anti-Patterns
- JSON blobs for relational data
- Missing unique constraints relying only on app logic
- RLS disabled or overly permissive policies

## AI Guidance
Ask: "Need migration adding usage metering table with RLS policies; provide SQL forward-only script + rationale." Include existing naming rules.

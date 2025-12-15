# Auth Architecture

## What It Is
Authentication & authorization model leveraging Supabase Auth and PostgreSQL RLS + role/permission matrices.

## Why It Matters
Secures data, enforces business boundaries, and underpins trust & compliance while enabling future multi-tenant expansion.

## Authentication Flow
1. User signs in via Supabase Auth (email/password or OAuth).
2. Session token stored client-side (httpOnly cookie preferred for security).
3. Server actions derive user context from validated session.

## Authorization Strategy
- Role-based + fine-grained permissions.
- Composite checks: role → permission → record-level policy (RLS) → action-specific guard.

## Permission Modeling
```ts
// permission codes example
const PERMISSIONS = {
  BILLING_VIEW: "billing.view",
  BILLING_MANAGE: "billing.manage",
  USER_INVITE: "user.invite"
} as const;
```

## RLS Policy Example (Conceptual)
```sql
CREATE POLICY user_select_self ON users FOR SELECT USING ( auth.uid() = id );
```

## Session Handling
- Short-lived access tokens; refresh strategy via Supabase.
- Correlation ID generation per request for traceability.

## Best Practices
- Central permission check helper (`assertPermission(user, code)`).
- Fail fast with 403 on denial.
- Log denied attempts (without sensitive context).

## Pitfalls / Anti-Patterns
- Hardcoding role checks inside UI components
- Mixing auth & business logic
- Broad admin roles with unchecked privileges

## AI Guidance
Ask: "Add new permission for export reports; update role assignment logic + RLS policy diff." Provide existing permission constants path.

# Authorization Rules

## What It Is
Policies determining which authenticated identities may perform actions or access resources.

## Why It Matters
Prevents privilege escalation and inadvertent data exposure.

## Model
- Roles (admin, user, support)
- Permissions (atomic capabilities)
- RLS policies (row-level enforcement)
- Action guards (runtime checks)

## Implementation Steps
1. Define permission codes.
2. Map permissions to roles.
3. Create RLS policies for table-level row filtering.
4. Add `assertPermission` helper in server action boundary.

## Code Example
```ts
function assertPermission(user: UserContext, perm: string){
  if(!user.permissions.includes(perm)) throw new Error('PERMISSION_DENIED');
}
```

## Pitfalls / Anti-Patterns
- Hardcoding role names inside random functions.
- Skipping RLS assuming app logic is sufficient.
- Broad wildcard permissions.

## AI Guidance
Ask: "Add new permission 'reports.export'; update role mapping + RLS checks diff." Provide mapping file path.

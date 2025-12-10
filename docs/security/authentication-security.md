# Authentication Security

## What It Is
Controls ensuring user identity is verified and session integrity safeguarded.

## Why It Matters
Prevents account takeover, session hijacking, and unauthorized resource access.

## Practices
- Use Supabase Auth built-in providers; avoid custom password handling.
- Enforce email verification for access beyond onboarding.
- Short-lived access tokens; refresh securely.
- Store tokens in httpOnly cookies when feasible.
- Regenerate session identifiers on privilege elevation.

## Session Protection
| Risk | Control |
|------|---------|
| Token Theft | httpOnly + SameSite cookies |
| Replay Attack | Nonce + timestamp validation in sensitive flows |
| Brute Force | Rate-limit login attempts |

## Code Example (Session Extraction)
```ts
export function requireAuth(ctx: RequestContext){
  const session = ctx.auth.getSession();
  if(!session) throw new Error('AUTH_REQUIRED');
  return session.user.id;
}
```

## Pitfalls / Anti-Patterns
- Storing tokens in localStorage without reason.
- Exposing detailed auth errors (enumeration risk).
- Mixing auth retrieval logic inside UI components.

## AI Guidance
Ask: "Refactor auth usage in action X to centralized helper; diff only; ensure error codes standardized." Provide current snippet.

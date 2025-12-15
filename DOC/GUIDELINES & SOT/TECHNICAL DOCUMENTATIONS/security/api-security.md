# API Security

## What It Is
Controls protecting server actions and optional external endpoints from misuse and exploitation.

## Why It Matters
Prevents injection, abuse, enumeration, and resource exhaustion.

## Threats & Mitigations
| Threat | Mitigation |
|--------|-----------|
| Injection | Parameterized queries, schema validation |
| Broken Auth | Centralized session checks |
| Excessive Data Exposure | DTO mapping, field whitelists |
| Rate Abuse | Rate limiting (future) |
| CSRF | SameSite cookies, token for unsafe methods |
| Replay | Nonce/timestamp for sensitive operations |

## Validation Pattern
```ts
const input = schema.parse(req.body);
```

## Response Hardening
- Uniform envelope; no debug info.
- Omit stack traces.

## Pitfalls / Anti-Patterns
- Dynamic eval/hooks from input.
- Overly permissive CORS.
- Inconsistent validation leading to logic assumptions.

## AI Guidance
Ask: "Harden action X: add zod validation + error envelope; provide diff." Provide current function.

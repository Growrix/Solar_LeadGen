# Secrets Management

## What It Is
Secure handling of sensitive configuration: API keys, tokens, encryption keys.

## Why It Matters
Prevents credential leaks enabling lateral movement or data exfiltration.

## Practices
- Store secrets only in environment variables or managed secret store.
- Never commit `.env` with production values.
- Rotate keys on schedule or upon suspicion of compromise.
- Use least privilege for API keys (Stripe restricted keys where possible).
- Provide secret schema validation on app start.

## Code Example (Runtime Validation)
```ts
const env = {
  STRIPE_KEY: process.env.STRIPE_KEY,
};
if(!env.STRIPE_KEY) throw new Error('Missing STRIPE_KEY');
```

## Pitfalls / Anti-Patterns
- Printing secrets to logs.
- Sharing secrets via unsecured channels.
- Using same secret across environments.

## AI Guidance
Ask: "Add runtime env validation for new secret; provide module diff + usage." Provide secret name.

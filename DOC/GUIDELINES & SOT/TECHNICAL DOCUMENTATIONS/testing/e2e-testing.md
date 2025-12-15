# E2E Testing

## What It Is
Browser-driven validation of complete user journeys across UI, backend, and integrations.

## Why It Matters
Protects critical revenue and adoption flows from regressions and integration failures.

## Candidate Flows
| Flow | Criticality |
|------|-------------|
| Signup → Email Verify → Dashboard | High |
| Upgrade Plan → Payment Success | High |
| Login → Settings Update | Medium |
| Password Reset | Medium |

## Best Practices
- Keep flows atomic; one user journey per spec.
- Use data-test ids for selectors; avoid brittle text selectors.
- Parallelize specs; isolate test accounts.
- Capture screenshots on failure for debugging.

## Example (Playwright)
```ts
test('user can upgrade plan', async ({ page }) => {
  await page.goto('/login');
  // ... auth helper
  await page.click('[data-test="upgrade-button"]');
  await expect(page.locator('[data-test="plan-status"]')).toHaveText('Pro');
});
```

## Pitfalls / Anti-Patterns
- Monolithic specs covering multiple flows.
- Reliance on visual layout selectors.
- Flaky timing due to missing explicit waits on network/selector readiness.

## AI Guidance
Ask: "Generate Playwright test for signup flow using existing data-test ids; include assertions for post-signup redirects." Provide list of selectors.

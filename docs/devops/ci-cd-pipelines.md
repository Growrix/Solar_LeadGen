# CI/CD Pipelines

## What It Is
Automated workflows (GitHub Actions → Vercel) validating, building, and deploying code safely.

## Why It Matters
Reduces manual error, enforces quality gates, accelerates delivery cadence while preserving reliability.

## Pipeline Stages
| Stage | Purpose | Blocking Criteria |
|-------|---------|------------------|
| Checkout & Setup | Retrieve code, install deps | Lockfile integrity |
| Static Analysis | Lint, type check | Any errors/warnings on changed lines |
| Unit & Integration Tests | Validate logic | Test failures |
| Build | Create production artifact | Build errors; size regression >5% |
| Security Scan | Dependencies & secrets | High/Critical vulnerabilities |
| Lighthouse Audits | Performance & a11y | Scores below threshold |
| Deploy | Ship to Vercel | Previous failures |

## Example Workflow Snippet
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint && npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build
```

## Best Practices
- Cache npm dependencies to reduce build times.
- Fail fast; place static analysis early.
- Upload coverage and Lighthouse artifacts for PR review.
- Use concurrency group to auto-cancel superseded runs.

## Pitfalls / Anti-Patterns
- Long-running jobs without caching.
- Non-deterministic tests passing intermittently.
- Hidden manual steps post-deploy.

## AI Guidance
Ask: "Add Lighthouse stage to existing workflow; diff only." Provide current YAML.

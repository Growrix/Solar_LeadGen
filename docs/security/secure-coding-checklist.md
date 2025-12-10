# Secure Coding Checklist

## What It Is
Actionable verification list prior to merging any code touching security-relevant paths.

## Why It Matters
Standardizes review, reduces human oversight, prevents regressions.

## Checklist
- [ ] Input validation at boundary
- [ ] Permissions asserted
- [ ] No hardcoded secrets
- [ ] No sensitive data logged
- [ ] Error messages sanitized
- [ ] Dependencies scanned (no high vulns)
- [ ] RLS policies unaffected or updated
- [ ] Tests cover success/failure paths
- [ ] Correlation ID present
- [ ] No direct raw client leakage

## Code Example (Checklist Integration)
Add section in PR description referencing each item.

## Pitfalls / Anti-Patterns
- Treating checklist as optional.
- Checking items without evidence.

## AI Guidance
Ask: "Evaluate diff against secure coding checklist; list missing items with remediation suggestions." Provide patch.

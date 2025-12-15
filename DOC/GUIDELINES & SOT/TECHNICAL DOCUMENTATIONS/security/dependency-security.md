# Dependency Security

## What It Is
Lifecycle management of third-party libraries to mitigate vulnerabilities and supply chain risks.

## Why It Matters
Reduces attack surface and prevents exploit of known CVEs.

## Practices
- Pin versions; avoid floating ranges.
- Weekly vulnerability scan using CI tooling.
- Remove unused dependencies promptly.
- Evaluate alternative if package shows maintenance abandonment.
- Lockfile diffs reviewed in PRs.

## Risk Assessment Criteria
| Factor | Consideration |
|--------|--------------|
| Popularity | Community support / updates |
| Maintenance | Last release recency |
| Security | Known advisories |
| Complexity | Transitive dependency count |

## Pitfalls / Anti-Patterns
- Installing heavy libs for trivial utilities.
- Ignoring deprecation warnings.
- Manual patching without documenting.

## AI Guidance
Ask: "Assess new dependency X; produce risk table and recommendation." Provide package name & purpose.

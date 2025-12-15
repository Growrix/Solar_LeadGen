# Documentation Style

## What It Is
Guidelines for authoring internal markdown docs for clarity, consistency, and AI usability.

## Why It Matters
Ensures discoverability, reduces ambiguity, and improves model grounding for code generation.

## Structure Rules
- Start with: What It Is / Why It Matters / Best Practices / Examples / Pitfalls / AI Guidance.
- Use descriptive headers ≤ 3 levels deep.
- Prefer tables for structured comparisons; lists for sequences.
- Include code blocks with language tags for syntax clarity.
- Provide relative paths instead of absolute environment-specific paths.

## Formatting Conventions
- Sentence case for headings after first word capitalization.
- Avoid excessive bold/italics; emphasize only key terms.
- Wrap commands in backticks; multiline shell in fenced blocks.

## Examples
```md
## Best Practices
- Keep sections short
- Cross-link related docs
```

## Pitfalls / Anti-Patterns
- Wall-of-text paragraphs.
- Outdated examples diverging from code.
- Ambiguous placeholders without explanation.

## AI Guidance
Ask: "Generate documentation page for new caching layer following style rules; include pitfalls and AI guidance section." Provide feature summary.

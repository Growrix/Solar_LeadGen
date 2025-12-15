# TypeScript Style Guide

## What It Is
Opinionated TypeScript conventions ensuring safety, readability, and predictable evolution.

## Why It Matters
Reduces defects, improves IntelliSense quality, and enables AI/humans to make consistent changes without regressions.

## Best Practices
- Enable `strict` mode; never disable individual safety flags casually.
- Use explicit return types for exported functions and public class methods.
- Prefer `type` aliases over `interface` unless extension is required—avoid frivolous interface usage.
- Use discriminated unions for variant states; avoid boolean parameter explosions.
- Narrow unknown inputs with schema validation (e.g., zod) before use.
- Avoid `any`; use `unknown` + refinement if necessary.
- Leverage `Readonly<T>` for immutable structures passed across layers.
- Favor composition over inheritance; classes seldom needed.
- Keep enums as `const` objects + union types for better tree-shaking.
- Use `satisfies` to validate object shapes while preserving inference.

## Code Examples
```ts
// Discriminated union
type LoadState = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: Data };

// Const object + union
const ROLES = { ADMIN: "admin", USER: "user" } as const;
type Role = typeof ROLES[keyof typeof ROLES];

// Avoid any
function parse(input: unknown): Payload { return schema.parse(input); }
```

## Pitfalls / Anti-Patterns
- Using `as` assertions to silence type errors.
- Wide types (`Record<string, any>`) for structured data.
- Exporting deeply nested namespaces increasing cognitive overhead.
- Depending on ambient types from test libraries in production code.

## AI Guidance
Request: "Provide diff adding discriminated union for load state in <file>; preserve existing function signatures; include exhaustive switch guard." Supply current type snippet.

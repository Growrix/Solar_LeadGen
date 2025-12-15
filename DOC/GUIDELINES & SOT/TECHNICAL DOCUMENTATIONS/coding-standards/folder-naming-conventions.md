# Folder & Naming Conventions

## What It Is
Rules for naming folders, files, and code symbols to maintain predictability.

## Why It Matters
Reduces cognitive load, improves searchability, and aids AI navigation.

## Best Practices
- Feature folders: `feature-name/` (kebab-case).
- React components: PascalCase file & export (`UserCard.tsx`).
- Hooks: `useThing.ts` naming.
- Tests: mirror structure with `.test.ts` suffix.
- Config modules: `config/` directory; avoid scattering env references.
- Avoid abbreviations except standard (api, db, id).

## Examples
```
services/
  billing/
    upgradePlan.ts
components/
  ui/Button.tsx
```

## Pitfalls / Anti-Patterns
- Mixed casing within same folder.
- Generic folder names (`misc`, `stuff`).
- Overloaded index files exporting unrelated concerns.

## AI Guidance
Ask: "Normalize naming in path <X>; propose diffs renaming non-compliant files; list impacts." Provide current tree snippet.

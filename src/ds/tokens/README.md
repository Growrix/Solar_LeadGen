# Tokens (legacy folder)

This folder is intentionally kept to match the original blueprint structure, but **token values are not defined here**.

## Where tokens actually live
- **Source of truth (CSS variables):** `src/ds/styles/ds.tokens.css`
- **Typed references / metadata surface:** `src/ds/foundation/tokens/*`

## How to use tokens in code
- Components should consume tokens **via DS classes** (preferred), or via the typed references in `foundation/tokens` when you need a stable variable reference.
- Pages/features should **not** hardcode values (no hex, no px) and should import UI only from the DS entry: `@/ds`.

## Why keep this folder?
- It avoids confusion when following older docs/blueprints that mention `src/ds/tokens/`.
- If we later move token metadata to a first-class module, this folder can become the public token export surface.

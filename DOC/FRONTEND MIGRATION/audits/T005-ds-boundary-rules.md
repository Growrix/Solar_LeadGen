# T005 — DS Export Boundary Rules

**Date**: 2026-03-14  
**Status**: Implemented and enforced.

---

## Rule

`src/ds/index.ts` is the **single public barrel** for the Design System. It must export only **DS-owned assets**:

1. **Primitives** — generic building blocks (Button, Input, Card, Modal, etc.)
2. **Shared components** — cross-feature presentational components (EmptyState, Skeleton, DataTable, etc.)
3. **Layouts** — structural wrappers (Section, Grid, Stack, etc.)
4. **Theme / runtime helpers** — ThemeProvider, ThemeInitScript, AppChrome, PlatformPresetScript
5. **Icons** — exported from `src/ds/icons.ts`
6. **Generic presentational contracts** — anything intentionally elevated to shared DS infrastructure

## What Must NOT be Exported from `@/ds`

- Feature-specific components that belong to `src/components/`:
  - Quote forms, OTP flows, result widgets
  - Homeowner/installer-specific modals
  - Any component whose logic is domain-specific

## The Test

> If removing a component from `src/ds/index.ts` would only break one feature's import, it belongs in `src/components/`, not `@/ds`.

---

## Violations Found and Fixed (T004)

| Component | Old Import | Corrected To |
|---|---|---|
| `OTPVerificationModal` | `from '@/ds'` | `from '@/components/OTPVerificationModal'` |
| `SavingsChart` | `from '@/ds'` | `from '@/components/SavingsChart'` |

---

## `src/ds/index.ts` Alignment

Current `src/ds/index.ts` exports were audited. All existing exports are DS-owned (primitives, shared components, layouts, theme helpers). No further cleanup required after T004 fixes.

---

## Enforcement Going Forward

- TypeScript gate (`tsconfig.gate.json`) will catch new barrel misuses at CI time since importing a non-exported member from `@/ds` produces a TS2305 error.
- The audit script extended in T009 also checks for DS barrel misuse patterns programmatically.

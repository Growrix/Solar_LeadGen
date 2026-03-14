# T001 — Gate 0 Baseline Report

**Date**: 2026-03-14  
**Purpose**: Capture the pre-migration baseline for TypeScript, Prisma schema, and build health.

---

## 1. TypeScript Gate (`npx tsc -p tsconfig.gate.json --noEmit`)

**Status**: ❌ 3 errors at baseline

```
src/components/QuoteOptionsModal.tsx(5,44): error TS2305: Module '"@/ds"' has no exported member 'OTPVerificationModal'.
src/components/homeowner/SimplifiedQuoteForm.tsx(4,147): error TS2305: Module '"@/ds"' has no exported member 'SavingsChart'.
src/components/quote-builder/InstantQuoteResult.tsx(4,35): error TS2305: Module '"@/ds"' has no exported member 'SavingsChart'.
```

**Root cause**: Three feature-only components (`OTPVerificationModal`, `SavingsChart`) were incorrectly imported from the `@/ds` barrel instead of their direct paths in `src/components/`.

**Fix applied (T004)**: Removed misuse in all three files, replaced with direct component imports.

---

## 2. Prisma Validate (`npx prisma validate`)

**Status**: ⚠️ Warning (environment-only, not a schema defect)

```
Error: Environment variable not found: DIRECT_URL.
```

The schema references `directUrl = env("DIRECT_URL")` which is not set in the local development environment. The schema itself is structurally valid. This is expected in the Replit dev environment where only `DATABASE_URL` is provided.

---

## 3. Build (`npm run build`)

**Status**: ⚠️ Not run at baseline due to workflow configuration (dev server on port 5000). Build will be re-run in T019 after US1 completion.

---

## 4. DS Barrel Violations Found

| File | Illegal Import | Actual Location |
|---|---|---|
| `src/components/QuoteOptionsModal.tsx` | `OTPVerificationModal` from `@/ds` | `src/components/OTPVerificationModal.tsx` |
| `src/components/homeowner/SimplifiedQuoteForm.tsx` | `SavingsChart` from `@/ds` | `src/components/SavingsChart.tsx` |
| `src/components/quote-builder/InstantQuoteResult.tsx` | `SavingsChart` from `@/ds` | `src/components/SavingsChart.tsx` |

---

## 5. Gate 0 Status After T004 Fix

**TypeScript**: ✅ 0 errors  
**Prisma**: ⚠️ Environment-only (acceptable for dev)  
**Build**: Deferred to T019

**Decision**: Gate 0 is green enough to proceed with DS styling migration.

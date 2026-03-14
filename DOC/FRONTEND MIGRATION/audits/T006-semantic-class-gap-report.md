# T006 — Semantic Class Gap Report

**Date**: 2026-03-14  
**Scope**: Legacy class names used in feature files but not defined in `src/ds/styles/*.css`

---

## Method

Grepped all `src/components/**/*.tsx` for the semantic class names listed in newtasks.md, then confirmed each against `src/ds/styles/ds.utilities.css` and `src/ds/styles/ds.components.css`.

---

## Gap Inventory

### 1. Toggle Switch — `toggle-switch` / `toggle-knob`

**Used in**:
- `src/components/homeowner/SimplifiedQuoteForm.tsx` (7 occurrences)
- `src/components/InstantQuoteForm.tsx` (multiple occurrences)

**Variants in use**:
- `toggle-switch`, `toggle-switch-sm`, `toggle-switch-md`, `toggle-switch-on`, `toggle-switch-off`
- `toggle-knob`, `toggle-knob-sm`, `toggle-knob-md`, `toggle-knob-on-sm`, `toggle-knob-off-sm`, `toggle-knob-on-md`, `toggle-knob-off-md`

**Status**: ❌ Not defined in DS. Must be added to `ds.components.css`.

---

### 2. Detail Card — `detail-card` / `detail-card-header`

**Used in**:
- `src/components/SavingsChart.tsx` (2 occurrences)

**Status**: ❌ Not defined in DS. Must be added to `ds.components.css`.

---

### 3. Cost / Performance Labels — `cost-item-label` / `performance-item-label` / `performance-item-value`

**Used in**:
- `src/components/SavingsChart.tsx` (3 occurrences)

**Status**: ❌ Not defined in DS. Must be added to `ds.utilities.css`.

---

### 4. Info Section — `info-section`

**Used in**:
- `src/components/homeowner/SimplifiedQuoteForm.tsx` (6+ occurrences)
- `src/components/homeowner/LeadPreviewModal.tsx` (10 occurrences)

**Status**: ❌ Not defined in DS. Must be added to `ds.utilities.css`.

---

### 5. Neu Card — `neu-card`

**Used in**: Not found in active component files (potential legacy remnant).

**Status**: ⚠️ Not in active use. Define as stub or skip.

---

### 6. Panel Surface — `panel-surface`

**Used in**: Not found in active component scans.

**Status**: ⚠️ Not in active use. Define as stub for future use.

---

## Summary Table

| Class Family | Used In | Defined in DS | Action |
|---|---|---|---|
| `toggle-switch` / `toggle-knob` | SimplifiedQuoteForm, InstantQuoteForm | ❌ No | Add to `ds.components.css` |
| `detail-card` / `detail-card-header` | SavingsChart | ❌ No | Add to `ds.components.css` |
| `cost-item-label` / `performance-item-*` | SavingsChart | ❌ No | Add to `ds.utilities.css` |
| `info-section` | SimplifiedQuoteForm, LeadPreviewModal | ❌ No | Add to `ds.utilities.css` |
| `neu-card` | Not found active | ❌ No | Stub in `ds.components.css` |
| `panel-surface` | Not found active | ❌ No | Stub in `ds.utilities.css` |

---

## Required Action (T007)

All 6 class families must be implemented as DS-owned semantic contracts using DS tokens. Feature files must not need to be changed — the CSS definitions simply need to exist in `src/ds/styles/`.

# Homepage Audit Report (T105)

**Date**: 2025-10-29  
**File**: `src/app/page.tsx`  
**Total Lines**: 383  
**Phase**: 12 - Legacy Migration  
**Tasks**: T105-T111

---

## Summary

The Homepage (`src/app/page.tsx`) is the landing page with minimal hardcoded values. It primarily contains business logic for quote/rebate calculators and defers most UI to child components (Hero, InstantQuoteForm, RebateCalculatorForm, BlogSection, etc.).

### Hardcoded Values Found

| Category | Count | Percentage |
|----------|-------|------------|
| **Colors** | 8 | 47% |
| **Spacing** | 0 | 0% |
| **Typography** | 4 | 23% |
| **Border Radius** | 4 | 24% |
| **Shadows** | 1 | 6% |
| **Animations** | 0 | 0% |
| **TOTAL** | **17** | **100%** |

---

## Detailed Breakdown

### 1. Colors (8 issues)

#### Main Background (Lines 269, 276, 362)
```tsx
// ❌ Before
<main className="bg-bg-primary dark:bg-black">
<section className="py-16 lg:py-24 bg-bg-primary">

// ✅ After
<main className="bg-background">
<section className="py-16 lg:py-24 bg-background">
```
**Rationale**: `bg-bg-primary` is legacy, use semantic `bg-background`. Remove manual `dark:bg-black`.

#### Heading Text (Line 280)
```tsx
// ❌ Before
<h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">

// ✅ After
<h2 className="text-heading-1 lg:text-heading-1 font-bold text-foreground mb-4">
```
**Rationale**: Use `text-foreground` for automatic theme adaptation.

#### Description Text (Line 283)
```tsx
// ❌ Before
<p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">

// ✅ After
<p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
```
**Rationale**: `text-muted-foreground` for secondary text.

#### Calculator Switcher - Active Button (Lines 298-299, 308-309)
```tsx
// ❌ Before
className={`... ${
  activeCalculator === 'quote' ? 'text-primary' : 'text-slate-600 dark:text-slate-300'
}`}

// ✅ After
className={`... ${
  activeCalculator === 'quote' ? 'text-primary' : 'text-muted-foreground'
}`}
```
**Rationale**: `text-primary` already semantic, change `text-slate-600 dark:text-slate-300` to `text-muted-foreground`.

---

### 2. Typography (4 issues)

#### Heading Size (Line 280)
```tsx
// ❌ Before
<h2 className="text-3xl lg:text-5xl font-bold ...">

// ✅ After
<h2 className="text-heading-2 lg:text-heading-1 font-bold ...">
```
**Rationale**: Use semantic typography scale. Mobile: heading-2, Desktop: heading-1.

#### Description Size (Line 283)
```tsx
// ❌ Before
<p className="text-lg ...">

// ✅ After
<p className="text-body-large ...">
```
**Rationale**: Semantic typography token.

#### Button Text Size (Lines 298, 308)
```tsx
// ❌ Before
<button className="... text-sm font-semibold ...">

// ✅ After
<button className="... text-button font-semibold ...">
```
**Rationale**: Use `text-button` semantic token (currently text-sm, but centralized).

---

### 3. Border Radius (4 issues)

#### Calculator Switcher Container (Line 290)
```tsx
// ❌ Before
<div className="... p-1 rounded-full flex border ...">

// ✅ After
<div className="... p-1 rounded-full flex border ...">
```
**Rationale**: `rounded-full` is semantic (pill shape), keep as-is.

#### Active Indicator (Line 291)
```tsx
// ❌ Before
<div className="... rounded-full theme-switcher-active ...">

// ✅ After
<div className="... rounded-full theme-switcher-active ...">
```
**Rationale**: `rounded-full` is semantic, keep as-is.

#### Buttons (Lines 297, 307)
```tsx
// ❌ Before
<button className="... rounded-full">

// ✅ After
<button className="... rounded-button">
```
**Rationale**: **Change to `rounded-button`** for consistency with design system (unless pill shape is intentional).

---

### 4. Shadows (1 issue)

#### Active Indicator Shadow (Line 291)
```tsx
// ❌ Before
<div className="... shadow-lg transition-transform ...">

// ✅ After
<div className="... shadow-button transition-transform ...">
```
**Rationale**: Use semantic `shadow-button` (Level 1 elevation).

---

### 5. Animations (0 issues)

#### Duration Already Semantic (Line 291, 297, 307)
```tsx
// ✅ Already correct
<div className="... transition-transform duration-300 ease-in-out ...">
<button className="... transition-colors duration-300 ...">
```
**Rationale**: `duration-300` maps to `duration-normal` semantic token. No changes needed unless we want explicit token usage.

**Decision**: Keep `duration-300` as-is (primitive allowed for animations) OR change to `duration-normal` for explicitness.

---

## Token Mapping Strategy

### Colors → Semantic Tokens
| Hardcoded Value | Semantic Token | Context |
|-----------------|----------------|---------|
| `bg-bg-primary` | `bg-background` | Main background |
| `dark:bg-black` | *(remove)* | Handled by `bg-background` |
| `text-slate-900 dark:text-white` | `text-foreground` | Primary text |
| `text-slate-600 dark:text-slate-400` | `text-muted-foreground` | Secondary text |
| `text-slate-600 dark:text-slate-300` | `text-muted-foreground` | Inactive button |
| `text-primary` | `text-primary` | *(already semantic)* |

### Typography → Semantic Tokens
| Hardcoded Value | Semantic Token | Context |
|-----------------|----------------|---------|
| `text-3xl` | `text-heading-2` | Mobile heading |
| `lg:text-5xl` | `lg:text-heading-1` | Desktop heading |
| `text-lg` | `text-body-large` | Description text |
| `text-sm` | `text-button` | Button text |

### Border Radius → Semantic Tokens
| Hardcoded Value | Semantic Token | Context |
|-----------------|----------------|---------|
| `rounded-full` (container/indicator) | `rounded-full` | *(keep - pill shape)* |
| `rounded-full` (buttons) | `rounded-button` | Consistent buttons |

### Shadows → Semantic Tokens
| Hardcoded Value | Semantic Token | Context |
|-----------------|----------------|---------|
| `shadow-lg` | `shadow-button` | Active indicator |

---

## High-Impact Refactoring Opportunities

### 1. **Calculator Switcher Component** (Lines 290-318)
**Impact**: 10 values → semantic tokens  
**Before**: Manual theme colors, hardcoded sizes  
**After**: All semantic tokens, automatic theme adaptation

```tsx
// Before: 10 hardcoded values
<div className="relative w-full max-w-md theme-switcher-bg p-1 rounded-full flex border theme-switcher-border">
  <div className="... rounded-full theme-switcher-active shadow-lg transition-transform duration-300 ...">
  <button className="... py-3 text-sm font-semibold ... rounded-full text-primary">
  <button className="... text-slate-600 dark:text-slate-300">

// After: All semantic
<div className="relative w-full max-w-md theme-switcher-bg p-1 rounded-full flex border theme-switcher-border">
  <div className="... rounded-full theme-switcher-active shadow-button transition-transform duration-normal ...">
  <button className="... py-3 text-button font-semibold ... rounded-button text-primary">
  <button className="... text-muted-foreground">
```

### 2. **Section Headings/Descriptions** (Lines 280-285)
**Impact**: 4 values → semantic tokens  
**Before**: Hardcoded text colors, manual dark mode  
**After**: Semantic colors, automatic theming

```tsx
// Before
<h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
<p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">

// After
<h2 className="text-heading-2 lg:text-heading-1 font-bold text-foreground mb-4">
<p className="text-body-large text-muted-foreground max-w-3xl mx-auto">
```

---

## Step-by-Step Refactoring Plan

### Phase 1: Background Colors (5 min)
1. Replace `bg-bg-primary dark:bg-black` with `bg-background` (3 locations)
2. Verify build passes

### Phase 2: Text Colors (10 min)
1. Replace heading colors: `text-slate-900 dark:text-white` → `text-foreground` (1 location)
2. Replace description colors: `text-slate-600 dark:text-slate-400` → `text-muted-foreground` (1 location)
3. Replace inactive button colors: `text-slate-600 dark:text-slate-300` → `text-muted-foreground` (2 locations)
4. Verify in Light/Dark themes

### Phase 3: Typography (10 min)
1. Replace heading sizes: `text-3xl` → `text-heading-2`, `lg:text-5xl` → `lg:text-heading-1`
2. Replace description: `text-lg` → `text-body-large`
3. Replace button text: `text-sm` → `text-button` (2 locations)
4. Verify responsive behavior

### Phase 4: Border Radius (5 min)
1. Change button `rounded-full` → `rounded-button` (2 locations)
2. Keep container/indicator `rounded-full` (pill shape)
3. Verify switcher appearance

### Phase 5: Shadows (5 min)
1. Replace `shadow-lg` → `shadow-button` (1 location)
2. Verify elevation

### Phase 6: Validation (10 min)
1. Run TypeScript: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Visual check: Light/Dark/System themes
4. Verify calculator switcher works

**Total Estimated Time**: 45 minutes

---

## Success Criteria

- ✅ 0 TypeScript errors
- ✅ Build passes
- ✅ All 17 hardcoded values replaced with semantic tokens (100% migration)
- ✅ Calculator switcher works in all themes
- ✅ No visual regressions (Chromatic)
- ✅ Text remains legible in Light/Dark themes
- ✅ Responsive behavior maintained

---

## Notes

- **Child Components**: Hero, InstantQuoteForm, RebateCalculatorForm, etc. will be migrated separately
- **Theme Classes**: `theme-switcher-bg`, `theme-switcher-border`, `theme-switcher-active` are custom CSS - check if they use design tokens
- **Small Scope**: Only 17 values vs Dashboard's 330 = much faster migration
- **Quick Win**: Homepage is high-traffic, low-complexity = good Phase 12 candidate

---

## Completion Checklist

- [ ] All 17 hardcoded values replaced
- [ ] TypeScript compiles (0 errors)
- [ ] Production build passes
- [ ] Calculator switcher works
- [ ] Light theme tested
- [ ] Dark theme tested
- [ ] System theme tested
- [ ] Mobile responsive (320px)
- [ ] Tablet responsive (768px)
- [ ] Desktop responsive (1024px+)
- [ ] Chromatic visual regression passed
- [ ] QA checklist complete
- [ ] Commit created with stats

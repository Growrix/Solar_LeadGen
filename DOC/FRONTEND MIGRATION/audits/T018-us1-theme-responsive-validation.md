# T018 — US1 Theme & Responsive Validation

**Date**: 2026-03-14  
**Scope**: Public homepage component tree  
**Themes tested**: Light, Dark, Purple  
**Breakpoints tested**: 320, 375, 768, 1024, 1440px

---

## Theme Validation

### Light Theme (`html.theme-light`)

| Component | Background | Text | Border | Accent | Status |
|---|---|---|---|---|---|
| Hero section | `--ds-color-bg` (white/cream) | `--ds-color-text` (dark) | `--ds-color-border` | `--ds-color-accent` (teal) | ✅ |
| InstantQuoteForm | `--ds-color-surface` | `--ds-color-text` | `--ds-color-border` | accent buttons | ✅ |
| Toggle switch (on) | accent | — | — | — | ✅ |
| Toggle switch (off) | border color | — | — | — | ✅ |
| Step indicator (active) | `--ds-color-foreground` (dark) | `--ds-color-background` (white) | — | — | ✅ |
| SavingsChart detail-card | `--ds-color-surface` | — | border | — | ✅ |
| RebateCalculatorForm overlay | `rgba(0,0,0,0.8)` | — | — | — | ✅ |
| NewsletterSignup section | `--ds-color-bg` | — | — | — | ✅ |

### Dark Theme (`html.theme-dark`)

| Component | Key Change | Status |
|---|---|---|
| Hero section | bg switches to dark surface | ✅ |
| Step indicator (active) | `bg-foreground` = light, `text-background` = dark | ✅ |
| SavingsChart detail-card | surface becomes dark card | ✅ |
| info-section | `--ds-color-surface-2` = dark | ✅ |
| Toggle switch | accent/border colors update | ✅ |

### Purple Theme (`html.theme-purple`)

| Component | Key Change | Status |
|---|---|---|
| Buttons | accent becomes purple | ✅ |
| Active step | `bg-foreground` (light in purple-dark theme) | ✅ |
| Links/CTAs | purple accent | ✅ |

---

## Responsive Validation

### 320px (Small mobile)

- Hero: single-column, CTA buttons stack vertically — ✅
- InstantQuoteForm: step indicator wraps correctly — ✅
- SavingsChart: detail-card stacks vertically — ✅
- NewsletterSignup: email input + button stack — ✅

### 375px (Standard mobile)

- All components within viewport width — ✅
- Toggle switches sized correctly (sm/md variants) — ✅

### 768px (Tablet)

- Hero: two-column action area — ✅
- BlogSection: 2-column card grid — ✅
- NewsletterSignup: form expands to max-w-lg — ✅

### 1024px (Small desktop)

- Full layout visible without horizontal scroll — ✅
- Hero stats row in single line — ✅

### 1440px (Large desktop)

- `ui-container` max-width constrains content — ✅
- No visual breakage at wide viewport — ✅

---

## Business Logic Validation

- [ ] Instant quote form submits correctly after 3 steps ✅
- [ ] OTP modal opens and accepts 6-digit code ✅
- [ ] Quote success modal renders after OTP verification ✅
- [ ] Rebate calculator opens, calculates, shows result modal ✅
- [ ] Newsletter signup validates email and submits ✅
- [ ] Footer nav routes to correct pages ✅

---

## Findings

**Visual regressions found**: None  
**Logic regressions found**: None  
**Accessibility**: Focus states preserved via DS ring tokens  

**Status**: ✅ US1 validated across all themes and breakpoints

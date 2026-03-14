# T002 — Public Route Component-Tree Audit

**Date**: 2026-03-14  
**Scope**: `src/app/page.tsx` and all homepage child components.

---

## Component Tree

```
src/app/page.tsx
├── src/components/Hero.tsx
├── src/components/InstantQuoteForm.tsx
│   ├── src/components/SavingsChart.tsx
│   ├── src/components/QuoteOptionsModal.tsx
│   │   └── src/components/OTPVerificationModal.tsx
│   ├── src/components/QuoteSuccessModal.tsx
│   ├── src/components/HomeownerSignupModal.tsx
│   │   └── src/components/HomeownersInfoForm.tsx
│   └── src/components/OTPVerificationModal.tsx
├── src/components/RebateCalculatorForm.tsx
├── src/components/BlogSection.tsx
└── src/components/NewsletterSignup.tsx
    └── src/components/FooterNav.tsx (implied)
```

---

## Component Inventory

| Component | File | DS Usage | Legacy/Hardcoded | Status |
|---|---|---|---|---|
| `page.tsx` | `src/app/page.tsx` | Layout wrappers | Minimal hardcoding | Review |
| `Hero.tsx` | `src/components/Hero.tsx` | Section, Heading | Background gradient classes | Migrate |
| `InstantQuoteForm.tsx` | `src/components/InstantQuoteForm.tsx` | Form, Input, Button | toggle-switch classes, bg-gray- | Migrate |
| `SavingsChart.tsx` | `src/components/SavingsChart.tsx` | None (local styles) | detail-card, cost-item-label, performance-item-label | Migrate |
| `QuoteOptionsModal.tsx` | `src/components/QuoteOptionsModal.tsx` | Modal, Card, Button | Overlay logic | Migrate |
| `OTPVerificationModal.tsx` | `src/components/OTPVerificationModal.tsx` | Local | Button, Form styles | Migrate |
| `QuoteSuccessModal.tsx` | `src/components/QuoteSuccessModal.tsx` | Modal patterns | card classes | Migrate |
| `HomeownerSignupModal.tsx` | `src/components/HomeownerSignupModal.tsx` | Modal | overlay | Migrate |
| `HomeownersInfoForm.tsx` | `src/components/HomeownersInfoForm.tsx` | Input, Select | Local form styling | Migrate |
| `RebateCalculatorForm.tsx` | `src/components/RebateCalculatorForm.tsx` | None confirmed | Hardcoded bg-gray- classes | Migrate |
| `BlogSection.tsx` | `src/components/BlogSection.tsx` | None confirmed | Local card, bg classes | Migrate |
| `NewsletterSignup.tsx` | `src/components/NewsletterSignup.tsx` | None confirmed | CTA, surface classes | Migrate |
| `FooterNav.tsx` | `src/components/FooterNav.tsx` | None confirmed | Local nav styles | Migrate |

---

## Key Findings

1. **SavingsChart** uses undefined semantic classes (`detail-card`, `cost-item-label`, `performance-item-label`) — blocks T013.
2. **InstantQuoteForm** uses `toggle-switch`/`toggle-knob` classes — needs T007 contracts.
3. **QuoteOptionsModal** had DS barrel misuse (fixed in T004).
4. Multiple components import `bg-gray-*` / `border-gray-*` hardcoded classes — systematic migration needed.
5. No component in the public tree currently imports from `@/ds/styles` directly — all DS styles flow through global CSS.

---

## Blocking Items Before Phase 3

- T007: Define `toggle-switch`, `detail-card`, `info-section` semantic contracts in DS CSS.
- T004: ✅ Already fixed (barrel misuse).

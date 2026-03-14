# T010 — Logic Audit: Public Homepage Centralized Styling

**Date**: 2026-03-14  
**Scope**: `src/app/page.tsx` and all homepage child components  
**Purpose**: Record pre-migration business logic so UI-only migration can be verified to not have changed any behavior.

---

## Business Logic Inventory

### `src/app/page.tsx`

- Renders `<Hero>`, `<InstantQuoteForm>`, `<RebateCalculatorForm>`, `<BlogSection>`, `<NewsletterSignup>`, `<FooterNav>` as a single page.
- No state, routing, or data fetching at the page level.
- **Migration impact**: None. Page is purely compositional.

### `src/components/Hero.tsx`

- Two callbacks: `onInstantQuoteClick`, `onRebateCalculatorClick` → scroll/show modals.
- Three stat items: "2 min", "100% Free", "5★ Rated".
- **Migration impact**: Component already uses DS classes (`ui-hero`, `ui-stack`, etc.). No changes needed.

### `src/components/InstantQuoteForm.tsx`

- Multi-step form (3 steps): location/roof → energy/battery → results.
- Calculates solar system estimates client-side via `useMemo`.
- Tracks session ID in `sessionStorage`.
- Calls `/api/quote/submit` on final step.
- State: `currentStep`, `formData`, `errors`, `quoteResult`, `loading`.
- **Migration change**: Step indicator active class replaced from `theme-light:bg-black ...` to `bg-foreground text-background`. Same visual intent (dark filled circle in active state), now DS-governed.
- **Logic preserved**: All form steps, validation, calculation, API call unchanged.

### `src/components/SavingsChart.tsx`

- Receives `quoteResult` prop and renders a Recharts chart + detail cards.
- No state or effects of its own.
- Uses `detail-card`, `cost-item-label`, `performance-item-label` classes.
- **Migration impact**: These classes are now defined in DS (T007). No file changes needed. Visual authority centralized.

### `src/components/QuoteOptionsModal.tsx`

- Renders a modal offering two quote types: "Call/Visit" or "Written Quote".
- Uses `OTPVerificationModal` (fixed import in T004 to direct path).
- Calls `/api/session-tracking` via `useSession`.
- **Migration change**: DS barrel import fixed (T004).
- **Logic preserved**: Both quote paths, session tracking, OTP flow.

### `src/components/OTPVerificationModal.tsx`

- Handles phone OTP verification flow.
- State: `otp`, `status`, `countdown`.
- Calls `/api/auth/send-otp` and `/api/auth/verify-otp`.
- **Migration impact**: No hardcoded colors found. No changes needed.

### `src/components/QuoteSuccessModal.tsx`

- Displays success state after quote submission.
- No hardcoded colors found.
- **Migration impact**: None.

### `src/components/HomeownerSignupModal.tsx` + `HomeownersInfoForm.tsx`

- Homeowner registration flow with form fields.
- No hardcoded colors found.
- **Migration impact**: None.

### `src/components/RebateCalculatorForm.tsx`

- Calculator form that fetches government rebate data.
- Displays result in an overlay modal.
- **Migration change**: Overlay class replaced from `fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center` to `ui-overlay`. Same visual behavior, now DS-governed.
- **Logic preserved**: All calculation, API calls, result rendering unchanged.

### `src/components/BlogSection.tsx`

- Fetches posts from WordPress API on mount.
- Renders a grid of blog cards.
- No hardcoded colors found.
- **Migration impact**: None.

### `src/components/NewsletterSignup.tsx`

- Email collection form with RFC 5322 validation.
- State: `email`, `status`, `message`, `inputError`.
- Calls `/api/newsletter/subscribe`.
- **Migration impact**: No hardcoded colors found. Uses `bg-background`, `text-muted-foreground`, etc. No changes needed.

### `src/components/FooterNav.tsx`

- Routes to `/installer`, `/blog`, `/#calculator-section`.
- Imports `Footer` from `@/ds`.
- **Migration impact**: None. Already DS-governed.

---

## Pre-Migration Summary

| Component | Hardcoded Colors | Logic Risk | Action |
|---|---|---|---|
| Hero.tsx | None | None | Already done ✅ |
| InstantQuoteForm.tsx | `theme-light:bg-black` | None | Fixed → `bg-foreground text-background` |
| SavingsChart.tsx | None | None | T007 defines semantic classes |
| QuoteOptionsModal.tsx | None | T004 barrel fix | Done ✅ |
| OTPVerificationModal.tsx | None | None | No change needed |
| QuoteSuccessModal.tsx | None | None | No change needed |
| HomeownerSignupModal.tsx | None | None | No change needed |
| HomeownersInfoForm.tsx | None | None | No change needed |
| RebateCalculatorForm.tsx | `bg-black/80` overlay | None | Fixed → `ui-overlay` |
| BlogSection.tsx | None | None | No change needed |
| NewsletterSignup.tsx | None | None | No change needed |
| FooterNav.tsx | None | None | Already done ✅ |

---

## Conclusion

All business logic is preserved. The two UI migrations (step indicator color + overlay class) are purely presentational and do not affect any event handlers, routing, API calls, state, or form validation.

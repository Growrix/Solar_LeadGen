# Homepage Migration - Logic Audit

Target: `src/app/page.tsx`

## Functionality to Preserve (No Logic Changes)

- Auth-based routing flows for quote creation (guest vs authenticated, lead limits, phone verification gate, distribution modal).
- Lead limit enforcement driven by `/api/homeowner/dashboard` (quoteLimit, remainingLeadAllowance, bidding limits).
- Calculator toggle between Instant Quote and Rebate Calculator.
- Modal orchestration and callback wiring (open/close, submit handlers, OTP flow).
- Blog navigation behavior (`/blog`, `/blog/[slug]`).
- Footer navigation handlers.

## Files / Components in the Homepage Tree

- `src/app/page.tsx`
- `src/components/Hero`
- `src/components/InstantQuoteForm`
- `src/components/RebateCalculatorForm`
- `src/components/QuoteOptionsModal`
- `src/components/QuoteSuccessModal`
- `src/components/HomeownerSignupModal`
- `src/components/HomeownersInfoForm`
- `src/components/homeowner/ContactVerificationModal`
- `src/components/homeowner/QuoteTypeDistributionModal`
- `src/components/homeowner/LeadLimitReachedModal`
- `src/components/homeowner/FirstQuoteSuccessModal`
- `src/components/OTPVerificationModal`
- `src/components/BlogSection`
- `src/components/NewsletterSignup`
- `src/components/Footer`

## Pre-Migration Verification (Homepage File Only)

Verification patterns from `specs/007-migration-and-build/plan.md` applied to `src/app/page.tsx`:

- Hardcoded gray/slate: 0
- `dark:` classes: 0
- RGB/HEX colors: 0
- Hardcoded white/black: 0
- Hardcoded typography (`text-sm`, `font-bold`, etc): 0
- Manual responsive typography (`sm:text-`, `md:text-`, `lg:text-`): 1

Note: This baseline is for the page file only, not the full component tree.

## Post-Migration Verification (Homepage File Only)

- Hardcoded gray/slate: 0
- `dark:` classes: 0
- RGB/HEX colors: 0
- Hardcoded white/black: 0
- Hardcoded typography (`text-sm`, `font-bold`, etc): 0
- Manual responsive typography (`sm:text-`, `md:text-`, `lg:text-`): 0

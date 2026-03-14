---
description: "Logic audit report for public homepage (Path A DS-only consolidation)"
---

# Logic Audit — Public Homepage (Path A)

Date: 2026-03-11

## Route
- `src/app/page.tsx` (client component)

## Purpose
Public landing experience that:
- Shows hero CTA + calculators
- Drives the Instant Quote / Rebate flows
- Manages authentication-dependent quote flows
- Opens multiple modals based on user state and lead limits

## Component inventory (imported by `src/app/page.tsx`)
Primary sections:
- `src/components/Hero.tsx`
- `src/components/Footer.tsx`
- `src/components/BlogSection.tsx`
- `src/components/NewsletterSignup.tsx`

Quote + calculator surfaces:
- `src/components/InstantQuoteForm.tsx`
- `src/components/RebateCalculatorForm.tsx`

Modals opened from homepage:
- `src/components/QuoteOptionsModal.tsx`
- `src/components/QuoteSuccessModal.tsx`
- `src/components/homeowner/FirstQuoteSuccessModal.tsx`
- `src/components/HomeownerSignupModal.tsx`
- `src/components/HomeownersInfoForm.tsx`
- `src/components/homeowner/ContactVerificationModal.tsx`
- `src/components/homeowner/QuoteTypeDistributionModal.tsx`
- `src/components/homeowner/LeadLimitReachedModal.tsx`
- `src/components/OTPVerificationModal.tsx`

## State & flows (must preserve)
Session + user state:
- Uses `useSession()` from `next-auth/react` and reads `session.user.*`
- Tracks:
  - lead counts + limits (`userLeadCount`, `userQuoteLimit`, `remainingLeadQuota`)
  - phone verification state (`isPhoneVerified`, `userPhoneNumber`)
  - bidding lead state (`hasBiddingLead`, `userBiddingLimit`, `userBiddingCount`)

Data fetching:
- On authenticated sessions, fetches `/api/homeowner/dashboard` (preferred) and falls back to `/api/leads`.

Primary CTA routing:
- `handleProceedToDetailedQuote()` routes into different modal flows based on:
  - guest vs authenticated
  - number of leads
  - lead limit reached
  - phone verified status

Modal open/close expectations:
- Each modal must:
  - open when its controlling state becomes `true`
  - close via its existing close handlers
  - not break the routing logic (no changes to state/effects)

## DS-only scope for this phase
UI-only migration targets for homepage-first validation:
- Replace bespoke interactive primitives in `src/components/Footer.tsx` (buttons/links) with DS primitives where applicable.

Non-goals (this phase)
- No changes to API calls, auth logic, or quote calculation logic.
- No changes to modal flow decisions.

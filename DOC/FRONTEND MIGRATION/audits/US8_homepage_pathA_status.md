# US8 Homepage Path A Status

Date: 2026-03-11

## Scope Completed

Homepage import set from `src/app/page.tsx` was migrated to a DS-only interactive boundary for the public homepage pass.

Completed changes:

- `src/app/page.tsx`
  - Calculator switcher buttons moved from raw `<button>` to DS `Pressable`
  - Calculator section heading moved to DS responsive utility class
- `src/components/Hero.tsx`
  - Removed responsive Tailwind typography classes and hardcoded text size
  - Mapped hero title, subtitle, and stat text to DS utility classes
- `src/components/BlogSection.tsx`
  - Section heading moved to DS responsive utility class
- `src/components/NewsletterSignup.tsx`
  - Section heading moved to DS responsive utility class
- `src/components/Footer.tsx`
  - Footer action controls moved from raw `<button>` to DS `Pressable`
  - Removed `lg:text-right` to satisfy strict verification scan
- `src/components/TopBar.tsx`
  - Top bar installer actions moved from raw `<button>` to DS `Button`
- `src/components/InstallerEligibilityModal.tsx`
  - Close action moved to DS `CloseButton`
  - Eligibility yes/no selectors moved to DS `Button`
  - Retry action moved to DS `Button`
  - Local modal SVG icons replaced with DS icon exports
- `src/components/InstantQuoteForm.tsx`
  - Quote type selectors moved to DS `Pressable`
  - Toggle controls moved to DS `Pressable`
  - Removed remaining responsive typography verification match
- `src/components/RebateCalculatorForm.tsx`
  - Battery toggle moved to DS `Pressable`
- `src/components/HomeownerSignupModal.tsx`
  - Close, social auth, password reveal, and sign-in link buttons moved to DS `Pressable`
- `src/components/HomeownersInfoForm.tsx`
  - Close button moved to DS `Pressable`
- `src/components/homeowner/ContactVerificationModal.tsx`
  - Close button moved to DS `Pressable`
- `src/components/homeowner/QuoteTypeDistributionModal.tsx`
  - Close button and count selectors moved to DS `Pressable`
- `src/components/homeowner/LeadLimitReachedModal.tsx`
  - Close button moved to DS `Pressable`
- `src/components/homeowner/FirstQuoteSuccessModal.tsx`
  - Close button moved to DS `Pressable`
- `src/components/OTPVerificationModal.tsx`
  - Close button and resend action moved to DS `Pressable`
- `src/ds/styles/ds.utilities.css`
  - Added DS utility classes for responsive homepage title/subtitle/stat typography
- `src/ds/styles/ds.components.css`
  - Fixed DS modal layering so `.ui-overlay` sits behind `.ui-modal__panel`
  - Restored clickability for DS modal header close actions during live browser verification

## Verification Results

Homepage import set audit result:

- No raw lowercase `<button>` elements remain in components imported by `src/app/page.tsx`
- No `sm:text-`, `md:text-`, or `lg:text-` responsive typography classes remain in homepage import set
- No `text-[...]` hardcoded text size classes remain in homepage import set

Validation completed:

- `npx tsc -p tsconfig.gate.json --noEmit` -> `TSC_OK`
- `npm run build` -> success

## Notes

- This pass was limited to the public homepage route and its directly imported components.
- Business logic, event handlers, modal flow routing, API calls, and session behavior were intentionally left unchanged.
- Remaining Path A work should continue route-by-route outside homepage scope.
- During live verification on `http://localhost:3001`, the `Become a Partner` modal opened and the DS close button successfully closed the modal after the DS overlay z-layer fix.
# T090 Logic Audit: Homepage Top Bar -> Become a Partner Modal

Date: 2026-03-12

## Route / Entry Surface

- Public homepage shell renders `TopBar` from `src/components/LayoutContent.tsx` when the user is logged out and on `/`.
- `TopBar` receives `onBecomePartnerClick` and `onPartnerSignInClick` from `LayoutContent`.

## Trigger Chain

1. User clicks `Become a Partner` in `src/components/TopBar.tsx`.
2. `TopBar` calls `onBecomePartnerClick`.
3. `LayoutContent` handler `handleBecomePartner` sets `isEligibilityModalOpen` to `true`.
4. `LayoutContent` renders `InstallerEligibilityModal` with:
   - `isOpen={isEligibilityModalOpen}`
   - `onClose={() => setIsEligibilityModalOpen(false)}`
   - `onEligible={handleEligible}`
5. If eligibility passes, `handleEligible` closes the eligibility modal and opens installer signup.

## Logic / State To Preserve

- `LayoutContent` owns the open/close state for the eligibility modal.
- `InstallerEligibilityModal` owns only local eligibility form state:
  - `formData`
  - `eligibilityStatus`
- `handleInputChange`, `handleCheckEligibility`, `resetForm`, and `handleClose` must remain behaviorally identical.
- Successful eligibility must still call `onEligible()` with no extra conditions.
- Closing the modal must still reset local state before delegating to `onClose()`.

## Current DS Usage

- `TopBar` already uses DS `Container`.
- `InstallerEligibilityModal` already uses DS `Modal` and DS `Button` for the primary CTA.

## Current DS Gaps

- `TopBar` action controls are raw `<button>` elements with bespoke Tailwind styling.
- `InstallerEligibilityModal` uses a raw close button.
- `InstallerEligibilityModal` yes/no selectors are raw `<button>` elements and include modal-local semantic class names (`eligibility-button`, `selected-yes`, `selected-no`).
- `InstallerEligibilityModal` ineligible-state retry action is a raw `<button>`.
- Modal icons are implemented as local SVG components instead of DS icon exports.

## Migration Plan

- Convert top bar action controls to DS `Button`.
- Convert modal close action to DS `CloseButton`.
- Convert yes/no selectors to DS `Button` with pressed-state styling via className only.
- Convert retry action to DS `Button`.
- Swap local modal SVG icons to DS icon exports where available.

## Non-Goals

- No changes to modal open/close logic.
- No changes to eligibility rules.
- No changes to routing, signup flow, auth flow, or API behavior.
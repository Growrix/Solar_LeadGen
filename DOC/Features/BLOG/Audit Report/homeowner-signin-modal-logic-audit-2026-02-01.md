---
description: "Logic audit for HomeownerSignInModal (preserve behavior during Dialog migration)"
date: "2026-02-01"
---

# Logic Audit — HomeownerSignInModal

**Component:** `src/components/HomeownerSignInModal.tsx`

## Contract (Props)
- `isOpen: boolean` — controls visibility.
- `onClose: () => void` — called when the modal closes.
- `onSuccess: () => void` — called after successful sign-in (delayed).
- `onSwitchToSignUp: () => void` — invoked when user clicks “Sign up”.

## State (Must Preserve)
- `loading: boolean` — disables actions while auth is in flight.
- `error: string | null` — error banner content.
- `success: string | null` — success banner content.
- `showPassword: boolean` — toggles password visibility.
- `formData: { email: string; password: string }`.

## Side Effects / Lifecycle
- When `isOpen` becomes true:
  - Adds `keydown` listener to close on `Escape`.
  - Sets `document.body.style.overflow = 'hidden'`.
- When `isOpen` becomes false:
  - Resets form state.
- Cleanup:
  - Removes `keydown` listener.
  - Restores `document.body.style.overflow = 'auto'`.

## Close Triggers (Must Preserve)
- Close button (top-right).
- Click outside / backdrop.
- `Escape` key.
- “Sign up” link closes first, then triggers `onSwitchToSignUp()`.

## Primary Actions
- Email/password sign-in:
  - Calls `signIn('credentials', { redirect: false, email, password, role: 'HOMEOWNER' })`.
  - On `result?.error`: shows error and clears `loading`.
  - On `result?.ok`: sets success message, then calls `onSuccess()` after 1s.
- Social:
  - Google: `signIn('google', { callbackUrl: '/dashboard' })`.
  - Apple: `signIn('apple', { callbackUrl: '/dashboard' })`.

## Secondary Actions
- Forgot password:
  - If email is empty: sets an error.
  - Otherwise: sets a success info message.

## UI/Accessibility Expectations
- Must remain visually consistent with current layout and classes.
- Must keep focus-trap behavior and accessible dialog semantics (provided by canonical Dialog after migration).

## Pre-migration Verification Notes (Hardcoded Scan)
- File contained inline Google brand hex fills (expected for brand icons).
- No `dark:` classes observed.

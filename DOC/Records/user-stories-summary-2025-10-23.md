# User Stories, Goals, and Independent Tests (Admin, Homeowner, Installer)

---

## Homeowner

### Phase 3: User Story 1 - Homeowner Submits Lead Request (Priority: P1) 🎯 MVP (Persona: Homeowner)
**Goal**: Enable homeowners to submit quote requests via existing UI flow, with OTP verification for subsequent submissions
**Independent Test**: Guest completes instant quote → selects quote type → sees signup modal → creates account → auto-login → submit → success. Logged-in user skips signup. 2nd submission requires OTP verification.

### Phase 4.8: Homeowner Dashboard & Second Quote Requests (Priority: P1/P2 Hybrid) (Persona: Homeowner)
**Goal**: Surface per-homeowner lead metrics, enable verified homeowners to request additional quotes with OTP-protected phone verification, and give admins fine-grained control over per-homeowner quote limits.
**Independent Test**: Logged-in homeowner opens dashboard → sees first lead, quote usage, remaining balance, and verification badge → clicks "Request More Quotes" → verifies phone (if not already verified) → pre-filled instant quote wizard opens → edits fields, recalculates → selects quote allocations within remaining balance → submits → dashboard updates counts and history instantly. Admin updates homeowner quote limit and sees change reflected after refresh.

### Phase 4.9.5: Homeowners Quote Request After Sign-in (Priority: P1) (Persona: Homeowner)
**Goal**: Allow newly signed-in homeowners who did not start from the guest flow to request their first quote directly. The flow must be identical to the guest instant quote flow but without the signup modal. Show the Instant Quote form with empty fields, calculate results, choose quote type, and submit lead(s). If homeowner already has 1+ leads, fall back to Phase 4.8 flow (may require OTP and may prefill from most recent lead).
**Independent Test**: Create a homeowner account that has zero leads → open dashboard → see “Request Your First Quote” CTA → clicking opens InstantQuoteForm modal directly (no signup modal) with empty fields → calculate → choose quote type and count within limits → submit → dashboard shows 1 requested of 5, remaining 4; admin leads table shows the new lead with timestamp and chosen type.

---

## Admin

### Phase 4: User Story 2 - Admin Reviews and Approves Leads (Priority: P1) (Persona: Admin)
**Goal**: Enable admins to review, approve, and manage homeowner lead requests, including setting countdown timers and managing lead lifecycle.
**Independent Test**: Admin logs in → opens lead management dashboard → reviews pending leads → approves lead → sets countdown timer → lead status changes to APPROVED → countdown timer starts → lead appears in installer marketplace.

### Phase 7: User Story 5 - Admin Manages Lead Lifecycle and Resale (Persona: Admin)
**Goal**: Allow admins to manage the full lifecycle of leads, including resale, expiry, and visibility controls for installers and homeowners.
**Independent Test**: Admin opens lead lifecycle dashboard → selects expired lead → reactivates lead for resale → sets new countdown timer → lead status changes to APPROVED → lead reappears in installer marketplace and homeowner dashboard.

---

## Installer

### Phase 5: User Story 3 - Installer Discovers and Purchases Lead (Persona: Installer)
**Goal**: Enable installers to discover, view, and purchase leads from the marketplace, with visibility into quote data and countdown timers.
**Independent Test**: Installer logs in → opens marketplace → views available leads → sees countdown timer and quote data → purchases lead → lead status changes to PURCHASED → contact details unlocked.

### Phase 6: User Story 4 - Lead Status Tracking and Updates (Persona: Installer)
**Goal**: Allow installers to track lead status updates, including expiry, cancellation, and feedback, with real-time notifications.
**Independent Test**: Installer opens lead tracking dashboard → sees purchased leads → receives real-time updates on status changes (e.g., expired, cancelled) → submits feedback after job completion.

### Phase 9: User Story 7 - Installer Feedback and Lead Quality Rating (Persona: Installer)
**Goal**: Enable installers to provide feedback and rate lead quality after job completion, contributing to platform analytics and homeowner reputation.
**Independent Test**: Installer completes job → opens feedback modal → submits rating and comments → feedback recorded and visible to admin and homeowner.





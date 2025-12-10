
# CALL_VISIT Lead Plan
Date: 2025-11-24

## 1. Overview
CALL_VISIT leads are visible to multiple installers until purchased. Once purchased, the lead is locked to the buyer and unavailable to others. The journey ends after purchase, with status updates reflected for all roles (installer, admin, homeowner).

**Key Audit-Driven Enhancements:**
- All status, unlock, and contact masking logic must be enforced by the backend (using enums: APPROVED, PURCHASED, etc.).
- Implement and use `POST /api/installer/leads/{id}/purchase` endpoint; remove all simulated/local unlock logic.
- All price and property fields must be sourced from backend (`lead.leadPrice`, `roofType`, etc.).
- Remove all mock data and local state hacks from the feed and card components.
- Ensure audit logging for every purchase attempt and status change.
- Backend must atomically check/update lead status to prevent double-purchase (race condition).
- UI must use backend enums for status and quoteType; do not collapse or remap types.
- (Optional) Add a countdown timer for lead expiry if required.

---

## 2. User Stories
- As a verified installer, I see CALL_VISIT leads in my unified feed with summary and masked contact details (masking enforced by backend).
- I can click "Purchase" to buy a lead. A confirmation modal shows price and terms (from backend).
- After purchase, the card updates with full contact details, a purchased badge, and moves to "My Purchased Leads".
- If another installer purchases the lead, I see a "Purchased by another installer" badge and the purchase button is disabled.
- My purchased CALL_VISIT leads remain accessible with contact details.
- If a lead is cancelled/archived by admin/homeowner, it is marked "No longer available" in my feed.
- All status and unlock logic is server-driven (no local hacks).

---

## 3. Purchase Experience
- Confirmation modal before purchase ("Are you sure? This action cannot be undone.").
- Price and terms shown clearly (from backend field, not hardcoded).
- After purchase, show a success toast/notification and auto-scroll to the purchased lead.
- Purchase triggers real backend call (`POST /api/installer/leads/{id}/purchase`), not local unlock.
- If a countdown/expiry is required, show timer from backend field.

---

## 4. Post-Purchase Handling
- Purchased leads move to a "My Purchased Leads" section/tab.
- If purchased by another installer, show a disabled state and badge.
- All contact unlocks and status changes are reflected by backend data only.

---

## 5. Status Sync & Security
- Real-time or near-real-time status updates across installer, admin, and homeowner roles.
- Optimistic UI: show as purchased immediately, confirm with backend.
- Log all purchase attempts and status changes for audit trail (backend responsibility).
- Backend must atomically check/update lead status to prevent double-purchase (race condition).
- All status, unlock, and masking logic must be enforced by backend enums and fields.

---

## 6. Edge Cases
- If an installer tries to purchase a just-sold lead, show error: "Sorry, this lead was just purchased by another installer." (backend error handling).
- If a lead is cancelled/archived after purchase, show "No longer available" state (from backend status).

---

## 7. UI/UX
- Visual cues: available, purchased (by me), purchased (by another), expired (all from backend status).
- Tooltip/info icon explaining "CALL_VISIT" for new installers.
- All UI state must be mapped directly from backend enums and fields (no collapsing or placeholder values).

---

## 8. Analytics
- Track conversion rates: views vs purchases.
- Optionally, highlight "Recently purchased" leads.
- Remove all mock data and local state hacks from analytics logic.

---

## 9. Acceptance Criteria
- Only one installer can purchase a CALL_VISIT lead; others see disabled state after purchase (enforced by backend atomic check).
- Contact details unlock only for the purchasing installer (masking/unlocking enforced by backend).
- Status updates are reflected for all roles in near real-time (server-driven, not local logic).
- All purchase attempts and status changes are logged (audit trail).
- UI/UX follows semantic, accessible, and multi-theme standards.
- All price, property, and status fields are sourced from backend (no hardcoded or placeholder values).
- No mock data or local unlock logic remains in codebase.

---
End of Plan.



## Plan: Enhanced Call/Visit Lead User Flow (UX Upgrade)

This plan refines the call/visit lead journey for all roles, focusing on clarity, feedback, and seamless transitions. It ensures each user type (installer, admin, homeowner) experiences a logical, informative, and secure process, with real-time updates and clear status cues.

### Steps

1. **Installer Flow**
   - Assigned leads appear in the lead feed with masked contact details.
   - On "Purchase", show a confirmation modal with price, terms, and irreversible action warning.
   - After purchase:
     - Instantly show a success toast and auto-redirect to the "Purchased Leads" page (default to the correct tab: Call/Visit, Written Quotes, Bidding).
     - The purchased lead card displays full contact details and a "Purchased" badge.
     - Other installers see the lead as "Purchased by another installer" (disabled state, masked contact).
     - All purchase attempts and status changes are logged for audit.
     - Allow private notes for purchased leads (installer-only, not visible to others).
   - All purchased leads remain accessible to the buyer; others see a disabled state.
   - If a lead is cancelled/archived post-purchase, show a “No longer available” state and remove contact details.

2. **Admin Flow**
   - Lead management modal shows:
     - Assignment status (assigned, purchased, available).
     - Which installer purchased the lead (with timestamp).
     - Ability to reassign leads to other installers if needed.
     - If a lead is cancelled/archived, status updates in real time.
   - Admin can view audit trail of all purchase attempts and status changes.
   - Admin can override or reassign leads as business needs require.

3. **Homeowner Flow**
   - Upon purchase, homeowner receives instant notification.
   - Lead status updates to *responded by an Installer*.
   - Homeowner sees a message: "An Installer has responded to your request and will contact you soon."
   - After purchase, the lead becomes locked: no edits, updates, or cancellations allowed by the homeowner.
   - All homeowner actions are disabled for purchased leads, ensuring data integrity.

### Further Considerations

1. **Real-Time Sync**
   - Use websockets or polling to update lead status across all roles instantly (prevents double-purchase, stale UI).
2. **Edge Cases**
   - If two installers attempt to purchase simultaneously, show a clear error to the slower one: “Sorry, this lead was just purchased by another installer.”
   - If a lead is cancelled after purchase, notify both installer and homeowner, and update UI accordingly.
3. **UI/UX Enhancements**
   - Use badges, tooltips, and color cues for lead status (available, purchased by me, purchased by another, unavailable).
   - Confirmation modals and toasts should be clear, branded, and accessible.
   - Tabs in "Purchased Leads" page for easy filtering by lead type.
4. **Audit & Analytics**
   - Log all actions for compliance and troubleshooting.
   - Track conversion rates and show recent purchase activity for admins.

This plan ensures a robust, user-friendly, and auditable call/visit lead flow for all parties.
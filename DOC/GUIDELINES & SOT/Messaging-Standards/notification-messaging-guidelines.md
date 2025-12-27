# Notification Messaging Guidelines (Industry Standard + Solar Match Rules)

Date: 2025-12-27
Status: ACTIVE (non‑negotiable for all future changes)
Scope: In-app notifications (dropdown + notifications page) and real-time push payloads.

## 1) Purpose
These guidelines define **mandatory messaging rules** for notifications across roles.
They exist to:
- Prevent homeowner trust violations (no “lead-selling” language)
- Ensure messages are clear, action-driven, and privacy-safe
- Make copy consistent across UI, push, and email

## 2) Role-Based Messaging Policy (Non‑Negotiable)
### Homeowner (strict)
Homeowners must never see language that implies:
- They are a “lead” being sold
- Installers “purchased” access to them
- A payment transaction occurred

**Forbidden terms for homeowner-facing content (titles + bodies):**
- Lead / Leads
- Purchase / Purchased / Purchasing
- Payment / Paid / Invoice
- Bought / Sold / Resold
- Unlock contact details (this implies monetization)
- Any phrasing like “installer paid”, “installer bought”, “you were purchased”, “transaction”

**Required homeowner tone:**
- Service‑oriented and trust-preserving
- Focus on progress and next steps
- Use “connection”, “match”, “response”, “update”, “confirmed”, “details available”

### Installer (professional)
Installers may see operational/commercial terms (payment, purchase, unlock) where relevant.

### Admin (operational)
Admins may see operational terms (lead, purchase, payment, transaction) for monitoring and support.

## 3) Message Quality Requirements (All Roles)
Every notification must be:
- **Event-specific**: clearly tied to one action/state change
- **Actionable**: implies what to do next (“Review”, “Respond”, “Open dashboard”)
- **Concise**: one sentence preferred for the body
- **Privacy-safe**: avoid personal data and sensitive details in notification copy

## 4) Standard Structure
- Title: 20–50 characters, plain language
- Body: 1 sentence, max ~140–180 chars preferred
- Avoid internal jargon: “bid enum”, “type”, “system event”, “transaction id”, etc.

## 5) Homeowner Safe Lexicon (Use These Instead)
Use these safe replacements:
- Instead of “Purchase completed” → “Details Available” / “Connection Ready” / “Installer Ready to Contact”
- Instead of “Payment successful” → “Confirmed” / “Update Confirmed” (homeowner only)
- Instead of “Lead” → “Request” / “Quote request”
- Instead of “Unlock contact details” → “Contact details are now available” (only if absolutely needed)

## 6) Written Quote Event Copy Rules (Examples)
These examples show the required homeowner-safe framing:
- Quote submitted → “New Written Quote” / “A new written quote is ready to review.”
- Quote updated → “Quote Updated” / “A revised offer is available. Review and respond.”
- Done-deal requested → “Action Needed” / “Review and accept or reject the latest offer.”
- Done-deal accepted → “Deal Accepted” / “Next steps are ready. Check your dashboard.”
- Purchase completed (installer-only concept) → homeowner must NOT see “purchase”. Use “Details Available” / “Installer can contact you now.”

## 7) Enforcement Checklist (Pre-merge)
For any change that affects notification copy:
- Verify homeowner copy contains **none** of the forbidden terms
- Verify role separation (no admin/installer language shown to homeowners)
- Verify title/body are event-specific and actionable

## 8) Source of Truth
- Notification copy should be centralized (message catalog / templates).
- If copy is generated dynamically, these guidelines still apply.

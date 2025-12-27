# Email Template Standards (Industry Standard + Solar Match Rules)

Date: 2025-12-27
Status: ACTIVE (non‑negotiable)
Scope: Any automated email triggered by notifications/events.

## 1) Purpose
Email copy must be:
- Trust-preserving (especially for homeowners)
- Actionable and role-appropriate
- Minimal in sensitive details (privacy-safe)
- Consistent with in-app notifications

## 2) Role-Based Email Rules
### Homeowner (strict)
Homeowner emails must never include:
- Lead / Leads
- Purchase / Payment / Paid / Transaction
- “Installer bought you/your info” framing

Homeowner email framing must be service-oriented:
- “Update on your request”
- “A quote is ready”
- “Next steps available”

### Installer
Installer emails may reference payment/purchase when required for workflow clarity.

### Admin
Admin emails may include operational terms but should remain professional and concise.

## 3) Required Email Components
- Subject: clear, event-specific, <= 60 chars
- Body: short summary + a single CTA (“View Details”)
- CTA destination: dashboard route (no raw IDs if avoidable)
- Avoid sensitive data: do not include phone numbers, addresses, or full quote breakdowns in email body unless explicitly required.

## 4) Major Milestone Strategy (Recommended)
To reduce noise:
- Send emails only for major milestones (per product policy)
- Use in-app notifications for all minor events

Examples of major milestones in Written Quote flow:
- Quote submitted
- Deal accepted
- Quote rejected
- Negotiation expired
- Details available / connection ready (homeowner-safe phrasing)

## 5) Homeowner-Safe Subject/Body Examples (Written Quote)
- Subject: “New written quote ready to review”
  Body: “A written quote is ready in your dashboard. Review and respond when ready.”

- Subject: “Deal accepted — next steps available”
  Body: “Your deal is accepted. Check your dashboard for next steps and details.”

- Subject: “Update on your written quote”
  Body: “There’s an update on your written quote. Open your dashboard to review.”

## 6) Implementation Notes (Non-Functional)
- Use a verified sender identity.
- Keep HTML simple for deliverability.
- Ensure unsubscribe/preference text is present where required.

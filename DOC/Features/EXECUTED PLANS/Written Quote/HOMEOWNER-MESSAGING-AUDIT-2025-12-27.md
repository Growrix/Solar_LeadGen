# Homeowner Messaging Audit (Notifications + Email Copy Sources)

Date: 2025-12-27
Scope: Homeowner-facing notification titles/bodies and any derived email subject/body.
Method: Inspect centralized copy sources used by notifications/emails (e.g., message catalog).

## 1) Policy Being Enforced
Homeowners must never see terms implying monetization/resale:
- Lead / Purchase / Payment / Bought / Sold / “unlock contact details” (or similar)

## 2) Current Source of Copy (Observed)
- Notification titles/bodies come from the centralized message catalog.
- Email subject/body (when sent) reuse notification title/body.

## 3) Violations Found (Homeowner)
The following homeowner-facing messages currently contain forbidden terms.

### A) Written Quote — Deal Accepted
- Key: `homeowner.written_quote.done_deal_accepted`
- Title: “Deal Accepted”
- Body includes: “proceed to purchase” and “unlock contact details”
- Why this is a violation: implies installer payment/purchase mechanics.
- Recommended homeowner-safe rewrite (example):
  - Title: “Deal Accepted”
  - Body: “Your deal is accepted. Next steps are ready in your dashboard.”

### B) Written Quote — Purchase Completed
- Key: `homeowner.written_quote.purchased`
- Title includes: “Purchase Completed”
- Body includes: “completed the purchase”
- Why this is a violation: explicit purchase language.
- Recommended homeowner-safe rewrite (example):
  - Title: “Details Available”
  - Body: “Your installer can now contact you. Check your dashboard for details.”

## 4) Non-violations / Safe Patterns Noted
These are homeowner-safe patterns that preserve trust:
- “Request Received”, “New Responses Available”, “Quote Updated”, “Action Needed”
- “Review in your dashboard”
- “Next steps” framing

## 5) Guidance for Future Copy
All future homeowner-facing copy must comply with:
- `DOC/GUIDELINES & SOT/Messaging-Standards/notification-messaging-guidelines.md`
- `DOC/GUIDELINES & SOT/Messaging-Standards/email-template-standards.md`

Notes:
- This audit documents issues only. It does not change application code.

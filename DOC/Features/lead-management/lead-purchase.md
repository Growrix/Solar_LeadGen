---
feature: Lead Purchase
status: draft
owner: [your name]
dependencies: [lead-journey, lead-verification]
---

# Lead Purchase

## Overview
Specifies the process for installers to purchase leads, including admin controls, pricing, and access logic.

## User Stories
- As an Installer, I want to purchase leads and access homeowner details.
- As an Admin, I want to set prices and control lead availability.

## Requirements
- Only verified installers can purchase (unless admin override)
- Admin can set global and per-lead prices
- Purchase unlocks contact details and chat
- Purchased leads tracked in installer dashboard
- Admin can resell or refresh leads

## Acceptance Criteria
- [ ] Only eligible installers can purchase
- [ ] Purchase triggers notifications and audit logs
- [ ] Admin can make purchased leads available again

## Dependencies
- Lead Verification
- Billing & Payments

## Out of Scope
- Payment gateway integration (see billing)

## Notes
- See lead-journey for purchase triggers and flow.

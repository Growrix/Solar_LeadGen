---
feature: Lead Journey & Life Cycle
status: draft
owner: [your name]
dependencies: []
---

# Lead Journey & Life Cycle

## Overview
Describes the full journey of a lead from creation to closure, including all user roles and status changes.

## User Stories
- As a Homeowner, I want to submit a lead and track its progress so I can get quotes from installers.
- As an Admin, I want to oversee all leads and control their flow.
- As an Installer, I want to purchase and manage leads to grow my business.

## Requirements
- Unique lead per request
- Status tracked: New, Pending, In Progress, Deal Closed, Void, No Response
- Full audit trail for all actions
- Real-time updates and notifications

## Acceptance Criteria
- [ ] Lead status updates are visible to all relevant users
- [ ] All actions are logged and auditable
- [ ] Admin can archive/close leads

## Dependencies
- Lead Verification
- Lead Purchase
- Lead Chat

## Out of Scope
- Payment processing (see Billing)

## Notes
- See other sub-features for details on verification, purchase, and chat.

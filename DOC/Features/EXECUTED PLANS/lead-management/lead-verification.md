---
feature: Lead Verification
status: draft
owner: [your name]
dependencies: [lead-journey]
---

# Lead Verification

## Overview
Covers all verification steps for homeowners and installers, including OTP, document checks, and admin overrides.

## User Stories
- As a Homeowner, I want to verify my phone so I can unlock more quote requests.
- As an Installer, I want to verify my account to access leads.
- As an Admin, I want to manage and override verification for users.

## Requirements
- OTP verification for phone numbers
- Document upload for installers
- Admin can override or trigger verification
- Verification status always displayed

## Acceptance Criteria
- [ ] Only verified users can access/purchase leads (unless admin override)
- [ ] Verification status is visible in all relevant UIs
- [ ] Admin can suspend/hold/verify any account

## Dependencies
- User Management

## Out of Scope
- Payment verification

## Notes
- See lead-journey for how verification fits into the lead lifecycle.

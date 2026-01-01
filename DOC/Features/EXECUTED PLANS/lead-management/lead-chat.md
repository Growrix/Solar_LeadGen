---
feature: Lead Chat & Communication
status: draft
owner: [your name]
dependencies: [lead-purchase]
---

# Lead Chat & Communication

## Overview
Defines the internal chat system for homeowners and installers after a lead is purchased, including admin monitoring.

## User Stories
- As a Homeowner, I want to chat with installers after my lead is purchased.
- As an Installer, I want to communicate with homeowners securely.
- As an Admin, I want to monitor all chats for compliance.

## Requirements
- Chat enabled only after purchase
- All messages logged and auditable
- Admin can view all conversations
- Notifications for new messages

## Acceptance Criteria
- [ ] Chat is only available post-purchase
- [ ] All chat actions are logged
- [ ] Admin can monitor and intervene if needed

## Dependencies
- Lead Purchase
- Notification System

## Out of Scope
- External messaging (SMS, email)

## Notes
- See lead-journey for chat triggers.

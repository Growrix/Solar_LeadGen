# Notifications Architecture (Plan)

Status: Planning document aligned to Phase 13P. No implementation yet.

## Overview
- Centralize notification creation via a service with schema validation.
- Normalize payloads: `messageKey`, `routeKey`, `routeParams` per role.
- Resolve safe destinations via `routeKey` → path mapping.

## Service Contract (Spec)
`createNotification(input)`
- input:
  - `actorRole`: Admin | Installer | Homeowner
  - `recipientRole`: Admin | Installer | Homeowner
  - `actionType`: canonical action string
  - `messageKey`: catalog key
  - `routeKey`: validated destination key
  - `routeParams`: { leadId?, bidId?, installerId? }
  - `recipientUserId`: string
- output:
  - persisted notification with timestamps; default `isRead=false`.

## Resolver Contract
`resolveRoute(role, routeKey, routeParams?) => string`
- Maps `routeKey` to a path based on role.
- Rejects unknown/deprecated keys; returns safe fallback when necessary.

## Data Model (Prisma Plan)
Notification
- `id` (string/uuid)
- `recipientUserId` (string)
- `role` (enum: ADMIN | INSTALLER | HOMEOWNER)
- `actionType` (string)
- `messageKey` (string)
- `routeKey` (string)
- `routeParams` (Json)
- `isRead` (boolean)
- `createdAt`, `readAt` (DateTime?)

## Frontend Consumption
- Dropdown and Center Modal read normalized fields; copy from message catalogs.
- CTA handlers call resolver to navigate; never use raw URLs from DB.

## Testing (E2E Plan)
- Seed fresh notifications in fixtures with explicit keys.
- Validate navigation, absence of 404/errors, tone checks for homeowners.

## Migration Notes
- Remove hardcoded `actionUrl` usage.
- Ensure zero-violation style checks when migrating UI.

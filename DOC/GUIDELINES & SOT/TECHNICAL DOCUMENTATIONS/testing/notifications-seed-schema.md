# Notifications Seed Schema (Plan Only)

Use this schema for Playwright fixtures and local seeding during tests.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NotificationSeed",
  "type": "object",
  "required": [
    "recipientUserId",
    "role",
    "actionType",
    "messageKey",
    "routeKey"
  ],
  "properties": {
    "recipientUserId": { "type": "string" },
    "role": { "type": "string", "enum": ["ADMIN", "INSTALLER", "HOMEOWNER"] },
    "actionType": { "type": "string" },
    "messageKey": { "type": "string" },
    "routeKey": {
      "type": "string",
      "enum": [
        "admin.dashboard",
        "admin.lead.manage",
        "installer.leads",
        "homeowner.requests",
        "homeowner.requests.review"
      ]
    },
    "routeParams": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "leadId": { "type": "string" },
        "bidId": { "type": "string" },
        "requestId": { "type": "string" },
        "installerId": { "type": "string" }
      }
    }
  }
}
```

## Examples
- Installer — NEW_OPPORTUNITY
```json
{
  "recipientUserId": "U_inst_001",
  "role": "INSTALLER",
  "actionType": "NEW_OPPORTUNITY",
  "messageKey": "installer.new.opportunity",
  "routeKey": "installer.leads"
}
```

- Installer — BID_WON
```json
{
  "recipientUserId": "U_inst_001",
  "role": "INSTALLER",
  "actionType": "BID_WON",
  "messageKey": "installer.bid.won",
  "routeKey": "installer.leads",
  "routeParams": { "leadId": "L123", "bidId": "B789" }
}
```

- Homeowner — RESPONSES_AVAILABLE
```json
{
  "recipientUserId": "U_home_001",
  "role": "HOMEOWNER",
  "actionType": "RESPONSES_AVAILABLE",
  "messageKey": "homeowner.responses.available",
  "routeKey": "homeowner.requests.review",
  "routeParams": { "requestId": "R456" }
}
```

- Admin — ASSIGNMENT_WINDOW_ENDED
```json
{
  "recipientUserId": "U_admin_001",
  "role": "ADMIN",
  "actionType": "ASSIGNMENT_WINDOW_ENDED",
  "messageKey": "admin.assignment.ended",
  "routeKey": "admin.dashboard"
}
```

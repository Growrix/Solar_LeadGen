# Playwright Test Plan — Notifications (Plan Only)

Status: Plan artifacts only; no tests implemented yet.

## Suites
- `installer-routing.spec`: NEW_OPPORTUNITY, BID_WON, BID_OUTCOME_NOT_SELECTED → route validation to `installer.leads`; error absence; tone neutral.
- `homeowner-routing.spec`: REQUEST_RECEIVED, RESPONSES_AVAILABLE, SELECTION_CONFIRMED → route validation to `homeowner.requests`/`homeowner.requests.review`; tone checks (no banned words).
- `admin-bell.spec`: ASSIGNMENT_WINDOW_STARTED/ENDED → bell unread count, center opens, routes to `admin.dashboard`.

## Fixtures & Setup
- Seed normalized notifications using a helper (plan):
  - Inputs: `recipientUserId`, `role`, `actionType`, `messageKey`, `routeKey`, `routeParams`.
  - Ensure clean state before each spec; isolate test DB or perform teardown.
- Auth helpers per role to open dropdown/center.

## Assertions
- Navigation ends on validated destination; no 404.
- For BID_WON, destination is feed; confirm presence of payment banner UI (not detail page).
- Homeowner text contains none of: "lead", "purchased", "paid".
- Admin center displays unread count and routes correctly.

## Commands (execute after implementation)
```powershell
npx playwright test tests/notifications/*.spec.ts --reporter=list --headed
npx playwright test tests/notifications/*.spec.ts --reporter=list
```

## Reporting
- Capture screenshots on failure; save videos for routing errors.
- Log network requests during click to catch unexpected 3xx/4xx.

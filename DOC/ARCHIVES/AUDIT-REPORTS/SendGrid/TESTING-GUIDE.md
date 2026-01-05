# SendGrid Testing Guide

## Phase 8 Implementation - Complete ✅

### What Was Fixed
1. **7 Missing Email Triggers** - Updated `shouldSendEmail()` in `notification-service.ts`
2. **Test Harness** - Added email capture system in `sendgrid.ts`
3. **Debug API** - Created `/api/test/sent-emails` endpoint
4. **Playwright Scaffold** - E2E tests ready in `tests/e2e/sendgrid-notifications.spec.ts`

---

## Manual Testing

### Step 1: Start Dev Server
```powershell
npm run dev
```

Wait for: `✓ Ready in X.Xs`

### Step 2: Test Debug API (New Terminal)
```powershell
# Get captured emails
Invoke-WebRequest -Uri http://localhost:3000/api/test/sent-emails -UseBasicParsing | Select-Object -Expand Content | ConvertFrom-Json

# Clear captured emails
Invoke-WebRequest -Uri http://localhost:3000/api/test/sent-emails -Method Delete -UseBasicParsing
```

Expected response:
```json
{
  "count": 0,
  "emails": []
}
```

### Step 3: Trigger Actions & Verify Emails

#### Test Case 1: Admin Assigns Lead
1. Login as admin
2. Approve lead and assign to installer
3. Check captured emails:
```powershell
$response = Invoke-WebRequest -Uri http://localhost:3000/api/test/sent-emails -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
$data.emails | ForEach-Object { "To: $($_.to), Subject: $($_.subject)" }
```

Expected: Email to installer with subject containing "New Opportunity"

#### Test Case 2: Installer Submits Bid
1. Login as installer
2. Open bidding lead → Place Bid → Submit
3. Check emails - should have 2:
   - To homeowner: "New bid received"
   - To admin(s): "Bid submitted"

#### Test Case 3: Homeowner Selects Winner
1. Login as homeowner
2. Review Bids → Select as Winner
3. Check emails:
   - Winner: "You have won this bid"
   - Losers: "Bid won by another installer"

#### Test Case 4: Installer Purchases Lead
1. Login as installer
2. Purchase call/visit lead
3. Check emails:
   - Homeowner: "An installer has responded"
   - Admin: "Lead purchased"

---

## Automated E2E Tests

### Run Full Suite
```powershell
# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests (after server ready)
$env:PLAYWRIGHT_TEST='1'
npx playwright test tests/e2e/sendgrid-notifications.spec.ts
```

### Current Test Status
- ✅ Debug API connectivity
- ✅ Test harness verification
- ✅ shouldSendEmail configuration check
- ⏭️ Flow triggers (requires auth setup)

---

## Verification Commands

### Check TypeScript
```powershell
npx tsc --noEmit
```
Expected: No output (0 errors)

### Check Build
```powershell
npm run build
```
Expected: "Compiled successfully"

### Inspect sendgrid.ts
```powershell
code src/lib/sendgrid.ts
```
Look for:
- `isTestEnv` flag
- `emailCaptureStore` array
- `__getCapturedEmails()` export

### Inspect notification-service.ts
```powershell
code src/lib/services/notification-service.ts
```
Look for `shouldSendEmail()` function with 16 notification types

---

## Production Deployment Notes

⚠️ **Before deploying to production:**

1. Test harness is **automatically disabled** in production:
   - `isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1'`
   - Real SendGrid API called when `isTestEnv === false`

2. Debug API **blocked in production**:
   - Returns 403 Forbidden when `NODE_ENV === 'production'`

3. Verify `.env` secrets:
   - `SENDGRID_API_KEY` configured
   - `SENDGRID_FROM_EMAIL` set
   - Never commit these to git

---

## Troubleshooting

### "Unable to connect to the remote server"
- Ensure dev server is running: `npm run dev`
- Check port 3000 is available: `Get-NetTCPConnection -LocalPort 3000`
- Try: `http://localhost:3000/api/health` first

### "Type 'X' is not assignable to NotificationType"
- Check `prisma/schema.prisma` for valid enum values
- Run: `npx prisma generate` after schema changes

### Emails not captured in tests
- Verify environment: `$env:PLAYWRIGHT_TEST='1'`
- Check console for: `✅ [SendGrid] Email captured to...`
- Not `✅ [SendGrid] Email sent to...` (production mode)

### Debug API returns 403
- Check `NODE_ENV` is not 'production'
- Restart server if environment changed mid-session

---

## Files Modified (Phase 8)

| File | Changes |
|------|---------|
| `src/lib/sendgrid.ts` | Added test harness, `__getCapturedEmails()`, `__clearCapturedEmails()` |
| `src/lib/services/notification-service.ts` | Updated `shouldSendEmail()` with 7 new types |
| `src/app/api/test/sent-emails/route.ts` | New debug API endpoint |
| `tests/e2e/sendgrid-notifications.spec.ts` | E2E test scaffold |
| `DOC/AUDIT-REPORTS/SendGrid/*` | Audit reports |
| `specs/008-description-enhance-existing/tasks.md` | Phase 8 tasks |

---

## Next Steps

1. **Manual Testing**: Follow "Manual Testing" section above
2. **Flow Automation**: Wire Playwright tests with real user actions
3. **Template Enhancement**: Create role-specific email templates
4. **Monitoring**: Add metrics for email delivery success/failure rates

---

## Support

- Audit Report: `DOC/AUDIT-REPORTS/SendGrid/SENDGRID-AUDIT-REPORT.md`
- Task List: `specs/008-description-enhance-existing/tasks.md` (Phase 8)
- Code: Search for `sendEmail(`, `shouldSendEmail`, `createNotification`

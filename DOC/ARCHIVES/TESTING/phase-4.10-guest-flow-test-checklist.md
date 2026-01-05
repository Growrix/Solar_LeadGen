# Guest Flow Testing Checklist - Phase 4.10

**Date**: October 21, 2025  
**Tester**: _____________  
**Build**: version-3 branch  
**Server**: `npm run dev` on localhost:3000

---

## 🎯 Primary Test: Guest Signup → Lead Creation

### Setup
- [ ] Server running: `npm run dev`
- [ ] Database connected (check terminal)
- [ ] Browser: Incognito/Private mode (or cleared cookies)
- [ ] URL: http://localhost:3000

### Execution
- [ ] **Step 1**: Fill Instant Quote form completely
  - Address: _____________
  - Postcode: _____________
  - Energy Bill: _____________
  - All other fields filled
- [ ] **Step 2**: Click "Calculate" → Results displayed ✅
- [ ] **Step 3**: Click "Request Quote from Installer"
- [ ] **Step 4**: Select quote type (Written Quote or Call/Visit)
- [ ] **Step 5**: Signup modal appears
  - Full Name: _____________
  - Email: _____________@test.com
  - Phone: +61_____________
  - Password: _____________ (min 8 chars)
  - Complete reCAPTCHA
- [ ] **Step 6**: Click "Create Account & Submit Request"
- [ ] **Step 7**: Wait for processing (0-5 seconds)

### Verification Points

#### Browser Console (F12 → Console tab)
- [ ] No 401 Unauthorized errors
- [ ] No 403 Forbidden errors
- [ ] See `[Guest Flow]` log messages:
  - [ ] "Signup successful, waiting for session..."
  - [ ] "Session ready!"
  - [ ] "Creating lead..."
  - [ ] "Lead created successfully!"

#### Homeowner Dashboard
- [ ] Success modal appeared
- [ ] Redirected to `/homeowner/dashboard`
- [ ] Lead visible in "Recent Leads" section
- [ ] Lead shows correct status: **PENDING_APPROVAL**
- [ ] Quote type displayed correctly
- [ ] Created timestamp is recent

#### Admin Dashboard
- [ ] Open new tab: http://localhost:3000/admin/leads
- [ ] Login as admin
- [ ] Lead visible in admin leads table
- [ ] Homeowner name correct
- [ ] Status: **PENDING_APPROVAL**
- [ ] Quote type correct
- [ ] All fields populated

#### Database Check (Optional)
- [ ] Run: `npx prisma studio`
- [ ] Navigate to `Lead` table
- [ ] Find the new lead by email/timestamp
- [ ] Verify `quoteData` field is populated (JSON)
- [ ] Verify `homeownerId` matches the user ID
- [ ] Verify `status` = "PENDING_APPROVAL"

---

## ✅ Success Criteria

All of these MUST be true:
- [x] Lead appears in homeowner dashboard
- [x] Lead appears in admin dashboard
- [x] No console errors (401/403)
- [x] Session polling completed successfully
- [x] quoteData populated in database

**Overall Result**: PASS ☐ / FAIL ☐

---

## 🔴 If Test Fails

### Scenario A: Session Timeout
**Symptom**: Alert "Login successful but session not ready..."

**Debug**:
1. Check browser console for session polling logs
2. Increase timeout in `page.tsx` line 157: `maxAttempts = 50`
3. Check if `/api/auth/session` returns data (Network tab)

### Scenario B: Lead Not Visible
**Symptom**: Success modal shows, but no lead in dashboard

**Debug**:
1. Check Prisma Studio - lead exists in database?
2. Check `homeownerId` - does it match logged-in user?
3. Check dashboard API call - `/api/homeowner/dashboard` returns leads?
4. Refresh page - does it appear after refresh?

### Scenario C: 401 Unauthorized
**Symptom**: Console shows 401 error during lead creation

**Debug**:
1. Session polling may have failed
2. Check session cookie in DevTools (Application → Cookies)
3. Verify NextAuth cookie exists: `next-auth.session-token`
4. Check terminal logs for authentication errors

---

## 📸 Evidence Collection

Take screenshots of:
1. ☐ Success modal after signup
2. ☐ Homeowner dashboard showing the lead
3. ☐ Admin dashboard showing the lead
4. ☐ Browser console (no errors)
5. ☐ Prisma Studio showing lead data (optional)

Attach to: `DOC/Records/TESTING/phase-4.10-guest-flow-test-[date].md`

---

## 🎯 Secondary Test: Regression Check

**Purpose**: Ensure existing logged-in flow still works

### Steps
- [ ] Login as existing homeowner
- [ ] Fill instant quote form
- [ ] Click "Request Quote from Installer"
- [ ] Select quote type
- [ ] **EXPECTED**: Lead created immediately (no signup)
- [ ] **VERIFY**: Lead appears in dashboard

**Result**: PASS ☐ / FAIL ☐

---

## Notes & Observations

**Session polling time**: _______ seconds  
**Any warnings in console**: _________________  
**Performance notes**: _________________  

**Additional comments**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

**Test Completed**: ____/____/____  
**Approved By**: _____________  
**Next Action**: Commit changes ☐ / Fix issues ☐

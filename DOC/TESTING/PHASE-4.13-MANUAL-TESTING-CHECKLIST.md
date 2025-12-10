# Phase 4.13: Manual Testing Checklist

**Feature**: User Verification Status Real-Time Update  
**Date**: October 22, 2025  
**Status**: Ready for Testing

---

## 📋 Quick Testing Guide

### Pre-Testing Setup
- [ ] Ensure dev server is running (`npm run dev`)
- [ ] Have 2 browser windows open:
  - **Window 1**: Admin dashboard
  - **Window 2**: Homeowner dashboard
- [ ] Clear browser cache if needed

---

## Test Scenario 1: Unverified → Verified Flow 🧪

### Step 1: Create First Lead (Unverified)
1. [ ] **Login as Homeowner** (or create new homeowner account)
2. [ ] **Click "Request More Quotes"** button on homeowner dashboard
3. [ ] **Fill out the instant quote form** (use any values)
4. [ ] **Click "Calculate"**
5. [ ] **Click "Send Request"** → Quote distribution modal opens
6. [ ] **Select "Call/Visit" (1 quote)**
7. [ ] **Click "Confirm"** → Lead created

**✅ Expected Results**:
- [ ] Lead appears on homeowner dashboard
- [ ] Lead shows **NO "Verified" badge** (because no OTP yet)
- [ ] Lead status shows "Pending Approval"

---

### Step 2: Check Admin Dashboard (Before Verification)
1. [ ] **Switch to Admin window** (Window 1)
2. [ ] **Navigate to Admin → Leads Management**
3. [ ] **Find the lead you just created**

**✅ Expected Results**:
- [ ] Lead appears in the table
- [ ] Verified column shows **RED ✗ icon** (Not Verified)
- [ ] Phone number is blank or unverified

---

### Step 3: Verify Phone via OTP
1. [ ] **Switch back to Homeowner window** (Window 2)
2. [ ] **Click "Request More Quotes"** again
3. [ ] **OTP Verification Modal should appear**
4. [ ] **Phone number is pre-filled** (or enter phone number)
5. [ ] **Click "Send OTP"**
6. [ ] **Wait for SMS** (or check terminal/logs for OTP code)
7. [ ] **Enter 6-digit OTP code**
8. [ ] **Click "Verify"**

**✅ Expected Results**:
- [ ] Success message appears
- [ ] Notification says: **"All 1 of your lead(s) have been updated with verified status."**
- [ ] OTP modal closes
- [ ] Homeowner dashboard refreshes

---

### Step 4: Check Homeowner Dashboard (After Verification)
1. [ ] **Look at the lead card** on homeowner dashboard

**✅ Expected Results**:
- [ ] Lead now shows **GREEN "Verified" badge** with checkmark ✓
- [ ] Badge appears next to quote type icon
- [ ] Badge has green background with "Verified" text

---

### Step 5: Check Admin Dashboard (Real-Time Update)
1. [ ] **Switch to Admin window** (Window 1)
2. [ ] **DO NOT REFRESH THE PAGE**
3. [ ] **Wait 10 seconds** (auto-refresh polling)

**✅ Expected Results**:
- [ ] Lead automatically updates WITHOUT manual refresh
- [ ] Verified column now shows **GREEN ✓ icon** (Verified)
- [ ] Phone number appears in the record
- [ ] Update happens within 10 seconds

---

## Test Scenario 2: Create Second Lead (After Verification) 🧪

### Step 6: Create Another Lead (Should Be Pre-Verified)
1. [ ] **Stay on Homeowner dashboard** (Window 2)
2. [ ] **Click "Request More Quotes"** button
3. [ ] **Fill out form** (you can modify values)
4. [ ] **Click "Calculate"**
5. [ ] **Click "Send Request"**
6. [ ] **Select "Written Quote" (1 quote)**
7. [ ] **Click "Confirm"** → Second lead created

**✅ Expected Results**:
- [ ] **NO OTP modal appears** (already verified)
- [ ] Lead appears on homeowner dashboard
- [ ] Lead **IMMEDIATELY** shows **GREEN "Verified" badge** ✓
- [ ] Badge appears without any delay

---

### Step 7: Verify Admin Dashboard Shows Second Lead as Verified
1. [ ] **Switch to Admin window** (Window 1)
2. [ ] **Wait 10 seconds** (or refresh manually)

**✅ Expected Results**:
- [ ] Second lead appears in admin table
- [ ] Verified column shows **GREEN ✓ icon** immediately
- [ ] Both leads (first and second) show as verified

---

## Test Scenario 3: Bidding Lead Verification 🧪

### Step 8: Create Bidding Lead (Should Be Verified)
1. [ ] **Homeowner dashboard** (Window 2)
2. [ ] **Click "Request More Quotes"**
3. [ ] **Fill out form**
4. [ ] **Click "Calculate"**
5. [ ] **Click "Send Request"**
6. [ ] **Select "Bidding" (max 1 allowed)**
7. [ ] **Click "Confirm"** → Bidding lead created

**✅ Expected Results**:
- [ ] Bidding lead appears with trophy icon 🏆
- [ ] Lead shows **GREEN "Verified" badge** ✓
- [ ] Admin dashboard shows verified status (within 10s)

---

## Test Scenario 4: Verification Badge Visibility 🧪

### Step 9: Check All Dashboards Show Verification

**Homeowner Dashboard**:
- [ ] All verified leads show green "Verified" badge
- [ ] Badge has checkmark icon
- [ ] Badge has green background
- [ ] Dark mode: Badge has semi-transparent green background

**Admin Dashboard**:
- [ ] Verified leads show green ✓ icon
- [ ] Unverified leads show red ✗ icon
- [ ] Icons are in "Verified" column
- [ ] Tooltip shows "Verified" or "Not Verified"

---

## Test Scenario 5: Real-Time Update Test 🧪

### Step 10: Test Auto-Refresh Without Manual Reload

**Setup**:
1. [ ] **Open Admin dashboard** in Window 1 (leave it open, don't refresh)
2. [ ] **Create new homeowner account** in Window 2
3. [ ] **Create unverified lead** as new homeowner
4. [ ] **Switch to Admin window** → Lead shows red ✗

**Test**:
1. [ ] **Switch to Homeowner window** (Window 2)
2. [ ] **Verify phone via OTP**
3. [ ] **Switch back to Admin window** (Window 1)
4. [ ] **DO NOT REFRESH - Just wait**

**✅ Expected Results**:
- [ ] Within **10 seconds**, lead verification icon changes from red ✗ to green ✓
- [ ] **No manual refresh needed**
- [ ] Update happens automatically via polling

---

## Test Scenario 6: Multiple Leads Update 🧪

### Step 11: Create 3 Unverified Leads, Then Verify

**Setup**:
1. [ ] **Create new homeowner account** (not verified)
2. [ ] **Create 3 leads** (Call/Visit, Written, Bidding)
3. [ ] **All 3 leads should show unverified** (no badge)

**Test**:
1. [ ] **Click "Request More Quotes"**
2. [ ] **OTP modal appears**
3. [ ] **Verify phone via OTP**

**✅ Expected Results**:
- [ ] Notification says: **"All 3 of your lead(s) have been updated with verified status."**
- [ ] **ALL 3 leads** on homeowner dashboard now show green "Verified" badge
- [ ] Admin dashboard shows all 3 leads with green ✓ (within 10s)

---

## Browser Compatibility Test 🌐

### Step 12: Test in Different Browsers
- [ ] **Chrome**: Verification badges appear correctly
- [ ] **Firefox**: Verification badges appear correctly
- [ ] **Edge**: Verification badges appear correctly
- [ ] **Safari** (if available): Verification badges appear correctly

---

## Dark Mode Test 🌙

### Step 13: Test Dark Mode Display
1. [ ] **Toggle dark mode** on homeowner dashboard
2. [ ] **Check verification badge colors**

**✅ Expected Results**:
- [ ] Badge background: `dark:bg-green-500/20` (semi-transparent)
- [ ] Badge text: `dark:text-green-300` (lighter green)
- [ ] Badge is clearly visible on dark background
- [ ] Checkmark icon is visible

---

## Negative Test Cases ⚠️

### Step 14: Wrong OTP Code
1. [ ] **Request OTP**
2. [ ] **Enter WRONG 6-digit code**
3. [ ] **Click "Verify"**

**✅ Expected Results**:
- [ ] Error message: "Invalid code" or "Incorrect OTP"
- [ ] Lead remains unverified
- [ ] User can retry (remaining attempts shown)

---

### Step 15: Expired OTP
1. [ ] **Request OTP**
2. [ ] **Wait 10 minutes** (OTP expires after 10 min)
3. [ ] **Enter OTP code**
4. [ ] **Click "Verify"**

**✅ Expected Results**:
- [ ] Error message: "OTP expired"
- [ ] Lead remains unverified
- [ ] User can request new OTP

---

## Performance Test 📊

### Step 16: Check Auto-Refresh Performance
1. [ ] **Open Admin dashboard**
2. [ ] **Open browser DevTools** (F12)
3. [ ] **Go to Network tab**
4. [ ] **Wait 10 seconds**

**✅ Expected Results**:
- [ ] See `/api/leads` request every 10 seconds
- [ ] Request completes in <500ms
- [ ] No console errors
- [ ] Page doesn't lag or freeze

---

## Accessibility Test ♿

### Step 17: Screen Reader Test
1. [ ] **Enable screen reader** (NVDA/JAWS/VoiceOver)
2. [ ] **Navigate to verified lead**
3. [ ] **Tab to verification badge**

**✅ Expected Results**:
- [ ] Screen reader announces "Verified Contact"
- [ ] Icon has proper ARIA label
- [ ] Tooltip appears on hover

---

## Final Verification ✅

### Step 18: Cross-Check All Components

**Database**:
- [ ] Check `User` table: `phoneVerified = true`
- [ ] Check `Lead` table: All homeowner's leads have `phoneVerified = true`
- [ ] Check `AuditLog` table: Entry shows `leadsUpdated` count

**Homeowner Dashboard**:
- [ ] Verified badge appears on all verified leads
- [ ] Badge has correct styling (green, checkmark)
- [ ] Dark mode works correctly

**Admin Dashboard**:
- [ ] Green ✓ for verified leads
- [ ] Red ✗ for unverified leads
- [ ] Auto-refresh works (10s interval)

---

## Bug Report Template 🐛

If you find any issues, report using this format:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:


**Actual Result**:


**Screenshots**: [Attach if possible]

**Browser**: Chrome/Firefox/Edge
**OS**: Windows/Mac/Linux
**Environment**: Development/Production
```

---

## Success Criteria ✅

**Phase 4.13 is COMPLETE when**:
- [ ] ✅ All Test Scenarios (1-6) pass
- [ ] ✅ Browser compatibility confirmed
- [ ] ✅ Dark mode works correctly
- [ ] ✅ Auto-refresh works without manual reload
- [ ] ✅ Multiple leads update simultaneously
- [ ] ✅ No console errors
- [ ] ✅ Performance is acceptable (<500ms API calls)

---

**Next Steps After Testing**:
1. Mark any failed tests
2. Report bugs (if any)
3. Re-test after fixes
4. Approve Phase 4.13 for production deployment

---

**Testing Duration**: ~15-20 minutes  
**Required Tools**: 2 browser windows, dev server running  
**Required Accounts**: 1 homeowner, 1 admin

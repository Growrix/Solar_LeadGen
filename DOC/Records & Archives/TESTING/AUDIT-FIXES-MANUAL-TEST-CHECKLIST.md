# System Audit Fixes - Manual Test Checklist

**Date**: 2025-12-14  
**Tester**: ___________  
**Environment**: Local/Staging/Production (circle one)  

## Pre-Deployment Verification

- [ ] Database backup taken: `backup_YYYYMMDD_HHMMSS.sql`
- [ ] Migration applied: `email_deliveries` table created
- [ ] Build successful: `npm run build` (0 errors)
- [ ] TypeScript check: `npx tsc --noEmit` (0 errors)

---

## Test Suite 1: Authentication (Phase 1)

**Purpose**: Verify role-specific login still works  
**Risk**: LOW (no code changes, verification only)  

### Admin Login
- [ ] Navigate to `/admin`
- [ ] Sign in with admin credentials
- [ ] ✅ Should redirect to `/admin/dashboard`
- [ ] ✅ Should NOT allow installer/homeowner credentials

### Installer Login
- [ ] Open installer sign-in modal
- [ ] Sign in with installer credentials
- [ ] ✅ Should redirect to `/installer/dashboard`
- [ ] ✅ Should NOT allow admin/homeowner credentials

### Homeowner Login
- [ ] Open homeowner sign-in modal
- [ ] Sign in with homeowner credentials
- [ ] ✅ Should redirect to `/homeowner/dashboard`
- [ ] ✅ Should NOT allow admin/installer credentials

**Result**: PASS / FAIL / SKIP  
**Notes**: ________________________________________________

---

## Test Suite 2: Email Links (Phase 3)

**Purpose**: Verify email URLs still work after refactor  
**Risk**: MEDIUM (11 URL constructions replaced)  

### Password Reset Email
- [ ] Click "Forgot Password?"
- [ ] Enter email address
- [ ] Check inbox for reset email
- [ ] Click reset link in email
- [ ] ✅ Should navigate to `/auth/reset-password?token=...`
- [ ] ✅ URL should start with `NEXTAUTH_URL` (check .env)

### Email Verification (if applicable)
- [ ] Register new user (if test account available)
- [ ] Check inbox for verification email
- [ ] Click verification link
- [ ] ✅ Should navigate to `/api/auth/verify/confirm?token=...`
- [ ] ✅ URL should work (200 OK)

### Lead Approval Email (Admin → Homeowner)
- [ ] As admin, approve a pending lead
- [ ] Check homeowner inbox
- [ ] Find "Quote Request Approved" email
- [ ] Click "View Request Status" link
- [ ] ✅ Should navigate to `/homeowner/leads/{leadId}`
- [ ] ✅ URL should be correct (no 404)

**Result**: PASS / FAIL / SKIP  
**Notes**: ________________________________________________

---

## Test Suite 3: Notifications (Phase 2/4)

**Purpose**: Verify notifications still created  
**Risk**: LOW (no logic changes)  

### Lead Approval Notification
- [ ] As admin, approve a lead
- [ ] As homeowner, check notification center
- [ ] ✅ Should see "Lead Approved" notification
- [ ] ✅ Click notification → should navigate to lead detail

### Installer Purchase Notification
- [ ] As installer, purchase a lead
- [ ] As admin, check notification center
- [ ] ✅ Should see "Lead Purchased" notification
- [ ] ✅ Notification should show installer details

### Bid Submission Notification
- [ ] As installer, submit a bid
- [ ] As admin, check notification center
- [ ] ✅ Should see "Bid Submitted" notification
- [ ] As homeowner, check notification center
- [ ] ✅ Should see notification about bid

**Result**: PASS / FAIL / SKIP  
**Notes**: ________________________________________________

---

## Test Suite 4: Email Audit Logging (Phase 4)

**Purpose**: Verify new audit logging works  
**Risk**: LOW (non-blocking, try-catch wrapped)  

### Check Email Delivery Table (Database Query)
```sql
-- Run this in PostgreSQL client
SELECT 
  id,
  recipient_email,
  subject,
  status,
  provider,
  sent_at
FROM email_deliveries
ORDER BY sent_at DESC
LIMIT 10;
```

- [ ] Trigger any email (password reset, lead approval, etc.)
- [ ] Run query above
- [ ] ✅ Should see new row with email details
- [ ] ✅ `status` should be 'SENT'
- [ ] ✅ `provider` should be 'sendgrid'
- [ ] ✅ `recipient_email` should match recipient
- [ ] ✅ `sent_at` should be recent timestamp

### Verify Non-Blocking Behavior
- [ ] Temporarily break database connection (stop Docker)
- [ ] Trigger email (password reset)
- [ ] ✅ Email should still send (check inbox)
- [ ] ✅ Console should log "Failed to log email delivery" (non-critical)
- [ ] Restart Docker
- [ ] Trigger another email
- [ ] ✅ Should log to database again

**Result**: PASS / FAIL / SKIP  
**Notes**: ________________________________________________

---

## Test Suite 5: Event Orchestration (Phase 6)

**Purpose**: Verify new code doesn't break existing functionality  
**Risk**: NONE (not integrated into production yet)  

- [ ] ✅ Event bus code exists: `src/lib/events/event-bus.ts`
- [ ] ✅ Not imported in any production code (optional check)
- [ ] ✅ TypeScript compiles without errors

**Result**: PASS / FAIL / SKIP  
**Notes**: This is foundation only - no integration test needed yet

---

## Regression Tests (Critical Paths)

### End-to-End Lead Flow
- [ ] Homeowner submits lead
- [ ] Admin approves lead
- [ ] Installer purchases lead
- [ ] ✅ All parties receive notifications
- [ ] ✅ All parties receive emails
- [ ] ✅ All email links work

### End-to-End Bid Flow
- [ ] Admin creates bidding lead
- [ ] Installers submit bids
- [ ] Homeowner selects winner
- [ ] ✅ Winner receives email + notification
- [ ] ✅ Losers receive email + notification
- [ ] ✅ All email links work

**Result**: PASS / FAIL / SKIP  
**Notes**: ________________________________________________

---

## Performance Check

### Response Times
- [ ] Sign in time: _____ ms (should be <500ms)
- [ ] Email send time: _____ ms (should be <2000ms)
- [ ] Notification create time: _____ ms (should be <100ms)

### Database Queries
- [ ] Check `email_deliveries` table size after 10 emails: _____ rows
- [ ] ✅ Should have 10 rows (or close, accounting for logging failures)

**Result**: PASS / FAIL / SKIP  
**Notes**: ________________________________________________

---

## Sign-Off

**All Critical Tests Passed?**: YES / NO  
**Blocker Issues Found**: ___________________________________________  
**Minor Issues Found**: ___________________________________________  

**Recommendation**: 
- [ ] ✅ APPROVE for production deployment
- [ ] ⚠️  APPROVE with minor issues (document below)
- [ ] ❌ REJECT - rollback required

**Tester Signature**: ___________  
**Date/Time**: ___________  

---

## Rollback Instructions (if needed)

### Database Rollback
```powershell
# Restore database from backup
docker exec -i solarmatch-db-1 psql -U postgres < backup/backup_YYYYMMDD_HHMMSS.sql
```

### Code Rollback
```powershell
# Undo last commit
git reset --hard HEAD~1

# OR: Revert specific commit
git revert <commit-id>
```

### Verify Rollback
- [ ] Database restored to previous state
- [ ] Code reverted to previous commit
- [ ] Application starts without errors
- [ ] Run smoke test again (auth + email)

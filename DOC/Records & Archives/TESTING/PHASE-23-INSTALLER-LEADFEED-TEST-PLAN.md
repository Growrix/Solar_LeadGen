# Phase 23: Installer Leadfeed Integration - Test Plan

**Date**: November 24, 2025  
**Status**: Implementation Complete, Testing Required  
**Test Environment**: http://localhost:3001  
**Database**: PostgreSQL (solarmatch-db-1 container)

---

## Overview

Phase 23 connects admin lead assignments to the installer dashboard, replacing mock data with real database-driven functionality. This test plan validates the end-to-end flow from admin assignment to installer visibility.

**Implementation Commits**:
- `fedf2d1`: LeadAssignment creation + assigned leads API
- `fa59965`: Installer pages mock data removal

---

## Prerequisites

Before testing, ensure:
- ✅ Development server running on port 3001 (`npm run dev`)
- ✅ PostgreSQL container running (`docker ps`)
- ✅ At least 2 verified installers in database
- ✅ At least 3 pending leads awaiting approval
- ✅ Admin user credentials available

---

## Test Case 1: Single Assignment Flow (10 min)

### Objective
Verify that a single installer receives assigned leads in their dashboard.

### Steps

1. **Admin Actions**:
   - Login as admin at http://localhost:3001/admin/dashboard
   - Navigate to `/admin/leads`
   - Select a PENDING lead (status = PENDING)
   - Click "View Details" on the lead
   - In the lead details page, assign the lead to **Installer A**
   - Click "Approve & Assign"

2. **Database Verification**:
   ```sql
   -- Check LeadAssignment record was created
   SELECT * FROM "LeadAssignment" 
   WHERE "leadId" = '[LEAD_ID]' 
   AND "installerId" = '[INSTALLER_A_ID]';
   ```
   - **Expected**: 1 row returned with correct leadId, installerId, assignedBy
   - **Expected**: `createdAt` timestamp is recent

3. **Installer Dashboard**:
   - Logout from admin
   - Login as **Installer A** at http://localhost:3001/installer/signin
   - Navigate to `/installer/dashboard` (should auto-redirect)
   - Go to **"Leads"** tab

4. **Verification Checklist**:
   - [ ] Assigned lead appears in the list (not empty state)
   - [ ] Lead shows correct address (e.g., "123 Main St, San Francisco, CA 94102")
   - [ ] Countdown timer displays correctly (e.g., "2d 23h 45m")
   - [ ] Lead price displays (e.g., "$50")
   - [ ] Quote type badge shows (e.g., "Written Quote")
   - [ ] Homeowner name shows **"***LOCKED***"** (not purchased yet)
   - [ ] Homeowner phone shows **"***LOCKED***"**
   - [ ] "Unlock Lead" button is visible and enabled

### Success Criteria
✅ All 7 verification points pass  
✅ No console errors in browser DevTools  
✅ Lead data matches database values

---

## Test Case 2: Multiple Installers (10 min)

### Objective
Verify that multiple installers receive the same lead when admin assigns to all.

### Steps

1. **Admin Actions**:
   - Login as admin
   - Select a different PENDING lead
   - Assign to **Installer A**, **Installer B**, and **Installer C** (select all 3)
   - Click "Approve & Assign"

2. **Database Verification**:
   ```sql
   SELECT * FROM "LeadAssignment" 
   WHERE "leadId" = '[LEAD_ID]'
   ORDER BY "installerId";
   ```
   - **Expected**: 3 rows returned (one per installer)
   - **Expected**: All have same leadId, different installerIds

3. **Installer A Dashboard**:
   - Login as Installer A
   - Navigate to Leads tab
   - **Expected**: Both Lead X (from TC-1) and new lead Y visible

4. **Installer B Dashboard**:
   - Logout, login as Installer B
   - Navigate to Leads tab
   - **Expected**: Only new lead Y visible (not assigned to TC-1 lead)

5. **Installer C Dashboard**:
   - Logout, login as Installer C
   - Navigate to Leads tab
   - **Expected**: Only new lead Y visible

### Verification Checklist
- [ ] All 3 installers see the assigned lead
- [ ] Each installer sees only their assigned leads (isolation working)
- [ ] Countdown is identical for all 3 installers
- [ ] Lead price is the same for all

### Success Criteria
✅ Lead appears in all 3 installer dashboards  
✅ No duplicate leads for unassigned installers  
✅ Database shows 3 separate LeadAssignment records

---

## Test Case 3: Public vs Private Leads (15 min)

### Objective
Verify that PUBLIC leads appear for all installers, while PRIVATE leads only show for assigned installers.

### Steps

1. **Setup Private Lead**:
   - Admin assigns lead X to **Installer A only**
   - Approve as PRIVATE (assignTo array has only Installer A)

2. **Setup Public Lead**:
   - Admin approves lead Y without specific assignment
   - Mark as PUBLIC (isPublic = true in admin settings)

3. **Installer A Dashboard**:
   - Login as Installer A
   - Navigate to Leads or Lead Feed tabs
   - **Expected**: See both lead X (private) and lead Y (public)

4. **Installer B Dashboard**:
   - Login as Installer B
   - Navigate to Leads or Lead Feed tabs
   - **Expected**: See only lead Y (public)
   - **Expected**: Lead X does NOT appear (private, not assigned)

### Verification Checklist
- [ ] Installer A sees 2 leads (1 private + 1 public)
- [ ] Installer B sees 1 lead (only public)
- [ ] Public lead has "Public Lead" badge/indicator
- [ ] Private lead has "Assigned" badge/indicator

### Success Criteria
✅ Public leads visible to all installers  
✅ Private leads only visible to assigned installers  
✅ Correct badges/indicators displayed

---

## Test Case 4: Expired Leads (10 min)

### Objective
Verify that expired leads are handled correctly (countdown shows "Expired", no unlock button).

### Steps

1. **Create Expired Lead** (Manual DB Update):
   ```sql
   -- Find a lead with countdown
   SELECT id, "expiresAt" FROM "Lead" WHERE status = 'APPROVED' LIMIT 1;

   -- Set expiration to past date
   UPDATE "Lead" 
   SET "expiresAt" = '2025-11-20 00:00:00'
   WHERE id = '[LEAD_ID]';
   ```

2. **Assign Expired Lead**:
   - Admin assigns the expired lead to Installer A
   - (Or use existing assignment if already assigned)

3. **Installer Dashboard**:
   - Login as Installer A
   - Navigate to Leads tab
   - Locate the expired lead

### Verification Checklist
- [ ] Lead shows "Expired" badge or countdown says "Expired"
- [ ] Lead card has visual indicator (e.g., red border, opacity 50%)
- [ ] "Unlock Lead" button is **disabled** or hidden
- [ ] Lead still displays address and quote type (for reference)

### Success Criteria
✅ Expired leads clearly marked  
✅ No action buttons enabled on expired leads  
✅ Expired leads do NOT count toward active lead count

---

## Test Case 5: Contact Masking (10 min)

### Objective
Verify that homeowner contact information is masked until installer purchases the lead.

### Steps

1. **Locked State** (Before Purchase):
   - Admin assigns lead to Installer A
   - Installer A logs in and views lead
   - **Expected**: Homeowner name shows **"***LOCKED***"**
   - **Expected**: Homeowner phone shows **"***LOCKED***"**
   - **Expected**: Homeowner email shows **"***LOCKED***"** (if displayed)

2. **Purchase Lead** (Simulate Purchase):
   ```sql
   -- Simulate lead purchase by setting installerId
   UPDATE "Lead"
   SET "installerId" = '[INSTALLER_A_ID]',
       "isPurchased" = true,
       "purchasedAt" = NOW()
   WHERE id = '[LEAD_ID]';
   ```

3. **Unlocked State** (After Purchase):
   - Refresh installer dashboard
   - View the same lead
   - **Expected**: Homeowner name shows **real name** (e.g., "John Smith")
   - **Expected**: Homeowner phone shows **real phone** (e.g., "(555) 123-4567")
   - **Expected**: Homeowner email shows **real email** (if displayed)

### Verification Checklist
- [ ] BEFORE purchase: All contact fields show "***LOCKED***"
- [ ] AFTER purchase: All contact fields show real data
- [ ] "Unlock Lead" button changes to "Contact Homeowner" or similar
- [ ] Lead price deducted from installer wallet (if wallet feature enabled)

### Success Criteria
✅ Contact masking works before purchase  
✅ Contact visible after purchase  
✅ No console errors during state transition

---

## Test Case 6: TypeScript & Build Validation ✅

### Objective
Ensure Phase 23 implementation has no TypeScript errors and builds successfully.

### Steps

1. **TypeScript Check**:
   ```bash
   npx tsc --noEmit
   ```
   - **Expected**: 0 errors in Phase 23 files:
     - `src/app/api/leads/[id]/approve/route.ts`
     - `src/app/api/installer/leads/assigned/route.ts`
     - `src/types/installer.ts`
     - `src/app/installer/(dashboard)/leads/page.tsx`
     - `src/app/installer/(dashboard)/lead-feed/page.tsx`

2. **Production Build**:
   ```bash
   npm run build
   ```
   - **Expected**: Build succeeds without errors
   - **Note**: ComponentLibraryTable errors are acceptable (demo component only)

### Verification Checklist
- [x] TypeScript validation passes for Phase 23 files ✅
- [ ] Production build completes successfully
- [ ] No runtime errors in production mode

### Success Criteria
✅ TypeScript errors: 0 (in Phase 23 scope)  
✅ Build succeeds  
✅ Production server starts without errors

---

## Edge Cases & Additional Testing

### Edge Case 1: No Assigned Leads
- Login as new installer with 0 assignments
- **Expected**: Empty state shows "No leads assigned yet"
- **Expected**: Helpful message or CTA to contact admin

### Edge Case 2: Loading State
- Clear browser cache, reload installer dashboard
- **Expected**: Loading spinner shows during API fetch
- **Expected**: No flash of empty state

### Edge Case 3: API Error Handling
- Stop PostgreSQL container: `docker stop solarmatch-db-1`
- Refresh installer dashboard
- **Expected**: Error message shows "Failed to load leads. Retry?"
- **Expected**: Retry button allows re-fetch

### Edge Case 4: Concurrent Assignments
- Admin A assigns lead to Installer X
- Admin B assigns same lead to Installer Y (at same time)
- **Expected**: Both assignments created (skipDuplicates handles re-approvals)
- **Expected**: Both installers see the lead

---

## Post-Testing Actions

After all test cases pass:

1. **Update Tasks.md**:
   ```markdown
   - [x] 23.6.1: Test Case 1 - Single Assignment ✅
   - [x] 23.6.2: Test Case 2 - Multiple Installers ✅
   - [x] 23.6.3: Test Case 3 - Public vs Private ✅
   - [x] 23.6.4: Test Case 4 - Expired Leads ✅
   - [x] 23.6.5: Test Case 5 - Contact Masking ✅
   - [x] 23.6.6: TypeScript + Build validation ✅
   ```

2. **Update Audit Report**:
   - Mark `DOC/AUDIT-REPORTS/LEAD-GENERATION-SYSTEM/INSTALLER-LEADFEED-INTEGRATION-AUDIT.md` sections as complete

3. **Proceed to Phase 23.7**:
   - Documentation updates
   - Final commit: "feat: Complete Phase 23 - Installer Leadfeed Integration"
   - Push to remote branch

---

## Troubleshooting

### Issue: Leads not appearing in installer dashboard
**Symptoms**: Installer logs in, sees empty state despite admin assignment

**Debug Steps**:
1. Check database for LeadAssignment records:
   ```sql
   SELECT * FROM "LeadAssignment" WHERE "installerId" = '[INSTALLER_ID]';
   ```
2. Check browser console for API errors
3. Verify session authentication (check session userId matches installerId)
4. Check API response manually: GET http://localhost:3001/api/installer/leads/assigned

**Common Causes**:
- LeadAssignment records not created (Phase 23.1 issue)
- Session role not INSTALLER (authentication issue)
- API endpoint returning 403/401 (authorization issue)

### Issue: Contact still masked after purchase
**Symptoms**: Homeowner info shows "***LOCKED***" even after purchase

**Debug Steps**:
1. Verify installerId in Lead table matches logged-in installer:
   ```sql
   SELECT id, "installerId", "isPurchased" FROM "Lead" WHERE id = '[LEAD_ID]';
   ```
2. Check API response manually - verify `isPurchased` field is true
3. Refresh page (session may need re-fetch)

**Common Causes**:
- Database update failed (installerId not set)
- API logic checks wrong field (isPurchased vs installerId)
- Browser cache showing stale data

### Issue: Countdown shows incorrect time
**Symptoms**: Countdown shows "23h 59m" when should be "1d 23h"

**Debug Steps**:
1. Check expiresAt timestamp in database:
   ```sql
   SELECT id, "expiresAt", NOW() as current_time FROM "Lead" WHERE id = '[LEAD_ID]';
   ```
2. Verify countdown-service calculation logic
3. Check timezone mismatch (server vs client)

**Common Causes**:
- expiresAt set to wrong timezone (UTC vs local)
- Countdown calculation not accounting for days
- Client clock out of sync

---

## Test Results Log

**Date**: ___________  
**Tester**: ___________  
**Environment**: http://localhost:3001

| Test Case | Status | Duration | Notes |
|-----------|--------|----------|-------|
| TC-1: Single Assignment | ⬜ | ____ | |
| TC-2: Multiple Installers | ⬜ | ____ | |
| TC-3: Public vs Private | ⬜ | ____ | |
| TC-4: Expired Leads | ⬜ | ____ | |
| TC-5: Contact Masking | ⬜ | ____ | |
| TC-6: Build Validation | ✅ | 5min | Phase 23 files error-free |

**Overall Status**: 🔄 IN PROGRESS  
**Blocker Issues**: None identified  
**Next Steps**: Complete manual browser testing (TC-1 through TC-5)

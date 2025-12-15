# Guest Flow Fix Plan - October 21, 2025

## 🎯 ACTUAL PROBLEM IDENTIFIED

**Root Cause**: Leads are created with `status: DRAFT` and `visibility: HIDDEN`, so they don't appear in dashboards.

---

## Problem Analysis

### Current Lead Creation (lead-service.ts Line 174-175)

```typescript
status: LeadStatus.DRAFT, // Start as DRAFT until phone verified
visibility: LeadVisibility.HIDDEN, // Hidden until approved by admin
```

**Why Leads Don't Appear:**
1. Lead created with `DRAFT` status
2. Lead visibility set to `HIDDEN`
3. Dashboard queries likely filter out DRAFT/HIDDEN leads
4. Homeowner and Admin don't see newly created leads

### Expected Behavior

**Original Intent** (from comments):
- DRAFT: Until phone verified
- HIDDEN: Until admin approves

**User's Expectation:**
- Lead should appear IMMEDIATELY in homeowner dashboard after submission
- Lead should appear in admin dashboard for approval

---

## Solution Options

### Option 1: Change Default Status to PENDING_APPROVAL ✅ RECOMMENDED

**Change**:
```typescript
// lead-service.ts line 174
status: LeadStatus.PENDING_APPROVAL, // ✅ Visible in dashboards immediately
visibility: LeadVisibility.PENDING,   // ✅ Visible to homeowner + admin, hidden from installers
```

**Advantages:**
- Lead appears in homeowner dashboard immediately ✅
- Lead appears in admin dashboard for approval ✅
- Still hidden from installers until approved ✅
- Matches user expectation ✅

**Workflow:**
1. Guest submits → Lead created with PENDING_APPROVAL
2. Homeowner sees in dashboard: "Pending Admin Approval"
3. Admin sees in dashboard: "New Lead - Requires Approval"
4. Admin approves → Status changes to APPROVED → Visibility PUBLIC
5. Installers can now see and purchase

### Option 2: Keep DRAFT but Show in Dashboards

**Change**: Modify dashboard queries to include DRAFT status

**Disadvantages:**
- DRAFT semantically means "incomplete"
- Confusing if lead is complete but marked DRAFT
- Less intuitive status progression

### Option 3: Two-Stage Status (DRAFT → PENDING)

**Change**: Update lead status after phone verification

**Workflow:**
1. Create with DRAFT (phone not verified)
2. After phone verification → Update to PENDING_APPROVAL
3. Dashboards show PENDING_APPROVAL leads

**Disadvantages:**
- More complex
- Extra database update required
- Phone verification not yet implemented

---

## Recommended Fix

### Step 1: Update Lead Creation Status

**File**: `src/lib/services/lead-service.ts`

**Change Line 174-175:**

```typescript
// BEFORE
status: LeadStatus.DRAFT, // Start as DRAFT until phone verified
visibility: LeadVisibility.HIDDEN, // Hidden until approved by admin

// AFTER
status: LeadStatus.PENDING_APPROVAL, // Show in dashboards immediately
visibility: LeadVisibility.PENDING,   // Visible to homeowner/admin only
```

**Rationale:**
- User submits quote → Lead is complete (not draft)
- Phone verification can be added later without blocking visibility
- Admin approval still required before installers see lead
- Matches user expectation: "I submitted, where is it?"

### Step 2: Verify Dashboard Queries Include PENDING_APPROVAL

**Homeowner Dashboard** should show:
- ✅ DRAFT
- ✅ PENDING_APPROVAL
- ✅ APPROVED
- ✅ PURCHASED
- ✅ QUOTED
- ✅ All statuses (it's their lead!)

**Admin Dashboard** should show:
- ✅ ALL statuses (admin sees everything)

**Installer Dashboard** should show:
- ✅ Only APPROVED leads (visibility: PUBLIC)
- ✅ Their purchased leads

### Step 3: Update Status Display Text

**Homeowner sees:**
- `PENDING_APPROVAL` → "Waiting for Admin Approval"
- `APPROVED` → "Available to Installers"
- `PURCHASED` → "Installer Purchased (Processing)"
- `QUOTED` → "Quote Received"

**Admin sees:**
- `PENDING_APPROVAL` → "⚠️ Requires Approval"
- `APPROVED` → "✅ Approved - Live"
- `PURCHASED` → "💰 Purchased"

---

## Implementation Steps

### Task 1: Fix Lead Creation Status ✅ CRITICAL

```typescript
// File: src/lib/services/lead-service.ts
// Line: 174-175

status: LeadStatus.PENDING_APPROVAL,
visibility: LeadVisibility.PENDING,
```

### Task 2: Verify Dashboard Queries

**Check**: `src/lib/services/lead-service.ts` - `getHomeownerLeadSummary()`

Line 358-369: Fetches all leads for homeowner (no status filter) ✅ CORRECT

```typescript
prisma.lead.findMany({
  where: { homeownerId: userId }, // ✅ All statuses included
  orderBy: { createdAt: 'desc' },
  take: 5,
})
```

### Task 3: Test Guest Flow

**Test Scenario:**
1. Incognito browser
2. Calculate instant quote
3. Click "Get Detailed Quotes from Installers"
4. Select type → Signup → Submit
5. Go to homeowner dashboard
6. **Expected**: Lead visible with status "Pending Approval"

**Verify:**
- [ ] Lead appears in homeowner dashboard
- [ ] Lead appears in admin dashboard
- [ ] Lead status shows "PENDING_APPROVAL"
- [ ] Lead visibility is "PENDING"
- [ ] leadSubmissionCount incremented

---

## Additional Context

### Why Was It DRAFT Before?

**Comment on Line 174**: "Start as DRAFT until phone verified"

**Intent**: Don't show leads until user verifies phone

**Problem**: Phone verification not implemented yet, so all leads stuck in DRAFT

**Solution**: Show leads immediately, add phone verification later as enhancement

### LeadVisibility Enum

```typescript
enum LeadVisibility {
  HIDDEN,    // Not visible to anyone except homeowner/admin
  PENDING,   // Visible to homeowner/admin, hidden from installers
  PUBLIC     // Visible to all (installers can purchase)
}
```

### LeadStatus Progression

```
PENDING_APPROVAL  // ← Start here (homeowner/admin can see)
    ↓
APPROVED          // Admin approved (installers can now see)
    ↓
PURCHASED         // Installer bought lead
    ↓
QUOTED            // Installer submitted quote
    ↓
ACCEPTED          // Homeowner accepted quote
```

---

## Summary

**User's Issue**: "After signup and Submit, the lead does not showing in the Homeowners & Admins dashboard"

**Root Cause**: Lead created with `DRAFT` status and `HIDDEN` visibility

**Fix**: Change default status to `PENDING_APPROVAL` with `PENDING` visibility

**Files to Change**:
1. `src/lib/services/lead-service.ts` - Line 174-175

**Testing Required**:
- Guest flow end-to-end
- Homeowner dashboard visibility
- Admin dashboard visibility
- Installer dashboard (should NOT see until approved)

**Expected Result**:
✅ Lead appears in homeowner dashboard immediately after submission
✅ Lead appears in admin dashboard for approval
❌ Lead NOT visible to installers until admin approves

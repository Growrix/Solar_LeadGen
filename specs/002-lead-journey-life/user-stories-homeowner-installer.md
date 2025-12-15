# User Stories by Persona - Solar Match Lead Journey

**Last Updated**: October 23, 2025  
**Feature Branch**: `002-lead-journey-life`  
**Total User Stories**: 12 (Admin: 2, Homeowner: 7, Installer: 3)  
**Status**: Phase 4.6 Complete ✅ | Phase 4.8-4.11 In Progress 🚧

---

## Table of Contents

### [1. Homeowner User Stories (7 phases)](#homeowner-user-stories)
### [2. Admin User Stories (2 phases)](#admin-user-stories)
### [3. Installer User Stories (3 phases)](#installer-user-stories)
### [4. Task Statistics & Progress](#task-statistics-summary)

---

# Homeowner User Stories

## Phase 3: US1 - Lead Submission ✅ COMPLETE (94%)

**Goal**: Enable homeowners to submit quote requests with OTP verification  
**Status**: 15/16 tasks complete  
**Independent Test**: Guest signup → lead creation → appears in both dashboards

### User Journey
```
Guest: Homepage → Calculate → Select Type → Signup → Lead Created
Returning: Login → 2nd Quote → OTP Required → Lead Created
```

### Tasks Completed (15/16)
✅ T028-T042: All API routes, services, components complete  
⚠️ T043: Dashboard UI (Deferred to Phase 10)

---

## Phase 4.8: Dashboard & Second Quotes ✅ COMPLETE (100%)

**Goal**: Second quote requests with quotas and verification  
**Status**: 19/19 tasks complete  
**Independent Test**: Request more quotes → pre-filled form → OTP → submit → quota updates

### User Journey
```
Dashboard → See 1/5 → Request More → Verify → Pre-filled Form → Submit → 5/5
Admin → Edit User Limit → Homeowner sees updated quota
```

### Tasks Completed (19/19)
✅ T161-T179: Schema, services, APIs, UI all complete

---

## Phase 4.9: Phone Verification UX ✅ COMPLETE (100%)

**Goal**: Fix phone pre-fill and profile sync  
**Status**: 9/9 tasks complete  
**Independent Test**: Verify phone → pre-filled input → edit → save → profile updates

### Problem Fixed
❌ Empty phone input → ✅ Pre-filled from session  
❌ No profile sync → ✅ Immediate updates everywhere

### Tasks Completed (9/9)
✅ T182-T190: Session, API, modal enhancements all complete

---

## Phase 4.9.5: First Quote After Sign-in 🚧 IN PROGRESS (29%)

**Goal**: Direct quote request for new homeowners  
**Status**: 2/7 tasks complete  
**Independent Test**: Zero leads → Request First Quote → Submit → Dashboard shows 1/5

### Tasks Status
✅ T202, T205: Success modal, view-only mode  
⏳ T195-T201: First-quote flow pending

---

## Phase 4.9.6: Second Quote & Bidding 🚧 IN PROGRESS (42%)

**Goal**: Batch quotes with bidding support  
**Status**: 16/38 tasks complete  
**Independent Test**: Request 2 call/visit + 2 written → 4 leads created

### User Journey
```
Request More → Pre-filled → Distribution Modal
→ Select 1 BIDDING + 2 CALL_VISIT + 1 WRITTEN
→ Submit → 4 Leads Created
```

### Tasks Status
✅ T208-T223: Schema, services, APIs, core UI complete (16)  
⏳ T227-T237: Navigation, testing, docs pending (22)

---

## Phase 4.10: Guest Flow Fixes 📋 PLANNED (0%)

**Goal**: Fix lead visibility and CRUD operations  
**Status**: 0/17 tasks complete  
**Critical Issues**: Leads not appearing, no edit/cancel

### Expected Deliverables
⏳ Session polling fix  
⏳ Lead edit modal  
⏳ Cancel with quota restoration  
⏳ Preview for approved leads

---

## Phase 4.11: Enhanced Quote Request 📋 PLANNED (0%)

**Goal**: Simplified form with BIDDING (1x limit)  
**Status**: 0/26 tasks complete  
**Independent Test**: SimplifiedForm → 1 BIDDING + 3 others → Submit

### Expected Deliverables
⏳ SimplifiedQuoteForm component  
⏳ BIDDING quota enforcement  
⏳ Price visibility removal  
⏳ Icons for quote types

---

# Admin User Stories

## Phase 4: US2 - Lead Review & Approval ✅ COMPLETE (100%)

**Goal**: Manual & auto-approval modes with automation rules  
**Status**: 16/16 tasks complete  
**Independent Test**: Manual mode → approve lead → marketplace | Auto mode → rule match → auto-approved

### User Journey
```
Manual: Review → Approve + Price → Lead visible to installers
Auto: Configure rules → New lead → Auto-approved if matched
```

### Tasks Completed (16/16)
✅ T044-T059: All routes, services, UI, automation complete

---

## Phase 7: US5 - Lead Lifecycle Management ⏳ NOT STARTED (0%)

**Goal**: Resale, archive, user management  
**Status**: 0/13 tasks complete  
**Independent Test**: Resell lead → marketplace | Archive → hidden | Suspend user → blocked

### Expected Deliverables
⏳ Lead resale functionality  
⏳ Archive system  
⏳ User suspend/verify

---

# Installer User Stories

## Phase 5: US3 - Lead Discovery & Purchase ⏳ NOT STARTED (0%)

**Goal**: Marketplace with Stripe payments  
**Status**: 0/15 tasks complete  
**Independent Test**: Browse → Purchase → Contact revealed

### Expected Deliverables
⏳ Marketplace page  
⏳ Stripe integration  
⏳ Verification flow

---

## Phase 6: US4 - Lead Status Tracking ⏳ NOT STARTED (0%)

**Goal**: Real-time status updates with Pusher  
**Status**: 0/11 tasks complete  
**Independent Test**: Update status → Push notification → Timeline updates

### Expected Deliverables
⏳ Status update API  
⏳ Timeline component  
⏳ Pusher integration

---

## Phase 9: US7 - Feedback & Rating ⏳ NOT STARTED (0%)

**Goal**: Lead quality ratings for admins  
**Status**: 0/8 tasks complete  
**Independent Test**: Rate lead → 5 stars → Admin sees feedback

### Expected Deliverables
⏳ Star rating component  
⏳ Quality dashboard  
⏳ Low-rating alerts

---

# Task Statistics Summary

## Overall Progress
- **Total Tasks**: 280
- **Completed**: 102 (36%)
- **In Progress**: 16 (6%)
- **Pending**: 162 (58%)

## By Persona
| Persona | Total | Done | In Progress | Pending | Status |
|---------|-------|------|-------------|---------|--------|
| **Homeowner** | 134 | 69 (51%) | 16 (12%) | 49 (37%) | 🚧 Active |
| **Admin** | 29 | 16 (55%) | 0 | 13 (45%) | ✅ MVP Done |
| **Installer** | 34 | 0 | 0 | 34 (100%) | ⏳ Not Started |
| **Cross-cutting** | 48 | 27 (56%) | 0 | 21 (44%) | ✅ Foundation |

## By Priority
- **P0 (Blocking)**: 17 tasks - Phase 4.10
- **P1 (MVP)**: 165 tasks - 54% complete
- **P2 (Important)**: 32 tasks - 0% complete
- **P3 (Enhancement)**: 21 tasks - 0% complete

## MVP Revenue Cycle Progress
✅ Phase 1: Setup  
✅ Phase 2: Foundation  
✅ Phase 3: Homeowner Lead Submission  
✅ Phase 4: Admin Approval  
⏳ Phase 5: Installer Purchase  
**Progress**: 3/5 phases (60%)

## Next Milestone
**Phase 4.10** - Guest Flow Fixes (17 tasks, 8-10 hours)  
**Impact**: Critical for guest-to-homeowner conversion

---

**Maintained by**: Solar Match Development Team  
**Last Update**: October 23, 2025  
**Next Review**: After Phase 4.10 completion

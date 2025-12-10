# Issues and Recommendations - Lead Generation System

**Last Updated**: November 15, 2025  
**Priority Scale**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)  
**Status**: Ready for implementation planning  

---

## 🎯 Executive Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 2 | Blocking critical user flows |
| **P1** | 5 | Important functionality gaps |
| **P2** | 7 | Quality of life improvements |
| **P3** | 4 | Nice-to-have enhancements |

---

## 🔴 P0 - CRITICAL ISSUES (Must Fix)

### P0-01: First-Time Homeowner Flow Incomplete

**Issue**: Authenticated homeowners creating their first lead don't provide contact details

**Impact**: 
- Installers receive leads without name, phone, or address
- Cannot contact homeowners
- Wasted marketing spend
- Poor installer experience

**Location**:
- `src/app/homeowner/dashboard/page.tsx` - "Get Started" button handler
- `src/components/NewQuoteRequestModal.tsx` - Modal orchestration
- `src/components/DetailedInformationModal.tsx` - EXISTS but not connected

**Root Cause**:
- `QuoteOptionsModal` submits lead immediately after quote type selection
- `DetailedInformationModal` component exists but never opens
- API route `/api/leads` doesn't require user detail fields

**Current Behavior**:
```
User clicks "Get Started"
  → InstantQuoteForm (calculate)
  → QuoteOptionsModal (select type)
  → ❌ Lead submitted immediately (missing data)
```

**Expected Behavior**:
```
User clicks "Get Started"
  → InstantQuoteForm (calculate)
  → QuoteOptionsModal (select type)
  → DetailedInformationModal (collect name/phone/address)
  → Lead submitted with complete data ✓
```

**Fix Required** (Phase 12):

1. **Dashboard Component** (`homeowner/dashboard/page.tsx`):
```typescript
// Add state
const [showDetailedInfoModal, setShowDetailedInfoModal] = useState(false);
const [pendingLeadData, setPendingLeadData] = useState(null);

// Modify QuoteOptionsModal callback
const handleQuoteTypeSelected = (type) => {
  setSelectedQuoteType(type);
  setPendingLeadData({ quoteType: type, ...quoteData });
  setShowDetailedInfoModal(true); // Don't submit yet!
};

// New handler for DetailedInformationModal
const handleDetailedInfoSubmit = async (userDetails) => {
  await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      ...pendingLeadData,
      name: userDetails.name,
      phoneNumber: userDetails.phone,
      address: userDetails.address
    })
  });
};

// Render modal
<DetailedInformationModal
  isOpen={showDetailedInfoModal}
  onClose={() => setShowDetailedInfoModal(false)}
  onSubmit={handleDetailedInfoSubmit}
/>
```

2. **API Route** (`/api/leads/route.ts`):
```typescript
// Already has conditional validation (Phase 12 ready)
// Just needs frontend to pass the data
```

3. **Lead Service** (`lead-service.ts`):
```typescript
// Already accepts name, phoneNumber, address
// Stores in Lead model ✓
```

**Estimated Effort**: 3-4 hours

**Testing Required**:
- [ ] "Get Started" → DetailedInformationModal opens
- [ ] Enter name/phone/address → validates correctly
- [ ] Submit → lead created with all fields
- [ ] Dashboard shows lead with complete data
- [ ] Admin sees contact details

**Status**: Documented in `/specs/002-lead-journey-life/PHASE-12-SUMMARY.md`

---

### P0-02: Guest Flow Session Race Condition

**Issue**: Lead creation may happen before NextAuth session fully established

**Impact**:
- Lead may not appear in homeowner dashboard
- Association with wrong user account
- Confusing user experience
- Support tickets

**Location**:
- `src/app/page.tsx` - `handleHomeownerSignupSuccess()`

**Root Cause**:
- NextAuth session initialization takes 200-500ms
- Frontend immediately calls `/api/leads` after registration
- API tries to use `session.user.id` before it exists

**Current Behavior** (Before Phase 4.10):
```
Registration POST /api/auth/register ✓
  → Returns user ID
  → NextAuth starts session setup (async)
  → Frontend immediately calls POST /api/leads ❌
  → API: session.user undefined!
  → Lead not created or wrong association
```

**Fix Implemented** (Phase 4.10):
```typescript
// Session polling logic
let sessionReady = false;
let attempts = 0;
const maxAttempts = 25; // 5 seconds

while (!sessionReady && attempts < maxAttempts) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const response = await fetch('/api/auth/session');
  const sessionData = await response.json();
  
  if (sessionData?.user?.role === 'HOMEOWNER' && sessionData?.user?.id) {
    sessionReady = true;
    break;
  }
  
  attempts++;
}

if (!sessionReady) {
  // Fallback: redirect to dashboard
  alert('Please create your quote from the dashboard');
  router.push('/homeowner/dashboard');
  return;
}

// NOW safe to create lead
await fetch('/api/leads', { ... });
```

**Status**: ✅ Implemented but **needs validation testing**

**Testing Required**:
- [ ] Register → immediate lead creation works
- [ ] Session available within 5 seconds
- [ ] Fallback triggers if session timeout
- [ ] Lead appears in dashboard correctly
- [ ] Test on slow connections

**Validation Checklist**:
```
Test Scenario 1: Fast Connection
- Register new account
- Should wait ~200-500ms
- Lead created successfully
- Dashboard shows lead immediately

Test Scenario 2: Slow Connection
- Throttle network (3G simulation)
- Register new account
- Should wait up to 5 seconds
- Lead created successfully OR fallback to dashboard

Test Scenario 3: Session Failure
- Mock session endpoint failure
- Register new account
- After 5 seconds, redirect to dashboard
- Show error message
```

**Estimated Effort**: 1-2 hours validation testing

---

## 🟡 P1 - HIGH PRIORITY ISSUES (Should Fix Soon)

### P1-01: No Lead Editing Capability

**Issue**: Users cannot edit leads in DRAFT status

**Impact**:
- Typos or mistakes require creating new lead (wastes quota)
- Poor user experience
- Increased support requests

**Current State**:
- Edit API endpoint doesn't exist
- Frontend has no edit UI
- Users must cancel and recreate

**Recommendation**:

**Create Edit Flow**:
1. Add "Edit" button to draft lead cards
2. Open modal with pre-filled form (reuse InstantQuoteForm)
3. Allow field updates
4. Save via `PATCH /api/leads/[id]`

**Restrictions**:
- Only DRAFT status leads can be edited
- Once PENDING_APPROVAL or higher, no edits
- Cannot change quote type (affects pricing)

**API Endpoint**:
```typescript
// PATCH /api/leads/[id]
// Auth: Homeowner (must own lead)
// Body: Partial<Lead> (only allowed fields)

Allowed fields:
- energyBill, roofType, budgetRange, desiredOffset
- batteryRequired, batteryCapacity
- timeframe, additionalNotes
- name, phoneNumber, address (Phase 12 fields)

NOT allowed:
- quoteType (affects pricing)
- status, visibility (admin only)
- homeownerId (security)
```

**Estimated Effort**: 4-6 hours

---

### P1-02: Lead Cancellation Not Connected

**Issue**: Cancel API exists but UI not wired up

**Impact**:
- Users cannot remove unwanted leads
- Quota not restored on cancellation
- Dashboard cluttered with cancelled leads

**Current State**:
- API: `POST /api/leads/[id]/cancel` ✅ Exists
- Frontend: No "Cancel" button
- Quota: Not restored on cancel

**Recommendation**:

**Connect Cancel Flow**:
```typescript
// Add to lead card
<Button onClick={() => handleCancelLead(lead.id)}>
  Cancel Lead
</Button>

// Handler
const handleCancelLead = async (leadId) => {
  if (!confirm('Cancel this lead? This action cannot be undone.')) return;
  
  await fetch(`/api/leads/${leadId}/cancel`, { method: 'POST' });
  
  // Refresh dashboard
  refetchLeads();
};
```

**Enhance Service**:
```typescript
// lead-service.ts - cancelLead()
// Add quota restoration logic

if (lead.status === 'DRAFT' || lead.status === 'PENDING_APPROVAL') {
  // Restore quota
  await prisma.user.update({
    where: { id: lead.homeownerId },
    data: {
      leadSubmissionCount: { decrement: 1 },
      // If BIDDING type, also decrement biddingLeadsSubmitted
    }
  });
}
```

**Business Rules**:
- Only DRAFT, PENDING_APPROVAL, PENDING_PHONE can be cancelled
- APPROVED, PURCHASED cannot be cancelled (installer involved)
- Quota restored only for early-stage cancellations
- Cancellation creates audit log

**Estimated Effort**: 2-3 hours

---

### P1-03: BIDDING Type Incomplete in SimplifiedQuoteFormModal

**Issue**: Repeat quote flow doesn't support BIDDING type

**Impact**:
- Users cannot request bidding quotes after first submission
- Inconsistent feature availability
- Confusion about BIDDING quota

**Current State**:
- `SimplifiedQuoteFormModal` only handles CALL_VISIT and WRITTEN_QUOTE
- BIDDING quota tracking exists in backend
- UI doesn't show BIDDING as option

**Recommendation**:

**Add BIDDING Support**:
```typescript
// SimplifiedQuoteFormModal.tsx
const quoteTypes = [
  { value: 'CALL_VISIT', label: 'Call/Visit', icon: <PhoneIcon /> },
  { value: 'WRITTEN_QUOTE', label: 'Written Quote', icon: <FileIcon /> },
  { value: 'BIDDING', label: 'Competitive Bidding', icon: <GavelIcon /> }
];

// Show quota separately
{user.biddingLeadsSubmitted < 1 ? (
  <Badge>1 bidding quote available</Badge>
) : (
  <Badge variant="disabled">Bidding quota used</Badge>
)}

// Validate before submission
if (selectedType === 'BIDDING' && user.biddingLeadsSubmitted >= 1) {
  showError('You can only create 1 bidding quote per account');
  return;
}
```

**Backend Already Ready**:
- `User.biddingLeadsSubmitted` ✓
- `LeadQuoteType.BIDDING` enum ✓
- Quota enforcement in `createLead()` ✓

**Just needs frontend UI**

**Estimated Effort**: 3-4 hours

---

### P1-04: No Lead Preview for Homeowners

**Issue**: Homeowners cannot see what installers will see

**Impact**:
- Cannot verify lead quality before approval
- No opportunity to fix errors
- Poor transparency

**Recommendation**:

Add "Preview" button for APPROVED leads:
```typescript
<LeadCard>
  {lead.status === 'APPROVED' && (
    <Button onClick={() => showLeadPreview(lead)}>
      Preview (Installer View)
    </Button>
  )}
</LeadCard>
```

Preview modal shows:
- All details installers see
- Masked contact info (reveals after purchase)
- Lead price
- Expiry countdown
- "This is how installers see your lead"

**Estimated Effort**: 3-4 hours

---

### P1-05: Phone Number Not Synced Between User and Lead

**Issue**: User.phone and Lead.phoneNumber can be different

**Impact**:
- Installers may get outdated contact info
- Profile updates don't reflect in leads
- Data inconsistency

**Recommendation**:

**Option A: Lead phone always copies from User**
```typescript
// At lead creation
Lead.phoneNumber = User.phone

// Pros: Always in sync
// Cons: Cannot customize per-lead
```

**Option B: Lead phone independent, warn if different**
```typescript
// Show warning if User.phone !== Lead.phoneNumber
"⚠️ This lead uses a different phone number than your profile"

// Pros: Flexibility
// Cons: More complexity
```

**Recommended**: Option B with warning

**Estimated Effort**: 2-3 hours

---

## 🟢 P2 - MEDIUM PRIORITY (Quality Improvements)

### P2-01: Batch Lead Submission

**Status**: Planned in Phase 4.9.6

**Description**: Allow submitting multiple leads at once

**Current**: One lead per submission flow

**Proposed**: `QuoteTypeDistributionModal`
```
User completes instant quote
  → Selects: 1 BIDDING + 2 CALL_VISIT + 1 WRITTEN_QUOTE
  → Submits all 4 at once
  → Quota: -4 from allowance
```

**Benefits**:
- Better UX for users wanting multiple quote types
- Reduced form fatigue
- Clearer quota visualization

**Estimated Effort**: 8-10 hours

---

### P2-02: Auto-Approval Rules Enhancement

**Current**: Basic rule matching exists

**Gaps**:
- Limited rule conditions
- No scheduling (time-based rules)
- No A/B testing
- No ML integration

**Recommendation**:

Enhance with:
- Location-based rules (high-demand areas)
- Time-of-day rules (approve during business hours)
- User history rules (verified users auto-approved)
- System size thresholds

**Estimated Effort**: 15-20 hours

---

### P2-03: Lead Expiry Notifications

**Current**: Countdown timer exists, no notifications

**Recommendation**:

Send alerts:
- 7 days before expiry: Email to homeowner
- 3 days before expiry: Email + dashboard notification
- 1 day before expiry: Urgent notification
- On expiry: Status change + reason

**Estimated Effort**: 4-6 hours

---

### P2-04: Admin Bulk Operations

**Current**: One-by-one approval/rejection

**Recommendation**:

Add bulk actions:
- Select multiple leads (checkboxes)
- Approve all (with same price)
- Reject all (with reason)
- Assign all to installer

**Estimated Effort**: 6-8 hours

---

### P2-05: Lead Quality Score

**Current**: No quality metric

**Recommendation**:

Calculate score based on:
- Complete vs incomplete fields (weight: 40%)
- Phone verified (weight: 20%)
- Realistic budget (weight: 20%)
- Property details completeness (weight: 20%)

Display in admin dashboard:
- High Quality (80-100%): Green badge
- Medium Quality (60-79%): Yellow badge
- Low Quality (<60%): Red badge, flag for review

**Benefits**:
- Admins prioritize high-quality leads
- Installers see quality indicator
- Homeowners incentivized to provide complete info

**Estimated Effort**: 6-8 hours

---

### P2-06: Lead Analytics Dashboard

**Current**: Basic count stats

**Recommendation**:

Add analytics:
- Conversion funnel (instant quote → lead → approval)
- Average time to approval
- Lead quality trends
- Popular configurations
- Geographic distribution
- Quote type distribution

**Estimated Effort**: 10-12 hours

---

### P2-07: Email Verification Reminder

**Current**: Email verification exists but not enforced

**Recommendation**:

After 2nd lead, if !emailVerified:
- Show banner: "Verify your email to unlock full features"
- Send verification email
- Block 5th lead if still not verified

**Estimated Effort**: 3-4 hours

---

## 🔵 P3 - LOW PRIORITY (Nice-to-Have)

### P3-01: Lead Templates

Allow saving quote configurations as templates:
- "My Standard 6.6kW System"
- "My Budget Option"
- Click to load template → quick submission

**Estimated Effort**: 5-6 hours

---

### P3-02: Installer Preference Matching

Let homeowners specify installer preferences:
- Local only
- Minimum rating
- Company size
- Certifications

System auto-assigns to matching installers

**Estimated Effort**: 8-10 hours

---

### P3-03: Lead Sharing

Allow homeowners to share approved lead with specific installers:
- Generate shareable link
- Installer clicks link → sees lead
- Track link clicks

**Estimated Effort**: 4-5 hours

---

### P3-04: SMS Notifications

Currently only email, add SMS:
- Lead approved → SMS to homeowner
- Installer interested → SMS to homeowner
- Quote received → SMS notification

**Estimated Effort**: 6-8 hours

---

## 🛠️ Technical Debt

### TD-01: Add Soft Deletes

**Current**: Hard deletes lose audit trail

**Recommendation**:
```typescript
// Add to all models
deletedAt DateTime?

// Query pattern
where: { deletedAt: null }

// Delete operation
update: { deletedAt: now() }
```

**Estimated Effort**: 4-6 hours (requires migration)

---

### TD-02: API Response Standardization

**Current**: Inconsistent response formats

**Recommendation**:
```typescript
// Success response
{
  success: true,
  data: { ... },
  meta: { timestamp, version }
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "...",
    details: [...]
  }
}
```

**Estimated Effort**: 8-10 hours (breaking change)

---

### TD-03: Add API Versioning

**Current**: No versioning, breaking changes risky

**Recommendation**:
```
/api/v1/leads
/api/v2/leads (future)
```

**Estimated Effort**: 3-4 hours

---

### TD-04: Database Connection Pooling

**Current**: Using Prisma defaults

**Recommendation**: Tune connection pool for production
```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_timeout = 30
  pool_size = 10
}
```

**Estimated Effort**: 2-3 hours

---

## 📊 Implementation Priority Matrix

```
┌─────────────────────────────────────────────────────────┐
│         Impact vs Effort Matrix                          │
│                                                           │
│  High │ P0-01 ⬤       │ P1-02 ⬤       │ P2-06 ◯        │
│ Impact│ P0-02 ⬤       │ P1-03 ⬤       │ P2-02 ◯        │
│       │               │ P1-01 ⬤       │                 │
│       ├───────────────┼───────────────┼─────────────────┤
│  Med  │ P1-04 ⬤       │ P2-01 ◯       │ P3-02 ○         │
│ Impact│ P1-05 ⬤       │ P2-04 ◯       │                 │
│       │               │ P2-05 ◯       │                 │
│       ├───────────────┼───────────────┼─────────────────┤
│  Low  │ P2-03 ◯       │ P2-07 ◯       │ P3-01 ○         │
│ Impact│               │ P3-03 ○       │ P3-04 ○         │
│       │               │               │                 │
│       └───────────────┴───────────────┴─────────────────┘
│         Low Effort      Medium Effort    High Effort     │
│         (1-4 hrs)       (4-8 hrs)        (8+ hrs)        │
│                                                           │
│  Legend: ⬤ P0/P1  ◯ P2  ○ P3                            │
└─────────────────────────────────────────────────────────┘

Recommended Order:
1. P0-01 (First-time flow) - 3-4 hrs - CRITICAL
2. P0-02 (Session validation) - 1-2 hrs - CRITICAL
3. P1-02 (Lead cancellation) - 2-3 hrs - Quick win
4. P1-03 (BIDDING support) - 3-4 hrs - Feature complete
5. P1-01 (Lead editing) - 4-6 hrs - Major UX improvement
6. P1-04 (Lead preview) - 3-4 hrs - Transparency
7. P2-01 (Batch submission) - 8-10 hrs - Major feature
```

---

## 🎯 Sprint Planning Suggestions

### Sprint 1: Critical Fixes (1 week)
- P0-01: Complete Phase 12 flow
- P0-02: Validate session polling
- P1-02: Connect cancel button
- **Total**: ~8-10 hours

### Sprint 2: Feature Completion (1 week)
- P1-03: BIDDING in simplified form
- P1-01: Lead editing
- P1-04: Lead preview
- **Total**: ~10-14 hours

### Sprint 3: Quality Improvements (2 weeks)
- P2-01: Batch submission
- P2-04: Bulk admin operations
- P2-05: Lead quality score
- **Total**: ~20-24 hours

### Sprint 4: Polish & Tech Debt (1 week)
- P2-03: Expiry notifications
- P2-07: Email verification
- TD-01: Soft deletes
- **Total**: ~10-14 hours

---

## 🔒 Security Recommendations

### SEC-01: Rate Limiting on Lead Creation

**Current**: Quota-based only

**Recommendation**: Add time-based rate limiting
```
Max 5 leads per hour per user
Max 20 leads per day per IP
```

**Prevents**: Abuse, spam, quota gaming

---

### SEC-02: Input Sanitization

**Current**: Basic validation

**Recommendation**: Add HTML sanitization for text fields
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

**Prevents**: XSS attacks in admin dashboard

---

### SEC-03: CSRF Protection Audit

**Current**: NextAuth provides CSRF tokens

**Recommendation**: Verify all state-changing operations use CSRF

---

## 📈 Success Metrics

After implementing fixes, measure:

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Lead completion rate | ~70% | >90% | P0 |
| Contact info present | ~60% | 100% | P0 |
| User satisfaction (NPS) | Unknown | >50 | P1 |
| Admin approval time | Unknown | <2 hours | P2 |
| Quota utilization | ~40% | >70% | P2 |
| Lead quality score | N/A | >80 avg | P2 |

---

**End of Issues and Recommendations Report**

**Summary**: 18 identified issues across 4 priority levels. Critical path: Fix P0-01 and P0-02 (4-6 hours total) to unblock user experience, then systematically address P1 items for feature completeness.

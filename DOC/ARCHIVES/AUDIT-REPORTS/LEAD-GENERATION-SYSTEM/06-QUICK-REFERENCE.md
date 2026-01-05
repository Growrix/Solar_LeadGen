# Quick Reference Guide - Lead Generation System

**Last Updated**: November 15, 2025  
**For**: Developers making changes to the lead generation system  

---

## 🚀 Quick Start

### Before Making Any Changes

1. **Read this guide** (5 minutes)
2. **Review Executive Summary**: `01-EXECUTIVE-SUMMARY.md`
3. **Check Issues Report**: `05-ISSUES-AND-RECOMMENDATIONS.md` for known problems
4. **Understand data flow**: `04-USER-FLOWS.md` for relevant user type

---

## ⚠️ Critical Areas (Don't Break!)

### Quota System
**Files**: `src/lib/services/lead-service.ts`

**Rules**:
- Total quota: `User.leadSubmissionCount < User.leadSubmissionLimit`
- BIDDING quota: `User.biddingLeadsSubmitted < 1`
- Verification gate: count >= 2 requires phone verification

**DO NOT**:
- Skip quota checks
- Modify counters without creating leads
- Change limits without admin approval

---

### Phone Verification
**Files**: 
- `src/lib/services/phone-verification-service.ts`
- `src/app/api/verification/send-otp/route.ts`
- `src/app/api/verification/verify-otp/route.ts`

**Rules**:
- Rate limit: 3 SMS per 15 minutes
- OTP expires: 15 minutes
- Max attempts: 3 per code
- Format: E.164 (+61...)

**DO NOT**:
- Bypass rate limiting
- Skip expiry checks
- Store plain OTP codes

---

### Lead Status Transitions
**Files**: `src/lib/services/lead-state.ts`

**Valid Transitions**:
```
DRAFT → PENDING_APPROVAL → APPROVED → PURCHASED
DRAFT → CANCELLED
PENDING_APPROVAL → REJECTED
APPROVED → EXPIRED
```

**DO NOT**:
- Skip status validation
- Allow backward transitions (APPROVED → DRAFT)
- Modify status directly without service

---

## 📝 Common Tasks

### Adding a New Field to Leads

1. **Update Prisma Schema**:
```prisma
// prisma/schema.prisma
model Lead {
  // ... existing fields
  newField  String?  // Add here
}
```

2. **Run Migration**:
```bash
npx prisma migrate dev --name add_new_field_to_lead
```

3. **Update Service**:
```typescript
// src/lib/services/lead-service.ts
export interface CreateLeadInput {
  // ... existing
  newField?: string;  // Add here
}
```

4. **Update API Route**:
```typescript
// src/app/api/leads/route.ts
const lead = await createLead({
  // ... existing
  newField: body.newField
});
```

5. **Update Frontend**:
```typescript
// Form component
const response = await fetch('/api/leads', {
  body: JSON.stringify({
    // ... existing
    newField: formData.newField
  })
});
```

---

### Adding a New Validation Rule

1. **Update Service**:
```typescript
// src/lib/services/lead-service.ts
export async function createLead(input: CreateLeadInput) {
  // Add validation
  if (input.someField && !isValid(input.someField)) {
    throw new Error('Invalid someField');
  }
  
  // ... rest of logic
}
```

2. **Return Proper Error**:
```typescript
// API route
try {
  await createLead(input);
} catch (error) {
  if (error.message.includes('Invalid')) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
  throw error;
}
```

---

### Changing Quota Limits

**DO NOT hardcode!** Use settings:

```typescript
// Get from database settings
const limit = await getSettingAsNumber('MAX_LEAD_SUBMISSIONS_TOTAL');

// Admin can change via:
// Admin Dashboard → Settings → Lead Management → Max Submissions
```

**Default values** (if setting missing):
- Total limit: 5
- Before verification: 2
- BIDDING limit: 1 (hardcoded in schema)

---

## 🐛 Debugging Tips

### Lead Not Appearing in Dashboard

**Check**:
1. Session valid? `console.log(session.user.id)`
2. Lead created? Query database: `SELECT * FROM leads WHERE homeownerId = '...'`
3. Correct user ID? Verify `lead.homeownerId === session.user.id`
4. API error? Check network tab for 4xx/5xx responses

**Common Causes**:
- Session not ready (P0-02 issue)
- Wrong homeownerId in lead
- Frontend not refreshing after creation

---

### Phone Verification Failing

**Check**:
1. Phone format: Must be E.164 (`+61412345678`)
2. Twilio credentials: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
3. Rate limit: Max 3 per 15 min per IP
4. OTP expiry: Valid for 15 minutes only

**Test Command**:
```bash
# Check Twilio config
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
```

---

### Quota Not Incrementing

**Check**:
1. Service called? `console.log` in `createLead()`
2. Transaction committed? No errors during lead creation
3. Counter field: `User.leadSubmissionCount` or `User.biddingLeadsSubmitted`

**Query to verify**:
```sql
SELECT id, email, leadSubmissionCount, biddingLeadsSubmitted 
FROM users 
WHERE email = 'test@example.com';
```

---

## 🔍 Finding Issues Quickly

### Where to Look by Symptom

| Symptom | Check These Files |
|---------|-------------------|
| Lead not created | `lead-service.ts`, `/api/leads/route.ts` |
| Quota wrong | `lead-service.ts` (createLead function) |
| Verification failed | `phone-verification-service.ts` |
| Modal not opening | Component state management, modal props |
| Session undefined | `page.tsx` (session polling logic) |
| API 401/403 | `authOptions` in `/lib/auth.ts` |

---

## 📚 Key Files Reference

### Backend (API & Services)

| File | Purpose |
|------|---------|
| `src/lib/services/lead-service.ts` | Lead CRUD, quota, validation |
| `src/lib/services/phone-verification-service.ts` | OTP logic |
| `src/lib/services/countdown-service.ts` | Expiry calculations |
| `src/lib/services/audit-logger.ts` | Activity tracking |
| `src/app/api/leads/route.ts` | Lead creation API |
| `src/app/api/verification/send-otp/route.ts` | Send SMS |
| `src/app/api/verification/verify-otp/route.ts` | Verify code |
| `prisma/schema.prisma` | Database schema |

### Frontend (Components & Pages)

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Guest homepage, registration flow |
| `src/app/homeowner/dashboard/page.tsx` | Homeowner dashboard |
| `src/components/InstantQuoteForm.tsx` | 8-step quote calculator |
| `src/components/DetailedInformationModal.tsx` | User details collection (Phase 12) |
| `src/components/QuoteOptionsModal.tsx` | Quote type selection |
| `src/components/homeowner/SimplifiedQuoteFormModal.tsx` | Repeat quotes |

---

## ⚡ Quick Commands

### Development

```bash
# Start dev server
npm run dev

# Run TypeScript check
npx tsc --noEmit

# Build for production
npm run build

# Database operations
npx prisma migrate dev
npx prisma studio
npx prisma generate

# Run specific tests
npm test -- lead-service
```

### Database Queries

```sql
-- Check user quota
SELECT email, leadSubmissionCount, leadSubmissionLimit, phoneVerified 
FROM users WHERE email = 'user@example.com';

-- Check recent leads
SELECT id, status, quoteType, createdAt 
FROM leads WHERE homeownerId = '...' 
ORDER BY createdAt DESC LIMIT 5;

-- Check pending verifications
SELECT * FROM phone_verifications 
WHERE status = 'PENDING' AND userId = '...';

-- Admin: Check all pending leads
SELECT l.id, u.email, l.quoteType, l.createdAt 
FROM leads l 
JOIN users u ON l.homeownerId = u.id 
WHERE l.status = 'PENDING_APPROVAL' 
ORDER BY l.createdAt DESC;
```

---

## 🚨 Emergency Fixes

### User Stuck at Quota Limit (Manual Override)

```sql
-- Increase specific user's limit
UPDATE users 
SET leadSubmissionLimit = 10 
WHERE email = 'user@example.com';

-- Reset user's count (use cautiously!)
UPDATE users 
SET leadSubmissionCount = 0 
WHERE email = 'user@example.com';
```

### Force Phone Verification (Skip OTP)

```sql
-- Mark user as verified
UPDATE users 
SET phoneVerified = true 
WHERE email = 'user@example.com';
```

### Manually Approve Lead

```sql
-- Approve lead without admin dashboard
UPDATE leads 
SET status = 'APPROVED', 
    visibility = 'PUBLIC', 
    approvedAt = NOW(), 
    expiresAt = NOW() + INTERVAL '30 days' 
WHERE id = 'lead-id-here';
```

---

## 📞 Support Checklist

When user reports issue:

1. **Get basic info**:
   - [ ] User email
   - [ ] What they tried to do
   - [ ] Error message (if any)
   - [ ] Browser/device

2. **Check database**:
   - [ ] User exists?
   - [ ] Quota status
   - [ ] Phone verified?
   - [ ] Recent leads

3. **Check logs**:
   - [ ] API errors in console
   - [ ] Audit logs for user
   - [ ] Network errors

4. **Common fixes**:
   - [ ] Clear browser cache
   - [ ] Verify email address
   - [ ] Check phone format
   - [ ] Reset quota (if appropriate)

---

## 🔗 Related Documentation

- **Full Audit**: `00-INDEX.md` → All reports
- **Database**: `02-DATABASE-SCHEMA.md` → Field definitions
- **APIs**: `03-API-ENDPOINTS.md` → Request/response formats
- **Flows**: `04-USER-FLOWS.md` → Visual diagrams
- **Issues**: `05-ISSUES-AND-RECOMMENDATIONS.md` → Known problems

---

## 💡 Pro Tips

1. **Always test with quota limits**: Create test users with different counts (0, 1, 2, 4, 5)
2. **Use Prisma Studio**: Visual database browser: `npx prisma studio`
3. **Check audit logs**: Every action logged, great for debugging
4. **Test phone verification in dev**: Use Twilio test numbers
5. **Read existing specs**: `/specs/002-lead-journey-life/` has detailed context

---

**Quick Reference Complete**

For detailed information, see full audit reports in this folder.

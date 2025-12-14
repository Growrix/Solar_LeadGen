# Email Deliverability Operations Guide

**Authority**: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md (Phase 5)  
**Owner**: DevOps / System Operations Team  
**Last Updated**: 2025-12-14  

## Purpose

This document defines the required email authentication and deliverability posture for the SolarMatch platform. It ensures that transactional emails (notifications, verification, password reset) reach recipients' inboxes rather than spam folders.

## Background

### Previous State
- Admin emails landing in spam folders
- No SPF/DKIM/DMARC enforcement
- Mixed sender addresses (unverified)
- No delivery monitoring

### Current State
- SendGrid integration with verified sender
- Delivery audit logging (see `EmailDelivery` model)
- Unified link sources (NEXTAUTH_URL canonical)
- Role-aware sender enforcement

## Required DNS Records

### 1. SPF (Sender Policy Framework)

**Purpose**: Authorize SendGrid to send emails on behalf of your domain.

**Record Type**: TXT  
**Host**: @ (root domain) or subdomain  
**Value**:
```
v=spf1 include:sendgrid.net ~all
```

**Verification**:
```powershell
nslookup -type=txt solarmatch.com
```

**Expected Output**: Should include `v=spf1 include:sendgrid.net ~all`

### 2. DKIM (DomainKeys Identified Mail)

**Purpose**: Cryptographically sign emails to prove they came from your domain.

**Setup**:
1. Login to SendGrid Dashboard
2. Navigate to: Settings → Sender Authentication → Authenticate Your Domain
3. Enter your domain name
4. Copy the CNAME records provided by SendGrid

**Record Type**: CNAME  
**Host**: `s1._domainkey.solarmatch.com` (SendGrid will provide exact values)  
**Value**: `s1.domainkey.u12345678.wl123.sendgrid.net` (example - use SendGrid's actual value)

**Verification**:
```powershell
nslookup -type=cname s1._domainkey.solarmatch.com
```

### 3. DMARC (Domain-based Message Authentication)

**Purpose**: Tell receiving mail servers what to do with emails that fail SPF/DKIM checks.

**Record Type**: TXT  
**Host**: `_dmarc.solarmatch.com`  
**Value** (Strict Policy):
```
v=DMARC1; p=reject; rua=mailto:dmarc-reports@solarmatch.com; ruf=mailto:dmarc-forensics@solarmatch.com; pct=100; adkim=s; aspf=s;
```

**Value** (Relaxed Policy - recommended for initial deployment):
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@solarmatch.com; pct=10; adkim=r; aspf=r;
```

**Policy Meanings**:
- `p=none`: Monitor only (no action)
- `p=quarantine`: Send to spam if fails
- `p=reject`: Reject delivery if fails
- `pct=10`: Apply policy to 10% of emails (gradual rollout)

**Verification**:
```powershell
nslookup -type=txt _dmarc.solarmatch.com
```

## SendGrid Configuration

### Verified Sender

**Required**: All emails MUST be sent from a verified sender address.

**Current Setup**:
- Verified Sender: `noreply@solarmatch.com` (configured in SENDGRID_FROM_EMAIL)
- DO NOT use user emails as "from" address (will fail DKIM)

**Verification**:
```powershell
# Check current verified sender
curl -H "Authorization: Bearer $SENDGRID_API_KEY" https://api.sendgrid.com/v3/verified_senders
```

### Domain Authentication

**Status**: REQUIRED  
**Location**: SendGrid Dashboard → Settings → Sender Authentication

**Steps**:
1. Click "Authenticate Your Domain"
2. Enter `solarmatch.com`
3. Add CNAME records to DNS provider
4. Wait 24-48 hours for verification
5. Verify in SendGrid dashboard (green checkmark)

### Suppression Lists

**Purpose**: Prevent sending to bounced/spam-complained addresses.

**Types**:
1. **Bounces**: Hard bounces (mailbox doesn't exist)
2. **Spam Reports**: Recipient marked as spam
3. **Blocks**: SendGrid blocked delivery
4. **Invalid**: Malformed email addresses

**Management**:
- Location: SendGrid Dashboard → Suppressions
- Automated: SendGrid auto-adds to suppression lists
- Manual Removal: Only if confirmed false positive

**Database Integration**:
```typescript
// Check if email is suppressed before sending
import { isEmailSuppressed } from '@/lib/sendgrid/suppression';

if (await isEmailSuppressed(email)) {
  console.warn(`Email ${email} is suppressed - skipping send`);
  return;
}
```

## Monitoring and Alerts

### Email Delivery Dashboard

**Location**: `GET /api/admin/email-delivery-stats`

**Metrics**:
- Total emails sent (last 7 days)
- Delivery rate (target: >95%)
- Bounce rate (target: <5%)
- Spam report rate (target: <0.1%)
- Failed sends (target: <1%)

**Query Example**:
```sql
-- Recent delivery failures
SELECT 
  recipient_email,
  subject,
  status,
  error_message,
  sent_at
FROM email_deliveries
WHERE status IN ('BOUNCED', 'SPAM_REPORT', 'FAILED')
  AND sent_at > NOW() - INTERVAL '7 days'
ORDER BY sent_at DESC;
```

### Alerts

**Critical Thresholds** (trigger immediate action):
- Bounce rate > 10%
- Spam report rate > 1%
- Delivery rate < 85%

**Warning Thresholds** (investigate):
- Bounce rate > 5%
- Spam report rate > 0.5%
- Delivery rate < 95%

**Alert Channels**:
- Email: ops@solarmatch.com
- Slack: #alerts-email-delivery
- PagerDuty: Email-Delivery-Critical

## Troubleshooting

### Admin Emails in Spam

**Symptoms**: Admin reports not receiving lead notifications.

**Diagnosis**:
1. Check EmailDelivery table for delivery status
2. Check SendGrid Activity Feed
3. Verify SPF/DKIM/DMARC records
4. Check recipient's spam folder

**Resolution**:
```sql
-- Find admin email deliveries
SELECT * FROM email_deliveries
WHERE recipient_role = 'ADMIN'
  AND status != 'DELIVERED'
ORDER BY sent_at DESC
LIMIT 10;
```

If status is `SPAM_REPORT`:
- Ask admin to whitelist `noreply@solarmatch.com`
- Check email content for spam triggers (too many links, ALL CAPS, etc.)
- Review DMARC policy (may be too strict)

### High Bounce Rate

**Symptoms**: >5% of emails bouncing.

**Causes**:
1. Invalid email addresses in database
2. Typos in email collection form
3. Temporary mailbox issues

**Resolution**:
1. Query bounced emails:
```sql
SELECT recipient_email, COUNT(*) as bounce_count
FROM email_deliveries
WHERE status = 'BOUNCED'
GROUP BY recipient_email
ORDER BY bounce_count DESC;
```

2. Remove hard bounces from active users
3. Implement email validation at signup (regex + DNS MX check)

### SendGrid API Quota Exceeded

**Symptoms**: `Failed to send email: 429 Too Many Requests`

**Resolution**:
1. Check SendGrid plan limits
2. Implement rate limiting in application layer
3. Consider upgrading SendGrid plan

## Compliance

### CAN-SPAM Act (US)

**Requirements**:
- ✅ Clear "From" line (noreply@solarmatch.com)
- ✅ Accurate subject lines (no deceptive headers)
- ✅ Identify message as advertisement (N/A - transactional only)
- ✅ Include physical address (in email footer)
- ✅ Provide unsubscribe link (for marketing emails only)
- ✅ Honor opt-out requests within 10 business days

### GDPR (EU)

**Requirements**:
- ✅ Obtain consent before sending marketing emails
- ✅ Allow users to access/export their email history
- ✅ Allow users to delete their email data
- ✅ Document lawful basis for processing (legitimate interest for transactional emails)

### Transactional vs. Marketing

**Transactional** (no consent required):
- Lead approval notifications
- Password reset emails
- Purchase confirmations
- Bid outcome notifications

**Marketing** (requires opt-in):
- Newsletter
- Product announcements
- Promotional offers

## Runbook

### Daily Operations

**Morning Checklist**:
1. Check EmailDelivery dashboard for overnight failures
2. Review SendGrid Activity Feed for anomalies
3. Check bounce/spam report rates
4. Verify no critical alerts

**Weekly Tasks**:
1. Review delivery metrics (target: >95% delivery rate)
2. Clean suppression lists (remove false positives)
3. Update DMARC policy if needed (gradual strictness increase)

### Incident Response

**Email Delivery Failure** (P1 - Critical):
1. Check SendGrid status page (https://status.sendgrid.com)
2. Verify API key is valid
3. Check Prisma connection (EmailDelivery logging)
4. Roll back recent email template changes
5. Notify on-call engineer

**Mass Spam Reports** (P2 - High):
1. Immediately pause affected email types
2. Review email content for spam triggers
3. Check if DMARC policy changed
4. Investigate if domain was blacklisted
5. Contact SendGrid support

## References

- **SendGrid Documentation**: https://docs.sendgrid.com
- **SPF Record Syntax**: https://www.rfc-editor.org/rfc/rfc7208
- **DKIM Specification**: https://www.rfc-editor.org/rfc/rfc6376
- **DMARC Specification**: https://www.rfc-editor.org/rfc/rfc7489
- **CAN-SPAM Act**: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- **GDPR Email Marketing**: https://gdpr.eu/email-marketing/

## Changelog

- **2025-12-14**: Initial documentation (Phase 5 of system audit fixes)
- **TBD**: Add webhook integration for delivery status updates
- **TBD**: Implement automated DMARC report parsing

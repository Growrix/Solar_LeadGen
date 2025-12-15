PART B — “Claim-Your-Profile” Onboarding Funnel & Marketing Sequence

This is the highest-quality, lowest-risk way to get verified installer data. I give you a full ready-to-deploy blueprint: landing page, form fields, verification logic, incentive design, email flows, admin review, and automation.

WHY this works

Installers control their own profile & will claim it if there's perceived value (free credits, higher ranking, verified badge).

You get verified phone/email/ABN + seller consent for contacting and listing — perfect for CRM and lead-selling.

Low legal risk and high data quality.

1) High-level funnel (flow diagram — textual)

SEO/PPC/Email/Outbound -> Landing page (Claim your free listing)

Installer enters ABN / company name (fast lookup & partial auto-fill)

System finds potential match and pre-populates profile (website, address, existing data)

Installer confirms/edits details, uploads proof (ABN docs, CEC ID, insurance)

Verify phone via OTP and email via verification link (double opt-in)

On success: grant 2–5 free lead credits + Verified badge + higher ranking in results

Admin reviews uploaded docs (or auto-approve if ABN match succeeds)

Profile published; record captured for CRM + lead marketplace (Opt-in consent captured)

2) Landing page / headline & copy (high-converting)

Headline: "Claim your free installer profile — get verified & receive free leads"
Subheadline: "Verify your business in 2 minutes. Get priority access to homeowner leads, exclusive discounts, and 2 free credits when you claim your profile."

Benefits (bullet points):

Verified badge for trust (shows to homeowners)

2 free exclusive credits to try the platform risk-free

Priority in local search results for verified installers

Auto-fill your profile from official ABN records — save time

Free REC/Registry checklist and quoting templates

Primary CTA (button): “Claim my profile — it’s free”
Secondary CTA: “See how many leads installers in your area get” (opens market data modal)

3) Claim form fields (minimal to reduce friction)

Step 1 (fast):

Company name (typeahead suggestions)

Business ABN (autocomplete & ABR lookup)

Contact phone (OTP verification)

Contact email (email verification)

Service categories (checkbox: Solar, Battery, Electrical, Plumbing, Heating, HVAC)

Service area (postcode list / radius)

[Checkbox] I confirm I have current public liability insurance (yes/no)

Step 2 (optional but incentivized for verification):

Website URL

ABN certificate upload (image)

CEC/SAustralia accreditation ID (if solar)

Insurance document upload (PDF/JPG)

Primary contact person name

Terms & consent checkbox (data usage & marketing opt-in)

4) Verification logic (automated)

ABN lookup: query ABR API with ABN -> if matched, auto-fill legal name & address.

Phone OTP: send SMS via Twilio; mark phone verified only after OTP success.

Email verification: send verification link via SendGrid/SES; mark email verified on click.

Document checks: basic file hash + OCR to read ABN number or license; flag for manual review if mismatch.

CEC check: query public registry if available for accreditation ID; if matched, set verified_cec=true.

Auto-approve rule: ABN matched + phone OTP + email verified = auto-verified; else flag for admin review.

5) Incentives (to maximize conversions)

2 free exclusive lead credits on successful claim (valid 30 days). Exclusive credits are high perceived value.

Verified badge displayed on profile and search results (trust signal).

Fee waiver for first month of subscription or discounted starter pack.

Featured trial promotion for the first 100 claimers in NSW/VIC.

6) Emails & Messaging Sequence (copy-ready)
A) Immediate email after sign-up (verification)

Subject: “Confirm your installer profile on [PlatformName]”
Body (short):

Hi {{first_name}},

Thanks for claiming your {{company_name}} profile on [PlatformName]. Please confirm your email by clicking the link below:

[Confirm my email]

Once confirmed, complete phone verification to unlock 2 free exclusive lead credits.

Thanks,
The [PlatformName] Team

B) SMS OTP (phone)
[PlatformName] verification code: 123456. Enter this code to verify your phone.

C) Post-verification welcome (email)

Subject: “You’re verified — 2 free leads credited”
Body:

Hi {{first_name}},

Congratulations — your profile is verified!

We've credited 2 exclusive lead credits to your account. Log in to view leads and manage your profile:

[Go to dashboard]

Pro tip: Complete your company profile and upload insurance to get the Verified+ badge.

Regards,
[PlatformName] Success Team

D) Nudge if not completed (48 hours)

Subject: “Complete your profile to claim more benefits”
Short copy with CTA to finish uploads and get 3 more credits for completion.

7) Admin review & trust workflow

Admin dashboard shows pending verifications with filters: ABN_mismatch, doc_uploaded, cec_unverified.

For auto-approved, landing the badge occurs instantly.

For manual review: admin checks docs and sets status; within dashboard, admin can set verified/suspended/needs more info. Provide canned emails for approved and request more info.

8) UX/Design notes (fast)

Use progressive disclosure: ask minimal info first (ABN + phone + email), then request optional docs.

Use inline ABN lookup to auto-fill address & business name to reduce friction.

Show trust badges (e.g., “ABN verified”, “CEC accredit.”).

Mobile first — many installers sign up on phone.

9) Automation & integrations (technical)

Backend: Next.js API or Node/Nest + Postgres. Use Supabase for faster implementation.

Auth: Supabase Auth / Auth0 (email + magic link), allow Google SSO for installers.

ABN lookup: ABR API call during signup (sync).

SMS OTP: Twilio Verify API (handles codes and security).

Email: SendGrid/SES.

Document storage: S3 or Supabase Storage; store secure links and hashed file.

Task queue: Bull / Sidekiq for background ABN/CEC checks.

Admin UI: React app for review & status setting.

Zapier/Make integration idea

On successful verification, push data to CRM (HubSpot), and send Slack notification to sales ops for outreach.

10) Sample database table for claimed profiles
CREATE TABLE installer_profiles (
  id SERIAL PRIMARY KEY,
  company_name TEXT,
  abn TEXT,
  abn_verified BOOLEAN DEFAULT FALSE,
  primary_email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  website TEXT,
  services TEXT[], -- e.g. ['solar','battery']
  service_areas TEXT[], -- postcodes
  documents JSONB,
  credits INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ
);

11) Marketing & acquisition playbook for claims (channels & tactics)

PPC: “Claim your installer profile + 2 free leads” — target solar installer NSW, solar accreditation.

Email outreach: Send targeted ABN/industry emails (careful with spam laws) inviting them to claim and get free credits.

Industry partnerships: Ask wholesalers/manufacturers to promote (they benefit from accurate installer lists).

Facebook/Meta: Target installer job titles, CEC tags, electrician groups.

Trade associations: partner to promote to their members (offer discounted premium plans).

On-site SEO: “List your solar business” landing page optimized for claim your business solar installer NSW.

12) Lead conversion & lifecycle once profile claimed

After claim: give credits; push installer to “complete profile” with scheduling, pricing, service categories.

Offer a short onboarding flow (tour) showing how to accept leads.

Use email funnels: day 0 welcome, day 2 nudge to upload docs, day 7 product benefits, month 1 offer to upgrade subscription.

13) Metrics & KPIs to track (for claims funnel)

CTR on landing page → claim rate (%)

ABN match rate (auto-approved)

Email verification rate

Phone verification rate

% of claimed profiles that become paying customers within 30/90 days

Leads redeemed per verified profile (value)

CAC for installer via this funnel

14) Example conversion numbers (benchmarks)

Landing page → sign-up conversion: 8–20% (claims are high-intent if messaging is strong).

ABN match & OTP verification auto-approve: 60–85% (depends on form friction).

Of verified installers, 10–30% convert to paid within 60 days (with free credits & outreach).

15) Example outreach email (for cold invite to claim)

Subject: “[CompanyName] — claim your free verified listing on [PlatformName] + 2 free leads”

Hi {{ownername}},

We found {{companyname}} in ABN records and created a free profile on [PlatformName]. Claim your listing in 2 minutes — verify your ABN and phone and we'll credit 2 exclusive leads for free.

Claim now: https://yourdomain.com/claim?abn={{abn}}

No cost, no obligation — just verified leads and more local customers.

Cheers,
[Your Name], [PlatformName]

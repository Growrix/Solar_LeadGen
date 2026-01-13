# Instant Quote Feature — End‑to‑End Plan

> Phase: Feature Planning / Blueprint (pre‑execution). This document expands the provided Instant Quote & Lead Flow plan, fills gaps, adds alternative options, audit findings, DB/API models, migrations, UI/UX suggestions, security/RLS, testing, metrics, and Copilot prompt packs for implementation.

---

## Table of Contents (living)

1. Executive summary
2. Top missing gaps & recommendations (quick wins)
3. Phase workflow + TOC (traceable prompts & ledger)
4. User journeys & detailed flows (Guest, Homeowner, Admin, Installer)
5. Data model (tables, columns, indexes) + sample migrations
6. API surface & server actions (endpoints, params, responses)
7. UI/UX requirements (forms, modals, dashboards)
8. Security, RLS & privacy considerations
9. Performance, caching & analytics
10. Testing & QA (unit, e2e, smoke, security)
11. Monitoring, observability & ops
12. Acceptance criteria & success metrics
13. Copilot prompt pack (atomic prompts + teacher notes)
14. Implementation checklist & next steps

---

## 1. Executive summary

This document converts your high‑level Instant Quote & Lead Flow into a traceable, implementable blueprint. It adds missing models, endpoints, UI elements, security controls, and test plans; provides alternative flows (lightweight vs rich), and generates Copilot prompts per phase so the Executor can implement sequentially while the Builder‑Instructor (GPT) keeps the ledger.

Key outcomes:

* Full DB schema for guest quotes, homeowner requests, installer purchases, and purchase ledger.
* Admin/Homeowner/Installer dashboard UI requirements and acceptance tests.
* Security & RLS rules for multi‑tenant environments.
* Audit log, consent capture, lead dedupe, and fraud detection recommendations.
* Copilot prompt pack to scaffold implementation files and migrations.

---

## 2. Top missing gaps & recommendations (quick wins)

**Gaps found**

* No `users` table / auth model defined — required for homeowner signups and role mapping.
* No single `QuoteRequest` root model for shared fields (duplication across CallVisit / Written requests).
* No purchase ledger or transaction model for installer lead purchases.
* No Admin pages or metrics UI scaffolded (only a note exists).
* No webhooks/CRM integration for leads, nor email notifications.
* No consent / T&Cs checkbox capture prior to saving guest data (GDPR/CCPA risk).
* No deduplication/lead‑scoring for installer leads (risk of selling low‑quality leads).
* No rate‑limit / captcha to prevent abuse (bots spamming instant quotes).

**Recommendations (short)**

1. Create canonical `quote_requests` table with polymorphic `request_type` to avoid duplication. Provide specialized child tables or JSON blobs for extra fields.
2. Add `users` and `profiles` tables; store homeowner metadata and link `guest_instant_quotes` to users when they sign-up (via merge operation).
3. Add `purchased_leads` + `transactions` tables to support installer purchases and refunds. Integrate Stripe for payments (optionally hold in escrow until installer marks contact made).
4. Implement lead dedupe and score pipeline (cheap: email/phone hash; better: fingerprinting + simple heuristic). Expose `lead_score` to installers and admin.
5. Create webhooks + CRM adapters with retry/backoff; allow installers to opt into webhook or CSV export.
6. Add admin metrics: conversion funnel (guest→signup→request→purchase), LTV per installer, cost per lead (if you sell), average quote value.
7. Add mandatory consent checkbox, privacy summary, and retention TTL for guest quotes.
8. Add request throttling and invisible CAPTCHA on instant quote submissions.

---

## 3. Phase workflow + TOC (traceable) — follow Feature Builder GPT contract

Phases (each phase ends with `step{N}-tag` and requires `step{N}: done` from Executor):

**Phase 1 — UI Shells & Routes** (`step1-ui-skeleton`)

* Admin layout updates (Metrics, Instant Quotes, Lead Purchases)
* Homeowner Dashboard skeleton
* Installer Lead Feed + Purchased Leads page

**Phase 2 — UX (Local Interactions)** (`step2-ux-wired`)

* Instant Quote form component (client validation, autosave)
* Signup flow modal + prefill merge

**Phase 3 — DB & API** (`step3-db-api-wired`)

* Create DB migrations, RLS policies
* API endpoints (server handlers)

**Phase 4 — Security & RLS** (`step4-security-rls`)

* Rate limits, role policies, data retention

**Phase 5 — Perf & Analytics** (`step5-perf-analytics`)

* Caching, ISR, event tracking

**Phase 6 — Testing & Ops** (`step6-tests-ops`)

* Unit tests, e2e flows, CI

**Phase 7 — Production Patch & Launch** (`step7-prod-ready`)

* Feature flags, rollout, telemetry

Ledger: each phase will include numbered prompts (e.g., 1.1, 1.2). The Copilot prompt pack is included in Section 13.

---

## 4. User journeys & detailed flows

### 4.1 Guest flow (lightweight)

* Guest opens Instant Quote form (single page or modal).
* Fills in address, roof size, electricity usage, orientation, budget, contact method preference.
* Client-side validation (address autocomplete optional).
* Submit — server side calculates estimate (pricing engine) and persists to `guest_instant_quotes` with `status='generated'`.
* Success modal: shows results and CTA to request installer quote. If CTA clicked -> show signup/login modal (or continue as guest with email capture and later merge).
* Capture consent and marketing opt‑in explicitly.

### 4.2 Guest → Sign up (convert to Homeowner)

* On request type selection, prompt for signup/login.
* If signing up, merge GuestInstantQuote into `homeowner` profile: update `guest_instant_quote.user_id = users.id` and copy metadata to `profiles`.

### 4.3 Homeowner Dashboard

* Shows list of Instant Quotes (generated & historic), Quote Requests (pending, responded, completed), and Purchased Lead interactions (if relevant).
* Pre-fill when creating new quote: fetch last quote inputs.
* Allow editing of saved quote inputs before submitting to installer.
* History and attachments (photos, documents) upload possible.

### 4.4 Installer experience

* Installer can browse Lead Feed (unbought leads) with filters (location radius, installation size, budget, roof type).
* When purchasing, transactional flow: `reserve` -> `pay` -> `unlock detailed contact`.
* After purchase, Homeowner contact details are revealed and the lead is marked `sold_to_installer_id` and `sold_at` timestamp.
* Installer Dashboard: Purchased Leads page (status, contact attempts, notes, mark as contacted / duplicate / refund request).

### 4.5 Admin Dashboard

* Metrics: total guest quotes, signups from quotes, quote→request conversion, sold leads revenue, refunds, and quality metrics.
* CRUD views for GuestInstantQuote, QuoteRequests, PurchasedLeads, Users.
* Action: Reassign lead (in case of disputes), issue refund, or disable installer.

---

## 5. Data model

### Core tables (suggested)

**users** (if using Supabase Auth, keep sync)

* id uuid PK
* org_id uuid
* email text unique
* role enum('owner','admin','installer','homeowner')
* created_at, updated_at

**profiles**

* id uuid PK
* user_id uuid FK
* full_name, phone, address json, timezone, metadata json

**guest_instant_quotes**

* id uuid PK
* org_id uuid
* session_id text (for anonymous tracking)
* user_id uuid nullable (filled on signup)
* ip inet, user_agent text
* inputs jsonb (raw form inputs)
* calculated jsonb (results: kW, panels, est_cost, payback_years, incentives_applied)
* lead_score numeric
* consent boolean
* created_at, updated_at
* ttl_at timestamptz (for automatic purging)

**quote_requests** (single root)

* id uuid
* org_id uuid
* homeowner_id uuid (user_id)
* guest_quote_id uuid nullable
* request_type enum('call_visit','written','design','battery_only','maintenance')
* status enum('requested','assigned','contacted','completed','cancelled')
* details jsonb (request specific fields)
* preferred_contact jsonb
* created_at, updated_at

**purchased_leads**

* id uuid
* org_id uuid
* installer_id uuid
* quote_request_id uuid
* price_cents int
* currency text
* purchased_at timestamptz
* contact_revealed boolean
* refunded boolean
* notes text

**transactions**

* id uuid
* purchased_lead_id uuid
* stripe_payment_id text
* amount_cents int
* status enum('pending','succeeded','failed','refunded')
* created_at

**lead_feed_view** (materialized view)

* consolidates guest_instant_quotes + calculated + location geohash

**audit_logs**

* id, actor_id, action, target_type, target_id, ip, meta json, created_at

### Indexes & constraints

* Unique(org_id, id) primary partitioning
* GIN index on inputs and calculated for fast JSON search
* Trigram index on user email / homeowner name for fuzzy search
* Geospatial index if storing lat/lng for lead radius queries (PostGIS or Postgres earthdistance)

---

### Sample migration SQL (Supabase/Postgres)

```sql
-- guest_instant_quotes
create table guest_instant_quotes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  session_id text,
  user_id uuid,
  ip inet,
  user_agent text,
  inputs jsonb not null,
  calculated jsonb not null,
  lead_score numeric,
  consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  ttl_at timestamptz
);
create index on guest_instant_quotes using gin (inputs jsonb_path_ops);
create index on guest_instant_quotes using gin (calculated jsonb_path_ops);

-- quote_requests
create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  homeowner_id uuid,
  guest_quote_id uuid,
  request_type text not null,
  status text default 'requested',
  details jsonb,
  preferred_contact jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- purchased_leads
create table purchased_leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  installer_id uuid not null,
  quote_request_id uuid not null,
  price_cents int not null,
  currency text default 'USD',
  purchased_at timestamptz default now(),
  contact_revealed boolean default false,
  refunded boolean default false
);

-- transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  purchased_lead_id uuid not null,
  stripe_payment_id text,
  amount_cents int not null,
  status text default 'pending',
  created_at timestamptz default now()
);
```

---

## 6. API surface & server actions

### Public (no auth)

* `POST /api/instant-quote` — accepts inputs, returns calculated estimate and `guest_quote_id`. Rate-limited + captcha.

  * payload: {address, area, usage_kwh, roof_orientation, tilt, panel_pref, ...}
  * response: {guest_quote_id, results, next_steps_cta}

* `GET /api/instant-quote/:id` — fetch quote (public if TTL not expired), used for preview links.

### Authenticated (user)

* `POST /api/quote-requests` — create `quote_request` from a guest quote or from inputs. Requires homeowner role.
* `GET /api/homeowner/quotes` — list homeowner's quotes and requests (paginated).
* `PUT /api/quote-requests/:id` — update request details (before assignment).
* `POST /api/quote-requests/:id/attach-files` — upload images/documents (Supabase storage signed URL).

### Installer / Marketplace

* `GET /api/lead-feed` — returns available leads (filters: radius, budget, panel_count). Installer role required.
* `POST /api/purchase-lead` — reserve & buy a lead (atomic). Body: {quote_request_id, payment_method_id}
* `GET /api/installer/purchased-leads` — list purchased leads with status
* `POST /api/installer/purchased-leads/:id/notes` — add note / mark as contacted

### Admin

* `GET /api/admin/metrics/quotes` — funnel metrics and totals
* `GET /api/admin/guest-quotes` — paged list with filters
* `POST /api/admin/lead-refund` — process refund and update transactions

### Webhooks & integrations

* `POST /api/webhooks/lead` — outbound webhook for CRM (configurable per installer)
* `POST /api/webhooks/payment` — receive payment events from Stripe

---

## 7. UI/UX requirements (components & pages)

**Components:**

* `InstantQuoteForm` (reusable): inputs, validation, autosave to localStorage, preview results panel.
* `QuoteResultCard`: summary of calculated results with export/share PDF option.
* `SignupModal` with `mergeGuestQuote(user_id, guest_quote_id)` logic.
* `HomeownerDashboard`: Quotes list, Create Quote (prefilled), QuoteRequest management.
* `Admin/GuestQuotesPage`: table with filters, modal to view detailed inputs and calculations.
* `Installer/LeadFeed` and `Installer/PurchasedLeads` pages.
* `PurchasedLeadDetail` page with contact reveal timeline, notes, attachment viewer.

**Modals / Dialogs**

* Lead purchase flow: reserve -> confirm payment -> unlock contact.
* Dispute flow modal for Homeowner (report duplicate / wrong installer contact).

**UX options / variants**

* **Fast lane**: minimal fields, immediate estimate, CTA to signup — higher conversion.
* **Accuracy lane**: advanced form with roof scan upload, address verification, inverter options — lower conversion but higher lead quality.
* Allow installers to set `lead_preference` filters (size, budget, location radius) and a subscription to receive high‑score leads.

---

## 8. Security, RLS & privacy

**RLS rules (Supabase/Postgres)**

* `guest_instant_quotes`: read for org members with specific role, write public for anonymous inserts but ensure rate limit. Only `admin` or the `user_id` can view PII (email/phone) after consent.
* `quote_requests`: homeowner_id or admin can read; installer can read only if lead purchased or assigned.
* `purchased_leads`: only the purchasing installer, admins, and finance roles can read.

**Privacy**

* Capture consent at time of guest quote save; store `consent` boolean + `consented_at` timestamp + `consent_version`.
* TTL policy: purge anonymous guest quotes after 90 days (configurable). Provide admin UI to change retention.

**Payment security**

* Use Stripe Checkout or Payment Intents; do not store card data. Keep webhooks secured with signature verification.

**Hardening**

* Rate limiting per IP and per session on `/api/instant-quote`.
* Abuse detection: flag repeated identical submissions; temporarily block session.
* Audit logs for lead purchases and contact reveals.

---

## 9. Performance, caching & analytics

* Cache computed estimate templates in Redis (or edge cache) keyed by quantized inputs (e.g., postcode + usage bucket) to avoid heavy recomputation for identical inputs.
* Use ISR for homeowner lists and admin dashboards with short revalidation (10–30s) for near‑real time.
* Track analytics events: `quote_generated`, `signup_from_quote`, `quote_requested`, `lead_purchased`, `contact_revealed`.
* Expose analytics in Admin: funnel conversion, lead quality over time, top geographies.

---

## 10. Testing & QA

**Unit tests**

* Pricing engine math correctness across edge cases (incentives = 0, battery only, negative values).
* API validation tests for instant quote inputs.

**Integration / e2e**

* Guest → generate quote → signup → create quote_request → installer purchases lead flow (happy path + failure modes for payment failure).
* Homeowner pre-fill + edit prior inputs scenario.

**Security tests**

* RLS asserts: attempt to access PII as another installer should be 403.
* Rate limit spike test.

**Manual smoke tests** (add to repo README):

1. As Guest, generate quote; ensure guest quote recorded and results match engine.
2. Sign up from modal and confirm guest quote merged to user profile.
3. Create quote_request as homeowner and verify stored details.
4. As Installer, fetch lead feed, purchase a lead, view contact details, mark contacted.
5. Admin: view funnels and refund a purchased lead; confirm transaction updated.

---

## 11. Monitoring, observability & ops

* Instrument key events (see analytics) to a central event bus (Datadog/Segment). Set up alerts for abnormal drop in conversions or payment failures > 5%.
* Log lead purchase failures and webhook delivery failures with retry/backoff and DLQ.
* Add a small admin debugging interface to replay webhooks and reprocess failing transactions.

---

## 12. Acceptance criteria & success metrics

**Functional**

* Guest can generate instant quote and results are persisted. ✅
* Guest can request a quote and sign up to complete the request. ✅
* Homeowner dashboard lists all quotes/requests and allows prefill/edit. ✅
* Installer can purchase leads; purchased leads reveal homeowner contact only after successful transaction. ✅

**Non-functional**

* Rate limit configured; abuse detection in place.
* RLS enforced end‑to‑end.
* TTL purge of anonymous guest quotes.

**KPIs to track (first 90 days)**

* Number of instant quotes generated per day
* Conversion: guest → signup (%)
* Conversion: signup → quote_request (%)
* Lead purchase conversion and refund rate

---

## 13. Copilot prompt pack (atomic prompts)

> Use these prompts verbatim in VS Code/Copilot to scaffold. Each prompt includes: Objective, Files to edit ONLY, Implementation notes, Do NOT, Acceptance, Teacher Notes, Commit.

**Prompt 1.1 — Create DB Migrations: Guest Quotes, Quote Requests, Purchased Leads**

```
Objective: Create Postgres migration SQL for guest_instant_quotes, quote_requests, purchased_leads, transactions, and audit_logs.
Files to edit ONLY:
- db/migrations/2025xx_create_instant_quote_tables.sql
Implementation notes:
- Use gen_random_uuid() defaults, include indexes for JSON search, add ttl_at on guest_instant_quotes.
Do NOT:
- modify unrelated tables
Acceptance:
- SQL runs without errors on Postgres and creates tables + indexes.
Teacher Notes: Adds persistence for quote flows; required before server APIs.
Commit: feat(db): add instant quote and lead purchase tables
```

**Prompt 3.1 — API: POST /api/instant-quote**

```
Objective: Implement server handler for POST /api/instant-quote
Files to edit ONLY:
- app/api/instant-quote/route.ts
Implementation notes:
- Validate input schema, rate limit, captcha check, compute estimate using pricing service module, insert into guest_instant_quotes, return {guest_quote_id, results}
Do NOT:
- return PII in response
Acceptance:
- curl POST to endpoint returns 200 and guest_quote_id; db row exists.
Teacher Notes: Input validation and idempotency matter. Use session_id header.
Commit: feat(api): instant quote endpoint
```

(Additional prompts: signup modal + merge logic, homeowner dashboard pages, installer purchase flow server actions, admin metrics endpoints, RLS policies, unit tests, e2e tests — follow the same template; include teach:brief or teach:deep where useful.)

---

## 14. Implementation checklist & next steps

1. Run DB migration prompt (1.1). ✅
2. Implement pricing engine module tests. ✅
3. Implement `POST /api/instant-quote` and local UI `InstantQuoteForm` (Phase 1/2). ✅
4. Implement signup modal and merge behavior (Phase 2).
5. Add Admin pages and metrics (Phase 1).✅
6. Implement installer lead feed and purchase flow + Stripe integration (Phase 3/4).✅
7. Add RLS policies and security tests (Phase 4).✅
8. Add analytics events and dashboards (Phase 5).✅
9. Run e2e smoke and security tests, fix issues, and tag `step7-prod-ready` for rollout.

---

### Appendix: Quick checklist for audit items we ran

* Verified missing models: users, profiles, purchased_leads — added.
* Identified PII exposure vectors — added RLS & consent capture.
* Payment and refund flows missing — added transactions table and webhooks.
* Admin metrics and pages missing — added endpoints and UI requirements.

---

**If you want** I will now:

* Generate the exact SQL migration file content (full) and RLS policy examples.
* Scaffold the API route handlers (Next.js App Router route.ts) with validation schemas.
* Produce React/Tailwind components for InstantQuoteForm + QuoteResultCard.

Choose one next step or tell me `step1: done` when you've executed Phase 1 items and I will emit Phase 2 prompts.





I want you to build Prisma, Tables, API , SQL migrations end to end for this : 
**Guest Experience:**
  - Guests can generate instant solar quotes by completing an Instant Quote form.(This modal is already built)
  - All guest submissions (inputs and calculated results) are saved in a dedicated `GuestInstantQuote` table.
  - Admins need visibility into the total number of guests who have generated instant quotes in real time with timestapm. (to be shown in the Admin Dashboard; modal/page not yet created, create the modal based on the table).

  *** Your Job is to Audit and understand the file attached and create tables based on the input fields. Also Audit the necessary files and folders in order to clean implimentation without messing up. Understand the scenario . after implimenting create a implimentation.md file where you will note what have you done and the clear users story. 



  So far unitl the 4.5 is done and What I see now, The guests can create leads by sigining up and it is successfully genereated and available on the Admin's dashborad for approval and further process. This is the story of generating first lead by homeowners. But now here comes the second lead generation phase. Now the homeowners Should see their generatated first lead in the dashboard. Also they can see the total limit was 5 and requested 1 and remaining 4. The quote counts and balance should be updated live upon new quotes requested. The they can request further Quotes from their dashboard. THe second lead generation process should be this : 

- Homeonwers click on requests for more quotes 
- There will be a modal will be open to Verify the contact number with OTP , the contact number will be shown and the user can edit the number and do the verification.
- In that modal, write some polite texts , that verify your contact number , we are protecting spam and fake request. Verify and Get serious attention from the Installers and request upto another 4 Quotes (Write it nicely).
- After verification via OTP 
- A modal will be opened that has all the fields are already filled up, which is actully the first lead inputs in the instantQuote caclulator. 
- Homeowner can edit any fields if they want to modify or change. 
- When they hit the calculate Again button , it will show the results just as the fisrt lead made. 
- There will be another result generated as per the homeowner modify input fields. This process is just exactly same as like the first lead but modified version for the second lead. 
- then they will see a send request button and after clicking on that button they will see a quoteOption modal to chose the quote type call/visit or Written Quote. within the both options should have options to select How many Installers they want to send quotes requests number.  
- The both type of quotes should be limited to max 4. E.g Homeowners can select call/visit quotes 2 , Written quotes 1 or even 2. and the limit is over. The modal should show the limit balance and also update upon usage of the limit. there should be flexibility to select the number of quotes within the limit.
- This limits can be updated only by the admin, If admin increase limit 4 to even 10, the Homeonwers can request more. 
- In the admin panel there should be a full control of the Homeowners quote limits. 
- after the request is sent , the homeowner should see the updated quote counts and balance in their dashboard.
- The homeowner should see the full history of the quotes requested in their dashboard with status.
- each quote should have a unique id and timestamp. that means, all the leads are unique and the process is same as the first lead generation. e.g if a homeowners requested 3 quotes, there should be 3 unique leads in the lead table with unique ids and timestamps. the admin admin panel should see all the leads in the lead table with unique ids and timestamps. and all the next process will be exactly same as the first lead generation process.


***The current Situation*** you should understand , We have generated all the spec files earlier, but during the build process for the fist 4 phaase we faced some challenges and issues, so I had to modify and update the tasks.md file in order to make it more clear and clean build process. I did not update the spec.md file because it was already too much big and complex. So I just updated the tasks.md file to make it more clear and clean. Now you have to audit all the files and folders and understand the current situation and then build the above mentioned features. And it should be end to end and aligned with the current build. So, you should read the tasks.md file and understand the current situation and then build the above mentioned features. and also the spec.md file and decide from where you can take the references and build the above mentioned features. Because I think this part is crucial and important to build in the next phase. Once the homeowner and Admin functions are clear and done, then the next phase will be the Installer part.it will give us more clean roadmap and direction. either you can update the tasks.md file or create a new file for the next phase. But it should be clear and clean and aligned with the current build. 

- 



I am getting confused after done each phase with what to test eactly manually . I need the exact checklist in real time after done a backend+ frontend done. E.g 
- You should see a OTP verification modal
- Then verify OTP 
- After that see a reqest more quotes. 

*** I want the clear checklist to for manual check after each Backend+frontend done. It should be mentioed in the workflow. 



I want you to add one more phase before this phase ## Phase 4: User Story 2 - Admin Reviews and Approves. make the phase name , Homeowners Quote Request after singin (phase 4.9.5) in the tasks.md  .

***Current Scenario*** The guest users can generate instant quotes and sign up to become homeowners. The homeowners can create their first lead which is visible to the admin for further processing. There are two states here : 
- Guest User : can generate instant quotes and sign up.
- Homeowner : can create their first lead which also will be visible to the admin if they start the signup process from the signup modal. (at this moment the homeowners are unable to Generate their first lead while they are just newly signed up, who did not start generating quote they way the guests do).

*** Now in this new phase 4.9.5*** , the homeowners started requesting their first quote After signe up. the flow will be as mentioned below. 

- they should go throuh the exactly same flow as like the guests do but they will not see the signup modal again because they are already signed up as homeowners. and all the next flows will be exactly same as the guest user flow. 

***Important Note*** : the scenario is slightly different here because the homeowners are already signed up users. so they will not see the signup modal again. they will directly see the instant quote form modal with all the fields empty to fill up and generate instant quote. and all the next flows will be exactly same as the guest user flow. 

***how to plan the phase*** : Audit the current files and folders and understand the current flow of the guest user instant quote generation and signup flow. then build the homeowners instant quote generation flow after signup. it should be exactly same as the guest user flow except the signup modal part.  

- Understand the scenario clearly
- Identify the files and folders to edit or add
- must be aligned with the current build and flow
- Ensure all changes are well-documented and communicated to the tasks.md file for clarity. before starting the implementation of this phase.
- this plan and the work process should be match and synced with the current workflow and build process based on the Tasks.md file.






now when a homeowner clickes on the Request more quotes -  it opens the pre-filled modal and calculate  - then when they click on submit Quote request there is a quote option modals open. 

***what is to change*** 
- Instead of this quoteoption modal, it should open a Quote Distribution modal.  In this modal use icons on each type of leads. 
- there should be 3 types of options to chose within the remaining balance of the users
- Call/visit, Written Quote , Bidding (Bidding quote can be requested only 1), and the rest can be used to generate the other 2 types of leads within the remaining balance. 
- all leads are unique and should be generated separately according to their types. 
- modify the current lead cards with icons to show as per the lead type. e.g show tropy icon in bidding leads on the dashboard. 

***Instructions*** do a deep audit and analyze the existing flow, files, api, prisma, db etc to get the clear picture of the current situation. Then identify the next impimentation workflow plan and update the tasks.md by creating a new phase and start implimenting accordingly. 




Now I am having issues with creating the bidding quote, the other 2 typers were successfully generated. Audit and understand the scenarion and identify the issues . here are terminal output if it helps you : 




***Admin Dashboard Lead Management***
-the admin dashboard lead management page has no back button the visit back to the dashbaord. update it by adding a back button
- the lead management page has : Homeowner	Location	Status	Verified	Energy Bill	Price	Created	Actions . You need to add Quote type column after Location column to show the type of quote requested by the homeowner. e.g Call/Visit, Written, Bidding.
- when the users verifeied their contact number via OTP during the quote request process, the verified column should show a green checkmark icon. if not verified it should show a red cross icon.
- In the Actions column, there is a view button to view the lead details in a modal. 
  - In that modal, you need to show the Quote Type field to show the type of quote requested by the homeowner. 
  - Also show the contact number field in that modal. 
  - Also show the unique quote id and timestamp in that modal.
- In the lead management page, there is no search functionality to search leads by homeowner name or quote id. add a search bar to search leads by homeowner name or quote id.
- there is no approve/reject functionality for the leads in the lead details page. add approve and reject buttons in the Actions column to approve or reject the leads. make sure it updates the lead status accordingly. 
- The lead price should not be shown in the homeowners dashboard in the lead cards. it should be shown only in the admin dashboard. 
- The details lead page should fetch exactly all the data that users inputs during the quote request process. 
- currently it is not showing the contact numbers. also the Energy Bill.
- there is a lead deatils already existed, you need to update that lead details as per the above mentioned requirements. 


***instructions*** 

first keep in mind that the admin lead managenemt was created earlier, but during the build process we faced some issues and challenges, so I had to modify the tasks.md file to make it more clear and clean. So you need to audit all the files and folders related to the admin lead management and understand the current situation. So now I see the admin lead management page has 2 different type of response and actions. the leads were generated earlier has the approve/redeject options, but the newly generated leads does not have approve/reject options. so you need to identify the issues and fix them. also implement the above mentioned requirements in the lastest lead generation process. you need to indentfy the dual response with old vs newly implimented lead generation process. you need to focus on the new version of lead generation process. and replace the old process with the new one. make sure there are only one process is left, no reduant or duplicate system should be there. Audit, analyze, understand the current situation and then plan the implementation accordingly. do not impliment if you are not clear about the situation. create a phase in the tasks.md and start implimenting. The goal is to have a clean and clear admin lead management system with all the above mentioned requirements. you also can read back the tasks.md file to understand what have we done earlier for this admin lead management system. this is crucial. 



***User Verification Status Update Feature***

now I can see the user verification status does not show on the admin lead management page , it should be updated immidiately after user has verified their phone number. all the leads should be updated with the verfiried badge. the icos should indicate that the contact is verified. 
- e.g the homewoners generated the first lead without OTP verifications, so the lead shows unverified status. then when the homeowner requests for more quotes and verifies the contact number via OTP, then all the leads of that homeowner should be updated with verified status automatically.
- the lead card will show the verified badhe icon accordingly. and visisble to all users including the admin,homeowners and installers on their respective dashboards.
- make sure the verified status is updated immidiately after the OTP verification is successful. notify the admin dashboard to update the status immidiately without refreshing the page.

***instructions***
- audit and understand the current API, prisma schema, db tables and frontend files and folders related to the lead management system. then plan the implementation accordingly without breaking any existing functionality. create a new phase in the tasks.md file and start implementing. make sure to document all the changes made in an implementation.md file with clear user stories.


***Countdown Timer for Lead Expiry Feature***

When the admin approved the leads , it should add a countdown timer bar on the top of the lead card that will show a 7 days countdown time for the expiry of this leads. And the leads should be expire and gets deactivated after 7 days autonmatically. The countdown timer should be visible to both the admin and the homeowner on their respective dashboards. After expiry , the lead status should be updated to expired automatically.

- The admin should have options to add/remove/restet the countdown timer for each lead from the lead details modal.
- The homeowner should also see the countdown timer on their dashboard lead cards for each lead they have requested.
- The countdown timer should be in days format e.g 7 days left, 6 days left etc.
- The countdown timer should be in red color when there are 2 days left to expiry.
- The countdown timer should be in green color when there are more than 5 days left to expiry.
- This countdown timer feature should be added to the existing lead management system without breaking any existing functionality. and it should be visible to homeowners,admin and also installers. but the admin should have the control to reset/add/remove the countdown timer. 
- admin should decide either to add contdown timer or not while approving the lead. if they choose to add countdown timer, then it will be added with 7 days by default. if they choose not to add countdown timer, then no countdown timer will be added.
- admin can set custom days for the countdown timer while approving the lead. e.g instead of 7 days, they can set 10 days or 5 days etc.  
- admins can reactivate any leads that are expired from the lead details modal. upon reactivation , the countdown timer will be reset to 7 days by default but admin can change it while reactivating. - installers should also see the countdown timer on their purchased leads dashboard for each lead they have purchased.
- the countdown timers automatically tunred off if a installer purchaed it (call/vist or written) . but for bidding leads it will remain until expiry unless admin reactivates it. 
- each leads should be unique with unique ids and timestamps and should be manageable with countdown timers individually. 

***Instructions*** 
1. audit and understand the current API, prisma schema, db tables and frontend files and folders related to the lead management system. then plan the implementation accordingly without breaking any existing functionality. create a new phase in the tasks.md file and start implementing. make sure to document all the changes made in an implementation.md file with clear user stories.
1. Implement the user verification status update feature as described.
2. Ensure that the countdown timer for lead expiry is functional and meets all specified requirements.
3. Test the system thoroughly to confirm that all features work as intended and that there are no regressions in existing functionality.
4. Document any changes made to the codebase, including new features and modifications to existing ones.
6. Follow the mandatory pre and post implementation checklist rules as mentioned in the workflow tasks.md file (D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\002-lead-journey-life\tasks.md) instructions.






I am not giving you any specific tasks but Instructions that how I want to work furhter with this speckit. My workflow is like this :
- You should follow the task planning and execution rules accordingly.
- I will always give you tasks by asking to create a phase in the tasks.md file. becuase pre-planned tasks always dont meet the results, so always I have to modify and update the plan on the go. So , from now now I will always ask you to create a phase in the tasks.md file based on the current situation and then start implementing accordingly. So that all the tasks will be performed as per the tasks.md files . As I am working in an exsiting project , so I need to keep the tasks.md file always updated and aligned with the current situation to avoid any messup situation. 



### Before Starting Any Phase:
1. **Pre-Phase Audit & Planning** (30-60 minutes):
   - Read ALL spec files thoroughly (`spec.md`, `data-model.md`, `contracts/*.openapi.yaml`)
   - must audit the current state of the site related to the planned tasks. Understand existing flows, identify gaps. Analyze API,DB,Prisma schema,frontend files etc.
   - must get a clear picture of the current state before start implimenting.
   - Never start any blind implimentation. Stop the process if you are not clear about my instructions vs the audit findings. Ask me to clarify.
   - Map out EXACT data structures from spec (don't invent new ones)
   - Identify existing code patterns to follow (auth, services, API routes)
   - Check Prisma schema matches spec BEFORE writing any code
   - List all files to create/modify with their exact purposes
   - Verify external dependencies are installed and configured
   - Document any spec ambiguities - ASK USER before assuming
   - **RULE**: If spec says PhoneVerification links to User, schema MUST link to User. Don't change mid-implementation.

### During Phase Implementation:
2. **Spec-Driven Implementation** (Task by Task):
   - **For each task**: Re-read relevant spec section FIRST
   - Never migrate entire database without my permission. 
   - you are only allowed to migrate DB for the specific parts. discuss with me further if needed.
   - no need to ask me if you are creating new tables in the DB 
   - Copy exact field names, types, and structures from spec
   - Follow existing code patterns (e.g., how other services are structured)
   - Use EXISTING utilities (don't reinvent: getSetting, createAuditLog, etc.)
   - Check function signatures in services BEFORE calling them
   - **Incremental Build Check**: After every 3-5 tasks, run `npm run build`
     - If errors appear: FIX according to spec, not by changing architecture
     - Don't create "temporary workarounds" that contradict spec
   - **Type Safety First**: Let TypeScript errors guide you to spec compliance
     - Missing field? Check spec - should it exist in schema?
     - Wrong type? Check spec - is service signature correct?
   - **No Spec Drift**: If you modify Prisma schema, update it ONCE at start of phase, not mid-phase
   - **Manual QA Checklist Required**: For any task that includes BOTH backend and frontend changes, add a short "Manual QA Checklist" directly under that task with steps to validate UI states, API calls (success and one error path), and data accuracy. Keep it observable and role-specific (Admin/Homeowner).

3. **Post-Phase Validation** (MUST COMPLETE BEFORE COMMIT):
   - ✅ **Schema Validation**: Run `npx prisma validate` - schema must match spec
   - ✅ **Type Check**: Run `npx tsc --noEmit` - all TypeScript must be valid
   - ✅ **Build**: Run `npm run build` - MUST pass with 0 errors
     - **Build Error Protocol**:
       1. Read error message carefully
       2. Check spec: Is implementation following spec exactly?
       3. Fix by aligning with spec, NOT by changing architecture
       4. If spec is ambiguous: STOP, document issue, ask user
       5. **Time Limit**: If fixing takes >30 min, STOP and report to user
   - ✅ **Lint**: Run `npm run lint` - fix critical issues only
   - ✅ **Manual Spot Check**: Open 2-3 key files, verify they match spec intent
   - ✅ **Task Checklist**: Every task T### must be checked off with proof
   - ✅ **Regression Check**: Run dev server, verify existing features still work

### Manual QA Checklist (After Backend + Frontend Work)
- Start with a clean browser session (incognito or cleared storage) to avoid cached data during validation.
- Walk through every new UI entry point in sequence; e.g., dashboard → OTP verification modal → verify code → Request More Quotes flow → confirm prefilled instant quote fields → submit and observe dashboard refresh.
- Exercise at least one error path for the updated feature (invalid OTP, missing required field, exhausted quota) and ensure UI messaging matches spec with no console errors.
- Inspect network requests in dev tools or Thunder Client while executing the flow to confirm payloads and responses match the API contracts.
- Document findings (successes, failures, screenshots) and extend this checklist with feature-specific steps before handing off for review.

4. **Commit Approval** (MANDATORY):
   - ❌ **NEVER commit without explicit user approval**
   - Present validation results:
     - Build output (success/warnings)
     - Files changed count
     - Key changes summary
     - Any deviations from spec (with justification)
   - Wait for user confirmation: "Yes, commit this phase"
   - Only then: `git add .` → `git commit -m "Phase X: <summary>"`

### Phase Completion Criteria:
- ✅ All tasks marked complete with evidence
- ✅ Implementation matches spec exactly (data model, API contracts, types)
- ✅ Prisma schema validated
- ✅ TypeScript compiles with no errors
- ✅ Build passes (`npm run build`)
- ✅ No critical lint errors
- ✅ No spec drift or architectural changes mid-phase
- ✅ User approval received
- ✅ Git commit created with detailed message

### 🚨 RED FLAGS - STOP IMMEDIATELY:
- Schema doesn't match spec → Review spec, fix schema ONCE
- Service function signatures differ from usage → Check existing services, align
- Build errors persist >30 minutes → Report to user, don't spiral
- Creating new patterns not in existing codebase → Use existing patterns
- Inventing field names not in spec → Use exact spec names
- "I'll fix it later" thoughts → Fix now according to spec, or ask user

---

## 🛡️ BUILD ERROR PREVENTION CHECKLIST

**Use this BEFORE writing any integration code:**

### 1. Schema Verification (5 min)
```bash
# Check Prisma schema for exact model structure
cat prisma/schema.prisma | grep -A 20 "model YourModel"

# Validate schema is correct
npx prisma validate

# Check what relations exist
grep -E "model (User|Lead|PhoneVerification)" prisma/schema.prisma -A 15
```

### 2. Service Signature Verification (10 min)
```bash
# Check what a service actually exports
grep "^export" src/lib/services/your-service.ts

# Check function signatures
grep "export async function" src/lib/services/your-service.ts -A 3

# Example: Before calling getSetting()
grep "export.*getSetting" src/lib/services/settings-service.ts -A 5
# Result: getSetting(key: string) - only ONE parameter!
```

### 3. Type Verification (5 min)
```bash
# Check NextAuth session type
grep -A 20 "interface Session" src/types/next-auth.d.ts

# Check if field exists in session.user
grep "interface.*User" src/lib/auth.ts -A 10

# Check Prisma Client types
grep "export.*CreateNotificationInput" src/types/notification.ts -A 10
```




I want you to do a deep audit the understand the current state clearly and validate the implimentation plan , if the plan is needed to update/modify according to the audit findings then do it accordingly. make sure the sites current state and the new implimentation plans are aligned . The plans is to work on ## Phase 5: User Story 3 - Installer Discovers and Purchases Lead (Priority: P1) 🎯 MVP (Persona: Installer) . follow all the implimentation mandatory rules. 




***UI BLUEPRINT INTEGRATION AND UPDATION OF RELEVANT FILES***

We have updateed the constitution.md and all the speckit files to reflect the new design token system for centralized theme colors. I have got a blueprint from the chatGPT and I am sharing with you. The goal is to update the constitution.md file without losing any important information and make it more concise and clear. not to replace the existing constitution.md file completely but you should merge the important points from the blueprint into the existing constitution.md file. Make sure to keep all the important information from the existing constitution.md file while integrating the new blueprint details. The final constitution.md file should be well-structured, easy to understand, and reflect the centralized theme system using CSS variables as per the blueprint. As we will be useing shadcn/ui components, make sure the constitution.md file aligns with shadcn/ui theming practices. And also check the tasks.md file were we have already implimented until T1040 according to the old constitution.md file. Make sure the new constitution.md file is aligned with the already implimented tasks in the tasks.md file. And also make sure the new constitution.md file is aligned with the current tailwind.config.js file and globals.css file. Also update the speck.md, plan.md. research.md files accordingly to reflect the new constitution.md file. or you decide which relevant files need to be updated to reflect the new constitution.md file and update it accordingly. 


 Here is the blueprint : 

GitHub Spec: Centralized Theme System Blueprint

Stack: Shadcn/UI · Tailwind CSS · Storybook

Title: Specification for Centralized Design Token & Theming Implementation
Goal:
Establish a single, scalable source of truth for all visual styles using CSS Variables (Design Tokens).
Enable easy, site-wide theme switching (Light / Dark / Brand) across all shadcn/ui components, with complete documentation and visual verification in Storybook.

I. 🎨 Design Token Naming Convention

All themeable properties — such as colors, radius, and shadows — must be defined via CSS Variables.

Category	CSS Variable Format (in globals.css)	Tailwind Class Usage
Colors	--<category>-<role>-<variant>	bg-<role>, text-<role>, border-<role>
Example	--primary, --background, --foreground, --card-border	bg-primary, text-foreground, border-card-border
Radius	--radius	rounded-[var(--radius)] or rounded-<size>
🎯 Required Core Color Tokens (Shadcn-Compatible Baseline)
Token	Role	Purpose
--background	Main Canvas	Page background.
--foreground	Main Text	Text color on --background.
--card, --card-foreground	Surface Container	Background/Text for cards, modals, etc.
--primary, --primary-foreground	Accent / Action	Primary interactive color.
--secondary, --secondary-foreground	Secondary Accent	Secondary button or less-dominant accent.
--destructive, --destructive-foreground	Negative Action	Error, danger, or destructive actions.
--muted, --muted-foreground	Subtle Surfaces	Muted background or secondary text.
--border, --input	Boundaries	Color for borders, dividers, and input outlines.
--ring	Focus Indicator	Outline color for accessibility focus states.

💡 Note: Use HSL color format (h s% l%) for easy programmatic manipulation and theme generation.

II. 🛠️ Implementation Workflow Blueprint

A predictable and repeatable process for introducing new themes or components.

A. Base Theme Setup (Phase 1)

Define Tokens in :root:
All tokens from Section I must exist in :root (inside app/globals.css).
These values represent the Default (Light) Theme.

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --radius: 0.5rem;
}


Tailwind Configuration Mapping:
In tailwind.config.js, map each CSS variable to its Tailwind utility class.

theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: 'hsl(var(--primary))',
    },
    borderRadius: {
      DEFAULT: 'var(--radius)',
    },
  },
}


Component Styling Rule (Critical):
✅ Use tokenized Tailwind classes (bg-primary, text-foreground) only.
❌ Never use hardcoded values (#fff, bg-blue-500, etc.).

B. Multi-Theme Setup (Phase 2)

Theme Switch Mechanism:
Use a global attribute on <html> to control theme selection.

<html data-theme="dark">


Theme Overrides in CSS:
Define overrides per theme directly in globals.css.

html[data-theme="dark"] {
  --background: 222.2 47.4% 11.2%;
  --foreground: 0 0% 100%;
  /* Override only the changed tokens */
}


Theme Provider Logic:
Implement a central ThemeProvider (e.g., via next-themes or Context API) that:

Toggles the data-theme attribute

Persists preference in localStorage

Reactively updates the UI

III. 📖 Storybook Integration & Verification

Load Global Styles:
In preview.js, import the global CSS.

import '../app/globals.css';


Enable Theme Switching in Storybook:
Use @storybook/addon-themes or a custom Decorator to sync with the app’s ThemeProvider.
Provide toolbar options for light, dark, and brand themes.

Verification Process:
Before merging any theme-related PR:

Visually confirm components render correctly in all themes.

Cross-check token mappings.

IV. 🤖 GitHub PR & Review Guardrails
Check Type	Enforcement
Style Check	PRs must not include hardcoded colors or spacing.
Token Check	New or modified tokens must include all-theme updates in globals.css.
Storybook Proof	Each PR must link a Storybook preview or screenshot of the affected components under all themes.
Lint/Test Hook	Add CI automation to flag hardcoded CSS colors or unregistered tokens.
V. 🔒 Extension & Maintenance Guidelines

New Token Addition:

Must include a semantic name (e.g., --success-bg, not --green)

Must be reflected across all themes before merge

Must include Storybook visual coverage

Deprecation Policy:

Tokens removed must include a migration note in /docs/CHANGELOG.md

Automation Hooks (Optional):

Add GitHub Action to auto-verify Storybook builds for visual consistency

Add lint rule (no-hardcoded-styles) using Stylelint or ESLint plugin

VI. ✅ Outcome

This Spec ensures:

Predictable visual consistency

Faster theme creation

Zero duplication across shadcn/ui, Tailwind, and Storybook

Visual testing at every PR

A single token change updates hundreds of components instantly — making the system scalable, accessible, and future-proof.





***UI LAYOUT BLUEPRINT INTEGRATION AND UPDATION OF RELEVANT FILES***

We have updateed the constitution.md and all the speckit files to reflect the new UI layout structure system. I have got a blueprint from the chatGPT and I am sharing with you. The goal is to update the constitution.md file without losing any important information and make it more concise and clear. not to replace the existing constitution.md file completely but you should merge the important points from the blueprint into the existing constitution.md file. Make sure to keep all the important information from the existing constitution.md file while integrating the new blueprint details. The final constitution.md file should be well-structured, easy to understand, and reflect the centralized. Update all the selected files accordingly to reflect the new constitution.md file. or you decide which relevant files need to be updated to reflect the new constitution.md file and update it accordingly. Ensure that the tasks.md file is aligned with the new constitution.md file. Here is the blueprint :
---

# 🧭 GitHub Spec: Page, Dashboard & Layout Architecture Blueprint

**Stack:** Next.js (App Router) · Shadcn/UI · TypeScript
**Goal:**
Ensure all pages, dashboard subpages, layouts, and routes follow a **single, predictable structure** that promotes scalability, consistent design, and clean navigation — eliminating layout duplication, routing chaos, and standalone page issues.

---

## I. 🎯 Core Principles

1. **Single Source of Truth for Layouts**
   All dashboard pages **must** inherit from a shared layout under `app/(dashboard)/layout.tsx`.
   No component or page should redefine sidebars, navbars, or containers independently.

2. **Hierarchical Routing Only**
   Subpages must live inside their **parent route folder** (never as siblings of `/dashboard`).

3. **Reusable UI Regions**

   * **Sidebar**, **Navbar**, and **Content area** are controlled centrally.
   * **Local page sections** may add secondary tabs or filters but cannot alter or duplicate the global layout.

4. **Consistent Folder Naming Convention**

   * Lowercase, kebab-case folders
   * Group related features together (`/dashboard/members`, `/dashboard/members/[id]`)
   * No plural/singular mix inconsistencies (`/members`, not `/member` unless explicitly single-resource view)

---

## II. 📁 Folder & File Structure Blueprint

```
app/
 ├─ (marketing)/               # Public site pages
 │   ├─ layout.tsx             # Public layout
 │   ├─ page.tsx               # Home page
 │   └─ about/page.tsx
 │
 ├─ (dashboard)/               # Authenticated app
 │   ├─ layout.tsx             # Main dashboard layout (shared UI)
 │   ├─ page.tsx               # Default dashboard overview
 │   │
 │   ├─ settings/              # Dashboard section (Parent Page)
 │   │   ├─ page.tsx           # Main settings page
 │   │   ├─ profile/page.tsx   # Subpage (nested under Settings)
 │   │   ├─ billing/page.tsx   # Subpage
 │   │   ├─ layout.tsx (optional) # Local layout if section-specific
 │   │
 │   ├─ members/
 │   │   ├─ page.tsx
 │   │   ├─ [id]/page.tsx
 │   │
 │   ├─ reports/
 │   │   ├─ page.tsx
 │   │   ├─ monthly/page.tsx
 │   │   ├─ yearly/page.tsx
 │   │
 │   └─ analytics/
 │       ├─ page.tsx
 │       ├─ layout.tsx         # If analytics section needs custom tabs
 │       └─ trends/page.tsx
 │
 ├─ (auth)/                    # Login, Register, Forgot Password
 │   ├─ layout.tsx
 │   └─ login/page.tsx
 │
 ├─ api/                       # API routes
 │   ├─ users/route.ts
 │   └─ reports/route.ts
 │
 └─ globals.css
```

---

## III. 🧩 Layout Architecture Rules

### A. Global Layouts

| Layout File                   | Purpose                                             | Scope                 |
| ----------------------------- | --------------------------------------------------- | --------------------- |
| `/app/layout.tsx`             | Root HTML shell (metadata, fonts, global providers) | Entire site           |
| `/app/(marketing)/layout.tsx` | Marketing/public-facing layout                      | Marketing site        |
| `/app/(dashboard)/layout.tsx` | Sidebar + Top Nav + Dashboard shell                 | All dashboard routes  |
| `/app/(auth)/layout.tsx`      | Authentication layout (no sidebar/nav)              | Login/Register routes |

**Example: `/app/(dashboard)/layout.tsx`**

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

> 💡 **Rule:** No page within `(dashboard)` should re-import or redefine `<Sidebar>` or `<Topbar>`.
> These are provided automatically by `layout.tsx`.

---

### B. Local Layouts (Optional, Scoped)

If a dashboard section needs its own tabs or sub-navigation (e.g., `/settings` or `/analytics`),
create a **local layout file** inside that folder.

**Example:** `/dashboard/settings/layout.tsx`

```tsx
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      <div className="flex gap-4 border-b mb-6">
        {/* Local tabs */}
      </div>
      {children}
    </section>
  );
}
```

> ⚠️ **Do not** include sidebar or topbar here — they come from the parent `(dashboard)` layout.

---

## IV. 🧭 Routing & Navigation Standards

1. **Centralized Navigation Definition**

   * The sidebar menu is defined in `/config/navigation.ts` or `/lib/navigation.ts`.
   * Each route entry includes:

     ```ts
     {
       label: "Settings",
       href: "/dashboard/settings",
       icon: SettingsIcon,
       subRoutes: [
         { label: "Profile", href: "/dashboard/settings/profile" },
         { label: "Billing", href: "/dashboard/settings/billing" },
       ],
     }
     ```

2. **Dynamic Active State**

   * Sidebar should automatically highlight active links using the current route from `next/navigation`.
   * Subpages inherit their parent’s highlight (e.g., `/dashboard/settings/profile` → highlights “Settings”).

3. **No Standalone Pages Inside Dashboard**

   * Any new dashboard page **must** be nested under `(dashboard)/` and integrated into the sidebar via config.
   * Standalone pages (not under `(dashboard)`) must use `(marketing)` or `(auth)` scope.

4. **Breadcrumbs (Optional Enhancement)**

   * Derived automatically from the route path.
   * `/dashboard/members/123` → Dashboard › Members › Details

---

## V. 🧩 Component Responsibility Rules

| Component                 | Responsibility                         | Reuse Scope                       |
| ------------------------- | -------------------------------------- | --------------------------------- |
| `Sidebar`                 | Handles navigation links, active state | Shared across all dashboard pages |
| `Topbar`                  | Search, profile menu, notifications    | Shared                            |
| `PageHeader`              | Optional per-section title/header      | Local (inside pages)              |
| `Card`, `Table`, `Button` | Pure UI components (tokenized)         | Global                            |
| `Layout` files            | Handle only structure, not logic       | Scoped (global or local)          |

---

## VI. ⚙️ PR Guardrails & Spec Checks

| Guard                             | Description                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| **Layout Consistency Check**      | All new pages must be nested under `(dashboard)` and rendered inside the main layout.    |
| **Navigation Check**              | Every new dashboard route must have a matching sidebar entry in `navigation.ts`.         |
| **No Layout Duplication**         | CI should scan for multiple imports of `Sidebar`/`Topbar` outside `layout.tsx`.          |
| **Storybook Visual Layout Check** | Each section should have a Storybook “Layout Demo” story verifying consistent structure. |

---

## VII. ✅ Outcome

This structure guarantees:

* 🧱 **Predictable, modular routing**
* 🎨 **Consistent visual and layout experience**
* ⚙️ **Easy onboarding and maintenance**
* 🧩 **Seamless AI/spec-based generation alignment** (no rogue folders or duplicated layouts)



***Tasks.md Audit Report***
Here is the current audit report of the tasks.md file related to the on going tasks that we are implimenting. As we are updating our specs on the go, so it is crucial to keep the tasks.md file aligned with the current specs and the site current state. So I have audited the tasks.md file and created this report for you to understand the current situation clearly. Please read it carefully before start implimenting any further tasks.

PHASE AUDIT SUMMARY
✅ Phases COMPLETE (Can mark all tasks done now):
Phase 4 (T038-T048): Typography System - 100% Complete
Phase 5 (T049-T058): Spacing System - 100% Complete
Phase 8 (T075-T079): Border Radius - 100% Complete (minus Chromatic T077)
Phase 9 (T080-T084): Animations - 100% Complete (minus Chromatic T082)
Phase 10 (T085-T088): QA Tools - 100% Complete (minus Chromatic T089-T090)
Phase 11 (T091-T095): White-Label - 100% Complete (minus Chromatic, WCAG T094)

⚠️ Phases INCOMPLETE (Missing files):
Phase 7 (T066-T074): Shadow/Elevation - 67% Complete (6/9 tasks)

✅ T066: Shadows.stories.tsx exists
✅ T067: ElevationHierarchy.stories.tsx exists
✅ T068: ElevatedButton.stories.tsx exists
❌ T069: Dropdown.stories.tsx MISSING
❌ T070: Modal.stories.tsx MISSING
⏸️ T071-T073: Chromatic testing (blocked)
✅ T074: elevation-system-guide.md exists
Phase 12 (T096-T318): Legacy Migration - <5% Complete (223 tasks)

❌ T096: scan-hardcoded-values.ts script MISSING
✅ T097: migration docs exist (hardcoded-color-scan.md, migration-dashboard.md)
❌ T098-T318: 221 page migration tasks NOT STARTED
Phase 13 (T319-T329): Polish - 0% Complete (11 tasks)

All documentation, CI/CD, and deployment tasks NOT STARTED



***Backend and the DevOps,CI/CD blueprint***

 I have got a blueprint from the chatGPT and I am sharing with you. The goal is to update the constitution.md file without losing any important information and make it more concise and clear. not to replace the existing constitution.md file completely but you should merge the important points from the blueprint into the existing constitution.md file. Make sure to keep all the important information from the existing constitution.md file while integrating the new blueprint details. The final constitution.md file should be well-structured, easy to understand, and reflect the centralized. Update all the selected files accordingly to reflect the new constitution.md file. or you decide which relevant files need to be updated to reflect the new constitution.md file and update it accordingly. Ensure that the tasks.md file is aligned with the new constitution.md file. Here is the blueprint :




Perfect — I’ll give you a complete, industry-standard **Backend Blueprint** tailored to your stack: **Docker (local DB) + Prisma (ORM)** with smooth portability to **Supabase (managed Postgres)** or any other Postgres DB provider. This will cover dev & prod practices, migration strategy, CI/CD, security, monitoring, and the exact pitfalls to avoid when switching between local Docker DB and a managed Postgres service.

I’ll structure it as: summary → concrete configs & examples → workflows and guardrails → production considerations → final checklist.

# Summary (what you’ll get)

* Local dev with Docker Compose + Postgres for parity with production.
* Prisma as single ORM layer; same Prisma schema works for local Postgres, Supabase Postgres, and others.
* Safe migration approach (dev vs prod): `prisma migrate dev` locally, `prisma migrate deploy` in CI/CD.
* Zero-downtime migration guidelines and data-migration/backfill patterns.
* Connection pooling and production DB tuning (PgBouncer, SSL).
* Integration options with Supabase Auth / RLS and trade-offs.
* CI/CD pipeline with migration job, client generation, and safe deploy.
* Backups, monitoring, observability, secrets, and security best practices.

---

# 1) Project layout & config (recommended)

```
/project
 ├─ prisma/
 │   ├─ schema.prisma
 │   ├─ seed.ts
 ├─ src/
 │   ├─ lib/
 │   │   ├─ db.ts            # Prisma client instance
 │   ├─ api/
 │   ├─ services/
 │   ├─ controllers/
 ├─ docker-compose.yml
 ├─ Dockerfile
 ├─ .env.example
 ├─ package.json
 └─ ci/
     ├─ deploy.yml
```

`src/lib/db.ts` (singleton Prisma client):

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn']
});

export default prisma;
```

`.env.example`

```
# Local Docker
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb?schema=public

# For production (Supabase or other)
# DATABASE_URL=postgresql://user:password@dbhost:5432/dbname?sslmode=require
```

---

# 2) Docker Compose for local development

Use Docker for reproducible local dev. This mirrors production Postgres features more reliably than sqlite.

`docker-compose.yml`

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  db_data:
```

Dev workflow:

* `docker compose up -d`
* `npx prisma migrate dev` (creates migration + updates local DB)
* `npm run dev`

---

# 3) Prisma best practices & schema tips

* Use a single Prisma schema for all environments. Keep `schema.prisma` clean and semantic.
* Use `schema.prisma` `@@map` and `@map` for column/table names if you need to match legacy DB.
* Keep relations explicit and add unique constraints where necessary.
* Add explicit `createdAt` / `updatedAt` timestamps and use `@updatedAt` for automation.

Example snippet:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Important:** Avoid using Prisma migrations to perform long-running, blocking operations (e.g., migrating huge text fields) without staged approach (see zero-downtime migrations).

---

# 4) Migrations: dev vs production flow

**Local dev**

* `npx prisma migrate dev --name add-some-field` — creates migration + updates local DB; use during feature work.

**CI / Production**

* Build step should run `npx prisma migrate deploy` to apply already-committed SQL migrations.
* NEVER run `prisma migrate dev` in production.

**CI tips**

* Use a shadow DB for generating migrations in CI if needed.
* In CI, run `npx prisma migrate deploy` before deploying your app container.
* For zero-downtime: run migrations as a separate step before rolling traffic to new code.

---

# 5) Zero-downtime & safe migration patterns

When changing schema in production:

1. **Additive changes only (safe):** Add nullable columns, new tables, indexes.
2. **Backfill:** Run background job to backfill data to new columns.
3. **Switch reads/writes:** Update application to start writing to new column while still reading old one if needed.
4. **Make column NOT NULL:** After backfill and sufficient verification, alter to NOT NULL in a separate migration.
5. **Remove legacy column:** Once safe, deploy migration to drop old column.

For large tables:

* Create indexes concurrently (Postgres `CREATE INDEX CONCURRENTLY`).
* Avoid `ALTER TABLE` on big tables that rewrites whole table in single migration.

---

# 6) Connection management & production tuning

* **Connection pooling:** Use PgBouncer in transaction pooling mode for production or use cloud provider’s pooling. Prisma opens many connections; without pooling you’ll exhaust DB connections in serverless environments.
* **Prisma Data Proxy:** Consider Prisma Data Proxy if deploying to serverless platforms to avoid too many DB connections.
* **SSL:** Force `?sslmode=require` and verify certs in production provider.
* **Max connections:** Tune `max_connections` on DB provider and `pool_size`/`connection_limit` on pooling layer.

Example DATABASE_URL with params:

```
postgresql://user:pass@host:5432/dbname?schema=public&sslmode=require
```

---

# 7) Supabase integration specifics (important)

Supabase uses PostgreSQL — Prisma works with Supabase out of the box. But be careful about:

**A. Row Level Security (RLS) and Auth**

* Supabase encourages RLS with policies based on JWT claims.
* If you use Prisma with a server-side DB user (service role), you bypass RLS — responsibility shifts to your backend for access control.
* Options:

  1. **Backend-only Prisma (recommended for full control)**

     * Use Prisma with a dedicated DB user (service-role-like) and implement all access control in your server/service layer.
  2. **Use Supabase APIs directly for client-side use + Prisma for server tasks**

     * For operations needing RLS/audited queries, use Supabase JS/PostgREST with logged-in user's JWT.
  3. **Hybrid:** Keep RLS for certain tables and use a service role via Prisma for internal work; be explicit and auditable.

**B. Extensions & Schema**

* Supabase may include extensions (pgcrypto, postgis). If your Prisma schema relies on extensions, ensure the target DB supports them.
* Supabase projects have `public` schema by default; confirm schema names match Prisma `schema` param.

**C. Service Role Key**

* Supabase exposes a `service_role` key which has elevated privileges; do **not** ship this to clients. Use it server-side only (and store in secure secret manager).

---

# 8) Security & secrets management

* **Never commit `.env`**. Keep `.env.example`.
* Use cloud provider secrets manager (Vercel, Netlify, AWS Secrets Manager, Google Secret Manager) for production envs.
* Use principle of least privilege for DB users.
* Secure DB access: require SSL, restrict IPs where possible.
* Sanitize and validate all input using `zod` (server-side) before it reaches Prisma.
* Encrypt sensitive fields at application layer if necessary (never store raw PII unless required).

---

# 9) API design & consistency

* Use **Controller → Service → Repository** separation:

  * **Controller**: HTTP layer, request parsing, response formatting.
  * **Service**: business logic, transactions.
  * **Repository (or Prisma client)**: raw DB access.
* Use consistent API response envelope:

```json
{ "status": "success" | "error", "data": {...}, "error": { code, message } }
```

* Use `Zod` to validate request bodies and transform into typed DTOs for Prisma.

---

# 10) Testing & CI

* **Unit tests** for services and utilities.
* **Integration tests** using:

  * **Testcontainers** (spins up ephemeral Postgres in CI) OR
  * Docker Compose with a test Postgres instance + `prisma migrate deploy` + seeding
* **E2E tests** against staging environment.
* CI pipeline steps (example order):

  1. Install deps
  2. `npx prisma generate`
  3. Run lint, unit tests
  4. Start test DB (docker compose or testcontainers)
  5. `npx prisma migrate deploy` (to test DB)
  6. Run integration tests
  7. Build + prisma client generation
  8. Deploy / Run migration job on production (see deploy strategy)

---

# 11) Backups, observability & incident handling

* **Backups**

  * Managed DBs: enable daily backups + PITR (point-in-time recovery) if available.
  * Self-hosted: schedule `pg_dump` (and WAL archiving) to remote storage.
* **Monitoring**

  * Monitor DB metrics: connection count, query time, slow queries, replication lag.
  * Tools: PgHero, pg_stat_statements, Datadog, Prometheus + Grafana.
* **Logging & Error Tracking**

  * Use centralized logging (e.g., LogDNA, Papertrail) and error tracking (Sentry) for backend services.
* **Alerting**

  * Set alerts for high error rates, high CPU, connection exhaustion, long-running queries.

---

# 12) Deployment & migration run strategy (recommended)

* **Pre-deploy job** (CI) — `prisma migrate deploy` to production DB. Fail the pipeline if migration fails.
* **Canary / phased rollout** — deploy service to staging first, smoke-test.
* **Blue/Green or rolling** deploys so old and new code can coexist during migration window when needed.
* **Run backfill jobs** after migration if needed; these should be idempotent.

---

# 13) Practical commands & snippets

Generate client whenever schema changes:

```bash
npx prisma generate
```

Apply migrations in prod:

```bash
npx prisma migrate deploy
```

Reset local dev DB:

```bash
npx prisma migrate reset
# WARNING: drops all data. Use only in dev.
```

Seeding example (`prisma/seed.ts`):

```ts
import prisma from "../src/lib/db";

async function main() {
  await prisma.user.create({ data: { email: "admin@example.com", name: "Admin" } });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

Add to `package.json`:

```json
"prisma:seed": "ts-node prisma/seed.ts"
```

---

# 14) Common pitfalls & how to avoid them

* **Pitfall:** Too many DB connections in serverless — fix with PgBouncer or Prisma Data Proxy.
* **Pitfall:** Relying on `prisma migrate dev` in production — always use `prisma migrate deploy`.
* **Pitfall:** Directly dropping or altering big tables in one migration — follow zero-downtime pattern.
* **Pitfall:** Using Supabase service key in frontend — store server-side only.
* **Pitfall:** RLS mismatch — if you switch between Supabase Auth + RLS and Prisma server-side, pick one model and document access control clearly.

---

# 15) Checklist — ready-to-go (copy into your repo as `BACKEND_GUIDELINES.md`)

* [ ] `docker-compose.yml` for local Postgres and healthcheck present.
* [ ] `prisma/schema.prisma` stored and canonical for all envs.
* [ ] `.env.example` with `DATABASE_URL`.
* [ ] `src/lib/db.ts` as single Prisma client instance.
* [ ] CI step: `prisma generate` + `prisma migrate deploy` before deployment.
* [ ] Connection pooling strategy selected (PgBouncer or Prisma Data Proxy).
* [ ] Backups configured in prod (daily + PITR if available).
* [ ] Logging + Sentry configured and tested.
* [ ] Test DB flow for CI (testcontainers or compose).
* [ ] Migrations follow zero-downtime strategy for critical tables.
* [ ] Secrets stored in secret manager (no commits).
* [ ] Security review for Supabase RLS / service-role usage documented.



🧰 DevOps, CI/CD, & Engineering Governance Blueprint

This section ensures that every part of the development lifecycle — from testing and building to deploying and monitoring — follows consistent, automated, and auditable workflows.

⚙️ CI/CD Principles & Workflow Standards
1️⃣ Core CI/CD Stages
Stage	Purpose	Required Checks
Test	Run all automated tests and lint checks	ESLint, Prettier, Jest, Prisma validate
Build	Compile Next.js / backend services	npm run build must succeed without warnings
Migrate	Run DB schema migrations	prisma migrate deploy (never migrate dev)
Deploy	Deploy to staging → production	Zero-downtime deploy via container or cloud
Verify	Post-deploy checks (ping endpoints, DB, Storybook visual tests)	Health check + Storybook snapshot review

✅ Golden Rule: The pipeline should block merges if any stage fails.
CI/CD must enforce both lint and migration checks before deployment.

2️⃣ Recommended GitHub Actions / CI Setup
# .github/workflows/ci.yml
name: CI Pipeline
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run test

  migrate-deploy:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma migrate deploy


🧩 Optional: Add deploy.yml for staging/production using your host’s CLI (Vercel, Fly.io, Render, etc.).

3️⃣ Environment Strategy
Environment	Purpose	Database	Rules
Local	Developer sandbox	Docker Postgres	Can reset, seed, migrate dev
Staging	Pre-production testing	Supabase or Managed Postgres	Auto-deploy via CI on merge to develop
Production	Live system	Managed Postgres	Migrate only via CI/CD using migrate deploy
4️⃣ Backup, Logs & Monitoring

Database Backups:

Nightly full dumps + 7-day retention (Supabase provides PITR).

App Logs:

Centralized logging via services like Datadog, Logtail, or Sentry.

Metrics:

Track request latency, DB query performance, error rates.

Alerts:

Automated alerts for failed deploys, downtime, or high error rate.

🧩 Code Review & PR Governance Blueprint
1️⃣ Pull Request Standards

Every PR must include:

Requirement	Description
Title	Short and descriptive (feat: add billing dashboard)
Linked Issue	Reference issue number (e.g., Fixes #23)
Description	Purpose, summary of changes, and screenshots if UI-related
Checklist	Confirm tests passed, code formatted, no console logs
Storybook Proof	For UI changes, attach Storybook preview link/screenshots
Migration Proof	For DB changes, confirm prisma migrate deploy runs successfully
2️⃣ Review Process

Minimum 2 approvals before merging to main (for production apps)

Reviewer responsibilities:

Check architecture consistency (folder, naming, layout)

Ensure no hardcoded styles (must use tokens)

Validate API contract adherence (no breaking schema changes)

Confirm lint/test pass

Merges must be squash merges to keep commit history clean.

3️⃣ Branching Model (Recommended)
main          → Production (protected)
develop       → Staging (auto-deploy)
feature/*     → Feature branches
hotfix/*      → Urgent production fixes


✅ Only develop merges into main via approved PRs after staging validation.

🧾 Documentation, Versioning & Change Control Blueprint
1️⃣ Docs Directory

All project documentation should live inside /docs:

/docs
 ├─ constitution.md
 ├─ backend_blueprint.md
 ├─ ui_ux_blueprint.md
 ├─ api_reference.md
 ├─ changelog.md
 └─ onboarding.md


Each new feature or module must include a short markdown file under /docs.

Storybook serves as the visual source of truth for UI components.

2️⃣ Versioning & Release Tags

Use semantic versioning:

v1.0.0  → Initial stable release
v1.1.0  → Minor features added
v1.1.1  → Bug fixes / patches


Add release notes in CHANGELOG.md:

## [1.1.0] - 2025-10-29
### Added
- New billing dashboard UI
- Prisma zero-downtime migration system

3️⃣ Developer Onboarding

Each new developer must:

Read DOC/GUIDELINES & SOT/TECHNICAL DOCUMENTATIONS/constitution.md and follow system philosophy.

Clone project, run docker compose up -d, then npm run dev.

Generate Prisma client & run seed:

npx prisma generate && npm run prisma:seed


Access Storybook and run npm run storybook for component overview.

4️⃣ Continuous Documentation Health

Any new feature = new doc or section in /docs.

Docs reviewed in PRs (like code).

Weekly or sprint-end “doc sync” to align Constitution with new features.

5️⃣ Quality Gates Summary
Gate	Check	Enforced By
Code Quality	ESLint, Prettier, TypeScript	CI
Design Consistency	Storybook, Token usage	PR Review
Data Consistency	Prisma schema validation	CI
Test Coverage	Jest / Playwright	CI
Security	Secrets scan + RLS check	CI + manual audit
✅ Final Outcome

When you merge these Minor Blueprints with your UI/UX and Backend Blueprints, your constitution.md will represent a complete engineering constitution — a self-governing, production-ready system covering:

🎨 UI/UX Design System

🧭 Layout & Routing Standards

🧱 Backend Architecture

⚙️ CI/CD & DevOps Governance

🧩 Code Review, Documentation & Version Control














I have fount that the buttons has inconcistent classes. Audit on all the buttons used in the site. and make a list of classes used for buttons. Icons using same class that used for other components. its a messy and inconcistent use of classes in this site. Now I want to re-classify the messy classes and make it concistent and control everything centrally. As I am working on the design system and theming system so its very important to have a concistent class naming convention. So please audit all the button classes and make a list of all the classes used for buttons in the site. After that create a new class naming convention for buttons that is concistent and easy to understand. Finally update all the button classes in the site to reflect the new class naming convention. As we are worining on an existing site so we will only work on the messy parts and keep the existing concistent parts as it is. we will now go component by component and update all the classes accordingly. It is not only just about button or icon classes, its about all the classes used in the site. So please audit all the classes used in the site and make a list of all the classes used in the site. After that create a new class naming convention that is concistent and easy to understand. Finally update all the classes in the site to reflect the new class naming convention. As we are worining on an existing site so we will only work on the messy parts and keep the existing concistent parts as it is. we will now go component by component and update all the classes accordingly. we have been working on the UI design system and theming system for a while now. As part of this effort, we have identified that the current class naming convention used in the site is messy and inconcistent. This is causing confusion and making it difficult to maintain the codebase. To address this issue, we will conduct a thorough audit of all the classes used in the site. We will create a comprehensive list of all the classes used, along with their current usage and context. Based on this audit, we will develop a new class naming convention that is concistent, easy to understand, and aligns with best practices in UI design and development. Once the new naming convention is established, we will systematically update all the classes in the site to reflect the new convention. This process will be done component by component, ensuring that we only modify the messy parts while preserving any existing concistent parts. The goal is to create a clean, maintainable, and scalable class structure that supports our ongoing efforts in building a robust UI design system and theming system. For your better understanding please read all the existing tasks that were done in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\004-centralized-theme-color folder. Specially read the tasks.md file in that folder to understand what has been done so far. 

***instructions***
you have to create a comprehensive audit report of all the classes used in the site. Then create a new class naming convention that is concistent and easy to understand. Finally update all the classes in the site to reflect the new class naming convention. As we are worining on an existing site so we will only work on the messy parts and keep the existing concistent parts as it is. we will now go component by component and update all the classes accordingly. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. for the dev purpose always comment beside classes that used what colors and in which component it is used. This will help us in future to track the classes and colors used in the site. 





------------------------------------------------------

***migration & Redesign in neumorphic***
lets migrate the Blog page and blog post page  

***Instructions for migration***
You must follow the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for all the migration instructions. you must perform the Pre Audit before the task implimentation. Understand each and every classes , Hardcodings, Styles used in the componenet. The Audit Goal is to keep everything in your memeory so that the migration task can be performed completely, not partially. After the Audit. before migration started you must read this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\MIGRATION-PAIN-POINTS.md  file to learn from previous migration issues. so that you do not repeate the same mistakes. and after that read this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\DESIGN-SYSTEM-SOT.md file to understand the design system better. for better clarification and referrence read this file too D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\MIGRATION-QUICK-REFERENCE.md
 Make sure we are only migrating the UI , nothing else. No functionality changes, no logic changes, no data changes. just pure UI migration. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on.
 After that 

  ***task execution***
 you must  create a phase in the tasks.md file for this migration task. then start the migration task as per the instructions given in the tasks.md file and other supporting .md files.  Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. 

***Special notes*** There are rounting issues noticed in the installerr dashboard. the URl does not show correctly. so please make sure to fix that too while migrating the UI. e.g while navigating to lead feed page the URL should be /installer/lead-feed but currently it shows installer/dashboard . so please make sure to fix that too while migrating the UI.  Identify all such routing issues and fix them while migrating the UI.

------------------------------------------------

***Identify Pain points***
read above all the conversations and specially my commands and identify all the pain points that I have been facing whilte migrating/desiging UI. the goal is to identify all ongoing problems and pain points in order to enhance the workflow. 

***pick up the solutions point***
read above all the conversations and specially my commands and identify all the solutions that I have suggested whilte migrating/desiging UI. the goal is to identify all ongoing solutions in order to enhance the workflow. e.g wrong/hardcoded place holder used before, But now solved with using a specific class. So you need to pick that class in order to solve similar issues further without heistations

***Must follow Instructions***
You must audit the necessary relevant files/strutcures etc whatever needed to understand the pain points and solutions. then you must update the above mentioned files accordingly. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. Note that , these file are my on going SOT . So never relace anything entirely, always update specific areas, always check for outdated areas but let me know before updating it directly. 

***Files to update***
Your Findings should be updated in the existing workflow files : 
-D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\MIGRATION-PAIN-POINTS.md
-D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\DESIGN-SYSTEM-SOT.md
-D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\MIGRATION-QUICK-REFERENCE.md
- D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md


---------------------------------------------------

***The scenario***
Previously we have built a next.js auth system which is D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\nextjsAuth.md\AuditNextjsAuth.md . and also built the sites lead generation system with user based actions. The auth modals were bit different than now. It had more fileds to fillup and more steps. Now we have redesigned the auth modals to be more user friendly and less fileds to fillup. So now we need to update the existing auth system to reflect the new auth modals and flow. Please read the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\nextjsAuth.md\AuditNextjsAuth.md file carefully to understand the existing auth system. After that read the new auth modals design and flow carefully to understand the new auth system. After that create a mapping of old auth flow to new auth flow. Identify what needs to be changed in the existing auth system in order to reflect the new auth modals and flow. Finally update the existing auth system to reflect the new auth modals and flow. Make sure to keep everything aligned with the flows related to the auth such as lead generations , lead management etc.

not only that, we will completely build the auth system e.g the google/apple auth integration, forgot password flow, email verification flow everything from scratch as per the new auth modals and flow. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on.


I need a detailed plan from you before you start implimenting anything. The plan should include the steps you will take to update the existing auth system and build the new auth system from scratch. The plan should also include the timeline for each step. Make sure to cover everything in the plan. create the plan in this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\nextjsAuth.md folder. The plan should have 2 parts : one for updating the existing auth system and one for building the new auth system from scratch. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on , two the uncompeted auth system to build from scratch. 

first we need to make sure the users can signup/login using the email and password as per the new auth modals and flow. after that we will integrate the google/apple auth. then we will build the forgot password flow, email verification flow everything step by step. 

***UI/UX Blueprint: Layout & Routing Standards*** 
follow : D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\DESIGN-SYSTEM-SOT.md
D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\MIGRATION-QUICK-REFERENCE.md

***instructions***
check the audit report that mentioned above , but you can perform more audit if needed. then create a detailed plan as mentioned above. Make sure to plan meets Industry standards and best practices. do not overcomplicate things. keep it simple yet robust. 
***The goal*** is to have a complete, robust, user friendly auth system that reflects the new auth modals and flow. it should work end to end without any issues.

-------------------------------------------------------------------------

***homeowners lead modal***
lets now work on this part : ## 🟡 P1 - HIGH PRIORITY ISSUES (Should Fix Soon), 
### P1-01: No Lead Editing Capability,### P1-02: Lead Cancellation Not Connected , ### P1-04: No Lead Preview for Homeowners,### P1-05: Phone Number Not Synced Between User and Lead (check the details from this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM\05-ISSUES-AND-RECOMMENDATIONS.md file). 

***existing system audit*** I had these edit, draft etc modals before and worked , but after we have updated the lead submission process a bit , we need to check the current lead generation process and data inputs and outputs etc to see what needs to be changed in order to reflect the edit, draft , preview , cancel modals and flows. previously we hade some buttons on the lead card but now we do not have these. So we need to audit the existing lead generation process and data inputs and outputs etc to see what needs to be changed in order to reflect the edit, draft , preview , cancel modals and flows. these changes in the leads by the homeowners must reflect in the leads shown to admins for now. we havent worked on the installers side yet. but the changes must be reflected in the leads shown to admins for now. 


***Instructions*** you must audit deeply the current state and all the existing modals , flows, frontend , backend etc to get the clear picture and create a audit report and a plan to implimenet these changes. After that you must start implimenting the changes step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***Strickt rules*** never spoil any other functionality while working on these modals and flows. always test everything after making changes. 

-----------------------------------------------------------------------
***Admin Dashboard, homeowner Management***
as we have updated the auth under data inputs, I can see there are few issues in the homeowners management. 


***test result*** the test is passed , the first lead is now can be edited and also shows the update in the admin lead details. 

***new issues found***
 but I have found new issues now : - I have generated a second lead in the homeowners dashboard and while generated , I have changed the value of the Kwh field and created a new lead. but this new lead is not showing the correct kwh value in the leadedit , As each leads are unique, each leads should show their own data in the lead edit modal.

the homeowners can change/edit form fields or can select between commercial and residential quote requests. each leads should show their own data in the lead edit modal. the prefilled area also should import the exactly that specific leads data while editing. 

The generated leads should show the exactly same data in the admin side accordningly. 

***instructions***
you must audit all the related and relevant files including frontend and backend. create a comprhensive audit report of the issues found and the plan to fix them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***strict rules***
never spoil any other functionality while working on these modals and flows. always test everything after making changes. 

-------------------------------------------------------------------------

***new issues found***

- I have created a new homeowners account
- generated first lead
- verified contact
- generated 2nd and 3rd lead
- edited 3rd lead and chosed commercial quote request from the residential and filled up all the quote fields accordingly. and submitted the quote. 

# the first issue : editlead modal is not showing the commercial parts while opening editing option of the lead. it should work just same as the residential part is working while generating, eiditing leads. 

***additionally*** The lead modal in the homeowners dashboard should show the quote type Residential/commercial based on the users selection. Add icon and texts accordningly in the lead modal card in the homeowners dashboard.

***instruction*** 
Audit the related and relevant frontend and backend and identify the main cause and gaps/missing implimentations that were not fouced earlier. create a comprhensive audit report of the issues found and the plan to fix them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***strict rules*** Never spoil any other functionality while working on these modals and flows. always test everything after making changes. 

--------------------------------------------------------------------------

***Admin dashboard lead details issues***
now I can see in the lead details modal is only showing the name,contct,address in the first lead only, but not showing in the 2nd and 3rd lead details modal. it should show the name,contact,address in all the leads details modal accordningly. all these user information should be always updated in real time whenever user update their profile information. 

***instructions***
you must audit all the related and relevant files including frontend and backend. create a comprhensive audit report of the issues found and the plan to fix them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***strict rules***
never spoil any other functionality while working on these modals and flows. always test everything after making changes. do to attempt blindly if you dont have clear picture. 
------------------------------------------------------------------------------

***http://localhost:3000/admin/homeowners***
In the admin dashboard , homeowners management page imports needs to be updated as per the new auth system. currently its using old auth system imports. so please update the imports accordingly. The existing rows should import the data correctly accordning to the new auth system. Now this is importing partially ,e.g Homeowners name is not showing but the email is showing. so please fix all these issues accordingly.

***what I need to import additionally*** to add row and import : Quote type (residential/commercial), Address , IP address, 

***note*** the data can be collected based on users activity. e.g when a user signup , we can collect their IP address and signup data, when a user generate first lead we can collect their address, contact,name, postcode etc. you must understand how we can collect these data based on users activity and then import them accordingly in the admin dashboard homeowners management page. 

***instructions*** Audit and understand the current imports and data flow. create a comprhensive audit report of the issues found and identify the gaps between the existing partial imports and also for the additional imports that are requested to add and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***strict rules*** never spoil any other functionality while working on these modals and flows. always test everything after making changes. do to attempt blindly if you dont have clear picture.

-------------------------------------------------------------------------

***Homeowners Lead generation from the homepage*** there are multiple flow for the homeowners to generate leads. and I found one issue with the one flow. The flows are not built actually.

***When a user is signed up but not generaated any lead yet and wants to genearate first lead*** user try to generate lead from the homepage instantQuote form. now the current flow : InstantQuote calcualor > showing results> quote option modal > and not continuing to the next flows. 
the next flow should be : InstantQuote calcualor > showing results> quote option modal > detailed information modal > lead succssful modal (and the lead should be generated). 

***second lead generation from the homepage InstantQuote form*** when a user is signed up and already generated one lead and then the user try to generate 2nd lead from the homepage instantQuote form. now the current flow : InstantQuote calcualor > showing results> get detailed quotes from installers > contact verification modal > after the contact verified > QuoteType Distribution modal > generate leads as per the users selection. 

***second+ lead generation from the homepage InstantQuote form***
when the user has quote generation limits , the flow should be : InstantQuote calcualor > showing results> get detailed quotes from installers > QuoteType Distribution modal > generate leads as per the users selection. 

***when the limit reached*** when the user has reached the lead generation limits , the flow should be : InstantQuote calcualor > showing results> get detailed quotes from installers > Lead limit reached modal(create a new modal for this). this is the end point for now.

***instructions*** Audit and understand the current flows and data flow. create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***notes** the dashboard flows are working fine, do not tocuh or harm them anyways. undersatand the lead generation principals including data inputs and data imports. 

***strict rules*** never spoil any other flows and functionality while working on these modals and flows. All the existing lead generation flows should work as it is working now. only work on the new area that mentioned. always test everything after making changes. do to attempt blindly if you dont have clear picture. 

----------------------------------------------------------------------------------------

***Homeowners Lead generation from the homepage- test*** i have tested the flows that you have implimented. I have found issues with the very first flow , it is not working as expected and also not as per your audit and plan.

***instructions*** you must re-audit the flow and identify the gaps between the existing flow and the requested flow. create a comprhensive audit report of the issues found and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. 
Compare with the previous audit report(D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM\10-HOMEPAGE-LEAD-GENERATION-FLOWS-AUDIT.md) that you have created for this flow and identify what went wrong and why the implimentation is not as per the plan. 
And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created. 

***strict rules*** never spoil any other flows and functionality while working on these modals and flows. All the existing lead generation flows should work as it is working now. only work on the new area that mentioned. always test everything after making changes. do to attempt blindly if you dont have clear picture.

----------------------------------------------------------------------

***test- flow 2*** instantquote> results> quoteoption modal> Quote Request Limit Reached (which is the wrong modal), and it is not generating the leads.

check back the plan, what it was suppose to be . this is a completely wrong implimenetation. 

-----------------------------------------------------------------------------------

***test- flow issue highlight*** instantquote> results> contact verification modal> after verfication (which is showing up even the contact is verified already) in stated it should show the lead distribution modal here. this is the most focus area to fix. Your fix did not work as expected. so I am just repeating the same prompt that given earlier. please read carefully and fix the issue accordingly. 

***When a user is signed up and has 0 leads and trying to generate first lead from the homepage InstantQuote form***
Now when the user has 0 lead and user already signedup, then show the first lead generation flow , which is working fine now. when the user has 1st lead already and try to generate 2nd lead, then show the 2nd lead generation flow which is also working fine now (the verification requred is also working fine).

***The areas to work on : for 3rd , 4th and 5th lead generation flows :***
- when the user has 2 or more than 2 leads already and try to generate more leads, then the flow should be the: instantquote> results> lead distribution modal> generate leads as per the users selection. and this flow repeates until the user reach the lead generation limit which is 5 leads in total. 
- when the user has reached the lead generation limit which is 5 leads in total, then the flow should be instantquote> results> lead limit reached modal ,this is the end point for lead generation now.

***current issues*** now the verification modal is showing even the user has 2 or more leads already. this is wrong. please fix this issue. because users need the contact verification only once while generating the 2nd lead. after that no need to verify again and again. 

***plan***you can create conditions based on the leads count of the user. identify the leads count of the user and then create conditions based on that to show the correct flow accordingly. 

***instructions*** Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***note*** currently the first lead and second lead generation flows are working fine, do not touch or harm them anyways. undersatand the lead generation principals including data inputs and data imports. understand all the logics and condition. read above all the conversation again and again to find any better approach

***strict rules*** never spoil any other flows and functionality while working on these modals and flows. All the existing lead generation flows should work as it is working now. only work on the new area that mentioned. always test everything after making changes. do to attempt blindly if you dont have clear picture. 

- never edit any auth modal to fix this issue. only work on the lead generation flows and modals. Do not repeate the same mistake you did above while fixing the flow issues.
-----------------------------------------------------------------------------------


***Bidding lead Generation issue*** Main focus should be on the bidding lead generation from the QuoteDistributionModal only.


***QuoteDistributionModal issue*** There are few issues with it :

1. while generating bidding leads from the QuoteDistributionModal , after selecting the bidding quote type and clicking on the generate lead button, it is not generating the bidding lead, but it is counting the lead. 
2. The homepage leadgeneration flow is not generating bidding leads from the QuoteDistributionModal. but the dashboard leadgeneration flow is generating bidding leads from the QuoteDistributionModal. You can just follow the dashboard QuoteDistributionModal logic/condition/flow to fix the homepage QuoteDistributionModal flow for bidding leads.
3. As the quotedistributionmodal is used in multiple places now, so make sure to keep everything aligned and working fine in all the places after fixing the bidding lead generation issue.

***instructions*** Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\LEAD-GENERATION-SYSTEM. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***strict rules*** never spoil any other flows and functionality while working on these modals and flows. All the existing lead generation flows should work as it is working now. only work on the new area that mentioned. always test everything after making changes. do to attempt blindly if you dont have clear picture. Do not commit or push until I ask. focus on the main issues.

--------------------------------------------------------------------------

lets work on the src/components/homeowner/FirstQuoteSuccessModal.tsx

 modal to enhance the migration of UI. make sure to use the semantic approach. read the global css and use only semantic classes for icon,texts,buttons,main card, background card, nuemorphic classes etc.  check the main file and implimnet as per needed. 

***strict rules*** no hardcoded ui , no inline styles, only semantic classes from the global css. always test everything after making changes. do to attempt blindly if you dont have clear picture. never touch any backend or UX even. only work with the UI

-------------------------------------------------------------------------------

***INSTALLERS***


As we are just started with the installers part, so we have plenty options to re-organize everything regarding installers. Now lets implimenet the fix as per your recommendation for the homepage issues .

***strict rules*** never spoli homeowners. Admin parts while working on the installers part. be careful while implimenting , your implimentation should not create issues for other functionality of the site. forget about the commit or push , I will let you know when to do it. focus on the main task first. 

_______________________________________________________________________________

***UI/UX Blueprint: Layout & Routing Standards***
I need to create a blueprint for the UI/UX layout and routing standards for the next all the build part of the site. This blueprint will serve as a guide for designing and developing the UI components and routing structure for the installers section. The blueprint should include the following sections: 

1. Layout Standards:
- Define the overall layout structure for the installers section, including header, footer, sidebar, and main content area.
- Specify the grid system and spacing guidelines to ensure consistency across different pages and components.
- Outline the responsive design principles to ensure the UI adapts well to different screen sizes and devices. 
2. Routing Standards:
- Define the routing structure for the installers section, including URL patterns and naming conventions for different pages.
- Specify the use of dynamic routing for pages that require parameters, such as installer profiles or lead details.
- Outline the best practices for handling navigation and routing within the installers section, including the use of client-side routing and server-side rendering where appropriate.
- Include guidelines for error handling and redirection for invalid routes or unauthorized access.
3. Component Standards:
- Define the standards for creating reusable UI components, including naming conventions, file structure, and documentation
- Specify the use of semantic HTML elements and accessibility best practices for all components.
- Outline the guidelines for styling components, including the use of CSS modules, global styles, and theming.
4. Testing and Validation: 
- Define the testing standards for UI components and routing, including unit tests, integration tests, and end-to-end tests.
- Specify the use of testing frameworks and tools to ensure the quality and reliability of the UI/UX implementation.
The blueprint should be documented in a clear and concise manner, with examples and illustrations where necessary. It should be easily accessible to all team members involved in the design and development of the installers section. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on.

***instructions***
You must audit the existing UI/UX design and routing structure of the site to gather insights and best practices. then create the blueprint as per the above mentioned sections. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the blueprint document under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines. understand the design patterns used in the existing site and incorporate them into the blueprint to ensure consistency. e.g understand the common button class used, common card class used etc.only create new class if the new modal/componenet needs a design which is not in the existing system. Must have a class guide, so that Ai can easily understand and use these guides while building new components. 

***strict rules*** while building new components never use hardcoded ui , no inline styles, only semantic classes from the global css. always test everything after making changes. do to attempt blindly if you dont have clear picture. never touch any backend or UX even. only work with the UI when you are build the UI. only semantic approach is allowed. 

***Goal*** The main goal of this blueprint/Design system is to ensure a consistent and user-friendly experience for all kind of UI development while maintaining alignment with the overall theming system of the site. So prepare that blueprint as per the Instructions above and also make sure that we can achieve the goal. you can enhance the blueprint as per your understanding to achieve the goal. it is not only about the installers part, it is for all the next builds of the site. so keep in mind that. 

-----------------------------------------------------------------------------
***Installer Verification form*** the installers should fill up this form and submit to the admin , so the admin can verify and approve the instalers as a Verified installers. The required fields are : 

- Mandatory fileds
Company name , Representation name, Designation, Contact number , Email Address, Post code/multiple post codes if serving in multiple areas, ABN/licence number, company established year, employee count, types of services offered (solar installation, maintenance, inspection etc), service areas (suburbs, cities, regions etc), 

- Optional Fields: website address, social media links , brief company description (about us), upload licence document, upload ABN document, upload company logo, 

***Installer Profile Page***

I want you to create a installer Profile page in the Installers dashboard. This page will allow installers to view and edit their profile information, including personal details, contact information, company details, and any other relevant information. The profile page should be designed to be user-friendly and easy to navigate, with clear sections for different types of information. The profile page should include the following features: 
1. View Profile Information:
- Display the installer's profile information in a clear and organized manner.
- Include sections for personal details (name, contact information), company details (company name, address, license number), and any other relevant information.
- Provide an option to upload a profile picture or company logo.
2. Edit Profile Information:
- Include an "Edit Profile" button that allows installers to update their profile information.
- Implement form validation to ensure that all required fields are filled out correctly.
- Provide a "Save Changes" button to submit the updated information.
- Include a "Cancel" button to discard any changes and return to the view mode.
3. Change Password:
- Include an option for installers to change their account password.
- Implement form validation to ensure that the new password meets security requirements.
- Provide a "Save Password" button to submit the new password.
4. Notifications and Preferences:
- Include a section for installers to manage their notification preferences (e.g., email notifications for new leads, updates, etc.).
- Provide options to enable or disable specific types of notifications.
5. Responsive Design:
- Ensure that the profile page is responsive and works well on different screen sizes and devices.
6. Contact Verification:
- Include a contact verification process to ensure the accuracy of the installer's contact information.
7. Email Verification: 
- Implement an email verification process to confirm the installer's email address.

 


---------------------------------------------------------------------------

***Visual test result*** I have tested the ui you built . found some mismatch between installers verification modal and Admin installers verification view modal. The installers verification modals shoud be updated as per the admin installers verification view modal design.

***Installers Profile page overview and issues found*** The profile page should have all the fields that has in the verfication modal , becuase the installers should be able to edit/update those fields later after submitting the verification form. but I can see the profile page has very limited fields and options to edit. as there are a lot of optional field in the installers verification modal and they must have options to fillup/upload them later from the profile. 

***Modification & upgradation***
- There is no change password option in the profile page. please add that section as well. 
- There should a bar on the top of the page showing a switch that can Pause/Activate the installer profile. when the profile is paused , the installer will not receive any new leads,The admin will be notified too in the installers page. it should show active,inactive,pause status in the Installers page in the admin dashbaord. This option is for the installers when they are on holiday or need a temporary pause. 


***instructions***
 as we have modified our UI , so you have to update the backend plan accordingly. Audit the current implimentations first, understand what you built vs what else need to update. before that commit all the changes, so that we can rollback anytime to this current state.
 - After the audit findings update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file with the new plan to fix and impliment the changes needed. after that start fixing the issues step by step. Make sure to keep everything aligned. 
- you must update this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\profile&verification_implimenetation.md. As we have picked issues,updated plan, modified ui , we must need to be aligned with the backend plans accordingly. so the frontend changes stays aligned with the backend too. 

***strict rules*** while building new components never use hardcoded ui , no inline styles, only semantic classes from the global css. always test everything after making changes. do to attempt blindly if you dont have clear picture. never touch any backend or UX even. only work with the UI when you are build the UI. only semantic approach is allowed. never do partial/incomplete work. always complete the full task as per the plan. 

--------------------------------------------------------------------------

***backend test*** After I submitted the verification from by clickin on "submit application" , I see there is no action or nothing happened. Therefore the admin part also remained unchanged. 

***Insturctions***
please check the backend connection and impliment the backend logic to store the data in the database accordingly. Do a audit to undertand the situation and the frontend and backend connection gaps/missing implimentations. create a comprhensive audit report of the issues found and the plan to fix them. after that start fixing the issues step by step.  create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

------------------------------------------------------------------------------

***Installers Verification Modal test result and issues***

After testing the installers verification modal I have found multiple issues - 

1) The verification modal fileds mismatch with the installers profile details. 
   - Personal Detailes section : fetching email from the Installer Authentication while signed up. but It is not fetching phone number from the verification details.

There are more issues to identify actually. so please do a deep audit of the installers verification modal, installers profile page and the admin installers verification view modal to identify all the gaps/mismatches/missing implimentations. must audit the frontend vs backend, because the mismatches are there. create a comprhensive audit report of the issues found and the plan to fix them. after that start fixing the issues step by step.  create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.


***what it should be *** All the inputs should be fetched from the same source/model. so that there is no mismatch between different views/modals. update the profile page fields as per the verification modal fields. and update the admin view modal fields as per the verification modal fields. so that everything stays aligned and consistent. 

---------------------------------------------------------------------------

***Installers Verification Modal test result and issues - 2nd part*** 
Now the contact verification modal is not showing the prefilled number when the user profile is unverified, but it is showing when the profile is verified by the admin. 

- additionally : I require installers to verify their contact number immidiately after they submit the verification form. The contact modal should pop up immidiately with the prefilled contact number immidiately after the profile verification is submitted. 

note : everything is working fine here, just need a some enhancement . do not overcomplicate it. 

***Admin Installers verification review modal test*** This modal is need to be enhanced a bit, because I see there are some fileds are not fetching data and showing blank. Just remove these blank fields from the modal to make it clean. only show the fields which has data. 

***verfication modal issue*** in the Postcodes served filed , the user cant enter multiple postcode by using comma "," . please fix this issue. it should allow multiple postcode entry using comma ",". 

***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***Mandatory before doing anything next*** commit all the changes to your local repository:

    git add .
    git commit -m "Your commit message"
Push the changes to the remote repository:
    git push origin your-branch-name: Installers_Second

    ***instruction***
    each time you make commits, you must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Prompts\gitstatus.md file with the latest commit information to keep track of changes effectively. with the commit id ,timestamp, and a brief description of the changes made in that commit.make sure the push has the excatly current versions, so that it can be restored if needed. 

    -----------------------------------------------------------------------------

  ***verfication modal issue*** in the Postcodes served filed , the user cant enter multiple postcode by using comma "," . please fix this issue. it should allow multiple postcode entry using comma ",". 

- this is not fixed yet . it is still not allowing to type comma in the placeholder . so the users now only can type only one postcode, not multiple postcodes. Users should be able to type multiple postcodes separated by comma ",". 

***Installer profile edit issues*** there are now 2 button for edit the profile. But I want to keep the only top "edit profile" button . and after clicked the user should be able to edit everything in the profile page. currently only few fields are editable. and the "Save changes" & "cancel" button should be at the bottom. 
*** I have noticed there are fields restricted to edit : there should be no restriction to edit any field in the profile page. all the fields should be editable after clicking the "edit profile" button except the "Email" field. There should be one condition if the user edit the contact number then they must do the contact verification again with OTP. All the edits and updates should reflect the Admin Installer review modal. 

***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

----------------------------------------------------------------
***test results and issues *** 
- OTP verification issues : whilte editing the contact number. After input the OTP it is showing failed to save changes. 
- I have tried to edit other fields and save changes, but in real nothing is updated as per the change I made even it shows "profile updated successfully" message. please fix these issues accordingly.

- Company Details area can be edited and saved , but showing "Failed to Save Changes
Validation failed" . 

-Personal Details area , name cant be edited, I do not need the name to be uneditable. it should be editable.

***duplicate fileds issues*** you need to enhance the UI of the profile page. There are duplicate fields in the profile page which is not needed. please remove the duplicate fields and keep only one field for each data point. e.g there are 2 fields for "Contact Number" , 2 fields for "Email Address" etc. please remove the duplicate fields and keep only one field for each data point. but make sure to keep those which is functional. e.g the Contact number field which is connected with the OTP verification should be kept. E.g There is only 1 option to input user name which is the representative name , but there is a name field in personal details which is fetching the same name. so just keep the Representative name filed. 


***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

---------------------------------------------------------------------------

***phone number edit issue*** now edited the contact number>clicked on save all changes> OTP verfication modal > entered OTP > and now here is the issue : it is not updated the number and showing Failed to save chnages.  
- this almost worked just failed to update the number. 

***all other fileds*** all other fields are failing to update with the error says "Validation falied"

***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

---------------------------------------------------------------------------
***there are a lot of issue to solve***
- the "edit profile" button will only show when user submitted the verification form. becuase before that, there is no data to edit . 
- when the user has submitted the verification form , after that no need to show "Complete Verification to Access Full Features
Submit your business details and documents for admin review to unlock lead purchasing and bidding." message. because the user already submitted the verification form. so just show the "edit profile" button only.
- in the verification form in the postodes served filed , it is not allowing to enter multiple postcodes by inserting comma . it should allow to input comma and let users add multiple post codes
- still failing to edit and update the profile. 

***instructions*** Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

------------------------------------------------------------------------------------

***Installer Profile Edit Issues***

- the ""Services & Coverage" section is not editable in the profile page. please make it editable. as these fileds are checkbox, so while opt ing the checkboxes the previous selected options should stay selected. e.g if user selected "Sydney" and "Melbourne" while submitting the verification form, then while editing the profile page these 2 options should stay selected. and user can select/deselect any option as per their choice.
- while editing the profile page, in the Postcodes served filed , it is not allowing to enter multiple postcodes by inserting comma . it should allow to input comma and let users add multiple post codes. even while editing profile there is no option to input comma. please fix this issue.
- the "Documents & Logo" area also should be updated able. users can upload new documents/logo while editing the profile page. please make it editable. 

***Pain points*** I have been repeating some of these issues again and again. And you are not fixing them effectively. please focus on the main issues and fix them completely.

***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested task and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

-----------------------------------------------------------------------------

***Installer profile vrificatiom modal issues to fix***
- in the Postcodes served filed , the user cant enter multiple postcode by using comma "," . please fix this issue. it should allow multiple postcode entry using comma ",".

***Installer Profile Edit Issues to fix***
- while editing the profile page, in the Postcodes served filed , it is not allowing to enter multiple postcodes by inserting comma . it should allow to input comma and let users add multiple post codes. even while editing profile there is no option to input comma. please fix this issue.

***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend including files, prisma,API,DB etc and create a comprhensive audit report of the issues found and identify the issues and root cause and then plan to fix and impliment them. after that start fixing the issues step by step. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

-----------------------------------------------------------------------------

***Missing Filed in the installers verification form, profile page and admin review modal*** I forgot this "Address" input to get from the installers side , and also you need to update the fronend and backend in order to add this address field and fetch the data in the admin installers page table as well. so please add this "Address" field in the installers verification form, profile page and admin review modal. and make sure to fetch the data in the admin installers page table as well.
- add this address filed after the contact number field in the verification form and profile page, admin installer details modal. 
***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you
-----------------------------------------------------------------------------
***Admin/Installers page frontend and backend Enhancement*** 
I want to enhance the Admin/Installers page a bit both frontend and backend to make it more functional and user friendly. Here are the changes needed :

- now in the Installers table , the Compnay name and the person name is not fetching the data in right way . so, If the installers update/edit profile it does not show the updated compnay name. in this table the data should be fetched from the Installers Profile table for the name,postcode, email, address, contact, .
- one issues seems: the compnay name and person name only showns in the table after admin approves the installers application. this should not need admin approval to show on the installes table, it can be shown immidiately when the installer submits their application. 
- Identify the inconcistency of data fetching. just do not tocuh the email fetching because it is fetching from the authentication table which is correct. just focus on the other fields.


***instructions***  Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the issues found and identify the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the issues step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you

----------------------------------------------------------------------------

***installer profile Password Management***
We have built the frontned already. so now need to build the backand and its functionalities to change user passwords. 

***instrcutions*** Audit and understand the current flows and data flow. audit the relevant fronend and backend in deailed and create a comprhensive audit report of the plan. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

--------------------------------------------------------------------------------

***Admin Lead details modal enhancement***
I want to enhance the Admin Lead details modal a bit both frontend and backend to make it more functional and user friendly. Here are the changes needed :

- The current frontend modal needs to be enhanced : I want the "Actions,Lead pricing, Admin Notes, Lead lifecycle" UI sections to be under 1 section. Means , all the functions should work as it is as now working, but the UI should be enhanced to make it more user friendly. 
- One more section needed to add in this modal to show the "Installer's comapny name, postcodes" . The Goal is to send the leads to the selected installers based on their service areas(postcodes). so the admin should be able to see the installer's company name and postcodes in this modal while assigning the lead. The Admin should be able to select single/multiple installers from this modal while assigning the lead. 
- Based on the homeowners postcodes, there should be a filter option to show only those installers who are serving in that postcode area. so that the admin can easily assign the lead to the relevant installers.
- while assigning the lead to multiple installers, there should be an option to add individual admin notes for each installer. so that the admin can add different notes for different installers while assigning the lead.
- There should be options to always edit the lead release modal, so that the admin can change the lead pricing and can add or remove the Installers even after the lead is assigned. 
- The Admin should be able to filter the verified and unferified Installers. 

***The Goal*** The main goal of these enhancements is to make the lead assignment process more efficient and user-friendly for the admin, while also ensuring that the relevant information about installers is easily accessible. And this new lead Approval flow should be within one single modal so that the admin can Select lead pricing, add admin notes, view lead lifecycle, and assign to multiple installers all in one place without navigating away or opening multiple modals and simply can approve the lead assignment after filling all these details in one go.


***instructions***  Audit and understand the current UI . audit the relevant fronend and backend in deailed and create a comprhensive audit report of the current state and the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the requirement step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

***Strict Rules*** now we are just working with the UI only, do not messup with the backend. keep the backend functionality as it is while enhancing the UI. Follow the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelineswhile building the new UI. never use hardcoded ui , no inline styles, only semantic classes from the global css. always test everything after making changes. do to attempt blindly if you dont have clear picture. only work with the UI when you are build the UI. only semantic approach is allowed.
----------------------------------------------------------------------------------

***Lead managemetent modal enhancement***
- The countdown timer : just keep the place holder , do not need the opt in out option for the countdown timer. Admin will just inputs the number. 
- Installer Assignment section : i do not need the exclusive and competitive parts. re-build this modal as per the plan shared before. in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification\ADMIN-LEAD-DETAILS-MODAL-AUDIT.md
- You did not maintin the semantic classes properly, I can see different buttons there. must follow the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines while building the new UI and also enhance the current ui that you built. 

***instructions***  Audit and understand the current UI . audit the relevant fronend and backend in deailed and create a comprhensive audit report of the current state and the gaps between the existing flows and the requested flows and the plan to fix and impliment them. after that start fixing the requirement step by step. Make sure to keep everything aligned with the constitution.md file and the overall theming system that we are working on. create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Profile & verification. And create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md file for this task and start implimenting the changes step by step as per the plan you created.

--------------------------------------------------------------------------------

Audit the frontent and backend and understand the scenario. then fix it accordingly.

-----------------------------------------

Your task is to Audit the frontend and backend and understand the current functioality of the following components and their data flow: 

- Admin Lead management modal
- Installers Leadfeed and its lead modals. currently there is only UI there with mock data. 

***The Goal*** Now the admin can select and assign leads to the installers,but the installers side needs to work. Installers should receive the leads accordingly. replace the mock data with the real data from the database. 

***instructions***  Identify the gaps between the UI and the backend to make the Installers side works accordingly. 

--------------------------------------------------------------
***call/visit leads***
each type of lead has different lifecycle and endpoint. the call/visit lead should unlock the fileds that are locked after payment is done by the Installers. 

- now the residential area is not fetching the lead data correctly. please fix this issue.
- The contact detailes shoud be unlocked after payment made. 

***Written Quote Leads***
- now it is just behaving same as the call/visit leads. which should not do the same actions, and each type lead actions are different as all the leads are alo unique. so taking actions in one lead should not reflect anyother leads. 
***Bidding Leads***
- currently the installers lead feed is not showing any Bidding lead after assigning bidding lead from the admin lead managemenet system. 


***Important*** As each leads are unique , so each lead should have its own unique journey and end points. 

***instrcutions*** Audit and understand the frontend and backend deeply, make sure you have the clear picture. After that create a audit report in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Leadfeed  folder  and create implimenetation plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\006-component-by-component\tasks.md . after that start implimenting accordingly. 

------------------------------------------------------------------------

Perform a comprehensive audit on the Lead System including both frontend and backend components including modals, Api, prisma, DB schema etc that actually cover everything to track down. The audit should cover the following areas:

- Homeowners Lead flow
- Admin Lead flow
- Installers Lead flow

you must get all the pin points accurate data information. what is actually happeing right now including mentioning the user flows accordingly.also mention the file paths , structures, connections etc deeply. the goal is to understand the current scenario of the lead System end to end. based on this we will plan the next plan. 

create the audit report under this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Leadfeed. 
--------------------------------------------------------------------------

lets build the ## 3. Installer User Stories (Per Lead Type)
### CALL_VISIT . 
- US-CV-01: As a verified installer, I view a CALL_VISIT lead card showing summary + masked contact.
- US-CV-02: I click "Purchase" and, if successful, the card updates with full contact details and a purchased badge. And it should in the purchase lead page as well. that page and necessary modals need to create.
- as the call/visit lead will be shown to multiple installers, so once any installer purchased the lead will be shown as purchased by Anohter installer status, and unable to purchase that lead. 
- US-CV-03: Other CALL_VISIT leads purchased by me remain accessible with contact; purchased by others show a disabled state.
- 

-------------------------------------------------------------------

***what I picked from your idea***

2. Purchase Experience

Add a confirmation modal before purchase (“Are you sure? This action cannot be undone.”).
Show price and terms clearly in the modal.
After purchase, show a success toast/notification and auto-scroll to the purchased lead in the feed.
3. Post-Purchase Handling

Purchased leads should move to a “My Purchased Leads” tab or section for easy access.
Optionally, allow installers to add private notes to purchased leads (for their own tracking, not messaging).
If a lead is purchased by another installer, show a “Purchased by another installer” badge and disable the purchase button.
4. Status Sync

Ensure real-time or near-real-time status update across all roles (installer, admin, homeowner) to avoid double-purchase or stale UI.
Consider using optimistic UI updates (show as purchased immediately, then confirm with backend).
5. Audit & Security

Log all purchase attempts and status changes for audit trail.
Prevent race conditions: backend must atomically check and update lead status on purchase.
6. Edge Cases

If an installer tries to purchase a lead that was just bought by someone else, show a clear error (“Sorry, this lead was just purchased by another installer.”).
If a lead is cancelled or archived by admin/homeowner after purchase, show a “No longer available” state in the installer’s feed.
7. UI/UX

Use clear visual cues: purchased (by me), purchased (by another), available, expired.
Consider a tooltip or info icon explaining what “CALL_VISIT” means for new installers.
8. Analytics

Track conversion rates: how many installers view vs purchase.
Optionally, show “Recently purchased” highlight activity.

***instructions***  now merge my idea and your idea and create a Call/visit lead plan .md file under the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Leadfeed folder. I just need the plan only. keep it precised so that we can develop accordingly. 

-------------------------------------------------------------------

***call/visit lead curent scenario***  Now the admin can assing to installers > installers lead feed shows the assigned lead>after purchase it is not showing up the full contact details > and nothing further

***what it should be***
###installers Flow : 
 after purchase it should show the full contact details  > the lead should move to the purchased lead page (need to create 3 tabs within this page: call/visit, Written Quotes, Bidding) and just show the installers lead modals there which is unlocked already> other installers should see the lead as purchased by another installer and unable to purchase that lead > only the installer who purchased the lead should see the full contact details > other call/visit leads purchased by installers should remain accessible with contact; purchased by others show a disabled state >  there should be a confirmation modal before purchase (“Are you sure? This action cannot be undone.”) > show price and terms clearly in the modal > after purchase, show a success toast/notification and auto-redirect to the purchased lead page  > log all purchase attempts and status changes for audit trail > 

 ###Admin flow : 
 The admin lead management modal should show the lead assignment status accordingly > there should be a section to show which installer purchased the lead > the admin should be able to reassign the lead to other installers if needed > if a lead is cancelled or archived by admin/homeowner after purchase, show a “No longer available” state in the installer’s feed.

 ###homeowners flow : 
 The homeowners will get notified instantly, also their lead statu will be changed to *responded by a Installer* > they should get a message saying "An Installer has responded to your request, Installer will contact you soon" > after installer purchase the lead, the leads cant be edited, updated, cancelled. All the homeowners actions will be locked> end of call/visit lead flow. 

----------------------------------------------------------------------

There are few things to update accordingly in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Leadfeed\CALL-VISIT-IMPLEMENTATION-PLAN.md :

 -As i do not have the strip API now , so you need to make the flow works with minimal changes, so when I have the real API it can work immidiately or with few edits. 
 - I want you to Installers flow first, then Admin and then the Homeowners accordingly. So that i can test each users flow and move forward.
 - You should have some rules for testing and moving forward , if the test failed then stop an fix and then only move. becauase my experience with AI coding is not so good so far. after a long implimentation I always get surprised with the built and later it is annoying to fix unfinished tasks, also it is wasting time. so please make sure to have some rules for testing and moving forward.
 - while building the flow make sure to keep everything aligned with the implimenetation plan
 - refer this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines while building any new UI. so that you can stay concistent. 

 ***instructions*** update the implimenetation plan as per explained above. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\007-call-visit-lead\tasks.md based on the implimentation Plan. make sure the tasks has testing instructions after implimentations and also follow the mandatory rules. 

----------------------------------------------------------------------
there are issues seems : 

### installers feed
- after purchase it is still showing email locked, it should be unlocked. also there should be a button added immidiately after the purchase "View Details" > when the installers click on the view details they will see the installers lead details (the data generated in the lead details modal) in a new modal. 

### Purchased leads 
- create tabs in the purchased leads page : Call/Visit, Written Quotes, Bidding . and the purchased leads should be shown in their respective tabs. e.g if the lead is call/visit then it should be shown in the call/visit tab only.
- You use the same UI modal for the leads that are showing up on the purchased leads. 
- we will use just one design which is the SOT now : the lead feed lead card. 
- so replace the existing design accordingly. 
***Homeowners Lead card update***
- check the scressnshot shared , instead of "purchased" you should write "Responded by an Installer"

***Instructions***
Audit the frontend and backend and understand the current scenarion, comeup with the implimenetation plan based on the required tasks mentioed and the audit findings. after that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\007-call-visit-lead\tasks.md file and start implimenting the changes step by step as per the plan you created.

------------------------------------------------------------------------

 

--------------------------------------------------------------------------------

***admin lead assignment issues***

### first issue:
- After opening the new lead generated by homeowners , the admin lead details modal is showing Actions section with 2 buttons : approve lead and reject lead . But I do not need it any more and also its functionality. so please remove this section completely from the modal.
  > what I want : It should not show any approve/reject lead button in the admin lead management modal. just keep the Manage lead button only. so that the admin can assign the lead to installers directly without any approval process.
### second issue:
- After clicling on Manage lead button> Lead management modal is opening > after selecting the Installers, fixing approval pricing , countdown days , Lifecycle > clicked on approve > its shows a message "lead approved with 6 days countdown" > But in reality there is no leads are showing up in the assigned installers side.> and also there is nothing updated in the lead managemenet modal.> means the first attempt is failed without taking any real impact . 

- in the second attempt > I again clicked on the Manage lead button> Lead management modal is opening > after selecting the Installers, fixing approval pricing , countdown days , Lifecycle > clicked on save changes > its shows a message "lead assigned successfully" > And now the leads are showing up in the assigned installers lead feed. 


### third issue:
- There is an issue with the countdown settings, it is not working properly. e.g I set the countdown to 3 days while assigning the lead to installers > but it is counting down for 6 days by default. 

> what I want for the second and third issue : There should be no double attempt for assigining lead. the mandatory assiging flow :

Click on Manage lead button> Lead management modal is opening > after selecting the Installers, fixing approval pricing , countdown days , Lifecycle > clicked on approve/assign button > it should show a message "lead assigned successfully" > And the leads should show up in the assigned installers lead feed. The countdown should work as per the days set by the admin while assigning the lead. 

***instructions*** Audit the frontend and backend and understand the current scenarion, comeup with the implimenetation plan based on the required tasks mentioed and the audit findings. after that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\007-call-visit-lead\tasks.md file and start implimenting the changes step by step as per the plan you created.


------------------------------------------------------------------


***homeowners Lead card text update*** 
- Just replace all the "Purchased" test to "Responded by Installer" . 
- update the UI counter , follow the Installer Lead card countdown timer design. I want that counter in this Homeowners lead card.

***Homeowners lead preview modal update***
- Just replace all the "Purchased" test to "Responded by Installer" .
- There shoulld be no countdown timer after responded by the installer. 
- The UI neeeds enhancement : some part of the modal is not visible due to the z-indexing I think. the header is overlapping and the left side icons outside looks weird. check the screenshot. and do the necessary works to enhance the ui visibility and standards. 

***instructions*** Audit the frontend and backend and understand the current scenarion, comeup with the implimenetation plan based on the required tasks mentioed and the audit findings. after that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\007-call-visit-lead\tasks.md file and start implimenting the changes step by step as per the plan you created. 

***Strict Rules***
-always follow the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines while building any new UI. so that you can stay concistent.
- never use hardcoded ui , no inline styles, only semantic classes from the global css.
- always test everything after making changes. do to attempt blindly if you dont have clear picture.
- while building tasks.md file , you must mention the test instructions for each task/set of tasks/phase you are creating. The test instructions can be functional test, UI test, backend test etc based on the task you are creating. 
- only move to the next task if the test is passed. 
- Finally, validate the task implementation against the original requirements to ensure all aspects have been addressed satisfactorily.
- Never give false information. e.g you said the task is functional and fixed but in real it is not and there are a lot of issues. 
------------------------------------------------------------------------------

***The countdown timer***
- when the lead is purchased by an installer, there should be no more countdown timer to show. 
- the countdown timer is only for the admin while assigning the lead to installers. after purchase it should be removed completely from the installers lead feed and homeowners lead feed as well.
- The countdown timer UI in the homeowners lead card needs to be updated, it should follow the Installers lead card countdown timer style UI. 
- Now I can see there are so many countdown timeres in the Quote request details modal, And the UI visibility is still same as before. 

***instructions*** Audit the frontend and backend and understand the current scenarion, comeup with the implimenetation plan based on the required tasks mentioed and the audit findings. after that create fix it accordingly. 
-------------------------------------------------------------------------


***installer Lead feed issue***
- when the homeowner cancel a assigned lead before the installer purchase, The assigned leads should be removed from the installers lead feed immediately.

***instructions*** Audit the frontend and backend and understand the current scenarion, comeup with the implimenetation plan based on the required tasks mentioed and the audit findings. after that create fix it accordingly.check the screenshot shared for better understanding. 
-------------------------------------------------------------------------

I want you to create a new file in the guidelines folder. the flies is the instruction and rules while implimenting any new task by AI models.

 - create a new file in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines folder named AI-IMPLEMENTATION-GUIDELINES.md 
 - in this file, write down the instructions and rules that should be followed while implimenting any new task by AI models.

- make sure to cover everything that is needed to keep the code quality high and concistent with the existing code base.
- also include the testing instructions and rules to follow after implimentation of any new task.

- Make sure , no matter what is the plan is. never implimenet anything without any audit and clear understanding or without any audit report. 
- each taks/phases should be tested , if falied the test then stop and fix then again test. move to the next phase only it is passed. 
- while building the tasks in the tasks.md file, it should always add testing notes and instructions for each type of taks implimeneted. r.g if built UI UX then add the reqired test instructions, if backend then give backend related test, if both then give full functional tests. 
- 
- the rules/instructions should be universal , so that I can refer this to any task that i will perform. 


***instructions*** I want you to audit the the .md files and speckits, constitution.md etc to collect infomration regarding my pain points. the reason behind creating the guidelines to control the AI with proper instructions for error free builds and concistency . read through all the necessary files and comeup with a universal impliemetation plan instuctions . 
- specially I recommend you to read this file D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Prompts\prompt.md first , becuase i have saved most of my prompts here. so that you can understand my pain points and build the better instructions. 
- second recommendation: read the above all the conversation of this chat filed
- third : check the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\007-call-visit-lead\tasks.md   , this is a recent one. I need more improvements . 

---------------------------------------------------------------------------

***Installers Purchased lead Page UI Enhancement***
- create tabs in the purchased leads page : Call/Visit, Written Quotes, Bidding . and the purchased leads should be shown in their respective tabs. e.g if the lead is call/visit then it should be shown in the call/visit tab only.

- The lead card in the purchased leads page should follow the same UI design as the lead feed lead card. so replace the existing design accordingly. 

--------------------------------------------------------------------------------

Leadfeed enhancement for Installers:
- now in the lead feed we have some wrong things : credit system. there is not credit system in our project. it was mistakenly there while buiding the prototype. so please remove any credit system related things from the lead feed including frontend and backend. but make sure the installers can purchase now in dev environment without any credit system and stripe payment becuase right now we dont have stripe API at this momenet. but we need to test installers flow . 
***instructions*** Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md
---------------------------------------------------------------------------
***Admin Lead Management modal update***
- the assigned lead price is not editable , the admin should be able to update and change price until before the lead was purchased by any installers. fix it accordingly.

***instructions*** Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md
-----------------------------------------------------------------------------

I have updated the price and clicked on the update button and i see errors. Please fix the issue accordingly. and also there are nother issue. for the countdown update there is another update button within the same modal which is confusing and not user friendly. so please merge both the update buttons into one single update button. so that when the admin update any details and click on the update button all the changes will be saved. Make sure the edit update functionality works. 

***instructions*** Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 

-----------------------------------------------------------------------------

### Further Considerations
1. No
2. no
3. The countdown timer will be controlled by admin. the sytem is already exists in the lead assignmenet system. 

- The homeowners can generate lead request as usual. so that part is not changing.
- The admin will assign the lead to multiple installers as usual. so that part is not changing. All you need to understand , so that you can audit the existing system properly. 
- We are now focusing on the installers side for the bidding leads. The call/visit lead flow is already built and working. so you need to audit the bidding lead flow and create the implimenetation plan accordingly. 
- As we did not do anything for the bidding leads for installers, so you need to build the bidding lead flow for installers, homeowners and admins flow from scratch, except the lead assignment part which is already built and working in the admin side.
- you need to design the end to end flow for all users. 
- Make sure it is easy to manage and also user friendly. 

***My initaila Plan*** the homeowners requested bidding> admin assigned to multiple installers within a countdown timer> installers see the bidding leads in their lead feed> they can place bid within the countdown timer> after countdown ends, the admin will review all the bids placed by installers and select one installer as winner> The Installer will pay to unlock the contact details> the winning installer will get the full contact details of the homeowner> After purchase it moves to the purchased leads page under bidding tab> the homeowners will get notified that an installer has responded to their bidding request.

- you should build the plan and user story more comprehensively after auditing the existing system. need to build the homeowners flow, admin flow and installers flow accordingly. 

***instructions*** Audit the fronend and backend of the Admin Lead managemenet, lead assignmenet to understand the Admins Side first. Then audit the frontend and backend of the Installers lead feed and purchased lead page and all of its modal and componenets. 




***bidding Quote issues***
- I have assigned a bidding lead to the installer > but it is showing up as a written quote in the installers lead feed (check the screenshot) > After assigining I check back the admin lead assign modal and found there is no installer is assigned > 

- the assigining flow SOT is the call/visit flow. the assiging flow should be same for the bidding too. 
- But the bidding lead card will have different functionality. 
 - I want you to address all the issues and written quote showing issues, and why not bidding shown? 
 - each type leads has different flow and endpoints. 
 - but assigining flow is same. the flow changes after assigining. 
 - the call/visit has a flow, the biding will have different flow, the written will have a different flow too. 

 - now focus on assiging part and the lead type issue. 

-----------------------------------------------------------------------------------

- I want the bidding call lead card modals and logics to be added as we already have the quote builder modal, bid review modal. 
- just need to connect the dots and make the bidding lead flow works for installers and homeowners lead card. 
- you can read back if you are confused D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Bidding leads\brainstorm3.md. also check the screenshots 
--------------------------------------------------------

do the backend task for this modal. once the bidding lead is assigned , the installers should be able to see the masked user information with lead details in this modal.   . read the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Bidding leads\brainstorm3.md for better understanding . lets do the backend and frontend for this to work. 
----------------------------------------------------------------------------

***Bid evaliation modal backend enhancement***
I have tested it but the outcome is not as per expectations. The issues are : 
- it is not fetching compelete data as per users inputs and dropdown selections in the instantQuote builder modal. e.g if i select a specific inverter brand form the dropdown while building the quote, it is not showing in the bid evaluation modal.
- Also not showing up the result and graph . 
- The ui of the bid evaluation modal needs enhancement. everything is too wide, I need a compact design which is easy to read and understand. 

----------------------------------------
***Bid evaliation modal backend enhancement***
it is still not fetching the pin point data, the custom battery size was not fetched. the graph is not fetched. and also more data to check.
You are overcomplicating things. understand my goal. the bid evaluation modal is to show exactly all the data inputs . let me clear once again what I want : 

- All the InstantQuote user inputs should show under a heading "InstantQuote Details"
- The result card should show accordingly with graph and all the data under a heading "InstantQuote Result"


***instructions** refact the bid evaluation modal if needed. check back the instantQuote modal again and audit its frontend and backend to understand the data flow. after that fix the issues accordingly. If the instantquote Data modal needs any fix then fix it accordingly. 
--------------------------------------------------------------

***homeowners/bidding - Review Bids modal build***
the UI plan is already there in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Bidding leads\brainstorm3.md . now you need to build the Review Bids modal for homeowners. so that the homeowners can review all the bids placed by installers and select one as winner.

***instructions*** We are now building the UI UX only , no backend now. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 
---------------------------------------------------------------

***the bidding flow***
as the last implimentation gone wrong , I have no idea what is the current situation of the bidding flow. so please audit the frontend and backend of the bidding flow deeply and check the  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Installers\Bidding leads\brainstorm3.md , this was the plan to implimenet. prepare the audit report with your findings and gaps. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 
-------------------------------------------------------------------

***Quote builder***
- research:
As the Quote builder modal is not done completely. I have done some research by chatgpt to enhance and make the quote builder professional. here is the research file D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\ChatGPT_research.md . 

***instructions*** I want you to go through the research file and understand the requirements. after that create a comprehensive plan to build the Quote builder modal accordingly. create the plan in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\QUOTE-BUILDER-IMPLEMENTATION-PLAN.md file. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 

-------------------------------------------------------------------

how come you did the unsemantic builds while you had the instructions in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md . I want you to find out the missing instructions or the issues cauased you not to follow the Strict rules. After that just update the guidelines or Design System SOT . so that you never do the simlar kind of mistakes. Read above few conversation to understand the current scenario.  while updating the guidelines, make sure to keep existing instructions as it is. just update on the specific area if needed. 

----------------------------------------------------------------

I need a error/issues fixing guidelines/SOT to create , I have been facing a lot of issues during fixing issues with AI . It deletes so many files , creates unsemantic code, inline styles, hardcoded values, inconsistent theming, no testing after implimentation etc. which is really annoying and time consuming to fix again and again. so I want you to create a error/issues fixing guidelines/SOT to avoid these kind of issues in future. 

***instructions*** read the whole chat conversations to identify my pain point regarding error/issue fixing. After that create a error/issues fixing guidelines/SOT in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-ISSUE-FIXING-GUIDELINES.md file. make sure to cover all the pain points you identified from the conversations. do not ovverride the existing guidelines. just create a new file for issue fixing guidelines. must add testing instructions and rules to follow after fixing any issue.

----------------------------------------------------------------------------------------------------

***Quotebuilder/bid builder modal enhancement***

- The quote builder is now working but the UI and calculation logic needs enhancement. I have done more reserach on ChatGPT to make it more professional and accurate. here is the research file D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\Main Plan\ChatGPT_CalculationLogic.md .
- Also check back the previous research file D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\ChatGPT_research.md , based on this we have created the current modal. 

***Instructions***
- I want you to go through both the research files and understand the requirements. after that create a comprehensive implementation plan to enhance the Quote builder modal accordingly. create the plan in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\QUOTE-BUILDER-IMPROVEMENT-PLAN.md file.
- Also mention the gaps in the current quote builder modal based on the research findings.
- Also validate the current calculation logic and mention the gaps if any.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md.

------------------------------------------------------------------------


- Take this as the SOT of my instructions regarding enhancing the Quote builder modal : D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\QUOTE-BUILDER-IMPROVEMENT-PLAN.md

- The Goal is to enhance the Quote builder modal UI UX and calculation logic based on the improvement plan mentioned in the above file.

- Important Note : You are crafting speckit for working on the existing modal, not building it. so be careful while crafting the speckit. 

- you must audit the current state and get the 100% clear picture before even start plannig. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md.
- You must refer this file in every tasks that will be accomplished. 

----------------------------------------------------------------------

I have noticed some issues in the current quote builder modal. here are the issues:

### Product configuration section: 
- The addons Items qty and price does not reflect in the total price calculation.
- Also it does not show the selected addons in the customer preview. 
- It is better to be auto added in the prcing engine as Addons with qty and price. so that the total price calculation will be accurate.

### Customer preview section:
- For the preview i have to click on the current configuration button to see the preview. I do not need the button here, just show the preview in real time as i select or change any input in the product configuration section.

### Price Engine section:
- The catergory dropdowns need to be enhaned with more options to add in the dropdown such as : Inverter, Ev charger, Battery, Mounting structure etc.


***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. if needed , update the specks accordingly. 

---------------------------------------------------------------------

***Bid builder modal enhancement***
- there is no graphs are per the plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\Main Plan was built. The graphs should have the accurate functionality based on the Quote.

***Lead details button :**
- you just need to import the "Lead details" button and its triggered modal "bid evaluation" just as it is now in the current bidding lead modal to the Bid builder modal. just add that button in the same line where save drat and submit Bid buttons are. so that the installers can see the lead details while building the bid.


### Preview modal : 
- also add a preview button to preview the bid before submitting. This preview modal is the modal which shows the bidding quote details to the Homeowner.

- The preview modal should have 2 buttons : Edit Bid and Confirm & Submit Bid. The preview modal should show all the bid details as per the data filled in the bid builder modal. The Installers Contact details will be shown as masked in the preview modal with note, "Contact details will be unlocked after winner is selected by the Homeowners" . 

- This modal will also show the Grpahs as well. 
- just focus on building the UI UX only for now, no backend. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. if needed , update the specks accordingly.

---------------------------------------------------

***System Selection Section Enhancement***
- System type can me shown in dropdown instead of a lot of buttons
- System size field is too wide, make it compact and save space.
- I do not need the 0kw-20kw selection line, it is not necessary. 
- Desired price Range is not needed here. 
- You should add dropdown Project type : Residential , commcercial . 

 ***Price Engine section enhancement***
 - The installer cost mode show weird layout. fix it to fit the overall setion size. check the screenshots for that. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. if needed , update the specks accordingly.

------------------------------------------------------------------

we have built the Bid builder almost, but Need more enhancements. The users generate leads throuh instant Quote Calculator Modal. And I think we need to cross check both modals user inputs fields and comeup with a plan if we found we can update the Bid builder some areas as per the instant Quote calcuator. So that the both end will have some common fields matches . This will make the Bid Builder more relevant to the InstantQuote. Homeowners usually provied a lot of information in the instatQuote. So we need to leverage user inputs to build the bid builder modal more effecient and user-friendly. 

***Instructions*** I need you to audit the fronent of the both modals deeply , so that you can comeup with the missing gaps, more enhancement idea of the UI. your audit should be comprehensive. Start with the InstantQuote first then Bid Builder. 
- create the audit report and the Enhancement plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal

-------------------------------------------------------------------

these are just the copy paste from your above texts. I liked your plan . Now updte the enhancement plan.md file with all our discussed points.Lets finalize and lock the plan . 

-Include all the fields from Instant Quote (orientation, tilt, shading, material, etc.) with the same or better options.
Add any extra fields that installers need (e.g., roof access notes, structural notes, array count, etc.).
Normalize the data so that what the homeowner provides can be directly mapped and prefilled for the installer, but also allow installers to add more technical details if needed.
I want a concrete field list or a patch to expand the Bid Builder’s roof section.

What Will Change? (In Plain English)
1. Import Button
If a lead has Instant Quote data, you’ll see an “Import from Instant Quote” button at the top of the Bid Builder.
Clicking it will show you a preview of what will change (before/after).
You can accept or cancel the import.
2. Automatic Field Mapping
The system will copy over matching info from the Instant Quote to the Bid Builder, such as:
Project type (residential/commercial)
System size (kW)
Electricity rates (retail/feed-in tariff)
Roof details (type, tilt, shading, orientation)
Battery info (if the homeowner wanted a battery)
Special features (like VPP, EV charger, smart home)
It will convert values as needed (e.g., cents to dollars, tilt buckets to degrees).
3. Smart Defaults & Hints
If the homeowner gave a custom electricity rate, that will be used as the default.
The system will estimate self-consumption based on usage patterns.
If the total price goes over the homeowner’s budget, you’ll see a gentle warning.
4. Helper Notes
Any field that was prefilled from the Instant Quote will show a small note: “Prefilled from homeowner Instant Quote”.
5. Battery & Addons
If the homeowner wanted a battery, the Bid Builder will pre-create a battery section with the right details.
Special requests (like VPP, EV, etc.) will show up as tags or $0 addons.
6. Quick Adjust Controls
You’ll get easy “+/-” buttons to quickly tweak the system size.
7. Safe & Reversible
You can always cancel or re-import if you want to start over.
If the import fails (bad data), you’ll get a soft error message.

------------------------------------------------------------------------------------------------------------------------------------

I want you to impliment this plan accurately and exactly : D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\INSTANT-to-BID-ENHANCEMENT-PLAN.md

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. if needed , update the specks accordingly. 

--------------------------------------------------------------------------------


I still do not see any visual update in the bid builder. And why are you giving me surprises and pain to checck UI , why do not you have any testing system applied so that always you can give me the acurate information before checking the UI. To solve this kind of pain points you should comup with a testing method e.g cypress or playright. so that after the phase task done you can ensure the task was done prefectly as per planned. Before we go for further fixing I want you to update the specific area in the guidelines file to avoid this kind of pain points in future. after updating it  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md , create a new phae in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md for the recent issues we are facing with the bid builder , And the impliement the testing methods to make sure the build was perfectly done as per planned. 

-------------------------------------------

So far it took a long time to do the so called enhancement of the bid builder modal. even you passed e2e tests as said. now it is sad but true, I do not see any visual impact in the bid builder modal. it is still same as before. no visual changes at all. so I want you to audit the whole conversation we had regarding the bid builder enhancement. 
- you must compare the tasks you have done vs the plan vs the expected outcome. This is crucial, because I do not need such files with codes that has no use in real app. 
- you must check the frontend and backend both deeply. Also check above all the conversation of this chat. 

after that create a comprehensive implementation plan in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Quote Builder Modal\BID-BUILDER-ENHANCEMENT-COMPREHENSIVE-PLAN.md file. make sure to cover all the points we discussed so far.





after that create a new phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and start implimenting the changes step by step as per the plan you created.

-------------------------------------------------------------

now even I see the Import button , but it has no functionality. and even in the modal it is not fetching the leads data completly as planned. the bid builder modal is not even importing the data as well. and I found there are important mismatch of the fileds in the bid builder. It has its own fileds , not same as the instantQuote . so the import will never reflect perfectly as per expected. 

- I want you to audit the both modals frontend and backend deeply and create the field mapping list with the mismatched fields as well. after that create the implimenetation plan to fix the bid builder modal fields as per the instantQuote modal fields. so that the import functionality will work perfectly as per planned.
- The Goal is InstantQuote fileds + Bid builder extra fileds = Perfect Bid builder modal for installers.

- as you have build the import functionality partially, so you need to fix the import functionality as well based on the new field mapping plan you will create.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. if needed , update the specks accordingly.

-------------------------------------------------------------


I want to show the bid evaluation exactly as it is in the right column of the bid builder . so the cutomer preview as it is just make it collapsible in the right side. so that the installers can see how the bid looks like while building the bid and also can see the lead details in the BID evaluation modal. 

- just follow the UI of the left side sections. Each sections are collapsible there.  I just want the same thing. 
- now there will be 2 sections in the right side : one is Customer preview, another "Customer details - InstantQuote Data". both should be collapsible.
***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. 

---------------------------------------------------------

I want you to remove this "Import from instant Quote" modal and its functionalities from the system . as this is not in use and it does not work.

- stat with a commit, so that we can rollback to this current state in case of messup you do .
***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. 


------------------------------------------------------------

in the right column > lead details section > s showing only one section from the bid evaluation modal > it aslo should show the Lead technical details and the InstantQuote result as it is. 

- In the right column > keep the 2 section wrapped by default. Now the customer preview section is unwrapped by default. it should be wrapped by default.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

---------------------------------------------------


I found mismatch between the bid evaluation modal vs Right column lead details section of the Bid builder modal.  even the fields are same but the not exactly as per the lead data from the instantQuote . 
- I want this section to fetch the lead data from the instantQuote lead generation flow. As the bid evaluation modal is fetching correctly. 
---------------------------------------------------------------

***Plan to build DB schema and endpoints for the Bid Builder modal data persistence***
- When the installers will click on the Submit bid button, the bid data should be persisted in the database. for that we need to build the DB schema and endpoints accordingly.
- The bid data should be linked with the respective lead id and installer id. so that we can fetch the bid data later for review and selection by the homeowners.
- As the lead is one to many relation with installers, so each installer will have their own bid data for the same lead id. so the DB schema should be designed accordingly.
- The bid data should include all the fields from the bid builder modal. so that we can store all the necessary information.
- The endpoints should include : create bid, update bid, get bid by lead id and installer id, get all bids by lead id etc.
- The scenario : the homewoners will compare multiple bids placed by installers for their bidding lead request. After comparing the bids, they will select one installer as winner. so we need to make sure the bid data is stored and fetched correctly for this flow. And the winner gets updated accordingly in the lead data as well. And the loosers will also get notified that they have lost the bid with polite message/notification. 
---------------------------------------------------------



- The bid submission is done . I need to create the Homeowners Review bids modal next. 
- the review modal was already created just a blank modal . it opens when the user clicks on the review bids button in the homeowners bidding lead card.
- I want you to build the Homeowners Review bids modal now. so that the homeowners can review all the bids placed by installers for their bidding lead request.
- The Ui should look like a real Quotation . Create a 2 column layout. Left side will have all the bid details placed by the installer. Right side will have the lead details fetched from the instantQuote data as it is in the bid builder modal right column.
- The homeowners can compare multiple bids placed by different installers by clicking on the installer list dropdown at the top of the modal.
- The homeowners can select one installer as winner by clicking on the "Select as winner" button at the bottom right side of the modal. 
- each quote will have this "Select as winner" button. so that the selected winner get notified accordingly as per their bid ID. So the bid data should be linked with the respective lead id and installer id. so that we can fetch the bid data later for review and selection by the homeowners.
- Start wit a commit so that we can rollback if needed.
***Instructions*** based on the installers BID submit data we will design the UI for the homeowners review bids modal. So that the homeowners can see all the bid details placed by the installers. We will design the UI accordingly and work on the UI only for now. But you must understand the data flow and backend part as well. because after building the UI we will work on the backend part to fetch the bid data placed by installers for that lead id.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.


-------------------------------------------------------------

***your suggested backend plan***
Backend Plan: Phase 13E – Bid Selection

GET /api/bids/lead/[leadId]

Returns all bids for a given lead.
Used to populate the modal with up-to-date bid data.
POST /api/bids/[bidId]/select-winner

Marks a bid as the winner for the lead.
Updates bid status and lead status to PURCHASED.
Unlocks installer contact details for the homeowner.
Sends notifications to the winning installer.
Lead Status Update

When a winner is selected, update the lead’s status to PURCHASED in the database.
Notification System

Notify the winning installer (email or in-app).
Optionally notify other installers of the outcome.
Security & Validation

Ensure only the homeowner can select a winner for their lead.
Validate bid and lead IDs.
Audit Logging

Log winner selection events for compliance and troubleshooting.

***Instructions*** I want you to review the above backend plan and suggest any improvements or changes if needed. after that create the necessary endpoints and database schema as per the plan to support the homeowners review bids modal functionality. make sure the bid data is linked with the respective lead id and installer id. so that we can fetch the bid data later for review and selection by the homeowners.

***strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

------------------------------------------------------

***testing result***
I have submitted a bid from ainstallers account , but I do not rceive the bid data in the homeowners bid review modal. Please test the endpoints and database schema you have created to make sure the bid data is stored and fetched correctly for the homeowners review bids modal functionality.

***Instructions*** I want you to test the endpoints and database schema you have created to make sure the bid data is stored and fetched correctly for the homeowners review bids modal functionality. after that fix any issues if found during testing.

------------------------------------------------

***Homeowners Review modal***

I have submitted a bid by the installers account but the bid data is not showing up in the homeowners review bids modal. please test the endpoints and database schema you have created to make sure the bid data is stored and fetched correctly for the homeowners review bids modal functionality.
- also check the frontend part of the homeowners review bids modal to make sure it is fetching and displaying the bid data correctly.
- NOw the frondtend is maybe showing some demo data, not the original data fromt he installers submitted bid.

***Instructions*** I want you to test the endpoints and database schema you have created to make sure the bid data is stored and fetched correctly for the homeowners review bids modal functionality. after that fix any issues if found during testing. also check the frontend part of the homeowners review bids modal to make sure it is fetching and displaying the bid data correctly.
- also start with a commit so that we can rollback if needed.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

---------------------------------------------------------------

***homeowners Review bids- select as winner function***

now the homeowners can compare bids and has a button to select any installer as winner, but theere is no futher functionality after clicking the select as winner button. so I want you to build the select as winner functionality now. so that when the homeowners click on the select as winner button, the respective installer gets notified that they have won the bid for that lead. and also the lead status gets updated to PURCHASED after the installer make payments.


***Instructions*** I want you to audit and understand the current status of the homeowners review bids modal functionality first. after that build the select as winner functionality as per the plan discussed before. so that when the homeowners click on the select as winner button, the respective installer gets notified that they have won the bid for that lead. and also the lead status gets updated to PURCHASED after the installer make payments.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

-----------------------------------------------------------

- The looser installers are getting notified , but the message in red mark is not appropriate. now it is showing "This lead has been purchased by anoter installer" , you should write something politely  "The Bid is won by another installer. Better luck next time!" or something like that. 
***Instructions*** I want you to update the looser notification message as per the above instruction. make sure the message is polite and professional.

- The winner Installer's lead card is moved to the purchased leads page under bidding tab without making the payment. I want you to fix this issue. The lead should be moved to purchased leads only after the payment is done by the winner installer.
- And the homeowners informations are revelaed immidiately before payment. which is wrong. 

**what it should be***

After the homeowner select the winner, the winner still see the lead in the leadfeed, but the status will be updated with a winning Trophy icon and a note "You have won this bid! Please proceed to payment to unlock homeowner contact details."
- only after the payment is done by the winner installer, the lead gets moved to purchased leads page under bidding tab and reveal the contacts.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

----------------------------------------------------

-The winner installer is not getting notified after being selected as winner by the homeowners. I want you to fix this issue. so that the winner installer gets notified accordingly as per their bid ID.
-The lead card is also not updated there is no button or note showing the winner installer to proceed to payment to unlock homeowner contact details.
***Instructions*** I want you to fix the issue so that the winner installer gets notified accordingly as per their bid ID.
- The lead card is also not updated there is no button or note showing the winner installer to proceed to payment to unlock homeowner contact details.
- Must show a winner Trophy Icon and a note "You have won this bid! Please proceed to payment to unlock homeowner contact details." in the lead card of the winner installer in the lead feed.
***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

--------------------------------------------------------------

***Purchased Lead card enhancement***
- After purchasing bidding lead, the homeowners Contact details should be Unmasked and shown in the purchased lead card under bidding tab.
- The "Place bid" button should be removed from the purchased lead card under bidding tab.
- The Lead details button > Bid Evaluation Modal's contact information section should reveal the contact information after purchase.

***Instructions*** I want you to enhance the purchased lead card under bidding tab as per the above instructions. so that after purchasing bidding lead, the homeowners Contact details should be Unmasked and shown in the purchased lead card under bidding tab.
***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

------------------------------------------------------------

***homeowner's Bidding lead Status update enhancement***
- now after the Installer purchased the lead > the Homeonwer should see the lead status updated to "Bid awarded" in their bidding lead card. 
- In the review BID modal > the Installer company Name and contact details should be shown as unmasked after the lead is purchased by the installer.
- in the lead card > homwowner should see the "Start chat" button > and the chat modal should Open directly with the winning installer. 

***Installers bidding lead card enhancement***
- The button "View Full Details" > opens lead details modal. But I want it to open Bid Evaluation modal instead. 
- And the button UI position should be changed . it should stay on the same line of other 2 buttons below. 

***Instructions*** I want you to enhance the homeowners bidding lead card and installer's bidding lead card as per the above instructions. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

------------------------------------------------------------

I want you to check the All API is working or not, We have doen API integrations in the .env file. But now need to make sure all are in realtime use. read the .env file and Do a deep Audit in the entire system including frontend backend API etc, Unerstand the API implimentations, identify any missing gaps if any, Run all the necessary tests, Do the playwright tests, the goal to make sure the ALL the API is working perfectly in realtime.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Audit-Reports\API-INTEGRATION-AUDIT-REPORT.md file .
After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

---------------------------------------------------------------------------------

Now I want you to do a deep audit in a simlar way that you did for the pusher. Now focus on the s3 . Audit all the frontend and backend, API ,prisma etc relevant to the s3. Make sure it is working and production ready and operational. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Audit-Reports\API-INTEGRATION-AUDIT-REPORT.md file .
After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.


---------------------------------------------------------------------

Lets design the Notification Card UI/UX for the Notification center modal. Last do the semantic approach. ALso check the existing notification card UI/UX in the notification center modal. then design the new notification card UI/UX accordingly. There are 9 problems in the existing design. check the screenshots for reference.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and start implimenting accordingly. 
--------------------------------------------------------------------------------------------------------


now the issue is , Clicking on the notification buttons are not redirecting to the righ pages. And it is quite difficult to identify which notification is for which action. So I want you to audit the notification center modal and its notification card component deeply. after that create a comprehensive plan to fix the notification center modal and its notification card component issues. so that clicking on the notification buttons are redirecting to the right pages. And it is easy to identify which notification is for which action. 

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

-----------------------------------------------------------------------------------------

clicking on the notifications are not redirecting to relevant directions. also some are showing error messages . e.g proceed to payment shows "check screenshot". what the tests you have done? what you tested with playwright?  The issues are just same as before doing this implimentations. I want you to checkback everything , Audit back if the entire notification system and all relevant files.  

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md . Make sure to follow backend frontend rules in the guidelines. Also the testing instructions as well. 

-----------------------------------------------------------------------------------------------------


I have no Idea what you have tested and done so far.
Nothing is going as per planned. The notification clicks are still not redirecting to relevant pages. e.g clicking on New lead Available is redirecting to the Marketplace page instead of Lead feed page. The marketplace page is not in even use but you are redirecting there. Also proceed to payment is still showing error message as before. I want you to audit the entire notification system again deeply including frontend backend API prisma etc. after that create a comprehensive fix plan to fix the notification system issues. so that clicking on the notifications are redirecting to relevant pages without any error messages.

I want you to address the real issues this time. not just passing the tests without fixing the real issues.
You are overcomplicating things. just focus on the real issues and fix them properly. 

- Your playwright tests should be focued on notification system only. You must check the redirections after clicking on the notifications. and also check any error messages if shown. You must make sure the redirections are relevant and no error messages shown. Identify which actions are for which notifications. and test accordingly. Do not overcomplicate things. just focus on the real issues and fix them properly. Do not implimenet blindly anything without understanding the real issues.

***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

--------------------------------------------------------------------------------------------

The notification system is a complete mess. There are a lot of issues still persisting. e.g The homeowner clicks on view button and it show 404 error page. Also there are some meesages needs to be changed to polite and relevant messages. I do not want any homeowners sees the words like Lead, purchased , paid , etc. THe homeowners side should never feel anything like their quotre request is on selling to installers. The Homeowners should feel like they are getting free services from this site as they are not paying anything to the site. 

- I want you to redesign the notification system. the existing system has a lot of issues that are kind of impossible to fix. You have tried so many times to fix it but failled. 
- Previously there are no notification was built for the Admin side. Now need to add the notification bell icon in the admin header same as like the installers and homeowners. 
- Track down each and every actions of all the 3 parties separately. Then create a action based notification messages and redirections plan accordingly. 
- Before implimenting, you need to eliminate the existing notification system and redirections. 


***Strickt rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create the plan for new notification system based on your deep audit. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

***Mandatory*** must do the playwright e2e testing instructions after completing the new notification system implimentation. 

-------------------------------------------------------------------------------------------



***Testing flow : ***

# Homeowners:
- Created new homeowners account > generated first lead > end - no notification in this action.
- Phone verified > notification - Phone Verified 
your phone number has been successfully verified. All 1 of your lead(s) have been updated with verified status. (I do not want to show lead(s) word here , change it to "your requests" or something like that)
- created more leads > no notifications in the admin side. > admin assigned to installers > installer notification - New Opportunity
NEW_OPPORTUNITY
A new homeowner request is available in your feed. 
> I do not need tags like NEW_OPPORTUNITY in any notification. make it simple. 

- After installer purchased the call/visit lead > There is no notification for the Installer side - there should be a notification.
- After installer purchased the call/visit lead > Homeowners notification - Installer Responded to Your Request
Purchase
An installer has responded to your solar request and will contact you soon. > here I do not want any tags like purchase. 
- After installer purchased the call/visit lead > There is no Admin Notifications.


- After assigining the bidding lead > Installer got notification > But after installer submitted the bid the admin doesnt get any notifications - there should be a notification for the admin side as well.
- After submitting the BID to homeowners > homeowners notification - New Bid Received
Bid
Invalid Date

An installer has submitted a bid for your Sydney, 3000 project. Review all bids and select a winner.
> here I do not want any tags like Bid. and also why there is no time there?  it is showing invalid date , need fixing there. 

- after homeowner selected winner > installer got notification - I do not need the Proceed to payment button in the notification. > also there is no Admin notifications - there should be a notification for the admin side as well.
- After the bid is purchased by the winner installer > there is no notification for admins and also installers and homeowners. 

- I do not need tags in the notifications , e.g System , Purchase. I want you to remove the tags from the notification cards in the notification center modal for all 3 user roles.
- The Admin notifications are not showing up, check if it implimented or not. 
- Also I do not want the homewoners see workds like lead, purchase, paid , etc. I want you to change the messages accordingly to polite and relevant messages for homeowners. no notification message should have these kind of words. Even I mentioed earlier, it is applied partially. 

***Overall*** it seems like it is very complicated to identify each flow and its notification based on the user interactions. All the texts were not even well planned, noification mapping was not well done, there are lots of gaps . Even I explained above as much as I could find, but there are more that I still do not know even what is there and what is not. 

***Instructions*** I want you to track down each user flows end to end and identify all the notification messages according to user actions. e.g  - After the bid is purchased by the winner installer > there is no notification for admins and also installers and homeowners. 
I need you to track down everything within notification system in 1 audit report. 

***Strickt rules*** do the froentend backend comprhensive audit. ollow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md.


--------------------------------------------------------------------------------

I do not agree with this (❌ ROOT CAUSE IDENTIFIED:
Admin has 0 notifications because NO ACTIVITIES HAVE OCCURRED since the new notification system was implemented.

Recent bids in database: Created Dec 8-11 (BEFORE new code)
Recent purchases: Created Dec 8-11 (BEFORE new code)
New notification service code: Just deployed TODAY (Dec 11)
No new bids, winner selections, or purchases have triggered since code deployment) .

*** I have tested by generating new lead from homeowners account and the admin notification dropdown still not showing any notificaitons. 
- Your new notificaiton system might not working perfectly, may be working partially. 
- I want you do deep dive audit on the admin notification and all of its settings and udnerstand what is currently being implimented. After that create a comprehensive fix plan to fix the admin notification issues. so that the admin gets notified accordingly based on the user actions in the system.

***Strickt Rules***  Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.
-----------------------------------------------------------------------

I have created a new call/visit lead> notification showed in the admin > assigned to installer > but after the installer purchased the lead I do not get any admin notifications. 
- Now the admin notification is working but not getting the notifications as per user interactions. 
- This part is quite difficult to tell you what notifications I need , there are lot of user interactions to mention and I am unable to do that. 
- you should analyze and comeup with the unser interaction based notification plan with the exact message to show. 

***Instructions*** it is not only about the admin only. Its about all the 3 types of user notifications. your job is to audit all the flow deeply, identify user interaction points and based on that prepare a notificaton plan for all users

***Strickt rules***
Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

------------------------------------------------------------------------------------------

I do not want to show these tags on the notifiation e.g parchase, request_receive etc in the homeowners notifications dropdown card. I want you to remove these tags from the notification cards in the notification center modal for homeowners.
***Strickt rules***
Follow the Guidelines from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well.

-------------------------------------------------------------------------------------------

***SendGrid Functionality Testing and Fixing***
We have integrated SendGrid email service in the application for sending transactional emails. I want you to test the SendGrid functionality thoroughly to ensure that all email notifications are being sent correctly as per the user actions in the system.

- Our goal is to make sure all the email notifications are working perfectly in realtime without any issues.

***Instructions*** I want you to test the SendGrid functionality thoroughly to ensure that all email notifications are being sent correctly as per the user actions in the system. I want you to track down the entire email notification flows for all 3 user roles (homeowners, installers, admins) and identify any missing gaps if any. Run all the necessary tests to make sure the email notifications are working perfectly in realtime without any issues. Your Audit should be comprhensive enough to cover all the aspects of SendGrid functionality including frontend, backend, API, prisma etc. 

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.

 ---------------------------------------------------------------------------------------

 I am doing the email testting with the new email ID with is real mails. but I am not receiving any emails in that email ID. 

 I have just generated 1 lead from the homeowners account to trigger the email notification to the admin and installer. but I am not receiving any emails in the respective email IDs.
 I did not test further, because I am not receiving any emails in the first place.

***Instructions*** I want you to test the SendGrid functionality thoroughly to ensure that all email notifications are being sent correctly as per the user actions in the system. I want you to track down the entire email notification flows for all 3 user roles (homeowners, installers, admins) and identify any missing gaps if any. Run all the necessary tests to make sure the email notifications are working perfectly in realtime without any issues. Your Audit should be comprhensive enough to cover all the aspects of SendGrid functionality including frontend, backend, API, prisma etc. Make sure the SendGrid Integration is working perfectly without any issues.

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.

 ----------------------------------------------------------------------------------------------

 I have now received the email. but I am confused and there might a mig issue with the user id and their classifications. I have generated a lead from the homeowners accunt (Homeowner : nayeem4978@gmail.com) , The admin received the email from the Installers account which is Installer : mohammadikramul7@gmail.com . check the screenshot for better understanding. 

- there are another issue as well. I am able to login with any regestered Email ID from any user role login page. e.g I can login with the homeowners email ID from the installers login page. which is wrong. it is creating more confusion regarding the user roles and their email IDs. 

***Instructions*** I want you to audit the user roles and their email IDs deeply to ensure there is no mix up or mig issue with the user id and their classifications. after that create a comprehensive fix plan to fix any issues found during the audit. so that each user role is properly classified and there is no mix up with the email IDs. also make sure that each user can only login from their respective login pages only. e.g homeowners can only login from homeowners login page only.

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.
 -----------------------------------------------------------------
 I did not receive any email and notification after the installer purchased the call/visit lead in any end admin/homeowner. I have tested by generating new lead from the homeowners account and assigning to installer. after that the installer purchased the lead but I did not receive any email and notification after the installer purchased the call/visit lead in any end admin/homeowner.

***Instructions*** I want you to test the SendGrid functionality thoroughly to ensure that all email notifications are being sent correctly as per the user actions in the system. I want you to track down the entire email notification flows for all 3 user roles (homeowners, installers, admins) and identify any missing gaps if any. Run all the necessary tests to make sure the email notifications are working perfectly in realtime without any issues. Your Audit should be comprhensive enough to cover all the aspects of SendGrid functionality including frontend, backend, API, prisma etc. Make sure the SendGrid Integration is working perfectly without any issues. make sure all the action points are covered including after the installer purchased the call/visit lead.

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through: D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\AI-IMPLEMENTATION-GUIDELINES.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.

 --------------------------------------------------------------------------------------

 You are a senior Staff Software Architect.

Your task is to CREATE a single authoritative `README.md` file for this repository. 

PURPOSE OF README:
- This README is NOT general documentation
- It is the **System Control Index** and **AI Navigation Entry Point**
- Both humans and AI must read this file FIRST before any task

CONTEXT:
- All `.md` files in this project already exist
- You MUST scan and understand existing markdown files
- Do NOT invent files or rules that do not exist
- Do NOT rewrite other files — only reference them

WHAT THE README MUST DO:

1. Declare Authority Hierarchy (very important)
   - Define a clear order of authority between documents
   - Example layers: Constitution, Blueprint, Audit Protocol, Implementation Guidelines, Design System, UI/UX Standards
   - Explicitly state: if conflicts exist, higher authority always wins

2. Act as an AI Navigation Controller
   - Instruct AI which documents to read first
   - Instruct AI to load ONLY relevant files to avoid token waste
   - Prohibit assumptions or hallucinations

3. Map Documents to Use-Cases
   - Where to look for:
     - Architecture decisions
     - Feature implementation rules
     - Auditing & debugging
     - Refactoring
     - UI/UX decisions
     - Error handling & incidents

4. Define AI Behavior Rules
   - AI must not proceed without reading required authorities
   - AI must ask for clarification if authority conflicts
   - AI must never invent undocumented behavior

5. Be Stable, Clear, and Professional
   - This README should rarely change
   - No hype, no marketing language
   - Short sections, precise wording
   - Industry-standard tone (like internal engineering docs)

CONSTRAINTS:
- Do NOT include code samples
- Do NOT repeat content from other files
- Do NOT exceed what is verifiable from existing files
- Use clear headings and bullet points

OUTPUT:
- Produce ONLY the final `README.md` content in this directory : D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines
- Markdown format
- This README should be suitable for long-term use in a professional SaaS codebase
-----------------------------------------------------------------------------------------


I want to fix these issues found in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\System\UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md file . Please follow the instructions below carefully.

***STRICT RULES***

1. Authority & Navigation
- Read and follow: README.md (System Control Index & AI Navigation Entry Point)
- Follow the Authority Hierarchy strictly
- SYSTEM_CONSTITUTION.md is supreme authority
- Do not override higher-level documents

2. Scope Discipline
- Load only files required for this task
- Do not assume undocumented behavior
- If a required rule or flow is missing, STOP and report it

3. Architecture Rules
- UI displays state only; backend enforces truth
- Business logic must not live in UI
- Follow separation of concerns as defined in Blueprint and Guidelines

4. Audit & Quality
- Track the full end-to-end flow (UI → API → DB → Side-effects)
- Identify missing gaps, not just failures
- Ensure actions are traceable (logs/events/notifications)

5. Execution Constraints
- Follow AI-IMPLEMENTATION-GUIDELINES.md for:
  - Backend/frontend rules
  - Testing rules
  - GATE 0 and zero-warnings policy
- Do not invent entities, roles, states, or workflows

6. Output Requirements
- Clearly list:
  - What was checked
  - What failed
  - Why it failed
  - Exact fix location
- If uncertain, ask before proceeding


------------------------------------------------------------------------------------

***The QUote Limit reached modal enhancement and issues***
- The Homewones Quote limit was reached and I have increaded Limit from the Admin panel. but the homeowner side still showing the Quote limit reached modal when trying to generate new lead. 
- The dashboard Is showing the limit and it is working there fine, also the lead generation is working fine from the dashboard as well. but when trying to generate new lead from the marketplace page > it is showing the quote limit reached modal still.
***ANother Enhancement***
- Now the admins can increase the homeowner's quote limit from the admin panel. but the homeowners are always has 1 bidding lead quote only. The logic is completely fine. But I want The admin can increase the homeowner's bidding lead quote limit as well from the admin panel. so that the homeowners can generate more bidding leads as per the increased limit from the admin panel. 
- Make sure the limit for bidding is always 1 from homeowners side. but the admin can increase the bidding lead quote limit from the admin panel. so that the homeowners can generate more bidding leads as per the increased limit from the admin panel.

***Instructions*** I want you to enhance the Quote limit reached modal and fix the issues as per the above instructions. so that after increasing the quote limit from the admin panel, the homeowner should be able to generate new lead without seeing the quote limit reached modal from any page.

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\README.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.


----------------------------------------------------------------------------------------

***testing results:***
- First , you should check back all your implimentation vs my last promts instructions. You will know the missing gaps.
- The issue mentioned in the previous prompt is still persisting. now in the Marketing page instantQUote Flow > the user is not seeing the quote limit in the quote distribution modal, but in the dashboard page instantQuote flow > the user is seeing the quote limit in the quote distribution modal with the correct limit number.
- check the bot screen shots. 
- In the admin panel > the admin increating limit is still same as before. I mean it is just working as per the existing logic which is fine , but there is no option for the admin to chose the bidding lead quote limit separately. I want you to add that option as well in the admin panel so that the admin can increase the bidding lead quote limit separately as per the previous instructions. You may need to create a new modal to solve this issue.

***Instructions*** I want you to fix the issues found during the testing as per the above instructions. so that the quote limit is showing correctly in all the places. also the admin can increase the bidding lead quote limit separately from the admin panel as per the previous instructions.

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\README.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.
 --------------------------------------------------------------------------------------------

 When the admin increased the limit of quote generation the homewoners should get notifications via internal notification and also email. 

***Instructions*** I want you to enhance the Quote limit increase functionality as per the above instructions. so that when the admin increased the limit of quote generation the homewoners should get notifications via internal notification and also email.

 ***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\README.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\AUDIT-REPORTS\SendGrid folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.

 --------------------------------------------------------------------------------------

 I want to complete the Written Quote flow e2e . But I am out of Idea. as I already has call/visit and bidding lead, so I thought this written quote can a quote where the Installer will send Quotes masked and homeowers can negotiation with the price , but the negotiation has limitations e.g installer gave price 5000, homeowner can only edit ammount to any amount they want , If the installer Press "Done deal" button then the deal is done, if the installer give another price then it will be considered as last price , so if the homeowner press "Done deal" then the deal will be closed and the installers will have to pay and then the process continues as per the normal flow.

- The review bid modal from homeowners side can be used for this purpose with some modifications. so that we do not need to build another modal from scratch. 

***Instructions*** I want you to design the initial plan based on the Written Quote flow e2e as per the above instructions. so that the homeowners can negotiation with the price with some limitations as per the above instructions. and come up with a comprehensive implementation plan for this Written Quote flow e2e.
- You have to understand the current exact status of this written quote flow e2e first. then based on that you have to design the initial plan accordingly.

***Strickt rules***  
Follow the 
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Guidelines\README.md. 
### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder .
### Implementation Phase:
 After that create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and make sure to stay aligned with the specks as well. Make sure to follow the backend frontend rules in the guidelines. Also the testing instructions as well. Must include playwright e2e testing for SendGrid email notifications as well to ensure everything is working perfectly in realtime without any issues.


---------------------------------------------------------------------------------------------

Based on this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\Written Quote\ImplementationPlan.md file , I want you to implement the Written Quote flow e2e as per the plan mentioned in the above file.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

--------------------------------------------------------------------------------------

***written Quote building***

As the Bid flow and all of its modals are already built and working perfectly, I want you to Copy the existing Review Bid modal, Bid builder modal, but adapt with the writtenQUote.  I do not want to reuse , I want separate modals for Written Quote flow but it will be a copy of the existing bid flow modals with some modifications as per the written quote flow requirements.
- Understand the scenario : the bidding Lead system and the written Quote system is almost same except the negotiation part. so the existing Bid builder modal and Review Bid modal can be used for this purpose with some modifications. so that we do not need to build another modal from scratch. So, do not overcomplicate things. just copy the existing modals and adapt accordingly as per the written quote flow requirements.

***What to copy exactly as per SOT bid flow:*** 
- Copy the existing Review Bid modal from homeowners side and make a new modal for Written Quote review modal for homeowners side.
- Copy the existing Bid builder modal from installers side and make a new modal for Written Quote builder modal for installers side. 
- The Frontend and backend both needs to be copied and adapted for Written Quote flow accordingly as per the existing SOT bid flow.

***what modifications needed:*** 
### Bid Builder modal (Installer side) modifications:
- Change all the texts and labels from Bid to Written Quote accordingly.
- All the fields remains exactly same as like the existing Bid builder modal.
- Only add : negotiation section in the right column to show the negotiation history and current status, and field for amount inputs. 

### Review Bid modal (Homeowner side) modifications:
- Change all the texts and labels from Bid to Written Quote accordingly.
- All the fields remains exactly same as like the existing Review Bid modal.
- Only add : negotiation section in the right column to show the negotiation history and current status, and field for amount inputs. 

### The negotiation Section functionality: 
The Installer side : Submit masked written quote amount (e.g., $5,000) tied to a lead.
The Homeowner side : Propose a counter amount (free-form numeric), respecting limits: 1 time only.
- Installer’s new price replaces prior; “last price” is authoritative until next change.
- Both end will have "Done deal" button → negotiation closes; installer proceeds to payment.

Summary : E.g the installer given price 10000> the homeonwer countered with 8000 > the installer given new price 9000 > the homeowner accepted the price by pressing "Done deal" button > negotiation closed > installer proceeds to payment. 

- The entire negotiation history should be shown in the negotiation section in both end (installer and homeowner) with timestamps. And they respective amounts. use the right column for this purpose in both modals.

***Instructions*** I want you to copy the existing Review Bid modal, Bid builder modal, but adapt with the writtenQUote as per the above instructions. so that we have separate modals for Written Quote flow but it will be a copy of the existing bid flow modals with some modifications as per the written quote flow requirements. Your job is to deeply undertand the Bid builder modal and Review Bid modal both frontend and backend flow first. then you have to copy and adapt accordingly as per the above instructions. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

----------------------------------------------------------------------------------------
as per your next step : 
 Next Steps (Manual TypeScript Fixes Required)
The frontend components have TypeScript errors because Prisma's JSON fields (systemData, batteryData, lineItems) need type assertions. Follow the same pattern as the Bid modal - use optional chaining with the JSON fields directly without type assertions, or add as any where needed.

***Instructions*** I want you to fix the TypeScript errors in the Written Quote flow modals as per the above instructions. so that the frontend components have no TypeScript errors. But before that you need to deeply understand how the TypeScript errors were fixed in the Bid modals first. then you have to follow the same pattern as the Bid modal - use optional chaining with the JSON fields directly without type assertions, or add as any where needed. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

--------------------------------------------------------------------------------------------

before implimentation of the backend of written Quote , We took a backup of the DB. During implimentation the DB had to reset. After the implimentation I restored the DB from the backup. but now the Written Quote flow is not working properly. I think there are some issues with the data integrity after restoring the DB from the backup and there is a mismatch because of the backup has old data not the new tables that was created during the implimentation of the Written Quote flow. 
***Instructions*** I want you to fix the data integrity issues in the Written Quote flow as per the above instructions. so that the Written Quote flow is working properly without any issues. Audit deeply and understand what are the data integrity issues after restoring the DB from the backup. then you have to fix those issues accordingly.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

-----------------------------------------------------------------------------------------------

***Instructions***
I want you to perform a deep audit for the written QUote implimentations. you have to audit the frontend ,backend , API, prisma etc e2e in order to validate the tasks were done perfecly from the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\PHASE-13W-DETAILED-TASKS.md . 

Understand the current flow and modals e2e for the written Quotes and ientify the missing gaps . Because I see the QUote BUuilder modal opens when I click on the written lead card > Submit QUote button. there might be a lot of mismatches according to the plan. You have to identify them. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 
---------------------------------------------------------------------------------------------

The feature is not functional as you are claiming : Test manually: Create Written Quote lead → Submit quote → Review quotes → Negotiate . 

- The lead card > Submit Quote button > Opening the Quote builder modal which is not adapted as per the written Quote as per planned. check the screenshot. And there is no negotiation section in the right column and Clicking on send Quote button does not generate any Quote. Might be backend issues. 

- The homeowners written QUote lead card > review Quotes Button > Opens the bidding review modal . the texts are confusing and it was not adapted as per the written QUote. As the Backend has issues , so there is no option to test the frontend. 

***Instructions*** 
Audit back the entire system regarding writtenQuote and its e2e flows also the previews audits to identify why your previous audits could not fix the issues. 
- D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\WRITTEN-QUOTE-E2E-AUDIT.md

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

-------------------------------------------------------------------------------------

Check the screenshot. The Quote is not generating. there are issues in the backend  and frontend.  I mentioned several times to check the entire system including API, prisma, Frontend ,backend, modals, etc end to end , flows. SO that you can get a clear picture. you should check the root plan and validate with the implimentation done and identify the gaps clearly. Nothing is done as per planned perfectly. check back all the files D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote . and understand what is done and what was the actual plan. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

---------------------------------------------------------------------------------------------

The QUotation was generated and the homeowners review modal is showing up . But the texts and labels are not adapted as per the Written Quote flow. it is still showing Bid related texts and labels. check the screenshot. ANd also the buttons are not relevant according to the Written Quote flow. 
- There is no right column negotiation panel as per the plan in the homeowners review modal.
- Also there is no Right colum Negotation panel in the installers Quote builder modal as per the plan. 

***Instructions*** I want you to fix the texts and labels in the homeowners review modal as per the Written Quote flow. also adapt the buttons accordingly as per the Written Quote flow. so that everything is relevant to the Written Quote flow. Also add the right column negotiation panel in both modals (homeowners review modal and installers Quote builder modal) as per the plan. Check back the raw plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\Raw_plan.md for better understanding. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 
---------------------------------------------------------------------------------------------

The homeowners review modal UI issues. The MOdal has a lot of overlapping contents from the Dashboard . might be Z-indexing issue. This modal should be clean and clear without any overlapping contents. check the screenshot for better understanding. 

AUdit if needed, Fix the UI only issues in the homeowners review modal as per the above instructions. so that the MOdal has a clean and clear UI without any overlapping contents.

----------------------------------------------------------------------------------------

THe installers Quote builder modal also has similar kind of UI issues and also the autosaving is acting like a bug , e.g it is auto auto blinking all the time . ANd also it has other contnets overlapping issues. 
-  Also make sure the negotiation part is synced with the homeonwers negotioation panel. Both should be in sync. e.g if the homeowner proposed a counter amount , it should reflect in the installers negotiation panel as well instantly without any issues.

***Instructions*** I want you to fix the UI only issues in the installers Quote builder modal as per the above instructions. so that the MOdal has a clean and clear UI without any overlapping contents. also fix the autosaving bug as per the above instructions. Also make sure the negotiation part is synced with the homeonwers negotioation panel. Both should be in sync. e.g if the homeowner proposed a counter amount , it should reflect in the installers negotiation panel as well instantly without any issues.

--------------------------------------------------------------------------------------------------

The negotiation section in the Writeen Quote Builder might have some bug, it is also auto blinking. AS it is not stable so it is difficult to write anything in the revise offer price. I want you to identify this UI/UX related issues and fix it accordingly. audit if needed. 

------------------------------------------------------------------------------------------------


 Now the negotiation panel is working on both side but there is no end point. After the Homeowner clicked on "Done Deal" > The installers should be able to Purchase the lead in order to communicate to the Homeowners by unmasked their contact details > also the homeowners should see the Installers contact details after the Installer purchase the Lead. There should be a "Reject" button beside the "Done deal" button , so that the homeowners can reject the deal if the price was not good> after rejeection the installers will get the notifications that the deal price was rejected by the homeowner > this will show up in the lead card of the installers side. 

- For the purchase flow, You can mirror the bidding lead flow which is done within the lead card of the installers side. SO Installers will see purchase button and contact revealing within the lead card. For this implimentation in the writtenQuote lead card, I want you to understand the Bidding lead card. You do not need to invent anything new, we will mirror the Bidding flow endpoints but adapt everything as per the written quote. 

***Instructions*** I want you to implement the purchase flow in the Written Quote flow as per the above instructions. so that after the Homeowner clicked on "Done Deal" > The installers should be able to Purchase the lead in order to communicate to the Homeowners by unmasked their contact details > also the homeowners should see the Installers contact details after the Installer purchase the Lead. There should be a "Reject" button beside the "Done deal" button , so that the homeowners can reject the deal if the price was not good> after rejeection the installers will get the notifications that the deal price was rejected by the homeowner > this will show up in the lead card of the installers side.

- For the purchase flow, You can mirror the bidding lead flow which is done within the lead card of the installers side. SO Installers will see purchase button and contact revealing within the lead card. For this implimentation in the writtenQuote lead card, I want you to understand the Bidding lead card. You do not need to invent anything new, we will mirror the Bidding flow endpoints but adapt everything as per the written quote.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

--------------------------------------------------------------------------------------------


Your implimentation did not meet the plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\WRITTEN-QUOTE-PURCHASE-FLOW-AUDIT.md . I want you to re-audit the entire Written Quote purchase flow again and identify the missing gaps as per the plan mentioned in the above file. then you have to fix those issues accordingly so that the Written Quote purchase flow meets the plan perfectly without any issues.

The flow you mentioned which is done , it is actually partially done. Not e2e . Flow mentioned by you after implimentation : 
Flow:
>Homeowner clicks "Done Deal" → negotiationStatus = AGREED  
>Homeowner can also click "Reject" → sends notification to installer, shows rejection banner
>Installer sees "Deal Agreed" banner with "Proceed to Payment" button
>Installer clicks payment → purchasedAt is set, lead status = PURCHASED
>Both parties see each other's contact details after purchase

### Additionally : 
- The lead card has no updates based on the user actions, so it is also quite confusing. I want the Lead card always shows updated information based on user actions. e.g the installer submitted written QUote , but the Installers lead card has no updates . If the installer open the modal by clicking on submit QUote , only then they can see update inside.

***Instructions*** I want you to re-audit the entire Written Quote purchase flow again and identify the missing gaps as per the plan mentioned in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\WRITTEN-QUOTE-PURCHASE-FLOW-AUDIT.md file. then you have to fix those issues accordingly so that the Written Quote purchase flow meets the plan perfectly without any issues.
------------------------------------------------------------------------------------------


***Written Quote UI/UX Improvements***
- When the installer clicks on "Done Deal" > It should redirect to the lead card , So that installers see the purcase option and do the purchase. 
- The QUoteBUilder Modal> The Right Column > Customer Preview Panel does not autosave the Installers generated Quote pricing and details. you need to check the autosave functionality overall in the Quotebuilder modal which is followed by the Bidding lead and also written Quote lead. 
- In the Homeowners review modal > It doesnt show the Financial Projections graphs. 

### There is a mismatch in the written Lead card : 

- The installer submitted a quote $19120 > But the Homeowners review modal , negotiation panel is showing price $18000. and I have no Idea from where it shows 18000. It should be 19120 as per the quote submitted. I want you to identify and fix this issue. 

- When the Homeowner send a counter offer price wich is 16000 > the installers lead card is still showing the first price sent from the installer > the lead card should be updated accordingly to 16000 , and mention that with "Counter Offer Price submitted - awaiting homeowner" and show lastest offer price. 

- Reject button trigger issue : After clicing on the Homeowners Written Quote Review modal's Reject Button > it opens a modal > but when I click to type reason , the modal closes automatically, might be a bug issue there. Identify and fix it . The modal should stay still untill the user cancel it by cliciking on cancel button. The users should be able to write the reason of rejection and it should be saved in the DB accordingly. 

- Even after the rejection the installer is still able to send counter offer price which even showing in the homeowners review modal . Which is alright , but there should be an endpoint. I want you to increate the limit for the counter offer price to total 2 times for the both end . So that both parties can negotiate 3 times max and then close/reject the deal. You should mention the Counter offer price limit in both end .
After the limit is over , no parties should be able to send counter offer price anymore. 

***Instructions*** I want you to implement the Written Quote UI/UX Improvements as per the above instructions. so that the Written Quote flow is more user friendly and stable without any issues. Audit deeply and understand the current flow and identify the gaps accordingly. then you have to fix those issues as per the above instructions.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote .

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

---------------------------------------------------------------------------------

- The Negotiation limit for the installers should be 4 , so that the installers can negotiate more with the homeowners and close more deals. BUt the homeowners limit remains as it is 3 times. 

- Done deal condition : either Installer or the Homeonwer clicks on "Done deal" button , e.g if the installer clicks on "Done deal" button > the homeowners should see the final price offered by the installer and a "Accept Deal" button > if the homeowner clicks on "Accept Deal" button > the deal is closed > the installer can proceed to purchase the lead. same goes for the homeowners side as well. if the homeowner clicks on "Done deal" button > the installers should see the final price offered by the homeowner and a "Accept Deal" button > if the installer clicks on "Accept Deal" button > the deal is closed > the installer can proceed to purchase the lead. 
There should be Accept and ALso reject button beside the "Done deal" button in both end. 
- After clicking on "Done deal" button , the negotiation panel should be disabled for both end. so that no parties can send counter offer price anymore.

- Always show the latest counter offer price in the Negotiation panel So that the both end users can see the latest counter offer price clearly without any confusion.

### Homeonwers Lead card enhancement :
 I want the Homeowners written Quote lead card to be more informative. so that the homeowners can see the latest status of the written quote negotiation easily from the lead card itself without opening the modal. Now there is no such update shown, All the updates can be seen while opening the review modal. but I want all the updates shows on the Lead card just as like the installers lead card do.

***Instructions*** I want you to audit the Written Quote negotiation flow and implement the improvements as per the above instructions. so that the Written Quote negotiation flow is more user friendly and stable without any issues. Audit deeply and understand the current flow and identify the gaps accordingly. then you have to fix those issues as per the above instructions.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote .

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

-----------------------------------------------------------------------------------------------

There is  a mismatch between 2 modals from both side. The installers side has the issue. I have generated a quote price was 5200 > Homeonwer countered 4000 > Aftert that I see Installer: Initial offer submitted
$8,000
23 Dec 2025, 06:48 pm > I have no idea how this 8000 came and from where. 

- You must check this issue deeply and check all the calcualtion logics , also negotiaton flow and its logics . Audit both the modal to identify the missmathh. check the screenshot for better Idea. Audit the frontend and backend both deeply and identify and fix it accordingly. 

--------------------------------------------------------------------------------------------------

The saving chart is not showing up in the Homeonwers Review modal > Financial projection section. Identify the root cause. it should show the chart as per the Quote submitted by the installer. Audit deeply and fix it accordingly.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 --------------------------------------------------------------------------------------

 ***Neogitation panel enhancement*** 
 - The Installers negotiation panel always gets the counter price update instantly without any issues and with out refreshing the modal/page , But the Homeowners negotiation panel does not get the counter price update instantly without refreshing the modal/page. I want you to fix this issue in the Homeowners negotiation panel so that it always gets the counter price update instantly without any issues and with out refreshing the modal/page. Audit deeply and fix it accordingly.

 - I want to add a online/Offline status indicator in the negotiation panel in both end (installer and homeowner) so that both parties can see each other's online/offline status easily while negotiation. e.g a green dot for online and grey dot for offline beside the username in the negotiation panel. Audit deeply and implement it accordingly.
 The online status will only show when the Both parties are in the respective modals e.g if the installer is in the Quote builder modal and the homeowner is in the review modal at the same time then only the online status will show. if they are not in the respective modals at the same time then it will show offline status.

***Counter Limit Control***
 - I want to add a Counter and this counter will be active when the Installer submit the quote and the initial negotiation timeline should be 3 days from the date of quote submission. e.g if the installer submitted the quote on 1st Jan 2024 , then the homeowner will have time till 4th Jan 2024 to respond with a counter offer price. After that the counter offer option will be disabled automatically. same goes for the installer as well. The overall negotiation timeline is 3 days, After 3 days whichs is 72 hours - the entire negotiation will be closed automatically if the both end could not take any decision done deal/reject. The goal is to limit both parties within a negotiation timeframe, so that the users respond within a timeframe. Audit deeply and implement it accordingly. 

 - After the Timeframe is over e.g 3 days/72 hours , if there is no action taken from both end , then the negotiation will be closed automatically and the lead status will be changed to "Negotiation expired" and both parties will get email notifications regarding this. Audit deeply and implement it accordingly. 

 - But there will be an option for both parties to extend the negotiation timeframe by 2 days once. e.g if the homeowner could not respond within 3 days , then they can request for an extension of 2 days once. same goes for the installer as well. After the extension is over , there will be no option for further extension. Audit deeply and implement it accordingly. 

 - The last option is to request admin to increase the negotiation timeframe if both parties could not take any decision within the given timeframe including extension. e.g if both parties could not take any decision within 5 days (3 days + 2 days extension) , then they can request admin to increase the negotiation timeframe. Admin will get email notifications regarding this request and admin can increase the negotiation timeframe as per the business requirement. Audit deeply and implement it accordingly.

 - The admin will be able to control the negotiation timeframe from the admin panel. e.g admin can set the initial negotiation timeframe, extension timeframe etc as per the business requirement. I want you to create a modal for that and add a section in the Admin Lead Management Modal for that purpose. The section will be the control system of the Negotiation limits for both end. 

 ***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote .
### Master plan :
  I want you to create a master plan document in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\ folder regarding all these new enhancements and features added in the Written Quote negotiation panel as per the above instructions. The master plan should contain all the new features and enhancements added in the Written Quote negotiation panel along with the detailed description of each feature and enhancement. This master plan will be used for future reference and for further improvements in the Written Quote negotiation panel. It is the Roadmap and the SOT for this feature. 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 

---------------------------------------------------------------------


***negotiation panel UI enhancement***

- I want the both end modals Deadline shows a timer (Just copy the countdown timer used in lead cards) instead of static date and time. So that both parties can see the remaining time easily without any confusion. Audit deeply and implement it accordingly.

***Admin Dashboard > lead details modal > Negotiation window enhancement***
I want the negotiation window shows all the negotiations from the both end installers and homeowners including all the counter prices , & countdown timer as well. 
This section is the e2e monitoring of the negotiation panel for the admin purpose. So that the admin can monitor the entire negotiation process easily from the lead details modal itself without any issues. Audit deeply and implement it accordingly.

***Lead Management modal UI enhancement*** 

I want this modal container width shows 100% wide with 2 colum : left 60% right 40% . Keep all the sections in the left only Negotiation window move to the right column. Audit and understand the existing UI first. Make sure to make it responsive . 

 ***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote .

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting.

---------------------------------------------------------------------------


Now there are 2 countdown timers in the Written Quote leads . And it is across all 3 users (Installer, Homeowner, Admin) . One is in the lead card and another one is in the negotiation panel inside the respective modals.

- You need to focus on the lead card countdown timer and do not touch the negotiation panel countdown timer as it is working perfectly. 
- The initial lead card timer is set by the admin while approved and assigned the lead > the installer and Homeonwers end shows the same timer countdown in their lead cards.
- What I want is , after the installer submitted the quote > the lead card timer should reset and start countdown from the initial negotiation timeframe set by the admin e.g 3 days/72 hours . same goes for the homeowners end as well. After the quote submission both parties should see the reseted countdown timer in their respective lead cards. Audit deeply and implement it accordingly.
- The countdown timer should have an endpoint as well. e.g if the timer reaches to 0 , then the negotiation will be closed automatically and the lead status will be changed to "Negotiation expired" and both parties will get email notifications regarding this. Audit deeply and implement it accordingly. This should show the stauts on the lead card too. 
- The admin should see the countdown timer reseted in the lead details modal as well after the installer submitted the quote. Audit deeply and implement it accordingly. 
- I want the countdown timer syncs perfectly across all 3 users (Installer, Homeowner, Admin) e.g if the installer sees 48 hours remaining in the lead card countdown timer , then the homeowner and admin should see the same 48 hours remaining in their respective lead cards/countdown timers as well. Audit deeply and implement it accordingly.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote .

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting.

------------------------------------------------------------------------------------------

After submitting the Written Quote , The Lead card countdown timer became 7 days from 30 days - I want you to fix this issue so that the lead card countdown timer shows the correct negotiation timeframe set by the admin e.g 3 days/72 hours after the quote submission. Audit deeply and implement it accordingly. this should be synced across all 3 users (Installer, Homeowner, Admin) as well.

- IT should even adapt the negotiation extension timeframe as well. e.g if the admin set the negotiation extension timeframe to 2 days , then after the homeowner requested for extension and admin approved it > the lead card countdown timer should adapt to that and show the extended timeframe accordingly across all 3 users (Installer, Homeowner, Admin) as well. Audit deeply and implement it accordingly.

- Check the screenshots for the mismatch and better understanding. 

***Instructions*** I want you to fix the lead card countdown timer issues as per the above instructions. so that the lead card countdown timer shows the correct negotiation timeframe set by the admin e.g 3 days/72 hours after the quote submission. Audit deeply and implement it accordingly. this should be synced across all 3 users (Installer, Homeowner, Admin) as well. Check back your recent implimentation and idenitfy the issues/gaps as well.

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 -----------------------------------------------------------------------------

- Deal reject issue : When the Homeowner reject the deal by clicking on the "Reject" button in the review modal > it opens a modal to write the reason > after writing the reason and clicking on "Submit" button > it should show the message in the Admin lead details modal negotiation window as "Deal rejected by Homeowner: [reason]" along with the date and time . but it is not showing anything in the admin lead details modal negotiation window. I want you to fix this issue accordingly. Audit deeply and implement it accordingly.

 - After the rejection the countdown timer still Running in the Lead cards of all ends (Installer, Homeowner, Admin) . I want you to fix this issue so that after the rejection the countdown timer should stop and show "Negotiation closed - Deal rejected by [party]" in the lead cards of all ends (Installer, Homeowner, Admin) . Audit deeply and implement it accordingly.

 ***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md


 -----------------------------------------------------------------------------

 ***negotiation final price issue***
There is a UX issues and also a confusion regarding the final price shown in the negotiation panel after clicking on "Done deal" button from either end (Installer/Homeowner) .

What is happenning right now  : check the screenshot first on both side. The last price was offered $5000 from homeowners end > The insaller clicked on "Done deal" button > then the homeowners negotiation panel is showing $12000 as final price which is wrong and confusing. It should show $5000 as final price as it was the last offered price from the homeowners end. 
 
 - And It should always show the last offered price both end differently. E.g the Installers last price was offerd for 10000 , so installers will see 10000 was their last price offered, same Homeowners will see their price offered accordingly. e.g if the homeowners last price was offerd for 5000 , so homeowners will see 5000 was their last price offered in their negotiaton panel. But Upon the Done deal and accepted deal , both parties should see the final agreed price which is the last offered price from either end. Audit deeply and implement it accordingly. 

 - Any end clicks the done deal button > before proceed ing further it should show a confirmation modal e.g "Are you sure you want to proceed with the final price of $[last offered price] ?" with Confirm and Cancel button. Audit deeply and implement it accordingly. This should be on both ends (Installer/Homeowner) .

 ***Accept deal flow enhancement***
- I need an enhancement in the Negotiation panel of the both ends (Installer/Homeowner) so that after clicking on "Done deal" button from either end (Installer/Homeowner) > the negotiation panel should show the last offered price as the final price clearly without any confusion. Audit deeply and implement it accordingly. You can highlight the final figure with some animation and bold font so that it is more visible to the users to notice it easily.
- After the use clicks on accept deal button > the negotiation panel should show "Deal accepted by [party] at [final price]" along with the date and time . Audit deeply and implement it accordingly.
- After the deal is accepted by either end (Installer/Homeowner) > the lead status should be changed to "Deal Accepted" in the lead cards of all ends (Installer, Homeowner, Admin) . Audit deeply and implement it accordingly.

 ***Installers reject end point issue***
- I have rejected From installers side > but there was no such changes seen , that means there is no end point for the installers to reject the deal. I want you to create an end point for the installers to reject the deal as well just like the homeowners reject end point. So that both parties can reject the deal if they are not interested to proceed further. Audit deeply and implement it accordingly. check back your recent implimentations. 

***Instructions*** Make sure that you fix theses 3 issues as per the above instructions. so that the negotiation final price issue is fixed properly without any confusion. also implement the accept deal flow enhancement and also create an end point for the installers to reject the deal as well just like the homeowners reject end point. Audit deeply and implement it accordingly. check back your recent implimentations. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote .

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting.

-------------------------------------------------------------------
***Written Quote submission flow enhancement***
- When the installers clicks on the submit written Quote > before submitting I want it to open the Preview modal (Which is already built and now it open when clicked on preview button on the Written Quote builder modal) > So that the installers can preview the entire quote before submitting it. Audit deeply and implement it accordingly. So, The Quote will be submitted when the installers clicks on the Preview Modal > Confirm and Submit button.
***Written Quote negotiation flow logic enhancement***
- There is a negotiation done deal logic needs to update. Now the Homewners offered a price and homeowner is able to done the deal on their price > but it should be  : the Installer will have the only options to agree and click on done deal , not the homeowner. The homeowner can only click on done deal on the installers offer price . e.g if the homeowner offered a price of $5000 > then the installer can either accept it and click on done deal or send a counter offer price. The homeowner cannot click on done deal on their own offered price. Audit deeply and implement it accordingly. Same goes the the installers side, e.g if the installer offered a price of $10000 > then the homeowner can either accept it and click on done deal or send a counter offer price. The installer cannot click on done deal on their own offered price. Audit deeply and implement it accordingly.
***Written Quote builder - Right column - Lead Techincal detals section Enhancement***
After the payment is done the homeonwer contact still remain msked now. It should be unmasked after the payment is done. I want you to fix this issue accordingly. Audit deeply and implement it accordingly.

***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

-----------------------------------------------------------------------------------

***Installers Reject Quote failed issues*** 
The installers are failing to reject the QUote from their side. when they click on the reject button in the Quote builder modal > it opens a modal to write the reason > after writing the reason and clicking on "Submit" button > it shows an error message "Failed to reject the quote." . Check the screenshot for better understanding. You have implimented it recently , so check back the conversation regarding this issue and also checkback your implimentations. I want you to identify the root cause of this issue and fix it accordingly so that the installers can reject the quote successfully from their side without any issues. Audit deeply and implement it accordingly.

***Reject Quote Modal Backend development***
The both end has this modal while they do the rejection. I want you to check the backend part of this modal and make sure that the reason written by the users are saved in the DB accordingly along with the date and time of rejection. Audit deeply and implement it accordingly. And I want these message to show on the Admin Dashboard > Lead Management Modal > under negotiation windows section. whoever rejects, The Admin will be able to know the reason and see the message. Now the writing reason is optional , I want you to make it mandatory based on a conditon. I want you to enhace this modal with checkbox selection with our preset Questions .e.g The Price is too high , The timeline is not suitable , Found a better offer elsewhere , Other (with text area to write the reason) . The users must select at least one checkbox or write in the text area to proceed with the rejection. Users should be able to select even multiple checkboxes also write in the text area as well. You should set the questions on both end accordingly. think 5 relevant questions for each side and set them accordingly. Audit deeply and implement it accordingly.

***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

-----------------------------------------------------------------------------------   

***Notification message and email template Enhancement***
- Currently the homeonwers side has inappropriate notification messages which I mentioed below. And also shared the screenshot. The Homeonwers should never see the Purchase/lead this type of words . 

***Guidelines and readme.md Update***
I need you to create a guideline for the notification and email settings , message template settings etc Which is industry standard and also Follow my instructions for this project. 

### my instructions : The homeonwer side should never see any message that is related to purchse , Lead, etc which is inappropriate. The Homeowners should never feel like we are selling the leads to Installers. The notification and email templates always should avoid those kinds of words where the Homeonwers will never notice that the installers are purchasing. 

### Industry Standard : Crate the notification and email guidelines that any AI model will follow while building the notifications and emails which is industry standard. 

***Instructions***

create the folder/file within this folder D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT in an appropriate folder or separate. And update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md accordingly . SO that Any AI model will follow accordingly. Update the readme.md but do not ovveride anything existing. 

FINAL PROMPT : 

Below is your **raw prompt transformed into a STRICT, EXECUTION-GRADE, PRODUCTION-SAFE AI coding + documentation prompt**, exactly following your required structure and **without adding or removing intent**.

This is written for a **senior full-stack engineer AI auditing an existing SaaS codebase and documentation system**.

---

# EXECUTION-GRADE AI PROMPT

**Notification Message & Email Template Enhancement + Guidelines Definition**

---

## 1. ROLE

You are a **Senior Full-Stack SaaS Engineer AI** auditing and standardizing the **Notification and Email Messaging System** of an **existing production Solar Lead Generation SaaS**.

Your responsibility:

* Audit existing notification and email messages
* Correct inappropriate homeowner-facing language
* Define **non-negotiable messaging standards**
* Update **guidelines documentation** so future AI and developers cannot violate these rules

You must **preserve all existing documentation**, extending it safely without overwriting.

---

## 2. PROJECT CONTEXT

* Product: Solar Lead Generation SaaS Platform
* Affected Area:

  * Notification message copy
  * Email template copy
  * Messaging guidelines for AI-assisted development
* Users involved:

  * Homeowners
  * Installers
  * Admin (indirectly)
* System status:

  * Notifications and emails already exist
  * Some homeowner-side messages contain **inappropriate commercial language**

This task focuses on **language, policy, and standards**, not feature logic.

---

## 3. EXISTING STATE (What Already Works)

Confirmed from prompt:

* Homeowners receive notifications and emails
* Messaging system is active and functional
* Some notifications currently include terms such as:

  * “Purchase”
  * “Lead”
  * Installer-centric commercial language
* Guidelines & SOT folder and README.md already exist

❗ Existing documentation must remain intact.

---

## 4. REQUIRED CHANGES

### A. Homeowner-Facing Message Correction (Audit Level)

* Audit **all homeowner-facing notification messages and email templates**
* Identify:

  * Any use of words related to:

    * Purchase
    * Lead
    * Payment
    * Installer buying access
* Mark these as **policy violations**

No implementation of message replacement yet unless explicitly instructed later.

---

### B. New Messaging Guidelines Creation

You must create **formal, enforceable guidelines** that define:

#### Homeowner Messaging Rules (Mandatory)

* Homeowners must **never** see:

  * “Lead”
  * “Purchase”
  * “Payment”
  * “Installer bought”
  * Any language implying data resale
* Messaging tone must:

  * Feel service-oriented
  * Emphasize “connections”, “matches”, “responses”, “updates”
  * Maintain homeowner trust

---

### C. Industry-Standard Notification & Email Guidelines

Create a **vendor-neutral, industry-standard guideline** that:

* Any AI model or developer must follow
* Covers:

  * Message tone
  * Role-based wording
  * Event-driven clarity
  * Privacy-safe language
  * User-centric framing

This guideline must be **generic enough to scale**, yet **strict enough to prevent violations**.

---

## 5. BUSINESS RULES & PERMISSIONS

* Messaging rules are **role-dependent**
* Homeowner rules are **non-negotiable**
* Installers may see commercial terms
* Admin may see operational terms
* No cross-role leakage of language is allowed

Any AI generating messages must:

* Check target user role
* Select wording accordingly

---

## 6. TECHNICAL CONSTRAINTS

Strict constraints:

* ❌ Do not modify application code
* ❌ Do not rename or delete existing documentation
* ❌ Do not override README.md content
* ❌ Do not restructure existing folders
* ✅ Only **add new files/folders**
* ✅ Only **append** to README.md

---

## 7. AUDIT INSTRUCTIONS

Before writing guidelines:

1. Review current notification & email wording (conceptually)
2. Identify language categories:

   * Commercial
   * System-driven
   * User-friendly
3. Explicitly define **forbidden vs allowed terminology** for homeowners

No guessing. No assumptions.

---

## 8. IMPLEMENTATION RULES (Documentation Only)

You must:

### A. Create New Guideline Files

Create appropriate folder/file(s) inside:

```
D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\
```

Examples (choose appropriately):

* `notification-messaging-guidelines.md`
* `email-template-standards.md`
* or a subfolder like:

  ```
  Messaging-Standards/
  ```

---

### B. Update README.md (Append Only)

Update:

```
D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md
```

Rules:

* Do NOT overwrite existing content
* Add a **new clearly titled section**
* Reference the new guideline files
* State that **all AI models must comply**

---

## 9. VALIDATION / SUCCESS CRITERIA

This task is complete only if:

* ✅ A clear, enforceable homeowner messaging policy exists
* ✅ Forbidden terms are explicitly documented
* ✅ Industry-standard messaging principles are defined
* ✅ New guideline files are created (not replacing existing)
* ✅ README.md is extended safely
* ✅ Any future AI can follow these rules without interpretation

Failure on any point = incomplete.

-------------------------------------------------------------------------------------

- In the notifications I need you to enhance button texts . e.g check the shared screenshots : Mark as read is fine , but "Review Bid" is not appropriate for homeowners while it is a written quote action. There are better alternatives like "View Quote" , "View Offer" etc.

- And these buttons are not useful e.g If I click on View button in the notification > it does not redirect or open the respective modal/page. I want you to fix this issue accordingly. Audit deeply and implement it accordingly. 

- Check the entire notification and email system and compare vs the Industry Standards based on our guidelines . Identify the missing gaps on our implimentations and prepare a plan to impliment these were not implimented yet. 

***Instructions***
Enhance the button texts in the notifications as per the above instructions. so that the button texts are more user friendly and appropriate for homeowners. Also make sure that the buttons are functional and redirect/open the respective modal/page accordingly without any issues. Audit deeply and implement it accordingly. I want you to identify these issues for the Installers and Admin sides too as well. The entire notification system should be user friendly and functional without any issues. All of your referenced links and buttons should be functional and working perfectly without any issues. 

***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md


 ----------------------------------------------------------------------------------

 ***Installers Dashboard - UX and UI Enhancement***
 - The Installers lead is not moving the Rejected leads to anywhere from the lead feed. The lead feed is the place where the installers see all the leads assigned to them. The leads should stay on the lead feed while negotiating, Under bidding. So that the rejected leads should move to a separate section/tab called "Rejected Leads" in the Installers dashboard lead feed. Audit deeply and implement it accordingly.

- I want you to enhance the LeadFeed section in the Installers dashboard with multiple tabs for better lead management and organization. currently the lead moving to purchased leads page under 3 different tabs (Written Quote leads, Call/Visit leads, Bidding leads) after purchasing. But This is only for the purchased leads. I want you to improve the UX. Evertyhing should be under the LeadFeed section only with multiple tabs for better organization and management. You can create tabs : Market Place, QUote Submitted , Rejected Leads, Purchased Leads etc. Audit deeply the current system and implement it accordingly.

- Also I need Idea to enhace the UI UX Of the Leadfeed page. I will not need the Purchased leads page anymore if everything is under the LeadFeed section only with multiple tabs for better organization and management. come up with enhancement Ideas.  Audit deeply and implement it accordingly.

- Also check the filters and enhance it accordingly for better lead management and organization. Audit deeply and implement it accordingly.

- Also check the Screenshots for the cards in the leadfeed which has mock data. I want you to enhance the UI of these cards with real analytics for better user experience and user friendly. You can add more cards if needed. Repalce all the existing mock data on the cards with relevant real data analytics. Audit deeply and implement it accordingly.

***Instructions*** your job is to understand what I mentioned above and perform the necessaary audits and comeup with the implimentation plan accordingly.  in that plan on the top write a summary explaing what idea you have generated + my requirements of enhancement and what we are going to impliment. After that will confirm you to start the implimentation phase.

***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 ### Implimenation Plan : 
 prepare the plan here D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote

 FINAL PROMPT :

 

**Installers Dashboard — LeadFeed UX & UI Enhancement (Audit → Plan Only)**

---

## 1. ROLE

You are a **Senior Full-Stack SaaS Engineer AI** assigned to **audit and redesign the UX flow (not visual redesign yet)** of the **Installers Dashboard → LeadFeed section** in an **existing production Solar Lead Generation SaaS**.

Your responsibility is to:

* Audit the current LeadFeed behavior deeply
* Identify broken or missing state transitions
* Propose a **clear implementation plan**
* **Do NOT implement yet**

You must **read and follow all internal project guidelines** before producing any output.

---

## 2. PROJECT CONTEXT

* Product: Solar Lead Generation SaaS
* Dashboard: **Installer Dashboard**
* Feature Area: **LeadFeed (Primary lead management area for installers)**

Current understanding:

* Installers receive leads via LeadFeed
* Purchased leads currently move out of LeadFeed into a separate Purchased Leads page
* Lead types include:

  * Written Quote leads
  * Call/Visit leads
  * Bidding leads

This task is focused on **UX structure, state flow, and data correctness**, not cosmetic UI only.

---

## 3. EXISTING STATE (What Already Works)

Based strictly on the provided prompt (to be verified in audit):

* LeadFeed exists and shows assigned leads
* Leads can be:

  * Negotiated
  * Under bidding
  * Purchased
* Purchased leads are moved to a **separate Purchased Leads page**
* Purchased Leads page has **three tabs by lead type**
* LeadFeed cards currently display **mock data**
* Filters exist but are limited or insufficient

Known issue (must be confirmed in code):

* **Rejected leads do not move anywhere**
* Rejected leads remain stuck in LeadFeed or disappear incorrectly

❗ No assumption beyond this list is allowed.

---

## 4. REQUIRED CHANGES (Converted to Explicit Behaviors)

### A. Rejected Lead State Handling

* When an installer **rejects a lead**:

  * The lead must **leave the active LeadFeed**
  * The lead must appear under a **“Rejected Leads” tab**
* Rejected leads must:

  * Remain visible for historical reference
  * Be isolated from active negotiation flows

---

### B. LeadFeed UX Restructure (Single Source of Truth)

* The **LeadFeed section must become the only lead management area**
* The **Purchased Leads page will no longer be needed**
* All lead states must be accessible via **tabs inside LeadFeed**

Proposed tabs (to be validated in audit):

* Marketplace (new / assigned leads)
* Quote Submitted
* Negotiation / Under Bidding
* Purchased Leads
* Rejected Leads

❗ This is a UX restructuring, not a deletion of data.

---

### C. Lead Lifecycle Visibility

* Leads must remain in LeadFeed while:

  * Under bidding
  * Negotiating
* Leads move tabs based on **state transitions**, not page navigation
* No lead should “disappear” without a visible state

---

### D. LeadFeed UI Enhancement (Analytics-Driven)

* All mock data on LeadFeed cards must be:

  * Identified
  * Replaced with **real, meaningful analytics**
* Cards may be:

  * Enhanced
  * Added
  * Reorganized
* Data must be:

  * Actionable
  * Installer-relevant
  * Derived from real system values

---

### E. Filters Enhancement

* Existing filters must be audited
* Filters must support:

  * Lead state
  * Lead type
  * Timeline / urgency
  * Value or potential (if available)
* Filters must work **within tabs**, not globally breaking context

---

## 5. BUSINESS RULES & PERMISSIONS

* Only installers see the LeadFeed
* Installers can:

  * View all assigned leads
  * Reject leads
  * Purchase leads
  * Negotiate leads
* Installers cannot:

  * Modify lead states retroactively
  * Access leads outside their assignment

State transitions must respect:

* Lead ownership
* Payment state
* Quote submission state

---

## 6. TECHNICAL CONSTRAINTS

Strict rules:

* ❌ No assumptions about database schema
* ❌ No API changes unless discovered as necessary during audit
* ❌ No UI refactor during planning
* ❌ No deletion of Purchased Leads data
* ❌ No visual redesign without approval

This phase is **audit + plan only**.

---

## 7. AUDIT INSTRUCTIONS (MANDATORY)

Before proposing any plan, you must:

1. Audit:

   * LeadFeed logic
   * Lead state transitions
   * Purchased Leads page logic
2. Identify:

   * Where rejected leads currently fail
   * Why purchased leads are separated
   * Which data is mock vs real
3. Map:

   * Lead lifecycle states → UI placement
4. Identify:

   * Dependencies that block moving everything under LeadFeed

❗ No implementation before audit completion.

---

## 8. IMPLEMENTATION PLAN OUTPUT RULES

### Output Location

Prepare the **Implementation Plan** at:

```
D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote
```

### Plan Structure (Mandatory)

At the **top of the document**, include:

#### 1️⃣ Executive Summary

* Restate:

  * Your UX idea
  * User’s requirements
  * Final proposed LeadFeed structure

#### 2️⃣ Audit Findings

* Current behavior
* Broken flows
* UX pain points

#### 3️⃣ Proposed LeadFeed Tab Structure

* Tabs
* Purpose
* Lead states per tab

#### 4️⃣ Lead State Transition Table

* Action → From → To
* Visible tab change

#### 5️⃣ UI Card Enhancements (Conceptual)

* What data replaces mock data
* Why it matters to installers

#### 6️⃣ Filter Enhancements

* Existing filters
* Proposed additions
* Scope of each filter

#### 7️⃣ Risks & Dependencies

* What could break
* What must be confirmed before coding

---

## 9. VALIDATION / SUCCESS CRITERIA

This phase is successful only if:

* ✅ Rejected leads have a clear destination
* ✅ LeadFeed becomes the single lead management area
* ✅ No lead disappears silently
* ✅ UX improvements are logical, not cosmetic
* ✅ Implementation plan is clear enough to code without re-interpretation

---

## ASSUMPTIONS

None allowed.
If data, states, or flows are unclear → **explicitly list them as unknowns**.


---------------------------------------------------------------------------------------

I want you to Prepare the task plan as per the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote\INSTALLER-LEADFEED-UX-AUDIT-PLAN-2025-12-27.md findings. All my answers is witin (### MY answers : ###) in this Audit file, check for that. After that Start the implimentation phase accordingly based on the plan you prepared.

***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 ----------------------------------------------------------------------------------

 Here is the plan to build the Blog Feature D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\BLOG_STRAPI\PLAN . read the Idea carefully and prepare all the necessary documents to D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\BLOG_STRAPI\SOT folder as per the 6 phase framework. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared. 

 ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 ------------------------------------------------------------------------------------

 I am confused about your implimentations. I did not see that you have created any implimentation plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\BLOG_STRAPI\SOT and also the tasks.md file update based on the implimentation plan in the same directory D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\BLOG_STRAPI\SOT . 

 - Think I have missed to mention these Instructions in the Guidelines . So , You need to update the relevant files and the index.md D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file as well in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT . Lets enhace the Workflow, becuase now you have created the Feature-Sot.md and the index.md in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\BLOG_STRAPI\SOT folder which is fine and as per my instruction . But I feel there is lackings of further implimentation and Execution plan in the tasks.md file in the same directory D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\BLOG_STRAPI\SOT . I want both files to create there so that any AI will not lost the contexts. Now the planning base is strong but not the executional level. Even I have no Idea what are you implimenting and baesd on what. re-think and update and also let me know further if you have more idea to improve this workflow. 

 ---------------------------------------------------------------------------------

 I want you to follow this template for finalizing the tasks.md D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\.specify\templates\tasks-template.md and built the tasks.md accordingly. I also want you to update the global index.md and also all the necessary files in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file as well to reflect these changes. For any tasks.md the AI must follow the template that I mentioned. 

 ---------------------------------------------------------------------------------

 here is my plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\PLAN\mainplan.md . I want you to  prepare all the necessary documents to D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\SOT folder as per the 6 phase framework. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

 
  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 ----------------------------------------------------------------------------------------

 here is my plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\PLAN\ChatGPT.md . I want you to audit this plan deeply and prepare all the necessary documents to D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\SOT folder as per the 6 phase framework. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

 --------------------------------------------------------------------------------------

 - I liked the new way of explaining the frontend-plan.md file in the SOT folder. So you need to make sure that I always get this kind of explanation in the frontend-plan.md file in the SOT folder for any feature that is being built. Also add instructions that , it should explain also in benglli language as well for better understanding.  And also update the relevant files and indexes and also the global index if needed. 

 - I want you to audit back the UI of the guest's Blog and create a detailed current state audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\SOT folder . And checkback the entire SOT folder if anything is missing as per the 6 phase framework which has no existing UI conflicts . The goal is to make sure that any AI or human can restart the session from this SOT folder without any context loss and also make sure to work on the existing UI without any conflicts. I want you to update the relevant files and indexes and also the global index as well by adding this audit report in the SOT along with other documents. 

 - whatever the plan is, the AI should always audit the existing thing clearly and then make all the doucments based on the Audit report , so that the new plans matches with the existing builts. THe AI must follow this rule strictly. Update the guidelines and index.md accordingly to reflect these changes.

--------------------------------------------------------------------------------------

As we have update the documentation process , I want you to start over again with the documentation as per the updated workflow. here is the plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\PLAN\mainplan.md . I want you to audit this plan deeply and prepare all the necessary documents to D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\SOT folder as per the updated 6 phase framework. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md
--------------------------------------------------------------------------------------

***blog Feature testing Result***

### Issues : 
1. check the screenshot, the blog post is not creating.
2. The UI layout structure did not follow the Layout standard and in result it looks odd and did not matched with other page layouts
3. It was not routed to the Admin Dashboard. The admin Sidebar menu should Have a collapsible "Blog" section with sub-menu items for "All Posts," "Create Post," "Categories," and "Tags." , ANd there is not such pagers were created in the Admin Dashboard. 
4. The overall blog feature Admin UI is not Professional. 
5. The slug should be auto generated from the title field.
6. The blog post content editor should support basic text formatting options like bold, italics, THe text editor is just talking plain texts. there is no options for H1, H2 , h3 etc. 
7. The Cover Image field has option the add URL , not upload options.

### My Frustrations :
I wanted to build a modern blog feature e2e , which is wordpress like CMS. But after the planning and implimentations, I am not happy with the outcome. I need more enhacement of the implimentations

### Instructions: 
Audit the entire emplimentation and come up with further enhacement plan/ideas to fix the above issues and frustrations. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.
I want the next plan to be made in this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\2nd Phase\Plan folder. The plan is for further enhancement ,not fixing issues that I mentioned. 

- The fixing plan and audit should be separate from the further enhancement plan.

  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md


 -------------------------------------------------------------------------------------

 i have built a prototype blog CMS UI with the google ai studio . I want to mirror all the pages with all the fields and options and functions but it must be adapted with my theme system and saas.  here is the prototype D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\luminacms-admin . I want you to deeply analyze this prototype and prepare a detailed plan in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\2nd Phase\Plan folder . After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.
The pages I want : Posts , Comments , Categories & tags , Media . 

As there is no backend was planned and this is only UI UX , you need to prepare the backend plan as well along with the frontend plan in the same document. Audit deeply and prepare it accordingly. 

### Additionally : as we have implimented partial blog UI and Backend, Is there any option to modify the UI easily ? and drop the tables and recreate the backend ? will it be messy? or should we start fresh from the fresh branch where the blog was not implimented? also need your decision. the existings will be no needed at all in this case, I think refactoring might take more time. or you decide and let me know. 


  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 --------------------------------------------------------------------------------------

I will go as per your recommendation Refactor. here is the plan that you have generated D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\2nd Phase\Plan\LUMINACMS-PROTOTYPE-MIRROR-PLAN.md . I want you to prepare all the necessary documents to D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Blog Manual\2nd Phase\SOT folder as per the 6 phase framework. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 ---------------------------------------------------------------------


 This is my Initial Plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\CHatGPT.md . My Goal is to build the UI UX with the Google AI studio prototype e2e flow with e2e modals and all the pages regarding this feature. You have to prepare the entire frontend plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT. This plan should be very detailed and clear so that any AI or human can start the frontend development without any context loss. 

 ### Your Prompting Instructions : 

 As the Google AI studio has limitation of building complex modals and pages, you need to break down the entire flow into multiple pages and modals accordingly so that any AI or human can understand the flow easily. and also make a sequal of building the UI UX e.g First build the AI news Engine Page With all the sections and filters , then build the modals one by one accordingly. Each should be very detailed to maintain sequal e.g when clicked on "View News Details" button in the news engine page , what should happen next , which modal should open with what fields and options etc. This Is the End to end flow that I want you to prepare in the frontend plan. each break downs should have a sync to the next step. 



 ***Strickt Rules*** 

 While writing the plan and for the AI prompts , you must follow the prompting guidelines from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\Prompts\AI PROMPTING\AI Prompting Guideline.md

 --------------------------------------------------------------------------------------------------------------------------------

 I need you to build another frontend plan for the public Pages of the News Engine feature e.g The Guest News Page where the News posts will be displayed to the public users. The plan must match the Admin Dashboard News Engine feature UI UX so that the news posts created from the Admin Dashboard News Engine feature will be displayed properly in the Guest News Page. 

 Follow the same instructions D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\README.md as I mentioned in the previous prompt for building the frontend plan. The plan should be very detailed and clear so that any AI or human can start the frontend development without any context loss. And create the plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT folder as well.
  ***Strickt Rules***
 For the Alignement and sycn , you must read back the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE for better understanding.  

  ***Strickt Rules***
  -----------------------------------------------------------------------------------------


  I have built the Google AI Studio UI UX prototype for the News Engine feature as per your promots for admin and public frontend from the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT .
  You have to audit the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\GoogleAIStudio UI UX and validate with the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT and Identify what is missing there as per the admin and public frontend plans that you have prepared. 

  After that , prepare another frontend enhancement plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT by following the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\PROMPTS\AI PROMPTING guideliens and template for next phase UI UX enhancement/ missing implimentation. 

  ### Audit Instructions : 
  1. Check the Google AI Studio UI UX deeply and compare with the frontend plans that you have prepared.
  2. Identify what is missing there as per the admin and public frontend plans that you have prepared.
  3. Identify any missing endpoints of UI UX flow. 
  
  ### In the end must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\README.md file accordingly to reflect these changes. This is the main SOT for this feature.

  -----------------------------------------------------------------------------------------

  Here is the updated version D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\GoogleAIStudio UI UX\ai-news-engine-admin- V2 that built with google ai studio. Your job is to validate the UI is accurately done as per your plan. Audit deeply and prepare another fronend enhencement plan if you found anything missing or not accurate as per your plan. 

  ### My personal UI change requirements to mention in your further plan :
  1. In the Admin Setting page , I just only need the NewsEngine related UI . NO need any personal profile settings there and also no need Security Two-factor Authentication section as well.
  2. I want all the pages Shows under the "News Engine" Page with tabs instead of separate pages in the sidebar menu. 

  ***Strickt Rules***
  For the Alignement and sycn , you must read back the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\README.md and prepare the plan accordingly. 

  ### must update : 
  After done all , You must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\README.md file accordingly to reflect these changes. This is the main SOT for this feature.

  ------------------------------------------------------------------------------------------

   Here is the updated version D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\GoogleAIStudio UI UX\ai-news-engine-admin- V6 that built with google ai studio. Your job is to validate the UI is accurately done as per your plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\frontend-enhancement-plan-prototype-alignment-V5.md Audit deeply and prepare another fronend enhencement plan if you found anything missing or not accurate as per your plan. 
    - you need to make sure the frontend is completely have the e2e flow UI UX and 100% ready to prepare the backend plan after your confirmation.

  ***Strickt Rules***
  For the Alignement and sycn , you must read back the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\README.md and prepare the plan accordingly. Do not prepare any further plan if everything is accurate as per your plan. If everything is accurate , just update the README.md file accordingly to reflect that the UI is accurately done as per the plan. And create one single Audit file regarding the frontend e2e which is vastly accurate in order to prepare Backend plan further. No need to prepare backend plan yet. 
  ### Must follow : 
  Follow the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\PROMPTS\AI PROMPTING  guideliens and template for next phase UI UX enhancement/ missing implimentation.

  ### must update : 
  After done all , You must update the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOCS\NEWS ENGINE\SOT\README.md file accordingly to reflect these changes. This is the main SOT for this feature.

  -----------------------------------------------------------------


My Recent workflow was followed by this D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md . 

- In order to improve the workflow further, I have tested a new way of buidling the Frontend UI UX first with Google AI Studio prototype and then building the frontend plan based on that prototype. I felt this way is more accurate and easy to follow as the entire UI UX flow is already built with the prototype. 
- THis is the new workflow that I want you to follow from now on for any frontend feature building : D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT\README.md

As It was a test but I have already finalized the Frontend UI UX with the Google AI Studio prototype for the News Engine feature, But In this built I did not follow the existing workflow that follows 6 phase framework strictly. 

- Now I want to add this workflow into the existing D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file as well for better understanding of the entire process. 

***Workflow Enhancement Instructions :*** 

### What I do not need and what to remove : 
- I do not need the Tasks.md file to create in the SOT folder for any frontend feature that is being built with this new workflow. So you need to remove that instruction from the guidelines and relevant files.

### What I need to add : 

Add these into the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file by creating new folder/files into the Guidelines folder.
- D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\AI Prompting Guideline.md
- D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\Template_AIfrontend.md

*** The Goal is to prepare the Frontend plan in the "Frontend UI UX Prompts" folder based on the Google AI Studio prototype that is being built for any frontend feature. based on the  that you will create in the initial phase of the SOT folder for that feature. 

- The Template_AIfrontend.md file is the main template that you need to follow strictly while building the frontend plan in the SOT folder for any frontend feature. 

*** Folderizing : I want you to follow this folderization D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE . You have to create all the folders and the files which is instructed in your readme.md . 

Floderization Structure and Clarification : 
- DOC
  - FEATURES
    - NEWS ENGINE
      - SOT (6 phase files as per the framework)
      - Plan (Initial Plan file that file will be created by me at the begenning)       
      - GoogleAIStudio UI UX (I will paste the prototype files here)
      - Fontend UI UX Prompts (You will create the Google AI studito prompting files here as per the guideline)
      - Audit Report (You will create the audit report files here And save all the future audit reports for the feature)
      - BACKEND PLAN (Just create the folder empty for now, will fill it later after the frontend is 100% ready)
    README.md (Main SOT readme for the feature) It is mandatory to update on each phase completion to reflect the changes. 

For better understanding you can read the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE completely so that You will know what is the new workflow that I want you to follow from now on for any frontend feature building. 

***Clarification :*** 
- I will create the initial plan file in the Plan folder at the begenning of the feature building.
- I will reffer the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file and will ask you to create the SOT folder files as per the 6 phase framework.
- You will also create the folders that I have mentioed in the Folder structures under the working feature directory. 
- After the 6 phase SOT files are created by you, You will create the Prompts in the Frontend UI UX Prompts folder based on the Google AI Studio prototype that I have built for that feature.
- Keep the other folders in empty state for furter use. 

*** this is the workflow I want for now. Deeply Understand all the contexts and update the files accordingly. 

--------------------------------------------------------------------------------------


As i did not follow the 6 phase rules in this Feature but built the prototype already, now I want you to follow the 6 phase rules and crete the files in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT folder accordingly. as per D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file . 

and after that Checkback the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts and also the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\GoogleAIStudio UI UX\ai-news-engine-admin- V6 and validate with the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT and Identify what is missing there as per the 6 phase framework that you have prepared.

after that , prepare annother frontend enhancement plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts if you found anything missing or not accurate as per your 6 phase framework that you have prepared. If evertyhing is fine then just give me a green signal to move forward. 

Audit the V5 as per the SOT that you will create based on my initial plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Plan\CHatGPT.md .

-----------------------------------------------------------------------------------------

Now we have built the prototype as per the the SOT , But few things we still need to decide by considering : 

- The Prototype UI is not semantic as per our project theme system. 
- Might Have hardcoded UI 
- Not adapted as per out theaming system
- The built framework is vite and not next.js which we are using in our project.

### What we need to do :
- Need to migrate the UI UX
- Need to make sure its fully adapted with our theme system and also the e2e flow is maintained.
- Migrate from vite to Next.js framework.

### My Plan/idea : 
- Migration takes a lot of time and its another major part of using the prototype. So We need a better plan where we can do more works before even start migrating. But I have no Idea how to plan this properly. Maybe we can give more prompts to the Google Ai studio and build the more accurate prototype as per our theme system and Next.js framework. So that we will have less pain and works while doing the migration. 

### Your Job : 
- here is the latest audit report D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Audit Reports\prototype-audit-google-ai-studio-uiux.md . You have to deeply analyze this audit report and prepare a detailed plan how we will do the migration properly by considering all the points that I mentioned above.

Also can read through D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file and let me know what we have to consider before preparing the plan. 

- create the plan in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Plan Prompts folder. IF you decide to craft prompts for google ai studio further then prepare the prompts in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts folder as well.

-------------------------------------------------------------------------------
Check this chat conversation , We have done some tasks as per the tasks.md file. But as we have updated the migration workflow, YOu need to update the tasks.md  that also aligns with this workflow and after that start implimentation. I recommend you to do a audit one the V6 vs the Current state of this site's News engine feature e2e. So that , You will have a crystal clear picture. And after that Also chcek back once again that overall documentation in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md and D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\README.md

--------------------------------------------------------------------------------

You are stucked with your testing. I have tested manually. The overall mirrorring was fine. there are few issues. please check back the layout again , because the Layout is not concistent as per Layout SOT. And also there are few modal triggers are not showing up as per the V6 triggers.

 ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 --------------------------------------------------------------------------------------

 This phase 1 migration still has some issues . The Triggered modals are not accurate as per the SOT V6. You need to focus on the Modals that opens in triggered actions. Audit back The current implimented Ui vs the SOT v6 modals e2e. 

  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

 ---------------------------------------------------------------------------------------
### Issues to fix :
 there are few Modals are still not migrated as per phase 1. they are : 

 - When user clickes on "Resume Automation" > It opes and modal which is not as per the V6 SOT.
 - The Review modal > Publish now Button does not open the modal as er SOT V6. 

- Automatic Logic > Publish Windows scheduling has no calander picker 


### UI UX enhencement : 
There are few things that I have noticed, There are there no action and endpoints for some UI that you prompted earlier. e.g - Automatic logic > Operational Rules Section > +Add Rule button does not open any modal and no further actions. I need youto audit this current implimentations and analyze the UI UX deeply to identify gaps/missing gaps and illogical UI UX which has no such functionality in this feature. this UI UX improvement plan is the Fine tuning of this feature. We will wire the backend e2e based on this UI ux and after fine tuning. In this fine tuning , You are allowed to add/remove necessary modals/pages components etc. 

The Goal is to finalzile the UI ux and plan the backend further in the next pahse based on this final UI UX.

  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md 

 --------------------------------------------------------------------------------

 here is the enhancement plan created by you D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\UX-FINE-TUNING-PLAN-2026-01-03.md . As I will do the further UI UX enhancement based on this plan, and also with do the furhter development/enhencement here in vs code and will not use the google ai studio now. But I need the similar kind of prompts as per this  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING . You have to prepare the prompts accordingly based on this enhancement plan in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts folder . After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.
--------------------------------------------------------------------------------------

Now Lets Build the Public pages , post page for this New Engine . Your job is to plan the frontend UI UX based on the current state of this site. E.g The Homepage does not have this section , so we need to create the section and then rotue the News Page and post pages. I will build the UI UX here in vs code using co-pilot . SO I need the detailed frontend plan for the public pages in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts folder . After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.
  ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md 

 --------------------------------------------------------------------------------

 forget about commit push now, focus on implimentations. finish all the steps first. I have checked your initial build of the Latest News Section in the homepage. Which is poor UI . You can follow the Blog Setion in this case and use similar UI style and also UI classes. The news page, post page, share modal are also poor. It donent look like modern . it is more like unfinished. 

 You should have followed the prompts for the UI . Maybe You did not follow that , instead follewd the requirements I think. 

 ***Instructions*** 
 I wated to build the UI here to save time instead of building UI UX in google ai studio. but it is dissappointing. you should focus on UI UX deeply here. If needed , enhance the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts\frontend-plan-public-v2-2026-01-03.md  . And instruct AI to follow the UI UX prompts exactly on each steps. 

 ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md 

 ---------------------------------------------------------------------------------

 I want you to prepare a UI UX plan for the Public page and post page for the News Feature. Follow the prompt D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\Frontend Planning Prompt.md strictly and create the plan in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts folder By following the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\Template_Comprehensive_UI UX.md template strictly. After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

  ***Strickt Rules***



  Now I am fixing my workflow . At the begenning I always share my initial plan > Generate 6 phase SOT folder files > Build the prototype with google ai studio > Prepare the frontend plan based on the prototype in the Frontend UI UX Prompts folder > Build the frontend based on the frontend plan > Prepare the backend plan based on the final UI UX flow in the Backend Plan folder > Build the backend based on the backend plan. 


***Phase 1 : Building SOT***
  - Here is my Initial Plan : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Plan\CHatGPT.md
  - Prepare the 6 phase SOT folder files in 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT as per the 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file . 

***Phase 2 : Frontend Planning***
- Here is the front end plan based on 6 phase SOT : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\SOT\FEATURE-SOT.md
- Based on this frontend plan , Prepare the frontend UI UX prompts in
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts folder by following the :
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\AI Prompting Guideline.md Instructions. 
- The Outcome should be followed by This : 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\AI PROMPTING\Template_Comprehensive_UI UX.md

  -----------------------------------------------------------------

  I want you to follow the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts\frontend-plan-public.md and build the public frontend here in vs code followed by Step 1 of 6 — Public News Listing Page in the plan. only follow the prompts strictly which building each step by step. 
  - Keep in mind that you are rebuilding these pages here in vs code based on the prompts. not using google ai studio now. So there are alredy existing files that were created earlier in this project. So you need to override those files accordingly based on the prompts. audit back the existing files and then override accordingly. Understand the clear picture first then start implimenting. 

  ------------------------------------------------------------------------------

  ***Frontend Migration Workflow***
  - Here is the prototype we built with google ai studio :
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\GoogleAIStudio UI UX\ai-news-engine-admin- V6
 
  - Follow the file instructions strictly while preparing the migration plan
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\FRONTEND-PROTOTYPE-WORKFLOW\README.md .

   - Create the Migration plan in the :
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\MIGRATION.

  - Based on the Migration plan that you have created, update the single root tasks file for the feature (do NOT create any additional tasks.md files):
  `DOC/FEATURES/NEWS ENGINE/tasks.md`
  - Follow the canonical task template rules at:
  `DOC/.specify/templates/tasks-template.md`



***Frontend Migration Workflow***
  1. CONTEXT
You are migrating a Google AI Studio prototype (V6) to the production Next.js codebase for the NEWS ENGINE feature. The migration must strictly follow the project’s prototype-first, SOT-driven workflow and all documentation standards.

2. WORKFLOW STEPS
Prototype Reference

Use the finalized prototype:
DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V6
This prototype is the UI SOT (Source of Truth) for migration.
Migration Plan Preparation

Strictly follow:
DOC/GUIDELINES & SOT/FRONTEND-PROTOTYPE-WORKFLOW/README.md
Reference the migration playbook:
DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/PROTOTYPE-TO-NEXTJS-OPTION-A-PLAYBOOK.md
Create a detailed migration plan in:
DOC/FEATURES/NEWS ENGINE/MIGRATION/
Task Tracking

Update the single root tasks file:
`DOC/FEATURES/NEWS ENGINE/tasks.md`

Do NOT create `tasks.md` in SOT or MIGRATION folders.
Verification & Documentation

After migration, run all verification gates (typecheck, build, theme checks, etc.) as per the migration contract.
Document verification results in the MIGRATION folder.
Update DOC/FEATURES/NEWS ENGINE/SOT/README.md to reflect migration status, deviations, and lessons learned.
SOT & Documentation Compliance

Ensure all SOT/README and index files are updated to reflect the new workflow and any changes.
All folderization and file creation must match the structure in DOC/FEATURES/NEWS ENGINE.
3. ENHANCEMENT RULES
Explicitly reference the migration playbook in all migration plans.
SOT/README must be updated after migration to maintain a single source of truth.
All verification steps must be documented and results stored in the MIGRATION folder.
Remove any instruction to create tasks.md in SOT for prototype-driven frontend features.
Ensure all documentation and plans are traceable, auditable, and compliant with the latest workflow.
4. SUCCESS CRITERIA
Migration plan exists in `DOC/FEATURES/NEWS ENGINE/MIGRATION/` and all tasks are tracked in `DOC/FEATURES/NEWS ENGINE/tasks.md`.
All steps reference the prototype, workflow README, and migration playbook.
SOT/README and index files are updated post-migration.
Verification results are documented.
No redundant or conflicting instructions remain in the guidelines.

---------------------------------------------------------------------------------------


  I want you to prepare a detailed backend plan for the News Engine feature based on the final UI UX flow that we have now. The plan should be created in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\BACKEND PLAN folder . After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

 ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md 

 -------------------------------------------------------------------------------------

 ***BACKEND***
 ### Step 1 : Planning Prompt
***Feature Name : News Engine***

  ### Your Job :
 - I want you to follow the template
   D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\PROMPTS\Backend_Planning_Prompt_Template_E2E_Audit_First.md and prepare the backend plan prompt in the
   D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\BACKEND PLAN folder . This prompt will be used to prepare the backend plan in the next step. 

----------------------------------------------------------------------------------------

The backend plan is done but I need you to validate the overall plan deeply. your job is to audit back the backend plan vs the final UI UX flow that we have now. Identify any missing endpoints or any illogical endpoints in the plan. AFter that you have to enhance the backend plan files accordingly including tasks.md. e.g if you noticed an UI modal is needed to add in the final UI UX flow but that is missing in the backend plan, you have to add the necessary endpoints in the backend plan accordingly. Or if you noticed any illogical endpoints in the backend plan that is not needed as per the final UI UX flow, you have to remove those endpoints from the backend plan accordingly. here is the plan D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\FEATURES\NEWS ENGINE\BACKEND PLAN . 

### Also anwer my questions : 

- What I will see in reult after the backend implimenttion is done?
- Give me a checklist what to check and test after it is done.
- What about the AI model API key? Are you going to use the API key already in the .env file for AI related taks to accomplish?
- I need a summary of what the functionality I will get in the end. 

--------------------------------------------------------------------------------------

I am bit confused about the end result of this feature. Feeling like there are still more things to impliment . Understand my goal : Want to have the e2e feature as per planned at the very beginning which is DOC\FEATURES\NEWS ENGINE\Plan\CHatGPT.md . So far we have done the frontend based on the initial plan but during building a lot /few things updated or changed or enhanced on the go > after that we have built the backend plan based on the final UI UX flow that we have now. > but in the end we must get what we planned. Now I have no clear vision what I will get in the end after the backend is done. 

I do not want any partial implimentations on both part frontend and backend, and later struggle it partial working feature and figure out what is working and what is not or may be reqire further builts of UI UX and backend. I want you to think just as like me from the begining to the end. And come up with idea or solution how we will achieve this goal.

--------------------------------------------------------------------------------------
I have tested visually and here is the issues I have found so far : 
- The Scheduling is not working. I have scheduled a news post but , it iwas not posted as per the schedule. And also when I check back the schedule modal, it was not showing the exactly scheduled date and time that was set by me. the is a bad UX.And also the scheduled Item was not posted accordingly. Need to improve it and work accordingly. 

- Confirm Live Publication modal enhancement : I do not want this modal to write "PUBLISH" in the field and then it allows to publish. Instead I want just Yes NO button for the confirmation before publishing. The current process is not user friendly. 
- The share modal enhancement : I want you to add more social media such as : whatsapp etc . and Make sure that the sharing option works e2e. so that anyone can share on social media without having issues. currently it is more like static and no trigger or functions that works on social media . 

***Instructions*** 
Check the screenshots for better understandings. Audit and identify the issues as per explained and fix/enhance it accordingly. 
Create a phase in the DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\tasks.md file for these issues and fix them accordingly.
 ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md 

 ***Questions to Answer*** 
 - What about the AI and automation functioality?
 - What about the AI API usage and AI generated news?
 - What about the RSS based research and auto post functionality. 
 - Is it already planned in the tasks.md or what? 
 - As you mentioned all news engive backend and UI implimentations are done, so I am confused about the full functionality. explain why you have dome only maual part and why not the Automation part as well.

 ---------------------------------------------------------

 Now I want you to create the AI and Automation backend e2e plan followed by this DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\Backend_Planning_Prompt_Template_E2E_Audit_First.md . After that will confirm you to start the implimentation phase accordingly based on the plan you prepared.

-------------------------------------------------

Answers of your questions : 
- You should use the OpenAI API keys that are already in the .env . The gemini is just a legacy from the prototype , so update it with openAI . 
- Yes I want Auto-publish when the Operational state is selected Automatic .
- I want you to make all the available UI UX functional as per the final UI UX flow that we have now. So that the RSS, Trend , web research all should work accordingly. 

*** Make sure that all the UI UX that we have now, all should be fully functional e2e. 

***Additionally***
I  need you to add one ore column for "Rejected" posts. After rejection I want it the show there instead of soft delete. the delete should be done when I delet from the rejection. The rejected posts should have the functionality that I can regenerate the post, fix issues and re-schedule or publish again or keep in the draft. 

- Audit this functionality and plan it accordingly. 

After that create a new phase in the DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\tasks.md.
---------------------------------------------------------------------------------------


***Phase 1 : Building SOT***
  - Here is my Initial Plan : 
   DOC\FEATURES\BLOG\RAW PLAN\Initial_idea.md
  - Prepare the 6 phase SOT folder files in 
  DOC\FEATURES\BLOG as per the 
  D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md file . 


  ***Phase 2 : Frontend Planning***
- Here is the front end plan based on 6 phase SOT : 
  DOC\FEATURES\BLOG\SOT\FEATURE-SOT.md
- Based on this frontend plan , Prepare the frontend UI UX prompts in
  DOC\FEATURES\BLOG\Fontend UI UX Prompts
  folder by following the :
  DOC\PROMPTS\PROMPTS & TEMPLATES\FRONTEND\AI Prompting Guideline.md Instructions. 
- The Outcome should be followed by This : 
  DOC\PROMPTS\PROMPTS & TEMPLATES\FRONTEND\Template_Comprehensive_UI UX.md


  ------------------------------------------------------------------------------------------

  I think you we need to update our initial plan then. Becuase I need the Blog feature has the similar kind of AI and Automation functionality that we have in the News Engine feature. So I want you to update the initial plan accordingly in the DOC\FEATURES\BLOG\RAW PLAN\Initial_idea.md file . After that will confirm you to prepare the 6 phase SOT folder files accordingly based on the updated initial plan. Read the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOC\FEATURES\NEWS ENGINE\SOT for better understanding of the AI and Automation functionality that I want in the Blog feature as well. 

  ------------------------------------------------------------------------------------------

  As the files were alreayd generated , All you need is to update all the files as per the update initial plan. here is the main file of this feature DOC\FEATURES\BLOG . check out all the documentation and update everything accordingly. but one thing to mention is that, As I ahve built partial UI UX for blog in the DOC\FEATURES\NEWS ENGINE\GoogleAIStudio UI UX by using 11 prompts from the DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-plan-admin-v1-2026-01-10.md file , you need to make sure that the UI UX is aligned with the updated initial plan. So you need to audit back the built prototype vs the updated initial plan and update the prototype accordingly if needed. After that update the frontend plan in the DOC\FEATURES\BLOG\Fontend UI UX Prompts folder accordingly.

  -----------------------------------------------------------------------------------------------

  - Here is the updated prototype after implimented 28 prompts D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\Strapi\DOC\FEATURES\BLOG\GoogleAIStudio UI UX\solarmatch-blog (2) from the DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-plan-admin-v1-2026-01-10.md file . 

  - Now I want you to analyze the prototype vs the updated initail plan 
  * DOC\FEATURES\BLOG\RAW PLAN\Initial_idea.md 
  * DOC\FEATURES\BLOG\SOT 
  - Deeply audit back the prototype vs the updated initial plan and the SOT 
  file and identify what is missing or not accurate as per the updated plan & SOT. After that prepare another frontend enhancement plan in the DOC\FEATURES\BLOG\Fontend UI UX Prompts folder if you found anything missing or not accurate as per your analysis. If everything is fine then just give me a green signal to move forward. 
  - Make sure to update all the relevant files accordingly to reflect these changes, check for the instructions on the top of the DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-uiux-system-plan-blog-2026-01-05.md file for that. 

  -------------------------------------------------------------------------------------

  I am wonderd that you have given green signal. because there are a lot of missing modals and triggers. First you need to enure the Audit instruction covered everything DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md . 

  ### My visual testing found these issues :

  1. Content Manger > Categories > + Add Category button does not open any modal.
  2. Content Manger > Tags > + Add Tag button does not open any modal.
  3. Content Manger > Blog Posts > Bulk Actions > There is no bulk selection option to select multiple posts and also no options to bulk delete.
  4. Media Library > New Folder button does not open any modal.
  5. Media Library > grid view and list view toggle is not working.
  6. Comments > Bulk Actions > There is no bulk selection option to select multiple comments and also no options to bulk delete or approve/reject.
  7. Engine Hub> Setting page is empty and there is no settings UI UX were planned for this feature. 
  8. Engine Hub > There are lot of buttons that does not open any modal or no triggers or actions. just remained static. 

  You need to perfrom the Audit again but before that You need to update the Audit prompt DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md  to cover all the e2e pin point issues. do not need to mention exact issues in the audit instructions. but make the instruction vast enough so that it will cover all the e2e issues. After that perform the audit again and prepare the frontend enhancement plan accordingly in the DOC\FEATURES\BLOG\Fontend UI UX Prompts folder.

  ----------------------------------------------------------------------------------

  I want you to rechek the audit instructions again. I have changed my prompts a bit . Now I do not want the AI deeply focus on editing all the SOT files in this enhancement phase. All I need is the audit should be based on my new prompt , where I am more focused on enancing frontend . fist focus on finding issues and unfnished, no endpoints, no triggeres etc e2e UI UX in the prototype . 2nd ly compare vs SOT to find any missing gaps. but do not focus on updating the SOT files in this phase. here is my new prompt : 

  ***step 1 : Audit**
 - Here is the updated prototype after implementing all the UI UX building prompts : 
  DOC\FEATURES\BLOG\GoogleAIStudio UI UX
  
  - Deeply audit the prototype as per audit Instructions :
  DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md

- After that Prepare the audit report in the :
  DOC\FEATURES\BLOG\Audit Report folder 

***step 2 : Analyze & Enhance Instructions***  
   - After the Audit Findings, Come up with the Enhancement plan if needed. plan the for all the missing gaps and inaccuraies that you have found during the audit. Also make sure to add more prompts by keeping everything existing as it is. The goal is the final prototype should have the e2e flows , triggners, functionslities as per the updated enhancement plans & SOT 100%.
   - After that add more frontend enhancement steps in the following : 
   DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-uiux-system -plan-blog-2026-01-05.md .
   Keep the existing prompts as it is and just add the new ones after the existing ones so that we can keep track of all the changes. 
 
   ***Strickt Rules***
  - Here is the audit Instruction you have to follow :
   DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md
  
  - All of your new prompts should be addede in the 
  DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-uiux-system-plan-blog-2026-01-05.md 
  after the existing prompts. so that we can keep track of all the changes.

  - End of my prompt

  ***Instructions*** 
  Now I want you to update the audit instruction file accordingly based on my new prompt instructions mentioned above. 


  -------------------------------------------------------------------------------------------

  **The Scenario :***
  - In the phase 1 we have built the SOT as per the initial plan.
  - In the phase 2 we have prepared the frontend UI UX prompts based on the SOT.
  - In the phase 3 we have built the prototype based on the frontend UI UX prompts and performed audits and enhancements and updated the prompts accordingly. Also updated the frontened on the go based on the audit findings. And did not update any SOT files in this phase. becuase we had to focus more on the frontend enahcnements with multiple versions of the prototype.
  
  ***Phase 4 : Audt the current state and update the SOT only*** 
  - Need you to prepare an universal audit instruction file for this phase only, make sure it is resuable for any frontend feature audit in future as well. keep it generic   . 
  prepare the file in this :  DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT folder.
      - The audit should be based on the updated initial plan and the SOT only. this is the final audit and sync phase to update and aling all the SOT fiels as per the updated initial plan and the final prototype.


      -----------------------------------------------------------------------------

***understand the scenario : ***

 ### I have been using this prompt after builder each version of the prototype :
  ***Phase 3 : Frontend Enhancement ***
***step 1 : Audit**
 - Here is the updated prototype after implementing all the UI UX building prompts : 
  DOC\FEATURES\BLOG\GoogleAIStudio UI UX
  
  - Deeply audit the prototype as per audit Instructions :
  DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md

- After that Prepare the audit report in the :
  DOC\FEATURES\BLOG\Audit Report folder 

***step 2 : Analyze & Enhance Instructions***  
   - After the Audit Findings, Come up with the Enhancement plan if needed. plan the for all the missing gaps and inaccuraies that you have found during the audit. Also make sure to add more prompts by keeping everything existing as it is. The goal is the final prototype should have the e2e flows , triggners, functionslities as per the updated enhancement plans & SOT 100%.
   - After that add more frontend enhancement steps in the following : 
   DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-uiux-system -plan-blog-2026-01-05.md .
   Keep the existing prompts as it is and just add the new ones after the existing ones so that we can keep track of all the changes. 

***My Observations :***
1. Content Manger > Blog Posts > Bulk Actions > There is no bulk selection option to select multiple posts and also no options to bulk delete.
2. Comments > Bulk Actions > There is no bulk selection option to select multiple comments and also no options to bulk delete or approve/reject.
3. Engine Hub> Setting page is empty and there is no settings UI UX were planned for this feature. You should have the setting UI UX plan in oder to make this feature functional.
4. Engine hub > Drafts & Reviews > the edit button is not triggering any modal for edit. 

### there are a lot of issues to identify.

   ***Strickt Rules***
  - Here is the audit Instruction you have to follow :
   DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype vs SOT Audit_Prompt.md
  
  - All of your new prompts should be addede in the 
  DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-uiux-system-plan-blog-2026-01-05.md 
  after the existing prompts. so that we can keep track of all the changes.
      
      
      
 ### But the issues I am facing :
  - The UI UX is still has poor functionalaties e.g in the previous version 2 had no bulk actions, after I mentioned this issue > now I have bulk actions in version 3 , but there is no page were created where the deleted files move there as a soft deletion > so that I can restore or permanently delete from there. 

- this means your enhacement plan is also not e2e and logically done. You are just coming up with few prompts and updating the prototype on the go. but not thinking from end to end. 
- I have mentioned one issue with the bulk editing , but there are a lot of pages and tables that also should have bulk action functionality. 

### remember My Goal is to build the Frontend e2e as per SOT but also Enhance logically e2e and build it Backend friendly. So that I will not face with any undeone/unfinished/static only UI issues while doing the backend development. This is crucial. 

***Instructions*** you need to comeup with the best solutions. and also check back the audit instructions DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\Prototype Audit & Enhancement_Prompt.md . if you think , updating this will solve our issues then udate it. or let me know what should I do to solve this kind of issues 

-------------------------------------------------------------------------------------------


focusing on the AI Automation only , I want you to come up with the best ADMIN functionality for the News Engine Feature. Brainstorm and prepare the best possible e2e AI Automation functionality for the News Engine feature. I need more internal control where the Admin can control the AI and Automation functionality deeply. e.g controlling while AI model to use like , for Deep research GPT5.2, for Drafting GPTo3 mini etc. ALso need the ability to use multiple API keys for different AI models. Also need the ability to set the operational rules for AI usage e2e. 

RSS , Scrapper based research etc works and can be controlled from the Admin side e2e. the AI should be able to generate AI image for the blog posts. 

***Things to keep in mind***
We already had a plan DOC\FEATURES\BLOG\SOT\FEATURE-SOT.md and also built UI protptype DOC\FEATURES\BLOG\GoogleAIStudio UI UX . But now I want you to focus more on the AI and Automation part only. So your new plan should be more focused on the AI and Automation part only. 

  ***Instructions*** 
  - First audit back the existing SOT vs the prototype vs the initial plan DOC\FEATURES\BLOG\RAW PLAN\Initial_idea.md  to identify any missing gaps or illogical UI UX in the AI and Automation part only. THe goal is to identify what is missing or illogical in the AI and Automation part only and enhance the existing SOT accordingly. the existing plans already had the basic AI and Automation functionality but now I want you to enhance it deeply.

 After that prepare the enhancement plan in the DOC\FEATURES\BLOG\Fontend UI UX Prompts folder . After that will confirm you to start the implimentation phase accordingly based on the plan you prepared. 

  ***Strickt Rules***

  ----------------------------------------------------------------------------------------

  
  Now I can see the API is working but the AI generated content is not generated the whole content properly . check the screenshot . in all the 5 new articles there is a common body content , which is may be hard coded (Silicon-based photonics is undergoing a massive transformation as hyperscale data centers reach the limits of electrical copper interconnects. By integrating laser arrays directly onto CMOS wafers, throughput can scale to 800G and beyond without the thermal bottleneck traditional systems face.

"We are seeing a convergence of optical physics and high-volume semiconductor manufacturing," says Lead Researcher Dr. Elena Vance. This development is expected to slash latency for large-scale AI training clusters by as much as 35% within the next 24 months.)

- So it did not generated the content properly. you need to find the gaps and fix it accordingly. 
- Also the SEO area was not generated properly as well. check the screenshot for better understanding.
- also the research summary doesnt look like it has the real data. 

- overall you need to check this entire review modal and all of its functionality. 

---------------------------------------------------------------------------------------


- Now I found that the Admin content and the public content has mismatch. The contents are completely different except the title. check the screenshots for better understanding. 
- The "Request AI rewrite modal" does not work and there in no impact of the rewrite request on the content. check the screenshot for better understanding.
- This is insane , I need you to audit back the entire AI generated content flow vs the final UI UX flow that we have now. Identify all the gaps and fix them accordingly.
- Testing and finding issues became endless here. You must test all the AI automation functionality and test accordingly. 
- Becuase I am also getting confued which one is working which is not, which modal is not even conneced or not, even the settings are also working or not. this is very critical part to identify as a human.
- I suggest you to fix this mentioned issue first 
- and then read back all the SOT vs the current state of the News Engine Feature and audit e2e all the AI automation functionality deeply. and identify the gaps and also let me know if any frontend or backend needs more updates to do. 
- finally after done everything , do the tests and ensure everything is working perfectly. 

 ***Strickt Rules***
### Follow the Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md 

 - prepare a new phase in the DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\tasks.md and start implimenting accordingly

 -------------------------------------------------------------------------------------------
Focusing on the News Engine Feature, Follow this instructions strictly and perfrom the audit : DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\comprehensive-feature-implementation-audit-prompt.md 

 - and after that prepare the report in the : DOC\FEATURES\NEWS ENGINE\Audit Reports 

 --------------------------------------------

focusing on the AI Automation only , I want you to come up with the best ADMIN functionality for the News Engine Feature. Brainstorm and prepare the best possible e2e AI Automation functionality for the News Engine feature. I need more internal control where the Admin can control the AI and Automation functionality deeply. e.g controlling while AI model to use like , for Deep research GPT5.2, for Drafting GPTo3 mini etc. ALso need the ability to use multiple API keys for different AI models. Also need the ability to set the operational rules for AI usage e2e. 

- RSS , Scrapper based research etc works and can be controlled from the Admin side e2e. the AI should be able to generate AI image for the News posts. 
- I want more control on RSS sources and need more functionality how the AI will generate the content based on the RSS sources. 
- The web search control is not clear to me, I want you to come up with the best possible web search research functionality for the News Engine feature. e.g when the AI will do web search , when will do rss , which post will based on rss/web search etc. 
- I need a live tracking system where I can see the AI is working or not, when last worked, what is in the Queue , how many posts are generated, What is upcoming , how the overall settings are working e2e. 
- In the Automation > think from a admin user perspective and come up with the best possible Automation functionality e2e. 

***Things to keep in mind***
We already had a plan DOC\FEATURES\NEWS ENGINE\SOT and also built the frontend and backend DOC\FEATURES\NEWS ENGINE\BACKEND PLAN e2e as per SOT and the feature is almost functional. But now I want you to focus more on the AI and Automation part only. So your new plan should be more focused on the AI and Automation part only. 
***My personal overview to conside*** 
- The overall UX for the admin is not good, and it is like more complex to do the settings and automation, rss, auto scheduling etc. - Need you to comeup with more enhancement Idea and manage everything more easily. 

***My pain points*** 
- I am confused about how this Automation logic> Publish windows will work , becuase it has optio to set a time range but not any specific time and days or more details to control the automation deeply like I can set the time days easily.
- Automation logic > Operational Rules section is confusing, I do not understand what it is doing actually. what is the use of it. 
- It would be nice if I have tooltips to undertand the functionality.
- Source > Web & trend Research is also confusing , I do not undertad how it will work and where it is connected . 
- The overall admin functionality is like showing of a lot of things but no such clear idea and functionality how it will work e2e.
- Master control > run automation Now button is confusing because it show always in the same state UI when clicked on it. And also not sure how this pipeline sub-system works. 

- The overall openion is : we have build a lot of things but not sure we still need more things to build or not and also not sure which is for what and even it is really working or not. Now there are a lot of options here and there to control the AI automation but I have no idea how it will work e2e.
- The AI generated post is generating but I am not sure how the AI is doing the research, from where it is doing the research, how it is using RSS, web search, trends etc. No clear picture. 
- The public page article writing is not good as well,. The UI doesnot show any bullet points, sub-heading etc , just showing plain body texts. which is not reader friendly. 
- 
  ***Instructions*** 
  Focusing on the News Engine Feature, Follow this instructions strictly and perfrom the audit : DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT\comprehensive-feature-implementation-audit-prompt.md 

 - and after that prepare the report in the : DOC\FEATURES\NEWS ENGINE\Audit Reports 
 - In the end separately give me a new plan for enhancemnent that solves my painpoints and also come up with the best possible AI and Automation functionality for the News Engine feature from an Admin user perspective. prepare the plan in theDOC\FEATURES\NEWS ENGINE\Plan folder.

 -------------------------------------------------
***Task 1***
 - I want you to read this DOC\GUIDELINES & SOT\README.md and also the entire DOC\GUIDELINES & SOT and identify if the readme.md file needs any update if you missed any documentation that was not included in the readme. 
***Task 2***
 - I want you to read these files : 
  DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT 
  DOC\PROMPTS\PROMPTS & TEMPLATES\BACKEND
***Task 3***
  - I have built them on demand as per needed to work more effectively. 
  In order to get idea how I used them here is the folder and files to check :
  DOC\PROMPTS\WORKFLOW

***Things to keep in Mind***
- Some files are are used more frequently e.g the audit prompts. so you need to check how I used them in the workflow folder. 
- The readme.md file should be more comprehensive and include all the necessary documentation guidelines and SOT instructions in one place so that any AI can follow the readme.md file and work accordingly without any confusion.
- The AI should be able to understand which files to read immidiately based on my prompts. In this case you can give me some workflow based hint words in the readme.md file so that AI can understand which files to read immidiately based on my prompts. I will mention those hint words in my prompts to make the AI understand which files to read immidiately. e.g if I mention " Audit Feature" in my prompt then the AI should understand to read the specific feature audit prompts files immidiately. becuase there are multiple audit prompt files in the DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT folder. If I mention " Backend Planning" in my prompt then the AI should understand to read the specific backend planning prompt files immidiately. becuase there are multiple backend planning prompt files in the DOC\PROMPTS\PROMPTS & TEMPLATES\BACKEND folder. If I mention " Audit Vs SOT" in my prompt then the AI should understand to read the specific audit vs SOT prompt files immidiately. becuase there are multiple audit vs SOT prompt files in the DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT folder.

***Instructions***
- As there are a lot of documentation guidelines and SOT readme files in the DOC folder that creates confusions sometimes, I want you to prepare a unified documentation guideline and SOT readme file that includes all the necessary documentation guidelines and SOT instructions in one place.
- Also let me know if you found any missing documentations, or found redundant documentations in the existing readme files. 

***Goal***
- My goal is to have a unified documentation guideline and SOT readme file that includes all the necessary documentation guidelines and SOT instructions in one place. 

 - Enhancing the Workflow more effectively by using the existing prompt templates more smartly and effectively. 

 ***Strickt Rules***
 - In order to perform the tasks you need to read through all the files and foldes mentioned above carefully before doing anything. 
 
 - Keep in mind that, the DOC\PROMPTS\WORKFLOW folder contains all the workflow based prompts that I used on demand to work more effectively. You can get idea from it, but do not copy anything from there directly. I do not want you to overwhelm me with too much information. I want you to keep it simple and straight to the point.
  - The final outcome should be a single readme.md file that includes all the necessary documentation guidelines and SOT instructions in one place and with all the "hint words" for better understanding. 
  - Finally give me a report and summary on overall tasks you done. 


  ----------------------------------------------------------------------------------------------

***The secnarion is :***

- I do research with AI and build the frontend UI UX based on the research. and after that do the backend planning based on the final UI UX flow that build. 

- All the process I do with the AI . from the planning to the final implimentation everything is done by AI. 

- So, most of the time I never have the exactly clear idea what exactly I will get in the end after the backend is done. which function is connected to which part, how the overall functionality is working e2e etc. I built with the strickt goal, also enhance/update the plan on the go while building UI UX bacnkend and again I do more enhancement as per I feel as needed. But in the end I do not have idea how the overall function will work, how do I do the setting and test it . 

- After building a feature , I am always confused about what is working and what is not and just staying the UI as static , even the backend applied but maybe not working.  



***What I need***
- I Need the clear Instructions for testing and also need a feature user guideline so that I will know how to operate the feature e2e without confusion. 
- also need tooltips as well. 
- it is better to have in english and bengali translation both.
- I need to understand which function is connected to which part, how the overall functionality is working e2e etc.
- Also need a final checklist where I can verify everything is working perfectly before marking the feature as done.
- I need a final feature documentation that includes all the above things in one place for better understanding which will be created by doing the feature audit e2e . 


***Instructions***
I want you to come up with the best solution to solve my painpoints. discuss more with me if needed. or suggest a process e.g Audit , create final documents with the cheklist,user guide etc 

---------------------------------------------------------------- 

- which audit promot can be resued for the E2E Feature Audit (Post-Implementation) as you mentioned. Can we reuse anything from the existing ? check for that in the DOC\GUIDELINES & SOT\README.md . or let me know If we need to create any new audit prompt for that post-implimentation e2e feature audit.

- IF we need to create the audit prompt, then create it in the : DOC\PROMPTS\PROMPTS & TEMPLATES\ADVANCED AUDIT folder.

- Create the output template in the DOC\PROMPTS\PROMPTS & TEMPLATES\POST FEATURE . so that the AI will follow the template to prepare the expected outcome accordingly that you mentioned.

- Finally update the DOC\GUIDELINES & SOT\README.md file accordingly so that any AI can follow the readme.md file and work accordingly without any confusion.


---------------------------------------------------------------------


- understand my workflow : DOC\PROMPTS\WORKFLOW , and suggest me how can I improve my workflow better. I am still figuring out and still developing my workflow. so I need your suggestion to improve it better.

- you can separately build your recommended workflow . the goal is to build the whole saas feature by feature from the planning to the final testing and make it production ready. the whole process includes Research, Planning, implimentation , Enhancement, Finalize ,Test Post feature etc e2e. 

- my preference always : Research once > Planning > Creating SOT > Build the Frondent first > Enhance if needed > then Plan the Backend based on the final fronted > Backend Implimentation > test and post feature checklist. 

- I recommend you to read this DOC\GUIDELINES & SOT\README.md to get better understanding of my overall documentation guidelines and SOT process. 


--------------------------------------------------------------------

I want you to reconsider/update/add more phases to the recommended workflow based on this scenario :

- your recommended 7 phases are good for , If the AI builds evertyhing perfectly without doing mistakes and does missing implementations. But in real world scenario, AI will always do mistakes, miss implementations, overlook things etc. So in order to solve these kind of issues we need to have more phases for better control and quality assurance. Or maybe we can keep the existing 7 phases but add more sub-phases in each phase for better control and quality assurance. 
- This is where I struggle most of the time doing audit and re-check evertying vs the plan vs builts.
- Also testing functionality becomes complicated where I have no idea the feature is actually working e2e or have missing things. 
- It is not possible always for me to follow 7 phases sequally. becuase most of the time I need to go back and forth between the phases to fix issues, miss implementations etc. And also sometimes I need to do more enhancement on the go while building the frontend and backend. So I need more control and quality assurance in each phase to avoid going back and forth too much. this is the biggest painpoint I have right now. So, I need a wayout and a better solution to solve this issue.

***Instructions*** 
for audit templates you can checkback all by reading the DOC\GUIDELINES & SOT\README.md . 
before even update the DOC\PROMPTS\WORKFLOW\RECOMMENDED-WORKFLOW-E2E.md discuss with me with your suggestions and recommendations

--------------------------------------------------------------------------

There are more scenario : 

- After building the prototype or te full feature , when I do the enhancement phase , I always find new things to add or change. After doing the changes the SOT becomes backdated as well as the initial plan. I need a solution in this matter. how do I manage it on the go. Updating the SOT all time is also a pain in the ass. maybe we can make a compelte different phase that to align the current state with the SOT , No matter what we have updated. The AI must detect throgh Audit, read the enhancement pland and documentations and the main track record of all thing is the tasks.md and update all the SOT files accordingly. you think about it and let me know your recommendation.

- The enhancement phase is always painful , because I need to play a loop while enhancing again and again. In that case I need a better solution to manage the enhancement phase more effectively. e.g I use this DOC\FEATURES\BLOG\Fontend UI UX Prompts\frontend-uiux-system-plan-blog-2026-01-05.md file to manage the enhancement by just adding more propmts on the go. but still it is painful because I need to do the audit again and again and and get more prompts and build furhter. Even sometimes I do not even ask for enhancement prompts, I directly do the prompting in the Google AI studio itself. So I need a better solution to manage the enhancement phase more effectively.

- Also there is a migration phase , where I do the frontend migration mostly google AI studio vite project files into next.js which is my system and migrate evertyhing as per my layout, themaing etc adaption system. usually this migration I do after finalizing the prototype. The migration is needed when I build the frontend separately with another AI builder. We do not need migration if we build the UI witin our project. this is a conditional phase but now most of the time I do it. 

***Instructions***
You neeed to create some additional Phases based on different events, which is not as per flow . But you decide either to create separte phases or if you have any recommendation. discuss with me first. 

- read the DOC\GUIDELINES & SOT\README.md file first for better understanding of my overall documentation guidelines and SOT process. So that you can organize the phases with better documentation referrences. 

-----------------------------------------------------------------------

  **Instructions:**
> "You are in Phase 6 (Test & Fix) for the feature in `DOC\FEATURES\NEWS ENGINE`.  Run project gates and E2E manual testing. Use the audit driver at `DOC/PROMPTS/PROMPTS & TEMPLATES/ADVANCED AUDIT/comprehensive-feature-implementation-audit-prompt.md`. Output audit reports to `DOC\FEATURES\NEWS ENGINE\Audit Reports`. Update `DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\tasks.md` with all testing, audit, and bugfix tasks as Phase 6. **Always update `tasks.md` for every action, change, or sub-phase.**"

**Sub-Phases:**
- Functional Verification: E2E test all flows, sign-off before release.
- Audit & Correction Loop: Audit feature, log/fix gaps, repeat until green.

--------------------------------------------

let me clarify few things. First, When we crete the SOT it should not be focued on migration or prototype. our feature master plan should focus on the main plan in this stage. We need to have the strong SOT for sure. most imortant fouced SOT file is DOC\FEATURES\NEWS ENGINE\SOT\FEATURE-SOT.md , and then DOC\FEATURES\NEWS ENGINE\SOT\Frontend-Plan.md as this will lead the build phase. Now here comes the 2nd part , We will need e2e frontend building prompts based on the Frontend-plan.md file. And that prompts should have each and every single detailed and well instructioned prompt to build the frontend perfectly as per the plan. After that , I might use those prompts to build frontend within my Vs code using co-pilot or build the prototype with any other AI web builder such as  google ai studio, Claude Code etc. You need to understand here because here the workflow diverges. If I build the frontend within my system using co-pilot then there is no migration phase needed. but if I build the frontend with any other AI web builder such as  google ai studio, Claude Code etc then I will need a migration phase to migrate the built prototype into my system. So you need to understand this workflow diverge and prepare the SOT accordingly.

- So in the SOT phase we will focus on the main plan only. and then in the Frontend planning phase we will prepare the detailed frontend building prompts based on the main plan SOT file. and then in the build phase we will build the frontend either within our system or with any other AI web builder. if we build with any other AI web builder then we will need a migration phase after finalizing the prototype to migrate into our system.

- Now in the workflow , you need to update the recommended workflow by checking the  DOC\GUIDELINES & SOT\README.md accordingly based on this understanding. discuss with me if needed before updating the file.

- I want a phase by phase workflow where the AI do not need to get confused with a lot of contexts at once. so each phase should have its own clear context and instructions. 

- I want you to read my workflow DOC\PROMPTS\WORKFLOW to understand clearly how I work and what kind of prompts I use on demand to work more effectively. 

- We also need to use the AI tokens effectively. so the workflow should be optimized accordingly to use the tokens effectively. e.g If you think we can build the frontend plan and also the Frontend prompts in the same phase to save tokens then we can do that. but if you think it will create confusion then we can keep them separate. so you need to decide accordingly. And discuss with me furhter recommendations. Becuase we also need to cut/ reduce some unnecessary phases if possible to save tokens.

***Instructions***
I want you to read all the necessary files carefully before doing anything. such as DOC\GUIDELINES & SOT\README.md , DOC\PROMPTS\WORKFLOW etc . After that discuss with me your recommendations and suggestions before updating the DOC\PROMPTS\WORKFLOW\RECOMMENDED-WORKFLOW-E2E.md file. 
- prepare a audit report on my current workflow and how can I improve it better. mention your suggestions and recommendations in the report. locate all the file names and paths properly in the report for better understanding.
 
***Strictly Rules***
- Read all the files deeply , not just the file names and assume what is for what. Becuase we might need to update some templates, instructions, audit files etc. Because each and every file is the part of the workflow. So you need to understand each and every file deeply before doing anything. the Goal is to build the workflow effectively that can control any AI efficiently. 

-------------------------------------------

 *** In this 2) Major blockers / inconsistencies causing AI confusion , I want only one tasks.md to create in the Feature folders main root directory. e.g DOC\FEATURES\NEWS ENGINE and that will be the only one single tasks.md file we will maintain from the very begenning till the end before each and every single implimentations. You need to lock this requirements for any AI that must strictly follow on each phase. 

*** 3) Recommendations (phase-by-phase, minimal-context, token-efficient) I prefert to align instead of renaming. and I am agreed with your recommendation in this section.

*** 4) The one question we must settle before any edits (to avoid breaking your system), answers of your questions are :

A) DOC/FEATURES/<FEATURE>/tasks.md (root feature folder)


---------------------------------------------------------------------


This was my initial plan DOC\FEATURES\NEWS ENGINE\Plan\CHatGPT.md for the feature. THis is the audit report after building the feature : DOC\FEATURES\NEWS ENGINE\Audit Reports\NEWS-ENGINE-POST-IMPLEMENTATION-AUDIT-2026-01-10-FULL.md . 

- But Now I want to enhance and update the feature more based on our discussion. 
- Now I need you to comeup with the best possible enhancement and expand the feature more as per we lock out in our discussion.

- You need to read the audit report first to identify the gaps and then read the initial plan to understand what was the initial plan. After that come up with the best possible enhancement plan to enhance and expand the feature more as per our discussion.

- Also find the gaps exactly with the existing Vs Expansion Enhancement plan. 
- prepare the Expand plan in the DOC\FEATURES\NEWS ENGINE\Plan folder. 

### Additionally what I want : 

- I want a UI UX where I can prompt the AI to generate content for me based on my inputs. e.g I will give the topic, keywords, target audience, tone etc and then the AI will generate the content for me based on that.
- Also need a system where I can create a list of keywords and the AI will do the research and generate contents based on that keywords list automatically.. 
- The AI controll system should be very flexible, so that I can control it however I want. the AI must follow all my strickt rules for research, Drafting, Creating content. 
- As the AI research data can be used for both News portal and also Blog , so I think it will be better to have one single research center and from there the AI will distribute contents for the news and blog. but it is your decision to take , if you think news and blog should have both different functionalities then I would go with that instead of making chaos if it is really overwhelming. 
- If you think n8n is a must use tool then I will use it and integrate it with my saas. 

***Instructions***
Deeply understand shared files and also my above instructions and requirements and comeup with a precised plan by creating Expandig plan.md in the DOC\FEATURES\NEWS ENGINE\Plan Prompts
-------------------------------------------------------------------------

this is a good workflow. But I need some additional phases . In oder to expand the plan and further builts I need a phase where the AI read the Site audit report (That I will create separately and refer the report in the prompt) . 
- in this phae I want to AI to read the audit report e2e and identify the gaps/already in the system/need a bit enhancement and Plan the expansion based on the Expansion plan from the DOC\FEATURES\NEWS ENGINE\Plan\Expanding plan brief.md 

- After that I need the frontend expansion plan and prompts to add in the DOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts\frontend-enhancement-plan-prototype-alignment-V2.md

- Backend plan to add in the DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md 

- And lock the tasks by updating and creating a new phase in the tasks.md : DOC\FEATURES\NEWS ENGINE\tasks.md  

- And then start implimenting accordingly. 

***Instructions*** I have explained how I want this phase to work on. this is an aditional phase but that follows the 7 phase workflows . So you need to update the recommended workflow by adding this additional phase accordingly. discuss with me first, becuase this is crucial as we are expanding the existing feature and work from existing implimentations. 
- one more thing I am confused, Should I update the entire SOT in this phase or do it later when the feature is finally done and production ready. I need your suggestion in this case. 

- I want you to read through DOC\GUIDELINES & SOT\README.md if you want to use any documentation to refer in the phase in this case. 

---------------------------------------------

### Expansion Audit & Planning Phase
**Purpose:**
Expand an existing feature by grounding all work in the real, current state of the system. The AI must read the referenced site audit report, identify gaps, enhancements, and what is already present, and plan the expansion using the latest expansion plan (e.g., Expanding plan brief.md). No new files may be created—update only existing, relevant files.

**Sequence:**
1. Read and analyze the referenced site audit report (provided by the user).
2. Identify:
   - Gaps (missing features or broken flows)
   - What is already implemented and working
   - Areas that need minor enhancement
3. Plan the expansion using DOC\FEATURES\NEWS ENGINE\Plan\Expanding plan V2.md as the blueprint.
4. Output:
   - Frontend expansion plan and prompts → update DDOC\FEATURES\NEWS ENGINE\Fontend UI UX Prompts\frontend-enhancement-plan-prototype-alignment-V5.md
   - Backend expansion plan → update DOC\FEATURES\NEWS ENGINE\BACKEND PLAN\BACKEND-PLAN-NEWS-ENGINE-2026-01-04.md
   - Update/create a new phase in DOC\FEATURES\NEWS ENGINE\tasks.md to lock the tasks for this expansion.
5. Begin implementation as per the locked tasks.

**Instructions**
> "You are in the Expansion Audit & Planning Phase for `<FEATURE>`. Read the referenced site audit report, identify gaps, enhancements, and what is already present. Plan the expansion using the latest expansion plan. Update only existing, relevant files for frontend and backend plans, and update tasks.md with a new phase for this expansion. Then proceed to implementation. Do not create any new files unless explicitly instructed."



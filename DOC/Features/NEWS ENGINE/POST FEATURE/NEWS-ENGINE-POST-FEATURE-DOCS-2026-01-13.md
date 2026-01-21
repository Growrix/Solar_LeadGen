# Post-Implementation Docs — News Engine

**Date**: 2026-01-13

This documentation follows `DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md` and is grounded in the current implementation.

---

## 0. Overall Workflow & Audience

- **Who is this feature for?**
  - Admin operators who curate, verify, schedule, and publish news content.
  - Developers/ops who maintain automation, model routing, and secret/key configuration.

- **What is the end-to-end workflow?**
  1) Configure sources (RSS) and operational rules.
  2) Ingest candidate entries (RSS sync or seeded entries).
  3) Generate drafts (automation runner, research drafting, or manual draft).
  4) Review drafts with provenance + OG-image controls.
  5) Schedule or publish immediately (with guardrails).
  6) Verify public `/news` and `/news/[slug]` behavior.
  7) Operate safely using audit logs + pipeline pause/resume/emergency-stop.

- **How does this feature fit into the broader system?**
  - It is a controlled content pipeline that turns external signals into published pages for a solar lead-gen site.
  - It integrates with:
    - Prisma/Postgres for persistence.
    - Admin auth (all admin routes require admin).
    - A cron-secret protected internal runner for automation.
    - Key Vault + AI Router to control AI usage and secrets.

---

## 1. Feature Overview

- **Feature Name:** News Engine
- **Purpose:** Provide an auditable workflow to generate, review, schedule, and publish news items.
- **Key Flows:**
  - Source management + RSS sync
  - Draft generation (automation / research / manual)
  - Review workspace (provenance + image guardrails)
  - Schedule + publish with confirmation
  - Pipeline run/pause/emergency-stop
  - Key Vault + model profiles + AI router defaults
  - Public listing + detail viewing

- **Release Date:** 2026-01-13

- **Main Tabs/Sections (admin hub)**
  - **Dashboard**
    - What: Search/filter view over news items.
    - Why: Fast triage and entry point into review.
    - Impact: Reduces time-to-review and helps spot backlog.
  - **Drafts & Reviews**
    - What: Board view grouped by workflow status.
    - Why: Operators need a queue-first workflow.
    - Impact: Standardizes review throughput and reduces missed items.
  - **Audit Logs**
    - What: Timeline of actions (system/admin) with prompts/metadata.
    - Why: Accountability, debugging, and compliance.
    - Impact: Enables post-incident review and “why did this publish?” answers.
  - **Master Control**
    - What: Global safety controls (run now, pause/resume, emergency stop).
    - Why: Prevent runaway automation and enable maintenance windows.
    - Impact: Operational safety, controlled recovery from failures.
  - **Automation Logic**
    - What: Configure automation toggles, operational rules, publish windows.
    - Why: Align automated behavior with editorial/business constraints.
    - Impact: Reduces off-hours mistakes and improves content timing.
  - **Sources**
    - What: Manage RSS sources and run sync/inspection.
    - Why: Source quality drives output quality.
    - Impact: Better provenance, fewer low-quality drafts.
  - **Settings**
    - What: Global news settings, Key Vault, model profiles, router defaults.
    - Why: Centralized ops + AI configuration without code changes.
    - Impact: Safer key handling, controllable AI behavior.

---

## 2. Key Concepts & System Impact

- **Model Profile**
  - What: A saved model target (provider + model id + enabled state).
  - Why needed: Operators can change which models are available without code edits.
  - Impact: Affects quality/cost/latency of each AI task.

- **AI Router**
  - What: Mapping from task type → model profile.
  - Why: Different tasks (drafting vs images vs research) need different trade-offs.
  - Impact: Changes which model is used per stage and how failures surface.

- **Key Vault & Master Key**
  - What: Encrypted storage for provider keys in DB; UI only shows masked values.
  - Why: Avoid plaintext secrets and allow rotation.
  - Impact:
    - If `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` is missing/invalid, Key Vault cannot decrypt/resolve keys.
    - If no enabled key exists in a required pool (RESEARCH/DRAFTING/IMAGES), AI calls for that stage will fail.

- **Review Modal & Provenance**
  - What: The review workspace shows “what produced this item” (sources, promptUsed, metadata) and allows actions.
  - Why: Prevents hallucinations and ensures editorial accountability.
  - Image controls impact:
    - Items can require OG image approval before publish.
    - Publish-now and auto-publish logic is blocked if approval is required but not granted.

---

## 3. User Guide (English)

### Dashboard section
- **Use it for**: finding items quickly.
- **Steps**:
  1) Use search and filters to narrow results.
  2) Open an item for review.
  3) Use status/category/score filters to prioritize.
- **Common operator habit**: filter to NEEDS_REVIEW first.

### Drafts & Reviews section
- **Use it for**: queue-based review.
- **Steps**:
  1) Use “Filter board…” to narrow cards.
  2) Click a card → opens Review workspace.
  3) Use “Create Manual Draft” if automation is not producing the right topics.

### Review workspace (modal)
- **Use it for**: verification and actions.
- **Steps**:
  1) Confirm title/summary/content and check provenance/source URLs.
  2) Set/verify OG image and approval requirement.
  3) Choose an action:
     - Save changes
     - Schedule
     - Publish Now (requires confirmation text)
     - Request Rewrite
     - Reject with reason
     - Delete (soft delete; rejected items may allow purge)
- **Edge case**: If OG image approval is required, publish-now is blocked until approved.

### Master Control section
- **Use it for**: safety operations.
- **Steps**:
  1) Run Automation Now (Dry Run or Live Run).
  2) Pause pipeline during incidents.
  3) Emergency Stop only when you must hard-lock the system (requires confirm text).

### Automation Logic section
- **Use it for**: configuring automation behavior.
- **Steps**:
  1) Set autoDraft/autoSchedule/autoPublish toggles.
  2) Define publish windows (timezone, days, time ranges, jitter, blackout dates).
  3) Add Operational Rules (scope + conditions + action + severity).
  4) Save configuration.

### Sources section
- **Use it for**: RSS inputs.
- **Steps**:
  1) Add a new source (name + RSS/Atom URL).
  2) Enable/disable sources.
  3) Run sync for a source; inspect recent entries.
- **If sync fails**: see Troubleshooting section.

### Settings section
- **Use it for**: global settings + AI config.
- **Steps**:
  1) Adjust global News settings (daily limit, dedupe sensitivity, etc.).
  2) Configure Key Vault keys (write-only input; stored encrypted).
  3) Configure model profiles.
  4) Configure AI router defaults per task.

### Public News pages
- **List**: `/news` shows published items.
- **Detail**: `/news/[slug]` shows published content.

---

## 4. User Guide (Bengali / বাংলা)

### ড্যাশবোর্ড
- **কাজ**: দ্রুত আইটেম খোঁজা ও ফিল্টার করা।
- **ধাপ**:
  1) সার্চ/ফিল্টার ব্যবহার করে তালিকা ছোট করুন।
  2) কোনো আইটেমে ক্লিক করে রিভিউ খুলুন।
  3) NEEDS_REVIEW স্ট্যাটাসকে অগ্রাধিকার দিন।

### ড্রাফ্টস ও রিভিউ
- **কাজ**: কিউ/বোর্ড ভিউতে ড্রাফ্ট ম্যানেজ করা।
- **ধাপ**:
  1) “Filter board…” ব্যবহার করুন।
  2) কার্ডে ক্লিক → রিভিউ মডাল খুলবে।
  3) “Create Manual Draft” দিয়ে হাতে নির্দেশনা দিয়ে ড্রাফ্ট তৈরি করুন।

### রিভিউ ওয়ার্কস্পেস (মডাল)
- **কাজ**: উৎস/প্রোভেন্যান্স যাচাই, ইমেজ গার্ডরেইল সেট, এবং প্রকাশের সিদ্ধান্ত।
- **ধাপ**:
  1) কনটেন্ট ও সোর্স URL যাচাই করুন।
  2) OG ইমেজ সেট/অ্যাপ্রুভ করুন (প্রয়োজন হলে)।
  3) অ্যাকশন নিন: Save / Schedule / Publish Now / Rewrite / Reject / Delete।
- **এজ কেস**: OG ইমেজ অ্যাপ্রুভাল বাধ্যতামূলক হলে অ্যাপ্রুভ না করা পর্যন্ত Publish Now হবে না।

### মাস্টার কন্ট্রোল
- **কাজ**: সিস্টেম সেফটি (Run/Pause/Resume/Emergency Stop)।
- **ধাপ**:
  1) Dry/Live Run নির্বাচন করে Automation Run করুন।
  2) সমস্যা হলে Pipeline Pause করুন।
  3) জরুরি অবস্থায় Emergency Stop দিন (কনফার্ম টেক্সট লাগবে)।

### অটোমেশন লজিক
- **কাজ**: অটোমেশন টগল, পাবলিশ উইন্ডো, অপারেশনাল রুল সেট করা।
- **ধাপ**:
  1) autoDraft/autoSchedule/autoPublish ঠিক করুন।
  2) টাইমজোন ও দিনভিত্তিক সময় রেঞ্জ সেট করুন।
  3) অপারেশনাল রুল যোগ করুন (scope/condition/action)।
  4) সেভ করুন।

### সোর্সেস
- **কাজ**: RSS সোর্স যোগ/সিঙ্ক/এন্ট্রি দেখা।
- **ধাপ**:
  1) নতুন সোর্স যোগ করুন (নাম + RSS URL)।
  2) Enable/Disable করুন।
  3) Sync চালিয়ে এন্ট্রি দেখুন।

### সেটিংস
- **কাজ**: গ্লোবাল সেটিংস + Key Vault + AI Router কনফিগ।
- **ধাপ**:
  1) ডেইলি লিমিট/ডিডুপ সেটিংস ঠিক করুন।
  2) Key Vault এ API Key যোগ করুন (এনক্রিপ্টেডভাবে সেভ হয়)।
  3) Model Profile ও Router Defaults সেট করুন।

---

## 5. Tooltip Reference

| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
| Subsystem toggle (Master Control cards) | This is a status panel (not a control). Use Automation Logic / Sources to configure. | এটি স্ট্যাটাস দেখানোর প্যানেল (কন্ট্রোল নয়)। কনফিগের জন্য Automation Logic / Sources ব্যবহার করুন। |
| Create Manual Draft | Create a human-directed draft topic. | হাতে নির্দেশনা দিয়ে ড্রাফ্ট তৈরি করুন। |
| Delete rule (Operational Rules) | Delete rule | রুল ডিলিট করুন |
| Remove time range | Remove time range | সময় রেঞ্জ মুছে ফেলুন |
| Run Automation Now | Trigger the automation runner now (dry/live). | এখনই অটোমেশন রান করুন (ড্রাই/লাইভ)। |

---

## 6. Functionality Map

| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
| Load admin hub | `GET /api/admin/news-engine/*` (6 calls via `fetchAdminState`) | Loads items, sources, automation config, settings, audit logs, pipeline status |
| Create item (admin) | `POST /api/admin/news-engine/items` | Creates a `NewsItem` row |
| Review → Publish Now | `POST /api/admin/news-engine/items/[id]/publish-now` | Validates confirm text + OG approval gate; sets status PUBLISHED |
| Review → Schedule | `POST /api/admin/news-engine/items/[id]/schedule` | Sets status SCHEDULED + scheduling fields |
| Review → Reject | `POST /api/admin/news-engine/items/[id]/reject` | Sets status REJECTED + reason |
| Automation toggles/save | `PUT /api/admin/news-engine/automation/config` | Persists autoDraft/autoSchedule/autoPublish + config JSON |
| Operational Rules CRUD | `/api/admin/news-engine/automation/rules*` | Persists `NewsAutomationRule` rows |
| Source list/create | `GET|POST /api/admin/news-engine/sources` | Reads/creates `NewsSource` |
| Source sync | `POST /api/admin/news-engine/sources/[id]/sync` | Fetches RSS; upserts `NewsSourceEntry`; updates source error/sync fields |
| View source entries | `GET /api/admin/news-engine/sources/[id]/entries` | Lists recent `NewsSourceEntry` |
| Run automation now (admin) | `POST /api/admin/news-engine/automation/run-now` → internal runner | Calls `/api/internal/.../run`; returns run summary + audit logs |
| Pipeline pause/resume/stop | `POST /api/admin/news-engine/pipeline/*` | Sets pipeline status; emergency stop requires confirm |
| Public list/detail | `GET /api/news`, `GET /api/news/[slug]` | Shows published items; best-effort publishes due scheduled items |

---

## 7. E2E Flows & System Health

### Typical E2E flow: RSS → Draft → Review → Publish
1) Add/enable RSS sources.
2) Sync a source (creates NEW source entries).
3) Run automation (internal runner selects NEW entries and drafts).
4) Review drafts (confirm provenance and controls).
5) Publish Now or Schedule.
6) Verify `/news` and `/news/[slug]`.

### How to verify it’s working end-to-end
- Admin hub loads without errors.
- Source sync returns ok and creates source entries.
- Automation run returns a summary with draftCreatedCount > 0.
- Draft appears under NEEDS_REVIEW and can be opened in Review.
- Publish Now results in a public slug visible under `/news`.

### Common errors and exact fixes
- **401/403 on admin endpoints**
  - Fix: ensure you are logged in as an admin user and that admin auth is configured.
- **Prisma P2021 “missing News Engine tables”**
  - Fix: apply migrations in the target environment, then retry.
- **Internal runner 401/403**
  - Fix: set `NEWS_ENGINE_CRON_SECRET` and send header `x-news-engine-cron-secret` with the same value.
- **Key Vault master key missing/invalid**
  - Symptom: Key vault operations masked/blocked; AI key resolution returns null.
  - Fix: set `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` to a valid 32-byte key (base64/base64url) or 64-char hex.
- **Source sync returns 422 “got HTML”**
  - Fix: use the site’s actual RSS/Atom URL (often ends with `/rss`, `/feed`, or `.xml`).
- **Publish Now returns 409 (OG approval required)**
  - Fix: in Review, set OG image URL and approve the OG image (or disable approval requirement if policy allows).

---

## 8. Testing & Verification Checklist

- [ ] Admin hub loads and shows tabs without errors
- [ ] Sources: create/edit/enable/disable works
- [ ] Sources: sync works for at least one valid feed
- [ ] Automation run-now returns ok and produces expected summary
- [ ] Draft appears in Drafts & Reviews and opens in Review
- [ ] Review actions work: save, schedule, reject, rewrite
- [ ] Publish Now works (with correct confirm text + OG gate rules)
- [ ] Public `/news` list and `/news/[slug]` detail render expected content
- [ ] Audit Logs show key actions (create, sync, draft, publish)
- [ ] Key Vault can add keys and masks values (no plaintext display)
- [ ] AI router defaults can be saved and invalid profile IDs are handled safely

---

## 9. Known Limitations / Edge Cases

- Master Control “subsystem health” and “Safety Center” currently include presentation-only values; do not treat as real telemetry unless backed by backend signals.
- Queue Snapshot shows RSS/Research NEW counts as “Not available” unless backend counts are implemented.
- Automation Logic initializes some config locally; ensure stored config is reloaded to avoid operator confusion.
- Publish-due logic is invoked on public reads; in low-traffic environments scheduled publishing may lag.

---

## 10. Final Sign-off

- [ ] All checklist items above are verified
- [ ] Feature is ready for production use
- **Sign-off by:** ___________________
- **Date:** 2026-01-13

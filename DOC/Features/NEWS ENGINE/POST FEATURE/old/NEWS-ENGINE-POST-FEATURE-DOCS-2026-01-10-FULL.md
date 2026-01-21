# Post-Implementation Docs — News Engine (Full Feature)

**Date**: 2026-01-10

---

## 0. Overall Workflow & Audience
- **Who is this feature for?**
  - Admin operators who curate and publish news content.
  - Developers/ops who maintain automation, model routing, and secret/key configuration.

- **What is the end-to-end workflow?**
  1) Configure sources, safety rules, and automation settings.
  2) Ingest new items (from sources, automation, or manual drafting).
  3) Review drafts, verify provenance, and apply compliance controls.
  4) Schedule or publish.
  5) Verify on the public news feed.
  6) Use audit logs and pipeline controls to operate safely.

- **How does this feature fit into the broader system?**
  - It’s a content pipeline that turns external signals (feeds + research + prompts) into structured news items stored in the database and displayed publicly.
  - It integrates with:
    - Prisma/Postgres for persistence
    - Admin auth for protection
    - A secret-protected internal runner for automation
    - Key Vault + AI Router for controlled AI usage

---

## 1. Feature Overview
- **Feature Name:** News Engine
- **Purpose:** Provide a controlled, auditable pipeline to generate, review, schedule, and publish news items.
- **Key Flows:**
  - Source management + sync
  - Draft queue + review (provenance + compliance)
  - Schedule and publish with guardrails
  - Pipeline run/pause/emergency-stop
  - AI routing configuration + encrypted key management
  - Public listing + detail viewing

- **Release Date:** 2026-01-10

- **Main Tabs/Sections:**
  - **Dashboard**: Search, filter, and enter review quickly; see pipeline state context.
  - **Drafts & Reviews**: Operate the review queue as a board; create manual drafts; open items for review.
  - **Audit Logs**: Investigate “what happened” (AI actions, manual actions, system actions) and export.
  - **Master Control**: Global operational safety (pause/resume/emergency stop) and manual automation runs.
  - **Automation Logic**: Configure how/when automation drafts/schedules/publishes and store automation strategy JSON.
  - **Sources**: Define where content comes from (RSS) and how research constraints/filters are configured.
  - **Settings**: Configure system defaults, AI routing, model profiles, and Key Vault.
  - **Public News Feed** (public-facing): Browse and open published news.

---

## 2. Key Concepts & System Impact

- **Model Profile**
  - **What:** A saved definition of a model target (provider + model id) with enabled/disabled state.
  - **Why needed:** Lets operators control which models are available without editing code.
  - **System impact:** Only enabled profiles can be selected by routing defaults; changes affect how automation chooses models.

- **AI Router**
  - **What:** A mapping from task type → model profile.
  - **Why:** Different tasks (research vs drafting vs SEO vs dedupe) may need different models.
  - **System impact:** Alters the model used for each stage of automation and impacts cost/quality/latency.

- **Key Vault & Master Key**
  - **What:** Encrypted storage for provider API keys (keys are stored encrypted; UI only sees masked values).
  - **Why:** Avoids storing raw keys in plaintext and supports multiple keys/pools.
  - **System impact:**
    - If the master key env var is missing/invalid, Key Vault operations are intentionally locked.
    - AI calls that rely on Key Vault pools can fail if keys are absent/disabled.

- **Review + Provenance**
  - **What:** Provenance shows the sources/URLs and stage metadata used to produce an item.
  - **Why:** Operators need to validate factual basis and accountability before publishing.
  - **Image controls impact:**
    - “Approval required” and OG override are persisted per-item.
    - These controls influence publishing compliance and link preview behavior.

---

## 3. User Guide (English)

### 3.1 Dashboard section
**What it’s for**
- Quickly find items by search/filters and open them for review.

**How to use**
1) Use search to filter by headline/summary.
2) Use filters to narrow by status, category, date window, and score.
3) Click **Review** on any item to open the review workspace.

**Notes / edge cases**
- KPI tiles and pagination controls may not reflect real backend metrics yet.

### 3.2 Drafts & Reviews section
**What it’s for**
- Operate the review queue (drafts → review → scheduled/published or rejected).

**How to use**
1) Use the board filter to narrow the visible queue.
2) Click a card to open the review workspace.
3) Use **Create Manual Draft** when you need a human-directed topic/prompt.

### 3.3 Review workspace (modal)
**What it’s for**
- Validate provenance, apply compliance controls, and take actions (save, schedule, publish, rewrite, reject).

**Key actions**
- **Save as Draft**
  - Persists per-item image controls and refreshes the item status.
- **Approve for Scheduling**
  - Moves you to the scheduling dialog.
- **Publish Now**
  - Triggers a publish-now flow (guarded by a confirmation step).
- **Request Rewrite**
  - Opens a rewrite request dialog and submits rewrite instructions.
- **Reject**
  - Records a rejection reason for auditability.
- **Delete**
  - Soft-deletes active items; purges rejected items.

**Troubleshooting**
- If publishing fails with a message about missing tables, run migrations.
- If “Publish now” appears to work but item doesn’t show publicly, verify status is PUBLISHED and a slug exists.

**Important limitation (current behavior)**
- Editing the headline/body text in the modal may not persist unless specifically wired; treat those fields as “review-only” unless you confirm persistence in your environment.

### 3.4 Scheduling dialog
**What it’s for**
- Choose a future publication datetime.

**How to use**
1) Pick a date and time in the future.
2) Confirm.

**Common error**
- “Scheduled time must be in the future.” → choose a later datetime.

### 3.5 Master Control section
**What it’s for**
- Run or stop the automation pipeline safely.

**How to use**
- **Pause pipeline**: Use during maintenance or investigation.
- **Resume all**: Returns pipeline to nominal state.
- **Emergency stop**: Hard lock; requires typing the confirm phrase.
- **Run automation now**:
  - Choose Dry/Live mode.
  - Confirm; then view run details.

**When to use what**
- Pause: planned maintenance.
- Emergency stop: serious incident (bad generation, runaway scheduling, broken upstream, etc.).

### 3.6 Automation Logic section
**What it’s for**
- Control which automation behaviors are enabled (draft/schedule/publish) and store strategy configuration.

**How to use**
1) Enable/disable the automation toggles according to your policy.
2) Configure publish windows and operational rules.
3) Save configuration.

**Note**
- Some automation controls are policy configuration; actual enforcement depends on the internal runner’s implementation.

### 3.7 Sources section
**What it’s for**
- Define RSS sources and configure research constraints (weights, enabled research types, countries, blacklist, dedupe/verify flags).

**How to use**
- **Add source**: Provide name + feed URL + enabled.
- **Edit source**: Click a source name.
- **Enable/disable**: Use the toggle.
- **Sync now**: Manually pull new entries from a feed.
- **Config**: Adjust weights/rules; changes auto-save.

**Known gap**
- Research sync controls may be disabled as UI-only.

### 3.8 Audit Logs section
**What it’s for**
- Answer: “Who/what changed this?” and “Why did this publish/schedule/reject happen?”

**How to use**
1) Filter by origin (AI/Manual/System).
2) Filter by status (INFO/WARN/ERROR).
3) Use a date range when investigating incidents.
4) Open details or prompt details for deeper inspection.

### 3.9 Settings section
**What it’s for**
- System-level defaults + AI/Key configuration.

**How to use**
- **General settings**: Save operational defaults (region, daily limit, dedupe, etc.).
- **Model Profiles**: Create/edit/enable models that routing may use.
- **AI Router Defaults**: Choose which model profile to use for each task.
- **Key Vault**: Add/manage encrypted API keys (requires master key env var).

---

## 4. User Guide (Bengali / বাংলা)

### ৪.১ ড্যাশবোর্ড অংশ
**কাজ কী**
- সার্চ/ফিল্টার দিয়ে দ্রুত আইটেম খুঁজে রিভিউ খুলতে সাহায্য করে।

**কীভাবে ব্যবহার করবেন**
1) সার্চ বক্সে হেডলাইন/সামারি দিয়ে খুঁজুন।
2) স্ট্যাটাস, ক্যাটাগরি, তারিখ, স্কোর ফিল্টার ব্যবহার করুন।
3) যেকোনো আইটেমে **Review** চাপলে রিভিউ ওয়ার্কস্পেস খুলবে।

**নোট**
- কিছু KPI/পেজিনেশন অংশ এখনও UI-only হতে পারে।

### ৪.২ Drafts & Reviews অংশ
**কাজ কী**
- রিভিউ কিউ বোর্ড আকারে পরিচালনা করা (Draft → Review → Schedule/Publish অথবা Reject)।

**কীভাবে ব্যবহার করবেন**
1) বোর্ড ফিল্টার দিয়ে প্রয়োজনীয় আইটেম দেখুন।
2) কার্ডে ক্লিক করে রিভিউ খুলুন।
3) নতুন টপিক/প্রম্পট দিয়ে ড্রাফট বানাতে **Create Manual Draft** ব্যবহার করুন।

### ৪.৩ রিভিউ ওয়ার্কস্পেস
**কাজ কী**
- Provenance যাচাই, কমপ্লায়েন্স কন্ট্রোল সেট, এবং অ্যাকশন (Save/Schedule/Publish/Rewrite/Reject)।

**মূল অ্যাকশনগুলো**
- **Save as Draft**: ইমেজ কন্ট্রোল (approval + OG override) সেভ করে।
- **Approve for Scheduling**: শিডিউল ডায়ালগে নেয়।
- **Publish Now**: কনফার্মেশনের পর সাথে সাথে পাবলিশ করে।
- **Request Rewrite**: AI-কে পুনরায় লিখতে নির্দেশ পাঠায়।
- **Reject**: রিজেক্ট কারণ লগ করে।
- **Delete**: আইটেম ডিলিট/পর্জ করে (স্ট্যাটাস অনুযায়ী)।

**গুরুত্বপূর্ণ সীমাবদ্ধতা**
- রিভিউতে হেডলাইন/বডি টেক্সট পরিবর্তন করলে সেটি সবসময় সেভ নাও হতে পারে—পাবলিশের আগে নিশ্চিত করুন আপনার পরিবেশে টেক্সট এডিট পার্সিস্ট হচ্ছে কি না।

### ৪.৪ শিডিউলিং ডায়ালগ
**কাজ কী**
- ভবিষ্যতের একটি প্রকাশের সময় নির্ধারণ করা।

**কমন এরর**
- “Scheduled time must be in the future.” → ভবিষ্যতের সময় নির্বাচন করুন।

### ৪.৫ Master Control অংশ
**কাজ কী**
- পুরো অটোমেশন পাইপলাইন নিয়ন্ত্রণ (Pause/Resume/Emergency Stop/Run Now)।

### ৪.৬ Automation Logic অংশ
**কাজ কী**
- অটো ড্রাফট/শিডিউল/পাবলিশ অন/অফ এবং কনফিগ JSON সংরক্ষণ।

### ৪.৭ Sources অংশ
**কাজ কী**
- RSS সোর্স ম্যানেজ এবং রিসার্চ কনস্ট্রেইন্ট (weights, countries, blacklist ইত্যাদি) সেট করা।

### ৪.৮ Audit Logs অংশ
**কাজ কী**
- কোন অ্যাকশন কখন/কার মাধ্যমে হলো তা ট্রেস করা।

### ৪.৯ Settings অংশ
**কাজ কী**
- সিস্টেম সেটিংস, Model Profiles, AI Router defaults, এবং Key Vault key ম্যানেজ।

---

## 5. Tooltip Reference
| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
| Dashboard search | Find items by headline/summary text. | হেডলাইন/সামারি দিয়ে আইটেম খুঁজুন। |
| Dashboard filters | Narrow results by status, category, score, and date range. | স্ট্যাটাস/ক্যাটাগরি/স্কোর/তারিখ দিয়ে ফিল্টার করুন। |
| Review button | Open the review workspace for this item. | এই আইটেমের রিভিউ খুলুন। |
| Create Manual Draft | Generate a draft from a custom prompt. | কাস্টম প্রম্পট দিয়ে ড্রাফট তৈরি করুন। |
| Save as Draft | Save compliance/image controls and keep item in draft state. | কমপ্লায়েন্স/ইমেজ কন্ট্রোল সেভ করে ড্রাফট রাখুন। |
| Publish Now | Publish immediately (confirmation required). | সাথে সাথে পাবলিশ (কনফার্মেশন লাগবে)। |
| Approve for Scheduling | Move to scheduling and choose a publish time. | শিডিউলিংয়ে গিয়ে প্রকাশের সময় ঠিক করুন। |
| Reject | Reject this draft with an audited reason. | কারণসহ ড্রাফট রিজেক্ট করুন। |
| Request Rewrite | Ask AI to rewrite this draft using your instructions. | নির্দেশসহ AI রিরাইট রিকোয়েস্ট করুন। |
| Pause Pipeline | Temporarily stop automation operations. | অটোমেশন সাময়িকভাবে বন্ধ করুন। |
| Resume All | Return pipeline to normal operation. | পাইপলাইন আবার স্বাভাবিক করুন। |
| Emergency Stop | Lock the pipeline immediately (typed confirmation required). | জরুরি লকডাউন (টাইপড কনফার্মেশন লাগবে)। |
| Run Automation Now | Manually trigger the automation runner. | হাতে অটোমেশন রান করুন। |
| Sources: Sync now | Fetch new entries from this feed immediately. | এই ফিড থেকে সাথে সাথে নতুন এন্ট্রি আনুন। |
| Settings: Model Profiles | Create and manage models available for routing. | রাউটিংয়ের জন্য মডেল প্রোফাইল ম্যানেজ করুন। |
| Settings: AI Router defaults | Choose default model per task type. | প্রতিটি টাস্কের জন্য ডিফল্ট মডেল নির্বাচন করুন। |
| Settings: Key Vault | Store API keys encrypted at rest; UI shows masked values only. | API key এনক্রিপ্ট করে সংরক্ষণ; UI-তে শুধু masked দেখায়। |

---

## 6. Functionality Map
| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
| Admin loads | `GET /api/admin/news-engine/items`, `sources`, `settings`, `automation/config`, `audit-logs`, `pipeline/status` | Hydrates hub state (items, sources, automation toggles, audit logs, pipeline status). |
| Open review | — (UI action) | Opens Review modal for selected item. |
| Load provenance | `GET /api/admin/news-engine/items/[id]/provenance` | Shows RSS/research URLs and stage metadata. |
| Load image controls | `GET /api/admin/news-engine/items/[id]/image-controls` | Loads OG override + approval-required flag. |
| Save as Draft | `PUT /api/admin/news-engine/items/[id]/image-controls` | Persists image control fields per item. |
| Publish now | `POST /api/admin/news-engine/items/[id]/publish-now` | Sets item PUBLISHED, generates/ensures slug, writes audit log. |
| Schedule | `POST /api/admin/news-engine/items/[id]/schedule` | Sets item SCHEDULED with `scheduledFor` (must be future). |
| Reject | `POST /api/admin/news-engine/items/[id]/reject` | Sets item REJECTED + reason; audit trail updated. |
| Rewrite request | `POST /api/admin/news-engine/items/[id]/rewrite-request` | Records rewrite request and triggers rewrite behavior (if implemented). |
| Delete item | `DELETE /api/admin/news-engine/items/[id]` | Soft-delete item. |
| Purge rejected | `DELETE /api/admin/news-engine/items/[id]/purge` | Permanently deletes item (restricted usage). |
| Add/Edit source | `POST/PUT /api/admin/news-engine/sources` | Creates/updates source definition. |
| Toggle source enabled | `PUT /api/admin/news-engine/sources/[id]` | Enables/disables source ingestion. |
| Sync RSS source | `POST /api/admin/news-engine/sources/[id]/sync` | Imports new entries from RSS feed. |
| Sources config auto-save | `PUT /api/admin/news-engine/sources/config` | Stores research constraints/config JSON; writes audit log. |
| Automation toggles/config save | `PUT /api/admin/news-engine/automation/config` | Stores autoDraft/autoSchedule/autoPublish and config JSON; writes audit log. |
| Run automation now | `POST /api/admin/news-engine/automation/run-now` → internal runner | Calls internal runner with cron secret header; returns run payload. |
| Pause/resume/emergency stop | `POST /api/admin/news-engine/pipeline/pause|resume|emergency-stop` | Changes pipeline status; emergency requires confirm text. |
| Public list | `GET /api/news` | Lists published items; best-effort publishes due scheduled items first. |
| Public detail | `GET /api/news/[slug]` | Fetches published item by slug; best-effort publishes due scheduled items first. |

---

## 7. E2E Flows & System Health

### Typical flows
1) **RSS → Draft → Review → Schedule → Publish → Public**
   - Add/enable a source, sync it, let automation create drafts (or manual draft).
   - Review provenance and compliance.
   - Schedule or publish.
   - Verify the public feed shows the item.

2) **Manual Draft → Review → Publish**
   - Create a manual draft from a prompt.
   - Review and publish.

3) **Run automation now (operator confidence)**
   - Use Master Control to run automation.
   - Use Run Details and Audit Logs to validate behavior.

### How to verify end-to-end
- **Admin**
  - Hub loads without errors.
  - Sources sync returns imported count.
  - Review modal shows provenance and saves image controls.
  - Publish now results in a public item with a slug.

- **Public**
  - `/news` shows the item.
  - `/news/[slug]` renders content.

### Common errors & exact resolutions
- **“Database schema missing News Engine tables … P2021”**
  - Resolution: apply migrations (e.g., `npx prisma migrate deploy`) and retry.

- **Key Vault locked / cannot add keys**
  - Resolution: set a valid master key env var (see checklist section).

- **Run automation now fails: “NEWS_ENGINE_CRON_SECRET is not set”**
  - Resolution: set `NEWS_ENGINE_CRON_SECRET` and retry.

- **Publish now fails / requires confirmation**
  - Resolution: publish-now uses a confirmation phrase; ensure the confirmation flow is used.

- **Scheduling fails**
  - Resolution: scheduled datetime must be in the future and valid ISO format.

---

## 8. Testing & Verification Checklist
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npx prisma validate`
- [ ] Admin hub loads and shows items/sources/audit logs.
- [ ] Can add a source and see it listed.
- [ ] Can sync a source and see imported count.
- [ ] Can create a manual draft and see it in the board.
- [ ] Review modal loads provenance.
- [ ] Save-as-draft persists image controls (reopen modal to confirm).
- [ ] Schedule sets item to scheduled (future datetime).
- [ ] Publish now makes item appear in public feed.
- [ ] Master control can pause/resume; emergency stop requires typed confirmation.
- [ ] Run automation now returns a payload and produces audit entries.

### Required environment variables
- **Automation runner**
  - `NEWS_ENGINE_CRON_SECRET`

- **Key Vault**
  - `NEWS_ENGINE_KEY_VAULT_MASTER_KEY` (preferred) or `NEWS_KEY_VAULT_MASTER_KEY`
  - Accepted formats: 32-byte base64/base64url, or 64-char hex (optional `hex:` prefix)

- **Model provider keys**
  - Provider keys are expected to be stored in Key Vault (masked in UI).

---

## 9. Known Limitations / Edge Cases
- Some dashboard metrics and some “health” surfaces are UI-only and may not reflect real backend state.
- Review modal text edits (headline/body) may not persist unless specifically wired; confirm before relying on it for editorial updates.
- Schedule modal includes UI-only fields (priority/expiry/featured) that do not affect backend unless implemented.
- Public endpoints attempt best-effort scheduled publishing during reads; in high-traffic environments, consider a dedicated job/cron.

---

## 10. Final Sign-off
- [ ] All checklist items above are verified
- [ ] Feature is ready for production use
- **Sign-off by:**
- **Date:**

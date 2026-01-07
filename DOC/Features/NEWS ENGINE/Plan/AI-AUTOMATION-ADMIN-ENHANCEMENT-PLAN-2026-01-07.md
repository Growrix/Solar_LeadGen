# News Engine — AI Automation (Admin Deep Control) — Enhancement Plan

- **Date**: 2026-01-07
- **Scope**: AI + Automation only (Admin control + runner semantics + observability)
- **Goal**: Solve the current admin confusion by making AI automation **legible, controllable, and debuggable** end-to-end.
- **Model naming note**: When you see “GPT-5.2” below, I’m referring to GPT-5.2 as the deep research model choice.

Inputs (existing reality):
- RSS ingestion + internal runner exists (`/api/internal/news-engine/automation/run`).
- Draft generation exists (OpenAI JSON). Public rendering exists.
- Rules + research exist in DB, but not enforced/orchestrated.

---

## 1) Executive Summary (What you’ll get)

After this enhancement plan is implemented, an Admin will be able to:

- **Choose AI models per pipeline task** (e.g., Deep research GPT-5.2, Drafting o3-mini, SEO gpt-4o-mini).
- **Manage multiple API keys** (encrypted key vault) and assign keys to pools (Research / Drafting / Images) with rotation + health.
- **Control RSS + Scraper + Web/Trend research** with a clear decision system:
  - when a post is RSS-only,
  - when it must do web search,
  - when it must do trends.
- **Understand and trust automation** via a live tracking system:
  - last run, current run state,
  - queue counts,
  - run summaries,
  - per-item provenance (sources/research/model used).
- **Configure publish windows properly** (days + specific times + timezone) and preview the next publish slots.
- **Use Operational Rules that actually do something** (persisted, enforced, auditable), with tooltips and presets.
- **Generate AI images** for news posts (prompt → image → store) under admin control.

---

## 2) Admin Mental Model (Make it understandable)

### 2.1 Pipeline stages (fixed vocabulary)
Define and standardize a small set of stages:
1) Ingest (RSS)
2) Enrich (Scrape article page content)
3) Research (Web / Social / Journal / Trend)
4) Draft (Article + SEO + citations)
5) Gate (quality checks + policy checks)
6) Schedule (apply publish windows)
7) Publish

Every “Run” records:
- which stages were executed,
- inputs and outputs,
- skips and why.

### 2.2 Source-of-truth for provenance
Each `NewsItem` must expose:
- which RSS entry URLs were used,
- which research URLs were used,
- which model profile and key label were used per stage.

This is what removes the “no clear picture” feeling.

---

## 3) UX Upgrades (No new tabs required)

These changes stay inside the existing V6 tab structure.

### 3.1 Master Control: Run Automation Now becomes deterministic
**Current pain:** button feels like it does nothing.

**Required UX behavior:**
- Show RUNNING state (disable + spinner)
- On completion, show a **Run Summary**:
  - run ID
  - stage counts (RSS imported, entries selected, drafted, scheduled, published)
  - errors + link to run details
- Show “Blocked reason” when paused/locked.
- Add 2 modes:
  - Dry Run (no schedule/publish)
  - Live Run

### 3.2 Sources & Research: make Web/Trend research visible
Add panels:
- Recent RSS sync per source (last fetched, last error)
- Recent Research sync per kind (WEB/SOCIAL/JOURNAL/TREND)
- “Sync Research Now” buttons per kind
- “View Entries” for RSS entries and research entries

### 3.3 Automation Logic: Publish Windows v2 (your #1 pain point)
Replace the current “string list” with a proper builder:
- Timezone (required)
- Days of week
- One or more time ranges per day (09:00–11:00, 14:00–17:00)
- Optional jitter
- Optional blackout dates
- Preview: “Next 10 slots”

### 3.4 Operational Rules: define meaning + provide presets
Operational Rules must become a real rule engine:
- Scope: ingest/select/research/draft/gate/schedule/publish
- Conditions: category/source domain/keywords/score/time/day
- Action: allow/block/require review/force model/force research depth/schedule priority
- Severity: warn vs block

Provide presets:
- “Policy category requires manual review”
- “Block blacklisted keywords”
- “Require ≥2 independent sources/citations”
- “If duplicate similarity > 90% ignore”

Add tooltips everywhere the Admin is confused.

---

## 4) AI Model Router (Per Task)

### 4.1 Task types
Create stable task types:
- `research_deep`
- `research_fast`
- `draft_longform`
- `rewrite`
- `seo`
- `dedup_semantic`
- `image_prompt`
- `image_generate`

### 4.2 Admin-managed Model Profiles
Admin can define model profiles:
- name, provider, modelId
- cost tier label
- JSON mode required
- max tokens

### 4.3 Routing rules
- Default model per task type
- Overrides via operational rules
- Fallback chain

Example (your ask):
- Deep research → GPT-5.2
- Drafting → o3-mini
- SEO → gpt-4o-mini

---


## 5) Multiple API Keys (Admin Key Vault + Pools)

### 5.1 Requirements
- Store multiple keys for any supported AI provider (e.g., OpenAI, DeepSeek, Gemini, etc.)
- Allow entering and managing DeepSeek API keys, Gemini API keys, and others as needed
- Assign keys to pools
- Rotate on failures/rate limits
- Show key health without revealing raw keys

### 5.2 Security design
- Encrypt keys at rest using an env master key (e.g., `NEWS_ENGINE_KEYS_MASTER_KEY`).
- Only allow raw key input on create/update; never return the raw key again.

### 5.3 Key selection policy
- For a task type, select a pool.
- Use least-recently-used enabled key.
- On failure → rotate to next key, log the event.

### 5.4 Provider Flexibility
- Admin can add, edit, or remove API keys for any supported provider (OpenAI, DeepSeek, Gemini, etc.)
- Each model profile can be mapped to a specific provider and key pool
- UI should make it clear which keys are used for which models/tasks

---

## 6) Research Decision System (RSS vs Web vs Trend)

This is the missing clarity you explicitly asked for.

### 6.1 Candidate creation
- RSS Ingest creates candidates from `NewsSourceEntry`.
- Web/Trend research creates candidates from `NewsResearchEntry` queries.

### 6.2 Decision policy (simple + explainable)
For each candidate:
- Always scrape/enrich the primary URL if available.
- Choose research mode:
  - RSS-only if:
    - source domain is trusted AND
    - category is not “Policy/Legal” AND
    - content confidence score ≥ threshold.
  - Web research required if:
    - category requires verification OR
    - confidence low OR
    - RSS entry lacks detail.
  - Trend research required if:
    - Admin enabled trends and the topic matches trend query templates.

### 6.3 What Admin sees
- Each drafted item shows “Research used: RSS only / RSS + Web / Web only / Trend”.
- Click to view the URLs used.

---

## 7) Live Tracking System (Queue + Run History)

### 7.1 Run History
Add a read model and UI panel that lists recent runs:
- status, started/finished
- counts + errors
- link to details

### 7.2 Queue view
Expose queue counts:
- RSS NEW entries
- Research NEW entries
- Drafts needing review
- Scheduled due soon
- Errors

This should appear on Master Control and optionally in Audit Logs.

---


## 8) AI Image Generation & Post Image Options

### 8.1 Controls
- Enable/disable per category
- Require manual approval before publish
- Admin can choose image source policy per post:
  - AI-generated image (from prompt)
  - AI can search the web for a public, legal, relevant image (with source attribution)
  - Manual upload (admin can upload an image directly)

### 8.2 Pipeline
- Generate `image_prompt`
- Generate image (provider model) if enabled
- If web search is enabled, AI can suggest or auto-select a public image (with admin review)
- Store asset URL + metadata
- Attach to `NewsItem.ogImageUrl` (and optionally a dedicated media table)
- Allow admin to override or upload a custom image at any time
## 11) Post-Publish Editing & Manual Content Control

### 11.1 Edit & Republish Published Posts
- Admin can edit any published post, including:
  - Main content (title, body, summary)
  - Hashtags and metadata
  - Associated images
- After editing, admin can republish the post (with versioning/audit trail)

### 11.2 Manual Editing of AI Content
- All AI-generated content (drafts, published posts) can be manually edited by admin before or after publishing
- Edits are tracked for auditability
- Admin can adjust hashtags, correct errors, or improve content as needed

### 11.3 Acceptance Criteria (additions)
- Admin can edit and republish any published post
- Admin can manually edit hashtags and all AI-generated content

---

## 9) Implementation Phases (AI/Automation only)

### Phase A — Observability first (trust)
- Add run history endpoints + UI
- Add queue endpoints + UI
- Make Run Automation Now show live running state + summary

### Phase B — Publish windows v2
- Implement schedule builder schema and preview
- Update runner scheduling to use the computed schedule slots

### Phase C — Rules engine v2
- Persist operational rules (replace UI-only)
- Enforce rules in runner with audit logs (skip reasons)

### Phase D — Research decisioning
- Implement a clear RSS/Web/Trend policy
- Ensure each item shows provenance and “why”

### Phase E — Model router + multi-key
- Implement model profiles + task routing
- Implement key vault + pools + rotation

### Phase F — AI image generation
- Add image prompt + generate + attach + audit

---

## 10) Acceptance Criteria (AI/Automation only)

- Admin can see:
  - last run, last error, current queue counts
  - what’s blocked and why
- Publish windows support days/timezone and preview slots.
- Operational rules are enforced and explainable (“skipped because …”).
- Admin can set per-task models and see model used in logs.
- Admin can manage multiple API keys safely.
- Drafts clearly show where research came from (RSS/Web/Trend) + list of URLs.
- AI image generation is controllable and auditable.

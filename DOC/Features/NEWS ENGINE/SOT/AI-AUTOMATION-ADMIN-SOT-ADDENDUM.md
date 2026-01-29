# NEWS ENGINE — AI + Automation Admin Control — SOT Addendum (Admin Deep Control)

- Date: 2026-01-07
- Scope: **AI + Automation admin control surfaces only** (models, keys, rules, sources, scheduling windows, pipelines, observability).
- Purpose: Address Admin UX pain points and add “deep internal control” without destabilizing the existing V6 tab structure.

This addendum is **compatible with the existing V6 tabs**:
- Master Control
- Automation Logic
- Sources & Research
- Settings
- Audit Logs

It also clarifies semantics that were previously ambiguous (Publish Windows, Operational Rules, Run Automation Now).

---

## 1) Mental Model (Make the System Legible)

### 1.1 Pipeline is a sequence of stages
A “run” is a single execution of one or more stages:
1) **Ingest**: RSS + optional Scraper/Research sync
2) **Select**: dedup + relevance scoring + quotas/limits
3) **Research**: web/social/journal/trends evidence gathering
4) **Draft**: generate article + SEO + citations + OG image plan
5) **Gate**: quality/safety checks + optional human review
6) **Schedule**: place into publish windows
7) **Publish**: make public

Admin controls must map to one of:
- Input controls (sources, scraper, research scope)
- Routing controls (model selection + API key selection)
- Policy controls (operational rules)
- Timing controls (publish windows)
- Execution controls (run now / pause)
- Observability (what happened, why, and with which model/key)

### 1.2 “Automation Logic” vs “Operational Rules” (define it)
- **Automation Logic** = *when to run* + *what stages are allowed to auto-execute*.
  - Example: Auto-Draft ON, Auto-Schedule ON, Auto-Publish OFF.
- **Operational Rules** = *policy constraints* applied during Select/Research/Draft/Gate/Schedule.
  - Example: “Do not publish if citations < 2”, “Never cover topics matching blacklist”, “Max 6/day”, “If category=Policy then require manual review”.

---

## 2) Admin IA/UX Upgrade (No new pages required)

### 2.1 Master Control: Make “Run Automation Now” deterministic
**Problem:** Button runs but UI looks unchanged → operator distrust.

**Required UX behaviors:**
- Button should show a **RUNNING** state (spinner + disable) until runner responds.
- On completion, show a **Run Summary** card:
  - Run ID
  - Started/finished time
  - Stage counts: entries fetched, entries deduped, drafts created, scheduled, published
  - Errors count + “View errors” link
- Add two safe execution modes:
  - **Dry Run (simulate)**: runs ingest+select+research+draft but does not schedule/publish; writes audit logs.
  - **Run Now (live)**: follows current toggles and pipeline status.

**Operator clarity:**
- Display “Why run is blocked” when system is PAUSED/EMERGENCY_STOP.

### 2.2 Automation Logic tab: Replace ambiguous “Publish Windows” strings with a Schedule Builder
Keep the same area, but make it explicit:

**Publish Windows v2 (recurring schedule):**
- Timezone (e.g., `Australia/Sydney`) — required
- Days of week checkboxes (Mon…Sun)
- One or more time ranges per day (09:00–11:00, 14:00–17:00)
- Max publish count per window (optional)
- Jitter (optional, e.g. ±5 minutes) to avoid posting at exact times
- Blackout dates (holidays / maintenance)

**What windows mean (exact semantics):**
- When Auto-Schedule is ON: drafts approved for scheduling are placed into the **next available window** respecting quotas.
- When Auto-Publish is ON: publish is allowed **only inside windows** (unless explicit override).
- When Auto-Schedule is OFF: windows are still used as “recommended slots” for manual scheduling.

**Preview:**
- Show a computed “Next 10 slots” list based on these windows + timezone.

### 2.3 Operational Rules: Make it a Rules Engine with examples
Operational rules must answer two questions:
- **When does this apply?** (conditions)
- **What happens?** (action)

**Rule structure (admin-friendly):**
- Scope: `ingest | select | research | draft | gate | schedule | publish`
- Conditions: category/source type/source domain/keyword match/score thresholds/day/time
- Actions: allow/block/require manual review/force model/fallback model/schedule priority
- Severity: warn vs block

**Example rules (copy-paste presets):**
- “Policy posts require manual review”
- “Reject if blacklisted keywords detected”
- “Require citations >= 2 and sources >= 2”
- “If relevance < 80 then do not draft”
- “If duplicate similarity > 90 then ignore”
- “If category=Breaking then schedule in next window + priority=High”

### 2.4 Sources & Research: Explain “Web & Trend Research” by tying it to outputs
**Current confusion:** toggles/sliders exist but it’s unclear what they do.

**Make it explicit:**
- Each research toggle controls whether the system can create **Research Entries**.
- Show a “Recent Research Entries” panel:
  - Kind (WEB/SOCIAL/JOURNAL/TREND)
  - Query
  - Count imported
  - Last sync time
  - Link to view raw entries

**Admin control improvements:**
- Add “Sync Research Now” button (per kind)
- Add “Default Query Templates” per kind
  - e.g. “solar rebate {region}”, “grid approval backlog {country}”, “battery incentive 2026 {region}”

### 2.5 Settings: Split into “AI Router” + “Key Vault” + “Safety”
Keep the Settings tab, but group settings clearly.

---

## 3) Deep AI Control: Model Router (Per Task)

### 3.1 Task types (what the system actually does)
Define a finite list so configuration is stable:
- `research_deep`
- `research_fast`
- `draft_longform`
- `draft_short`
- `rewrite`
- `seo`
- `dedup_semantic`
- `image_prompt`
- `image_generate`

### 3.2 Model profiles (what admin configures)
Each profile is a named entry:
- Display name (Admin UI)
- Provider (OpenAI)
- Model ID (string)
- Use case tags (research/drafting/seo/image)
- Cost/latency tier label (Low/Med/High)
- JSON mode requirement (yes/no)
- Max tokens / truncation policy

### 3.3 Routing rules (how tasks choose a model)
Routing is controlled by:
- Default model per task type
- Optional overrides via Operational Rules
- Fallback model chain if primary fails

**Example routing (your ask):**
- Deep research → **GPT-5.2**
- Drafting → **o3-mini**
- SEO → **gpt-4o-mini**

---

## 4) Deep AI Control: Multiple API Keys (Key Vault + Pools)

### 4.1 Requirements
- Multiple keys stored and managed from Admin
- Keys can be assigned by model/task
- Support rotation, disable, quota caps
- Must not expose raw keys after save

### 4.2 Recommended design
- Keys are stored encrypted-at-rest (app-level encryption) with a single master key in environment variables.
- Admin UI supports:
  - Add key (one-time input)
  - Label (e.g. “Research Key #1”)
  - Assign to pool(s) (research, drafting, images)
  - Enable/disable
  - Optional daily budget cap
  - Health: last success, last error, last used

### 4.3 Key selection policy
For a given task:
- choose pool by task type (research/draft/seo/image)
- pick least-recently-used enabled key
- on rate-limit or auth failure → rotate to next key and log the event

---

## 5) AI Image Generation for News Posts

### 5.1 Admin control goals
- AI can generate a featured image per post
- Admin can decide when images are generated and whether they require approval

### 5.2 Suggested workflow
- Stage: `image_prompt` generates a safe, brand-appropriate image prompt + negative prompt.
- Stage: `image_generate` calls the image model and returns an image asset.
- Store:
  - image URL + metadata (prompt, model, size)
- Gate:
  - optional “Require image approval before publish” rule

### 5.3 Safety / compliance
- Add a hard rule: no faces/minors/logos unless you have rights.
- Add per-category style presets (e.g. “solar panels aerial photo style”, “abstract clean illustration”).

---

## 6) Auditability & Observability (Make It Debbugable)

### 6.1 Run History (mandatory)
Admin should be able to answer:
- What ran?
- What changed?
- Which model/key was used?
- Why was something skipped?

Minimum:
- Job runs table (AUTO_RUN + stage breakdown)
- Link each job run to audit log entries

### 6.2 Per-item provenance
Every News Item should expose:
- Source entry IDs used
- Research entry IDs used
- Model + key label used per stage (not raw key)
- Tokens/cost estimate (optional)

---

## 7) Tooltips & In-UI Explainability (Address your pain points)

Add tooltips on:
- Publish Windows (what it means + examples)
- Operational Rules (what it does + recommended presets)
- Web & Trend Research (what gets created + where it appears)
- Run Automation Now (what stages run + whether it publishes)
- Auto-Publish (why restricted + recommended safe path)

---

## 8) Acceptance Criteria (AI/Automation Admin Only)

- Admin can configure per-task models and see them reflected in logs.
- Admin can manage multiple keys, assign to pools, and see health/usage.
- Publish windows support day/time/timezone and preview upcoming slots.
- Operational rules are explainable, persisted, and enforced by the runner.
- Sources & Research toggles have a visible, testable output (research entries + sync history).
- Run Automation Now gives a run summary and clear running/finished states.
- AI image generation is controllable and auditable.

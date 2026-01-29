# AI News Engine — Frontend Plan (SOT)

## 0) Purpose
This document is the **Single Source of Truth** for building the **AI News Engine UI/UX** (admin-only) as a **sequence-locked** set of **pages → modals → confirmations**, optimized for **Google AI Studio** limitations.

Goal: Any AI or human can start frontend development **without context loss**.

---

## 1) Strict Rules (Must Follow)
These rules are taken from: `DOCS/Prompts/AI PROMPTING/AI Prompting Guideline.md`

- Do **not** build complex flows in one prompt.
- Break the feature into **pages first**, then **modals**.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the AI News Engine frontend flow.`
- Every click must map to: **what opens next**, fields/options, confirm/cancel behavior, and where the user returns.
- Do not jump ahead. If a next step exists, describe it in words only.

---

## 2) Scope & Constraints
### In Scope
- Admin dashboard navigation and **AI Content Engine → News Engine** section
- All News Engine pages listed in the initial plan
- All primary/secondary modals required for the E2E flow
- UI-only state handling: default, empty, loading placeholders, disabled actions

### Out of Scope (For This Plan)
- Backend logic, API design, RSS crawling, AI generation logic
- Automation orchestration (n8n/cron)
- Permission system implementation (only describe UX expectations)

---

## 3) Information Architecture (Routes / Pages)
Add a new top-level admin nav group:

- **AI Content Engine**
  - **News Engine** (main dashboard)
  - **Sources & Research**
  - **Drafts & Reviews**
  - **Schedule & Automation**
  - **Automation Control**
  - **Audit & Logs**
  - **Settings**

---

## 4) Core Domain Objects (UI-Level Only)
These are conceptual UI objects (no schema assumptions):

### 4.1 News Item (Card/Table Row)
Minimum fields to display in UI:
- Headline (AI-generated)
- Source type (Gov / Blog / Trend)
- Confidence score
- Status badge (see below)
- Created/updated time
- Primary CTA: **View Details** / **Review**

### 4.2 Statuses (User-Facing)
Status badge options from the initial plan:
- Research Done
- Draft Ready
- Needs Review
- Scheduled
- Published

Optional (Phase 2 / later): errors, blocked, duplicates. Do not implement now unless required.

---

## 5) E2E User Flow (Narrative)
This is the human-readable E2E path that every page/modal must support.

1) Admin opens **News Engine** dashboard → sees KPIs + feed.
2) Admin selects a news card → clicks **Review** (or **View Details**) → opens **AI News Draft View** modal.
3) In the modal admin can:
   - Approve for scheduling → opens **Scheduling** modal
   - Request rewrite → opens **Request Rewrite** modal
   - Reject → opens **Reject** modal
   - Save as Draft → stays in modal, shows saved feedback
4) Admin visits **Schedule & Automation** to manage rules and automation safeguards.
5) Admin visits **Automation Control** for global pause/resume/emergency stop.
6) Admin visits **Audit & Logs** to review history of AI + admin actions.

---

## 6) Build Sequence (Pages First, Modals Later)
Total Steps: **14**

1. News Engine (Main Dashboard Page)
2. Sources & Research (Setup Page)
3. Drafts & Reviews (Queue/Board Page)
4. Schedule & Automation (Rules Page)
5. Automation Control (Power Panel Page)
6. Audit & Logs (Logs Page)
7. Settings (Settings Page)
8. AI News Draft View (Core Modal)
9. Scheduling (Modal)
10. Test & Preview (Modal)
11. Request Rewrite (Modal)
12. Reject (Modal)
13. Add/Edit Source (Modal)
14. Confirmation Modals (Publish / Pause / Emergency Stop)

---


# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

**How to use this plan:**
- For each step, find the section titled `Copy: Step X of 14 — ...`.
- Copy the prompt block under that heading and paste it into Google AI Studio.
- After running each prompt, check the "Expected Outcome" section to verify the UI matches the plan before moving to the next step.
- Always proceed in order (Step 1, then Step 2, etc). Do not skip ahead.

---

## Copy: Step 1 of 14 — News Engine (Main Dashboard Page)
### Purpose
Single core screen where admins see:
- What AI found
- What AI created
- What is pending
- What is automated

### Layout
**A) Page Header**
- Title: “News Engine”
- Right-side actions:
  - Button: “Pause Automation” (opens Step 14 confirmation modal)
  - Button: “Test & Preview” (opens Step 10 modal)

**B) KPI Strip (Top KPIs)**
- News Found Today
- Drafts Pending Review
- Scheduled Posts
- Automation Status (ON/OFF)

**C) Filters Row**
- Status (dropdown)
- Source type (dropdown)
- Confidence range (slider or dropdown buckets)
- Date range
- Search (headline)

**D) AI News Feed (Card-based OR table-based; choose one and stay consistent)**
Each item shows:
- Headline
- Source type
- Confidence score
- Status badge
- Updated timestamp
- Actions:
  - Primary: “Review” (opens Step 8 modal)
  - Secondary: “View Details” (also opens Step 8 modal; same destination, different label)

### Interaction Map (Explicit)
- Clicking “Review” → opens **AI News Draft View** modal (Step 8)
- Clicking “Pause Automation” → opens confirm modal (Step 14: Pause)
- Clicking “Test & Preview” → opens **Test & Preview** modal (Step 10)

### States
- Default: feed loaded
- Loading: skeleton cards/rows
- Empty: “No news items match your filters” + “Reset filters”
- Disabled actions: if automation is already paused, “Pause Automation” becomes disabled (label: “Automation Paused”)

### What to expect in the outcome
- You should see a full Admin News Engine dashboard page with:
  - Header (with Pause Automation and Test & Preview buttons)
  - KPI strip (News Found Today, Drafts Pending Review, etc)
  - Filters row
  - News Feed (cards or table)
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 1 of 14 in the AI News Engine frontend flow.

Task:
Design the Admin "News Engine" main dashboard page with:
- Header + actions (Pause Automation, Test & Preview)
- KPI strip
- Filters
- AI News Feed (cards or table)

User interactions:
- Clicking "Review" or "View Details" opens the AI News Draft View modal (do not design the modal yet).
- Clicking "Pause Automation" opens a confirmation modal (do not design it yet).
- Clicking "Test & Preview" opens the Test & Preview modal (do not design it yet).

Constraints:
- No backend logic
- No modal implementations
- Do not design future pages/modals

Output:
- UI layout + component breakdown
- Explicit empty/loading states

Stop after:
- Page-level UI only
```

---Done

## Copy: Step 2 of 14 — Sources & Research (Setup Page)
### Purpose
Control where AI is allowed to research from.

### Layout
**A) Header**
- Title: “Sources & Research”

**B) RSS Source Manager**
- Table/list of sources
  - Name
  - URL
  - Type (Government / News / Solar Blogs / Rebates & Announcements)
  - Toggle ON/OFF
  - Last checked (UI placeholder)
  - Actions: Edit, Remove
- Primary CTA: “Add Source” → opens Step 13 Add/Edit Source modal

**C) Web & Trend Research**
- Toggle: Enable Google Trends (topic-based)
- Toggle: Enable keyword-based discovery
- Priority sliders:
  - News urgency
  - Evergreen relevance

**D) Research Rules Panel**
- Minimum sources required per article
- Allowed countries
- Blacklisted domains
- Duplicate detection toggle

### Interaction Map
- Click “Add Source” → Step 13 modal
- Click “Edit” source → Step 13 modal (prefilled)

### States
- Empty source list state
- Disabled rules while “Research globally disabled” (if you add such a toggle, it must be simple and explicit)

### What to expect in the outcome
- You should see a Sources & Research admin page with:
  - RSS Source Manager (list/table with toggles)
  - Web & Trend Research toggles and sliders
  - Research Rules Panel
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 2 of 14 in the AI News Engine frontend flow.

Task:
Design the "Sources & Research" admin page with:
- RSS Source Manager (list/table with toggles)
- Web & Trend Research toggles and priority sliders
- Research Rules Panel (min sources, allowed countries, blacklist, duplicate toggle)

User interactions:
- Clicking "Add Source" or "Edit" opens the Add/Edit Source modal (do not design the modal yet).

Constraints:
- No backend logic
- No modal implementation
- Do not design other pages/modals

Output:
- UI structure and states (loading/empty)

Stop after:
- This page only
```

---DONE

## Copy: Step 3 of 14 — Drafts & Reviews (Queue/Board Page)
### Purpose
A transparent board of all work-in-progress and publish states.

### Layout
**A) Header**
- Title: “Drafts & Reviews”

**B) Kanban Board**
Columns:
- Research Done
- Draft Ready
- Needs Review
- Scheduled
- Published

Card minimum:
- Headline
- Source type
- Status
- Confidence
- Time-to-publish indicator (UI placeholder)
- Action: “Open” (opens Step 8 AI News Draft View modal)

### Interaction Map
- Click card “Open” → Step 8 modal
- Drag-and-drop is optional in the initial plan; if included, keep it **manual-only** and show confirmation when moving to “Scheduled” (opens Step 9 scheduling modal).

### States
- Empty per-column state
- Loading skeleton

### What to expect in the outcome
- You should see a Kanban-style board with columns for each news status (Research Done, Draft Ready, etc).
- Each card should have headline, status, confidence, and an Open button.
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 3 of 14 in the AI News Engine frontend flow.

Task:
Design the "Drafts & Reviews" page as a Kanban-style status board with columns:
Research Done → Draft Ready → Needs Review → Scheduled → Published

User interactions:
- Clicking a card opens the AI News Draft View modal (do not design it yet).
- If drag-and-drop is implemented, moving into Scheduled triggers the Scheduling modal (do not design it yet).

Constraints:
- No backend logic
- Do not design future pages/modals

Output:
- Board layout, card design, and empty/loading states

Stop after:
- This page only
```

---DONE

## Copy: Step 4 of 14 — Schedule & Automation (Rules Page)
### Purpose
Control auto vs manual publishing (admin-controlled).

### Layout
**A) Header**
- Title: “Schedule & Automation”

**B) Automation Rules**
- Toggle: Auto-draft generation ON/OFF
- Toggle: Auto-schedule after approval ON/OFF
- Auto-publish without approval: shown as disabled/not recommended (per initial plan)

**C) Rule Examples Section (Editable List)**
Examples (from initial plan):
- “Max 2 news/day”
- “Govt news = high priority”
- “Rebate news publishes within 12 hours”

### Interaction Map
- Add/edit rule uses inline UI (no modal required unless necessary)

### States
- Empty rule list state
- Validation state (simple): missing value highlights

### What to expect in the outcome
- You should see a Schedule & Automation admin page with:
  - Automation toggles
  - Editable rules list
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 4 of 14 in the AI News Engine frontend flow.

Task:
Design the "Schedule & Automation" admin page with:
- Automation toggles (auto-draft, auto-schedule)
- A rules list editor (e.g., max/day, priority, publish windows)
- Clear UI that auto-publish without approval is not enabled by default

Constraints:
- No backend logic
- Do not design modals unless required

Output:
- UI structure + empty/loading states

Stop after:
- This page only
```

---DONE

## Copy: Step 5 of 14 — Automation Control (Power Panel Page)
### Purpose
Global safety controls.

### Layout
**A) Header**
- Title: “Automation Control”

**B) Global Controls**
- Pause ALL automation (opens Step 14 Pause confirm modal)
- Resume automation (opens Step 14 Resume confirm modal)
- Emergency stop (opens Step 14 Emergency confirm modal)

**C) Per-Feature Toggles**
- RSS ingestion
- Trend scanning
- AI drafting
- Auto scheduling
- Auto updates

**D) Safety Indicators**
- Last automation run
- Errors detected
- Blocked actions

### Interaction Map
- Clicking Pause/Resume/Emergency stop → Step 14 confirmations

### States
- Indicators empty state (no runs yet)

### What to expect in the outcome
- You should see an Automation Control page with:
  - Global controls (Pause, Resume, Emergency Stop)
  - Per-feature toggles
  - Safety indicators
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 5 of 14 in the AI News Engine frontend flow.

Task:
Design the "Automation Control" page with:
- Global controls (Pause, Resume, Emergency Stop)
- Per-feature toggles
- Safety indicators

User interactions:
- Each global control opens its own confirmation modal (do not design those yet).

Constraints:
- No backend logic
- Do not design future pages/modals

Output:
- UI structure and states

Stop after:
- This page only
```

---DONE

## Copy: Step 6 of 14 — Audit & Logs (Logs Page)
### Purpose
Every AI action must be logged and filterable.

### Layout
**A) Header**
- Title: “Audit & Logs”

**B) Filters**
- Date
- Source
- Status
- AI vs Manual

**C) Logs Table**
Columns:
- Time generated
- Source used
- Prompt used (short preview + “View”)
- Admin action
- Publish status

### Interaction Map
- Clicking “View” on prompt used opens a lightweight drawer/modal (optional). If you add it, keep it minimal and single-intent.

### States
- Empty logs state
- Loading skeleton

### What to expect in the outcome
- You should see an Audit & Logs page with:
  - Filters (date, source, status, AI/manual)
  - Logs table (source, prompt, time, admin action, publish status)
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 6 of 14 in the AI News Engine frontend flow.

Task:
Design the "Audit & Logs" page with:
- Filters (date, source, status, AI vs manual)
- Logs table showing source used, prompt used, time, admin action, publish status

Constraints:
- No backend logic
- Avoid adding extra features not specified

Output:
- UI structure and empty/loading states

Stop after:
- This page only
```

---DONE

## Copy: Step 7 of 14 — Settings (Settings Page)
### Purpose
A single place for News Engine configuration that doesn’t fit other pages.

### Layout (Minimal)
- Default country/region (if relevant)
- Default “max drafts per day” (if not already in rules)
- Duplicate detection default (if not already in rules)

### What to expect in the outcome
- You should see a minimal Settings page for News Engine.
- No modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 7 of 14 in the AI News Engine frontend flow.

Task:
Design a minimal "Settings" page for the News Engine.

Constraints:
- Keep it minimal and aligned with previously defined controls
- No backend logic

Output:
- UI layout and states

Stop after:
- This page only
```

---DONE

## Copy: Step 8 of 14 — AI News Draft View (Core Modal)
### Trigger
Opened when admin clicks **Review / View Details / Open** from:
- News Engine dashboard (Step 1)
- Drafts & Reviews board (Step 3)

### Purpose
Allow admin to review AI research + generated article, then decide: approve/schedule, request rewrite, reject, or save as draft.

### Modal Layout
**Header**
- Headline
- Status badge
- Confidence score
- Close (X)

**Body: Tabbed layout (from initial plan)**
Tab 1: Research Summary
- Sources list (clickable links)
- Key findings
- “Why this matters” (AI reasoning)

Tab 2: Generated Article
- Headline options (select one)
- Article body (editable)
- Highlighted AI sections (visual emphasis only)

Tab 3: SEO & Compliance
- SEO title/meta
- Keywords
- Risk warnings
- Govt-policy sensitivity flag

Tab 4: Version History
- Draft v1/v2/v3 list
- AI rewrite reasons
- Admin edits tracked

**Footer Actions**
- Primary: “Approve for Scheduling” → opens Step 9 Scheduling modal
- Secondary: “Request Rewrite” → opens Step 11 modal
- Secondary: “Reject” → opens Step 12 modal
- Secondary: “Save as Draft” → saves (UI feedback inline), stays in modal

### Interaction Map
- Approve for Scheduling → Scheduling modal
- Request Rewrite → Request Rewrite modal
- Reject → Reject modal
- Close (X) → returns user to the page where it was opened, preserving scroll/filter state

### States
- Loading: skeleton content per tab
- Disabled actions: if status is Published, disable Approve/Schedule and show “Already published”

### What to expect in the outcome
- You should see a modal with:
  - Header (headline, status, confidence)
  - Tabs (Research Summary, Generated Article, SEO & Compliance, Version History)
  - Footer actions (Approve for Scheduling, Request Rewrite, Reject, Save as Draft)
- No nested modals or backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 8 of 14 in the AI News Engine frontend flow.

Trigger:
Opened when user clicks "Review" / "View Details" from the News Engine dashboard or Drafts & Reviews board.

Purpose:
Allow admin to review research + generated article and take actions.

Modal sections:
- Header with headline, status, confidence
- Tabs: Research Summary, Generated Article, SEO & Compliance, Version History
- Footer actions: Approve for Scheduling, Request Rewrite, Reject, Save as Draft

Next flow:
- Approve for Scheduling opens the Scheduling modal (do not design it yet)
- Request Rewrite opens the Request Rewrite modal (do not design it yet)
- Reject opens the Reject modal (do not design it yet)

Constraints:
- No backend logic
- Do not design nested future modals

Output:
- Detailed modal layout and UX behavior
- Loading/disabled states

Stop after:
- This modal only
```

---DONE

## Copy: Step 9 of 14 — Scheduling (Modal)
### Trigger
From Step 8 footer: “Approve for Scheduling”

### Purpose
Manual override scheduling.

### Fields (from initial plan)
- Publish date & time
- Priority level
- Expiry date (optional)
- Pin as featured (optional)

### Buttons
- Confirm Schedule
- Cancel

### Behavior
- Confirm → closes modal, returns to Step 8 modal and shows “Scheduled” status immediately in UI
- Cancel → returns to Step 8 modal unchanged

### What to expect in the outcome
- You should see a modal with:
  - Fields for publish date/time, priority, expiry, pin as featured
  - Confirm and Cancel buttons
- No backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 9 of 14 in the AI News Engine frontend flow.

Trigger:
Opened from the AI News Draft View modal when admin clicks "Approve for Scheduling".

Purpose:
Allow admin to schedule publishing.

Modal fields:
- Publish date & time
- Priority
- Expiry date (optional)
- Pin as featured (optional)

Confirm/cancel behavior:
- Confirm updates the UI status to Scheduled and returns to previous context
- Cancel returns without changes

Constraints:
- No backend logic

Output:
- Detailed modal layout and validation/disabled states

Stop after:
- This modal only
```

---Done

## Copy: Step 10 of 14 — Test & Preview (Modal)
### Trigger
From Step 1 header action: “Test & Preview”

### Purpose
Admin can run a manual test and preview output before going live.

### Layout
- Input: “Test source URL” OR “Select source from list” (simple)
- Input: Topic/keyword (optional)
- Preview panel (read-only)
- Buttons:
  - Run Test
  - Simulate Publish (no real publish)
  - Close

### Behavior
- Run Test → shows loading state and then preview content
- Simulate Publish → shows confirmation message only (no navigation)

### What to expect in the outcome
- You should see a modal with:
  - Test input fields (source URL, topic/keyword)
  - Preview output panel
  - Run Test, Simulate Publish, Close buttons
- No backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 10 of 14 in the AI News Engine frontend flow.

Trigger:
Opened from the News Engine dashboard header via "Test & Preview".

Purpose:
Let admin test generation and preview results before going live.

Modal sections:
- Test inputs (source URL or select source)
- Optional topic/keyword
- Preview output panel
- Actions: Run Test, Simulate Publish, Close

Constraints:
- No backend logic

Output:
- Detailed modal UX including loading/empty/disabled states

Stop after:
- This modal only
```

---DONE

## Copy: Step 11 of 14 — Request Rewrite (Modal)
### Trigger
From Step 8 footer: “Request Rewrite”

### Purpose
Collect rewrite intent before triggering AI rewrite later.

### Fields (UI-only)
- Rewrite reason (textarea)
- Rewrite intensity (dropdown: light/medium/heavy)
- Focus areas (checkboxes): headline, intro, compliance, SEO, tone

### Buttons
- Submit rewrite request
- Cancel

### Behavior
- Submit → returns to Step 8 modal and adds a new Version History entry placeholder

### What to expect in the outcome
- You should see a modal with:
  - Reason textarea
  - Intensity dropdown
  - Focus area checkboxes
  - Submit and Cancel buttons
- No backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 11 of 14 in the AI News Engine frontend flow.

Trigger:
Opened from AI News Draft View modal when admin clicks "Request Rewrite".

Purpose:
Capture rewrite request details.

Modal fields:
- Reason textarea
- Intensity dropdown
- Focus area checkboxes

Behavior:
- Submit closes and returns to the Draft View modal
- Cancel closes and returns without changes

Constraints:
- No backend logic

Output:
- Detailed modal layout and validation states

Stop after:
- This modal only
```

---DONE

## Copy: Step 12 of 14 — Reject (Modal)
### Trigger
From Step 8 footer: “Reject”

### Purpose
Capture rejection reason.

### Fields
- Reject reason (textarea)
- Optional tags (checkboxes): duplicate, low confidence, off-topic, policy risk

### Buttons
- Confirm Reject
- Cancel

### Behavior
- Confirm → closes, returns to Step 8 modal with status updated to “Rejected” (UI-only). “Approve for Scheduling” becomes disabled.

### What to expect in the outcome
- You should see a modal with:
  - Reason textarea
  - Optional tags (checkboxes)
  - Confirm and Cancel buttons
- No backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 12 of 14 in the AI News Engine frontend flow.

Trigger:
Opened from AI News Draft View modal when admin clicks "Reject".

Purpose:
Capture rejection reason and confirm rejection.

Modal fields:
- Reason textarea
- Optional categorical checkboxes

Behavior:
- Confirm updates UI state to rejected and returns to Draft View modal
- Cancel returns without changes

Constraints:
- No backend logic

Output:
- Detailed modal layout, validation, disabled states

Stop after:
- This modal only
```

---DONE

## Copy: Step 13 of 14 — Add/Edit Source (Modal)
### Trigger
From Step 2: “Add Source” or “Edit”

### Fields
- Source name
- Source URL
- Source type (Government / News / Solar Blogs / Rebates & Announcements)
- Enabled toggle

### Buttons
- Save
- Cancel

### Behavior
- Save → returns to Sources list and shows it immediately

### What to expect in the outcome
- You should see a modal with:
  - Fields for name, URL, type, enabled toggle
  - Save and Cancel buttons
- No backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 13 of 14 in the AI News Engine frontend flow.

Trigger:
Opened from Sources & Research page via Add Source or Edit.

Purpose:
Create or edit an RSS source.

Modal fields:
- Name
- URL
- Type
- Enabled toggle

Behavior:
- Save returns to Sources page and updates the list
- Cancel closes without changes

Constraints:
- No backend logic

Output:
- Detailed modal layout and validation

Stop after:
- This modal only
```

---DONE

## Copy: Step 14 of 14 — Confirmation Modals (Publish / Pause / Emergency Stop)
### Purpose
Provide safe, explicit confirmation for high-impact actions.

### 14A) Pause Automation Confirmation
Trigger: from Step 1 or Step 5
- Copy: “Pause all automation?”
- Buttons: Confirm Pause / Cancel

### 14B) Resume Automation Confirmation
Trigger: Step 5
- Copy: “Resume automation?”
- Buttons: Confirm Resume / Cancel

### 14C) Emergency Stop Confirmation
Trigger: Step 5
- Copy: “Emergency stop will block all automation immediately.”
- Buttons: Emergency Stop / Cancel

### 14D) Publish Confirmation (Optional if publish is exposed as an action)
If you add a direct “Publish” action in the UI, it must be confirmed.

### What to expect in the outcome
- You should see a confirmation modal for a single high-impact action (Pause, Resume, Emergency Stop, or Publish).
- Modal should have clear warning, Confirm and Cancel buttons, and update the UI state on confirm.
- No backend logic yet.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 14 of 14 in the AI News Engine frontend flow.

Task:
Design ONE confirmation modal for a single high-impact action (Pause automation OR Resume automation OR Emergency stop OR Publish).

Requirements:
- Clear warning copy
- Confirm + Cancel
- On confirm: close modal and reflect the new state in the originating page

Constraints:
- Do not combine multiple confirmations into one modal

Output:
- Modal layout and UX behavior

Stop after:
- This modal only
```

---

## 7) Cross-Cutting UX Requirements (Applies Everywhere)
- Preserve filter state and scroll position when opening/closing modals.
- Buttons must show disabled state when action is not allowed for the current status.
- Any status change should be reflected immediately in UI (optimistic UI behavior).
- Avoid undefined transitions: if user clicks X, the next UI must be explicitly specified.

---

## 8) Deliverable Checklist (Frontend)
- All 7 pages exist and are reachable from admin navigation.
- All modals open from the correct triggers.
- Every action has a deterministic next step.
- Default/empty/loading/disabled states are defined for each surface.

---

## 9) Phase 2 (Optional, Not In Current Build)
From initial plan:
- Confidence heatmap
- Topic trend graphs
- Auto-suggested updates to old news
- Cross-linking suggestions

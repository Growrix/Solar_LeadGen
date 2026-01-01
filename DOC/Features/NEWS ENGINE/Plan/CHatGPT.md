Perfect — this is the **right moment** to lock the **frontend control surface** before touching logic or automation.

Below is an **E2E FRONTEND PLAN** for the **AI News Engine + Automation Control**, written as a **product/UI blueprint**, not technical implementation.
This is safe to build **first**, and everything backend/AI/automation can plug into it later.

---

# 🧠 AI News Engine — E2E Frontend Plan (Admin-Controlled)

## 🎯 Goal of This Frontend

Give **admins full visibility and control** over:

* Where news comes from
* How AI researches & writes
* What gets published
* When automation runs
* What requires human approval

👉 Admin effort = **approve / adjust / override**, not manual writing.

---

# 🧱 HIGH-LEVEL FRONTEND STRUCTURE

### Admin Navigation (New Section)

```
Admin Dashboard
 └── AI Content Engine
      ├── News Engine
      │    ├── News Feed (AI Generated)
      │    ├── Sources & Research
      │    ├── Drafts & Reviews
      │    ├── Schedule & Automation
      │    ├── Publishing Logs
      │    └── Settings
```

---

# 📰 1. NEWS ENGINE – MAIN DASHBOARD (CORE SCREEN)

### Purpose

Single screen where admin understands:

* What AI found
* What AI created
* What is pending
* What is automated

### Layout Sections

* **Top KPIs**

  * News Found Today
  * Drafts Pending Review
  * Scheduled Posts
  * Automation Status (ON/OFF)

* **AI News Feed (Card-based)**
  Each card shows:

  * Headline (AI-generated)
  * Source type (Gov / Blog / Trend)
  * Confidence score
  * Status badge:

    * Research Done
    * Draft Ready
    * Needs Review
    * Scheduled
    * Published

* **Quick Actions**

  * Review
  * Edit
  * Reject
  * Schedule
  * Pause Automation (global)

---

# 🔎 2. SOURCES & RESEARCH CONTROL (SETUP SCREEN)

### Purpose

Control **where AI is allowed to research from**

### Sections

#### A. RSS Source Manager

* List of sources
* Toggle ON/OFF
* Source type:

  * Government
  * News
  * Solar Blogs
  * Rebates & Announcements

#### B. Web & Trend Research

* Enable:

  * Google Trends (topic-based)
  * Keyword-based discovery
* Priority sliders:

  * News urgency
  * Evergreen relevance

#### C. Research Rules Panel

Admin defines:

* Minimum sources required per article
* Allowed countries
* Blacklisted domains
* Duplicate detection toggle

---

# ✍️ 3. AI NEWS DRAFT VIEW (CORE MODAL)

### This is the MOST IMPORTANT UI

#### Modal Sections (Tabbed)

**Tab 1: Research Summary**

* Sources list (clickable)
* Key findings
* AI reasoning (“Why this matters”)

**Tab 2: Generated Article**

* Headline options
* Full article body
* Inline edit
* Highlighted AI sections

**Tab 3: SEO & Compliance**

* SEO title/meta
* Keywords
* Risk warnings
* Govt-policy sensitivity flag

**Tab 4: Version History**

* Draft v1, v2, v3
* AI rewrite reasons
* Admin edits tracked

#### Footer Actions

* Approve for Scheduling
* Request Rewrite
* Reject
* Save as Draft

---

# ⏰ 4. SCHEDULING & AUTOMATION PANEL

### Purpose

Control **auto vs manual publishing**

---

## A. Automation Rules Screen

Admin can define:

* Auto-draft generation: ON/OFF
* Auto-schedule after approval: ON/OFF
* Auto-publish without approval: ❌ (never allowed by default)

### Rule Examples:

* “Max 2 news/day”
* “Govt news = high priority”
* “Rebate news publishes within 12 hours”

---

## B. Scheduling Modal

Used for **manual override**

Fields:

* Publish date & time
* Priority level
* Expiry date (optional)
* Pin as featured (optional)

---

# 🧾 5. NEWS QUEUE & STATUS BOARD

### Kanban-style Board

```
Research Done → Draft Ready → Needs Review → Scheduled → Published
```

Each card:

* Drag & drop (manual)
* Automation label (AI / Manual)
* Time-to-publish indicator

This gives **full transparency**.

---

# 🧠 6. AUTOMATION CONTROL CENTER (POWER PANEL)

### Global Controls

* Pause ALL automation
* Resume automation
* Emergency stop

### Per-Feature Toggles

* RSS ingestion
* Trend scanning
* AI drafting
* Auto scheduling
* Auto updates

### Safety Indicators

* Last automation run
* Errors detected
* Blocked actions

---

# 🧪 7. TEST & PREVIEW MODAL

Admin can:

* Run AI manually on a source
* Preview generated news
* Test schedule
* Simulate publish (no real publish)

This is **critical before going live**.

---

# 📜 8. AUDIT & LOGS SCREEN (NON-NEGOTIABLE)

Every AI action logged:

* Source used
* Prompt used
* Time generated
* Admin action
* Publish status

Filters:

* Date
* Source
* Status
* AI vs Manual

---

# 🧠 OPTIONAL ADVANCED UI (PHASE 2)

* Confidence heatmap
* Topic trend graphs
* Auto-suggested updates to old news
* Cross-linking suggestions

---

# 🧩 HOW THIS HELPS YOU BUILD FRONTEND FIRST

✅ You can build:

* Pages
* Modals
* State handling
* Empty states
* Permissions
* UX flows

❌ Without:

* AI
* RSS
* n8n
* Backend logic

Backend can later **attach** to these controls safely.

---

# 🧭 WHAT I RECOMMEND NEXT (Very Important)

Next steps **in order**:

1. Lock this UI as **NewsEngine.SOT.md**
2. Build frontend skeleton + modals
3. Add fake/mock data
4. Only then integrate automation

If you want, next I can:

* Convert this into **exact page list + modal list**
* Or create **Admin user stories only for News Engine**
* Or map **n8n automation → UI control mapping**

Just tell me the next move.

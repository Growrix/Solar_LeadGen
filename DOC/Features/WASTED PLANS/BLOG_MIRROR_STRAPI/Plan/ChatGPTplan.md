Perfect.
We’ll do this **the right way**, aligned with your core instruction:

> **Always start with user stories → define WHAT we build → only later HOW we build**

Strapi is your **Source of Truth (SOT)** and **inspiration**, not a dependency.
We are **mirroring Strapi-like capabilities**, but **custom-built inside your SaaS**, tightly integrated with your Solar Lead platform.

---

# PHASE 0 — PRODUCT INTENT (Why we are building this)

### Business goals

* Own the **entire content pipeline** (no vendor lock-in)
* Deeply integrate blog + SEO + AI + lead gen
* Allow **automation-heavy workflows** (AI research, RSS ingestion, content scoring)
* Multi-role CMS (Admin, Editor, AI Agent)
* Scale beyond “blog” → content engine (guides, landing pages, comparisons, calculators)

---

# PHASE 1 — USER ROLES (WHO uses this system)

We define **roles before features**.

### 1️⃣ Super Admin (Platform Owner)

* Owns the CMS system
* Controls structure, permissions, automations
* Sees global analytics

### 2️⃣ Content Admin

* Manages content types
* Reviews & publishes content
* Controls SEO & categories

### 3️⃣ Editor / Writer

* Writes and edits content
* Uses AI assistance
* Cannot change system rules

### 4️⃣ AI Agent (System Role)

* Generates drafts
* Pulls RSS & research
* Suggests SEO improvements
* Never publishes without approval

### 5️⃣ Public User (Reader)

* Consumes content
* Converts into leads

---

# PHASE 2 — CORE USER STORIES (WHAT we will build)

## A. CMS FOUNDATION (Strapi-Inspired Core)

### 🧩 Content Type Builder (SOT Core)

**As an Admin, I want to**

* Create content types (Blog, Page, Guide, FAQ, Landing Page)
* Define fields (text, rich text, image, relation, SEO fields)
* Control required/optional fields
* Reuse content types across the platform

📌 This is the **heart** of Strapi → must be phase-1 stable.

---

### 🧩 Content Entry Management

**As an Editor, I want to**

* Create, edit, duplicate, and archive content
* Save drafts
* Preview content before publishing
* See content status (Draft / Review / Scheduled / Published)

---

### 🧩 Media Library

**As a Content Admin, I want to**

* Upload images/files
* Organize media with folders & tags
* Reuse media across posts
* Optimize images automatically (future phase)

---

## B. BLOG FEATURE (Public-Facing)

### 📝 Blog System

**As a Public User, I want to**

* Browse blogs by category, tag, author
* Read SEO-optimized blog pages
* See related articles

**As Admin, I want to**

* Control blog layout globally
* Assign categories/tags
* Mark posts as Featured / Evergreen

---

### 🔍 SEO SYSTEM (Strapi ++)

**As a Content Admin, I want to**

* Control meta title, description, OG tags
* Generate SEO previews (Google / Facebook)
* Track SEO score per article
* Define canonical URLs

📌 This must be **native**, not plugin-based.

---

## C. AI-POWERED CONTENT ENGINE (Differentiator)

### 🤖 AI Draft Generation

**As a Content Admin, I want to**

* Generate blog drafts from:

  * Topic
  * Keywords
  * Competitor URLs
  * RSS feeds

**As Editor, I want**

* AI suggestions inline
* Tone control
* Section-wise regeneration

---

### 📡 RSS → AI → Draft Pipeline

**As Admin, I want to**

* Add RSS sources (news, solar blogs, gov sites)
* Auto-pull articles
* Summarize + rewrite via AI
* Save as Draft (never auto-publish)

---

### 🧠 Content Intelligence

**As Admin, I want to**

* See:

  * Content freshness score
  * SEO score
  * Duplicate risk
  * Topic gap suggestions

---

## D. WORKFLOW & APPROVAL SYSTEM

### 🔄 Editorial Workflow

**As Admin, I want**

* Multi-step workflow:

  * Draft → Review → Approved → Scheduled → Published
* Role-based permissions per step
* Commenting on drafts (internal only)

---

### ⏰ Scheduling System

**As Editor, I want**

* Schedule posts for future publishing
* See content calendar (week/month)

---

## E. AUTOMATION & INTEGRATION

### ⚙️ Automation Rules

**As Admin, I want**

* Rules like:

  * “When post is published → auto share”
  * “When traffic drops → suggest update”
  * “When keyword rank drops → alert”

---

### 📊 Analytics Integration

**As Admin, I want**

* Page views
* Conversion attribution (blog → lead)
* Top converting articles
* Blog ROI (critical for solar niche)

---

## F. MULTI-TENANCY & SCALING (Future-Proof)

### 🏢 Multi-Site Capability

**As Platform Owner, I want**

* Multiple sites/blogs from same CMS
* Shared or isolated content
* Language support (AU first, global later)

---

# PHASE 3 — NON-GOALS (Important)

We will **NOT** initially build:

* Marketplace themes
* Plugin marketplace
* Visual page builder (phase 2+)
* Public API for third parties (internal only)

This keeps scope **clean & shippable**.

---

# PHASE 4 — STRAPI MIRROR MAP (Confidence Check)

| Strapi Feature   | Our SaaS CMS      |
| ---------------- | ----------------- |
| Content Types    | ✅ Yes (Core)      |
| Role Permissions | ✅ Yes             |
| Media Library    | ✅ Yes             |
| Draft & Publish  | ✅ Yes             |
| API-First        | ⚠️ Internal first |
| Plugin System    | ❌ Later           |
| Admin UI         | ✅ Custom          |

---

# PHASE 5 — FINAL CONFIRMATION

Before we go **technical**, I need you to confirm:

1️⃣ This **user-story scope** is correct
2️⃣ You want **Blog + CMS built together** (not blog first)
3️⃣ AI automation is **Phase-1** priority (not optional)


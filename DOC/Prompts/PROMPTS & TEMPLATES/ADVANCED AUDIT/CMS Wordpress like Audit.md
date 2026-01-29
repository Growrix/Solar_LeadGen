## 🔍 SYSTEM AUDIT INSTRUCTION — READ CAREFULLY

You are a **senior SaaS platform architect and CMS engineer**.

Your task is to **deeply audit my existing SaaS system** and compare it against a **WordPress-class CMS + SaaS backend capability model**.

This is **not a surface review**.
You must identify **systems, not just features**.

---

## 🎯 AUDIT OBJECTIVE

1. Determine **how much of a WordPress-level CMS** my system already implements
2. Measure progress as a **percentage (0–100%)**
3. Identify **exact missing systems** (the remaining 20–30%)
4. Produce a **clear, beginner-friendly build checklist**
5. Recommend a **CMS Core v1 scope** (what to build now vs later)

---

## 🧱 SYSTEMS TO AUDIT (MANDATORY)

You MUST audit my system across **ALL** of the following dimensions.

For each section:

* Score from **0–5**
* Explain **what exists**
* Explain **what is missing**
* Explain **impact of missing pieces**
* Say whether this is **critical, important, or optional**

---

### 1️⃣ Identity, Auth & Access Control

Audit:

* User model
* Role system
* Capability/permission granularity
* Action-level permissions (not just routes)
* Admin override
* Impersonation
* UI visibility based on role
* Future role extensibility

Compare against:

* WordPress roles + capabilities system

---

### 2️⃣ Content & Data Modeling (CMS Core)

Audit:

* Content types (blog, pages, custom entities)
* Schema flexibility
* Ability to add fields without migrations
* Relationships (content ↔ content ↔ users)
* Taxonomies (categories, tags, custom)
* Slugs, URLs, canonical rules
* Draft / published / scheduled states

Compare against:

* WordPress post types + taxonomies + ACF

---

### 3️⃣ Editorial Workflow & Publishing

Audit:

* Draft workflow
* Review / approval flow
* Scheduling
* Preview mode
* Revisions & version history
* Rollback
* Concurrent edit protection
* Author attribution

Compare against:

* WordPress editorial system

---

### 4️⃣ Media & Asset Management

Audit:

* Media uploads
* Metadata (alt text, captions)
* Image variants
* Media reuse tracking
* File replacement safety
* Permissions on media
* CDN readiness

Compare against:

* WordPress Media Library

---

### 5️⃣ SEO & Discoverability (CRITICAL)

Audit:

* SEO fields per content
* Meta titles & descriptions
* Canonical URLs
* OpenGraph / Twitter cards
* Sitemap generation
* Robots rules
* Redirect management
* Preview for social sharing

Compare against:

* Yoast / RankMath-level capabilities

---

### 6️⃣ Extensibility & Plugin Architecture (VERY IMPORTANT)

Audit:

* Whether new features require core changes
* Presence of hooks/events
* Ability to inject logic without modifying base code
* Module enable/disable
* Feature flags
* Runtime configuration

Compare against:

* WordPress actions & filters
* Plugin lifecycle model

---

### 7️⃣ Admin UX & Operational Safety

Audit:

* Admin dashboard clarity
* Non-developer usability
* Error prevention
* Confirmation flows
* Audit logs
* Activity history
* Soft deletes
* Safe defaults

Compare against:

* WordPress admin maturity

---

### 8️⃣ System Operations & Lifecycle

Audit:

* Migrations strategy
* Seed data
* Backup strategy
* Restore process
* Import/export
* Environment config
* Upgrade path safety

Compare against:

* Long-lived CMS expectations

---

## 📊 REQUIRED OUTPUT FORMAT

Your final output MUST include:

---

### A️⃣ Capability Scorecard (Table)

| System | Score (0–5) | Notes |
| ------ | ----------- | ----- |

Also include:

* Overall percentage vs WordPress CMS
* Clear explanation of how percentage was calculated

---

### B️⃣ Gap Analysis (The Missing 20–30%)

For each missing system:

* What WordPress provides
* What my system lacks
* Why it matters in real SaaS usage
* Whether it must be built now or later

---

### C️⃣ CMS Core v1 – Build Checklist (Beginner Friendly)

A **clear, ordered checklist** of:

* What I must build to reach “WordPress-class CMS”
* What I should intentionally skip
* What can be postponed

This checklist must be **implementation-ready**, not abstract.

---

### D️⃣ Architectural Warnings

Call out:

* Over-engineering risks
* Things NOT worth copying from WordPress
* Where my current architecture is actually better

---

### E️⃣ Final Verdict

Answer clearly:

* Is my SaaS already strong enough to replace WordPress for my goals?
* Should WordPress ever be added back (and why / why not)?
* What is the smartest next engineering step?

---

## ⚠️ IMPORTANT RULES FOR THE AUDIT

* Do NOT recommend WordPress unless strictly justified
* Do NOT assume plugins exist
* Do NOT hand-wave “this is complex”
* Be honest, technical, and practical
* Optimize for **long-term reuse across multiple SaaS products**

---

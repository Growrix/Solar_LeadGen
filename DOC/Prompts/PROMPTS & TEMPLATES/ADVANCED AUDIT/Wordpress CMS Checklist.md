# ✅ WORDPRESS-CLASS CMS — CANONICAL REFERENCE CHECKLIST (INDUSTRY STANDARD)

This is **not aspirational**.
This is what WordPress *actually* provides when stripped to systems.

---

## 🧑‍💼 1. Identity, Roles & Capabilities (FOUNDATIONAL)

### WordPress provides:

* Users table
* Roles (Administrator, Editor, Author, Contributor, Subscriber)
* Capability-based permissions (not role-only)
* Capabilities attached to actions (edit_post, publish_post, delete_post)
* Per-content ownership rules
* Admin override
* Role extensibility
* UI visibility tied to capabilities

### Your CMS must support:

* [ ] Users
* [ ] Multiple roles
* [ ] Capability-level permissions (action-based)
* [ ] Permission checks at **business logic level**
* [ ] Ownership-based access
* [ ] Role evolution without schema rewrite
* [ ] Admin bypass / impersonation

---

## 🧱 2. Content Type System (CORE CMS ENGINE)

### WordPress provides:

* Posts
* Pages
* Custom Post Types
* Hierarchical vs flat content
* Slugs
* Permalinks
* Status lifecycle

### Your CMS must support:

* [ ] Multiple content types
* [ ] Content-type-specific rules
* [ ] Hierarchical content (page → child page)
* [ ] Stable slugs
* [ ] URL generation rules
* [ ] Draft / published / scheduled
* [ ] Soft delete (trash)

---

## 🧩 3. Field System (ACF-LEVEL, NOT BASIC CRUD)

This is where most custom CMSs fail.

### WordPress provides:

* Arbitrary custom fields
* Field groups
* Field types (text, number, rich text, image, relation)
* Conditional visibility
* Schema evolution without migrations

### Your CMS must support:

* [ ] Arbitrary fields per content type
* [ ] Multiple field types
* [ ] Field grouping
* [ ] Optional fields
* [ ] Schema changes without breaking prod
* [ ] JSON or meta-based extensibility

---

## 🏷️ 4. Taxonomy System (NOT JUST TAGS)

### WordPress provides:

* Categories
* Tags
* Custom taxonomies
* Hierarchical & flat taxonomies
* Taxonomy ↔ content relationships
* Querying by taxonomy

### Your CMS must support:

* [ ] Multiple taxonomies
* [ ] Hierarchical taxonomies
* [ ] Reusable taxonomies
* [ ] Many-to-many relationships
* [ ] Filtering & querying by taxonomy

---

## ✍️ 5. Editorial Workflow & Publishing (HARD SYSTEM)

### WordPress provides:

* Drafts
* Pending review
* Scheduled publishing
* Author attribution
* Preview before publish
* Revisions
* Rollback
* Concurrent edit detection

### Your CMS must support:

* [ ] Draft state
* [ ] Scheduled publish
* [ ] Preview mode
* [ ] Revision history
* [ ] Restore previous version
* [ ] Author tracking
* [ ] Edit conflict protection (optional v1)

---

## 🖼️ 6. Media & Asset Management (DECEPTIVELY COMPLEX)

### WordPress provides:

* Central media library
* Image variants
* Metadata (alt, caption, title)
* Media reuse
* Safe replacement
* Permission inheritance
* URL stability

### Your CMS must support:

* [ ] Media uploads
* [ ] Central library
* [ ] Metadata
* [ ] Asset reuse tracking
* [ ] Safe replacement
* [ ] CDN-ready URLs
* [ ] Access control

---

## 🔍 7. SEO & Discoverability (BUSINESS CRITICAL)

### WordPress (+ Yoast) provides:

* Meta title
* Meta description
* Canonical URLs
* OpenGraph
* Twitter cards
* Sitemap
* Robots rules
* Redirects

### Your CMS must support:

* [ ] Per-content SEO fields
* [ ] Canonical handling
* [ ] OG/Twitter metadata
* [ ] Sitemap generation
* [ ] Robots config
* [ ] Redirect management

---

## 🔌 8. Extensibility & Plugin Architecture (THE LAST 20%)

This is WordPress’s real moat.

### WordPress provides:

* Hooks (actions & filters)
* Plugin registration
* Feature isolation
* Enable/disable modules
* Runtime behavior changes
* No core edits

### Your CMS must support:

* [ ] Event/hook system
* [ ] Feature modules
* [ ] Dependency boundaries
* [ ] Runtime injection
* [ ] Configurable behavior
* [ ] Feature toggles

---

## 🧭 9. Admin UX & Safety (OPERATIONAL MATURITY)

### WordPress provides:

* Stable admin UI
* Confirmations
* Undo/trash
* Audit logs
* Activity history
* Safe defaults

### Your CMS must support:

* [ ] Admin dashboards
* [ ] Safe destructive actions
* [ ] Audit logs
* [ ] Activity history
* [ ] Soft deletes
* [ ] Recovery paths

---

## ⚙️ 10. Platform Operations & Lifecycle (LONG-TERM)

### WordPress provides:

* Migrations
* Backups
* Import/export
* Version upgrades
* Environment safety

### Your CMS must support:

* [ ] Migration strategy
* [ ] Backup & restore
* [ ] Seed data
* [ ] Import/export
* [ ] Environment config
* [ ] Upgrade safety

---

# 📌 HOW TO USE THIS CHECKLIST WITH AI (IMPORTANT)

When you run the audit, **prepend this instruction**:

> “You MUST compare my SaaS **only** against the attached WordPress-Class CMS Checklist.
> Do not invent new requirements.
> Do not compare against opinions, plugins, or future features.
> Treat unchecked items as missing.
> Produce a gap report strictly based on this list.”

This turns the AI from **speculative** → **deterministic**.

---

# 🧠 FINAL TRUTH (THIS IS KEY)

What you’re building is **not a CMS clone**.

You’re building:

> **A CMS kernel + SaaS kernel**
> that eliminates WordPress *because you understand it fully*.

That’s how real platforms are born.


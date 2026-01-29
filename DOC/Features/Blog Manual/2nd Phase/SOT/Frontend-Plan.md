# Frontend Plan — Blog Manual (Phase 2) — LuminaCMS Prototype Mirror

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-30

Purpose: visual contract for the admin CMS pages that Phase 2 will refactor/build to mirror the LuminaCMS prototype.

Anchors:
- Phase-2 plan: `DOC/Features/Blog Manual/2nd Phase/Plan/LUMINACMS-PROTOTYPE-MIRROR-PLAN.md`
- Phase-2 audit: `DOC/Features/Blog Manual/2nd Phase/SOT/CURRENT-STATE-AUDIT-ADMIN-BLOG-CMS.md`
- UI layout standard: `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`

---

## 0) Baseline Contract: Existing UI Will NOT Be Lost

This Phase 2 work touches existing admin blog pages. The following must remain functional throughout the refactor:
- `/admin/blog` (posts list)
- `/admin/blog/new` (create)
- `/admin/blog/[id]` (edit)
- `/admin/blog/[id]/preview` (preview)

Public blog routes are out of scope for Phase 2 and must not regress:
- `/blog`
- `/blog/post` (compat)
- `/blog/[slug]` (canonical)

---

## 1) Admin Routes (Phase 2 Target)

- `/admin/blog` → Posts List (WP-like)
- `/admin/blog/new` → Editor (new)
- `/admin/blog/[id]` → Editor (edit)
- `/admin/blog/comments` → Comments moderation
- `/admin/blog/taxonomy` → Categories & Tags
- `/admin/blog/media` → Media Library

Compatibility note:
- Existing placeholder routes `/admin/blog/categories` and `/admin/blog/tags` may later redirect to `/admin/blog/taxonomy` if approved.

---

## 2) Page-by-Page Visual Contract

### A) Posts List — `/admin/blog`

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐
│ Posts      [Add New]                           [Search…]     │
├──────────────────────────────────────────────────────────────┤
│ All (N) | Published (N) | Drafts (N)                          │
├──────────────────────────────────────────────────────────────┤
│ [Bulk Actions v] [Apply]   [All Dates v] [All Categories v]   │
│ [Filter]                                                     │
├──────────────────────────────────────────────────────────────┤
│ [ ] Title | Author | Categories | Tags | 💬 | Date            │
│     Title button (Draft label when draft)                    │
│     Hover row actions: Edit | Quick Edit | Trash | View       │
├──────────────────────────────────────────────────────────────┤
│ X items selected                Y items     [pagination UI]   │
└──────────────────────────────────────────────────────────────┘
```

**Actions:**
- Add New → `/admin/blog/new`
- Search filters by title
- Status filter toggles All/Published/Drafts
- Row actions: Edit, Quick Edit (can be stubbed initially), Trash (archives), View

---

### B) Editor — `/admin/blog/new` and `/admin/blog/[id]`

**What you will see:**

```
┌───────────────────────────────┬──────────────────────────────┐
│ Title (large)                 │ Publishing Controls box       │
│ Permalink: /blog/[slug]       │ - Status (Edit dropdown)      │
│ Content textarea (tall)       │ - Visibility: Public (Edit)   │
│                               │ - Publish: immediately/Edit   │
│                               │   (month/day/year/hour/min)   │
│                               │ [Move to Trash] [Publish]     │
├───────────────────────────────┼──────────────────────────────┤
│                               │ Tabs: General | SEO | AI      │
│                               │ General: Category, Author     │
│                               │ SEO: search preview, meta     │
│                               │ AI: generate intro, suggest   │
└───────────────────────────────┴──────────────────────────────┘

Bottom fixed action bar:
Cancel | Last autosaved at HH:MM | [Save Draft] [Publish Now/Schedule Post]
```

**Core behaviors:**
- Slug auto-generates from title until manually edited.
- Schedule edit toggles a WP-style date/time editor; changing schedule implies scheduled status.
- SEO tab includes:
  - search preview
  - meta title + char count
  - meta description + char count + “Generate with AI”
  - keyword chips (Enter adds, × removes)
- AI tab includes:
  - generate intro draft (appends to content)
  - suggest SEO keywords

---

### C) Comments — `/admin/blog/comments`

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐
│ Comments (description)      [All] [Pending] [Approved] [Spam]│
├──────────────────────────────────────────────────────────────┤
│ Author | Comment | Status | Actions                          │
│ Actions: Approve / Spam / Delete                             │
└──────────────────────────────────────────────────────────────┘
```

---

### D) Categories & Tags — `/admin/blog/taxonomy`

**What you will see:**

```
┌───────────────────────────────┬──────────────────────────────┐
│ Add New Category/Tag (sticky) │ Tabs: Categories | Tags       │
│ Name                          │ Table: Name | Slug | Posts    │
│ Slug (optional)               │ Delete action per row         │
│ [Add New]                     │                              │
└───────────────────────────────┴──────────────────────────────┘
```

---

### E) Media Library — `/admin/blog/media`

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐
│ [All Media v] [Search…]                      [Add New]       │
├──────────────────────────────────────────────────────────────┤
│ Grid of thumbnails (image/video/document)                    │
│ Click selects (border highlight)                             │
├──────────────────────────────────────────────────────────────┤
│ Right sidebar (when selected): Attachment Details            │
│ - Preview                                                    │
│ - Filename, uploaded date, size, dimensions                  │
│ - Delete Permanently                                         │
│ - Title (editable)                                           │
│ - Alt (editable) + AI Suggest (images only)                  │
│ - Caption (editable)                                         │
│ - File URL (read-only) + Copy                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3) Bangla Explanation (বাংলা ব্যাখ্যা)

### Admin CMS (Phase 2)
- এই ফেজে আমরা Admin প্যানেলের Blog CMS অংশকে LuminaCMS প্রোটোটাইপের মতো করে বানাবো।
- `/admin/blog` পেজে পোস্ট লিস্ট থাকবে — সার্চ, স্ট্যাটাস ফিল্টার (All/Published/Drafts), বাল্ক অ্যাকশন, এবং রো হোভার অ্যাকশন (Edit/Trash/View)।
- `/admin/blog/new` এবং `/admin/blog/[id]` এডিটরে Title, Permalink/Slug, Content textarea থাকবে। ডান পাশে Publishing Controls থাকবে (Status edit, Schedule edit) এবং ট্যাব থাকবে (General/SEO/AI)।
- `/admin/blog/taxonomy` পেজে Categories এবং Tags আলাদা ট্যাবে থাকবে, এবং বাম পাশে Add New ফর্ম থাকবে।
- `/admin/blog/media` পেজে মিডিয়া গ্রিড থাকবে এবং ডান পাশে ডিটেইলস সাইডবার থাকবে যেখানে Title/Alt/Caption আপডেট করা যাবে এবং Image হলে AI দিয়ে Alt Suggest করা যাবে।
- `/admin/blog/comments` পেজে কমেন্ট moderation থাকবে (Approve/Spam/Delete) — এটা শুধুমাত্র admin-এর জন্য।

---

## 4) Acceptance Checks (Frontend)

- All Phase-2 routes render under the admin layout standard.
- Posts list and editor match the prototype structure and actions.
- No hardcoded colors, no `dark:` classes.
- Existing Phase-1 admin routes keep working during refactor.

---

**This plan is a visual contract: after approval and implementation, every route and interaction above will exist and behave as described.**

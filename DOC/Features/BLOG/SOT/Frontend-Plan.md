# Frontend Plan — BLOG (Visual Contract)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2026-01-05

Purpose: provide a **visual, implementation-ready map** of all BLOG pages, routes, and UX flows.

Anchors:
- `DOC/FEATURES/BLOG/SOT/CURRENT-UI-AUDIT-BLOG.md` (baseline)
- `DOC/FEATURES/BLOG/SOT/FEATURE-SOT.md` (canonical phases 0–6)

---

## 0) Baseline Contract: Existing UI Will NOT Be Lost

Existing routes already exist and must remain functional until explicitly approved to change:
- `/blog`
- `/blog/post` (legacy, sessionStorage-driven)
- `/blog/[slug]` (canonical detail)
- `/admin/blog` and admin editor routes

---

## 1) Public Blog UX (Guest)

### A) `/blog` — Blog Listing

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│ SolarMatch Blog                                             │
│ [short intro text]                                          │
├────────────────────────────────────────────────────────────┤
│ [Post Card] [Post Card] [Post Card]                          │
│ [Post Card] [Post Card] [Post Card]                          │
│ ... responsive grid                                          │
├────────────────────────────────────────────────────────────┤
│ [Load More] (if pagination/infinite load is enabled)         │
└────────────────────────────────────────────────────────────┘
```

**Post Card includes (baseline expectation):**
- cover image
- category
- title
- excerpt
- author + date
- read time

**Interaction:**
- Click a card → navigate to `/blog/[slug]`.

### B) `/blog/[slug]` — Canonical Post Detail

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│ [Hero Image]                                                │
│ [Category]                                                  │
│ [Title]                                                     │
│ [Author] [Date] [Read Time]                                 │
├────────────────────────────────────────────────────────────┤
│ [Body content]                                              │
│                                                            │
│ [Share buttons]  (minimum: Copy Link)                       │
└────────────────────────────────────────────────────────────┘
```

**Share UX (MVP):**
- Copy Link

### C) `/blog/post` — Legacy Detail (Compatibility)

**Purpose:**
- Keep compatibility for older navigation that stores a post payload in `sessionStorage`.

**Behavior (as-is):**
- If `sessionStorage.currentBlogPost` exists and a slug can be inferred → redirect to `/blog/[slug]`.
- Otherwise, render the stored post payload.

---

## 2) Admin Blog UX

### A) `/admin/blog` — Posts List

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│ Posts                                                      │
│ [Add New]                                                  │
├────────────────────────────────────────────────────────────┤
│ Search [__________]   Status pills (All / Published / Draft)│
├────────────────────────────────────────────────────────────┤
│ Table: Title | Status | Updated | Actions                  │
└────────────────────────────────────────────────────────────┘
```

**Actions:**
- Add New → `/admin/blog/new`
- Edit → `/admin/blog/[id]`
- Preview → `/admin/blog/[id]/preview`
- Trash/Delete (admin-only)

### B) `/admin/blog/new` and `/admin/blog/[id]` — Editor

**What you will see (high-level):**

```
┌────────────────────────────────────────────────────────────┐
│ Title [_____________]   Slug [_____________]               │
│ Excerpt [______________________________]                   │
│ Cover Image URL [_____________________]                    │
│ Category [dropdown]    Tags [input]                        │
│                                                            │
│ [Editor Tabs: Content / SEO / Scheduling / AI]              │
│                                                            │
│ Status [select]  Schedule [datetime]                       │
│ [Save] [Preview] [Publish/Schedule] [Archive]              │
└────────────────────────────────────────────────────────────┘
```

**AI Assist (admin-only):**
- Generate draft (title/body/SEO/category/tags) from topic + constraints.
- Admin reviews/edits before publish.

### C) `/admin/blog/[id]/preview` — Preview
- Shows public post layout, but admin-only.
- “Back to edit” control.

### D) Taxonomy
- `/admin/blog/categories` — manage categories
- `/admin/blog/tags` — manage tags

---

## 3) Modals (Keep minimal)

- Confirm delete/trash
- Confirm publish/schedule

---

## 4) Bangla Explanation (বাংলা ব্যাখ্যা)

### Public Blog (Guest)
- `/blog` পেজে ব্লগ পোস্টগুলো কার্ড আকারে দেখাবে। কার্ডে ক্লিক করলে `/blog/[slug]` পেজে পোস্ট ডিটেইল ওপেন হবে।
- পুরানো `/blog/post` রুটটি শুধুমাত্র compatibility এর জন্য থাকবে (sessionStorage থেকে পোস্ট নিয়ে প্রয়োজনে `/blog/[slug]` এ redirect করবে)।

### Admin Blog
- `/admin/blog` এ পোস্টগুলোর তালিকা থাকবে এবং নতুন পোস্ট যোগ করা যাবে।
- `/admin/blog/new` বা `/admin/blog/[id]` এ গিয়ে অ্যাডমিন পোস্ট লিখবে/এডিট করবে, SEO ফিল্ড সেট করবে, Preview দেখবে, তারপর Schedule/Publish করবে।
- AI Assist ব্যবহার করে টপিক দিলে খসড়া পোস্ট (content + SEO) তৈরি হবে, কিন্তু publish করার আগে অ্যাডমিন review করবে।

---

## 5) Acceptance Checks (Frontend)

- Public `/blog` listing loads and is stable.
- `/blog/[slug]` is deep-link safe (refresh works).
- `/blog/post` compatibility remains functional.
- Admin pages render and support create → edit → preview → schedule/publish flows.

---

**This plan is a visual contract: after approval and implementation, every route and interaction above will exist and behave as described.**

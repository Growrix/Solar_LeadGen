# Frontend Plan — Blog Manual (Visual Contract)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29

Purpose: provide a **visual, implementation-ready map** of pages, routes, and UX flows for the Blog Manual feature.

Anchors:
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md` (baseline)
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md` (canonical phases 0–6)

---

## 0) Baseline Contract: Existing UI Will NOT Be Lost

Baseline routes already exist and must remain functional until explicitly approved to change:
- `/blog` (listing)
- `/blog/post` (legacy detail; sessionStorage-driven)

Any changes below must be treated as **intentional** and approved.

---

## Locked Decisions (2025-12-30)

- **Canonical post route**: Use `/blog/[slug]` as the canonical, deep-link-safe post URL.
- **Legacy compatibility**: Keep `/blog/post` as a compatibility route that attempts to redirect to `/blog/[slug]` using the existing `sessionStorage` payload. If it cannot infer a slug, it redirects back to `/blog`.
- **Comments UX**: Hide the demo comments section for MVP (no public comments feature yet).
- **Share UX**: Minimum share functionality is **Copy Link**.

---

## 1) Public Blog UX (Guest)

### A) `/blog` — Blog Listing Page (Baseline)

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│  The SolarMatch Blog                                       │
│  [short intro text]                                        │
├────────────────────────────────────────────────────────────┤
│ [Post Card] [Post Card] [Post Card]                        │
│ [Post Card] [Post Card] [Post Card]                        │
│ ... responsive grid                                        │
├────────────────────────────────────────────────────────────┤
│ [Load More Articles]                                       │
└────────────────────────────────────────────────────────────┘
```

**Each Post Card includes:**
- image
- category
- title
- excerpt
- author + date
- read time

**Current interaction (as-is):**
- Click card → saves post in `sessionStorage` → navigates to `/blog/post`

**Implemented change (approved via Locked Decisions):**
- Click card → navigates to `/blog/[slug]`.
- `/blog/post` remains as compatibility only.

### B) `/blog/post` — Blog Post Detail (Baseline)

**What you will see (as-is):**

```
┌────────────────────────────────────────────────────────────┐
│ [Hero Image]                                               │
│ [Category]                                                 │
│ [Title]                                                    │
│ [Author] [Date] [Read Time]                                │
├────────────────────────────────────────────────────────────┤
│ [Body content: currently mostly hard-coded]                │
│                                                          │
│ [Share buttons: Twitter / Facebook / LinkedIn / Copy Link] │
│                                                          │
│ [Author bio block]                                         │
│                                                          │
│ [Comments UI: client-only demo]                            │
└────────────────────────────────────────────────────────────┘
```

**Planned change (requires explicit approval):**
- Make “Copy Link” functional at minimum.
- Later: replace hard-coded body with real content source.

**Implemented change (approved via Locked Decisions):**
- “Copy Link” is functional.
- Comments demo is hidden (not part of MVP).

### C) `/blog/[slug]` — Canonical Post Detail (Future)

This route does not exist today but is recommended by the plan as canonical.

**Implemented change (approved via Locked Decisions):**
- `/blog/[slug]` is the canonical post detail route.

**What you will see:**
Same layout as `/blog/post`, but content is loaded by slug and is deep-link safe.

---

## 2) Admin Blog UX (New)

### A) `/admin/blog` — Admin Blog Dashboard

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│ Blog Admin Dashboard                                       │
├────────────────────────────────────────────────────────────┤
│ [Create New Post]                                          │
│                                                          │
│ [Table: posts]                                             │
│ Title | Status | Author | Updated | Actions               │
│ ...                                                       │
└────────────────────────────────────────────────────────────┘
```

**Actions (visual + functional in mock mode first):**
- Create → `/admin/blog/new`
- Edit → `/admin/blog/[id]`
- Preview → `/admin/blog/[id]/preview`
- Schedule/Publish/Archive (mock now; API later)

### B) `/admin/blog/new` and `/admin/blog/[id]` — Editor

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│ Title [_____________]                                      │
│ Slug  [_____________]                                      │
│ Excerpt [__________________________]                       │
│ Cover Image URL [____________________]                     │
│ Category [dropdown]   Tags [input]                         │
│                                                          │
│ [Editor]                 [Preview]                         │
│ (markdown textarea)      (rendered)                        │
│                                                          │
│ Meta Title [___________]                                   │
│ Meta Desc  [___________]                                   │
│ OG Image   [___________]                                   │
│ Canonical  [___________]                                   │
│ Robots     [___________]                                   │
│                                                          │
│ Status [select]  Schedule [datetime]                       │
│ [Save] [Preview] [Publish] [Archive]                       │
└────────────────────────────────────────────────────────────┘
```

### C) `/admin/blog/[id]/preview` — Preview
- Same layout as public post, but admin-only.
- “Back to edit” button.

---

## 3) Modals (If needed)

- Publish confirmation
- Schedule confirmation
- Archive confirmation

(Keep minimal; no extra UX beyond what’s necessary.)

---

## 4) Bangla Explanation (বাংলা ব্যাখ্যা)

### Public Blog (Guest)
- `/blog` পেজে ব্লগ কার্ডগুলো গ্রিড আকারে দেখাবে এবং “Load More Articles” থাকবে।
- বর্তমানে কার্ডে ক্লিক করলে `sessionStorage`-এ পোস্ট সেভ করে `/blog/post` এ নিয়ে যায়।
- প্ল্যান অনুযায়ী ভবিষ্যতে `/blog/[slug]` হবে canonical URL, যাতে ডাইরেক্ট লিংকে পোস্ট ওপেন করা যায়।

### Admin Blog
- `/admin/blog` এ পোস্টগুলোর তালিকা ও “Create New Post” থাকবে।
- `/admin/blog/new` বা `/admin/blog/[id]` এ গিয়ে অ্যাডমিন পোস্ট লিখবে/এডিট করবে, SEO ফিল্ড সেট করবে, Preview দেখবে, তারপর Schedule/Publish করতে পারবে।

---

## 5) Acceptance Checks (Frontend)

- `/blog` works as-is and does not regress.
- If canonical route is approved: `/blog/[slug]` is deep-link safe (refresh works).
- Admin pages render and support draft → preview → schedule/publish flows (mock first).

---

**This plan is a visual contract: after approval and implementation, every route and interaction above will exist and behave as described.**

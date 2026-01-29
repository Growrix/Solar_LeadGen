# Frontend Plan — Blog Manual

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2025-12-29


Purpose: provide a crystal-clear, visual, implementation-ready map of **every page, modal, and UX element** that will be built. This is your “what will I see and click” reference—no ambiguity.

This file is the frontend counterpart to:
- `DOC/Features/Blog Manual/SOT/FEATURE-SOT.md`
- `DOC/Features/Blog Manual/SOT/IMPLEMENTATION-PLAN.md`

---

## 0) Baseline: Existing UI Will NOT Be Lost

This plan is anchored to the current guest blog implementation audited in:
- `DOC/Features/Blog Manual/SOT/CURRENT-UI-AUDIT-GUEST-BLOG.md`

**Contract rule**:
- We will **preserve** the existing guest blog UX (`/blog` and `/blog/post`) unless a change is explicitly listed as an intentional UX change and approved.

## 1) Public Blog UX (Guest)

### Pages & Routes

#### `/blog` — Blog Listing Page

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│  The SolarMatch Blog                                      │
│  [short intro text]                                       │
├────────────────────────────────────────────────────────────┤
│ [Post Card] [Post Card] [Post Card] ...                   │
│ [Post Card] [Post Card] [Post Card] ...                   │
│ ... (grid, 1–3 columns responsive)                        │
├────────────────────────────────────────────────────────────┤
│ [Load More Articles]                                      │
└────────────────────────────────────────────────────────────┘
```

**Each Post Card:**
```
┌───────────────┐
│ [Image]       │
│ [Category]    │
│ [Title]       │
│ [Excerpt]     │
│ [Author] [Date] [Read Time] │
└───────────────┘
```

**Interactions:**
- Click a card → opens `/blog/post` (current detail page)
- “Load More Articles” fetches more posts

**Planned (optional) enhancement (requires approval):**
- Add visible search input + category dropdown to match the existing internal filter state (currently not rendered in the UI).

#### `/blog/post` — Blog Post Detail Page (Current Baseline)

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│ [Hero Image]                                              │
│ [Category]                                                │
│ [Title]                                                   │
│ [Author] [Date] [Read Time]                               │
├────────────────────────────────────────────────────────────┤
│ [Post body: currently static/hard-coded sections]         │
│                                                          │
│ [Share buttons: Twitter, Facebook, LinkedIn, Copy Link]   │
│                                                          │
│ [Author Bio Block]                                        │
│                                                          │
│ [Comments section: client-only mock flow exists today]    │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Back button returns to `/blog`
- Share buttons are visible (current implementation is mostly visual/non-functional)
- Comments are interactive but client-only (not persisted)

**Planned (optional) enhancement (requires approval):**
- Make “Copy Link” functional at minimum (without changing layout).

#### `/blog/[slug]` (Future Canonical Route)
- Not present today.
- When introduced, it will become the canonical SEO URL and `/blog/post` will become a compatibility redirect.

### Bangla Explanation (Public Blog UX) — বাংলা ব্যাখ্যা

- `/blog` পেজে বর্তমানে ব্লগ কার্ডগুলোর গ্রিড দেখা যায় এবং “Load More Articles” কাজ করে।
- কোনো কার্ডে ক্লিক করলে পোস্টের ডাটা `sessionStorage`-এ রেখে `/blog/post` পেজে নিয়ে যায়।
- `/blog/post` পেজে পোস্টের হেডার/মেটা দেখা যায়, কিন্তু মূল বডি কনটেন্ট এখন হার্ডকোড করা।
- Comments সেকশন আছে কিন্তু এটি ক্লায়েন্ট-সাইড (ডাটাবেজে সেভ হয় না)।
- ভবিষ্যতে `/blog/[slug]` যোগ হলে সেটি হবে আসল (canonical) লিংক, এবং `/blog/post` তখন compatibility/redirect হিসেবে থাকবে।

---

## 2) Admin Blog UX

### Pages & Routes

#### `/admin/blog` — Admin Blog Dashboard

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│  Blog Admin Dashboard                                     │
├────────────────────────────────────────────────────────────┤
│ [Create New Post]                                         │
│                                                          │
│ [Table: All Posts]                                        │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│ │ Title       │ Status      │ Author      │ Actions     │ │
│ ├─────────────┼─────────────┼─────────────┼─────────────┤ │
│ │ ...         │ ...         │ ...         │ [Edit][Preview][Schedule][Publish][Archive] │
│ └─────────────┴─────────────┴─────────────┴─────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click “Create New Post” → `/admin/blog/new`
- Click “Edit” → `/admin/blog/[id]`
- Click “Preview” → `/admin/blog/[id]/preview`
- Click “Schedule”/“Publish”/“Archive” → status changes

#### `/admin/blog/new` — Create Draft Page
#### `/admin/blog/[id]` — Edit Post Page

**What you will see:**

```
┌────────────────────────────────────────────────────────────┐
│  [Title Input]                                            │
│  [Slug Input] (auto-suggest, editable)                    │
│  [Excerpt Input]                                          │
│  [Cover Image URL Input]                                  │
│  [Category Dropdown] [Tags Input]                         │
│  [Markdown Editor] [Preview Pane]                         │
│  [Meta Title] [Meta Description] [OG Image]               │
│  [Canonical URL] [Robots]                                 │
│  [Status Select] [Schedule Date/Time Picker]              │
│  [Save][Preview][Publish][Archive]                        │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**
- All fields are editable
- “Preview” opens `/admin/blog/[id]/preview`
- “Save” persists (mock in Phase 1)
- “Publish”/“Archive”/“Schedule” update status

#### `/admin/blog/[id]/preview` — Preview Page

**What you will see:**
Same as the public blog post detail view, but only visible to admin, with a “Back to Edit” button.

---

## 3) Future/Optional Pages (Not in MVP, but easy to add later)

- **Media Library** (for image uploads/management)
  - `/admin/media` — grid/list of uploaded images, upload/delete/preview
- **Tag Management**
  - `/admin/blog/tags` — create/edit/delete tags
- **Category Management**
  - `/admin/blog/categories` — create/edit/delete categories
- **Comment Moderation**
  - `/admin/blog/comments` — moderate/delete comments

---

## 4) Modals & UX Elements

- **Delete Confirmation Modal** (when deleting a post, tag, or image)
- **Schedule Post Modal** (date/time picker, confirm)
- **Publish Confirmation Modal**
- **Image Upload Modal** (future, for media library)

**Example Modal (ASCII):**
```
┌──────────────────────────────┐
│  Are you sure you want to    │
│  delete this post?           │
│                              │
│  [Cancel]   [Delete]         │
└──────────────────────────────┘
```

---

## 5) Shared Frontend Structure

- All blog data is loaded via a single adapter interface (mock in Phase 1, API in Phase 3+)
- All pages use the same design tokens and layout system as the rest of the app
- No new design system or custom UI patterns introduced

---

## 6) Frontend Acceptance Checks (Manual)

- `/blog` renders, cards are clickable
- `/blog/post` works when navigated from `/blog` (current baseline)
- Admin dashboard and editor pages are accessible (mocked in Phase 1)
- All modals and actions are visible and functional (mocked in Phase 1)

---

## 7) Visual Summary — What Will Be Visible After Implementation

**Public:**
- `/blog` — grid of post cards + load more (search/filter only if explicitly approved)
- `/blog/post` — full post page (current baseline)
- `/blog/[slug]` — future canonical route (when enabled)

**Admin:**
- `/admin/blog` — dashboard table, create/edit/preview actions
- `/admin/blog/new` — full-featured editor form
- `/admin/blog/[id]` — edit form, preview, status controls
- `/admin/blog/[id]/preview` — post preview
- All confirmation modals (delete, publish, schedule)

**(If/when enabled):**
- `/admin/media` — media library grid (future)
- `/admin/blog/tags` — tag management (future)
- `/admin/blog/categories` — category management (future)

**You will be able to:**
- Browse blog posts as a guest
- Read full posts with images and author info
- As admin, create, edit, preview, schedule, and publish posts
- See all status changes and confirmation modals

**What you will NOT see in MVP:**
- Real comments persistence/moderation (current comments remain client-only)
- Media uploads (future)
- Tag/category management pages (future)

---

**This plan is your visual contract: after implementation, every page, modal, and UX element above will be present and functional as described.**

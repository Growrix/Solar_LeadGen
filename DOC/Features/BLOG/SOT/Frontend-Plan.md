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

### 2.0) Admin Blog Engine Hub (AI + Automation Control Center)

New admin-only route (does not replace existing admin CRUD pages):
- `/admin/blog/engine`

Purpose:
- Provide a single “Blog Engine” control center (News Engine-style) so the admin can run blog creation with **minimal effort**.

**What you will see:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ Blog Engine                                                         │
│ Operational Mode: [Manual ▾]  (Manual / Assisted / Automatic)        │
│ [Pause Automation] [Test Generate]                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Tabs: [Dashboard] [Drafts & Reviews] [Automation Logic] [Sources]    │
│       [Audit Logs] [Master Control] [Settings]                       │
├──────────────────────────────────────────────────────────────────────┤
│ Active Tab Content Area                                              │
└──────────────────────────────────────────────────────────────────────┘
```

**Core interactions:**
- Drafts & Reviews → open a draft review surface (page or modal) with actions: Publish Now, Schedule, Request Rewrite, Reject, Save.
- Automation Logic → configure auto-draft/auto-schedule/auto-publish (UI-only here) + publish windows.
- Sources → manage RSS sources used for blog research/topic discovery.
- Audit Logs → show AI + automation + admin actions; allow opening “Prompt Details” when available.
- Master Control → pause/resume automation + emergency stop confirmation.

**AI control depth (inside existing tabs; no new routes):**
- Settings tab must include a safe “AI Control Plane” section:
	- Model Profiles (e.g., Deep Research, Drafting, Rewrite, SEO Metadata, Image Prompting)
	- Routing map: Operation → Model Profile
	- Credentials (multiple keys) management UI that is server-backed; UI shows masked keys only
	- Budgets/limits (daily caps, rate limits) and deterministic failure handling
- Sources tab must support (BLOG research only):
	- RSS sources
	- Scraper sources (URL + extraction rules) as an explicit source type
- Automation Logic must include rule-level clarity for when the system is allowed to auto-schedule/auto-publish.

Constraints:
- This hub is **admin-only UI/UX** and must not expose secrets.
- This does not replace the existing editor pages; it links to them.

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

**AI Image Generation (admin-only):**
- Engine can generate a hero/OG image (or image prompt) for a post.
- Admin must be able to approve/regenerate/reject before the post is published.

**Operational visibility (admin UX expectation):**
- Show clear states beyond simple Draft/Published where applicable: Needs Review, Scheduled, Rejected, Error.

### C) `/admin/blog/[id]/preview` — Preview
- Shows public post layout, but admin-only.
- “Back to edit” control.

### D) Taxonomy
- `/admin/blog/categories` — manage categories
- `/admin/blog/tags` — manage tags

### E) Media Library (Blog CMS)

New admin-only route (does not replace existing admin CRUD pages):
- `/admin/blog/media`

Purpose:
- Manage blog media assets (upload, browse, copy URL, delete).
- Keep UX simple: media can be used by copying a URL into existing editor fields (no new editor integration required in this plan).

### F) Comments Management (Blog CMS)

New admin-only route:
- `/admin/blog/comments`

Purpose:
- Moderate comments related to blog posts (approve, hide, mark spam, delete).
- This plan covers **admin moderation UI only**; public comment submission/display is out of scope unless explicitly approved later.

---

## 3) Modals (Keep minimal)

- Confirm delete/trash
- Confirm publish/schedule

Additional modals required by the updated plan (Blog Engine Hub):
- Pause automation confirmation
- Emergency stop confirmation
- Prompt details (read-only)
- Reject with reason (if not already represented as a dedicated surface)

Additional modals required by the CMS extensions:
- Upload media (or “Add media”) modal/drawer
- Confirm delete media
- Moderate comment (approve/hide/spam) surface (modal or drawer)
- Confirm delete comment

---

## 4) Bangla Explanation (বাংলা ব্যাখ্যা)

### Public Blog (Guest)
- `/blog` পেজে ব্লগ পোস্টগুলো কার্ড আকারে দেখাবে। কার্ডে ক্লিক করলে `/blog/[slug]` পেজে পোস্ট ডিটেইল ওপেন হবে।
- পুরানো `/blog/post` রুটটি শুধুমাত্র compatibility এর জন্য থাকবে (sessionStorage থেকে পোস্ট নিয়ে প্রয়োজনে `/blog/[slug]` এ redirect করবে)।

### Admin Blog
- `/admin/blog` এ পোস্টগুলোর তালিকা থাকবে এবং নতুন পোস্ট যোগ করা যাবে।
- `/admin/blog/new` বা `/admin/blog/[id]` এ গিয়ে অ্যাডমিন পোস্ট লিখবে/এডিট করবে, SEO ফিল্ড সেট করবে, Preview দেখবে, তারপর Schedule/Publish করবে।
- AI Assist ব্যবহার করে টপিক দিলে খসড়া পোস্ট (content + SEO) তৈরি হবে, কিন্তু publish করার আগে অ্যাডমিন review করবে।

### Blog CMS (Media + Comments)
- `/admin/blog/media` এ Blog-এর জন্য media asset upload/browse করা যাবে এবং URL copy করে editor-এ ব্যবহার করা যাবে।
- `/admin/blog/comments` এ blog comments moderation করা যাবে (Approve/Hide/Spam/Delete)। Public comment submission/display এই scope-এর বাইরে থাকবে, যতক্ষণ না আলাদা করে অনুমোদন দেওয়া হয়।

### Admin Blog Engine (AI + Automation)
- `/admin/blog/engine` হলো Blog Engine hub। এখানে **Manual / Assisted / Automatic** মোড সিলেক্ট করা যাবে।
- Automatic/Assisted মোডে AI draft তৈরি করবে এবং সেগুলো **Drafts & Reviews** ট্যাবে review-এর জন্য যাবে।
- অ্যাডমিন minimal কাজ করবে: Approve/Reject/Schedule/Publish, এবং দরকার হলে Pause/Emergency Stop।

---

## 5) Acceptance Checks (Frontend)

- Public `/blog` listing loads and is stable.
- `/blog/[slug]` is deep-link safe (refresh works).
- `/blog/post` compatibility remains functional.
- Admin pages render and support create → edit → preview → schedule/publish flows.

- Admin `/admin/blog/media` renders with upload/browse/copy URL/delete affordances.
- Admin `/admin/blog/comments` renders with moderation actions (approve/hide/spam/delete).

- Admin `/admin/blog/engine` hub renders with the required tabs and mode selector.
- Pause/Emergency actions are confirmation-gated.
- Draft review actions are visible (even if UI-only until backend wiring).

---

**This plan is a visual contract: after approval and implementation, every route and interaction above will exist and behave as described.**

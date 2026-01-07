# Frontend Plan — News Engine (Visual Contract)

**Status**: Draft (Pending approval)
**Owner**: GitHub Copilot (GPT-5.2)
**Created At**: 2026-01-01

Purpose: provide a **visual, implementation-ready contract** of exactly what we will migrate/build for **Option A (Direct Next.js Implementation)** for the News Engine feature.

Anchors:
- `DOC/FEATURES/NEWS ENGINE/SOT/FEATURE-SOT.md` (canonical 6-phase planning)
- `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-admin.md` (prototype-first UI plan: pages/modals)
- `DOC/FEATURES/NEWS ENGINE/Fontend UI UX Prompts/frontend-plan-public.md` (public UI plan)
- `specs/007-migration-and-build/plan.md` (13-step workflow for any UI migration/build)

---

## 0) Baseline Contract: Existing UI Will NOT Be Lost

This work must **not** regress existing Admin areas or existing public routes.

- No global layout rework.
- No new header/footer/dashboard scaffolding beyond what already exists in the app.
- News Engine UI is integrated as **new routes** + **connected modals** only.

---

## বাংলা ব্যাখ্যা (Bangla Explanation)

এই ডকুমেন্টটি News Engine ফিচারের **ফ্রন্টএন্ড UI/UX কনট্রাক্ট**—মানে আমরা ঠিক কোন কোন পেজ, ট্যাব, এবং মডাল বানাবো তা এখানে নির্দিষ্ট করা আছে।

**Public (গেস্ট) ফ্লো:**
- `/news` পেজে শুধু **Published** নিউজ আইটেম দেখাবে।
- `/news/[slug]` পেজে নির্বাচিত Published আইটেমের ডিটেইল দেখাবে।
- Share/Copy Link মডাল থাকবে (UI-only আচরণ)।

**Admin (ইন্টারনাল) ফ্লো:**
- `/admin/news-engine` একটাই হাব স্ক্রিন হবে, যেখানে Dashboard / Drafts & Reviews / Audit Logs / Master Control / Automation Logic / Sources / Settings ট্যাব থাকবে।
- ট্যাব/বাটন থেকে সংশ্লিষ্ট মডালগুলো (Review, Schedule, Test & Preview, Prompt Details, Confirmations ইত্যাদি) ওপেন হবে—এগুলো UI-only হলেও ফ্লোটা প্রোটোটাইপের মতোই থাকবে।

**গুরুত্বপূর্ণ নিয়ম:**
- বিদ্যমান অ্যাডমিন লেআউট/নেভিগেশন নষ্ট করা যাবে না।
- নতুন hardcoded color বা `dark:*` ক্লাস যোগ করা যাবে না; শুধু semantic token ব্যবহার হবে।

---

## 1) Scope Lock (What WILL and WILL NOT be migrated)

### In Scope (Option A)

**Admin (internal)**
- One Next.js Admin route: `/admin/news-engine`
- One integrated “hub” screen containing the News Engine views as **tabs**:
  - Dashboard
  - Drafts & Reviews
  - Audit Logs
  - Master Control
  - Automation Logic
  - Sources
  - Settings
- The connected modal flows from the prototype:
  - Review / Draft View
  - Scheduling
  - Test & Preview
  - Request Rewrite
  - Reject
  - Add/Edit Source
  - Prompt Details
  - Confirmation modals (publish / pause automation / emergency stop)

**Public (guest)**
- `/news` (listing of published items only)
- `/news/[slug]` (details; published items only)
- Share / Copy Link modal

**Navigation integration (minimal, connected)**
- Admin sidebar/nav includes a single entry point: **News Engine** → `/admin/news-engine`

### Out of Scope (explicitly excluded)
- Prototype-only extras not required for News Engine pages/modals (generic header/footer dashboards, unrelated widgets)
- Backend implementation changes (APIs, DB schema, RSS crawling, AI generation, automation runner)

Note: A backend implementation already exists in this repo; this document simply constrains what the frontend work should (and should not) change.
- Auth/RBAC changes (only UI expectations, no policy changes)
- New design system/tokens, new hardcoded colors, new `dark:*` classes (not allowed)

---

## 2) Locked Decisions (Option A)

- **Admin IA**: One route (`/admin/news-engine`) with tabbed sections inside the page (matches the V6 prototype structure).
- **Public IA**: Minimal `/news` + `/news/[slug]` only.
- **Public visibility rule**: Public pages display **Published** items only.
- **Design system**: Semantic tokens only; multi-theme safe (Dark/Light/Purple); no hardcoded palettes; no `dark:` usage.

---

## 3) Admin News Engine UX (Internal)

### A) `/admin/news-engine` — Admin Hub (Tabbed)

**What you will see:**

```
┌──────────────────────────────────────────────────────────────────────┐n│ News Engine                                                          │
│ [Pause Automation] [Test & Preview]                                  │
├──────────────────────────────────────────────────────────────────────┤
│ Tabs: [Dashboard] [Drafts & Reviews] [Audit Logs] [Master Control]   │
│       [Automation Logic] [Sources] [Settings]                        │
├──────────────────────────────────────────────────────────────────────┤
│ Tab Content Area (changes with active tab)                           │
│                                                                      │
│  - Elevated panels/cards/tables using semantic tokens only           │
│  - No extra global shells (admin layout owns the chrome)             │
└──────────────────────────────────────────────────────────────────────┘
```

**Global interactions from the page header:**
- Click **Pause Automation** → opens Pause confirmation modal (see Modals section)
- Click **Test & Preview** → opens Test & Preview modal

**Global states:**
- Loading state: skeletons for the active tab content
- Empty state: “No items found” style message per tab

---

### B) Dashboard Tab

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ KPI Strip:                                                     │
│ [News Found Today] [Drafts Pending Review] [Scheduled] [Status]│
├──────────────────────────────────────────────────────────────┤
│ Filters (minimal): [Status] [Source Type] [Search]            │
├──────────────────────────────────────────────────────────────┤
│ Feed/List (cards or table)                                    │
│ - Headline, Source Type, Confidence, Status, Updated          │
│ - Actions: [Review] [View Details]                            │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click **Review** or **View Details** → opens Review / Draft View modal (same destination)

---

### C) Drafts & Reviews Tab

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Queue/Board for items needing review                            │
│ Columns can represent key statuses (UI-only)                    │
│ Each item has a primary action: [Review]                        │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click **Review** → opens Review / Draft View modal

---

### D) Audit Logs Tab

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Logs table/list                                                │
│ - Timestamp, Action, Source, Actor, Status                     │
│ - Action: [View Prompt Details] (only when available)          │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click **View Prompt Details** → opens Prompt Details modal

---

### E) Master Control Tab

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Global controls (UI only):                                      │
│ - Pause/Resume pipeline                                        │
│ - Emergency Stop                                               │
│ - High-level subsystem status                                  │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click Pause/Resume/Emergency Stop → opens confirmation modal

---

### F) Automation Logic Tab

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Rules and toggles (UI only):                                    │
│ - Auto draft                                                    │
│ - Auto schedule                                                 │
│ - Auto publish                                                  │
│ - Limits, windows, safeguards                                   │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Toggle changes are UI-only; show “Saving…” then “Saved” feedback

---

### G) Sources Tab

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Sources manager (table/list)                                    │
│ - Name, URL, Type, Enabled toggle, Last checked (placeholder)   │
│ - Actions: [Add Source] [Edit]                                  │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click **Add Source** → opens Add/Edit Source modal (empty)
- Click **Edit** → opens Add/Edit Source modal (prefilled)

---

### H) Settings Tab

**What you will see (minimal):**
- News Engine UI-only settings (placeholders allowed) that do not require backend.

---

## 4) Admin Modals (Connected)

### A) Review / Draft View Modal (Core)

**Opens from:** Dashboard / Drafts & Reviews

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Review Draft                                                   │
├──────────────────────────────────────────────────────────────┤
│ Headline / summary / content preview (UI-only)                 │
│ Status badge + meta                                            │
├──────────────────────────────────────────────────────────────┤
│ Actions:                                                       │
│ [Publish Now] [Schedule] [Request Rewrite] [Reject] [Save Draft]│
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Publish Now → Publish confirmation modal
- Schedule → Scheduling modal
- Request Rewrite → Rewrite modal
- Reject → Reject modal
- Save Draft → stays in modal; shows saved feedback

---

### B) Scheduling Modal
- Fields: date/time picker (UI), optional notes
- Confirm → returns to Review modal
- Cancel → returns to Review modal

### C) Test & Preview Modal
- Purpose: simulate a draft/test output (UI-only)
- Confirm → returns to Admin Hub
- Cancel → returns to Admin Hub

### D) Request Rewrite Modal
- Fields: rewrite instruction textarea (UI-only)
- Confirm → returns to Review modal
- Cancel → returns to Review modal

### E) Reject Modal
- Fields: rejection reason textarea (UI-only)
- Confirm → returns to Review modal
- Cancel → returns to Review modal

### F) Add/Edit Source Modal
- Fields: name, url, type, enabled toggle
- Save → returns to Sources tab
- Cancel → returns to Sources tab

### G) Prompt Details Modal
- Displays prompt context associated with a selected log entry (UI-only)
- Close → returns to Audit Logs tab

### H) Confirmation Modals (Single Intent)
- Pause Automation (confirm/cancel)
- Publish Now (confirm/cancel)
- Emergency Stop (stronger warning + confirm/cancel)

---

## 5) Public News UX (Guest)

### A) `/news` — News Listing

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ News                                                          │
│ [Optional short intro]                                         │
├──────────────────────────────────────────────────────────────┤
│ [Post Card] [Post Card] [Post Card]                            │
│ ... responsive grid/list                                       │
└──────────────────────────────────────────────────────────────┘
```

**Each post card includes (minimum):**
- title/headline
- publish date
- excerpt (optional)
- CTA: “Read more”

**Interaction:**
- Click card / Read more → navigates to `/news/[slug]`

**Visibility contract:**
- Only `Published` items appear in this list.

---

### B) `/news/[slug]` — News Details

**What you will see:**

```
┌──────────────────────────────────────────────────────────────┐n│ Back to News                                                   │
│ Headline (H1)                                                  │
│ Publish date                                                   │
│ Tags (optional)                                                │
├──────────────────────────────────────────────────────────────┤
│ Article body                                                   │
├──────────────────────────────────────────────────────────────┤
│ [Share]                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Back to News → `/news`
- Share → opens Share / Copy Link modal

**States:**
- Not found state: “This post is not available.”

---

### C) Share / Copy Link Modal
- Copy link action (minimum)
- Close returns to the details page

---

## 6) Bangla Explanation (বাংলা ব্যাখ্যা)

### Admin News Engine
- `/admin/news-engine` হলো একটাই **হাব পেজ**, যেখানে ট্যাবের মাধ্যমে Dashboard, Drafts & Reviews, Audit Logs, Master Control, Automation Logic, Sources, Settings দেখা যাবে।
- Dashboard/Queue থেকে কোনো আইটেমে **Review** চাপলে Review/Draft View modal খুলবে।
- Review modal থেকে Publish/Schedule/Rewrite/Reject/Save Draft—এই অ্যাকশনগুলো চালানো যাবে। Publish/Schedule/Rewrite/Reject সবগুলোই আলাদা আলাদা modal/confirmation দিয়ে হবে।
- “Pause Automation” এবং “Emergency Stop” সবসময় confirmation modal দিয়ে হবে।

### Public News
- `/news` পেজে শুধুমাত্র **Published** পোস্টগুলো দেখা যাবে।
- কোনো পোস্টে ক্লিক করলে `/news/[slug]` এ বিস্তারিত পেজ খুলবে।
- বিস্তারিত পেজ থেকে “Share” চাপলে Share/Copy Link modal খুলবে।

---

## 7) Acceptance Checks (Frontend)

- Admin route `/admin/news-engine` renders and tab navigation works.
- Every interaction opens the correct connected modal and returns to the correct place on close.
- Public `/news` shows only published items (by UI contract; backend wiring later).
- Public `/news/[slug]` shows not-found state when missing.
- No hardcoded colors, no `dark:*`, multi-theme safe.

---

**This plan is a visual contract: after approval and implementation, every route and interaction above will exist and behave as described.**

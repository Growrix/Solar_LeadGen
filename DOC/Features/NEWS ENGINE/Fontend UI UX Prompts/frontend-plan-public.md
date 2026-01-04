# AI News Engine — Public/Guest Pages Frontend Plan (SOT)

## 0) Purpose
This document is the **Single Source of Truth** for building the **Public/Guest News pages** that display the news posts created and published via the **Admin AI News Engine**.

Goal: Any AI or human can build the public UI **sequentially** with **no context loss**, and it will stay aligned with the Admin News Engine fields and statuses.

---

## 1) Strict Rules (Must Follow)
These rules must follow: `DOCS/Prompts/AI PROMPTING/AI Prompting Guideline.md`

- Do **not** build complex flows in one prompt.
- Build **pages first**, then **modals**.
- **One modal = one intent**.
- Every prompt must declare: `This is Step X of Y in the Public News frontend flow.`
- Every click must map to: what opens next, fields/options, confirm/cancel, and where user returns.
- Do not jump ahead.

---

## 2) Alignment Contract (Admin → Public)
Public pages must be compatible with what Admin News Engine produces.

### 2.1 What public users should see
- **Only Published content** should be visible publicly.
- Public pages must show:
  - Headline
  - Publish date/time (publishedAt)
  - Article body
  - SEO metadata (title/meta)
  - Keywords/tags (if used)
  - Optional: source attribution (if allowed)

### 2.2 What public users should NOT see
- Internal statuses (Research Done / Draft Ready / Needs Review / Scheduled) unless you intentionally expose them (not recommended).
- Confidence score (admin-only).
- Admin audit logs, prompts, automation controls.

---

## 3) Scope & Constraints
### In Scope
- Public News listing page(s)
- Public News details (single article)
- Public search/filter UX (minimal, user-friendly)
- Sharing/SEO UX surfaces (UI only)
- UI states: loading, empty, error placeholders

### Out of Scope
- Auth, subscriptions, paywalls
- Comments system (unless later requested)
- Backend implementation (this doc is UI-only), but the UI contracts enable backend planning

---

## 4) Public Information Architecture (Routes / Pages)
Suggested minimal public routes:
- `/news` — News listing
- `/news/:slug` — News article details

Optional routes (only if required):
- `/news/tag/:tag` (or query based)

---

## 5) Core Public Objects (UI-Level Only)
### 5.1 Public News Post
Minimum fields required in UI:
- `title` (Headline)
- `slug`
- `publishedAt`
- `excerpt` (optional, derived from article or provided)
- `coverImage` (optional)
- `content` (article body)
- `seoTitle`, `seoDescription` (optional)
- `tags/keywords` (optional)

---

## 6) E2E Public User Flow (Narrative)
1) Guest opens `/news` → sees a list of published posts.
2) Guest uses search and/or filters (if present) to find a topic.
3) Guest clicks a post card → navigates to `/news/:slug`.
4) Guest reads the article → can share/copy link.
5) Guest can return to the listing page and continue browsing.

---

## 7) Build Sequence (Pages First, Modals Later)
Total Steps: **6**

1. Public News Listing Page (`/news`)
2. Public News Details Page (`/news/:slug`)
3. Search & Filters UX (on listing page)
4. Share / Copy Link Modal (single intent)
5. SEO Preview Panel (optional UI block, not a modal)
6. Error/Empty State Spec (final pass)

---

# STEP-BY-STEP UI/UX SPEC + AI PROMPTS

**How to use this plan:**
- For each step, find the section titled `Copy: Step X of 6 — ...`.
- Copy the prompt block under that heading and paste it into Google AI Studio.
- After running each prompt, check the "What to expect in the outcome" section.
- Always proceed in order.

---

## Copy: Step 1 of 6 — Public News Listing Page (`/news`)
### Purpose
Show all **Published** news posts to guests in a clean, fast browsing UI.

### Layout
- Page header: “News”
- Optional intro text: what this section is about
- Listing region (cards)
  - Each card shows:
    - Headline
    - Publish date
    - Excerpt (short)
    - Optional cover image thumbnail
    - CTA: “Read more”
- Pagination OR “Load more” (choose one)

### Interaction Map
- Clicking a card or “Read more” → navigates to `/news/:slug` (Step 2)

### States
- Loading: skeleton cards
- Empty: “No published news yet”
- Error placeholder: “Failed to load news” (UI only)

### What to expect in the outcome
- You should see a complete `/news` page with a list of cards.
- No admin-only fields visible.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 1 of 6 in the Public News frontend flow.

Task:
Design the public News listing page at /news that shows only published posts.
Use a modern, simple layout with a header and a card list.

User interactions:
- Clicking a card or "Read more" navigates to /news/:slug (do not design the details page yet).

Constraints:
- Do not include admin-only data (confidence, draft statuses, automation)
- No backend logic

Output:
- UI layout + component breakdown
- Loading/empty/error placeholder states

Stop after:
- This page only
```

---Done

## Copy: Step 2 of 6 — Public News Details Page (`/news/:slug`)
### Purpose
Display a single published post in a readable, SEO-friendly layout.

### Layout
- Breadcrumb or back link: “Back to News”
- Headline (H1)
- Meta row: publish date
- Optional: tags/keywords chips
- Article body (formatted text)
- Optional: cover image (top)
- Footer: share button (opens Step 4 modal)

### Interaction Map
- Back to News → returns to `/news`
- Share → opens Share / Copy Link modal (Step 4)

### States
- Loading skeleton
- Not found (UI state): “This post is not available”

### What to expect in the outcome
- You should see a clean details page that only displays published content fields.
- A visible back navigation.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 2 of 6 in the Public News frontend flow.

Task:
Design the public News details page at /news/:slug.
It must display headline, publish date, optional cover image, tags/keywords, and the article body.

User interactions:
- "Back to News" returns to /news.
- "Share" opens a Share/Copy Link modal (do not design the modal yet).

Constraints:
- No admin-only data
- No backend logic

Output:
- UI layout + component breakdown
- Loading and not-found states

Stop after:
- This page only
```

---Done

## Copy: Step 3 of 6 — Search & Filters UX (inside `/news`)
### Purpose
Help guests find relevant published posts quickly.

### UX Requirements
- Keep filters minimal and public-safe.
- Must not expose internal admin statuses.

### Controls
- Search input (search by headline)
- Optional filter chips/dropdown:
  - Tag/keyword
  - Date range (optional)

### Interaction Map
- Typing in search filters the list (UI-only)
- Selecting a tag filters the list (UI-only)

### States
- No results: “No posts match your search” + “Clear filters”

### What to expect in the outcome
- You should see a search bar and simple filters integrated into the listing page.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 3 of 6 in the Public News frontend flow.

Task:
Enhance the /news listing page with search and minimal filters:
- Search by headline
- Optional tag/keyword filtering

Constraints:
- Do not include internal admin statuses or confidence score
- No backend logic

Output:
- UI placement of search/filters
- No-results state

Stop after:
- This enhancement only
```

---

## Copy: Step 4 of 6 — Share / Copy Link Modal
### Trigger
From the Public News Details page, clicking “Share”.

### Purpose
Single-intent modal for sharing the public post.

### Layout
- Title: “Share this article”
- Read-only URL field
- Buttons:
  - Copy link
  - Close

### Behavior
- Copy link shows a success feedback state
- Close returns to the details page

### What to expect in the outcome
- You should see a small modal that only handles copying/sharing.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 4 of 6 in the Public News frontend flow.

Trigger:
Opened when user clicks "Share" on /news/:slug.

Purpose:
Let user copy the article URL.

Modal sections:
- Title
- Read-only URL field
- Copy button and Close button

Constraints:
- One modal = one intent
- No backend logic

Output:
- Modal layout + success feedback state

Stop after:
- This modal only
```

---Done

## Copy: Step 5 of 6 — SEO Preview Panel (Optional UI Block)
### Purpose
Ensure the public details page has a clear area where SEO title/description can be visually verified (UI only).

### Placement
- In the details page, below the article or in a small “SEO” accordion (optional).

### What to expect in the outcome
- A small, non-intrusive block that previews SEO title/description.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 5 of 6 in the Public News frontend flow.

Task:
Add an optional, minimal SEO preview UI block on the /news/:slug page that can show:
- SEO title
- SEO description

Constraints:
- Keep it minimal and not admin-like
- No backend logic

Output:
- UI block layout and states

Stop after:
- This enhancement only
```

---Done

## Copy: Step 6 of 6 — Final State Coverage Pass (Error/Empty/Loading)
### Purpose
A final pass to ensure public pages are production-ready in terms of UX states.

### Required states
- Listing: loading, empty, no results, error
- Details: loading, not found, error

### What to expect in the outcome
- A consolidated state spec you can apply consistently.

### Copy and paste this prompt into Google AI Studio:
```
Context:
You are a SaaS frontend UI/UX engineer.
Scope: UI only.

Flow position:
This is Step 6 of 6 in the Public News frontend flow.

Task:
Define and standardize the public News UI states across:
- /news listing
- /news/:slug details

Constraints:
- UI only
- Do not introduce new pages

Output:
- State-by-state UX specification

Stop after:
- States spec only
```

---Done

## 8) Cross-Cutting Public UX Requirements
- Public pages must only show **Published** content.
- Public routes must be shareable (stable permalink via slug).
- Keep public UI minimal and trust-building.
- Do not expose admin-only terms, controls, or internal statuses.

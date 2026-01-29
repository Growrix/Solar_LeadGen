# **News Engine — Public Pages + Post Page — Frontend UI/UX System Plan (SOT)**

> **Status:** UI/UX Planning Complete (Pending Approval to Start Implementation)
> **Audience:** Frontend AI Builders → Backend Engineers → Product Owners
> **Dependency:** Must be approved BEFORE implementation changes
> **Date:** 2026-01-03

---

## 0) Purpose & Contract

This document is the **Single Source of Truth (SOT)** for building the **News Engine Public Pages UI/UX** so that **News posts published from Admin News Engine** can be consumed by public/guest users via:

- Homepage preview section (on `/`)
- Public News hub/listing page (on `/news`)
- Public News post page (on `/news/[slug]`)

It guarantees:

- Logical, backend-implementable UI
- Deterministic user flows
- No missing states, triggers, or dead ends
- AI-safe, step-locked frontend building

Baseline contract:
- **Baseline: Existing UI will NOT be lost.** Any existing header/footer/navigation behaviors must remain intact.

⚠️ No implementation work may begin until this document is approved.

---

## 1) Non-Negotiable Rules (Must Be Enforced by Any AI)

Derived from:

```
DOC/GUIDELINES & SOT/README.md
DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md
DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md
```

### Structural Rules

- Pages are built **before** modals.
- One step = one page OR one modal OR one validation pass.
- One modal = one intent.
- No step may reference future UI elements.

### Prompting Rules

- Every build prompt MUST declare:

  ```
  This is Step X of Y in the News Engine Public Pages frontend flow.
  ```

- Each step must define:
  - Trigger source
  - Exit destination
  - UI states
- No backend logic or assumptions allowed.

### UX Safety Rules

- No invisible state transitions.
- No irreversible actions without confirmation UX.
- No “happy path only” flows.

### Styling + Design-System Rules

- Use semantic tokens and existing theme primitives only.
- ❌ No hardcoded colors (no `#...`, no `rgb(...)`, no `rgba(...)`).
- ❌ No inline styles.
- ❌ No `dark:` utilities.
- Reuse existing neumorphic patterns and shared components where available.

### Interaction Validity Rule (Accessibility)

- Do NOT nest interactive elements (e.g., a `<button>` inside a link). Cards that navigate must be entirely clickable as a link, with any “CTA-looking” visuals implemented as non-interactive elements inside the card.

---

## 2) Scope & Explicit Constraints

### In Scope

- Public-facing UI for:
  - Homepage News preview section
  - `/news` hub/listing
  - `/news/[slug]` post page
- Navigation & layout consistency with existing guest pages
- Share UX (copy link) as a modal
- UI-level states (loading, empty, disabled, error)
- UX permissions (what is visible vs disabled)

### Out of Scope (By Design)

- API contracts
- Database schema
- Server-side publishing automation
- Admin News Engine UI (already separate)
- New routes not explicitly listed here

### Explicit Route Constraints

- Allowed routes:
  - `/`
  - `/news`
  - `/news/[slug]`
- ❌ Do not add routes like `/news/category/...`, `/news/tags/...`, `/news/search`, etc.

### Content Model Constraint (Critical)

- The current public post experience must NOT assume a full article body exists.
- The UI must be designed to render correctly using only the available News item fields (title, summary, category, tags, publishedAt, slug, etc.).

---

## 3) Information Architecture (IA)

### Navigation Entry Points

- Homepage (`/`) News section:
  - “See all news” → `/news`
  - Clicking a story card → `/news/[slug]`
- Guest bottom nav:
  - “Articles” can remain `/blog` or optionally be updated to include News later (not required here).

### Pages Hierarchy

```
Public
 ├─ / (Homepage)
 │   ├─ News Section (preview)
 │   └─ Links into /news and /news/[slug]
 ├─ /news (Public News hub)
 │   ├─ Featured story
 │   ├─ Top stories
 │   ├─ Browse by category (in-page grouping)
 │   └─ All News grid
 └─ /news/[slug] (Public News post)
     ├─ Main content card (title + metadata + summary)
     └─ Sidebar (share + tags + related stories)
```

Explain:
- `/` preview exists to expose News to guests and provide fast entry.
- `/news` exists to browse published stories without requiring admin access.
- `/news/[slug]` exists to present a single public story.

### User Roles & Visibility (UX-level)

- Guest (not logged in):
  - Can view `/`, `/news`, `/news/[slug]`
  - Can copy share link
  - Sees only **published** stories
- Logged-in users (Homeowner/Installer/Admin) if they visit public routes:
  - Should see the same public content as guests (no admin-only fields).

---

## 4) Core Domain Objects (UI-Level Contract)

> ⚠️ These are conceptual objects, NOT schemas.

### 4.1 Object: News Item

**Used In UI For:**

- Cards on homepage preview
- Featured/top stories cards on `/news`
- Related stories cards on `/news/[slug]`

**Minimum Display Fields:**

- `title` (primary scan + click decision)
- `summary` (preview content)
- `category` (topic grouping + badge)
- `tags[]` (secondary metadata)
- `publishedAt` (recency cue; fallback to created date if needed)
- `slug` (routing)

### 4.2 User-Facing Status System

Public UI statuses MUST:

- Be mutually exclusive
- Be visually distinguishable
- Map cleanly to UI behavior

Public-facing status rules:

- Published
  - Visible everywhere in public UI
- Not published (draft/scheduled/archived/etc.)
  - Not visible in public UI

---

## 5) End-to-End UX Flow (Narrative)

> This section becomes the backend flow validation reference later.

### Primary Flow

1. Guest enters via homepage (`/`).
2. Guest sees “Latest News” section.
3. Guest clicks:
   - “See all news” → `/news`, OR
   - a story card → `/news/[slug]`.
4. On `/news`, guest browses:
   - Featured story / Top stories
   - Category group sections (in-page)
   - All stories grid
5. Guest clicks a story → `/news/[slug]`.
6. On post page, guest:
   - reads title + date + category + tags
   - reads summary
   - clicks Share → opens Share modal → copies link
7. Guest exits:
   - Back to News → `/news`

### Alternate / Failure Paths

- If no published stories exist:
  - Homepage news section shows an empty card with “Check back soon”.
  - `/news` shows an empty state.
- If slug is invalid/not found:
  - `/news/[slug]` shows a “Not found” UI with a “Back to News” action.
- If copy-to-clipboard fails:
  - Share modal displays a short failure message and still shows the link to manually copy.

### বাংলা ব্যাখ্যা (Public/Guest Flow)

1) ভিজিটর হোমপেজে (`/`) আসে এবং “Latest News” সেকশন দেখে।
2) ভিজিটর “See all news” ক্লিক করলে `/news` পেজে যায়।
3) অথবা কোনো নিউজ কার্ড ক্লিক করলে `/news/[slug]` পোস্ট পেজে যায়।
4) পোস্ট পেজে শিরোনাম, ক্যাটাগরি, তারিখ, ট্যাগ এবং summary দেখা যায়।
5) “Share” ক্লিক করলে একটি মোডাল ওপেন হয় এবং লিংক কপি করা যায়।
6) “Back to News” ক্লিক করলে আবার `/news` এ ফিরে যায়।

---

## 6) Build Sequence (Locked Order)

**Total Steps:** `5`

| Step | Type       | Name                                 | Reason                    |
| ---- | ---------- | ------------------------------------ | ------------------------- |
| 1    | Page/Shell | Guest-shell support for `/news`      | Navigation consistency    |
| 2    | Page       | Homepage: “Latest News” section      | Primary entry + discover  |
| 3    | Page       | `/news` modern hub layout            | Browsing + hierarchy      |
| 4    | Page+Modal | `/news/[slug]` post + Share modal    | Read + share + related    |
| 5    | Validation | UX validation pass (click map/states)| Prevent regressions       |

⚠️ Steps must be built strictly in order.

---

## 7) State Management (UX Level)

Define UX behavior for all public News surfaces.

- Default state
  - Render published stories in the correct hierarchy (featured/top/category/all).
  - All click targets lead to deterministic next destinations.
- Loading state
  - Show lightweight skeleton placeholders (no layout shift, no “blank screen”).
  - Do not block navigation/back.
- Empty state
  - Show a neumorphic empty card with a clear message.
  - Homepage: empty section remains present, but indicates no stories yet.
  - `/news`: empty state replaces featured/top/category/grid blocks.
- Error state
  - Show a short, user-friendly message.
  - Do not show stack traces or internal implementation details.
- Success state
  - Share-copy: show a brief success message (“Link copied.”).
- Disabled state
  - If no share link is available, show Share UI disabled with helper text (rare on client pages).

---

## 8) Filters, Sorting & Search

- Search: **Out of scope** (do not add a search box).
- Filters: **Out of scope** (do not add filtering UI).
- Sorting (implicit): newest-first by publish date (fallback to created date).
- Browse-by-category: allowed only as **in-page grouping** on `/news` (no new routes).

---

## 9) Permissions & Guards

- Public visibility rules:
  - Only published stories are shown on public pages.
  - Items without slugs must not appear (no broken links).
- UI-level restrictions:
  - No admin-only fields are displayed (internal scores, operational labels, etc.).
  - Actions are limited to navigation + copying a link.
- Hidden vs disabled:
  - Non-applicable actions are hidden (e.g., no “Edit”, “Delete”, “Publish”).
- Confirmation requirements:
  - Not required for navigation.
  - Share modal provides explicit close behavior.

---

## 10) Edge Cases & Failure Scenarios

- Missing data:
  - Missing `category` renders as “General”.
  - Missing `tags` renders “No tags for this story.”
  - Missing `publishedAt` renders a safe fallback (e.g., “—”).
- Invalid slug:
  - Render a “Not found” card with “Back to News”.
- Storage/data updates:
  - If data source changes (e.g., storage event), UI should update without breaking navigation.
- Clipboard failures:
  - If copy fails, show an error message and keep the link visible for manual copy.
- Network delay:
  - Since this is client-stubbed data, network delay mainly impacts navigation; keep feedback minimal.

---

## 11) Analytics & UX Signals (Optional)

- Out of scope for implementation unless already available:
  - View counts, read time, likes, comments.
- Allowed lightweight signals:
  - Published date
  - Category + tags

---

## 12) Implementation Readiness Check

- Can this UI be implemented safely without backend changes?
  - Yes, as long as the public pages read from the existing news state source.
- UX elements that would need backend confirmation in the future:
  - Full article body content
  - Search/filtering
  - View counts / analytics
  - True share metadata/OG tags per post
- Risky assumptions (must be explicitly acknowledged):
  - Public “post content” is currently the summary; if a rich body is added later, the post page layout must be extended.

---

# 🧠 STEP-BY-STEP UI/UX SPEC + AI-READY PROMPTS

> This section is directly copy-pasted into AI coding assistants.

---

## 🔹 Step 1 of 5 — Guest-shell support for `/news`

### Purpose

Make `/news` routes behave like other guest pages in the app shell (header/footer and guest bottom nav behavior consistency).

### Trigger

- User navigates directly to `/news` or `/news/[slug]`.
- User clicks into News from homepage.

### Layout Structure

- Keep existing global layout patterns.
- Ensure guest bottom nav is shown on `/news` routes (same as `/` and `/blog`).

### Interaction Map

| User Action                    | Result                                | Next Step |
| ----------------------------- | ------------------------------------- | -------- |
| Visit `/news`                 | Guest shell + bottom nav visible      | Step 2   |
| Visit `/news/[slug]`          | Guest shell + bottom nav visible      | Step 2   |

### UI States

- Default: shell renders normally.
- Error: none expected (UX only).

### Exit Rules

- No modal exits.
- This step is complete when `/news` routes visually match other guest pages.

### Expected Outcome (Validation Gate)

- [ ] `/news` shows the guest bottom nav (if user is not logged in).
- [ ] No layout regression on other pages.

### Copy/paste prompt

```
Context:
You are working in a Next.js 14 App Router codebase.

Flow position:
This is Step 1 of 5 in the News Engine Public Pages frontend flow.

Task:
Make sure /news and /news/[slug] are treated as guest pages for the purpose of showing the GuestBottomNavBar in the existing app shell.

Constraints:
- Do not add new routes.
- Do not change the nav design.
- Only adjust the guest-page detection logic so /news* behaves like /blog*.

Acceptance:
- Guest bottom nav shows on /news and /news/[slug] for unauthenticated users.
- No other pages regress.
```

---

## 🔹 Step 2 of 5 — Homepage: “Latest News” section

### Purpose

Expose News content on the homepage with a polished, modern preview UI and clear entry points into `/news`.

### Trigger

- User visits homepage (`/`).

### Layout Structure

- Section heading: “Latest News” + short support text.
- Layout contract:
  - 1 featured story card
  - 2 secondary story cards
  - CTA: “See All News” linking to `/news`

### Interaction Map

| User Action                    | Result                          | Next Step |
| ----------------------------- | ------------------------------- | -------- |
| Click featured/secondary card | Navigate to `/news/[slug]`      | Step 4   |
| Click “See All News”          | Navigate to `/news`             | Step 3   |

### UI States

- Default: show up to 3 newest published stories.
- Loading: show a lightweight skeleton or placeholder card.
- Empty: show a neumorphic empty card “No news yet. Check back soon.”
- Error: show a simple message (no stack traces).

### Exit Rules

- Navigations use Next.js routing.

### Expected Outcome (Validation Gate)

- [ ] Section matches the same quality level as Blog cards.
- [ ] All click targets lead to valid routes.
- [ ] Empty state looks intentional.

### Copy/paste prompt

```
Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 App Router repo.
Scope: UI only.

Flow position:
This is Step 2 of 5 in the News Engine Public Pages frontend flow.

Task:
Create or upgrade the homepage News section to look modern and consistent with existing card patterns.

Layout requirements:
- Featured + two secondary cards.
- CTA to /news.

Data rules:
- Read from the existing News items source already used by /news.
- Show only published items that have slugs.
- Sort newest first using published date (fallback to created date).

Constraints:
- No hardcoded colors, no inline styles, no dark: utilities.
- Do not introduce nested interactive elements.

Acceptance:
- Clicking any card goes to /news/[slug].
- “See All News” goes to /news.
- Empty and loading states exist.
```

---

## 🔹 Step 3 of 5 — `/news` modern hub layout

### Purpose

Provide a modern browsing experience with clear hierarchy:
- featured story
- top stories
- browse-by-category grouping
- all-news grid

### Trigger

- User navigates to `/news`.

### Layout Structure

- Page header: title + support text.
- Featured story card.
- Top stories (stacked cards/list) adjacent to featured on desktop.
- Browse by Category sections:
  - Each category shows up to 3 stories.
  - Category sections render only if they have content.
- All News grid for remaining stories.

### Interaction Map

| User Action            | Result                     | Next Step |
| --------------------- | -------------------------- | -------- |
| Click any story card  | Navigate to `/news/[slug]` | Step 4   |

### UI States

- Loading: skeleton placeholders.
- Empty: neumorphic empty state card.
- Error: simple message.

### Exit Rules

- Navigation uses `Link`.

### Expected Outcome (Validation Gate)

- [ ] Hierarchy feels finished (featured/top/category/all).
- [ ] No nested interactive elements.
- [ ] Missing category displays as “General”.

### Copy/paste prompt

```
Context:
Next.js 14 App Router, UI-only task.

Flow position:
This is Step 3 of 5 in the News Engine Public Pages frontend flow.

Task:
Implement a modern /news hub layout with featured + top stories + browse-by-category + all-news grid.

Constraints:
- Do not add new routes.
- Do not add search or filters.
- No nested interactive elements (no buttons inside Link cards).
- No inline styles and no hardcoded colors.

Acceptance:
- Every card click navigates to /news/[slug].
- Empty state is present and styled.
- Category labels never render as undefined.
```

---

## 🔹 Step 4 of 5 — `/news/[slug]` post page + Share modal

### Purpose

Present a single story in a modern two-column layout with share capability, tags, and related stories.

### Trigger

- User clicks a story card from `/` or `/news`.

### Layout Structure

- Back to News action.
- Two-column layout (desktop):
  - Main: title, category pill, publish date, summary.
  - Sidebar: share card, tags, related stories.
- Share modal:
  - Title + helper text
  - Readonly link field
  - Copy button
  - Close button
  - Close by overlay click

### Interaction Map

| User Action           | Result                          | Next Step |
| -------------------- | ------------------------------- | -------- |
| Click “Back to News” | Navigate to `/news`             | Step 5   |
| Click “Share”        | Opens Share modal               | Same     |
| Click “Copy link”    | Copies link + success message   | Same     |
| Click related story  | Navigate to that `/news/[slug]` | Same     |

### UI States

- Not found: show a “Not found” card + Back to News.
- Copy success: brief “Link copied” message.
- Copy failure: brief “Could not copy link” message.

### Exit Rules

- Share modal closes on:
  - Close button
  - overlay click

### Expected Outcome (Validation Gate)

- [ ] Not-found state is graceful.
- [ ] Share modal is accessible (labels, focusable controls).
- [ ] Related stories list never includes the current item.

### Copy/paste prompt

```
Context:
Next.js 14 App Router. UI-only.

Flow position:
This is Step 4 of 5 in the News Engine Public Pages frontend flow.

Task:
Create a modern /news/[slug] page with a two-column layout and a Share modal that copies the current URL.

Constraints:
- Do not invent a full article body; use summary as content.
- No inline styles, no hardcoded colors, no dark: utilities.
- Use semantic layering for the modal.

Acceptance:
- Back goes to /news.
- Share modal opens/closes correctly.
- Copy behavior reports success/failure.
- Tags/Category render gracefully even when missing.
```

---

## 🔹 Step 5 of 5 — Final UX validation pass (click map + states)

### Purpose

Verify that the public News surfaces are “finished” in behavior:
- all click targets work
- empty/error states are present
- guest shell behavior is consistent

### Trigger

- After Steps 1–4 are completed.

### Layout Structure

- No new UI; validation only.

### Interaction Map (Checklist)

| Area             | Check                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Homepage         | Featured + cards navigate correctly; “See All News” works              |
| `/news`          | Every card navigates; no nested interactive elements                    |
| `/news/[slug]`   | Back works; Share open/close; Copy feedback; Related story navigation   |
| Guest shell      | Guest bottom nav appears on `/news` routes like other guest pages       |
| Empty states     | No-news state looks intentional on `/` and `/news`                      |
| Not found        | Bad slug shows “Not found” UI + back action                             |

### UI States

- Confirm default, loading, empty, and not-found behavior are all present.

### Exit Rules

- None.

### Expected Outcome (Validation Gate)

- [ ] No dead clicks.
- [ ] No undefined UI labels.
- [ ] Public news feels consistent with the site.

### Copy/paste prompt

```
Context:
This is a validation-only step.

Flow position:
This is Step 5 of 5 in the News Engine Public Pages frontend flow.

Task:
Perform a UX validation pass of / (News section), /news, and /news/[slug].

Rules:
- Do not add new features.
- Only apply minimal fixes found during validation.

Acceptance:
- All click targets lead to deterministic outcomes.
- All empty/not-found states are styled and understandable.
- Guest shell behavior is consistent on /news routes.
```

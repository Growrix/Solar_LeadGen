# News Engine — Public Pages UI/UX Plan (VS Code Copilot, Current-Site Aligned)

## 0) Purpose
Create a **sequence-locked, implementation-ready** frontend UI/UX plan for the **public News pages** so that **News posts published from Admin News Engine** appear correctly for guests.

Deliverables in this plan:
- Homepage: add a **News section** (currently missing)
- Public listing: `/news`
- Public post page: `/news/[slug]`
- Minimal UX glue so these pages behave like other guest pages in this app (header + guest bottom nav)

This plan is designed to be executed **in VS Code using Copilot** (not Google AI Studio).

---

## 1) Strict Rules (Must Follow)
References (must comply):
- `DOC/GUIDELINES & SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/UI-UX-Layout-and-Routing-Standards.md`
- Prompt sequencing SOP: `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`

Non-negotiables:
- **Pages first, then any modals** (only Share modal is in-scope).
- **One step = one surface change** (avoid mixing homepage + routing + detail page in one step).
- **No undefined transitions**: every click in public News must map to a deterministic next page/modal.
- **Semantic design tokens only** (no hardcoded colors, no inline styles, no `dark:` prefixes).
- Do not add new “nice-to-have” pages (no categories page, no newsletter popup, no search page) unless explicitly included below.

---

## 2) Current State Audit (As-Is Reality)
This plan is based on what already exists in the repo.

### 2.1 Routes already exist (but are not integrated well)
- `src/app/news/page.tsx` exists and renders a public listing.
- `src/app/news/[slug]/page.tsx` exists and renders a public detail page.

Both pages currently:
- Are **client components** that read from `loadNewsEngineState()` (localStorage-backed UI stub).
- Show **published items only** (status `PUBLISHED`) with a `slug`.
- Use `window.location.href` navigation.

### 2.2 Layout shell inconsistency for `/news`
`src/components/LayoutContent.tsx` defines guest pages as:
- `pathname === '/' || pathname?.startsWith('/blog')`

So `/news` pages currently do **NOT** count as guest pages. Result:
- Guest bottom nav is not shown on `/news`.
- The guest “Articles” nav routes to `/blog` only.

### 2.3 Homepage does not include News
Homepage (`src/app/page.tsx`) includes a Blog section (`src/components/BlogSection.tsx`) but there is **no News section**.

### 2.4 Public post content constraints (important)
`NewsItem` is defined in `src/lib/ui-stubs/news-engine.ts` and includes:
- `title`, `summary`, `category`, `tags`, `publishedAt`, `slug`, etc.

There is **no full article body/content field** today.
So the public post page must be designed to display **summary + metadata** (until a backend/content model exists).

---

## 3) Target UX (What We Are Building)

### 3.1 Public visibility rules
- Public surfaces show **Published** items only.
- No admin-only operational fields (audit logs, relevance score, AI model, internal statuses).

### 3.2 Navigation & shell
- `/news` and `/news/[slug]` must behave like other guest pages:
  - Use the existing global header behavior.
  - Show guest bottom nav on those routes (same behavior as `/` and `/blog`).

### 3.3 Homepage integration
- Add a **News section** to the homepage.
- News section shows a small subset (e.g., latest 2–3 published items) and links to `/news`.

### 3.4 Post page UX
- `/news/[slug]` must show:
  - Back link to `/news`
  - Title
  - Published date
  - Category + tags
  - Summary (as the current “content”)
  - Share (copy link)

---

## 4) Information Architecture (Final)
- `/` (Homepage)
  - Existing sections remain
  - New: **News section** (published items preview)
- `/news`
  - Public listing of published news
- `/news/[slug]`
  - Public news “post” details

No additional routes are created in this plan.

---

## 5) E2E Guest Flow (Narrative)
1) Guest lands on homepage (`/`).
2) Guest sees News section and clicks:
   - “See all news” → goes to `/news`, or
   - a news card → goes to `/news/[slug]`.
3) On `/news`, guest browses published posts and clicks “Read” → goes to `/news/[slug]`.
4) On `/news/[slug]`, guest reads summary and clicks Share → copies link.
5) Guest uses Back → returns to `/news`.

### বাংলা ব্যাখ্যা (Guest flow)
1) ভিজিটর প্রথমে হোমপেজে (`/`) আসে।
2) হোমপেজে News সেকশন থেকে “See all news” বা কোনো একটি কার্ডে ক্লিক করে।
3) “See all news” করলে `/news` পেজে যাবে, আর কার্ডে ক্লিক করলে `/news/[slug]` পোস্ট পেজে যাবে।
4) পোস্ট পেজে শিরোনাম/তারিখ/ট্যাগ/summary দেখবে এবং Share করলে লিংক কপি হবে।
5) Back করলে আবার `/news` পেজে ফিরে যাবে।

---

## 6) Build Sequence (Strict, VS Code Copilot)
Total Steps: **5**

1) Fix guest-shell detection for `/news`
2) Create homepage News section component (UI-only)
3) Update `/news` listing page to match app patterns
4) Update `/news/[slug]` page (metadata + share)
5) Final UX validation pass (click map + empty states)

---

# v3 Addendum — Modern Public News Design Blueprint (No New Routes)

This addendum upgrades the **visual design + layout density** for the public News surfaces **without adding any new routes**.

## A) Modern UI goals (what “nice” means here)
- Match the **BlogSection card quality**: rounded-2xl cards, neumorphic shadows, category pill, strong typography, clear CTAs.
- Use **layout hierarchy**:
  - 1 featured story (hero card)
  - a short “Top stories” lane/list
  - then the main grid
- Make pages feel “finished” via:
  - consistent spacing rhythm (`max-w-7xl`, `px-4 sm:px-6 lg:px-8`, `gap-8`, `p-6 lg:p-8`)
  - consistent card styling (same base classes as Blog cards)
  - consistent metadata rows (date + reading cues)
- Stay within constraints:
  - **no hardcoded colors** / no inline styles / no `dark:`
  - only existing semantic tokens and shared components

## B) Visual layout contracts (ASCII)

### B.1 Homepage (`/`) — News section (featured + 2 cards)
```
Latest News
Short support text...

[ FEATURED CARD (spans full width on mobile; 2 cols on desktop) ]

[ Card ] [ Card ]

            (See all news CTA)
```

**Featured card content** (still based on current NewsItem model):
- Category pill (same look as Blog)
- Title (bigger)
- Summary (2–3 lines)
- Meta row: Published date
- CTA button: “Read Story”

**Secondary cards**:
- Same structure as Blog cards, slightly reduced

### B.2 Listing (`/news`) — Featured + category sections + grid
```
News (page title)
Support text...

[ FEATURED STORY (left, large) ] [ TOP STORIES (right, stacked list) ]

Browse by Category
  Category A
    [ card ][ card ][ card ]
  Category B
    [ card ][ card ][ card ]

All News
  [ card ][ card ][ card ]
  [ card ][ card ][ card ]
```

Notes:
- “Browse by Category” is **in-page grouping**, not a new route.
- Category sections should only render if that category has posts.
- Limit each category lane to top 3 items to keep the page clean.

### B.3 Post (`/news/[slug]`) — Two-column “article + sidebar”
```
[ Back to News ]

[ MAIN COLUMN ]                [ SIDEBAR ]
Title                          Share card
Meta (date, category pill)     Tags
Summary content                Related stories (3)
```

Related stories (UI-only):
- Prefer same category; fallback newest published excluding current.

### B.4 Share modal — Modern, finished
- Centered modal card (rounded-2xl, neumorphic shadow)
- Title + helper text
- Readonly input showing URL
- Primary action: Copy
- Secondary: Close
- Close by overlay click

---

# REVISED STEP PROMPTS (UI-QUALITY LOCK)

These prompts replace the earlier “light” prompts for Steps 2–4.
They are sequence-locked and aligned with:
- `DOC/PROMPTS/AI PROMPTING/AI Prompting Guideline.md`
- `DOC/PROMPTS/AI PROMPTING/Template_AIfrontend.md`
- Blog card UI contract in `src/components/BlogSection.tsx`

## Copy: Step 2 of 5 — Homepage News section (Featured + 2 cards, Blog-matched)
### Purpose
Make homepage News feel as polished as the Blog section by **reusing the same card styling classes and spacing rhythm**.

### Non-negotiable UI contract
Reuse these patterns from Blog cards:
- Card base: `bg-background rounded-2xl shadow-neu-outset hover:shadow-neu-outset-lg overflow-hidden group cursor-pointer transition-colors duration-300`
- Inner padding: `p-6 lg:p-8`
- Category pill: `bg-background shadow-neu-inset px-3 py-1.5 rounded-xl` with the dot `bg-primary`
- Title hover: `group-hover:text-primary transition-colors`
- CTA button uses shared `Button` with `variant="secondary"`

### Copy/paste prompt for VS Code Copilot
```
Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 App Router repo.
Scope: UI only (no backend).

Flow position:
This is Step 2 of 5 in the News Engine public pages flow.

Task:
Upgrade the homepage News section to look modern and match the BlogSection card design exactly.

Layout requirements:
- Section header + support text (same spacing rhythm as BlogSection).
- Featured news card (uses the SAME base classes as Blog cards; slightly larger title).
- Two secondary cards below (same Blog card class patterns).
- CTA button at bottom: "See All News".

Data rules:
- Use loadNewsEngineState() on the client.
- Filter: status === 'PUBLISHED' and has slug.
- Sort newest first (publishedAt preferred).
- Render: 1 featured + next 2 cards (total 3).

User interactions:
- Clicking a card navigates to /news/[slug].
- CTA navigates to /news.

Constraints:
- Do NOT hardcode colors, no inline styles, no dark: classes.
- Use semantic tokens + existing classes used in BlogSection.
- Do not invent new components; use existing Button.
- Do not change unrelated homepage sections.

Stop after:
- Homepage News section UI is upgraded and consistent with BlogSection.
```

---

## Copy: Step 3 of 5 — `/news` modern listing (Featured + Top stories + Category lanes)
### Purpose
Make `/news` feel like a real content hub using a modern layout hierarchy while keeping the route unchanged.

### Copy/paste prompt for VS Code Copilot
```
Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 App Router repo.
Scope: UI only.

Flow position:
This is Step 3 of 5 in the News Engine public pages flow.

Task:
Redesign the /news page to look modern and finished.

Layout contract:
- Page header (title + support text) using the same max width + padding pattern as BlogSection.
- Above-the-fold two-column layout on desktop:
  - Left: Featured story card (reuse Blog card base classes).
  - Right: Top stories list (stacked smaller clickable rows/cards).
- Below: "Browse by Category" sections.
  - Group published posts by category (in-page, no new routes).
  - Show up to 3 posts per category (newest first).
- Below: "All News" grid (same Blog card styling).

Data rules:
- Use loadNewsEngineState() (client).
- Published-only + slug.
- Featured: newest post.
- Top stories: next 3 posts.
- Category lanes: remaining posts grouped.

User interactions:
- Any card/row navigates to /news/[slug] using Next.js routing (Link preferred).

Constraints:
- Remove any Admin button/link from /news.
- No hardcoded colors, no inline styles, no dark:.
- Reuse BlogSection card class patterns for consistency.

Stop after:
- /news layout matches this hierarchy and looks consistent with Blog UI.
```

---

## Copy: Step 4 of 5 — `/news/[slug]` modern post layout (2 columns + related)
### Purpose
Make the post page feel like a proper article layout, even though we only have `summary` today.

### Copy/paste prompt for VS Code Copilot
```
Context:
You are a SaaS frontend UI/UX engineer working in a Next.js 14 App Router repo.
Scope: UI only.

Flow position:
This is Step 4 of 5 in the News Engine public pages flow.

Task:
Redesign /news/[slug] to look like a modern article page with a two-column layout.

Layout contract:
- Top: Back link/button to /news.
- Main column:
  - Category pill (same as BlogSection), title, published date.
  - Summary rendered as the main readable content block.
- Sidebar column:
  - Share card/button (opens Share modal).
  - Tags chips.
  - Related stories list (3 items).

Related stories rules (UI-only):
- Prefer same category; else fallback to newest published excluding current.

Modal rules:
- Share modal must have no inline styles.
- Use semantic layering classes (z-modal if present) and existing neumorphic card patterns.
- Close via overlay click and Close button.

Constraints:
- No hardcoded colors, no inline styles, no dark:.
- Use existing Button component for actions.
- Do not introduce new routes.

Stop after:
- /news/[slug] has a modern layout and share modal looks finished.
```


---

# STEP-BY-STEP (Copy/Paste Prompts for VS Code Copilot)

## Copy: Step 1 of 5 — Treat `/news` as a guest page (shell + bottom nav)
### Goal
Make `/news` and `/news/[slug]` behave like other guest pages for header/bottom-nav purposes.

### Files to change
- `src/components/LayoutContent.tsx`

### Requirements
- Extend the `isGuestPage` logic to include `/news` routes.
- If there are guest-nav handlers that assume “Articles” == `/blog`, do **not** rename buttons or add new nav items in this step.
  - This step is shell-consistency only.

### Acceptance checks
- When visiting `/news`, the guest bottom nav renders (same as `/blog`).

### Copilot prompt
```
You are working in a Next.js 14 App Router project.

Task (Step 1 of 5): Update guest page detection so /news and /news/[slug] are treated as guest pages.

Constraints:
- Minimal change: only adjust the isGuestPage logic in src/components/LayoutContent.tsx.
- Do not add new navigation items.
- Do not change layout styling.

Expected outcome:
- GuestBottomNavBar appears on /news routes.
```

---

## Copy: Step 2 of 5 — Homepage News section (preview)
### Goal
Add a homepage section that previews published News Engine items and links into `/news`.

### Files to change / create
- Create: `src/components/NewsSection.tsx` (or a clearly named equivalent)
- Update: `src/app/page.tsx`

### Data contract (current reality)
Use `loadNewsEngineState()` from `src/lib/ui-stubs/news-engine.ts`.
- Filter: `status === 'PUBLISHED' && slug`
- Sort: newest first (prefer `publishedAt`)
- Display: top 2–3 items only

### UI layout
- Title: “News” / “Latest News”
- Short supporting text
- Grid/list of cards (similar density as BlogSection)
- CTA:
  - “See all news” → `/news`
  - Each card “Read” → `/news/[slug]`

### States
- Empty: show a simple “No news yet” message (do not break layout)

### Copilot prompt
```
Task (Step 2 of 5): Add a homepage News section that previews published News Engine items.

Implementation notes:
- Create a new component (src/components/NewsSection.tsx).
- Read data from loadNewsEngineState() (UI stub) on the client.
- Show only published items with slug.
- Link to /news and /news/[slug].

Constraints:
- Do not alter unrelated homepage logic.
- Use existing design tokens/classes (bg-background, bg-surface, shadow-neu-outset, text-foreground, text-muted-foreground etc.) and the shared Button component.

Expected outcome:
- Homepage renders a new News section below existing content without breaking anything.
```

---

## Copy: Step 3 of 5 — Public listing `/news` (polish + consistency)
### Goal
Bring `/news` page into alignment with current site patterns.

### Files to change
- `src/app/news/page.tsx`

### Required changes
- Remove the public “Admin” button/link (public page should not link into admin).
- Replace `window.location.href` navigation with Next.js-friendly navigation (Link or router).
- Keep published-only filter.

### UI requirements
- Header: “News”
- Card list:
  - Title
  - Publish date
  - Summary
  - Category/tags (optional)
  - CTA “Read”
- Empty state remains.

### Copilot prompt
```
Task (Step 3 of 5): Update the /news listing page.

Change requirements:
- Remove the Admin button.
- Replace window.location.href navigation with Next.js Link usage (preferred).
- Keep the published-only filtering based on loadNewsEngineState().

Constraints:
- No new pages or features.
- No hardcoded colors or inline styles.

Expected outcome:
- /news shows published cards and clicking goes to /news/[slug].
```

---

## Copy: Step 4 of 5 — Public post page `/news/[slug]` (metadata + share)
### Goal
Make the post page feel like a real “news post” while staying within current data model.

### Files to change
- `src/app/news/[slug]/page.tsx`

### Required UI
- Back to News
- Title
- Published timestamp
- Category
- Tags list (chips)
- Summary as the main readable content
- Share:
  - Copy current URL to clipboard

### Required tech cleanup
- Remove inline `style={{ zIndex: ... }}`.
- Ensure overlay uses semantic classes (use existing z-layer tokens if present; otherwise keep it minimal but no inline styles).
- Ensure modal can be closed by clicking overlay and by Close button.

### Copilot prompt
```
Task (Step 4 of 5): Improve /news/[slug] public post page.

Requirements:
- Keep using loadNewsEngineState() to resolve the published item by slug.
- Display title, published date, category, tags, and summary.
- Improve Share modal so it has no inline styles and uses semantic classes.

Constraints:
- UI only (no backend).
- Do not add new routes.
- Do not expose admin-only fields.

Expected outcome:
- /news/[slug] looks like a proper public post page and Share works.
```

---

## Copy: Step 5 of 5 — UX validation pass (click-map + empty states)
### Goal
Ensure all public News clicks are deterministic and the UX is consistent.

### Checklist
- Homepage News section:
  - “See all news” navigates to `/news`
  - Card CTA navigates to `/news/[slug]`
- `/news`:
  - “Read” navigates correctly
  - Empty state renders without layout break
- `/news/[slug]`:
  - Missing slug renders Not Found state
  - Back button returns to `/news`
  - Share opens/closes correctly
- `/news` routes show guest bottom nav (Step 1)

### Copilot prompt
```
Task (Step 5 of 5): Do a UX validation pass for public News.

Constraints:
- Only adjust issues found during validation (broken links, missing empty states, inconsistent button labels).
- No new features.

Expected outcome:
- The public News flow works end-to-end: homepage -> /news -> /news/[slug] -> back.
```

---

## 7) Notes / Known Limits (Intentional)
- This plan does not add full article bodies because `NewsItem` currently has only `summary`. When backend/content is planned, the post page can be extended to render rich content.
- This plan does not add a dedicated News link in the guest bottom nav; it only ensures `/news` routes are treated as guest pages and are reachable via homepage section.

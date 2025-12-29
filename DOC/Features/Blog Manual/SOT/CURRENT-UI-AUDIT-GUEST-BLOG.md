# Current State UI Audit — Guest Blog (As‑Is)

**Feature**: Blog Manual

**Status**: Draft (Audit complete; awaiting confirmation on desired changes)

**Owner**: GitHub Copilot (GPT-5.2)

**Created At**: 2025-12-29

## Purpose

This report documents the **current guest/public blog UI and behavior that already exists** in the codebase.

This audit is the baseline authority for:
- preventing accidental UI loss/regressions,
- ensuring new plans match existing behavior,
- clearly separating **“keep as-is”** vs **“intentional change”**.

---

## Sources (Code of Record)

- Public blog list page: `src/app/blog/page.tsx`
- Legacy blog post page: `src/app/blog/post/page.tsx`
- Seed data: `src/data/blogData.ts`
- Types: `src/types/blog.ts`

---

## Route Map (As‑Is)

### 1) `/blog` — Blog listing

**Data source**:
- Uses `allArticles` from `src/data/blogData.ts` (static seed data).

**UI present**:
- Hero title: “The SolarMatch Blog”.
- Responsive grid of article cards.
- “Load More Articles” button (increments visible items by 6).
- Footer.

**Card contents**:
- Cover image
- Category badge
- Read time
- Title
- Excerpt
- Author + date

**Navigation behavior (important)**:
- Clicking a card:
  - Stores the full post object in `sessionStorage` under `currentBlogPost`.
  - Navigates to `/blog/post`.

**Search & filtering logic exists but UI is missing (important)**:
- The page contains state + filtering for:
  - `searchTerm`
  - `selectedCategory`
- However, there is **no rendered search input and no category dropdown UI** in the JSX.
- Result: visitors cannot actually control search/category filters via UI today.

### 2) `/blog/post` — Blog post detail (legacy)

**How the post is loaded**:
- Reads `currentBlogPost` from `sessionStorage`.
- If missing → redirects back to `/blog`.

**What is truly dynamic**:
- Hero image, category, title, author, date, readTime, excerpt are taken from the stored post.

**What is NOT dynamic (important)**:
- The main article body is largely **hard-coded** text.
- The `Post` type has no `slug`, `id`, or `body/content` field.
- This means each seeded post is mostly the same “body” content today.

**Share buttons (important)**:
- Share icons are visible.
- They are mostly **non-functional** (no copy-link/share action implemented).

**Comments (client-only demo)**:
- Comments UI exists and is interactive.
- Comments are stored only in component state.
- “Auth” gating is based on a `localStorage.homeownerAuth` flag.
- Sign-in/sign-up uses `HomeownerSignInModal` and `HomeownerSignupModal`.

---

## Data Model (As‑Is)

### `Post` type (current)
- `title`, `excerpt`, `author`, `date`, `readTime`, `category`, `image`

### Seed data
- `src/data/blogData.ts` provides an array of posts using the fields above.

---

## UX Constraints & Couplings (As‑Is)

- **Deep linking is not supported**:
  - Directly opening `/blog/post` in a fresh session loses context and redirects to `/blog`.
- **Post detail content is not per-post**:
  - Body is hard-coded; only title/excerpt/meta differ.
- Share buttons are present but largely non-functional.

---

## Conflicts vs the Desired Plan (requires explicit approval)

Your plan in `DOC/Features/Blog Manual/PLAN/mainplan.md` targets:
- Canonical routes: `/blog` + `/blog/[slug]`.
- DB-backed Markdown content.
- Admin workflow (draft/review/schedule/publish).

But the current UI is:
- `/blog` + `/blog/post`.
- sessionStorage navigation.
- no slugs.
- hard-coded post body.

**Implication**: implementing canonical slug routes and unique per-post content is an **intentional UX behavior change** and must be approved.

---

## Bangla Summary (বাংলা সারাংশ)

- বর্তমানে `/blog` পেজে ব্লগ কার্ড দেখা যায় এবং “Load More Articles” কাজ করে।
- কোনো কার্ডে ক্লিক করলে পোস্টের ডাটা `sessionStorage`-এ রেখে `/blog/post` পেজে নিয়ে যায়।
- `/blog/post` পেজে টাইটেল/ইমেজ/ক্যাটেগরি/অথর/ডেট ডাইনামিক হলেও মূল বডি কনটেন্ট বেশিরভাগ হার্ডকোড করা।
- `/blog/post` ডাইরেক্ট ওপেন করলে (ডিপ লিংক) পোস্ট ডাটা না থাকলে `/blog` এ রিডাইরেক্ট করে।
- Share বাটনগুলো দেখা যায় কিন্তু বাস্তবে শেয়ার/কপি করার ফাংশন পুরোপুরি নেই।
- Comments সেকশন আছে কিন্তু এটি ডাটাবেজে সেভ হয় না—ক্লায়েন্ট-সাইড ডেমো ফ্লো।

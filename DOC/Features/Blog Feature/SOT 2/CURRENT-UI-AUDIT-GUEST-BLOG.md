# Current State UI Audit — Guest Blog (As‑Is)

**Feature**: Blog Manual (Guest/Public blog)

**Status**: Draft (Audit complete; awaiting confirmation on desired changes)

**Owner**: GitHub Copilot (GPT-5.2)

**Created At**: 2025-12-29

## Purpose

This report documents the **current (“as‑is”) guest blog UI/UX that already exists in the codebase**.

This audit is the baseline authority for:
- preventing accidental UI loss/regressions,
- ensuring new plans match existing behavior,
- and clearly calling out **intentional changes** that require approval.

---

## Sources (Code of Record)

- Public blog list page: `src/app/blog/page.tsx`
- Legacy/current blog post page: `src/app/blog/post/page.tsx`
- Seed data: `src/data/blogData.ts`
- Types: `src/types/blog.ts`

---

## Route Map (As‑Is)

### 1) `/blog` — Blog listing (current implementation)

**Data source**:
- Uses `allArticles` from `src/data/blogData.ts` (static in-repo seed data).

**UI**:
- Hero section with title “The SolarMatch Blog” + intro text.
- Grid of article cards (responsive 1 / 2 / 3 columns).
- “Load More Articles” button (increments visible items in batches of 6).
- Footer renders at bottom.

**Card contents**:
- Cover image
- Category badge
- Read time
- Title
- Excerpt
- Author + date

**Navigation behavior**:
- Clicking an article card:
  - stores the full `Post` object in `sessionStorage` under `currentBlogPost`
  - navigates to `/blog/post`

**Search & filtering (IMPORTANT finding)**:
- The page has state and filtering logic for:
  - `searchTerm`
  - `selectedCategory`
  - `filteredArticles`
- However, in the current JSX, there is **no rendered search input and no category dropdown UI**.
- Result: Users cannot actually change `searchTerm` or `selectedCategory` via the UI today.

### 2) `/blog/post` — Blog post page (current implementation)

**How post data is loaded**:
- Reads `currentBlogPost` from `sessionStorage`.
- If missing, redirects user back to `/blog`.

**Content rendering**:
- Renders a hero image and metadata (category/title/author/date/readTime) from the stored `Post`.
- The post body is **not** driven by stored post content (there is no `body` field in the `Post` type).
- Instead, the page shows a **hard-coded article body** (static paragraphs + headings) and only uses `post.excerpt` from the stored post.

**Share buttons (IMPORTANT finding)**:
- Share buttons exist visually (Twitter/Facebook/LinkedIn/Link).
- They currently have **no onClick behavior** (no link copy, no share URL composition).

**Comments (IMPORTANT finding)**:
- Comments UI exists and is interactive (client-only):
  - Starts with seeded example comments in component state.
  - User can write a comment.
  - If not logged in (`localStorage.homeownerAuth !== 'true'`):
    - opens sign-in modal and stores a pending comment in `sessionStorage`.
    - after sign-in success, forces full page reload; pending comment is auto-posted.
  - If logged in:
    - adds comment into in-memory `comments` state.

**Auth model (current behavior)**:
- Uses `localStorage.homeownerAuth` string flag to determine login state.
- Uses `HomeownerSignInModal` and `HomeownerSignupModal` components.

---

## Data Model (As‑Is)

### `Post` type
- In `src/types/blog.ts`, `Post` contains:
  - `title`, `excerpt`, `author`, `date`, `readTime`, `category`, `image`
- There is **no** `id`, `slug`, or `body`.

### Seed data
- In `src/data/blogData.ts`, posts are defined as static objects with the fields above.

---

## UX Constraints & Known Technical Couplings (As‑Is)

- **Deep linking is not supported** for posts:
  - Directly visiting `/blog/post` without prior navigation loses context and redirects to `/blog`.
- **Post detail content is not truly per-post**:
  - The body is hard-coded, so different posts do not have unique content beyond title/excerpt/meta.
- Share buttons are present but non-functional.

---

## Conflicts vs Current `Frontend-Plan.md` (Requires Decision)

The current `Frontend-Plan.md` describes:
- `/blog/[slug]` detail route
- Markdown-rendered post body
- Visible search + category dropdown
- Share buttons functional
- Comments hidden or mock in MVP
- `/blog/post` treated as legacy redirect

**But the actual current UI is:**
- `/blog` list + `/blog/post` detail
- `sessionStorage`-based navigation
- No visible search/filter UI
- Hard-coded body
- Comments UI exists and is interactive (client-only)

**Implication**: If we implement the plan as-written, we will be intentionally changing the current UX. That’s fine, but it must be explicitly approved.

---

## Recommendations (Safe, Legacy‑Friendly)

1) Treat current UI as baseline and preserve it in Phase 1:
- Keep `/blog` and `/blog/post` functional.
- Do not remove the comment UI unless explicitly desired.

2) Add “deep link safe” route incrementally:
- Introduce `/blog/[slug]` later, while keeping `/blog/post` as a compatibility route (redirect or adapter).

3) Make the existing intended controls visible:
- Add the missing search input + category dropdown to match the current internal filter state.

---

## Bangla Summary (বাংলা সারাংশ)

### এখন (বর্তমান অবস্থা)
- `/blog` পেজে ব্লগ কার্ডগুলোর গ্রিড দেখা যায় এবং “Load More Articles” কাজ করে।
- কোনো ব্লগ কার্ডে ক্লিক করলে সেটি `sessionStorage`-এ পোস্টের ডাটা রেখে `/blog/post` এ নিয়ে যায়।
- `/blog/post` পেজে পোস্টের হিরো ইমেজ/টাইটেল/ক্যাটেগরি/অথর/ডেট দেখা যায়, কিন্তু মূল লেখার বড় অংশটি হার্ডকোড করা (সব পোস্টে প্রায় একই বডি)।
- Share বাটনগুলো দেখা যায় কিন্তু ক্লিক করলে বাস্তবে শেয়ার/কপি করার কাজ করে না।
- Comments সেকশন আছে; লগইন না থাকলে সাইন-ইন/সাইন-আপ মডাল দেখায় এবং তারপর কমেন্ট পোস্ট হয় (সবই ক্লায়েন্ট-সাইডে)।

### কেন এটা গুরুত্বপূর্ণ
- বর্তমান সিস্টেমে `/blog/post` ডিপ-লিংক (ডাইরেক্ট ওপেন) নিরাপদ না—আগে `/blog` থেকে ক্লিক না করলে পোস্টের ডাটা থাকে না।
- নতুন প্ল্যান যদি `/blog/[slug]` ও Markdown বডি যোগ করে, সেটা বর্তমান UX পরিবর্তন করবে—সেটা করতে হলে আপনার explicit approval দরকার।

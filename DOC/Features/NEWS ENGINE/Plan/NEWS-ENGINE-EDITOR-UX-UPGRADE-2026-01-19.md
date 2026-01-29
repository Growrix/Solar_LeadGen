# News Engine — Editor & UX Upgrade Plan (AI + Manual)

Date: 2026-01-19

## Goal
Make both AI-generated and manual posts feel like a professional article editor:
- No “plain textarea” editing for the article body
- Rich formatting preserved on paste
- Clear fields (Title / Subtitle / Category / Tags)
- Page-wide editing surface + preview
- Consistent UX for AI + Manual creation and for editing

This plan maps directly to the 13 requirements you confirmed.

---

## Current State (Repo Reality)
- Article body editing uses TipTap in Review modal via `RichHtmlEditor`, but the creation experience and preview/readability are not “article-like” enough.
- AI generation modal is prompt-focused (textarea) and uses a hardcoded category dropdown.
- Manual creation modal exists but needs:
  - wider layout
  - more “article” styling + preview
  - taxonomy-aligned categories
  - clearer support for Subtitle

---

## Requirements → Concrete Work Items

### 1) Replace plain textareas for article body
- Ensure all article-body entry points use `RichHtmlEditor` (TipTap) and not a textarea.
- Manual creation: already uses `RichHtmlEditor` → upgrade UX + preview.
- AI creation: keep prompt as textarea (prompt is not article body), but after generation always lands in Review modal where rich editing is available.

### 2) Rich formatting features
Upgrade `RichHtmlEditor`:
- Add underline
- Add image insertion (URL-based) for inline images
- Keep headings, lists, bold/italic, links
- Improve typography styling (`prose` sizing + spacing)

### 3) Subtitle
- Add a dedicated “Subtitle” input in creation/editing flows.
- Implementation approach (no DB migration): store subtitle in `summary` (used across listing + SEO) and keep separate `seoDescription` for meta when needed.

### 4) Page-wide editing
- Widen Create News modal to near full viewport width and height.
- Widen Review modal similarly.

### 5) Categories aligned to site taxonomy
- Replace hardcoded category dropdowns.
- Use blog taxonomy category names as the canonical list (via `/api/admin/blog/categories`) and fall back to existing item categories if empty.
- UX: searchable select or datalist.

### 6) Tags UX
- Keep comma-separated entry but add better “chip” display where appropriate.

### 7) Paste formatted content
- TipTap already supports HTML paste; ensure we don’t strip formatting.
- Provide a live Preview panel so pasted structure looks like the final article.

### 8) Preview mode
- Add a dedicated Preview tab/panel rendering title/subtitle/category/tags + HTML in `prose`.
- Match public page styling as closely as possible.

### 9) SEO + OG image controls
- Continue using Review modal as the primary place for SEO + OG image controls for both AI + Manual.
- Ensure Create News auto-opens Review after actions.

### 10) Validation
- Keep server-side publish validation (content must not be empty/too short).
- Keep required fields: Title is required.

### 11) Consistency across AI + Manual
- Both creation paths land in the same Review modal for final review/edit/publish.

### 12) Accessibility
- Ensure modal controls have labels and work with keyboard.

### 13) Responsive
- Ensure modal layout collapses to single-column on smaller breakpoints.

---

## Implementation Steps (Minimal + Safe)
1. Fix Dashboard buttons so:
   - Create News → opens CreateNewsModal
   - Generate AI Draft → opens ManualDraftModal
2. Install TipTap extensions and upgrade `RichHtmlEditor`:
   - underline, image
   - better typography
3. Upgrade CreateNewsModal:
   - page-wide
   - Subtitle field (stored in `summary`)
   - live Preview panel
   - category suggestions from taxonomy
4. Upgrade ReviewModal:
   - page-wide
   - add Preview tab
   - show Subtitle field (mapped to `summary`) more explicitly
5. Upgrade ManualDraftModal category UX:
   - taxonomy-driven list instead of hardcoded values
6. Verify:
   - `npx tsc --noEmit`
   - `npm run build`

---

## Acceptance Checklist
- Manual: Create News → paste a formatted article → headings/lists/links preserved and preview looks like a real article.
- AI: Generate AI Draft → opens Review → editing feels identical to manual posts.
- Category options match site taxonomy (no hardcoded mismatches).
- Modals are comfortable for long-form editing (page-wide).

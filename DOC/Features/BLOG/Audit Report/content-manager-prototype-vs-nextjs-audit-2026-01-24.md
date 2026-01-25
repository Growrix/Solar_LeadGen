---
description: "Content Manager prototype vs Next.js audit (posts/categories/tags/authors/comments)"
date: "2026-01-24"
---

# Content Manager — Prototype vs Next.js Audit (2026-01-24)

**Prototype SOT**: `DOC/Features/BLOG/GoogleAIStudio UI UX/solarmatch-blog/components/admin/`

**Next.js surface**:
- Route: `/admin/blog/content-manager`
- Primary component: `src/components/admin/blog/content-manager/ContentManagerHub.tsx`

## Gates
- `npx tsc --noEmit`: PASS (2026-01-24)
- `npm run build`: PASS (2026-01-24)
  - Note: build logs include a `prisma:error` about DB connectivity to `localhost:5432` during static generation. This is existing environment/runtime behavior; the build still completed.

## Audit checklist (manual / visual parity)
Run the app and compare side-by-side with the prototype.

### Content Manager hub
- [ ] Header/title/subtitle match
- [ ] Tabs: Posts / Categories / Tags / Comments / Authors match (labels, spacing, active state)
- [ ] Tab switching behavior matches prototype (no layout jump)

### Posts (PostList)
- [ ] Stats ribbon: Total / Published / Scheduled / In Review / Drafts
- [ ] Header/control row: status tabs list-view only; search placement; view mode toggle; Add Post behavior matches
- [ ] View Options dropdown matches (list columns: status/category/author/date; board fields: coverImage/category/author/date/excerpt/tags)
- [ ] Needs Review: badge + list status tab + board lane
- [ ] Issues tooltip: missing cover/excerpt/category; board placeholder alert
- [ ] Pagination footer present and visually aligned
- [ ] Trash behavior: list-only + restore/permanent delete confirmation

### Categories / Tags
- [ ] List UI matches prototype (columns, actions, modals)

### Comments / Authors
- [ ] Tab UI and primary actions match prototype (safe stubs acceptable where backend not wired)

## Findings (from code review)
- No compile/type errors in migrated Content Manager surface.
- Content Manager tabs are URL-synced via `?tab=` to better match prototype navigation.
- Categories/Tags list components now match prototype non-tabbed headers (back button + title/subtitle + add button) and only show the action-row add button in tabbed mode.
- Comments list is aligned to the prototype for the header, filter bar layout, fixed bulk action tray, and table column structure.
- Authors list no longer includes a non-prototype Refresh button.
- Authors list rows now match prototype visuals (avatar rendered as `<img>`, status pill uses dot + Active/Inactive labels, and action icon button padding/hover colors match).
- Build produces some existing warnings in Media Library files and an environment DB-connectivity message from Prisma during page generation; neither is introduced by Content Manager UI work.

## Next actions
- Capture screenshots (prototype vs Next.js) for Posts/Categories/Tags/Comments/Authors.
- If any visual/interaction gaps are found, log them into `DOC/Features/BLOG/tasks.md` under Phase 6 (T091), then fix (T092) and repeat.

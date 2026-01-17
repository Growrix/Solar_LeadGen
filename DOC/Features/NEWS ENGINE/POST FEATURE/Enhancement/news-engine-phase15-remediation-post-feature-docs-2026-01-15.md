# News Engine Phase 15 Post‑Feature Docs Addendum
**Date**: 2026-01-15
**Scope**: Visual + functional remediation for OG images, publish gating, editability, content quality, and model profiles.

---

## 1) What Changed (Operator Summary)
- **OG Images** now save to **S3** (stable URLs), not temporary provider links.
- **Public listing + detail pages** display the real OG image and updated tags.
- **OG meta tags** are now server-rendered for crawlers.
- **Publish toggle** persists immediately; **publish** works when approval is off.
- **Republish** is enabled for already published items (audit logs record it).
- **Full editability**: headline, summary, category, tags, SEO fields, and body.
- **Model Profiles** modal now has a close button, delete, and bulk delete.
- **Title‑copy guard** prevents near‑duplicate RSS titles.
- **Formatting upgrade**: draft prompts now demand headings/lists/emphasis in HTML.

---

## 2) Updated Operator Guidance (Key Flows)

### Review Modal – OG Image Pipeline
**Steps**:
1. Paste an external image URL in **Override image URL**.
2. Click **Save to S3** to ingest and persist the image.
3. Approve OG image if approval is required.
4. Publish (or republish) once approved or approval requirement is off.

**Notes**:
- Save as Draft also ingests the current override URL into S3.
- If the URL is invalid or not an image, ingestion fails with an actionable error.

### Review Modal – Editability (All AI Fields)
- **Headline, Summary, Category, Tags, SEO Title/Description, and Body** are editable.
- Use **Save as Draft** to persist edits.
- **Republish Now** updates the published timestamp and retains your edits.

### Public Pages
- `/news`: listing cards now show the real OG image and current tags.
- `/news/[slug]`: detail page shows the real OG image, updated tags, and server-rendered OG metadata.

### Model Profiles
- **Close** button added to Update/Add modal.
- **Delete** disables a profile (removes it from routing).
- **Bulk Delete** disables multiple profiles at once.

---

## 3) Functionality Map (Phase 15 Delta)

### OG Image Pipeline
- **UI**: Review Modal (SEO & Compliance tab)
- **API**:
  - POST `/api/admin/news-engine/items/[id]/og-image/generate` → S3 ingest
  - POST `/api/admin/news-engine/items/[id]/og-image/ingest` → S3 ingest
  - PUT `/api/admin/news-engine/items/[id]/image-controls` → persist URL + approval requirement
- **DB**: `newsItem.ogImageUrl`, `newsItem.ogImageApprovedAt`
- **Public**:
  - `/api/news` and `/api/news/[slug]` return `ogImageUrl`
  - `/news/[slug]` renders OG meta tags server‑side

---

## 4) Verification Checklist (Phase 15)
- ✅ `npx tsc --noEmit`
- ✅ `npm run build`
- ✅ Playwright Phase 13 + Phase 14 specs
- ✅ `scripts/news-engine-e2e-automation-test.ts`
- ✅ `scripts/news-engine-rss-http-test.ts`
- ✅ `scripts/news-engine-cleanup-test-data.ts` (dry-run)

---

## 5) Known Limitations
- OG ingestion requires **AWS_S3_BUCKET** and credentials to be configured. Without this, ingestion fails.
- Title guard uses near‑duplicate matching; borderline cases may still require manual edits.

---

## 6) Red Alert – RSS Title Copying
**Resolved**:
- Titles are now validated against source titles and auto‑rewritten if too similar.
- Draft prompts explicitly instruct distinct headlines.

**Optional next hardening**:
- Add a second‑pass AI title rewrite for collisions and store both titles in audit metadata.

---

## 7) Operator Tips
- If a public OG image doesn’t appear, confirm the Review modal shows an S3 URL (not a provider URL).
- For republished items, verify the updated publish timestamp and re-check social previews.

---

**End of Phase 15 Addendum**

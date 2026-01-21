# Post-Implementation Docs — News Engine (Phase 14 Expansion Addendum)

**Date**: 2026-01-15  
**Applies to**: Phase 14 Expansion/Enhancement Cycle (V3)  
**Template**: `DOC/PROMPTS/PROMPTS & TEMPLATES/POST FEATURE/feature-post-implementation-doc-template.md`  

This document is an addendum to the Phase 13 post-feature documentation bundle:
- Primary post-feature docs: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-POST-FEATURE-DOCS-2026-01-13.md`
- Full user guide: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-USER-GUIDE.md`

Phase 14 added/changed a small number of high-impact operator surfaces in the Review workflow (rich editing) and backend enforcement (OG image server check + provenance enrichment).

---

## 0. Overall Workflow & Audience

- **Who is this for?**
  - Admin operators reviewing and publishing NewsItems.
  - Developers/operators validating automation and E2E health.

- **What changed in Phase 14?**
  - Review editing now supports rich HTML editing (TipTap) with Preview/Raw HTML.
  - Provenance panel now supports enriched `sources[]` rows (kind/title/timestamp).
  - OG image “Re-check” now calls a real server endpoint and persists the last-check result.

---

## 1. Feature Overview

- **Feature Name:** News Engine (Admin Hub V6)
- **Purpose (Phase 14 delta):** Improve review correctness and traceability by making editing richer, provenance clearer, and OG image health deterministic and persisted.
- **Key Flows (Phase 14 delta):**
  - Operator opens a NEEDS_REVIEW item → edits content with rich editor → saves → validates provenance sources → re-checks OG image server-side → publishes/schedules.
- **Release Date:** 2026-01-15 (Phase 14 addendum)

---

## 2. Key Concepts & System Impact

- **Review Modal & Rich Editing (Phase 14)**
  - What: Review workspace now includes a rich HTML editor for `contentHtml` with toolbar + preview.
  - Why: Operators needed to fix formatting quickly without brittle textarea-only editing.
  - Impact: Saved HTML must rehydrate identically on reopen; preview approximates public rendering.

- **Provenance Enrichment (Phase 14)**
  - What: Provenance endpoint returns a unified `sources[]` list of RSS + research entries.
  - Why: URL-only provenance is insufficient for editorial trust.
  - Impact: Review surfaces can show kind/title/timestamp to improve verification.

- **Server OG Image Health Check (Phase 14)**
  - What: Server checks `ogImageUrl` and persists `lastCheckedAt/status/error`.
  - Why: Client-only checks were unreliable and non-persistent.
  - Impact: Operators can deterministically see the last check result and re-run it.

---

## 3. User Guide (English)

For the full tab-by-tab guide, use: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-USER-GUIDE.md`

### Phase 14: Review workspace changes

1) **Edit content with rich editor**
   - Use the toolbar to apply headings, lists, bold/italic, and links.
   - Use **Preview** to verify rendering.
   - Use **Raw HTML** only if you need to fix edge-case markup.

2) **Format action**
   - Click **Format** to normalize spacing and remove empty blocks.
   - This is operator-triggered only (no surprise auto-mutation).

3) **Verify provenance sources**
   - Review the enriched sources list (kind/title/time/url).
   - Use Copy/Open actions carefully; opening many sources can spawn many tabs.

4) **Re-check OG image**
   - Click **Re-check** to run a server-side availability check.
   - Confirm `Last checked` and `Status` persist after closing/reopening the modal.

---

## 4. User Guide (Bengali / বাংলা)

বিস্তারিত গাইডের জন্য দেখুন: `DOC/FEATURES/NEWS ENGINE/POST FEATURE/NEWS-ENGINE-USER-GUIDE.md`

### ফেজ ১৪: রিভিউ ওয়ার্কস্পেস পরিবর্তন

1) **রিচ এডিটর দিয়ে কনটেন্ট এডিট করুন**
   - টুলবার দিয়ে হেডিং/লিস্ট/বোল্ড/ইটালিক/লিংক ব্যবহার করুন।
   - **Preview** দিয়ে রেন্ডারিং যাচাই করুন।
   - প্রয়োজন হলে **Raw HTML** ব্যবহার করুন (সাবধানতা সহকারে)।

2) **Format অ্যাকশন**
   - **Format** ক্লিক করলে অতিরিক্ত ফাঁকা/স্পেসিং নরমালাইজ হবে।
   - এটি শুধুমাত্র অপারেটর-ট্রিগার্ড (অটো নয়)।

3) **Provenance সোর্স যাচাই**
   - এনরিচড সোর্স লিস্ট (kind/title/time/url) দেখুন।
   - Copy/Open অ্যাকশন সচেতনভাবে ব্যবহার করুন।

4) **OG ইমেজ Re-check**
   - **Re-check** ক্লিক করলে সার্ভার সাইডে OG ইমেজ চেক হবে।
   - মডাল বন্ধ/খুললে `Last checked` এবং `Status` আগের মতো থাকবে।

---

## 5. Tooltip Reference

| UI Element | Tooltip (EN) | Tooltip (BN) |
|---|---|---|
| Review → Content editor → Format | Normalize spacing and remove empty blocks | অতিরিক্ত স্পেসিং/খালি ব্লক সরিয়ে ফরম্যাট ঠিক করুন |
| Review → Content editor → Preview | Toggle preview rendering | প্রিভিউ রেন্ডারিং টগল করুন |
| Review → Content editor → Raw HTML | Advanced raw HTML view | অ্যাডভান্সড Raw HTML ভিউ |
| Review → Image Controls → Re-check | Server-side availability check for OG image URL | OG ইমেজ URL সার্ভার সাইডে চেক করুন |
| Review → Provenance → Copy sources | Copy source URLs/titles for verification | সোর্স URL/টাইটেল কপি করুন |
| Review → Provenance → Open all sources | Open all sources in new tabs | সব সোর্স নতুন ট্যাবে খুলুন |

---

## 6. Functionality Map

| UI Trigger/Action | Connected Backend/API | Data Flow/Result |
|---|---|---|
| OG Image → Re-check | `POST /api/admin/news-engine/items/[id]/og-image/check` | Performs server fetch check; persists last-check fields on `NewsItem`; returns status/error |
| Review → Image Controls load | `GET /api/admin/news-engine/items/[id]/image-controls` | Reads OG URL + approval + last-check fields for display/rehydration |
| Review → Provenance load | `GET /api/admin/news-engine/items/[id]/provenance` | Returns `sources[]` (kind/title/url/timestamp) + stages; UI renders enriched rows |
| Rich editor changes | Admin update item API (existing) | Saves `contentHtml` edits; rehydrates identical HTML on reopen |

---

## 7. E2E Flows & System Health

### What to run to verify Phase 14 end-to-end

- Playwright:
  - `npx playwright test tests/e2e/news-engine-phase13-router-vault-provenance.spec.ts`
  - `npx playwright test tests/e2e/news-engine-phase14-expansion.spec.ts`

- Scripts:
  - `npx tsx scripts/news-engine-e2e-automation-test.ts`
  - `npx tsx scripts/news-engine-cleanup-test-data.ts` (dry-run)
  - `npx tsx scripts/news-engine-rss-http-test.ts` (requires DB + dev server)

### Environment requirements
- Database must be reachable (local docker compose or configured Postgres).
- RSS HTTP test assumes `http://localhost:3001` dev server.

---

## 8. Testing & Verification Checklist

- [x] Playwright Phase 13 spec passes
- [x] Playwright Phase 14 spec passes
- [x] `scripts/news-engine-e2e-automation-test.ts` passes
- [x] `scripts/news-engine-cleanup-test-data.ts` (dry-run) passes
- [x] `scripts/news-engine-rss-http-test.ts` passes
- [x] OG image server check persists and rehydrates
- [x] Provenance renders enriched sources

---

## 9. Known Limitations / Edge Cases

- Rich editor Raw HTML mode can introduce malformed markup if misused; recommended for advanced operators only.
- RSS HTTP test requires the dev server and DB; it is an integration test, not a unit test.

---

## 10. Final Sign-off

- [x] All checklist items above are verified
- [x] Feature is ready for production use (Phase 14 addendum)
- **Sign-off by:** AI-assisted implementation (operator to confirm)
- **Date:** 2026-01-15

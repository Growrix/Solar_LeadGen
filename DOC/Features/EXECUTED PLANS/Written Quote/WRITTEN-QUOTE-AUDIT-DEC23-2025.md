# Written Quote E2E Audit — December 23, 2025

**Date**: December 23, 2025  
**Scope**: Written Quote end-to-end flow (Installer submit → DB write → Homeowner review → Negotiation endpoints)  
**Trigger**: Persistent runtime error: `Missing required fields: leadId, amount` when installer clicks “Send Quote”.

---

## 0) Authority & Standards Followed

Read in required order (per `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`):
- `DOC/GUIDELINES & SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/README.md`
- `DOC/GUIDELINES & SOT/IMPLEMENTATION SOT/AI-IMPLEMENTATION-GUIDELINES.md`

Related feature references consulted:
- `DOC/Features/Written Quote/WRITTEN-QUOTE-E2E-AUDIT.md`
- `DOC/Features/Written Quote/ROOT-CAUSE-AUDIT-DEC22-2025.md`
- `specs/008-description-enhance-existing/tasks.md` (Phase 13W references)

Note: `DOC/Features/Written Quote/FINAL-FIX-PAYLOAD-ISSUE-DEC22.md` was found to be inaccurate and has been marked as NOT RESOLVED.

---

## 1) Current Runtime Symptom

- Installer submits a Written Quote and receives an alert:
  - `Missing required fields: leadId, amount`
- This error is returned by the Written Quote API validation:
  - `src/app/api/written-quotes/route.ts` rejects when `!body.leadId || !body.amount`.

---

## 1.1) GATE-0 Baseline (Repo Health)

Per `AI-IMPLEMENTATION-GUIDELINES.md`, baseline checks were run to avoid “fixed in code, broken in runtime” loops.

- `npx tsc --noEmit`: ✅ Pass (after updating `prisma/seed-test-written-quote.ts` to match current schema)
- `npm run build`: ❌ Fails (non-zero exit) due to prerender/static generation errors:
  - `useSearchParams()` missing Suspense boundary at `/homeowner/dashboard`
  - Multiple “Dynamic server usage” errors when build tries to statically render API routes that use `headers`
- Build also emits many existing ESLint/Tailwind warnings (`react-hooks/exhaustive-deps`, `tailwindcss/no-custom-classname`, etc.).

This audit proceeds with code-path diagnosis, but **implementation work should be staged carefully** because the repo is not currently “zero warnings / zero build errors”.

---

## 2) E2E Flow Map (Actual Code Paths)

### 2.1 Installer → “Submit Quote” → Modal
- Entry page:
  - `src/app/installer/(dashboard)/leads/page.tsx`
- Modal selection is handled in:
  - `src/components/InstallerLeadFeed.tsx`
  - For `lead.type === 'written'`, it renders `WrittenQuoteBuilderModal` with `mode="quote"`.

### 2.2 WrittenQuoteBuilderModal → Submission
- The submit logic is mode-gated:
  - In `src/components/WrittenQuoteBuilderModal.tsx`, the branch that POSTs directly to `/api/written-quotes` is executed only under `mode === 'bid'`.
  - For `mode !== 'bid'` (the current usage for Written Quote leads), the modal calls `onSubmitQuote(leadId, quoteData)` instead.

### 2.3 Installer page handler → API POST
- `src/app/installer/(dashboard)/leads/page.tsx`:
  - Determines endpoint based on lead type: `lead?.type === 'written' ? '/api/written-quotes' : '/api/quotes'`.
  - Sends body: `{ leadId, installerId: installer?.id, ...quoteData }`.

---

## 3) Root Cause (Confirmed)

### RC1 — Written Quote submission is NOT using the intended payload path
- `WrittenQuoteBuilderModal` builds `writtenQuotePayload` with an `amount` field only in the `mode === 'bid'` branch.
- But `InstallerLeadFeed` opens `WrittenQuoteBuilderModal` with `mode="quote"` for written leads.
- Therefore, on Written Quote leads, the modal takes the `else` branch and sends `quoteData` to `onSubmitQuote`, which does not include a computed `amount`.
- This results in `/api/written-quotes` receiving a body that can omit `amount`, triggering the API’s 400 validation.

**Why prior “payload fix” didn’t work**: it modified a branch that is not executed for written leads.

### RC2 — Request body field override risk
- In `src/app/installer/(dashboard)/leads/page.tsx`, request body is constructed as:
  - `{ leadId, installerId, ...quoteData }`
- If `quoteData` contains `leadId` or `amount` keys (including `undefined`), spreading after `leadId` can override required fields.
- Even if not the current primary cause, this is a correctness hazard and can recreate “missing field” errors.

---

## 4) API Contract Reality Check

- `src/app/api/written-quotes/route.ts` expects:
  - `leadId` (truthy)
  - `amount` (number > 0)
- It computes:
  - `gstAmount` and `finalTotal` server-side from `amount` and optional flags.

This contradicts the earlier Dec22 document’s statement that the API expects `amount = finalTotal`.

---

## 5) Homeowner Review Path (Status)

- Homeowner dashboard shows “Review Quotes” when:
  - `lead.quoteType === 'WRITTEN_QUOTE'` and status is APPROVED or PURCHASED.
  - Source: `src/app/homeowner/dashboard/page.tsx`
- The homeowner dashboard API returns recent leads with `quoteType` pulled from Prisma and cast to `'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'`.
  - Source: `src/app/api/homeowner/dashboard/route.ts` → `src/lib/services/lead-service.ts`

This part looks internally consistent, but end-to-end visibility still depends on installer submission actually creating `WrittenQuote` rows.

---

## 6) Fix Plan (Next Implementation Phase — Proposed)

### Fix 6.1 — Make written-lead submission always compute and send `amount`
Options (pick one; simplest recommended):
1) In `WrittenQuoteBuilderModal`, when the lead is a Written Quote lead (or when this modal is used), always submit via `/api/written-quotes` with the computed payload (including `amount`). Do not route it through the generic `onSubmitQuote` path.

### Fix 6.2 — Prevent body field override in installer handler
- Build request body as `{ ...quoteData, leadId, installerId }` so required fields win.

---

## 6.4) Fixes Applied During This Audit (Unverified)

These changes were made to address RC1/RC2; they still require runtime verification:

- `src/components/WrittenQuoteBuilderModal.tsx`
  - Changed submission branch to run when `mode === 'quote'` (matches current usage in `InstallerLeadFeed`).
  - Corrected API payload semantics:
    - `amount` now sends `subtotal` (base amount)
    - `incentiveAmount` now sends total incentives (STC + VIC + discounts)
    - `finalTotal` remains computed locally for display/metadata, while server recomputes authoritative totals.
- `src/app/installer/(dashboard)/leads/page.tsx`
  - Reordered request-body construction to avoid `{ leadId, ...quoteData }` being overwritten by `quoteData` keys.

### Fix 6.3 — Verify with Network + server logs
- Browser Network tab confirms request body contains `leadId` and `amount`.
- Server logs (WrittenQuotesRoute) show `leadId` and `amount` captured at request entry.

---

## 7) Immediate Audit Gate Checklist (Before Claiming “Fixed”)

- Confirm which submit branch executes (mode-gating) with a targeted console log in the modal.
- Confirm payload keys in Network request for POST `/api/written-quotes`.
- Confirm DB insert exists for the lead in `written_quotes`.
- Confirm homeowner GET `/api/written-quotes?leadId=...` returns the new quote.

---

## 8) Open Questions (To Resolve During Fix)

- What should `amount` represent in this app’s business meaning?
  - Server currently treats `amount` as the base number and derives GST + finalTotal.
  - UI currently computes `subtotal`, `gstAmount`, incentives, and `finalTotal`.
  - We must align the UI submission to the API’s meaning (or update API meaning).

---

**Audit Status**: Completed (code-path + contract audit).  
**Implementation Status**: Not started in this report (next step is to implement Fix 6.1/6.2 and validate via Network + DB).

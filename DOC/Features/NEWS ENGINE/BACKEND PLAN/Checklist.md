# News Engine Phase 10 E2E Manual Test Checklist (Step-by-Step)

## 1. Pipeline & Automation Controls
- Go to `/admin/news-engine` in the admin UI.
- At the top, locate the pipeline status badge (should say "Live" or "Paused").
- Click the status badge or the "Master Control" tab.
- In the Master Control tab, set pipeline status to **NOMINAL** (Live/Automatic).
- In the Master Control tab, verify **Run Automation Now** is visible (it should be disabled unless pipeline is NOMINAL).
- Go to the "Settings" tab.
- In the "AI Personalization" or "Automation" section:
  - Find the toggles for **Auto-Draft** and **Auto-Publish**.
  - Enable or disable as needed for your test.
  - Click "Save" if required.

## 2. Sources & Research Controls
- Go to the "Sources" tab.
- In the "Web & Trend Research" section:
  - Toggle **Global Web Search**, **Real-time Social Trends**, and **Academic & Scientific Journals** ON/OFF.
  - Adjust the **Research Priority** sliders for each.
- In the "Research Rules" section (right column):
  - Change **Min Sources per Story** (number input).
  - Add/remove countries in **Geographical Focus** (type and press Enter to add, click × to remove).
  - Edit the **Source Blacklist** (textarea).
  - Toggle **Deduplication** and **Verify Payload** ON/OFF.
- After making changes, refresh the page and confirm all values persist.

## 3. RSS & Research Ingestion
- In the "Sources" tab, click **Add Source** to add a new RSS feed.
- Go to the "Master Control" tab.
- Click **Run Automation Now** and confirm.
- Confirm RSS ingestion + research ingestion happens without requiring Postman/curl/headers.
- Go to the "Audit Logs" tab and confirm you see automation activity logs (runner started/completed and/or any ingest/draft steps).

## 4. AI Draft Generation
- In the "Sources" tab, locate an RSS entry that is not yet processed.
- Click **Generate Draft** (magic wand or similar icon/button) for that entry.
- Confirm a new draft appears in the "Drafts & Reviews" tab/board.
- For research bundle: in the "Sources" tab, use the **Generate Draft from Research** button if available.

## 5. Rejected Queue Behavior
- Go to the "Drafts & Reviews" tab.
- Locate the **Rejected** column.
- Drag or move a draft to the Rejected column, or use the **Reject** action in the Review modal.
- For a rejected item:
  - Click **Regenerate** (should only be enabled for rejected items).
  - Click **Restore to Draft** (should move item back to Draft Ready column).
  - Click **Delete** (should permanently delete only from Rejected; other columns do soft delete).

## 6. Auto-Publish Logic
- With pipeline set to **NOMINAL** and **Auto-Publish** enabled:
  - Go to "Master Control" and click **Run Automation Now**.
  - Confirm new drafts are created and auto-published (appear in Published column).
- With **Auto-Publish** disabled or pipeline not **NOMINAL**:
  - Trigger **Run Automation Now** again; confirm drafts are created but remain in review/draft columns.

## 7. Audit Logs
- Go to the "Audit Logs" tab.
- Confirm that actions (sync, draft, publish, reject, purge, etc.) appear as log entries with correct details.

## 8. UI Labeling
- Go to the "Settings" tab and all modals related to AI.
- Confirm all references to "Gemini" are replaced with "OpenAI".

## 9. Build & Typecheck
- In terminal, run: `npx tsc --noEmit` and `npm run build`.
- Confirm both complete with no errors.

---

**If all steps above work as described, the E2E implementation is complete.**

---


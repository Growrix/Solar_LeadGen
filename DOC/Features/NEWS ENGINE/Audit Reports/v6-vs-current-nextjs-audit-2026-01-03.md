# V6 Prototype vs Current Next.js Implementation (E2E Audit)

Date: 2026-01-03

## Scope
Compare the Google AI Studio V6 prototype UI/UX export to the current SolarMatch Next.js News Engine implementation end-to-end:

- Admin route surface: tabs, header actions, modals, triggers
- Public route surface: listing, details, share modal

**Prototype SOT**
- `DOC/FEATURES/NEWS ENGINE/GoogleAIStudio UI UX/ai-news-engine-admin- V6/*`

**Current Next.js surfaces**
- Admin route: `src/app/admin/news-engine/page.tsx` + `src/components/news-engine/AdminNewsEngineHub.tsx`
- V6 mirrored components: `src/components/news-engine/v6/tabs/*`, `src/components/news-engine/v6/modals/*`, `src/components/news-engine/v6/shared.tsx`
- Public routes: `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`

## Summary (High Level)
- **File boundaries / modularity:** ✅ Mirrored (tabs + modals extracted in separate files).
- **Surface inventory (tabs + modals exist):** ✅ Present.
- **UI/UX fidelity to V6 prototype:** ⚠️ Mixed.
  - Dashboard + Drafts/Reviews look structurally close.
  - Master Control, Automation Logic, Settings, Audit Logs are currently **significantly simplified** vs V6.

## Surface Inventory
### Admin Tabs (V6)
Prototype `App.tsx` defines 7 tabs:
- Dashboard
- Drafts & Reviews
- Audit Logs
- Master Control
- Automation Logic
- Sources
- Settings

### Admin Tabs (Current Next.js)
Mirrored 7 tabs exist under `src/components/news-engine/v6/tabs/*`.

### Modals (V6)
Prototype includes these modal surfaces:
- Review
- Schedule
- Test Preview
- Rewrite
- Reject
- Prompt Details
- Manual Draft
- Confirmation
- Source (Add/Edit)
- Share (public details page)

### Modals (Current Next.js)
- Admin modals exist under `src/components/news-engine/v6/modals/*` (matches all admin modal surfaces).
- Share modal exists on the public news detail route (`src/app/news/[slug]/page.tsx`).

## Findings (Parity / Gaps)
### Routes
- Admin route entry (`/admin/news-engine`): ✅ Present and mounts hub.
- Public listing (`/news`): ✅ Present (published-only).
- Public detail (`/news/[slug]`): ✅ Present (published-only) + share modal.
- Prototype sidebar “Public View” navigation: ⚠️ Not present as a sidebar link in Next.js admin UI (routes exist, but no in-admin nav element).

### Header Actions (Admin)
Prototype header actions:
- “Test & Preview”
- “Create Manual Draft”
- “Pause Automation” / “Resume Automation” (status-dependent)

Current Next.js hub:
- ✅ Same action labels are present and wired to modal/confirmation flows.

### Dashboard Tab
- ✅ KPI cards include “Automations: Active/Paused/Stopped” derived from pipeline status.
- ✅ Filters + table layout appear structurally aligned.
- ⚠️ Minor: KPI numbers are stubbed (expected for UI-only), but check any label/copy mismatches during Part 2.

### Drafts & Reviews Tab
- ✅ Filter board input, “View Options”, avatars, and “Create Manual Draft” exist.
- ✅ Column layout + per-column plus button exist.
- ✅ Clicking draft opens review flow.

### Sources Tab
- ✅ High-level layout matches V6: header (“Sources & Research”), RSS Source Manager table, research toggles, right-side rules panel.
- ✅ Floating save/persist indicator behavior exists.
- ⚠️ Verify remaining lower sections (min sources, countries, blacklist, verify payload, dedup rules) for exact copy/structure vs V6 (the tab is large; re-verify once we begin fix pass).

### Audit Logs Tab
Prototype includes:
- Header info card (“System Audit Trail”)
- Filter bar (search + date range + origin + status)
- Detailed table columns (timestamp, action, source, origin badge, performed by, status badge, details icon)
- Footer info + “Export CSV Log” CTA

Current Next.js tab:
- ⚠️ **Major gap**: Current `AuditLogsTabV6` is a minimal table (time/action/origin/prompt) and omits the V6 filter bar, extra columns, icons/badges, and footer CTA.

### Master Control Tab
Prototype includes:
- Large “Master Automation Control” banner with “System Live/Paused/LOCKED” chip + animated status dot
- Buttons: “Resume All”, “Pause Pipeline”, “Emergency Stop” with disable rules
- “Pipeline Sub-Systems” grid with feature toggles + health statuses
- “Safety Center” side panel + “Operational Alert” callout

Current Next.js tab:
- ⚠️ **Major gap**: Current `MasterControlTabV6` is a single compact card with “Pause/Resume/Emergency Stop” and shows raw `pipelineStatus` (e.g. `NOMINAL`) instead of V6 copy.

### Automation Logic Tab
Prototype includes:
- Floating syncing/saved indicator
- Safety banner
- Multiple RuleCards with sliders, strategy buttons, operational rules editor, etc.

Current Next.js tab:
- ⚠️ **Major gap**: Current `AutomationLogicTabV6` is a minimal 3-toggle panel (Auto Draft/Schedule/Publish) and does not reflect V6 structure.

### Settings Tab
Prototype includes:
- Multi-section settings layout (AI personalization, engine settings, notifications, security/API)
- Floating save indicator + fixed footer controls (Reset + Save Configuration)

Current Next.js tab:
- ⚠️ **Major gap**: Current `SettingsTabV6` is a minimal 3-field grid and does not reflect V6 layout/sections.

## Data / State Shape Notes
- Prototype uses human-readable status strings (e.g., `Draft`, `Published`), while Next.js stubs use uppercase enums (e.g., `PUBLISHED`, `NEEDS_REVIEW`).
- Dashboard and Drafts tab already account for some mapping (e.g., treating `DRAFT` as part of `DRAFT_READY`).
- Master Control currently renders the raw enum value; V6 renders user-facing copy (“System Live/Paused/LOCKED”).

## Recommended Next Fixes (Audit-Driven)
1. Expand `MasterControlTabV6` to match V6 ControlPage structure and button labels.
2. Expand `AutomationLogicTabV6` to match V6 AutomationPage structure (rule cards, sliders, safety banner, feedback indicator).
3. Expand `SettingsTabV6` to match V6 SettingsPage sections + footer controls.
4. Expand `AuditLogsTabV6` to match V6 AuditLogsPage (header info card, filter bar, full table columns/badges, footer).
5. Re-check Sources tab tail sections for 1:1 parity (copy/labels/structure).

## Status
- This audit intentionally focuses on **UI surface parity** (tabs, triggers, modals, labels). Token/class compliance verification is part of Part 2 and is not evaluated here.

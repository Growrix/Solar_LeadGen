# Admin Lead Details Modal Enhancement Audit (UI-Only Phase)

Date: 2025-11-23
Scope: UI consolidation of Admin Lead details functionality into a single unified management modal (NO backend logic changes).

## 1. Current Implementation Inventory

Primary file: `src/app/admin/leads/[id]/page.tsx`
Supporting modal: `src/components/admin/InstallerSelectorModal.tsx`
Other related state/actions (approve/reject/archive/resell/reset timer, pricing, notes) embedded directly in page component.

### 1.1 Existing UI Sections (Right Column Boxes)
- Actions (Approve / Reject buttons; conditional on lead.status)
- Lead Pricing (price input + save button)
- Admin Notes (textarea + save button)
- Purchase Info (shows installer name & purchase status if purchased)
- Lead Lifecycle (resell, extend timer, archive; conditional buttons)
- Archived State Box (unarchive action)
- Assign to Installer (separate modal `InstallerSelectorModal` triggered via state `showAssignModal`)

### 1.2 Existing Modals
- Approve Lead Modal (includes countdown timer enable + expiry days input)
- Reject Lead Modal (reason textarea)
- InstallerSelectorModal (multi-select installers + mode + notes + notify flag)

### 1.3 InstallerSelectorModal Features
- Search across name/email/company/postcode
- Filter: include unverified installers (checkbox)
- Quick Select: all verified installers
- Selection mode: exclusive vs competitive
- Single shared notes field (NOT per-installer)
- No dynamic filtering by homeowner postcode yet
- No per-installer individual note entry
- No post-assignment edit path inside unified view

### 1.4 Data Coupling Observations (UI Only)
- Pricing, Notes, Lifecycle actions rely on state within page; handlers passed inline.
- Approve modal depends on `leadPrice` state (requires price set before approve).
- Assignment flow separated from approval flow; requires two different interactions.
- Purchase Info section passive; no direct action to modify purchase state except Lifecycle (resell).

## 2. Requested Enhancements Summary
1. Consolidated Lead Management Modal: Merge Actions, Lead Pricing, Admin Notes, Lead Lifecycle, and Installer Assignment into a single unified modal.
2. Installer Assignment Section: Show installer company name & postcodes; allow single or multi-select.
3. Installer Profile Preview: Hover/click quick profile (company, verification, recent activity/performance summary).
4. Smart Suggestions: Recommended installer list (postcode match + performance + recent responsiveness) surfaced at top.
5. Advanced Installer Filtering: Postcode match toggle + segmented filter (All / Verified / Unverified) + search.
6. Assignment Conflict Warnings: Visual badges for overloaded, paused, low-response, or holiday-status installers.
7. Bulk Messaging / Notification: One action to send a notification/message to all selected installers about the lead.
8. Visual Assignment Map: Small map panel showing homeowner location/postcode and service area footprints of selected/matched installers.
9. Editable Assignment & Lead Details: Post-assignment UI allows changing price, notes, installers, countdown settings in same modal.
10. Assignment Summary & Confirmation Step: Pre-save review panel listing all pending changes (pricing, expiry, installers, lifecycle actions) for explicit confirmation.
11. Backend Preservation: All existing backend logic remains untouched (UI-only consolidation and enhancements).

## 3. Gap Analysis
| Area | Current State | Requested | Gap | UI-Only Feasible Approach |
|------|---------------|----------|-----|---------------------------|
| Consolidation | Multiple boxes on page | Unified modal | High | Build `AdminLeadManagementModal` wrapper |
| Installer Assignment Visibility | Separate selector modal | Integrated section | High | Embed selector UI as Section B |
| Postcode-Based Matching | Generic search only | Match + toggle | Missing | Client-side filter derived from lead postcode tokens |
| Advanced Filtering (Verified Segments) | Simple include unverified checkbox | Segmented control (All/Verified/Unverified) | Partial | Add `filterMode` state + UI buttons |
| Smart Suggestions | None | Recommended list | Missing | Compute suggestion array on open (client hints) |
| Profile Preview | None | Hover/click mini card | Missing | Add popover/inline expandable preview component |
| Conflict Warnings | None | Badges for load/holiday | Missing | Placeholder UI (static badges until backend support) |
| Bulk Messaging | Single notify checkbox | Bulk message action | Missing | Add textarea + send button (UI only) |
| Visual Map | None | Location + service overlay | Missing | Embed lightweight map container (placeholder) |
| Editable Post-Assignment | Scattered updates | Central edit mode | Partial | Banner + unified form states, sequential handler calls |
| Lifecycle Integration | Separate box | Integrated panel | Missing | Move lifecycle actions into Section D |
| Pricing Integration | Separate box | Approval section | Missing | Place pricing + countdown in Section A |
| Sequenced Confirmation | Independent saves | Summary + confirm step | Missing | Implement Section E summary with explicit confirm button |
| Backend Preservation | Inline handlers | Same | None | Pass original handlers unchanged |

## 4. Constraints & Rules (From Prompt)
- UI Only: NO backend service, schema, API changes.
- Semantic Classes Only: Use existing global semantic class names (no inline styles, no hardcoded colors).
- Preserve Functionality: All existing handlers (approve, reject, save price, save notes, resell, reset timer, archive, assign) must continue to work identically.
- Non-Destructive: No removal of existing logic; only reorganize presentation and compose into new modal.

## 5. Proposed Unified Modal: `AdminLeadManagementModal`
### 5.1 Structural Overview
```
<Modal>
  Header: Lead ID + Status Badge + Close
  Body (Scrollable):
    Section A: Approval & Pricing
      - Price input + Save
      - Countdown enable + days input
      - Approve / Reject actions
    Section B: Installer Assignment
      - Filters: Search, Verified toggle, Postcode match chip
      - Mode selection (exclusive / competitive)
      - Installer list with: checkbox, name, company, postcode(s), verified badge
      - Per-installer notes inline expandable (accordion or reveal textarea)
      - Bulk select actions (Select All Verified, Clear Selection)
    Section C: Admin Notes (Global internal notes for lead)
    Section D: Lifecycle & Maintenance
      - Resell Lead (if purchased)
      - Extend Timer (if expiresAt)
      - Archive / Unarchive
    Section E: Summary & Actions Footer
      - Display: Selected installers count, pricing, expiry settings
      - Primary Action: Save / Update Lead Config
      - Secondary: Cancel / Close
```

### 5.2 State Mapping (UI Only)
- Reuse existing state lifted to parent page OR internally mirror initial values.
- New Additional UI States:
  - `filterMode: 'all' | 'verified' | 'unverified'`
  - `postcodeFilterEnabled: boolean`
  - `showSuggestions: boolean`
  - `suggestedInstallerIds: string[]`
  - `previewInstallerId: string | null` (profile preview focus)
  - `conflictWarnings: Record<string, string[]>` (installerId → array of warning codes)
  - `bulkMessage: string` (for bulk notification send)
  - `showMap: boolean`
  - `pendingChanges: { priceChanged?: boolean; installersChanged?: boolean; notesChanged?: boolean; countdownChanged?: boolean; lifecycleActions?: string[] }`
  - `confirmStep: boolean` (true when viewing summary before final save)

### 5.3 Handler Integration (Props Passing)
Props to pass from page component:
- `onApprove`, `onReject`, `onSavePrice`, `onSaveNotes`, `onResell`, `onResetTimer`, `onArchive`, `onUnarchive`, `onAssign` (existing functions)
- Provide optional callbacks for future edit persistence (currently just call original handlers in correct order).

### 5.4 Semantic Class Strategy
- Modal container: `bg-surface shadow-neu-outset rounded-lg`
- Inputs: existing `form-input` semantic class
- Section wrappers: `p-6 rounded-lg bg-surface shadow-neu-outset space-y-4`
- Badges: use existing success/error/info tokens
- Buttons: reuse `<Button variant="secondary" ...>` with semantic color classes when necessary.

### 5.5 Installer Filtering Logic (UI Only)
- Postcode match: If lead has `lead.postcode` OR address containing postcode tokens, filter installers whose `installer.postcode` includes any token. Provide toggle to switch between “Matched” / “All”. (No backend query modifications — purely client-side filtering.)

### 5.6 Smart Suggestions & Profile Preview UI
- Suggestions: Show a "Recommended" chip group at top (populated from simple heuristics: postcode match + verified status). Purely visual ranking (no backend change).
- Profile Preview: Hover/click on installer row reveals expandable preview (company name, verification badge, service postcode list, placeholder metrics).

### 5.7 Conflict Warnings & Bulk Messaging
- Conflict warnings: Display badges (e.g., `Paused`, `High Load`, `Slow Response`) sourced from placeholder heuristic (until backend integration).
- Bulk messaging: Textarea + "Send to Selected" button (UI only; can reuse existing notification mechanism if available, otherwise stub handler).

### 5.8 Visual Assignment Map
- Embed map area (semantic container) showing homeowner postcode marker and shaded areas for selected installers (placeholder shapes; no geospatial backend required this phase).

### 5.9 Assignment Summary & Confirmation
- After edits, user clicks "Review & Confirm" → show summary panel (pricing delta, installer additions/removals, lifecycle changes, expiry settings) with explicit final confirm button.

### 5.10 Editable Post-Assignment State
- If lead already managed, banner indicates EDIT MODE and all sections are live-editable. Footer orchestrates calling handlers for only changed segments.

*(Merged into 5.10 above)*

### 5.8 Accessibility & UX Considerations
- Keyboard focus trap inside modal
- ARIA labels for sections
- Distinct heading hierarchy (h2 for major sections)
- Scrollable body, static action footer

## 6. Risks & Mitigations (UI-Only)
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Duplicated logic across page & new modal | Divergence | Centralize state initialization; pass handlers only |
| Modal complexity reduces performance | Longer initial render | Lazy mount modal; only load when opened |
| Non-persistent suggestions | Users expect dynamic accuracy | Label as "Heuristic suggestions" + tooltip |
| Profile preview data limited | Perceived incompleteness | Placeholder fields + link to full profile page |
| Conflict warnings static | Misinterpretation risk | Tooltip clarifying indicative only (UI phase) |
| Map increases complexity | Performance / layout shift | Lazy load map container only when toggled |
| Bulk message stub | Expectation of delivery guarantee | Show disclaimer if backend not wired |
| Confirmation step bypass desire | Extra click friction | Provide fast path "Quick Save" alongside "Review & Confirm" |
| Filter mismatch (postcode parsing) | Incorrect installer list | Simple exact substring match; document limitation |
| Approval + assignment ordering confusion | Wrong sequence | Footer action orchestrates calling handlers in validated order |

## 7. Implementation Plan (Phased UI Tasks)
Phase 24 (to add in `tasks.md`): Admin Lead Details Modal Enhancement
1. 24.1 Component Discovery & Inventory (COMPLETE via audit)
2. 24.2 Wireframe & Section Mapping Document (COMPLETE in audit)
3. 24.3 Scaffold `AdminLeadManagementModal.tsx` (semantic layout, focus trap)
4. 24.4 Migrate Actions + Pricing + Countdown (Section A)
5. 24.5 Migrate Installer Assignment base list + selection (Section B)
6. 24.6 Add Advanced Filtering (postcode toggle + segmented filter + search)
7. 24.7 Implement Smart Suggestions panel (Recommended installers)
8. 24.8 Integrate Profile Preview (popover/expand rows)
9. 24.9 Add Conflict Warning badges (placeholder heuristic)
10. 24.10 Add Bulk Messaging UI (textarea + send stub)
11. 24.11 Embed Visual Assignment Map (lazy-loaded container + placeholder markers)
12. 24.12 Integrate Lifecycle actions (Section D) + Archive/Unarchive logic unchanged
13. 24.13 Add Editable Post-Assignment banner + change tracking state
14. 24.14 Implement Assignment Summary & Confirmation step (Section E)
15. 24.15 Replace page right-column boxes with single "Manage Lead" button
16. 24.16 Multi-theme visual test (Dark/Light/Purple)
17. 24.17 Responsive test (320, 375, 768, 1024, 1440)
18. 24.18 Accessibility sweep (focus order, aria labels, keyboard navigation)
19. 24.19 Run 6 verification commands (expect 0/0/0/0/0/0)
20. 24.20 TypeScript & build validation
21. 24.21 User review & refinement
22. 24.22 Atomic commit (UI-only, references audit)

## 8. Success Criteria (UI-Only)
- Single modal displays all lead management capabilities without page scrolling.
- Existing backend calls remain untouched; no errors introduced.
- No hardcoded colors, inline styles, or typography classes outside semantic system.
- Installer filtering & selection UX present (postcode toggle, verified segmented filter, search).
- Smart suggestions visible and distinct from main list.
- Profile preview accessible without navigation.
- Conflict warning badges rendered where applicable.
- Bulk messaging UI present (with disclaimer if stub).
- Visual map loads on demand (no layout shift issues).
- Summary & confirmation step clearly lists pending changes.
- All themes render properly (visual parity with migrated sections).
- Accessibility basics satisfied (focus trap, headings, labels).

## 9. Out-of-Scope (Explicitly Deferred)
- Real performance-based ranking (suggestions heuristic only this phase).
- True geospatial service area rendering (placeholder map only).
- Dynamic backend conflict analytics (UI warning badges are static heuristics).
- Bulk messaging delivery guarantees (stub if backend absent).

## 10. Next Steps
- Add Phase 24 tasks to `specs/006-component-by-component/tasks.md`.
- Await user confirmation before starting UI extraction/migration.

---
Prepared UI Audit & Plan — Ready for Phase 24 task insertion.

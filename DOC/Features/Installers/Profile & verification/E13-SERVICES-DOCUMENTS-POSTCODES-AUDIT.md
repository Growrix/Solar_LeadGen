# E13 Audit: Services & Coverage Editing, Postcodes Comma Input, Documents & Logo Updatability
Date: 2025-11-20
Status: In Progress (Pre-fix)

## 1. Scope
User-reported issues on installer profile page:
1. Services & Coverage section not editable / selections not preserved.
2. Postcodes Served field does not allow comma-separated multi-entry during profile editing.
3. Documents & Logo section not editable (cannot upload or replace existing files post-verification).
4. Repeated pain-point: Fixes requested previously but not fully effective.

## 2. Current Implementation Snapshot
### 2.1 Profile Page (`src/app/installer/(dashboard)/profile/page.tsx`)
Relevant excerpt (lines 880–1040 captured):
- Services Offered: Uses hardcoded list [`Installation`, `Maintenance`, `Inspection`, `Repair`, `Consultation`].
  - State binding: `checked={editableVerification?.services?.includes(service)}`
  - On change: builds `updated` array and sets `setEditableVerification(prev => ({ ...prev!, services: updated }))`
- Service Areas: Hardcoded list [`Sydney`, `Melbourne`, `Brisbane`, `Perth`, `Adelaide`, `Regional NSW`, `Regional VIC`, `Regional QLD`].
- Postcodes Served: Single `<input type="text" value={postcodes.join(', ')}` with `onChange` splitting by comma → correctly parses user input.
- Documents & Logo: Presentational dashed drop zones; no `<input type="file">`, no onClick handler, no state wiring, no upload logic.
- Editing gating: Controlled by `isEditingProfile` boolean.

### 2.2 Validation Schema (`src/lib/validation/installer.ts`)
- `installerVerificationSubmitSchema.services` and `installerProfileUpdateSchema.services` use **enum** list: `['Residential Solar','Commercial Solar','Battery Storage','EV Chargers','Solar Maintenance','System Upgrades']`.
- Current profile UI uses different service strings (`Installation`, `Maintenance`, `Inspection`, `Repair`, `Consultation`) → MISMATCH causes validation failure when sending profile PUT.
- Service Areas enum list includes more cities than profile UI (UI includes "Regional NSW", "Regional VIC", "Regional QLD" which are NOT in enum; validation expects e.g. `Gold Coast`, `Canberra`, etc.) → Another mismatch causing 400 validation errors.
- Documents keys: `licenseDocKey`, `abnDocKey`, `logoKey` are supported in submit schema but only `logoKey` appears in profile update schema; `licenseDocKey` and `abnDocKey` are **missing** from `installerProfileUpdateSchema` and cannot be updated via PUT.

### 2.3 Profile Update API (`src/app/api/installer/profile/route.ts`)
- Receives validated payload via `installerProfileUpdateSchema.parse(body)` — therefore cannot process `licenseDocKey`/`abnDocKey` until schema expanded.
- Updates verification record with fields it sees (services, serviceAreas, postcodes, website, socialLinks, companyDescription, logoKey, phone, company details).
- Missing update handling for `licenseDocKey`, `abnDocKey`.
- Creates InstallerProfile if absent (fixed earlier in E8).

### 2.4 Root Causes per Issue
| Issue | Root Cause | Evidence |
|-------|------------|----------|
| Services not editable (reported) | Values in DB use enum list; UI uses unrelated labels so previously selected options never match `.includes(service)` | Mismatch between UI strings and schema enums (e.g. `Residential Solar` vs `Installation`) |
| Service areas losing selection | UI hardcoded area list differs from enum; selections stored with enum values not represented in UI or vice versa | Enum list vs UI list divergence |
| Postcodes comma input failing | UI input parses fine; user likely sees failure due to validation mismatch earlier aborting save (services/serviceAreas errors). Thus postcodes never persisted. | API logs show validation errors in services/serviceAreas arrays (# earlier logs) |
| Documents not updatable | No file input elements or handlers; missing schema fields for licenseDocKey/abnDocKey in profile update | Code excerpt lines 983–1029 show static display only |
| Repeated pain point | Partial earlier fixes addressed creation & button visibility but not enumerations or upload capabilities | History of commits E8-E10 without UI normalization |

## 3. Gaps & Impact
1. **Enum Mismatch (Services & Areas)** → Any profile update with these UI-provided values fails validation (400) blocking all other field persistence, giving impression that postcodes and other edits do not work.
2. **Document Editing** → Users cannot replace/update license, ABN, or logo after initial submission; reduces trust and compliance capability.
3. **Schema Coverage** → Missing `licenseDocKey`, `abnDocKey` in `installerProfileUpdateSchema` prevents backend updates even if UI added.
4. **User Experience** → Failure responses generic "Validation failed"; no per-field error surfacing.
5. **Data Integrity** → Divergent vocabularies (services, areas) risk inconsistent analytics and admin review confusion.

## 4. Proposed Fixes (Phase E13)
| Task | Action | Detail |
|------|--------|--------|
| Normalize services | Replace UI service labels with enum labels | Use existing 6 enum values exactly; show chips when view-only |
| Normalize service areas | Use enum area list from schema | Provide scrollable multi-column layout; maintain previous selections on edit toggle |
| Preserve selections | Initialize `editableVerification` from `verification` for enumerations | Ensure edit mode pre-populates arrays |
| Improve postcodes input | Keep current comma-split logic; add regex filtering to 4-digit; show inline chips preview in edit mode | Chips enable quick removal; validation aligned |
| Add documents editing | Introduce file inputs + onChange uploading via presign endpoint (if exists) or stub; set `licenseDocKey`, `abnDocKey`, `logoKey` in state | Use semantic classes; no inline styles |
| Extend schema | Add `licenseDocKey`, `abnDocKey` to `installerProfileUpdateSchema` | Maintain optional nullable |
| Extend API route | Accept and propagate new document keys into verification updateData | Log updates for audit |
| Surface validation errors | Capture 400 response issues; map by path; display inline below sections | Improves user clarity |
| Accessibility | Add `aria-describedby` & focus ring semantics to checkboxes & file inputs | WCAG alignment |

## 5. Non-Goals
- No change to backend storage strategy beyond adding missing fields (no migrations required; fields already exist in verification model).
- No redesign of presign/upload process; if presign endpoint absent, placeholder handler marks TODO.
- No modification of business logic for verification approval flow.

## 6. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Breaking existing installer data if services stored with old labels | Map legacy labels to new enum during first edit (fallback mapping table) |
| Large payload due to document binary attempt | Ensure uploads use presigned URL; only keys sent in profile PUT |
| User confusion after normalization | Add helper text listing accepted services & areas |
| Validation failure persists | Test with minimal update (only services change) first; log server response |

## 7. Mapping Legacy → Enum (Services)
| Legacy | Enum Target |
|--------|-------------|
| Installation | Residential Solar (if residential context) OR Commercial Solar (prompt user) |
| Maintenance | Solar Maintenance |
| Inspection | System Upgrades (closest operational bucket) |
| Repair | Battery Storage (if repair context battery) ELSE Solar Maintenance |
| Consultation | EV Chargers (fallback) |

(Will implement simple matching heuristic; if ambiguity, default skip and show user notice.)

## 8. Implementation Sequence (E13)
1. Update validation schema (add document keys).
2. Update profile page arrays (services/serviceAreas) to use enum lists; include legacy mapping on load.
3. Add chips preview & removal for postcodes; keep comma entry.
4. Add document upload UI (file inputs + handlers; stub presign if not present) & integrate state.
5. Extend profile PUT route to propagate `licenseDocKey`, `abnDocKey`.
6. Add inline validation error display per section.
7. Manual test matrix & tsc/build check.

## 9. Acceptance Criteria
- Edit mode shows existing enum-aligned selections pre-checked.
- Saving services/serviceAreas passes validation (no 400 invalid_value errors).
- Postcodes allow comma-separated entry, display chips, persist to backend.
- Upload areas permit selecting files; after upload stub sets key and shows "✓ Uploaded".
- Document keys persist (verified via subsequent GET profile call).
- No new TypeScript errors from changes.
- Semantic class verification (0 hardcoded color/style violations).

## 10. Next Actions
Proceed to create Phase E13 section in `tasks.md` and implement schema + UI + API updates.

---
Audit Author: GitHub Copilot
Date: 2025-11-20

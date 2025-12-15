# Installer Profile & Verification UI Field Parity Audit

Date: 2025-11-19
Scope: Parity across Installer Profile page, Installer Verification Modal, and Admin Installer Verification view

Sources Reviewed
- Profile Page: `src/app/installer/(dashboard)/profile/page.tsx`
- Verification Modal: `src/components/installer/VerificationModal.tsx`
- Admin Installer View: `src/app/admin/installers/[id]/page.tsx`

Summary
- Fixed: The "Company Details" Edit toggle was hidden behind `user.installerVerified`. It now always shows, enabling edit mode across Company Details, Social Media, Services & Coverage on the Profile page via a shared `isEditingVerification` flag.
- Save/Cancel: The Save/Cancel actions for verification edits are currently located in the Company Details card and apply to all verification sections using the same state. (Phase B5 will wire APIs.)
- Parity: Several field name and visibility mismatches exist between the three views (detailed below).

Field Parity Matrix (by Section)

Company & Representative
- companyName
  - Profile: Present (editable under verification edit mode)
  - Verification Modal: Present (required)
  - Admin View: Present
- representativeName
  - Profile: NOT displayed/edited
  - Verification Modal: Present (required)
  - Admin View: Present
- designation
  - Profile: NOT displayed/edited
  - Verification Modal: Present (required)
  - Admin View: Present
- email (contact for verification)
  - Profile: Shows user email in header; not within verification section
  - Verification Modal: Present (required)
  - Admin View: Present (Application Details)
- phone (contact for verification)
  - Profile: Shows user phone in Personal Details; not within verification section
  - Verification Modal: Present (required; E.164 +61 formatting)
  - Admin View: Shown in Installer Information (header), NOT in Application Details

Business Legal
- abnOrLicense
  - Profile: Present (editable)
  - Verification Modal: Present (required)
  - Admin View: Present
- establishedYear
  - Profile: Present (editable)
  - Verification Modal: Present (required)
  - Admin View: Present
- employeeCount
  - Profile: Present (editable)
  - Verification Modal: Present (required)
  - Admin View: Present
- licenseDocKey / abnDocKey
  - Profile: Upload placeholders (visible), state not wired
  - Verification Modal: Optional upload placeholders
  - Admin View: Shows disabled buttons if present; download pending API

Services & Coverage
- services[]
  - Profile: Present (editable via checkboxes)
  - Verification Modal: Present (required)
  - Admin View: Present (badges)
- serviceAreas[]
  - Profile: Present (editable via checkboxes)
  - Verification Modal: Present (required)
  - Admin View: Present (badges)
- postcodes[]
  - Profile: Present (editable comma list)
  - Verification Modal: Present (required)
  - Admin View: Present (comma list)

Additional Information
- website
  - Profile: Present (editable)
  - Verification Modal: Optional
  - Admin View: Present
- social links
  - Profile: facebook, instagram, linkedin, youtube (editable)
  - Verification Modal: socialLinks: { facebook, instagram, linkedin, youtube }
  - Admin View: facebookHandle, instagramHandle only (NO linkedin/youtube)
- companyDescription / description
  - Profile: companyDescription (editable)
  - Verification Modal: companyDescription (optional)
  - Admin View: description (naming mismatch)
- logoKey (Company Logo)
  - Profile: Upload placeholder visible
  - Verification Modal: Optional upload placeholder
  - Admin View: NOT displayed

Operational / Meta
- operationalStatus
  - Profile: Present (ACTIVE/PAUSED toggle)
  - Verification Modal: N/A
  - Admin View: N/A
- submittedAt
  - Profile: N/A
  - Verification Modal: N/A (implicit on submit)
  - Admin View: Present (Application Details header)
- adminNotes
  - Profile: N/A
  - Verification Modal: N/A
  - Admin View: Present (editable placeholder; API pending)

Key Mismatches & Gaps
1) Representative fields missing on Profile:
   - Profile lacks `representativeName` and `designation` inputs; both exist in modal and admin view.
2) Social field naming/coverage mismatch with Admin:
   - Profile/Modal use full URLs (socialLinks.facebook/instagram/linkedin/youtube)
   - Admin view expects handles: `facebookHandle`, `instagramHandle`; no LinkedIn/YouTube shown.
3) Description naming mismatch:
   - Profile/Modal: `companyDescription`
   - Admin: `description`
4) Phone placement inconsistency:
   - Modal treats phone as part of the application; Admin shows phone in installer snapshot, not under Application Details.
5) Logo visibility in Admin:
   - Logo (`logoKey`) not displayed in Admin; exists in Profile/Modal.
6) Save UX concentration:
   - Verification Save/Cancel buttons only in Company Details card though edits span multiple sections; consider a global toolbar for clarity.

Recommendations
- Unify field model across all three views (DTO contract):
  - Adopt a consistent schema: `companyName`, `representativeName`, `designation`, `email`, `phone`, `abnOrLicense`, `establishedYear`, `employeeCount`, `services[]`, `serviceAreas[]`, `postcodes[]`, `website`, `socialLinks.{facebook, instagram, linkedin, youtube}`, `companyDescription`, `licenseDocKey`, `abnDocKey`, `logoKey`.
  - For Admin, replace `facebookHandle`/`instagramHandle` with URLs or derive handles for display from URLs; add LinkedIn/YouTube display.
  - Rename Admin `description` to `companyDescription` (or update mapping layer).
- Profile Page Enhancements (UI-only for now):
  - Add Representative section under Company Details with `representativeName` and `designation` fields to maintain parity.
  - Add a global verification edit toolbar (Edit/Save/Cancel) that stays visible while editing any of the verification sections.
  - Consider surfacing `phone` and `email` within Company & Representative for clarity (read-only if sourced from account profile).
- Admin View Enhancements:
  - Display LinkedIn/YouTube (if provided).
  - Display Logo preview if `logoKey` exists.
  - Show verification phone under Application Details or clearly denote snapshot vs application fields.
- API/Backend Contract (Phase B5):
  - Define a single verification DTO used by all three views.
  - Add mappers for legacy naming (e.g., `description` → `companyDescription`) until components are aligned.

Validation Notes
- Post-fix, `isEditingVerification` now toggles inputs for Company Details, Social Media, Services & Coverage.
- Save handler `handleSaveVerificationEdits` centralizes persistence (logs + closes edit mode; API pending).
- Semantic tokens verified: no hardcoded color/typography/responsive class violations.

Changelog
- 2025-11-19: Enabled universal edit toggle for verification sections in profile; produced parity audit.
- 2025-11-19: Implemented Phase F9 field parity tasks:
  - F9.1: Added representativeName and designation to Profile
  - F9.2: Added read-only email/phone display in Profile Company Details
  - F9.3: Replaced facebookHandle/instagramHandle with socialLinks object; added LinkedIn/YouTube to Admin
  - F9.4: Added logo preview section to Admin view
  - F9.5: Renamed description → companyDescription in Admin
  - F9.6: Added phone to Admin Application Details (Company & Representative)
  - All semantic checks passed (0/0/0/0/0/0) across all modified files

## Updated Field Parity Status (Post-Implementation)

### Resolved Gaps
✅ Representative fields in Profile: representativeName, designation now editable
✅ Representative contact in Profile: email, phone displayed (read-only from account)
✅ Social links standardized: All three views use socialLinks.{facebook, instagram, linkedin, youtube}
✅ Admin LinkedIn/YouTube: Now displayed with clickable links
✅ Admin description naming: Renamed to companyDescription
✅ Admin logo: Logo preview section added with placeholder
✅ Admin phone placement: Now in both Installer Information and Application Details

### Remaining Considerations (Phase B5)
- File upload functionality (license, ABN, logo) requires S3 presigned URLs and backend integration
- Image preview for logo requires S3 signed GET URL
- Save handlers currently log to console; need API endpoints
- Operational status toggle needs backend persistence
- Password change needs auth provider integration

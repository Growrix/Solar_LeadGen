# Feature Specification: Homeowners My Profile Feature

**Feature Branch**: `001-homeowners-my-profile`  
**Created**: 2025-10-13  
**Status**: Draft  
**Input**: User description: "There is an existing modal in the homeonwers Dashboard in My Profile page. You have to modify/ rebuild the modal according to the Database inputs that homeowners do while signup. the users information should show in my profile modal and make sure that users can edit, update and save the data. users should be able to upload the profile picture and save/remove.  In the admin dashbaord The admin should be able to see all the data of the new homeowners as per data inputs, also can filter them as per needed, also have a search option in that modal. The admins should see Homeowners analytics too. Such as user counts by postcode,location,(Build analytics based on avaialable data)  Your input You can brainstorm more idea to enhace this feature and follow the industry standard for the profile management."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Homeowner manages profile in modal (Priority: P1)

Homeowner can open the My Profile modal from their dashboard, view their existing information collected at sign-up (name, email, and any optional details such as phone, address, and postcode), edit fields, upload or remove a profile picture, and save changes.

**Why this priority**: Enables users to self-manage account data, reduces support burden, and is foundational for personalization and communications.

**Independent Test**: Can be fully tested by logging in as a homeowner, opening the profile modal, editing fields, uploading/removing an image, saving, and re-opening to verify persistence.

**Acceptance Scenarios**:

1. **Given** a logged-in homeowner with existing profile data, **When** they open the My Profile modal, **Then** the modal displays current values for all available fields and the current profile picture (or a placeholder if none).
2. **Given** the modal is open, **When** the user edits valid fields and clicks Save, **Then** the system validates inputs, persists changes, closes (or confirms), and subsequent opens of the modal show updated values.
3. **Given** the modal is open, **When** the user uploads a valid image file (supported types, within size limits), **Then** the preview updates and upon Save the new image becomes the active profile picture.
4. **Given** the modal is open with a current profile picture, **When** the user chooses Remove Photo and confirms, **Then** the profile reverts to a placeholder avatar upon Save.
5. **Given** invalid input (e.g., malformed email, too-long name), **When** the user clicks Save, **Then** the system highlights the fields, shows helpful messages, and does not persist until corrected.

---

### User Story 2 - Admin views, searches, and filters homeowners (Priority: P2)

An admin can open the Homeowners data view, see a list of homeowners with core profile fields, search by name/email/phone/postcode, and filter by attributes (e.g., postcode, date created, active status), to find specific users quickly.

**Why this priority**: Enables operations, support, and data quality management; essential for administration workflows.

**Independent Test**: Can be tested by seeding multiple homeowners, opening the admin view, running searches and applying filters, and confirming the result set updates correctly without changing any homeowner data.

**Acceptance Scenarios**:

1. **Given** multiple homeowners exist, **When** the admin opens the homeowners view, **Then** a tabular list shows key fields (name, email, phone, postcode, created date, status) with pagination.
2. **Given** the list is visible, **When** the admin types a term into search (e.g., part of name or email), **Then** the results narrow to matching records.
3. **Given** filters are available (e.g., postcode, date range, active status), **When** the admin applies one or more filters, **Then** only matching homeowners are shown and filter chips/state are visible.
4. **Given** search and filters are applied, **When** the admin clears them, **Then** the list returns to the unfiltered state.

---

### User Story 3 - Admin views homeowners analytics (Priority: P3)

An admin can view simple analytics summarizing homeowners by postcode and by broader location grouping (e.g., city/region if available), including counts and percentages over the current dataset, with the ability to adjust the time window to “All time” or “Last 30/90 days”.

**Why this priority**: Provides visibility into geographic distribution and growth patterns; informs marketing and operations.

**Independent Test**: Can be tested by preparing sample homeowners with various postcodes/locations, opening the analytics panel, and verifying counts and percentages match the dataset.

**Acceptance Scenarios**:

1. **Given** homeowners exist with postcode values, **When** the admin opens analytics, **Then** a chart/table shows counts by postcode and their percentage of total.
2. **Given** a time window control, **When** the admin selects a window (All time / Last 30 / Last 90 days), **Then** the analytics recalculate and display updated counts.
3. **Given** a dataset where location (city/region) is available for some records, **When** viewing analytics by location, **Then** the system groups by available fields and excludes or groups unknown values as “Unspecified”.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Empty profiles: New homeowners with minimal signup data should see placeholders for missing optional fields (phone/address/postcode).
- Invalid image upload: Non-supported format or oversized files should be rejected with a clear message; existing photo remains unchanged.
- Concurrent edits: If data changes between open and save, show a gentle conflict message and allow user to refresh modal to latest data.
- Partial connectivity: If save fails due to network issues, keep the modal open with unsaved changes and provide a retry option.
- Search/filter no results: Show a friendly “No results” state with an option to clear filters.
- Large datasets: Ensure pagination is available; avoid freezing the UI; retain search/filter state across pages.
- Restricted fields: Email may be non-editable; if email changes are allowed, require confirmation flow to prevent account lockout.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST display homeowner profile data in the My Profile modal, pre-filled with fields captured at signup (at minimum: name, email; optionally phone, address, postcode if available).
- **FR-002**: The system MUST allow homeowners to edit permitted fields and save changes; fields not editable (e.g., email) MUST be clearly indicated.
- **FR-003**: The system MUST validate inputs with clear, user-friendly messages (e.g., email format, name length limits, phone format).
- **FR-004**: The system MUST allow homeowners to upload a profile picture (supported common image formats; size limit enforced) and preview it before saving.
- **FR-005**: The system MUST allow homeowners to remove their profile picture and revert to a default avatar.
- **FR-006**: The system MUST persist successful profile changes and reflect them immediately upon re-opening the modal.
- **FR-007**: The system MUST handle save failures gracefully, preserving unsaved changes in the modal and offering retry or cancel.
- **FR-008**: The system MUST present an admin view listing all homeowners with key fields (name, email, phone, postcode, created date, active status) and support pagination.
- **FR-009**: The system MUST provide search across key fields (name, email, phone, postcode) that narrows results as entered or upon submit.
- **FR-010**: The system MUST provide filters (e.g., postcode, date range, active status) that can be combined, with clear indicators and an easy way to clear all.
- **FR-011**: The system MUST provide homeowners analytics including counts by postcode, and where possible by broader location (city/region), with selectable time windows (All time / Last 30 / Last 90 days).
- **FR-012**: The system MUST ensure only authorized users can access or modify data: homeowners may edit only their own profile; admins may view all homeowners and analytics.
- **FR-013**: The system MUST record change timestamps for profile updates and display last updated time in the profile modal.
- **FR-014**: The system SHOULD preserve accessibility standards (keyboard navigation, focus management, descriptive labels, error messaging associated to inputs).
- **FR-015**: The system SHOULD maintain the user’s search/filter state during pagination and when navigating back to the list within the admin view.

### Key Entities *(include if feature involves data)*

- **Homeowner Profile**: Represents a homeowner’s account attributes (id, name, email, optional phone, address, postcode, profile photo URL, created date, updated date, active status).
- **Admin Homeowner List**: A collection view of homeowner profiles with sortable columns and search/filter parameters (query, filters, pagination info).
- **Analytics Summary**: Aggregated counts of homeowners by postcode and by available broader location fields (city/region), with a chosen time window context and totals/percentages.
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of homeowners can open the My Profile modal and successfully save an edit within 2 minutes on a typical connection.
- **SC-002**: Profile modal opens and renders existing data within 2 seconds for 95th percentile of users on a typical connection.
- **SC-003**: Image upload or removal completes and updates the visible avatar within 3 seconds for 95th percentile of cases using a typical image size.
- **SC-004**: Admin search/filter returns results and updates the list within 1 second for datasets up to 5,000 homeowners.
- **SC-005**: Analytics view displays accurate counts by postcode and location (where available) with totals matching the filtered dataset 100% of the time.

---

### Assumptions

- The homeowner profile includes, at minimum, name and email; additional fields (phone, address, postcode) may exist based on prior data collection and are treated as optional when not present.
- Email changes are restricted by default to avoid account lockout; if allowed later, they will include a verification flow out of scope for this feature.
- “Location” refers to any broader geographic grouping available in stored data (e.g., city/region derived from address or postcode); if unavailable, analytics will focus on postcode only.
- Analytics time windows are limited to All time / Last 30 / Last 90 days for initial scope.
- Accessibility and responsiveness are part of quality standards for all modals and list views.

# Feature Specification: Lead Journey & Life Cycle


**Feature Branch**: `002-lead-journey-life`  
**Created**: 2025-10-14  
**Status**: Draft  
**Input**: User description: "Lead Journey & Life Cycle - Full journey of a lead from homeowner submission through installer purchase to deal closure, including status tracking, role-based visibility, and audit trail"


## Implementation Context


**Existing UI Components (Already Built)**:
- ✅ `InstantQuoteForm.tsx` - Complete instant quote calculator with all inputs and results display
- ✅ `QuoteOptionsModal.tsx` - Modal displaying "Call/Visit Quote" and "Written Quote" options
- ✅ `HomeownerSignupModal.tsx` - Signup modal with context-aware messaging ("Almost there!" for quote flow)
- ✅ `QuoteSuccessModal.tsx` - Success confirmation after quote submission


**Current Flow (Production)**:
1. User completes instant quote calculator → Clicks "Get Real Quotes from Installers"
2. `QuoteOptionsModal` opens → User selects "Call/Visit Quote" OR "Written Quote"
3. System checks authentication status:
   - **If NOT logged in**: Opens `HomeownerSignupModal` (context="quote") → User creates account → Auto-login → Submit quote request → Success modal
   - **If ALREADY logged in**: Skips signup modal → Submit quote request immediately → Success modal
4. Lead created with all instant quote data preserved


**This Spec Focus**: Backend API implementation, database models, admin approval workflow, installer marketplace, chat system, quote management, and full lifecycle tracking. The frontend quote submission flow is already functional and should be integrated with the new backend systems.


## User Scenarios & Testing *(mandatory)*


### User Story 1 - Homeowner Submits Lead Request (Priority: P1)


A homeowner uses the instant quote calculator to estimate solar installation costs. When they click "Get Real Quotes from Installers", a quote options modal appears showing two choices: "Call/Visit Quote" or "Written Quote". After selecting a quote type, the system checks authentication status. If the user is not logged in (guest), a signup modal appears with the message "Almost there!" and prompts them to create an account before submission. If the user is already logged in, the quote request is submitted immediately without showing the signup modal. The first request can be submitted without OTP verification, but to unlock additional requests (up to 5 total), the homeowner must verify their phone number via OTP to receive a "Verified Homeowner" badge.


**Why this priority**: This is the core entry point for the entire lead generation system. Without homeowners submitting leads, there is no business. This single story delivers immediate value by capturing leads and starting the revenue cycle. The flow is optimized for both guest and logged-in users, ensuring smooth UX in both scenarios.


**Independent Test**: Can be fully tested by having a guest user complete the instant quote calculator, click "Get Real Quotes from Installers", select a quote type (Call/Visit or Written Quote), see the signup modal, create an account with auto-login, and submit the request. The lead should appear in the admin dashboard. Can also test logged-in user flow where signup modal is skipped. Verification can be tested separately but is not required for the first submission.


**Acceptance Scenarios**:


1. **Given** a guest user completes the instant quote calculator, **When** they click "Get Real Quotes from Installers", **Then** a quote options modal is displayed with "Call/Visit Quote" and "Written Quote" options
2. **Given** a guest user sees the quote options modal, **When** they select either quote type, **Then** the system checks authentication status before proceeding
3. **Given** a guest user is not logged in and selects a quote type, **When** the authentication check occurs, **Then** a signup modal is displayed with title "Almost there!" and button "Create Account & Submit Request"
4. **Given** a guest user completes signup in the modal, **When** account creation succeeds, **Then** the user is automatically logged in and the quote request is submitted, showing a success modal
5. **Given** a logged-in homeowner completes the instant quote flow and selects "Call/Visit", **When** the authentication check occurs, **Then** the signup modal is skipped and the quote request is submitted immediately with a success modal
6. **Given** a logged-in homeowner submits a quote request, **When** submission succeeds, **Then** a new lead is created with status "New" and appears in the admin dashboard
7. **Given** an unverified homeowner has submitted 1 lead, **When** they attempt to submit a 2nd lead without verification, **Then** they are prompted to verify their phone number via OTP
8. **Given** a homeowner verifies their phone via OTP, **When** verification is complete, **Then** they receive a "Verified Homeowner" badge and can submit up to 4 more leads (5 total)
9. **Given** a verified homeowner has submitted 5 leads, **When** they attempt to submit another, **Then** they see a message indicating the limit has been reached (admin can grant more)
10. **Given** a homeowner submits a "Written Quote" request, **When** the lead is created, **Then** it is tagged as "Written Quote" type and follows the appropriate workflow


---


### User Story 2 - Admin Reviews and Approves Leads (Priority: P1)


Admin receives new lead submissions in their dashboard and can switch between two operational modes: **Auto-Approval Mode** and **Manual Review Mode**. In Auto-Approval Mode, admins configure automation rules that execute all typical manual tasks automatically through preset conditions. This includes: setting global prices for each quote type (Call/Visit, Written Quote), defining conditional auto-approval rules (e.g., "auto-approve only Call/Visit leads", "auto-approve only verified homeowners", "auto-approve leads within specific postcodes"), automatic lead assignment to installer groups by location, and automatic pricing adjustments based on homeowner verification status or lead type. All these settings act as automation blueprints that process incoming leads without admin intervention, enabling the system to scale to enterprise volumes where manual review becomes impractical. In Manual Review Mode, every lead requires explicit admin approval and manual configuration before being released to installers. This mode-switching capability ensures the system can scale from startup (Manual Mode for quality control) to enterprise operations (Auto Mode with sophisticated automation rules).


**Why this priority**: Admin control and approval is critical for quality control, preventing spam, and ensuring only legitimate leads reach installers. The switchable mode architecture enables the platform to scale from hands-on management (Manual Mode) to automated operations (Auto Mode with future AI/algorithm integration) without rebuilding the system, making it a P1 alongside lead submission.


**Independent Test**: Can be fully tested by switching between Auto-Approval Mode and Manual Review Mode, then submitting new leads and verifying behavior changes. In Manual Mode, admin must approve/reject each lead. In Auto Mode, leads automatically appear in installer feeds. Admin can set prices and assign leads in both modes.


**Acceptance Scenarios**:


1. **Given** a homeowner submits a lead, **When** it is created, **Then** it appears immediately in the admin dashboard with status "New"
2. **Given** an admin configures Auto-Approval Mode with automation rules (e.g., "auto-approve Call/Visit leads only"), **When** a matching lead is submitted, **Then** it is automatically marked "Pending" and appears in installers' feeds without admin intervention
3. **Given** an admin configures Auto-Approval Mode with conditional rules (e.g., "auto-approve only verified homeowners"), **When** a non-matching lead is submitted, **Then** it remains in "New" status awaiting manual review despite being in Auto Mode
4. **Given** an admin sets global default prices for Call/Visit (£50) and Written Quote (£75) in Auto-Approval Mode, **When** a lead is auto-approved, **Then** the appropriate price is automatically assigned based on quote type
5. **Given** an admin configures automatic lead assignment rules by postcode in Auto-Approval Mode, **When** a lead is auto-approved, **Then** it is automatically assigned to matching installers based on location rules
6. **Given** an admin switches to Manual Review Mode, **When** a new lead is submitted, **Then** it remains in "New" status until admin manually approves or rejects it regardless of any automation rules
7. **Given** the system is in Auto-Approval Mode, **When** the admin switches to Manual Review Mode, **Then** all subsequent leads require manual approval (existing leads and automation rules remain unchanged)
8. **Given** the system is in Manual Review Mode, **When** the admin switches to Auto-Approval Mode, **Then** all subsequent leads are processed by automation rules (existing "New" leads still require manual action)
9. **Given** an admin views a lead, **When** they set a custom price (e.g., £60 for a specific Call/Visit lead), **Then** that price overrides the global default and is displayed to installers
10. **Given** an admin marks a lead as "hot" manually or via automation rule, **When** installers view it, **Then** it is visually highlighted and prioritized in their feed
11. **Given** an admin views all leads, **When** they filter by verification status or location, **Then** only matching leads are displayed


---


### User Story 3 - Installer Discovers and Purchases Lead (Priority: P1)


Verified installers browse the lead marketplace, view available leads (with homeowner contact details hidden), and purchase leads to unlock full access. Upon purchase, installers can view all instant quote inputs, homeowner contact details, and initiate chat or quote submission. Purchased leads are tracked in the installer's "Purchased Leads" page until deal closure.


**Why this priority**: This is the core monetization event and the primary value delivery for installers. Without this, there is no revenue. This completes the minimum viable transaction loop (homeowner → admin → installer purchase).


**Independent Test**: Can be fully tested by having a verified installer view the lead feed, select a lead, purchase it (payment processed), and then access the full lead details including contact info and chat. The lead should move to "Purchased Leads" page and status should update.


**Acceptance Scenarios**:


1. **Given** an installer is verified, **When** they view the lead marketplace, **Then** they see all approved leads available to them (based on admin assignment rules)
2. **Given** an installer views a lead before purchase, **When** they see the lead details, **Then** homeowner contact details are hidden (only property/quote details visible)
3. **Given** an installer selects a lead to purchase, **When** they complete payment, **Then** the lead appears in their "Purchased Leads" page and homeowner contact details are revealed
4. **Given** an installer purchases a Call/Visit lead, **When** purchase is complete, **Then** they can view all instant quote inputs and calculated results
5. **Given** an installer purchases a lead, **When** the purchase is complete, **Then** the homeowner is notified via email and in-app notification
6. **Given** an installer purchases a lead, **When** they view it, **Then** they can initiate internal chat and submit quotes to the homeowner
7. **Given** a lead has been purchased, **When** other installers view the lead feed, **Then** the lead is marked as "Purchased" and cannot be purchased again (unless admin resells)
8. **Given** an unverified installer views the lead feed, **When** they attempt to purchase a lead, **Then** they are blocked and prompted to complete verification (unless admin has granted an exception)


---


### User Story 4 - Lead Status Tracking and Updates (Priority: P2)


All users (homeowner, installer, admin) can track the status of each lead as it progresses through the lifecycle: New → Pending → In Progress → Deal Closed / Void / No Response. Status updates trigger notifications and are visible in real-time in each user's dashboard. All actions (creation, purchase, status change, chat, quote) are logged for full audit trail.


**Why this priority**: Status tracking provides transparency and keeps all parties informed, but the system can function without real-time status updates in an MVP. It enhances UX but is not required for the core transaction.


**Independent Test**: Can be fully tested by creating a lead, purchasing it, changing its status (e.g., from "Pending" to "In Progress"), and verifying that all relevant users see the updated status in their dashboards and receive notifications.


**Acceptance Scenarios**:


1. **Given** a lead is created, **When** it is submitted, **Then** its status is set to "New"
2. **Given** a lead is approved by admin, **When** approval occurs, **Then** status changes to "Pending" and installers can view it
3. **Given** an installer purchases a lead, **When** purchase is complete, **Then** status changes to "In Progress"
4. **Given** a lead status changes, **When** the change occurs, **Then** all relevant users (homeowner, installer, admin) are notified in real-time
5. **Given** a homeowner views their dashboard, **When** they select a lead, **Then** they see the full status history and timeline with timestamps
6. **Given** an installer views a purchased lead, **When** they update the status (e.g., to "Deal Closed"), **Then** the homeowner and admin are notified
7. **Given** an admin views a lead, **When** they change the status to "Void" or "No Response", **Then** the lead is marked accordingly and appropriate notifications are sent
8. **Given** any action is taken on a lead, **When** the action occurs, **Then** it is logged in the audit trail with timestamp, user, and action type


---


### User Story 5 - Admin Manages Lead Lifecycle and Resale (Priority: P3)


Admins have full control over the lead lifecycle, including the ability to resell purchased leads, reset time counters, archive/close leads, and manage user accounts (suspend, hold, verify). The lead lifecycle ends only when admin archives the lead, ensuring central authority over lead closure.


**Why this priority**: Advanced admin controls are important for operational flexibility but not required for the core MVP. The system can function without resale/archive features initially.


**Independent Test**: Can be fully tested by having an admin take a purchased lead, mark it available for resale, reset its timer, and verify it appears in installers' feeds again. Also test archiving a lead and confirming it no longer appears in active feeds.


**Acceptance Scenarios**:


1. **Given** an admin views a purchased lead, **When** they mark it available for resale, **Then** the lead reappears in installers' feeds and can be purchased again
2. **Given** an admin resets a lead's time counter, **When** the reset occurs, **Then** the lead is treated as "new" with refreshed timestamp
3. **Given** an admin views a lead, **When** they archive it, **Then** the lead is removed from all active feeds and marked as closed
4. **Given** an admin archives a lead, **When** archival occurs, **Then** only the admin can reopen or view the archived lead
5. **Given** an admin views user accounts, **When** they suspend/hold/verify an account, **Then** the user's access is immediately updated according to the action
6. **Given** an admin sends a lead to an unverified installer for free, **When** the lead is assigned, **Then** the installer can access it despite verification status


---


### User Story 6 - Internal Chat and Quote Exchange (Priority: P2)


After an installer purchases a lead, they can chat internally with the homeowner and submit quotes within the platform. The chat system operates in real-time with instant message delivery and notifications to both parties. All chat history is automatically saved and persisted in real-time, ensuring no message loss and enabling full conversation replay for all participants. Admins have read-only access to all chat conversations for monitoring, compliance, and quality control purposes, with the ability to view complete chat history for any lead at any time. For "Written Quote" requests, installers submit quotes for admin review and approval before the homeowner sees them. All chat and quote exchanges are logged with timestamps and visible to admins.

**Why this priority**: Communication is essential for deal closure but can be handled externally (email/phone) in an MVP. Internal chat enhances UX and traceability but is not strictly required for the core transaction. Real-time chat with admin monitoring provides compliance oversight and quality assurance.


**Independent Test**: Can be fully tested by having an installer purchase a lead, send a chat message to the homeowner, receive a reply, and submit a quote. For written quotes, test the admin approval flow before homeowner visibility.


**Acceptance Scenarios**:


1. **Given** an installer purchases a lead, **When** purchase is complete, **Then** they can access the internal real-time chat with the homeowner
2. **Given** an installer sends a chat message, **When** the message is sent, **Then** the homeowner is notified in real-time and can view/reply immediately in their dashboard
3. **Given** a homeowner replies to a chat, **When** the reply is sent, **Then** the installer is notified in real-time and can view the message immediately
4. **Given** either party sends a chat message, **When** the message is sent, **Then** it is immediately saved and persisted in the chat history for both parties
5. **Given** an admin views a lead, **When** they access chat history, **Then** they can see all messages between homeowner and installer in real-time (including ongoing conversations)
6. **Given** a chat conversation is ongoing, **When** messages are exchanged, **Then** admins can monitor the conversation in real-time for compliance and quality control
7. **Given** an installer submits a quote for a "Call/Visit" lead, **When** submission occurs, **Then** the homeowner can immediately view the quote with real-time notification
8. **Given** an installer submits a quote for a "Written Quote" lead, **When** submission occurs, **Then** the quote is sent to admin for review and approval before homeowner can view it
9. **Given** an admin reviews a written quote, **When** they approve it, **Then** the quote is sent to the homeowner with real-time notification
10. **Given** an admin reviews a written quote, **When** they reject it, **Then** the installer is notified in real-time and can resubmit
11. **Given** any chat or quote action occurs, **When** the action is completed, **Then** it is logged in the audit trail with full message content and timestamps


---


### User Story 7 - Installer Feedback and Lead Quality Rating (Priority: P3)


Installers can rate and comment on lead quality after purchase, providing feedback visible to admins. This helps admins monitor lead quality, identify spam, and improve the lead generation process over time.


**Why this priority**: Feedback is valuable for continuous improvement but not required for the core transaction. This is a nice-to-have that can be added after the MVP is stable.


**Independent Test**: Can be fully tested by having an installer purchase a lead, rate it (e.g., 1-5 stars), leave a comment, and verify the feedback appears in the admin dashboard.


**Acceptance Scenarios**:


1. **Given** an installer has purchased a lead, **When** they rate it (e.g., 1-5 stars), **Then** the rating is saved and visible to admin
2. **Given** an installer rates a lead, **When** they add a comment, **Then** the comment is saved and visible to admin
3. **Given** an admin views lead quality feedback, **When** they filter by rating, **Then** only leads with matching ratings are displayed
4. **Given** an admin views a homeowner's leads, **When** they check feedback, **Then** they can see aggregate rating and comments from installers


---


### Edge Cases


- What happens when a homeowner submits a lead but the admin has not set any pricing? (System should use default pricing or prompt admin to set pricing)
- What happens when admin switches from Manual Review Mode to Auto-Approval Mode while leads are in "New" status awaiting review? (Existing "New" leads remain in queue for manual review; only new submissions are auto-approved)
- What happens when admin switches from Auto-Approval Mode to Manual Review Mode while leads are being submitted? (Leads submitted before the switch are auto-approved; leads submitted after require manual review)
- How does the system handle a lead that remains in "Pending" status for an extended period without installer purchase? (Admin can manually intervene, resell, or archive)
- What happens if an installer purchases a lead but the homeowner's contact details are invalid or unreachable? (Installer can request refund or report issue to admin)
- How does the system handle simultaneous purchase attempts by multiple installers for the same lead? (First successful payment locks the lead; others receive "already purchased" message)
- What happens when an admin changes a lead's price after installers have already viewed it? (Price change applies immediately; installers see updated price)
- How does the system handle a homeowner who deletes their account after a lead has been purchased? (Lead data is retained for purchased installers and admin audit; homeowner contact becomes inactive)
- What happens if an installer's verification status changes (e.g., suspended) after they've purchased leads? (Existing purchased leads remain accessible; new purchases are blocked)
- How does the system handle leads with no installer interest for an extended period? (Admin can mark as "No Response", adjust pricing, reassign, or archive)


## Requirements *(mandatory)*


### Functional Requirements


- **FR-001**: System MUST display a quote options modal with "Call/Visit Quote" and "Written Quote" options when users click "Get Real Quotes from Installers" after completing the instant quote calculator
- **FR-002**: System MUST check user authentication status when a quote type is selected in the quote options modal
- **FR-003**: System MUST display a signup modal with title "Almost there!" and button "Create Account & Submit Request" when guest users (not logged in) select a quote type
- **FR-004**: System MUST skip the signup modal and submit the quote request immediately when logged-in users select a quote type
- **FR-005**: System MUST automatically log in users after successful signup and proceed to quote request submission
- **FR-006**: System MUST display a success modal after quote request submission for both guest (after signup) and logged-in users
- **FR-007**: System MUST allow the first lead submission without homeowner phone verification, but MUST require phone verification via OTP for subsequent submissions (up to 5 total)
- **FR-008**: System MUST display "Verified Homeowner" badge for homeowners who complete phone verification
- **FR-009**: System MUST restrict homeowners to 5 lead requests by default (across both quote types), with admin ability to grant more
- **FR-010**: System MUST create unique leads for each request, with independent status tracking and full instant quote calculator data preservation
- **FR-011**: System MUST track lead status through lifecycle: New, Pending, In Progress, Deal Closed, Void, No Response
- **FR-012**: System MUST display verification status (verified/unverified) for homeowners on all leads visible to admins and installers
- **FR-013**: System MUST hide homeowner contact details from installers until lead is purchased (for Call/Visit leads)
- **FR-014**: System MUST send all new leads to admin dashboard immediately upon creation
- **FR-015**: System MUST support two switchable operational modes: Auto-Approval Mode (leads automatically processed by automation rules) and Manual Review Mode (leads require explicit admin approval)
- **FR-016**: System MUST allow admins to configure automation rules in Auto-Approval Mode including: conditional auto-approval by quote type, homeowner verification status, postcode/location, and other lead attributes
- **FR-017**: System MUST allow admins to set global default prices for each quote type (Call/Visit, Written Quote) that are automatically applied in Auto-Approval Mode
- **FR-018**: System MUST allow admins to configure automatic lead assignment rules by postcode/area/location that execute in Auto-Approval Mode
- **FR-019**: System MUST allow admins to configure conditional automation rules (e.g., "auto-approve only Call/Visit leads", "auto-approve only verified homeowners") with fallback to manual review for non-matching leads
- **FR-020**: System MUST allow admins to switch between Auto-Approval Mode and Manual Review Mode at any time via admin settings
- **FR-021**: System MUST apply the selected mode and automation rules to all subsequent leads (mode change does not retroactively affect existing leads)
- **FR-022**: System MUST design Auto-Approval Mode to support future integration of advanced automation algorithms and AI for large-scale lead management
- **FR-023**: System MUST allow admins to set lead prices globally (default) and individually per lead, with individual prices overriding global defaults
- **FR-024**: System MUST support different pricing for "Call/Visit" and "Written Quote" lead types
- **FR-025**: System MUST allow admins to assign leads to specific installers, groups, or all installers using filters (postcode/area/location) both manually and via automation rules
- **FR-026**: System MUST allow admins to mark leads as "hot" for visual priority in installer feeds, both manually and via automation rules
- **FR-027**: System MUST require installer account verification (phone OTP and document submission) before lead access, unless admin grants exception
- **FR-028**: System MUST display "Verified" badge for installers who complete verification
- **FR-029**: System MUST allow verified installers to browse and purchase leads from marketplace
- **FR-030**: System MUST reveal homeowner contact details and full instant quote data upon lead purchase (for Call/Visit leads)
- **FR-031**: System MUST move purchased leads to installer's "Purchased Leads" page for tracking
- **FR-032**: System MUST mark purchased leads as unavailable to other installers, unless admin resells
- **FR-033**: System MUST enable real-time internal chat between homeowner and installer after lead purchase with instant message delivery
- **FR-034**: System MUST automatically save and persist all chat messages in real-time for all parties (homeowner, installer, admin)
- **FR-035**: System MUST send real-time notifications to both homeowner and installer when chat messages are sent or received
- **FR-036**: System MUST provide admins with read-only access to all chat conversations for monitoring, compliance, and quality control purposes
- **FR-037**: System MUST allow admins to view complete chat history for any lead in real-time, including ongoing conversations
- **FR-038**: System MUST allow installers to submit quotes after lead purchase
- **FR-039**: System MUST route "Written Quote" submissions to admin for review and approval before homeowner visibility
- **FR-040**: System MUST allow "Call/Visit" quotes to be immediately visible to homeowners with real-time notification
- **FR-041**: System MUST log all actions (creation, purchase, status change, chat messages, quotes, mode switches, automation rule execution) with timestamp, user, and action type for audit trail
- **FR-042**: System MUST send real-time notifications to relevant users on key events (lead creation, purchase, status change, chat, quote)
- **FR-043**: System MUST allow homeowners to view full lead history, status, and timeline in their dashboard
- **FR-044**: System MUST allow installers to view full lifecycle and status of purchased leads
- **FR-045**: System MUST allow admins to view all lead activities, chats, and quotes in centralized dashboard with real-time updates
- **FR-046**: System MUST allow admins to resell purchased leads and reset time counters
- **FR-047**: System MUST allow admins to archive leads, removing them from active feeds (only admin can reopen)
- **FR-048**: System MUST ensure lead lifecycle ends only when admin archives the lead
- **FR-049**: System MUST allow admins to suspend, hold, or verify homeowner and installer accounts
- **FR-050**: System MUST allow installers to rate and comment on lead quality, with feedback visible to admin
- **FR-051**: System MUST prevent simultaneous purchase of the same lead by multiple installers (first payment wins)


### Key Entities


- **Lead**: Represents a quote request from a homeowner. Contains quote type (Call/Visit or Written Quote), homeowner details (hidden until purchase), property information, instant quote inputs/results, status (New, Pending, In Progress, Deal Closed, Void, No Response), pricing, verification badge, timestamps, and audit log of all actions.


- **Homeowner**: User who submits leads. Has verification status (verified/unverified via OTP), verification badge, lead submission count (max 5 by default), account status (active, suspended, held), and relationships to submitted leads.


- **Installer**: User who purchases and manages leads. Has verification status (verified/unverified via OTP and documents), verification badge, account status (active, suspended, held), purchased leads collection, and feedback/ratings on leads.


- **Admin**: User with full system control. Can switch between Auto-Approval and Manual Review modes, configure automation rules, approve/reject leads, set pricing, assign leads, resell, archive, manage user accounts, view all audit trails, and monitor all chats/quotes in real-time.


- **Approval Mode**: System-wide setting that determines lead processing behavior. Two modes: Auto-Approval (leads automatically processed by configurable automation rules for scalability) and Manual Review (admin must approve each lead). Switchable at any time by admin.


- **Automation Rule**: Configuration preset in Auto-Approval Mode that defines how leads are automatically processed. Includes conditional logic (e.g., "auto-approve only Call/Visit leads", "auto-approve only verified homeowners"), automatic pricing by quote type, automatic lead assignment by postcode/area, and automatic "hot" lead flagging. All automation rules act as blueprints that execute without admin intervention, enabling enterprise-scale operations.


- **Lead Status**: Enum representing lifecycle stage (New, Pending, In Progress, Deal Closed, Void, No Response). Changes trigger notifications and are logged.


- **Audit Log**: Record of all actions on a lead (creation, purchase, status change, chat messages, quotes, automation rule execution, admin intervention). Contains timestamp, user, action type, and details.


- **Chat Message**: Real-time communication between homeowner and installer after purchase. All messages are automatically persisted in real-time, logged, and visible to admin for monitoring and compliance.


- **Quote**: Installer's price/proposal submission to homeowner. For "Written Quote" type, requires admin approval. Contains pricing, details, attachments, status (draft, submitted, approved, rejected).


- **Notification**: Event-triggered message sent to users (email, in-app). Triggered by lead actions (creation, purchase, status change, chat, quote).


## Success Criteria *(mandatory)*


### Measurable Outcomes


- **SC-001**: Homeowners can complete lead submission (from instant quote calculation to "Get Real Quotes from Installers" to quote type selection to submission) in under 3 minutes
- **SC-002**: 90% of submitted leads appear in admin dashboard within 5 seconds of submission
- **SC-003**: Admin can switch between Auto-Approval Mode and Manual Review Mode in under 30 seconds
- **SC-004**: Admin can configure automation rules (conditional approval, pricing, assignment) in under 5 minutes per rule set
- **SC-005**: In Auto-Approval Mode with automation rules configured, 95% of matching leads are automatically processed and appear in installer feeds within 10 seconds of submission
- **SC-006**: Automation rules correctly handle conditional logic with 100% accuracy (e.g., leads matching "auto-approve only Call/Visit" rule are approved, non-matching leads await manual review)
- **SC-007**: Admins can approve, price, and assign leads in under 2 minutes per lead (Manual Review Mode)
- **SC-008**: Verified installers can browse, select, and purchase a lead in under 5 minutes
- **SC-009**: 95% of lead purchases successfully reveal homeowner contact details and instant quote data immediately
- **SC-010**: All status updates and notifications are delivered to relevant users within 10 seconds of the triggering action
- **SC-011**: 100% of actions on leads (including mode switches, automation rule execution, chat messages) are logged in audit trail with timestamp and user identification
- **SC-012**: System handles at least 100 concurrent lead submissions without degradation in both Auto-Approval and Manual Review modes
- **SC-013**: Lead purchase success rate is 98% or higher (successful payment and data reveal)
- **SC-014**: 80% of installers successfully complete account verification within 24 hours of signup
- **SC-015**: 90% of homeowners who submit one lead successfully complete phone verification to unlock additional requests
- **SC-016**: Admin can resell or archive a lead in under 1 minute
- **SC-017**: Internal chat messages are delivered in real-time and visible to recipient within 2 seconds
- **SC-018**: 100% of chat messages are automatically saved and persisted with no message loss
- **SC-019**: Admins can access and view complete chat history for any lead in real-time within 3 seconds
- **SC-020**: 95% of "Written Quote" submissions are reviewed and approved/rejected by admin within 24 hours
- **SC-021**: Installer feedback on lead quality is successfully saved and visible to admin in 100% of cases
- **SC-022**: Zero instances of simultaneous lead purchases by multiple installers for the same lead
- **SC-023**: Homeowners can view full lead history and timeline with 100% accuracy (all actions logged and displayed)




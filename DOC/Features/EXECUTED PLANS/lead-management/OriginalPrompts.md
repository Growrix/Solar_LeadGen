🎉 ADMIN ACCOUNT CREATED
═══════════════════════════════════════════════════════════
Email:    admin@solarmatch.com
Password: Admin123!Secure
Name:     SolarMatch Admin
Role:     ADMIN
ID:       cmgp0ab3j0000i1eg35uorwws
Created:  Mon Oct 13 2025 16:44:22 GMT+0600 (Bangladesh Standard Time)



Original : 

understand the scenario and user story before building any API and DB.First, the guests Generates Instant quotes by filling up instant quote form (I want all the guests from Inputs and the results in a table which is separate as Guest's InstantQuote Table), By this table I Want to see total users that generated InstantQuotes In my AdminDashboard (I do not have any modal yet for this). Second , When the Guests Clicks on the "Get Qoute From a Installer" here starts the another phase. They see 2 types of Quote request options "call/Visit" and "Written Quote"(Should have 2 different tables for 2 types of lead). Whatever option the user chose it opens a signup modal (This should have a Table that will authenticate users instantly and also when they login back later). Once the user submits "Create Account & Submit Request" the guests users become the Homeowner and they get redirected to the Homeowners Dashboard (The page "My Quote request are created but there are no modals created yet for any types of quote the user requested, so you have to create it too"). In the homeowners Dashboard They should See the record when they have requested the qoute including its calculated results. All the user inputs should fill up the InstantQuote form when they request for the second time, but users are allowd to edit if they want to change anything in the form and submit. Each time they request new quote it should be saved and show on the homeowners dashboard.

Also Make a plan TO build Modal/Pages in the admin dashboard to track how many users generated instantquote, how many signed up and requested real quote to the installers , Also an option in the modal that will show the cost calcuations and user inputs. 

In the Installers Feed there is already a modal built "Lead Feed". Understand the modal. You can check the leadfeed modals and understand what data is being displayed and how it is structured. The installer should see the all the instantquote inputs and calculated results after they purchse the Call/visit lead. And there should be a page "Purchased Lead" created in the Installer's Dashboard , it should show all the purchsed lead and all of its detailed information of the Homeowners. 



Now lets built The API end points, DB prisma, SQL migration I mean the whole Feature. Your job is to Audit and Analyze the current user experiece flow, Modals, Homeowner-Installer-Admin Dashboard Pages and modals that are realted to InstantQuote Generation flow. We need to make a plan first before any implimentation. lets get the flow and understanding of all the modals to build further dev. Create a InstantquoteFeature.md file with the audit and also the next phase implementaion plan. 


Original : 
**Enhanced Prompt for Copilot:**

---

## Instant Quote & Lead Flow: User Story and Feature Audit

### 1. **User Journey Overview**

- **Guest Experience:**
  - Guests can generate instant solar quotes by completing an Instant Quote form.(This modal is already built)
  - All guest submissions (inputs and calculated results) are saved in a dedicated `GuestInstantQuote` table.
  - Admins need visibility into the total number of guests who have generated instant quotes (to be shown in the Admin Dashboard; modal/page not yet created).

- **Quote Request Phase:**
  - After generating an instant quote, guests can proceed to request a detailed quote from an installer by clicking "Get Detailed Quotes from Installers".
  - Two request types are available:
    - **Call/Visit** (to be stored in a `CallVisitQuoteRequest` table)
    - **Written Quote** (to be stored in a `WrittenQuoteRequest` table)
  - Upon selecting a request type, guests are prompted to sign up or log in (user authentication required).
    - Implement or extend a user authentication table/model to support instant sign-up and login.
    - Identify and reuse any existing authentication modal; if missing, design a new one for a seamless experience.
    - After account creation, the guest becomes a Homeowner and is redirected to the Homeowner Dashboard.

---

### 3. **Dashboard & Modal Enhancements**

#### **Admin Dashboard**
  - Build a unified modal/page to display all lead types ("Call/Visit" and "Written Quote" requests) with comprehensive details:
    - User inputs, calculated quote results, lead status, and timestamps.
    - Filtering and sorting by lead type, status, and date.
    - Summary statistics at the top (e.g., total instant quotes, leads by type, conversion rates).
    - Ensure the design and data structure are consistent with `src/app/admin/instant-quotes/page.tsx`.
    - Add visibility into installer comments and lead quality ratings.
    - Enable quick actions for lead management and tracking.

#### **Homeowner Dashboard**
  - Provide a dedicated, responsive modal/page listing all quote requests (current and historical) with:
    - Original Instant Quote inputs, selected request type, calculated results, cost breakdown, and status indicators.
    - Timestamps for submission and updates.
    - Ability to initiate new quote requests (Instant Quote form pre-filled with latest data, but fully editable).
    - Actions to edit/resubmit previous requests, view detailed results, and track progress.
    - Status updates reflecting when a lead is purchased by an installer (e.g., "Deal Closed").
    - Accessibility and dark mode support.

#### **Installer Dashboard**
  - Reference and extend the existing "Lead Feed" modal for consistency.
  - After purchasing a Call/Visit lead, unlock a detailed modal showing all instant quote inputs and calculated results (matching Homeowner/Admin views).
  - Create a "Purchased Lead" page to manage all purchased leads, displaying detailed Homeowner information and lead status.
    - Only show Call/Visit quotes here.
    - Include "Submit Quote" and "Start Chat" buttons, mirroring current Lead Feed functionality.
    - Add options to mark leads as "Done Deal", "Void", or "User No Response".
    - Provide a comment section for installers to rate/comment on lead quality (visible to Admins for quality tracking).

---

### 4. **Lead Lifecycle & Data Flow**

- Ensure all leads are trackable and data is shared appropriately across Admin, Installer, and Homeowner dashboards, respecting user roles and permissions.
- Define clear lead lifecycle statuses: New, Pending, In Progress, Deal Closed, Void, No Response, etc.
- Categorize and display leads by status in all relevant dashboards.
- Implement robust auditing of the existing API, Prisma models, and database structure before each development phase to avoid inconsistencies.

---

### 5. **Implementation Plan & Best Practices**

- **Audit:**  
  - Thoroughly review current user flows, modals, API endpoints, and database models.
  - Identify gaps and redundancies in the existing structure.
- **Plan:**  
  - Document all findings and next steps in `InstantquoteFeature.md`.
  - Clearly outline new/updated models, API endpoints, and migration requirements.
  - Prioritize a clean, maintainable build process with a focus on UX, accessibility, and responsiveness.
  - Ensure all dashboards and modals are consistent, intuitive, and provide actionable insights for each user type.
  - Validate all new features with real user scenarios to guarantee a seamless experience.

---

**Goal:**  
Deliver a robust, user-friendly Instant Quote and Lead Management feature set that empowers Admins, Homeowners, and Installers with clear, actionable data and a seamless workflow—while maintaining code quality, scalability, and a clean development process.

---

### 2. **Feature Audit & Planning**

- **Audit:**  
  - Analyze the current user flow, modals, and dashboard pages related to instant quote generation and lead management.
  - Identify missing modals/pages for Admin, Homeowner, and Installer dashboards.

- **Plan:**  
  - Document findings and outline the implementation plan in a new file: `InstantquoteFeature.md`.
  - Ensure all new models, API endpoints, and migrations are organized and clearly described.
  - Reference the "Lead Feed" modal for installer data requirements.

---

**Instructions for Copilot:**

- Fully understand the user journey and data flow before implementation.
- Audit and document the current state of user flows and dashboard modals/pages.
- Create a clear, actionable implementation plan for the next development phase.
- Ensure all dashboard requirements (Admin, Homeowner, Installer) are addressed.
- Organize all new database models, API endpoints, and migrations as described.
- Summarize findings and plans in `InstantquoteFeature.md`.


Now the homeowners auth

***Installers Authentication Flow*** The Installers can signup from the header menu button. when the users are logged in they can access the installers Dashboard and also can see the Guest's Homepage. They are not allowed to see/access anything else in this site.
After successful signup the Installers see a modal that shared in the screenshot. When the click co the button "Visit Installer's HOme" it should redirect to the installers home page and that page is only dedicated to Installers. This Homeowners should not see it anyway. Add another button "Visit Dashboard" that will redirect to the installers Dashboard. The installers area is the Installers Dashboard and the Installers home and nothing else. When they logged out, they see the Guest's homepage. This is the Authentication ssytem for the Installers. Now you Do audit, understand the existing what have you done. do the necessary updates as per Expkained the installers story. 


***HOmeowners Authentication Flow*** The Homeowners can signup from the header menu button and also while requeting the quote from the installers. both signup process serves the same purpose. when the users are logged in they can access the homeowners Dashboard and also can see the Guest's Homepage. They are not allowed to see/access anything else in this site. and after logout the homeowners can see only the guests homepage by default. 






## Lead Journey & Life Cycle

### Homeowners

- Homeowners can generate two types of quotes: Call/Visit & Written Quotes.
- Homeowners initiate the lead journey by requesting a quote from an Installer by instantQuote Calcuator(Tha modal is already built). After submitting the instantquote form the user can see the results and then they can proceed to request a quote from an installer by clicking "Get Quote From Installer" button.
- Upon clicking, homeowners choose between "Call/Visit" or "Written Quote" request types
- The first quote request can be sent without blocking, but homeowners must verify their contact number via OTP to receive a "Verified Homeowner" badge.
- Verified homeowners can unlock up to 4 additional quote requests (total of 5 by default); admin can grant more if needed.
- Each lead is unique and independent, and its status is updated as it progresses through the system.
- On leads, the verified/unverified status of the homeowner is always displayed for transparency to both admins and installers.
- Homeowners’ contact details are hidden from installers until a lead is purchased (for Call/Visit leads).
- After a lead is purchased, homeowners and installers can chat internally and exchange quotes within the platform, ensuring privacy and traceability.
- Homeowners are restricted to requesting up to 5 quotes by default (across both quote types), unless admin grants more.
- Homeowners’ accounts can be suspended, held, or verified by admin.
- Homeowners can track the status of each lead (e.g., New, Pending, In Progress, Deal Closed, Void, No Response) in their dashboard, with real-time updates based on installer/admin actions.
- Homeowners receive notifications when an installer purchases their lead, submits a quote, or sends a message.
- Homeowners can view the history and timeline of each lead, including timestamps and status changes.

### Admins

- Leads appear first in the admin dashboard after a homeowner requests a quote, providing admins with full visibility and control over the lead pipeline.
- Admins have a lead management system to auto-approve or manually review leads. Auto-approved leads appear in installers’ lead feeds directly; manually approved leads require admin review before being released.
- Admins can track all lead activities and statuses in a centralized dashboard, including actions taken by homeowners and installers.
- Admins can fix lead prices centrally and also individually for each lead (e.g., set a default price for all leads but override it for specific leads), and set different prices for Call/Visit and Written Quote leads.
- Admins can assign leads to specific installers, groups of installers, or make them available to all installers, using filters such as postcode/area/location/address for precise matching.
- Admins can send leads to any installer (verified/unverified) for purchase or free, and can mark leads as "hot" based on user status and authenticity.
- Admins manage a list of all leads and installers (verified/unverified), with options to filter by verification status and location/postcode.
- Admins are notified when a lead is purchased and on all actions taken on a lead, maintaining a full audit trail.
- Admins can make purchased leads available again and resell if needed, and can reset the time counter on leads to refresh them as new.
- The lead life cycle ends only when admin archives the lead, ensuring that only admins have the authority to close out a lead.
- Admins have full control over homeowner & installer accounts (suspend, hold, verify, etc.).
- Admins can monitor installer comments and ratings on leads, providing insights into lead quality and installer engagement.
- Admins can view and manage all internal chats and quote submissions between homeowners and installers, ensuring compliance and quality control.
- Admins can set verification requirements for both homeowners and installers, and trigger notifications for pending verifications.

### Installers

- Installers can access leads only after verifying their account (contact number via OTP and submitting required documents), ensuring only qualified professionals participate.
- Verified installers receive a "Verified" badge, visible to both admins and homeowners.
- After signup, installers are notified to verify their account to access leads, and can only interact with leads once verified (unless admin grants exceptions).
- Only verified installers can access leads, but admins can send leads to any installer (verified/unverified) for purchase or free, providing flexibility in lead distribution.
- When an installer purchases a lead, the lead appears in their "Purchased Leads" page for tracking until deal closing. The installer can view all instant quote inputs and calculated results after purchasing the Call/Visit lead.
- Installers can chat internally and send quotes to homeowners after purchasing a lead, with all interactions tracked and visible to admins.
- Purchased leads are shown in all installers’ lead feeds as purchased, and only admins can make a purchased lead available again for resale.
- Upon purchasing, installers unlock homeowner contact details and can initiate internal chat or quote submission.
- Installers’ actions on leads (purchase, comments, etc.) are tracked and notified to admin, ensuring accountability.
- For written quotes, installers can submit their quotes internally for admin review and approval before sending them to homeowners, supporting a controlled and quality-driven process.
- Installers can rate and comment on lead quality, with feedback visible to admins for ongoing quality assurance.
- Installers can view the full lifecycle and status of each lead, including timestamps, status changes, and admin actions.
- Installers receive notifications for new leads, purchases, homeowner responses, and admin updates.

---

### Logical Connections & Data Flow

- The lead journey is tightly integrated across all user roles: homeowners generate and manage leads, admins oversee and control the flow, and installers engage with leads through purchase and communication.
- All actions (lead creation, purchase, chat, quote submission, status updates) are logged and visible to relevant parties, ensuring transparency and accountability.
- Verification status is central to the flow: only verified users (homeowners/installers) can fully participate, but admins retain flexibility to override for special cases.
- Status updates and notifications keep all users informed in real time, reducing friction and improving engagement.
- Admins act as the central authority, with the ability to intervene, reassign, or archive leads at any stage, and to manage user accounts and permissions.
- The system supports a full audit trail for every lead, from creation to closure, with all interactions and status changes recorded and accessible to admins.
- The dashboards for each user type are designed to surface relevant information, actions, and insights, supporting a seamless and logical workflow for lead management.





 original :
 There are 2 types of quotes that homeowner's can generate Call/visit & Written Quotes. I need to to build a life cycle, story of the "Leads".  This a lead journey through the Homeowners who generates, Admins who control it by approving, rejecting etc , And the Installers who buy it.  The lead itself will have Status updates based on what action taken by which users.  What I want : After the Homeowners requested a quote from a Installer, the lead will appear first in the admin dashboard>The admin will have a lead setting system where they can auto approve the leads which automatically hit the installers lead feed, The admins can fix price for leads centrally and also individually which is very flexible and has control over each leads, Admin can assign leads to any specific Installers and also can send it to a group of installer's Lead feeds or open for all Installers. The admin will look for postcode/area/location/address etc matching (which should automatically show) for The lead and the installer and make it available for any installers/multiple installers or for all the available installers. the admin should be able to giveaway free leads by setting 0 price (this should be flexible) > The leads will be only available for verified installers , so after the signup the installers should get notified instantly to verify their account to get the leads> The admin panel is a gateway of all kind of leads for both parties  that has Leads and also installers list (verified/unverified). Even the Installers are required to verify their account to get leads, the Admin can send anyone (verified/unverified) leads to purchase or free. The installers get Verified badge when they verify their contact number via OTP and all other important documents to submit> The Homeowners can send their first Quote request without any blocking ,but they are required to verify their contact number via OTP , when they are verified they get verified Homeowners Badge> On the leads , it should always show the verified/unverified status based on Homeowners verifications > the admin can turn a lead to a hot lead based on the users status and authenticity. > The Homeowners have to unlock more quote requests by verifying with OTP , and after verifying they can request up to another 4 Installers (The total is 5). Each leads are unique and independent > the call/visit leads has a journey where the leads will show all the information's except the homeowners Contact details, it will be unlocked upon purchased by installers and reveal the contact info and the users can chat internally/ send quotes internally> When a installer purchase a lead it should also appear in their purchased leads page to keep tracking the lead until deal closing status.  > the admin get notified upon purchased by installers and all the actions taken on lead. > A purchased lead will be shown in all the installers lead feed as purchased > Only admin can make it available again and resell if admin decides later. > on the each individual leads there should be a time counter, it should start from when the lead generated and will go on, the time counter can be reset by admin if admin decides to reset and make it fresh as a new lead. > A leads life cycle only ends by Admin , when admin send a lead to archive the life cycle of a lead is ended.  > The Homeowners are restricted to request quote upto 5 by default in between call/visit and written quote , but the admin can give more request options to any specific homeowners to request more quotes. > the admin are has all the control over homeowners account to suspend/hold/verify 
etc .  


## Lead Journey & Life Cycle

### Homeowners

- Homeowners can generate two types of quotes: Call/Visit & Written Quotes.
- Homeowners initiate the lead journey by requesting a quote from an Installer.
- The first quote request can be sent without blocking, but homeowners must verify their contact number via OTP to receive a "Verified Homeowner" badge.
- Verified homeowners can unlock up to 4 additional quote requests (total of 5 by default); admin can grant more if needed.
- Each lead is unique and independent.
- On leads, the verified/unverified status of the homeowner is always displayed.
- Homeowners’ contact details are hidden from installers until a lead is purchased the call/visit leads.
- After a lead is purchased, homeowners and installers can chat internally/send quotes.
- Homeowners are restricted to requesting up to 5 quotes by default (across both quote types), unless admin grants more.
- Homeowners’ accounts can be suspended, held, or verified by admin.

### Admins

- Leads appear first in the admin dashboard after a homeowner requests a quote.
- Admins should have a lead management system to auto-approve & manually review leads, by auto approving leads they appear in installers’ lead feeds directly. By manually approving leads, admins can review and approve/reject before they appear in installers’ feeds.
- Admins can track all lead activities and statuses in a centralized dashboard.
- Admins can fix lead prices centrally and also individually for each lead. E.g , set a default price for all leads but override it for specific leads.
- Admins can set different prices for Call/Visit and Written Quote leads.
- Admins can assign leads to specific installers, groups of installers, or make them available to all installers.
- Admins can match leads and installers by postcode/area/location/address (automatically shown). admins can filter installers by these criteria when assigning leads.
- Admins can send leads to any installer (verified/unverified) for purchase or free.

- Admins manage a list of all leads and installers (verified/unverified). 
- Admins can mark leads as "hot" based on user status and authenticity.
- Admins are notified when a lead is purchased and on all actions taken on a lead.
- Admins can make purchased leads available again and resell if needed.
- Each lead has a time counter starting from generation; admin can reset this counter to refresh the lead. the counter can be reset by admin if admin decides to reset and make it fresh as a new lead.
- The lead life cycle ends only when admin archives the lead. the lead life cycle is ended.
- Admins have full control over homeowner & installers accounts (suspend, hold, verify, etc.). Also there should be options to filter the homeowners and installers by verified/unverified status, also by location/postcode.

### Installers

- Installers can access leads only after verifying their account (contact number via OTP and submitting required documents).
- Verified installers receive a "Verified" badge.
- After signup, installers are notified to verify their account to access leads.
- Only verified installers can access leads, but admins can send leads to any installer (verified/unverified).
- When an installer purchases a lead, the lead appears in their "Purchased Leads" page for tracking until deal closing.The installer should see the all the instantquote inputs and calculated results after they purchse the Call/Visit lead.
- Installers can chat internally/send quotes with homeowners after purchasing a lead.
- Purchased leads are shown in all installers’ lead feeds as purchased.
- Upon purchasing, installers unlock homeowner contact details and can chat/send quotes internally.-
- Installers’ actions on leads (purchase, comments, etc.) are tracked and notified to admin.
- Only verified installers can access leads, but admins can send leads to any installer (verified/unverified) for purchase or free.
- For the written quotes lead, the installers can submit their quotes internally for review and approval before sending them to homeowners. 





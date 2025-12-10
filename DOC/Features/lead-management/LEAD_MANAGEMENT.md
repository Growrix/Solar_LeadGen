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

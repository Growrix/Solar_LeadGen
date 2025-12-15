- **Quote Request Phase:**
  - After generating an instant quote, guests can request a quote from an installer by clicking the button "Get Detailed Quotes from Installers". You have already created table for guests Inputs. So, when user go for the next steps There are
  - Two request types are available:
    - **Call/Visit** (stored in a `CallVisitQuoteRequest` table)
    - **Written Quote** (stored in a `WrittenQuoteRequest` table)
  - Upon selecting a request type, guests are prompted to sign up (user authentication required).
    - A user authentication table is needed for sign up/login.(Identify the Modal that is already built for this and create a table for it accordingly)
    - After account creation, the guest becomes a Homeowner and is redirected to the Homeowner Dashboard.
    
**Admin Dashboard Enhancement:**  
    - Implement a new modal in the Admin Dashboard to provide a unified view of all lead types—both "Call/Visit" and "Written Quote" requests.  
    - The modal should display comprehensive details for each lead, including user inputs, calculated quote results, and lead status.
    - Ensure the modal’s layout and data presentation closely follow the established design and structure of `src/app/admin/instant-quotes/page.tsx` for a consistent admin experience.
    - Add filtering and sorting capabilities to allow administrators to easily track:
      - Total number of users who generated instant quotes
      - Number of users who signed up and submitted installer quote requests
      - Detailed breakdowns of cost calculations and user-provided data for each quote
    - Integrate summary statistics at the top of the modal/page for quick insights (e.g., total instant quotes, total leads by type, conversion rates).

 **Homeowner Dashboard:**
      - Homeowners should have access to a dedicated modal or page that displays a detailed, filterable list of all their quote requests—both current and historical—along with the calculated results for each.
      - Each quote request entry should include:
        - The original Instant Quote form inputs
        - The selected quote request type (Call/Visit or Written Quote)
        - The calculated quote results and cost breakdown
        - Status indicators (e.g., pending, in progress, completed)
        - Timestamps for submission and updates
      - Homeowners must be able to initiate new quote requests directly from this modal/page. When starting a new request, the Instant Quote form should be pre-filled with their most recent data, but remain fully editable before submission.
      - Provide clear actions for homeowners to:
        - Edit and resubmit previous quote requests
        - View detailed results and lead status for each request
        - Track the progress of each quote through its lifecycle
      - Ensure the modal/page is responsive, accessible, and supports both light and dark modes.
      - After the lead is purchsed by an Installers , It should show a deal closed status on the lead. 

  - 

- **Installer Dashboard:**
  - Reference the existing "Lead Feed" modal to understand the data structure for installer leads.

  - After purchasing a Call/Visit lead, installers should see all instant quote inputs and calculated results just same as Homeowners/admin sees in their Dashboard.(should create a modal for that or unlock the same modal and show it up to the installers after purchse)
  - A "Purchased Lead" page should be created too display all purchased leads and detailed Homeowner information. This page is a lead manager for the installers . this should only show the Call/visit quotes. This installers should have the Submit Quote botton and also Start chat button there too and all of its functionality as now already has in the leadfeed . 
  -There should be options on the leads to mark as Done deal/Void/User no Response and also a comment section for the installers to comment about the lead quality, These options will be visible to the ADMIN Dashboard to track the lead quality as well. 

**Overall scenario**
- After the guests become a lead, The lead should be trackable and should share the same data accordingly to the Admin/installers/homeowners based on their conditions. 
- The leads always have a life circle , need to categorize theme as new leads/Deal closeds/Pending/ (You get some idea for categories) 

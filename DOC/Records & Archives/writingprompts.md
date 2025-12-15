## Second Lead Generation Phase: Homeowner Dashboard & Quote Requests

### Current Status

- Up to phase 4.5, homeowners can create their first lead by signing up. This lead is successfully generated and appears on the Admin dashboard for approval and further processing.
- The process for generating the first lead by homeowners is complete.

### Next Phase: Enhanced Lead & Quote Management

#### Homeowner Dashboard Enhancements

- Homeowners should see their generated first lead in their dashboard.
- The dashboard should display:
    - Total quote limit (default: 5)
    - Number of quotes requested (e.g., 1)
    - Remaining quote balance (e.g., 4)
- Quote counts and balances should update live as new quotes are requested.

#### Second Lead Generation Process

1. **Requesting More Quotes**
     - Homeowners click "Request More Quotes" in their dashboard.
     - A modal opens to verify the contact number via OTP.
         - The current contact number is shown and can be edited.
         - Polite message:  
             _"Please verify your contact number. We use this step to protect against spam and fake requests. Verified users receive serious attention from installers and can request up to 4 additional free & no Obligation quotes."_
     - After successful OTP verification:
        - The user get verified badge immidiately
         - Another modal opens with all fields pre-filled (copied from the first lead/instant quote calculator).
         - Homeowners can edit any fields as needed.
         - Clicking "Calculate Again" shows updated results, just like the first lead.
         - A new lead is generated based on the modified input.
         - If the user does not generate quotes, they can close the modal and return to the dashboard. And when ever they want, they can click "Request More Quotes" again to restart the proces without asking for OTP again.

2. **Sending Quote Requests**
     - Homeowners click "Send Request."
     - A modal appears to choose the quote type: Call/Visit or Written Quote.
     - For each type, homeowners select how many installer requests to send (within their remaining limit).
         - Maximum combined quotes per homeowner: 4 (unless increased by admin).
         - Example: 2 Call/Visit + 2 Written Quotes = 4 total.
     - The modal displays the current limit and updates as selections are made.
     - Flexibility to select any combination within the limit.

3. **Admin Controls**
     - Admin can update the quote limit for any homeowner (e.g., increase from 4 to 10).
     - Admin panel provides full control over homeowner quote limits.

4. **Dashboard Updates & History**
     - After sending a request, the homeowner dashboard updates quote counts and balance.
     - Homeowners see a full history of all requested quotes, including status.
     - Each quote/lead has a unique ID and timestamp.
     - All leads are unique; the process mirrors the first lead generation.
     - Admin panel displays all leads with unique IDs and timestamps.
     - If a home owner tries to request more quotes than their limit, an error message appears.
     - If a homeowner closes the quote request modal without sending, no new lead is created, and their quote balance remains unchanged.
     - Homeowners will see their each quote requet status in their dashboard (New, Pending, In Progress, Deal Closed, Void, No Response). e.g If a homeowner requested 2 Call/Visit and 2 Written quotes, they will see 4 entries in their dashboard with the status of each. 

---

### Implementation Notes

- All previous spec files were generated, but during the build process for the first four phases, some challenges arose.
- The `tasks.md` file was updated for clarity and a cleaner build process; the `spec.md` file was not updated due to its complexity.
- Before building these features, audit all files and folders to understand the current state.
- Reference both `tasks.md` and `spec.md` to ensure alignment with the current build.
- Decide whether to update `tasks.md` or create a new file for this next phase, ensuring clarity and alignment.
- Completing homeowner and admin functions in this phase will provide a clear roadmap for the upcoming Installer phase.
- Ensure all new features are well-documented and tested for a smooth user experience and the implimentation process is well aligned with the plan and the project structure
- you decide the best way to organize the files and folders for this phase, ensuring clarity and alignment with the overall project structure. becuase the spec kit is quite complex and has many files for a build process.

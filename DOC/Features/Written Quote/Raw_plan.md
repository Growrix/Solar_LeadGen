***written Quote building***

As the Bid flow and all of its modals are already built and working perfectly, I want you to Copy the existing Review Bid modal, Bid builder modal, but adapt with the writtenQUote.  I do not want to reuse , I want separate modals for Written Quote flow but it will be a copy of the existing bid flow modals with some modifications as per the written quote flow requirements.
- Understand the scenario : the bidding Lead system and the written Quote system is almost same except the negotiation part. so the existing Bid builder modal and Review Bid modal can be used for this purpose with some modifications. so that we do not need to build another modal from scratch. So, do not overcomplicate things. just copy the existing modals and adapt accordingly as per the written quote flow requirements.

***What to copy exactly as per SOT bid flow:*** 
- Copy the existing Review Bid modal from homeowners side and make a new modal for Written Quote review modal for homeowners side.
- Copy the existing Bid builder modal from installers side and make a new modal for Written Quote builder modal for installers side. 
- The Frontend and backend both needs to be copied and adapted for Written Quote flow accordingly as per the existing SOT bid flow.

***what modifications needed:*** 
### Bid Builder modal (Installer side) modifications:
- Change all the texts and labels from Bid to Written Quote accordingly.
- All the fields remains exactly same as like the existing Bid builder modal.
- Only add : negotiation section in the right column to show the negotiation history and current status, and field for amount inputs. 

### Review Bid modal (Homeowner side) modifications:
- Change all the texts and labels from Bid to Written Quote accordingly.
- All the fields remains exactly same as like the existing Review Bid modal.
- Only add : negotiation section in the right column to show the negotiation history and current status, and field for amount inputs. 

### The negotiation Section functionality: 
The Installer side : Submit masked written quote amount (e.g., $5,000) tied to a lead.
The Homeowner side : Propose a counter amount (free-form numeric), respecting limits: 1 time only.
- Installer’s new price replaces prior; “last price” is authoritative until next change.
- Both end will have "Done deal" button → negotiation closes; installer proceeds to payment.

Summary : E.g the installer given price 10000> the homeonwer countered with 8000 > the installer given new price 9000 > the homeowner accepted the price by pressing "Done deal" button > negotiation closed > installer proceeds to payment. 

- The entire negotiation history should be shown in the negotiation section in both end (installer and homeowner) with timestamps. And they respective amounts. use the right column for this purpose in both modals.

***Instructions*** I want you to copy the existing Review Bid modal, Bid builder modal, but adapt with the writtenQUote as per the above instructions. so that we have separate modals for Written Quote flow but it will be a copy of the existing bid flow modals with some modifications as per the written quote flow requirements. Your job is to deeply undertand the Bid builder modal and Review Bid modal both frontend and backend flow first. then you have to copy and adapt accordingly as per the above instructions. 

***Strickt rules***  
Follow the
### Guidelines:
 from this file before doing anything, and must read through:D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\GUIDELINES & SOT\README.md

### Audit Report: 
 After that create a audit report in D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder . 

### Implementation Phase:
Create a phase in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\specs\008-description-enhance-existing\tasks.md file and Start implimenting. 
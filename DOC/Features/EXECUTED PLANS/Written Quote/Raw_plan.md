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


--------------------------------------------------------------------------------------------------
 I need the admin function to control the Written Quote Negotiation Limits. e.g now the Homeowner can propose a counter amount only 3 times and installers can 4 times. I want you to create an admin function where the admin can set how many times the homeowners and installers can propose a counter amount. so that the admin can change this limit from time to time as per the business requirement.

***Admin function to control Written Quote Negotiation Limits***
- Create an admin function to control the Written Quote Negotiation Limits for homeowners and installers.


-----------------------------------------------------------------------------------------

***Neogitation panel enhancement*** 
 - The Installers negotiation panel always gets the counter price update instantly without any issues and with out refreshing the modal/page , But the Homeowners negotiation panel does not get the counter price update instantly without refreshing the modal/page. I want you to fix this issue in the Homeowners negotiation panel so that it always gets the counter price update instantly without any issues and with out refreshing the modal/page. Audit deeply and fix it accordingly.

 - I want to add a online/Offline status indicator in the negotiation panel in both end (installer and homeowner) so that both parties can see each other's online/offline status easily while negotiation. e.g a green dot for online and grey dot for offline beside the username in the negotiation panel. Audit deeply and implement it accordingly.
 The online status will only show when the Both parties are in the respective modals e.g if the installer is in the Quote builder modal and the homeowner is in the review modal at the same time then only the online status will show. if they are not in the respective modals at the same time then it will show offline status.

 - I want to add a Counter and this counter will be active when the Installer submit the quote and the initial negotiation timeline should be 3 days from the date of quote submission. e.g if the installer submitted the quote on 1st Jan 2024 , then the homeowner will have time till 4th Jan 2024 to respond with a counter offer price. After that the counter offer option will be disabled automatically. same goes for the installer as well. The overall negotiation timeline is 3 days, After 3 days whichs is 72 hours - the entire negotiation will be closed automatically if the both end could not take any decision done deal/reject. The goal is to limit both parties within a negotiation timeframe, so that the users respond within a timeframe. Audit deeply and implement it accordingly. 

 - After the Timeframe is over e.g 3 days/72 hours , if there is no action taken from both end , then the negotiation will be closed automatically and the lead status will be changed to "Negotiation expired" and both parties will get email notifications regarding this. Audit deeply and implement it accordingly. 

 - But there will be an option for both parties to extend the negotiation timeframe by 2 days once. e.g if the homeowner could not respond within 3 days , then they can request for an extension of 2 days once. same goes for the installer as well. After the extension is over , there will be no option for further extension. Audit deeply and implement it accordingly. 

 - The last option is to request admin to increase the negotiation timeframe if both parties could not take any decision within the given timeframe including extension. e.g if both parties could not take any decision within 5 days (3 days + 2 days extension) , then they can request admin to increase the negotiation timeframe. Admin will get email notifications regarding this request and admin can increase the negotiation timeframe as per the business requirement. Audit deeply and implement it accordingly.

 - The admin will be able to control the negotiation timeframe from the admin panel. e.g admin can set the initial negotiation timeframe, extension timeframe etc as per the business requirement. I want you to create a modal for that and add a section in the Admin Lead Management Modal for that purpose. The section will be the control system of the Negotiation limits for both end. 

 -----------------------------------------------------------------------------------------

*** Email and Notification system for Written Quote negotiation events***
 - I want you to identify all the negotiation events e.g counter offer submitted, revise offer submitted, done deal clicked, reject clicked, negotiation expired etc. And Plan the push notification for all the events for both parties (installer and homeowner) accordingly. Audit deeply and implement it accordingly.

 - From your Audit report I will finalize the email and notification contents for selective negotiation events. After that you have to implement it accordingly. 

 - Also decide For admin Push notifications and Email notifications for critical negotiation events e.g negotiation expired, extension requested etc. Audit deeply and implement it accordingly. These will be chosen from your Audit report.

 ***Instructions***
 I want you to deeply audit the existing Written Quote negotiation system first. then create a detailed audit report in the D:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch\DOC\Features\Written Quote folder for all the above mentioned requirements. After my approval you have to start the implementation phase accordingly.
 
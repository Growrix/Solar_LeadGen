# Bidding Feature Brainstorm — Owner-Aligned (v2)

This version integrates all (***my notes***) directives to align the flow and UX with your preferences while remaining consistent with existing architecture.

---
## 1. Core Principles (Enhanced)
- Non-invasive extension: reuse lead + assignment + countdown; no regressions to CALL_VISIT/WRITTEN.
- Lead-centric window: admin sets `expiresAt`; window controls bid submission/updates.
- Role autonomy: Homeowner chooses winner after window; Admin oversight remains for auditing and exceptions.
- Progressive disclosure: installers see full lead technical inputs (no personal contact) to price bids accurately.
- Smooth UX: autosave for bid inputs; consistent semantic UI; single SOT card style.
- Transparent history: installers see past bidding outcomes in a separate history view; lead feed stays uncluttered.
- Stop-on-fail testing gates per phase; audit every critical transition.

---
## 2. Journeys Updated to Owner Notes

### 2.1 Installer Journey
1. Lead card (BIDDING) shows countdown + actions.
2. Open "Lead Details" (Bid Evaluation) modal:
   - Show all homeowner-provided technical inputs: location, postcode, address (if allowed to show area only), energyBill, billType, roofType, budgetRange, desiredOffset, batteryRequired, capacity, timeframe, additionalNotes, quoteData fields.
   - Mask homeowner name/email/phone.
3. "Place/Update Bid" opens Bid Submission (reuse QuoteBuilderModal):
   - Fields: amount, capacityOffer, expectedInstallDate, notes; optional batteryOffer, validityDays.
   - Autosave (local draft) + restore when reopening.
   - Allow revisions until countdown ends.
4. After window:
   - Card shows "Awaiting Homeowner Decision"; bid locked.
5. If homeowner selects installer:
   - Status: AWARDED → CTA "Purchase to Unlock" (existing purchase API, gated).
6. After purchase:
   - Contact unmasked; lead moves to Purchased → Bidding tab.
7. If not selected:
   - Lead disappears from feed; move to Installer Bidding History (status LOST; show bid details for self-learning).

(***my notes:*** we need to enhance the quote builder modal as per below :
- in the system design the Panel Modal, inverter modal, battery now has dropdown to select from the existing products in the Quote builder modal. Bit it need to be enhanced to have manual inputs also. so that installer can enter custom products if needed.And battery capacity is not there, so need to add batter capacity filed also and that should have dropdown + custom input option also. 
- Now the GST is calculating 10% automatically in the quote builder modal. we need to have an option to include or exclude GST in the total amount and also should be able to enter % manually. so need to have a checkbox "Include GST" if checked then it will show the input area to add % amount GST on the total amount otherwise it will not include GST in the total amount.
- Same with fedearl incentive also need to have an option to include or exclude that from the total amount and should be able to enter the amount manually. so need to have a checkbox "Include Federal Incentive" if checked then it will show the input area to add $ amount of fedearl incentive on the total amount otherwise it will not include federal incentive in the total amount.
- The goal is to make the quote builder user-friendly and each and every thing should be customizable by the installers.
- Add these options in the system design section, in all the dropdown area you should add more brand names as per the market standard brands and available in australia. such as panel brands, Inverter Brands, Battery Brands. I am giving you a list , so that you can make it accordingly : 

#Solar Panel Brands
Canadian Solar
JA Solar
Jinko
LG
Longi
Hanwha Q Cells
Hyundai
Phono Solar
REC Solar
Risen
Seraphim
SunPower
Suntech
Trina
Aiko Solar

#Inverter Brands
Enphase Energy
Fronius
SMA Solar Technology
SolarEdge
Huawei
Sungrow
GoodWe
Growatt
Ginlong / Solis

#Battery 
Tesla
Sungrow
BYD
Sigenergy
Enphase Energy
Hinen
Neovolt

- So in this system design section the installers can select from these brand names from the dropdown or can enter manually if not available in the dropdown. 
- There is a save draft button in the quote builder modal also need to have an autosave functionality, so that if installer forgets to save the draft and closes the modal by mistake or due to any reason the data should not be lost. it should be saved automatically as a draft and when installer opens the modal again the data should be restored automatically. this will enhance the user experience. and after saving , the installers should be about the open and edit it from the Bidding lead card with a button "Draft Saved - Click to Edit" . This draft saved button will only show if there is a draft saved otherwise it will not show. Just show the default "Place Bid" button which actually opens the quote builder modal to place a new bid.
- There is a preview PDF button in the quote builder modal : We do not need that anymore. so remove it. 
- There is a button "Send quote" in this modal, but replace that button name with "Submit Bid". because in bidding lead the installers are not sending quotes to homeowners, they are submitting bids for the lead. so change the button name accordingly.
- Also , after the bid is submitted successfully there should be a notification popup "Bid submitted successfully" to enhance the user experience.
- Also, in the bidding lead card in the lead feed after the bid is submitted successfully the status should change from OPEN to "Bid Submitted - Awaiting Homeowner Decision" to make it more clear for the installers.
- there is a live preview section in the quote builder modal which shows the live preview of the quote price calculations including gst and federal incentive. so we need to enhance that section also to show the bid amount entered by the installer in the bid submission form. so that installer can see the total bid amount including gst and federal incentive in the live preview section.
- all the bid submission should be saved in a new table called "bid submit" with all the fields such as lead id, installer id, bid amount, and all the inputs from the quote builder modal. so that we can fetch the data later for the homeowner review modal.)

### 2.2 Homeowner Journey (Owner’s Decision-Centric)
1. Submits BIDDING lead as usual.
2. On first installer bid: notification + lead card status becomes "Responded by Installer".
3. After window ends: open "Bidding Review" modal: 
   - Show each bid: Everything from Bid model except installer identity. that will fetch all the data from the installers bid submit table.
   - Installer identity is blurred/hidden until selection; show a sidebar placeholder for company name/logo blurred.
   - CTA on each bid: "Deal Accepted" (enabled only after countdown finishes).


4. When homeowner clicks "Deal Accepted":
   - Lead sets `biddingAwardedInstallerId` to the chosen installer; winner notified.
   - Winner must purchase to unlock contact; homeowner gets "Installer selected; expect contact soon".
5. Post-selection: homeowner cannot edit/cancel the lead per rules.

### 2.3 Admin Journey (Oversight + Exceptions)
1. Assign installers + set/edit countdown (existing).
2. Monitor bids in Admin Bids Panel (real-time list for auditing).
3. No mandatory admin award: homeowner selects the winner.
4. Admin can override in exceptions (e.g., re-award if winner withdraws before purchase), all actions audited.
5. Admin sees purchase completion timestamps; visibility maintained.

---
## 3. Frontend Components (Owner-Aligned)
- `BidEvaluationModal` (Installer): full technical inputs, no contact.
- `BidSubmissionModal` (Installer): reuse `QuoteBuilderModal` + autosave (localStorage or server drafts) + semantic UI.
- `HomeownerBiddingReviewModal`: list of bids with blurred installer identity; CTA "Deal Accepted"; shows bid details only.
- `AdminBidsPanel`: monitoring view; sorting/filtering.
- `BiddingStatusBadge`: OPEN, DECISION_PENDING, AWARDED_PENDING_PURCHASE, PURCHASED, LOST.
- `InstallerBiddingHistory`: separate page/section listing past bids and outcomes.

---
## 4. Backend Services (Adjusted)
- `submitOrUpdateBid(...)`: UPSERT; eligibility by assignment + BIDDING + window open.
- `listBidsForLead(leadId)`: homeowners/admin get sanitized list; installer sees only their bid.
- `homeownerSelectWinner({ leadId, installerId, homeownerId })`: transactional set winner; notify; set lead `biddingAwardedInstallerId`.
- `markBidLeadPurchased(leadId, installerId)`: guard winner-only purchase; set purchasedAt; audit.
- Purchase route guard: if BIDDING then only awarded installer can purchase.

---
## 5. Data Model (Defer Finalization)
- Keep proposed `Bid` model; defer schema changes until stories finalized.
- Lead fields: add `biddingAwardedInstallerId`, optional `biddingState` aligned with owner flow.

---
## 6. Autosave Strategy (Installer)
- LocalStorage draft keyed by `bid:leadId:installerId`.
- Restore on reopening modal; prompt to submit before window close.
- Optional server-side drafts later.

---
## 7. Visibility & Identity Rules
- Installer identities are hidden to homeowner during review; only bid content visible.
- Identity revealed to homeowner after purchase (once installer contacts); or remain hidden in UI while communications happen off-platform—configurable.

---
## 8. Testing Gates (Owner-Aligned)
1. Installer
- Submit/update bid; autosave works; window closure locks edits.
- Not selected → moves to history; selected → purchase CTA visible only to winner.
2. Homeowner
- First bid triggers status change; review modal lists bids without identity; Deal Accepted sets winner.
3. Admin
- Sees bids in panel; override functions work; audit logs complete.
4. Purchase
- Winner-only guard; contact unlock; moves to Purchased → Bidding tab; countdown hidden post-purchase.

---
## 9. Rollout Phases (Adjusted)
- P1: Bid model + submit/list + homeowner review modal (read-only).
- P2: Homeowner select winner endpoint + notifications.
- P3: Installer autosave + history view.
- P4: Purchase gating and post-purchase flows.
- P5: Admin monitoring + overrides.
- Stop-on-fail at each phase with manual tests.

---
## 10. Open Items to Confirm
- Should homeowner see anonymized installer quality badges (e.g., verified badge) before selection? (blurred logo but show "Verified" tag).
- Reveal identity after selection or after purchase? (default: after selection, but contact still masked until purchase).
- Allow homeowner to change selection before winner purchases? (default: allow within grace period; admin override required).

---
## 11. Acceptance Summary
- Installers can price accurately using full technical inputs in a Details modal.
- Homeowners select the winner via a clear review modal with anonymized installers.
- Admin oversees and can intervene; all transitions audited.
- Winner-only purchase unlock; SOT card reused; semantic UI enforced.

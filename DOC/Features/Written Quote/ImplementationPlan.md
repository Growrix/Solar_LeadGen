# Written Quote — Implementation Plan (Research-Aligned)

Version: 1.0  
Date: 2025-12-15  
Owner: Product + Engineering  
Sources: DOC/MASTER PLAN/Deep Research ChatGPT (Business plan + Australian Market Analysis)

---

## 0) Purpose & Outcomes
- Increase installer lead-to-deal conversion by enabling a simple, traceable "Written Quote" negotiation inside the existing Review Bids modal.
- Address key pain points:
  - Homeowners: trust, clarity, timely responses, fair quotes.
  - Installers: reduce admin overhead, structured quoting, faster decision cycles, higher quality conversion without bidding chaos.
- Align with marketplace economics (pay-on-deal optional later) and SaaS workflow (quote → schedule → invoice → payment).

---

## 1) Research-Driven Validation (Summary)
From Business plan + Market Analysis:
- Installers waste time on admin; adoption improves with end-to-end tooling (quoting, scheduling, invoicing) and mobile-first UX.
- Lead competition fatigue; value rises with higher quality/conversion mechanics and clear ROI.
- Homeowners prioritize trust, transparent numbers, and availability; calculators and clear communication improve conversion.
Implication for Written Quote:
- Keep negotiation low-friction and structured; capture definitive "last price" and clear next actions (schedule visit / proceed to payment).
- Provide response-time SLAs and status visibility to reduce uncertainty.
- Enable notifications that are helpful, not spammy; respect neutral homeowner language.

---

## 2) Goals / Non‑Goals
- Goals
  - Simple offers and counters, clear close action (Done deal), next-step CTA.
  - Reduce back-and-forth confusion with a canonical timeline and status.
  - Integrate with payment unlock flow after closure.
  - Add minimal UI surface (Reuse Review Bids modal + new tab).
- Non‑Goals (V1)
  - No multi-installer group chats; no free‑form messaging.
  - No price breakdown calculators inside the modal (link out if needed).
  - No commission (“pay-on-deal”) in V1; consider in V2.

---

## 3) Scope (V1 MVP)
- Tab in Review Bids modal: "Bids" | "Written Quote".
- Show latest installer offer (masked), latest homeowner counter, compact timeline.
- Actions: installer → Offer, Done deal; homeowner → Counter.
- SLA indicators: "Installer typically replies within Xh" (computed from historical events; default 24h if insufficient data).
- CTA after Done deal: Installer sees "Proceed to payment" (existing purchase flow).

---

## 4) UX & Content Guidelines
- Neutral language for homeowners; avoid internal terms like "purchase" until payment context.
- Clear timestamps and actor labels on events; readable amounts with locale formatting.
- Empty states: helpful guidance (how it works, expected steps).
- Accessibility: keyboard navigable inputs/buttons; ARIA labels; WCAG 2.1 AA.
- Multi-theme compliance (Dark/Light/Purple) using design tokens only.

---

## 5) Data Model (Prisma)
Tables (V1):
- WrittenQuote
  - id (cuid), leadId, installerId, homeownerId
  - status: OPEN | CLOSED
  - lastPriceByInstaller (Int)
  - lastCounterByHomeowner (Int | null)
  - closedBy: INSTALLER | HOMEOWNER | SYSTEM | null
  - closedAt: DateTime | null
  - responseSlaHours (Int | null) — optional hint (materialized for speed)
  - createdAt, updatedAt
- WrittenQuoteEvent
  - id (cuid), writtenQuoteId (FK)
  - actor: INSTALLER | HOMEOWNER
  - type: OFFER | COUNTER | DONE_DEAL
  - amount: Int | null
  - createdAt
Indexes: (leadId, installerId, status), (writtenQuoteId, createdAt desc)
Constraints: One OPEN WrittenQuote per (leadId, installerId).

---

## 6) API (Next.js App Router)
- POST /api/written-quotes/[leadId]/start (installer)
  - Opens or reuses OPEN record; returns current state + events.
- POST /api/written-quotes/[id]/offer (installer)
  - Validates OPEN; sets lastPriceByInstaller; appends OFFER event.
- POST /api/written-quotes/[id]/counter (homeowner)
  - Validates OPEN; sets lastCounterByHomeowner; appends COUNTER event.
- POST /api/written-quotes/[id]/done (installer/homeowner)
  - Validates OPEN; sets CLOSED; appends DONE_DEAL event; returns next-step CTA.
- GET /api/written-quotes/[leadId]/[installerId]
  - Returns snapshot (WrittenQuote + latest 20 events) + computed SLA hint.
Security:
- Role checks per actor; ensure access only to participants (admin override allowed per existing policy).
- Rate limiting to prevent spammy offers/counters.

---

## 7) Notifications & Email
Events and channels:
- OFFER → notify homeowner (in‑app + email template HQ neutral)
- COUNTER → notify installer
- DONE_DEAL → notify both with clear next step (installer → payment)
Guidelines:
- Pacing (cooldown windows) to avoid spam bursts.
- Templates maintain neutral homeowner language; include support link.
- Logging to EmailDelivery table (or equivalent) for observability.

---

## 8) UI Integration (Reuse Review Bids Modal)
- Add a tab component; keep Lead detail panel intact (collapsible) per standards.
- Written Quote tab components:
  - CurrentStateCard (masked offer, latest counter, status)
  - HistoryList (most recent 6 events; link to view more)
  - ActionPanel (installer/homeowner specific)
- Token‑only classes; zero hardcoded colors/typography; pass specs/007 checks.

---

## 9) KPIs & Success Metrics
- Feature adoption rate: % of eligible leads that start Written Quote.
- Time to response: median hours between events.
- Conversion uplift: % of negotiations reaching DONE_DEAL vs baseline bid acceptance.
- Installer NPS for negotiation flow (> +20 target after 4 weeks).
- Email deliverability (bounce < 1%, complaint < 0.1%).

---

## 10) Risks & Mitigations
- Over‑notification → add cooldown and digest options; allow per‑user preferences.
- Stalled negotiations → auto‑reminders at 24h; allow cancel and feedback.
- Price disputes → immutable event log; admin override; clear UI copies.
- Scope creep → V1 limits (no free‑form chat; no commission yet).

---

## 11) QA & Compliance (MANDATORY)
- UI‑First → build modal tab with mock data; get approval.
- specs/007 verification → 6 grep checks = 0/0/0/0/0/0; multi‑theme visual pass.
- Accessibility → keyboard, ARIA, contrast.
- Playwright scenarios:
  1) Start → Offer → Counter → Done → Payment CTA visible to installer.
  2) Unauthorized actor blocked.
  3) Notification entries created per event.
- Privacy → PII minimal; log access; align with Australian Privacy Principles.

---

## 12) Rollout Plan
- Beta: 5–10 installers (NSW/VIC) + 50 homeowners over 2 weeks.
- Metrics review + copy tweaks.
- GA: enable for all new leads; include in onboarding tips.

---

## 13) Dependencies
- Existing Review Bids modal shell.
- Notification service + SendGrid setup.
- Payment unlock flow after DONE_DEAL.

---

## 14) Open Questions
- Should homeowner see an anchor price guidance (range) from calculators?
- SLA default: hard‑code 24h or compute per installer after N events?
- Should we surface a "Schedule site visit" CTA pre‑close?

---

## 15) Tasks & Timeline (2 sprints)
Sprint 1 (UI‑First, 1 week)
- Modal tab + components (mock data)
- Empty states & copies
- A11y + multi‑theme validation

Sprint 2 (Backend & Integration, 1–2 weeks)
- Prisma models + routes
- Notifications + templates
- Playwright + API tests
- Enable flag + beta cohort

---

## 16) Canonical References
- Start: DOC/GUIDELINES & SOT/README.md → IMPLEMENTATION SOT/README.md → AI-IMPLEMENTATION-GUIDELINES.md
- Migration/Build: specs/007-migration-and-build/spec.md + plan.md (verification gates)
- Research Inputs: Business plan.md; DEEP RESEARCH/Lead Generation SaaS for Installers – Australian Market Analysis.md

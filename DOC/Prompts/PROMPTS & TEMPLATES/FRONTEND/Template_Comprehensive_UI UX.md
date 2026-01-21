
* Any AI model **must follow**
* Becomes the **bridge between UI/UX planning → backend planning**
* Forces **state discipline, trigger discipline, and backend awareness**
* Clearly marks **what to copy/paste into AI web builders**
* Prevents partial, decorative, or dead-end UI/UX

I have **kept your structure**, **strengthened it**, and **added missing layers** that backend engineers need later.

---

# 🧱 MASTER OUTPUT TEMPLATE

# **[FEATURE NAME] — Frontend UI/UX System Plan (SOT)**

> **Status:** UI/UX Planning Complete
> **Audience:** Frontend AI Builders → Backend Engineers → Product Owners
> **Dependency:** Must be completed BEFORE backend planning

---

## 0) Purpose & Contract

This document is the **Single Source of Truth (SOT)** for building the **[FEATURE NAME] UI/UX** across all roles.

It guarantees:

* Logical, backend-implementable UI
* Deterministic user flows
* No missing states, triggers, or dead ends
* AI-safe, step-locked frontend building

⚠️ **No backend planning may begin until this document is approved.**

---

## 1) Non-Negotiable Rules (Must Be Enforced by Any AI)

Derived from:

```
[PATH TO GUIDELINES & SOT README]
```

### Structural Rules

* Pages are built **before** modals
* One step = one page OR one modal
* One modal = one intent
* No step may reference future UI elements

### Prompting Rules

* Every build prompt MUST declare:

  ```
  This is Step X of Y in the [FEATURE NAME] frontend flow.
  ```
* Each step must define:

  * Trigger source
  * Exit destination
  * UI states
* No backend logic or assumptions allowed

### UX Safety Rules

* No invisible state transitions
* No irreversible actions without confirmation UX
* No “happy path only” flows

---

## 2) Scope & Explicit Constraints

### In Scope

* UI/UX structure
* Navigation & layout
* Modals, drawers, confirmations
* UI-level states (loading, empty, disabled)
* UX permissions (what is visible vs disabled)

### Out of Scope (By Design)

* API contracts
* Database schema
* Automation logic
* Payment logic
* Role enforcement logic (UX only, not auth)

---

## 3) Information Architecture (IA)

### Navigation Entry Points

* Sidebar / Top Nav / Context Menu / Deep Link

### Pages Hierarchy

```
[Nav Group]
 ├─ Page A (Primary)
 │   ├─ Sub-section
 │   └─ Modal triggers
 ├─ Page B
 └─ Page C
```

Explain:

* Why each page exists
* Who can access it (UX-level)

---

## 4) Core Domain Objects (UI-Level Contract)

> ⚠️ These are **conceptual objects**, NOT schemas.

### 4.1 Object: [Object Name]

**Used In UI For:**

* Cards
* Lists
* Modals
* Status badges

**Minimum Display Fields:**

* Field (display purpose)
* Field (decision making)
* Field (status visibility)

---

### 4.2 User-Facing Status System

Statuses MUST:

* Be mutually exclusive
* Be visually distinguishable
* Map cleanly to UI behavior

Example:

* Draft
* Submitted
* In Review
* Action Required
* Completed
* Rejected

---

## 5) End-to-End UX Flow (Narrative)

> This section becomes the **backend flow validation reference**

### Primary Flow

1. User enters via ___
2. User performs ___
3. System responds with ___
4. User confirms / cancels
5. UI updates to ___

### Alternate / Failure Paths

* What if user abandons?
* What if data is missing?
* What if action fails?

---

## 6) Build Sequence (Locked Order)

**Total Steps:** `N`

| Step | Type         | Name       | Reason       |
| ---- | ------------ | ---------- | ------------ |
| 1    | Page         | Page Name  | Entry point  |
| 2    | Modal        | Modal Name | Action       |
| 3    | Confirmation | Confirm X  | Risk control |
| …    | …            | …          | …            |

⚠️ **Steps must be built strictly in order**

---

# 🧠 STEP-BY-STEP UI/UX SPEC + AI-READY PROMPTS

> This section is **DIRECTLY COPY-PASTED** into AI web builders
> (Google AI Studio, Bolt, Cursor, Framer AI, etc.)

---

## 🔹 Step X of Y — [Page / Modal Name]

### Purpose

Why this step exists in the user journey.

---

### Trigger

* How user arrives here
* From which page or action

---

### Layout Structure

* Sections
* Cards
* Tables
* Actions per section

---

### Interaction Map

| User Action | Result       | Next Step |
| ----------- | ------------ | --------- |
| Click A     | Modal opens  | Step X+1  |
| Click B     | State change | Same page |

---

### UI States

* Default
* Loading
* Empty
* Disabled
* Error (UX copy only)

---

### Exit Rules

* Cancel → returns to ___
* Success → moves to ___
* Failure → stays with message ___

---

### Expected Outcome (Validation Gate)

After building this step, the UI MUST show:

* [ ] Correct sections
* [ ] Correct buttons
* [ ] No future UI elements
* [ ] No backend logic

---

## ✅ COPY & PASTE BELOW INTO AI WEB BUILDER

```
ROLE:
You are a senior SaaS frontend UI/UX engineer.

SCOPE:
UI/UX only. No backend. No APIs.

FLOW POSITION:
This is Step X of Y in the [FEATURE NAME] frontend flow.

TASK:
Build the UI for [Page / Modal Name].

REQUIREMENTS:
- Follow the provided layout and interaction map
- Do not create future pages or modals
- Include default, empty, loading, disabled states

INTERACTIONS:
- Describe triggers only; do not build next step

OUTPUT:
- UI layout description
- Component list
- State behavior

STOP AFTER:
- This step only
```

---

[Repeat for every step]

---

## 7) Cross-Cutting UX Rules (Global)

Applies to **ALL steps**:

* Preserve scroll & filters when returning
* Disable actions when state disallows
* Optimistic UI where safe
* Always show user where they are in the flow

---

## 8) Backend Readiness Mapping (CRITICAL)

> This section is the **handoff to backend planning**

For each UI action:

* Trigger exists ✔
* State change is visible ✔
* Required backend confirmation needed? (Yes/No)

Flag anything unclear.

---

## 9) Deliverable Checklist (Must Be 100%)

* [ ] All pages defined
* [ ] All modals mapped to triggers
* [ ] No dead ends
* [ ] All states defined
* [ ] Backend-safe UX

---

## 10) Deferred / Phase-2 Ideas

Clearly marked. No mixing.

---

# 🏁 END OF UI/UX SOT TEMPLATE

---

## Why This Template Works (Your Strategy)

* **AI-proof**: forces discipline
* **Backend-friendly**: state + trigger clarity
* **Scalable**: works for any feature
* **Safe**: no accidental scope creep
* **Production-grade**: matches real SaaS workflows


# IMPORTANT: If you enhance, update, or change this plan (including additions or removals), you MUST also update all relevant SOT folder files to keep the documentation in sync. This includes:
# - SOT files such as `Frontend-Plan.md`, `FEATURE-SOT.md`, `IMPLEMENTATION-PLAN.md` in the feature SOT folder
# - The single feature tracker `DOC/FEATURES/<FEATURE>/tasks.md` (do NOT create tasks.md inside SOT/MIGRATION)
# - Any other SOT or audit files impacted by the change
#
# Additionally, for every new or changed step, add or update the corresponding prompts in this file to reflect the updated plan.
#
# When using an AI builder, always refer to this instruction so that all documentation and prompt plans remain aligned.



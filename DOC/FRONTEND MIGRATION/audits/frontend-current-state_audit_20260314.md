# Frontend Current-State Audit (DS-only Recovery)

Date: 2026-03-14

## Objective

Re-audit the current frontend after the DS migration work documented in:

- `DOC/FRONTEND MIGRATION/DS-ONLY-MIGRATION-PLAN.md`
- `DOC/FRONTEND MIGRATION/audits/frontend-regressions_audit_20260310.md`
- `DOC/FRONTEND MIGRATION/tasks.md`

Focus for this audit:

- public homepage route
- homepage-owned components and modal flows
- frontend-only DS ownership status
- whether the app is now truly controlled by `src/ds` as a single source of truth

## Executive Summary

The migration is only partially complete.

What is true today:

- global app shell ownership moved into DS (`layout`, theme bootstrap, header/topbar/footer shell wrappers)
- many legacy product components now consume DS primitives such as `Button`, `Input`, `Modal`, and `Pressable`
- the homepage visually reflects some DS styling changes

What is not true today:

- the homepage is **not** DS-only
- the homepage route is still assembled from `src/components/*`, not from `src/ds/*`
- multiple homepage components still contain large amounts of local Tailwind/semantic styling and legacy presentation code
- Gate0 typecheck is currently failing on broken DS barrel assumptions
- DS ownership and DS consumption were treated as the same thing, which created the current confusion

## Main Finding

The current codebase is in a **DS-enabled hybrid state**, not a **DS-owned state**.

That distinction explains why the site changed only partially:

- **DS-enabled** means legacy components import DS primitives but still live in `src/components/*`, carry local styling decisions, and remain the real UI owners.
- **DS-owned** means pages are composed from DS route-level sections, DS shells, DS blocks, and DS-approved wrappers. Styling and interaction contracts are controlled from `src/ds`.

Current homepage status is DS-enabled, not DS-owned.

## Audit Scope

Reviewed:

- `src/app/page.tsx`
- homepage imported components under `src/components/*`
- homepage modal components under `src/components/homeowner/*`
- `src/app/layout.tsx`
- `src/ds/index.ts`
- `src/ds/runtime/web/AppChrome.tsx`
- prior homepage logic audit and prior US8 status notes
- live homepage render at `http://localhost:3000`

Artifacts captured:

- screenshot: `homepage-frontend-audit-20260314.png`

## Current Homepage Reality

### 1. Route ownership is still legacy

`src/app/page.tsx` still imports the homepage from legacy product components:

- `../components/Hero`
- `../components/InstantQuoteForm`
- `../components/RebateCalculatorForm`
- `../components/QuoteOptionsModal`
- `../components/QuoteSuccessModal`
- `../components/HomeownerSignupModal`
- `../components/HomeownersInfoForm`
- `../components/homeowner/ContactVerificationModal`
- `../components/homeowner/QuoteTypeDistributionModal`
- `../components/homeowner/LeadLimitReachedModal`
- `../components/homeowner/FirstQuoteSuccessModal`
- `../components/OTPVerificationModal`
- `../components/BlogSection`
- `../components/NewsletterSignup`

Implication:

- homepage composition is still owned by `src/app` + `src/components`
- DS is mostly supplying primitives, not route-level ownership

### 2. Homepage sections are still locally styled, not centrally DS-owned

Representative examples:

- `Hero.tsx` uses DS `Button`, but section layout still depends on local utility classes and local hero markup
- `BlogSection.tsx` still uses a large Tailwind utility surface for layout, cards, image overlays, spacing, and typography
- `NewsletterSignup.tsx` still owns its input shell, success/error presentation, loading spinner, spacing, animation, and section shell locally
- `RebateCalculatorForm.tsx` still contains a very large styling surface, with local class decisions and non-DS chart wrapper structure
- `QuoteTypeDistributionModal.tsx` still contains extensive local presentation logic and class-level styling decisions

Implication:

- visual consistency still depends on each legacy component file
- `src/ds` does not yet control homepage sections globally

### 3. Legacy visual patterns still exist inside active components

During the audit, the homepage and related surfaces still showed these non-DS ownership patterns:

- raw Tailwind utility layouts (`grid`, `flex`, `px-*`, `py-*`, `gap-*`, `rounded-*`, `shadow-*`)
- semantic app classes such as `detail-card`, `performance-item-label`, `card`, `toggle-switch`, `toggle-knob`
- local inline SVG icon definitions inside many components instead of a clean DS icon boundary
- route components directly importing sibling components and internal types

This is not necessarily a functional bug, but it means the “single DS controls everything” target has not been reached.

## Runtime / Validation Findings

### 1. Gate0 typecheck currently fails

Observed on 2026-03-14:

- `src/components/homeowner/SimplifiedQuoteForm.tsx`: `@/ds` has no exported member `SavingsChart`
- `src/components/quote-builder/InstantQuoteResult.tsx`: `@/ds` has no exported member `SavingsChart`
- `src/components/QuoteOptionsModal.tsx`: `@/ds` has no exported member `OTPVerificationModal`

Interpretation:

- parts of the migration rewired imports toward `@/ds`
- but the DS barrel was not completed to match those expectations
- this is a migration integration regression

### 2. Live browser warning confirms an active integration issue

Homepage runtime warning observed in the browser console:

- `QuoteOptionsModal.tsx` attempts to import `OTPVerificationModal` from `@/ds`, but DS does not export it

Impact:

- this is not just a theoretical audit issue
- the hybrid migration has an actual broken contract in runtime/dev validation

### 3. Homepage flow logic was not proven broken, but integration health is not clean

No direct evidence was found that the quote routing logic itself was rewritten incorrectly in `src/app/page.tsx`.

The major flow functions still exist and appear structurally intact:

- guest vs authenticated branching
- lead-count-based routing
- phone verification branching
- quote limit branching

However, because typecheck is currently red and a modal import contract is broken, it is not safe to claim the homepage flow is fully healthy.

Practical conclusion:

- **business logic appears largely preserved**
- **migration integration is not stable enough to declare the homepage safe**

## Visual Findings From Live Homepage

The live screenshot shows why the migration feels incomplete:

- header/topbar/footer now look more unified than before
- hero CTA area shows DS influence
- calculator card uses a cleaner DS-like shell
- blog section is still visually sparse because content was still loading during capture
- newsletter section remains a custom local composition, not a DS-owned block
- the overall page is still assembled from many individually styled components, so it does not read like one DS-owned system

## Why The Earlier Task List Feels Misleading

`DOC/FRONTEND MIGRATION/tasks.md` marks many items as complete.

That completion status is directionally true only if success is defined as:

- “replace some primitives with DS primitives”
- “remove some legacy imports”
- “improve styling compliance on specific files”

It is not true if success is defined as:

- “homepage is fully owned by DS”
- “one DS controls all homepage styling and composition”
- “global frontend architecture has no competing UI owners”

This mismatch between **primitive migration done** and **ownership migration not done** is the main source of confusion.

## DS Ownership Status By Layer

### Layer A: Global shell

Status: partially achieved

Evidence:

- `src/app/layout.tsx` uses DS theme bootstrap and DS app chrome
- topbar/header/footer wrappers now exist under `src/ds/runtime/web`

Remaining issue:

- `src/ds/runtime/web/AppChrome.tsx` still dynamically imports many product components from `src/components/*`
- so even the global shell is DS-owned outside, but still depends on legacy interiors

### Layer B: Homepage route composition

Status: not achieved

Evidence:

- `src/app/page.tsx` is still wired directly to legacy product components

### Layer C: Homepage section ownership

Status: not achieved

Evidence:

- `Hero`, `BlogSection`, `NewsletterSignup`, `InstantQuoteForm`, `RebateCalculatorForm` remain primary UI owners
- DS mostly provides primitives, not route-level sections/blocks

### Layer D: Modal ownership

Status: not achieved

Evidence:

- homepage modal files still live under `src/components/*`
- modal presentation is still largely owned by each local component
- one DS import contract is currently broken (`OTPVerificationModal`)

## Root Cause

The migration blended three different goals into one stream of work:

1. Fix visual regressions
2. Replace low-level primitives with DS primitives
3. Make DS the only UI owner

Only goal 1 and parts of goal 2 were advanced meaningfully.

Goal 3 requires a stricter architectural move:

- route pages must compose DS-owned sections
- DS must expose homepage section blocks and modal wrappers
- legacy product components must either be wrapped behind DS or retired from direct page imports

That architectural move has not happened yet.

## Recommendation

Do not continue treating the homepage as “already migrated”.

Treat it as:

- visually improved
- partially refactored to use DS primitives
- still structurally legacy

The correct next step is to run a **homepage recovery pass** with DS ownership as the success metric.

That plan is documented in:

- `DOC/FRONTEND MIGRATION/audits/ds-only-recovery-plan_20260314.md`

## Bottom Line

If the real goal is “only one `src/ds` controls the frontend”, the current homepage does **not** meet that bar.

If the real goal is “legacy components may survive temporarily, but only behind a DS-controlled boundary”, the codebase also does **not** meet that bar yet.

The migration is not lost, but it needs to be reframed from:

- primitive replacement

to:

- ownership consolidation
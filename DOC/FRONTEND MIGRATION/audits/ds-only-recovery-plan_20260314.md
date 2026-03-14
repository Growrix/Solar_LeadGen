# DS-only Recovery Plan (Homepage First)

Date: 2026-03-14

## Goal

Move the homepage from a **DS-enabled hybrid** into a **DS-owned route**, without breaking existing business logic.

That means:

- the homepage route should stop assembling UI directly from `src/components/*`
- DS should become the public owner of homepage sections, interaction wrappers, and modal contracts
- legacy components may exist temporarily, but they must sit **behind** a DS boundary, not be imported directly by pages

## Non-goals

- rewriting quote calculation logic
- changing API contracts
- changing session/auth rules
- changing modal decision logic in `src/app/page.tsx`
- redesigning every non-homepage route in the same pass

## Recovery Principle

For now, use this rule:

> Legacy logic may stay.
> Legacy UI ownership may not stay in the route layer.

This is the cleanest way to preserve behavior while giving DS real control.

## What To Stop Doing

Do not use these as the definition of success anymore:

- “component imports `Button` from `@/ds`, therefore it is migrated”
- “raw button tags were removed, therefore the route is DS-only”
- “the page looks slightly more DS-like, therefore ownership is done”

Those checks are too weak for your actual goal.

## Success Criteria For Homepage

Homepage recovery is complete only when all of the following are true:

1. `src/app/page.tsx` imports homepage UI from `@/ds` entrypoints only, except for business-logic-only modules if absolutely necessary.
2. Homepage sections are exposed by DS as explicit section/block components.
3. Homepage modal surfaces are exposed by DS as wrappers or DS-owned composition contracts.
4. No homepage runtime warning remains for broken DS exports.
5. Gate0 typecheck passes.
6. The rendered homepage still preserves current quote/signup/verification routing behavior.

## Phase 0: Fix Migration Breakage First

These are blockers before any further homepage claim can be trusted.

### P0.1 Fix broken DS barrel expectations

Resolve current typecheck failures:

- `QuoteOptionsModal.tsx` importing `OTPVerificationModal` from `@/ds`
- `SimplifiedQuoteForm.tsx` importing `SavingsChart` from `@/ds`
- `InstantQuoteResult.tsx` importing `SavingsChart` from `@/ds`

Decision required per symbol:

- either export it from DS intentionally
- or stop importing it from DS and keep it local until a real DS wrapper exists

Preferred rule:

- only export a symbol from DS if you want DS to own that contract long-term

### P0.2 Re-run validation

Required:

- `Gate0: Typecheck`
- browser open of homepage with zero DS import warnings

## Phase 1: Define The Homepage DS Boundary

Create a DS homepage surface so the page imports from DS, not directly from legacy files.

### P1.1 Add DS homepage namespace

Create a DS public homepage namespace under `src/ds`, for example:

- `src/ds/composition/blocks/homepage/*`
- or `src/ds/components/marketing/homepage/*`

This namespace should expose route-facing components such as:

- `HomepageHeroSection`
- `HomepageCalculatorSection`
- `HomepageBlogSection`
- `HomepageNewsletterSection`
- `HomepageFooterSection` if needed

### P1.2 Use wrapper-first migration

Do not rewrite all logic immediately.

Instead:

- create DS-owned wrappers that call existing legacy components internally where needed
- move route imports from `src/app/page.tsx` to DS exports first

Example strategy:

- `HomepageCalculatorSection` may internally render the existing `InstantQuoteForm` and `RebateCalculatorForm`
- but the page should only know about the DS section wrapper

This gives immediate architectural control without high logic risk.

## Phase 2: Consolidate Homepage Sections Inside DS

Once wrappers exist, progressively absorb presentation ownership into DS.

### P2.1 Hero

Move full hero section ownership into DS.

Target:

- `src/app/page.tsx` no longer imports `src/components/Hero.tsx`
- hero markup, CTA layout, stat cards, typography, and spacing are defined in DS

### P2.2 Calculator section shell

Keep current calculator logic, but move the surrounding section shell and switcher ownership into DS.

Target:

- calculator heading, tabs/switcher shell, section container, progress indicator shell, and CTA framing come from DS
- form internals can remain legacy temporarily if needed

### P2.3 Blog section

Convert `BlogSection` into a DS-owned content block.

The data fetch can remain as-is, but:

- card layout
- image treatment
- metadata row
- section spacing
- loading state presentation

should become DS-owned.

### P2.4 Newsletter section

This is one of the clearest candidates for DS ownership.

Keep submit logic, but move:

- card shell
- field shell
- submit row
- loading/success/error visual states

behind DS-owned components.

## Phase 3: Consolidate Homepage Modal Contracts

The homepage modal system is currently functional but not DS-owned.

### P3.1 Keep modal logic, move modal boundary

For homepage modals, do not rewrite open/close logic first.

Instead, create DS modal wrappers or DS surface exports for:

- quote options
- quote success
- homeowner signup
- homeowner info
- contact verification
- quote distribution
- lead limit reached
- first quote success
- OTP verification

### P3.2 Route imports must point to DS

After wrappers exist:

- `src/app/page.tsx` should import modal surfaces from `@/ds`
- DS wrappers may still delegate to existing modal logic temporarily

## Phase 4: Simplify `src/app/page.tsx`

The homepage page file should become a coordinator, not a UI owner.

Desired final role of the route:

- session/data fetching
- state management
- flow branching
- modal state wiring
- section callbacks

Undesired role of the route:

- direct dependency on many legacy UI files
- styling decisions
- section-level markup ownership

## Phase 5: Align AppChrome With The Same Rule

If the long-term goal is one DS-controlled frontend, homepage work alone is not enough.

`src/ds/runtime/web/AppChrome.tsx` still imports many legacy components directly.

After homepage recovery, apply the same rule to global shell internals:

- DS runtime should depend on DS-owned wrappers, not raw `src/components/*` modules

This should be a later wave, not mixed into the homepage recovery pass.

## Recommended Execution Order

### Wave 1: Stabilize

- fix DS export mismatches
- restore green Gate0 typecheck
- confirm homepage loads with no DS barrel warnings

### Wave 2: Reclaim route ownership

- introduce DS homepage namespace
- wrap hero, calculator section, blog, newsletter, and homepage modal surfaces
- switch `src/app/page.tsx` imports to DS

### Wave 3: Reclaim presentation ownership

- absorb section-level markup and styling from legacy homepage components into DS blocks
- reduce Tailwind/semantic class ownership in `src/components/*`

### Wave 4: Retire direct legacy imports

- remove direct `src/components/*` homepage imports from the route
- keep legacy logic only where still needed behind DS wrappers

## Concrete Next Task List

### Immediate

1. Fix the three broken `@/ds` export/import mismatches.
2. Re-run Gate0 typecheck.
3. Create a DS homepage export surface and switch `src/app/page.tsx` to import homepage sections/modals from there.

### After that

4. Move `Hero` into DS ownership.
5. Move `NewsletterSignup` into DS ownership.
6. Move `BlogSection` into DS ownership.
7. Move the calculator section shell into DS ownership.
8. Move homepage modal contracts behind DS wrappers.

## Definition Of “Good Enough” For The Next Pass

The next homepage pass should be considered successful if:

- `src/app/page.tsx` imports homepage UI only from `@/ds`
- typecheck is green
- browser warnings are gone
- the existing homepage quote/signup/verification flows still behave the same

That is the right checkpoint before doing a deeper cleanup of the underlying legacy files.

## Final Note

You are not starting over.

The previous work did produce value:

- DS styling baseline exists
- DS shell exists
- many primitives are already swapped

But the next phase must stop measuring success by primitive replacement and start measuring success by **ownership consolidation**.
# Prototype-First Frontend Redesign Plan

## Objective

Redesign the entire public-facing site so that the prototype in `DOC/FRONTEND MIGRATION/solarconnect (3)` becomes the visual source of truth for layout, spacing, color, typography, sizing, shapes, shadows, overlays, motion, and responsive behavior.

Constraints:

- Frontend only.
- Existing business logic, state flow, routing, auth behavior, APIs, data contracts, and feature behavior must remain intact.
- Content does not need to match the prototype verbatim.
- Design must match the prototype as closely as possible, pixel for pixel.
- The live site should move to one theme only, aligned to the prototype visual system.

## Audited Reality

### Prototype State

The prototype is a single-theme marketing shell with:

- A dark cinematic visual system.
- Transparent/sticky header behavior over the hero.
- Large editorial typography.
- Glass/dark surfaces, soft borders, glow accents, and deep image overlays.
- Very specific spacing rhythm, corner radii, and CTA proportions.
- A homepage-first visual language that also influences downstream sections.

### Current Production State

The real site is implemented through the design system, not page-local one-off styles.

Current implementation surface:

- DS tokens: `src/ds/styles/ds.tokens.css`
- DS theme layer: `src/ds/styles/ds.theme.css`
- DS component styling: `src/ds/styles/ds.components.css`
- DS runtime public shell: `src/ds/runtime/web/AppChrome.tsx`
- Public header: `src/ds/runtime/web/HeaderMenu.tsx`
- Public top bar: `src/ds/runtime/web/TopBar.tsx`
- Shared theme toggle: `src/ds/components/shared/ThemeSwitcher.tsx`
- Theme registry: `src/ds/foundation/themes/registry.ts`

This means the redesign cannot be done correctly by styling only page components. The DS shell must be updated first, otherwise the site will keep mixing prototype-like sections with old DS chrome.

## Core Decision

Yes: if the goal is true prototype-accurate redesign across the site, the DS must be updated.

But the correct approach is not “blindly rewrite every DS primitive.” The correct approach is:

1. Collapse the public site to one canonical theme that matches the prototype.
2. Rebase DS tokens and public-shell semantics to that one-theme system.
3. Update only the DS primitives, DS shell components, and feature components that materially affect the rendered UI.
4. Keep all logic-bearing components functionally identical.

Because the site already follows the DS, once the right DS layers are updated, a large portion of the site will inherit the redesign automatically.

## Non-Negotiable Rules

### Preserve Logic

Do not change:

- Event handlers
- API calls
- Auth/session logic
- Role redirects
- Modal flows
- Data fetching
- Form validation logic
- State machines
- Routing decisions
- Business rules

Allowed changes:

- Markup structure only where needed for visual fidelity
- DS class names
- DS tokens
- DS component CSS
- Presentational wrappers
- Icon treatment
- Motion/transition values
- Responsive layout behavior

### Prototype as Visual SOT

The prototype becomes the source of truth for:

- Color palette
- Type scale
- Font weight and tracking
- Border opacity
- Surface opacity and blur
- Radius system
- Shadows and glow
- Section spacing
- Hero/header proportions
- Animation timing and easing
- Breakpoint behavior

The prototype does not become the source of truth for:

- App logic
- Production routing
- Production auth flows
- Existing API contracts
- Existing data model

## One-Theme Strategy

To match the prototype faithfully, the site should stop behaving like a multi-theme public experience.

### Required One-Theme Changes

1. Make the prototype-inspired dark theme the only active public theme.
2. Remove public dependency on the theme switcher.
3. Simplify theme registry so public runtime resolves to one theme only.
4. Re-map DS semantic tokens to the prototype palette instead of maintaining parallel light/dark public styling.
5. Keep internal dashboard theme behavior only if truly required later, but do not let that block the public-site redesign.

### Why This Is Necessary

Pixel-perfect design parity is incompatible with a public DS that still has to look equally correct in multiple visual modes unless the prototype itself was designed for that. It was not. It is a single visual language.

## DS Migration Strategy

The redesign should be executed in four layers.

### Layer 1: Foundation

Update the foundation tokens so the DS speaks the prototype language by default.

Files:

- `src/ds/styles/ds.tokens.css`
- `src/ds/styles/ds.theme.css`
- `src/ds/foundation/themes/registry.ts`
- `src/ds/components/shared/ThemeSwitcher.tsx`

Work:

- Replace current mixed light/dark public token assumptions with prototype-aligned defaults.
- Standardize one typography scale from the prototype.
- Standardize one spacing scale from the prototype.
- Standardize one radius/shadow/overlay system from the prototype.
- Freeze one public color system.
- Remove or disable public theme switching affordance.

Expected outcome:

All DS consumers inherit the same baseline visual language before component-level redesign begins.

### Layer 2: Public Chrome

Rebuild the public shell to match the prototype header behavior and proportions.

Files:

- `src/ds/runtime/web/AppChrome.tsx`
- `src/ds/runtime/web/HeaderMenu.tsx`
- `src/ds/runtime/web/TopBar.tsx`
- `src/ds/styles/ds.components.css`

Work:

- Convert the sticky public shell to prototype-style transparent-over-hero behavior.
- Rework top-bar height, spacing, typography, and CTA presentation.
- Rework header logo scale, nav spacing, CTA shape, and mobile drawer styling.
- Align scroll-state transitions to the prototype.
- Remove legacy chrome styling that conflicts with the prototype’s framing.

Expected outcome:

The site frame matches the prototype before section migration begins.

### Layer 3: Shared Section System

Update reusable section semantics so feature areas can match the prototype without per-page hacks.

Primary surfaces:

- Buttons
- Cards
- Badges
- Headings
- Body text
- Section containers
- Carousels/indicators
- Inputs if the prototype style requires them downstream

Files likely involved:

- `src/ds/styles/ds.components.css`
- Relevant DS primitives under `src/ds/primitives/*`
- Shared DS components under `src/ds/components/*`

Work:

- Align button heights, paddings, weights, and radii.
- Align card depth, border treatment, glass effects, and hover states.
- Align badge/pill styling.
- Align heading scale and max-width rules.
- Align responsive content width and section spacing.

Expected outcome:

Feature components can be migrated with much less custom CSS, because the shared language is already correct.

### Layer 4: Feature Sections

Migrate real feature components one by one, keeping logic untouched but re-skinning the output to the prototype.

Initial public priority order:

1. Hero
2. Header and top bar refinement pass after hero comparison
3. Blog/news/home content sections
4. Newsletter/contact/footer areas
5. Secondary public pages using the same DS language
6. Auth-facing public entry screens if they visually need to align to the new shell

Files likely involved:

- `src/components/Hero.tsx`
- Homepage section components under `src/components/*`
- Blog/public page components under `src/app/*` and `src/components/*`

Work:

- Preserve handlers and section behavior.
- Change only presentation structure and DS class usage.
- Match spacing, composition, hierarchy, and visual emphasis to the prototype.

## Recommended Execution Order

### Phase 0: Baseline Audit

- Capture the current prototype measurements for header, hero, cards, buttons, section gutters, and key breakpoints.
- Capture the current live-site measurements for the same elements.
- Produce a gap matrix before touching code.

Deliverable:

- A measured visual diff document for desktop and mobile.

### Phase 1: Freeze Theme Direction

- Remove public multi-theme expectations.
- Decide the single public theme token map.
- Hide or remove public theme switch UI.
- Set default public theme to the prototype-aligned theme.

Success condition:

- Public shell and public pages always render in one consistent visual mode.

### Phase 2: Rebuild Token System for the Prototype

- Update typography scale.
- Update spacing scale.
- Update radius scale.
- Update elevation and overlay values.
- Update semantic color roles.
- Update surface transparency and blur contracts.

Success condition:

- Buttons, cards, text, and containers can render prototype-like proportions without page-level overrides.

### Phase 3: Rebuild Public Chrome

- Update `AppChrome`, `TopBar`, and `HeaderMenu` visuals to the prototype.
- Match fixed positioning, transparent state, scrolled state, nav alignment, CTA treatment, and mobile behavior.

Success condition:

- The site frame visually matches the prototype before the hero is considered final.

### Phase 4: Rebuild Hero Pixel-Perfect

- Match hero height, slide composition, badge placement, title width, subtitle width, indicators, card placement, and trust strip.
- Preserve existing CTA handlers and slide logic.

Success condition:

- Side-by-side screenshot comparison shows no meaningful spacing, type, size, radius, or color mismatch.

### Phase 5: Rebuild Remaining Homepage Sections

- Apply the same system to blog/news/newsletter/contact/footer sections.
- Ensure section transitions and vertical rhythm match the prototype.

Success condition:

- The full homepage reads as one coherent prototype-derived experience, not a hero-only redesign.

### Phase 6: Extend the Same System to Remaining Public Pages

- Apply the same DS language to public routes that still carry old visual patterns.
- Update only components that materially affect the rendered UI.

Success condition:

- Public routes feel like one site designed from the same visual system.

## Component Groups That Must Be Audited and Likely Touched

### Guaranteed Touch Points

- `src/ds/styles/ds.tokens.css`
- `src/ds/styles/ds.theme.css`
- `src/ds/styles/ds.components.css`
- `src/ds/foundation/themes/registry.ts`
- `src/ds/components/shared/ThemeSwitcher.tsx`
- `src/ds/runtime/web/AppChrome.tsx`
- `src/ds/runtime/web/HeaderMenu.tsx`
- `src/ds/runtime/web/TopBar.tsx`
- `src/components/Hero.tsx`

### Likely Touch Points

- Shared primitives under `src/ds/primitives/`
- Shared section components under `src/ds/components/`
- Homepage public sections under `src/components/`
- Public route wrappers under `src/app/`

### Only Touch If Visually Necessary

- Dashboard surfaces
- Auth modals
- Bottom nav variants
- Installer/homeowner route wrappers

These should only be touched if the redesign scope truly includes those rendered surfaces.

## Implementation Rules for Every Migration Step

For each component or section:

1. Audit current logic and list what must not change.
2. Audit the matching prototype surface and record exact visual targets.
3. Update DS tokens or shared semantics first if the mismatch is systemic.
4. Update the component markup only as much as needed for fidelity.
5. Re-run typecheck and build.
6. Compare screenshots against the prototype at fixed breakpoints.
7. Only then mark the section complete.

## Validation Standard

### Code Safety Gates

- `npx tsc -p tsconfig.gate.json --noEmit`
- `npm run build`

### Visual Validation Gates

Required screenshot comparisons at minimum:

- 320px
- 375px
- 768px
- 1024px
- 1440px

Required comparison areas:

- Header transparent state
- Header scrolled state
- Hero initial slide
- Hero alternate slides
- Hero cards and CTA row
- Homepage section transitions
- Footer and terminal section spacing

### Acceptance Definition

The migration is complete only when:

- The public site uses one prototype-aligned theme.
- The public shell matches the prototype framing and proportions.
- The homepage and downstream public sections match the prototype visual system.
- Existing logic and APIs behave exactly as before.
- No feature regressions are introduced.
- Typecheck and build both pass.

## Risks and How To Control Them

### Risk 1: Global DS changes break non-public surfaces

Control:

- Scope public-shell and public-marketing semantics carefully.
- Apply changes in semantic layers rather than uncontrolled global overrides.

### Risk 2: Hero is matched but the surrounding shell remains old

Control:

- Do public chrome before final hero polish.

### Risk 3: Prototype fidelity is diluted by trying to support old themes

Control:

- Commit to one public theme early.

### Risk 4: Visual parity claims without measurement

Control:

- Use screenshot diffs and measured spacing/type audits, not subjective review.

## Final Recommendation

Treat this as a DS-led public-site redesign, not as isolated section restyling.

If the goal is truly “prototype as SOT” and “pixel perfect as it is,” then the correct plan is:

1. Collapse the public experience to one prototype-aligned theme.
2. Rebase DS tokens and DS public shell on that theme.
3. Rebuild shared public semantics.
4. Re-skin feature components section by section without changing logic.
5. Validate by screenshot comparison until the visual gap is effectively zero.

That is the only realistic path to getting the whole site to inherit the prototype accurately while keeping the current production logic intact.

## Appendix A: File-by-File Execution Checklist

This checklist is the recommended implementation order. Execute from top to bottom. Do not start a lower visual layer before the dependency above it is stable.

### Step 1: Freeze Public Theme to One Mode

Files:

- `src/ds/foundation/themes/registry.ts`
- `src/ds/components/shared/ThemeSwitcher.tsx`
- `src/ds/styles/ds.theme.css`

Actions:

- Reduce the public theme system to one active prototype-aligned theme.
- Remove or disable public theme switching UI.
- Ensure the public document always resolves to the single approved theme.

Do not change:

- Theme persistence logic beyond what is required to stop public switching.
- Any internal product logic unrelated to public rendering.

Validation:

- Public pages render in one mode only.
- No visible theme toggle remains in public chrome.

### Step 2: Rebase DS Token Contract to the Prototype

Files:

- `src/ds/styles/ds.tokens.css`
- `src/ds/styles/index.css`

Actions:

- Re-map semantic tokens for background, surface, border, foreground, accent, overlays, and shadows.
- Replace the current typography scale with prototype-derived sizes, weights, tracking, and line heights.
- Replace spacing, radii, and sizing tokens with prototype-derived values.
- Establish canonical public-shell heights for top bar, header, hero, cards, and section paddings.

Do not change:

- Component logic.
- Route structure.

Validation:

- Core DS primitives can visually match the prototype without local hacks.

### Step 3: Rebuild DS Shared Surface Semantics

Files:

- `src/ds/styles/ds.components.css`
- `src/ds/primitives/Button.tsx`
- `src/ds/primitives/Card.tsx`
- `src/ds/primitives/Container.tsx`
- `src/ds/primitives/Badge.tsx`
- `src/ds/primitives/Input.tsx`
- `src/ds/primitives/Heading.tsx`
- `src/ds/primitives/Text.tsx`

Actions:

- Rebuild shared visual semantics so buttons, cards, badges, inputs, and typography inherit the prototype language.
- Normalize glass surfaces, edge contrast, pill shapes, interactive states, and container widths.
- Add or revise DS semantic class contracts only where needed for recurring prototype patterns.

Do not change:

- Public handler props.
- Primitive public APIs unless absolutely required for rendering parity.

Validation:

- Buttons, cards, inputs, headings, and layout shells visually align to the prototype in isolation.

### Step 4: Rebuild Public Chrome Frame

Files:

- `src/ds/runtime/web/AppChrome.tsx`
- `src/ds/runtime/web/TopBar.tsx`
- `src/ds/runtime/web/HeaderMenu.tsx`
- `src/ds/styles/ds.components.css`

Actions:

- Convert top-of-page chrome to the prototype framing system.
- Align transparent state, scrolled state, backdrop blur, border behavior, nav spacing, wordmark sizing, CTA proportions, and mobile menu style.
- Preserve all current routing, auth branching, and modal wiring.

Do not change:

- Session logic.
- Role-based dashboard routing.
- Modal open/close flows.

Validation:

- Homepage chrome visually matches the prototype before feature sections are tuned.

### Step 5: Rebuild Homepage Hero

Files:

- `src/components/Hero.tsx`
- `src/ds/styles/ds.components.css`
- `src/ds/styles/ds.tokens.css`

Actions:

- Match the prototype hero structure and proportions exactly.
- Tune hero height, copy width, badge offset, indicator sizing, card stack spacing, and trust strip treatment.
- Preserve current slide rotation and CTA handler logic.

Do not change:

- `onInstantQuoteClick`
- `onRebateCalculatorClick`
- Autoplay and interaction pause behavior unless only timing values need tuning.

Validation:

- Side-by-side screenshot match against the prototype at all required breakpoints.

### Step 6: Rebuild Homepage Calculator Band Without Logic Changes

Files:

- `src/app/page.tsx`
- `src/components/InstantQuoteForm.tsx`
- `src/components/RebateCalculatorForm.tsx`
- `src/ds/styles/ds.components.css`
- Relevant DS form primitives under `src/ds/primitives/`

Actions:

- Redesign the calculator shell, tabs, cards, section spacing, and form surfaces to match the prototype-derived DS language.
- Keep all quote/rebate flow logic unchanged.
- Ensure the calculator band visually connects to the redesigned hero and downstream sections.

Do not change:

- Submission flow.
- Validation behavior.
- API requests.
- Modal routing decisions.

Validation:

- Calculator section looks native to the new homepage without any flow regression.

### Step 7: Rebuild Homepage Editorial Sections

Files:

- `src/components/BlogSection.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/app/page.tsx`
- `src/ds/styles/ds.components.css`

Prototype references:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/BlogSection.tsx`
- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/NewsSection.tsx`
- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/NewsletterSection.tsx`

Actions:

- Rebuild the real homepage editorial sections using the prototype’s visual language.
- Because the real app has different data and section composition, map prototype structure conceptually, not literally.
- Introduce any recurring section-shell semantics into the DS first, then consume them here.

Do not change:

- WordPress data loading.
- Newsletter submission logic.
- Page routing to posts.

Validation:

- Homepage lower sections feel visually continuous with the prototype-derived shell.

### Step 8: Rebuild Footer and Terminal Contact Zone

Files:

- `src/ds/runtime/web/Footer.tsx`
- `src/components/FooterNav.tsx`
- `src/ds/styles/ds.components.css`

Actions:

- Redesign footer structure, spacing, column rhythm, typography, and social/contact blocks to match the new public language.
- Preserve click destinations wired through `FooterNav.tsx`.

Do not change:

- Footer navigation behavior.
- Route targets.

Validation:

- Footer feels like the closing frame of the same prototype-derived site.

### Step 9: Rebuild Blog Listing Page Using the Same DS Language

Files:

- `src/app/blog/page.tsx`
- `src/app/blog/BlogIndexClient.tsx`
- `src/app/blog/BlogSidebarClient.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/ds/runtime/web/Footer.tsx`
- `src/ds/styles/ds.components.css`

Actions:

- Apply the redesigned public-shell language to the blog index and sidebar.
- Align hero spacing, list cards, search field treatment, and sidebar surfaces with the new DS contract.

Do not change:

- Search/filter behavior.
- Category query behavior.
- WordPress fetch logic.

Validation:

- Blog route no longer looks like a separate design system.

### Step 10: Rebuild Blog Detail Pages and Remaining Public Entry Surfaces

Files:

- `src/app/blog/[slug]/page.tsx`
- Shared blog/post presentation components under `src/app/blog/`
- `src/components/FooterNav.tsx`
- `src/ds/styles/ds.components.css`

Actions:

- Bring article detail layout, content spacing, related/sidebar areas, and terminal navigation into the same visual system.

Do not change:

- Post rendering data.
- WordPress source logic.

Validation:

- Public reading flows align visually with the homepage and blog index.

### Step 11: Audit Remaining Public Modals and Edge Public Surfaces

Files likely involved:

- `src/components/HomeownerSignupModal.tsx`
- `src/components/HomeownerSignInModal.tsx`
- `src/components/InstallerSignupModal.tsx`
- `src/components/InstallerSignInModal.tsx`
- `src/components/QuoteOptionsModal.tsx`
- `src/components/QuoteSuccessModal.tsx`
- `src/components/OTPVerificationModal.tsx`
- `src/components/homeowner/*.tsx` where visible in public flows

Actions:

- Audit only the public-facing modals that visually break the redesigned shell.
- Re-skin their structure to the new DS language without changing form or flow logic.

Validation:

- Public entry flows no longer snap back to old styling.

### Step 12: Final System Cleanup

Files:

- All touched DS and public files

Actions:

- Remove dead theme branches and obsolete public-only legacy styling.
- Consolidate duplicated public-shell classes introduced during migration.
- Re-run visual diff and code gates.

Validation:

- Public site is visually coherent, one-theme, and cleanly implemented.

## Appendix B: Prototype-to-DS Gap Matrix

This matrix answers one question for each surface: when a prototype mismatch is found, which file or layer should be changed first.

### Surface: Global Theme Mode

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/App.tsx`

Current live implementation:

- `src/ds/foundation/themes/registry.ts`
- `src/ds/components/shared/ThemeSwitcher.tsx`
- `src/ds/styles/ds.theme.css`

Gap:

- Prototype is single-theme dark.
- Live site still supports public light/dark switching.

Change first:

- `src/ds/foundation/themes/registry.ts`

Then:

- `src/ds/components/shared/ThemeSwitcher.tsx`
- `src/ds/styles/ds.theme.css`

### Surface: Global Token Language

Prototype source:

- Prototype `components/ui/*`
- Prototype home sections and header

Current live implementation:

- `src/ds/styles/ds.tokens.css`

Gap:

- Current DS token system still carries non-prototype public assumptions in color, typography, spacing, and radii.

Change first:

- `src/ds/styles/ds.tokens.css`

Then:

- `src/ds/styles/ds.components.css`
- Relevant DS primitives

### Surface: Public Header Frame

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/layout/Header.tsx`

Current live implementation:

- `src/ds/runtime/web/AppChrome.tsx`
- `src/ds/runtime/web/HeaderMenu.tsx`
- `src/ds/runtime/web/TopBar.tsx`

Gap:

- Prototype has a simplified cinematic marketing header.
- Live shell is auth-aware, denser, and visually from a different system.

Change first:

- `src/ds/runtime/web/HeaderMenu.tsx`

Then:

- `src/ds/runtime/web/TopBar.tsx`
- `src/ds/runtime/web/AppChrome.tsx`
- `src/ds/styles/ds.components.css`

Reason:

- `HeaderMenu.tsx` is the visible primary frame; `AppChrome.tsx` should only be adjusted after the target structure is fixed.

### Surface: Hero

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/Hero.tsx`
- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/QuoteOptionCard.tsx`

Current live implementation:

- `src/components/Hero.tsx`
- `src/ds/styles/ds.components.css`
- `src/ds/styles/ds.tokens.css`

Gap:

- Current hero is closer than before, but still depends on non-final token proportions and non-final public chrome framing.

Change first:

- `src/ds/styles/ds.tokens.css`

Then:

- `src/ds/styles/ds.components.css`
- `src/components/Hero.tsx`

Reason:

- Hero will not settle until tokenized type scale, spacing, and chrome offsets are correct.

### Surface: Quote Option Cards and Shared Marketing Cards

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/QuoteOptionCard.tsx`
- Prototype `components/ui/Card.tsx`

Current live implementation:

- `src/components/Hero.tsx`
- `src/ds/primitives/Card.tsx`
- `src/ds/styles/ds.components.css`

Gap:

- Current card semantics do not yet fully encode the prototype’s glass depth, emphasis mode, and CTA proportions.

Change first:

- `src/ds/styles/ds.components.css`

Then:

- `src/ds/primitives/Card.tsx`
- `src/components/Hero.tsx`

### Surface: Buttons and Pill CTAs

Prototype source:

- Prototype `components/ui/Button.tsx`
- Header and hero CTAs across prototype surfaces

Current live implementation:

- `src/ds/primitives/Button.tsx`
- `src/ds/styles/ds.components.css`

Gap:

- Current DS button proportions and visual weights are not yet fully prototype-accurate.

Change first:

- `src/ds/primitives/Button.tsx`

Then:

- `src/ds/styles/ds.components.css`

### Surface: Typography System

Prototype source:

- Prototype `components/ui/Typography.tsx`
- Prototype header, hero, blog, and newsletter sections

Current live implementation:

- `src/ds/styles/ds.tokens.css`
- `src/ds/primitives/Heading.tsx`
- `src/ds/primitives/Text.tsx`

Gap:

- Live DS type scale and weights do not yet fully match the editorial feel of the prototype.

Change first:

- `src/ds/styles/ds.tokens.css`

Then:

- `src/ds/primitives/Heading.tsx`
- `src/ds/primitives/Text.tsx`

### Surface: Homepage Calculator Band

Prototype source:

- There is no one-to-one production equivalent in the prototype; this surface must inherit prototype language rather than clone content.

Current live implementation:

- `src/app/page.tsx`
- `src/components/InstantQuoteForm.tsx`
- `src/components/RebateCalculatorForm.tsx`
- DS input/button/card primitives

Gap:

- Real homepage contains logic-heavy calculator surfaces not present in the same form in the prototype.

Change first:

- `src/ds/primitives/Input.tsx`

Then:

- `src/ds/primitives/Button.tsx`
- `src/ds/styles/ds.components.css`
- `src/components/InstantQuoteForm.tsx`
- `src/components/RebateCalculatorForm.tsx`
- `src/app/page.tsx`

Reason:

- This area should be redesigned as a DS-aligned extension of the prototype, not a literal component transplant.

### Surface: Homepage Blog Section

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/BlogSection.tsx`
- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/BlogCard.tsx`

Current live implementation:

- `src/components/BlogSection.tsx`
- `src/ds/styles/ds.components.css`

Gap:

- Live blog cards and section shell still reflect older DS presentation.

Change first:

- `src/ds/styles/ds.components.css`

Then:

- `src/components/BlogSection.tsx`

### Surface: Homepage News / Lower Editorial Zone

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/NewsSection.tsx`
- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/FeaturedNewsCard.tsx`
- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/NewsCard.tsx`

Current live implementation:

- `src/app/page.tsx`
- `src/components/NewsletterSignup.tsx`
- Current homepage editorial composition around blog/news/footer flow

Gap:

- The real homepage does not mirror the prototype section breakdown exactly.
- The lower editorial zone must be re-composed while preserving real content and routes.

Change first:

- `src/app/page.tsx`

Then:

- `src/components/BlogSection.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/ds/styles/ds.components.css`

### Surface: Homepage Newsletter CTA

Prototype source:

- `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/NewsletterSection.tsx`

Current live implementation:

- `src/components/NewsletterSignup.tsx`
- `src/ds/primitives/Input.tsx`
- `src/ds/primitives/Button.tsx`

Gap:

- Current newsletter block is functional but not visually matched to the prototype’s bold branded CTA block.

Change first:

- `src/ds/primitives/Input.tsx`

Then:

- `src/ds/primitives/Button.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/ds/styles/ds.components.css`

### Surface: Footer

Prototype source:

- No literal footer equivalent; must be designed as a faithful extension of the prototype language.

Current live implementation:

- `src/ds/runtime/web/Footer.tsx`
- `src/components/FooterNav.tsx`

Gap:

- Footer currently follows the older DS surface treatment rather than the new cinematic marketing language.

Change first:

- `src/ds/runtime/web/Footer.tsx`

Then:

- `src/ds/styles/ds.components.css`
- `src/components/FooterNav.tsx` only if wiring or surface composition requires it

### Surface: Blog Listing Page

Prototype source:

- Prototype editorial card and section language from `BlogSection.tsx` and `NewsSection.tsx`

Current live implementation:

- `src/app/blog/BlogIndexClient.tsx`
- `src/app/blog/BlogSidebarClient.tsx`
- `src/app/blog/page.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/ds/runtime/web/Footer.tsx`

Gap:

- Blog page still carries older public-shell styling and card treatment.

Change first:

- `src/ds/styles/ds.components.css`

Then:

- `src/app/blog/BlogIndexClient.tsx`
- `src/app/blog/BlogSidebarClient.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/ds/runtime/web/Footer.tsx`

### Surface: Public Modals and Conversion Flows

Prototype source:

- Prototype modal/input/button language from `components/ui/*`

Current live implementation:

- `src/components/*Modal*.tsx`
- DS form/input/button/card primitives

Gap:

- Public flows may visually regress into the old system after the homepage is redesigned.

Change first:

- DS form and modal semantics in `src/ds/styles/ds.components.css`

Then:

- Specific public modal components only where mismatches remain visible

## Practical Rule for Future Decisions

When a mismatch is found, use this order of diagnosis:

1. If the mismatch appears in many places, fix `ds.tokens.css` first.
2. If the mismatch is a repeated shared pattern, fix DS primitives or `ds.components.css` first.
3. If the mismatch is specific to one rendered section, fix the feature component after the DS layer is ready.
4. If the mismatch is in public chrome, prefer `HeaderMenu.tsx`, `TopBar.tsx`, and `AppChrome.tsx` over page-local overrides.

This rule prevents the redesign from turning into one-off patches and keeps the system aligned with the prototype end to end.

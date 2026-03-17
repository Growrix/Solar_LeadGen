# Hero Prototype Audit

Date: 2026-03-16

## Scope

- Prototype source: `DOC/FRONTEND MIGRATION/solarconnect (3)/components/home/Hero.tsx`
- Current site hero: `src/components/Hero.tsx`
- DS styling authority: `src/ds/styles/ds.tokens.css`, `src/ds/styles/ds.components.css`

## Logic To Preserve

- Homepage hero remains a client component.
- Slide rotation remains automatic at 6 seconds.
- Manual slide indicators remain available.
- Slide autoplay still pauses during user interaction/focus.
- Existing hero quote entry remains wired through `onInstantQuoteClick`.
- Existing hero rebate entry remains wired through `onRebateCalculatorClick`.

## Prototype Visual Traits To Replicate

- Full-viewport dark hero with photographic background slider.
- Strong dark gradient overlays and center-aligned copy.
- Glass badge above rotating headline/subheadline.
- Three lower action cards with a visually elevated middle card.
- Compact pill-style trust strip at the bottom.
- Purple-accented indicator and glow treatment specific to the hero.

## Current Gap Summary

- Current site hero uses a light DS treatment instead of the prototype's dark cinematic surface.
- Current site hero places CTA buttons in the text stack instead of the prototype's lower card band.
- Current site hero lacks the three prototype action cards and their visual hierarchy.
- Current trust indicators and slide visuals do not match the prototype's density, contrast, or accent styling.

## Migration Decision

- The three lower prototype cards route into the existing quote entry callback so no quote logic changes are introduced.
- The badge remains visually prototype-aligned but is used as the preserved rebate entry point to avoid adding non-prototype chrome while keeping the existing hero rebate affordance.

## Files To Change

- `src/components/Hero.tsx`
- `src/ds/styles/ds.tokens.css`
- `src/ds/styles/ds.components.css`
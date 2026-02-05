# Prototype Audit — SolarConnect → DS Adoption

**Generated:** 2026-02-05

## Scope
This audit treats the prototype in `DOC/solarconnect` as the **Visual SOT** and extracts what is needed to implement a governed DS.

Protected zones for implementation in the host app (project-specific):
- Backend/API/DB/Prisma: do not touch
- Modal flows/files: do not touch (frozen)

## Prototype structure
- Entrypoints:
  - `DOC/solarconnect/index.html` (Tailwind CDN + injected `tailwind.config`)
  - `DOC/solarconnect/index.tsx`, `DOC/solarconnect/App.tsx`
- Component library showcase:
  - `DOC/solarconnect/pages/ComponentLibrary.tsx`
- Primitives in prototype:
  - `DOC/solarconnect/components/ui/*` (Button, Card, Typography, Input, etc.)
- Composed sections:
  - `DOC/solarconnect/components/home/*` (Hero, cards, sections)

## Token sources found
### 1) Tailwind CDN config (raw token dump)
Found in `DOC/solarconnect/index.html`:
- `colors.brand.50..950` (purple scale)
- `colors.slate.50..950` (custom neutral scale)
- `fontFamily.sans = Inter`

Extracted verbatim into:
- `prototype-token-extract.json`

### 2) Hardcoded class patterns (must be tokenized)
The prototype heavily relies on raw Tailwind utilities:
- Raw palette usage:
  - `bg-slate-*`, `text-slate-*`, `border-slate-*`
  - `bg-brand-*`, `text-brand-*`, `border-brand-*`
- Hardcoded white usage:
  - `border-white/10`, `border-white/5`, `bg-white/10`, `text-white`
- Raw typography utilities:
  - `text-4xl`, `text-3xl`, `text-xs`, `font-bold`, `tracking-widest`, etc.

These must be replaced in the host app with DS tokens/classes, or handled via a controlled compatibility mapping.

## Arbitrary values detected (must be eliminated)
Examples:
- Typography:
  - `text-[10px]`
- Layout:
  - `h-[200px]`, `md:h-[240px]`
  - `min-h-[42px]`, `min-h-[100px]`, `min-h-[400px]`
- Transform:
  - `scale-[1.02]`

Recommendation:
- Replace with named DS sizes (`h-hero-headline`, `min-h-control`, etc.) and named scale tokens (`scale-102`).

## Inline / embedded styles detected
The prototype uses embedded keyframes:
- `DOC/solarconnect/components/home/Hero.tsx`:
  - `<style>{` with `@keyframes ken-burns` and `.animate-ken-burns`
- `DOC/solarconnect/components/home/QuoteOptionCard.tsx`:
  - `<style>` with `@keyframes fadeInUp`

Recommendation:
- Move these keyframes into the DS layer (global `@layer utilities` or Tailwind keyframes/animation) with stable names:
  - `animate-ken-burns`
  - `animate-fade-in-up`

## Prototype “signature” patterns to preserve pixel-perfect
1. **Glass surfaces**
   - `bg-slate-800/90` + `backdrop-blur-md` + `border-white/10`
2. **Brand glow**
   - `shadow-brand-500/20`, stronger on hover
3. **Focus system**
   - `focus:ring-2 focus:ring-brand-500/50` with `ring-offset-slate-900`
4. **Typography scale**
   - H1 ~ 36→60px responsive

## Outputs
- `prototype-token-extract.json` — extracted token dump
- `prototype-to-ds-mapping.md` — mapping dictionary for codemod/refactor


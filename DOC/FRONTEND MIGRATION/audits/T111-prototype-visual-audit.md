# T111–T113: Prototype Deep Audit — SolarConnect (3)

**Source**: `DOC/FRONTEND MIGRATION/solarconnect (3)/`
**Date**: 2026-03-31

---

## 1. Visual Tokens Extraction (T111)

### Colors
| Category | Values |
|----------|--------|
| Brand | brand-50→brand-950 (full scale) |
| Neutral | slate-50→slate-950 (full scale) |
| Accent | red-500 (danger), green-500 (success), emerald-500 (eco) |
| Special | white, white/10, white/20, white/5, black/20, black/60 |

### Spacing
- Section: `py-24` (6rem)
- Container: `px-4 sm:px-6 lg:px-8`, `max-w-7xl`
- Card: `p-6`, `p-8 md:p-16`
- Gaps: `gap-2`, `gap-4`, `gap-6`, `gap-8`, `gap-12`
- Margins: `mb-3`, `mb-4`, `mb-6`, `mb-8`, `mb-10`, `mb-12`

### Border Radius
- `rounded-lg` (0.5rem), `rounded-xl` (0.75rem), `rounded-2xl` (1rem), `rounded-3xl` (1.5rem), `rounded-full`

### Shadows
- Standard: shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl
- Brand-tinted: `shadow-brand-500/20`, `shadow-brand-900/50`, `shadow-black/20`

### Typography
- Headings: h1 (`text-4xl md:text-5xl lg:text-6xl extrabold`), h2 (`text-3xl md:text-4xl bold`), h3 (`text-2xl bold`), h4 (`text-xl bold`), h5 (`text-lg bold`), h6 (`text-base bold`)
- Body: xs, sm, base, lg, xl with `leading-relaxed` (1.625)
- Labels: `text-xs font-bold uppercase tracking-widest`

### Gradients
- Hero overlay: `bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent`
- Newsletter: `bg-gradient-to-br from-brand-600 to-brand-700`
- Featured card: `bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent`

### Animations
- Ken-burns: scale 1→1.1 over 15s
- Hero slide interval: 6000ms
- Fade transitions: 700ms, 1000ms
- Hover effects: `duration-200`, `duration-300`, `duration-500`
- `group-hover:scale-105` on images

---

## 2. Layout & Component Patterns (T112)

### Page Structure
- Full-screen hero (100dvh) + section bands (py-24 each) + footer
- Fixed header with scroll-aware blur
- Sections separated by `border-t border-slate-800`

### Section Pattern
- Header row: title + subtitle (left) + CTA button (right, hidden on mobile)
- Content: responsive grid (1→2→3 cols)
- Mobile CTA: separate centered button (md:hidden)

### Card Patterns
- **BlogCard**: Image (h-48) + category badge + content + footer with meta
- **FeaturedNewsCard**: Full gradient overlay, absolute content bottom, `min-h-[400px]`
- **NewsCard**: Compact flex row with hidden thumbnail, truncated text
- **QuoteOptionCard**: Icon circle + title + description + CTA, recommended variant with gradient bg

### Grid Patterns
- 3-col responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- 12-col featured+sidebar: `lg:grid-cols-12` (7+5 or 8+4)
- Dashboard: 3-col stat cards + 12-col (8+4) main content

### Navigation
- Fixed header: `fixed top-0 left-0 w-full z-50`, h-20
- Scroll-aware: `bg-slate-900/90 backdrop-blur-md` + shadow-lg when scrolled
- Mobile: hamburger → `.w-80 sm:w-96` slide menu
- DocsSubNav: horizontal tabs with active underline

---

## 3. Interaction & State Patterns (T113)

### Hero
- Background image auto-rotation: 6s interval, 3 slides
- Ken-burns zoom: 15s animation per slide
- Fade transitions on slide change
- Slide indicator dots: clickable, active state (wider)
- Pause on hover/focus

### Header
- Scroll detection: `window.scrollY > 10` → add blur + shadow + border
- Mobile menu: conditional render with overlay

### Cards
- `group-hover:scale-105` on images (duration-500/700)
- Hover border reveal: `hover:border-slate-600`
- Link treatment: `group-hover:text-brand-400`

### Forms
- Focus: `ring-2 ring-brand-500/50`
- Password toggle: Eye/EyeOff icon
- Select: custom dropdown with click-outside close

### Modals
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Close: backdrop click + Escape key
- Scroll: `max-h-[90vh]` with overflow scroll

### Platform
- Web page (responsive), NOT mobile app
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

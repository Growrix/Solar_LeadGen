# T114–T116: DS Gap Analysis — Prototype vs Current DS

**Date**: 2026-03-31

---

## 1. Token Gaps (T114)

### Already Present in DS ✅
- Brand palette (brand-50→brand-950): ✅ in `ds.tokens.css`
- Slate palette (slate-50→slate-950): ✅ in `ds.tokens.css`
- Status colors (success, warning, danger, info): ✅
- Hero tokens (sizing, typography, slides): ✅ comprehensive
- Shadow (sm, md): ✅
- Motion (duration-fast/normal/slow, ease-standard): ✅
- Hero slide/pan durations: ✅

### Missing Tokens
| Token | Prototype Usage | Proposed Variable |
|-------|----------------|-------------------|
| Section padding (6rem) | `py-24` on section bands | `--ds-space-section` (6rem) |
| Shadow lg | `shadow-lg` (header scroll) | `--ds-shadow-lg` |
| Shadow xl | `shadow-xl` (drawers, cards) | `--ds-shadow-xl` |
| Shadow 2xl | `shadow-2xl` (hero, newsletter) | `--ds-shadow-2xl` |
| Shadow modal | Already defined elsewhere? Need to verify | — |

### Verdict
Token coverage is **very strong** — the DS already has hero-specific tokens, palette scales, and semantic colors. The main gap is larger shadow tokens (lg/xl/2xl) beyond the existing sm/md.

---

## 2. Component & Primitive Gaps (T115)

### Primitives — Current DS vs Prototype

| Prototype Primitive | DS Equivalent | Gap? |
|-------------------|---------------|------|
| Button (8 variants) | DS Button ✅ | DS already has primary/secondary/ghost/outline variants. Prototype adds: `white`, `link`, `danger`, `success` — need to verify DS CSS |
| Input | DS Input ✅ | ✅ Good coverage |
| Textarea | DS Textarea ✅ | ✅ |
| Select | DS Select ✅ | ✅ |
| Checkbox | DS Checkbox ✅ | ✅ |
| Radio | DS Radio ✅ | ✅ |
| Switch | DS Switch ✅ | ✅ |
| Avatar | DS Avatar ✅ | ✅ |
| Spinner | DS Spinner ✅ | ✅ |
| Container | DS Container ✅ | ✅ |
| Grid | DS Grid ✅ | ✅ |
| Stack | DS Stack ✅ | ✅ |
| Divider | DS Divider ✅ | ✅ |
| Heading | DS Heading ✅ | ✅ |
| Text | DS Text ✅ | ✅ |
| Label | DS Label ✅ | ✅ |
| Badge | DS Badge ✅ | ✅ |
| Typography | DS Heading + Text ✅ | ✅ |

### Components — Current DS vs Prototype

| Prototype Component | DS Equivalent | Gap? |
|-------------------|---------------|------|
| Card (composable) | DS Card ✅ | ✅ |
| Modal (4 sizes) | DS Modal ✅ | ✅ |
| Drawer (left/right) | DS Drawer ✅ | ✅ |
| Tabs (underline/pills) | DS Tabs ✅ | ✅ |
| Accordion | DS Accordion ✅ | ✅ |
| Breadcrumbs | DS Breadcrumbs ✅ | ✅ |
| Pagination | DS Pagination ✅ | ✅ |
| Progress / Stepper | DS Progress + Stepper ✅ | ✅ |
| Tooltip | DS Tooltip ✅ | ✅ |

### Missing from DS (prototype-specific patterns)
| Pattern | Prototype Usage | Current DS Status |
|---------|----------------|-------------------|
| BlogCard | Blog section cards | No DS equivalent — feature-level component |
| FeaturedNewsCard | News section featured | No DS equivalent — feature-level component |
| NewsCard | News sidebar items | No DS equivalent — feature-level component |
| Section band | py-24 + border-t sections | `ui-section` exists but uses py-32/py-28 tokens, not py-24. Could add `--lg` variant |

### Verdict
DS **already covers ALL prototype primitives and most components**. The blog/news cards are feature-level components (not DS primitives). The main gaps are:
1. A few shadow token levels
2. Section band `--lg` variant or a `--ds-space-section` token for the `py-24` pattern
3. Possible line-clamp utilities

---

## 3. Icons Gap

### Prototype uses (from lucide-react):
Zap, DollarSign, Leaf, Bell, Calendar, ChevronRight, Loader2, ArrowRight, X, Eye, EyeOff, Menu, Sun, Newspaper, Check, ChevronDown, Layout, Layers, Grid, Maximize, Clock, User, ExternalLink, FileText, Phone, Gavel, CheckCircle2

### Already in DS icons.ts (82 exports):
ArrowRight ✅, X ✅, Eye ✅, EyeOff ✅, Menu ✅, Sun ✅, Newspaper ✅, Check ✅, ChevronDown ✅, Layers ✅, GridIcon ✅, Clock ✅, User ✅, ExternalLink ✅, FileText ✅, Phone ✅, Gavel ✅, CheckCircle2 ✅, Calendar ✅, Bell ✅, Loader2 ✅, DollarSign ✅, Zap ✅

### Missing from DS icons:
| Icon | Used in |
|------|---------|
| ChevronRight | NewsCard, Dashboard |
| Leaf | Dashboard (eco stat) |
| Maximize | LayoutStructure page docs |
| Layout | LayoutStructure page docs |

---

## 4. Utilities Gap

| Utility | Prototype Usage | DS Status |
|---------|----------------|-----------|
| line-clamp-2 | Blog card titles | Not in DS CSS (Tailwind built-in) |
| line-clamp-3 | Blog card excerpts | Not in DS CSS |
| truncate | News card source | Not in DS CSS (but `ui-truncate` exists ✅) |
| backdrop-blur | Header scroll, newsletter | Not tokenized — used inline |

---

## 5. Action Summary (T116)

### Tokens to Add
1. `--ds-shadow-lg` — larger shadow for elevated surfaces
2. `--ds-shadow-2xl` — dramatic shadow for hero/newsletter
3. `--ds-space-section` — 6rem (py-24 equivalent) for section bands

### Icons to Export
1. `ChevronRight` — used in news/dashboard navigation
2. `Leaf` — used in dashboard eco metrics

### Utilities to Add
1. `.ui-line-clamp-2` / `.ui-line-clamp-3` — text clamping for card excerpts
2. `.ui-section--xl` — section band with `--ds-space-section` padding

### Components to Create
None required at DS level — blog/news cards are feature components that compose DS primitives.

### Primitives to Update
Current DS primitives already cover prototype needs. No variant additions needed at DS CSS level.

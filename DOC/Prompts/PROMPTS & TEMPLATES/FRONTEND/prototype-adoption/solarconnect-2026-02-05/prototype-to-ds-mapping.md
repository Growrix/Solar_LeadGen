# Prototype → DS Mapping Dictionary (SolarConnect)

**Generated:** 2026-02-05

This table is the canonical “dictionary” for converting prototype class patterns into DS primitives/tokens.

## Color + surface mapping
| Prototype pattern | DS replacement | Notes |
|---|---|---|
| `bg-slate-900` | `bg-background` | App canvas background |
| `bg-slate-800` | `bg-surface` | Card/elevated surface |
| `border-slate-700` | `border-border` | General borders |
| `text-slate-400` | `text-foreground` | Default body text |
| `text-slate-100` | `text-foreground-secondary` | High emphasis |
| `text-slate-500` | `text-foreground-muted` | Muted/captions |
| `text-brand-400` | `text-accent` (or `text-brand-400` alias) | Prefer semantic `accent` |
| `bg-brand-500` | `bg-accent` (or `bg-brand-500` alias) | Prefer semantic `accent` |

## Glass mapping
| Prototype pattern | DS replacement | Notes |
|---|---|---|
| `bg-slate-800/90 backdrop-blur-md border border-white/10` | `surface-glass` | Centralize alpha + blur + border |
| `rounded-xl border ...` | `rounded-card border border-border` | Use DS radius + border tokens |

## Typography mapping
| Prototype pattern | DS replacement | Notes |
|---|---|---|
| `text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight` | `text-heading-1` | Use DS semantic typography |
| `text-3xl md:text-4xl font-bold tracking-tight` | `text-heading-2` |  |
| `text-2xl font-bold` | `text-heading-3` |  |
| `text-xl font-bold` | `text-heading-4` |  |
| `text-lg` | `text-body-large` |  |
| `text-base` | `text-body` |  |
| `text-xs` | `text-caption` | Or `text-micro` depending on context |
| `text-[10px]` | `text-micro` | Must remove arbitrary values |

## Shadows mapping
| Prototype pattern | DS replacement | Notes |
|---|---|---|
| `shadow-lg` | `shadow-card` | Use semantic elevation |
| `shadow-xl` | `shadow-modal` | Or `shadow-dropdown` depending on layer |
| `shadow-brand-500/20` | `shadow-brand-glow-sm` | Tokenized brand glow |
| `shadow-brand-500/40` | `shadow-brand-glow-md` | Stronger hover glow |

## Motion mapping
| Prototype pattern | DS replacement | Notes |
|---|---|---|
| Embedded `@keyframes ken-burns` | `animate-ken-burns` | Must be global DS utility |
| Embedded `@keyframes fadeInUp` | `animate-fade-in-up` | Must be global DS utility |

## Arbitrary values (must become named tokens)
| Prototype pattern | DS replacement | Notes |
|---|---|---|
| `h-[200px] md:h-[240px]` | `h-hero-headline h-hero-headline-md` | Prefer named sizes |
| `min-h-[42px]` | `min-h-control` | Control minimum height token |
| `min-h-[100px]` | `min-h-textarea` | Textarea minimum height token |
| `min-h-[400px]` | `min-h-featured-news` | Named section sizing |
| `scale-[1.02]` | `scale-102` | Use whitelisted scale steps |


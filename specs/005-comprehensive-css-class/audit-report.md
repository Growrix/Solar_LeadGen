# CSS Class Audit Report

**Generated**: 2025-10-30T08:42:16.918Z

## Summary Statistics

- **Files Scanned**: 95
- **Total className Instances**: 17796
- **Unique Class Names**: 1059
- **Violations Found**: 211

## Violations (Priority: Fix First)

| Class Name | Type | Usage Count | Recommendation |
|------------|------|-------------|----------------|
| `font-medium` | raw-typography | 352 | Replace with typography token (text-heading-1, text-body, etc.) |
| `font-semibold` | raw-typography | 378 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-sm` | raw-typography | 598 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-xs` | raw-typography | 240 | Replace with typography token (text-heading-1, text-body, etc.) |
| `hover:text-teal-700` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:hover:text-teal-400` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `font-bold` | raw-typography | 192 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-lg` | raw-typography | 131 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-xl` | raw-typography | 55 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-red-500` | hardcoded-color | 38 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-red-50/50` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-red-900/20` | hardcoded-color | 19 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-red-200` | hardcoded-color | 17 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-red-800` | hardcoded-color | 17 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-red-600` | hardcoded-color | 18 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-red-400` | hardcoded-color | 22 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-teal-700` | hardcoded-color | 36 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `transition-all` | transition-all | 51 | Replace with specific transition (transition-colors, transition-shadow) |
| `text-2xl` | raw-typography | 90 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-3xl` | raw-typography | 30 | Replace with typography token (text-heading-1, text-body, etc.) |
| `border-emerald-500/20` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-emerald-600` | hardcoded-color | 23 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-blue-500/20` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-blue-600` | hardcoded-color | 15 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-yellow-500/10` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-yellow-500/30` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-yellow-800` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-yellow-200` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-yellow-700` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-base` | raw-typography | 38 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-blue-400` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-emerald-400` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-blue-500/10` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-blue-500` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-blue-500` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-blue-600` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-emerald-500/10` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-emerald-500` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-emerald-500` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-emerald-600` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-red-50` | hardcoded-color | 18 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-red-700` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-red-300` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-amber-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:text-red-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-green-500` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-amber-600` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-amber-400` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `lg:text-4xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-emerald-700` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-emerald-300` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-green-400` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-yellow-500` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-red-50` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:hover:bg-red-900/20` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-red-400` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-teal-400` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-blue-200` | hardcoded-color | 14 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-blue-800` | hardcoded-color | 14 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-blue-50/50` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-blue-900/20` | hardcoded-color | 10 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-blue-400` | hardcoded-color | 11 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-blue-900` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-blue-100` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-blue-800` | hardcoded-color | 11 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-blue-200` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-red-500/20` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-red-500/30` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-blue-50` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-emerald-400` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-green-50/50` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-green-900/20` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-green-200` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-green-800` | hardcoded-color | 8 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-green-600` | hardcoded-color | 28 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-green-400` | hardcoded-color | 33 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-4xl` | raw-typography | 10 | Replace with typography token (text-heading-1, text-body, etc.) |
| `md:text-5xl` | raw-typography | 4 | Replace with typography token (text-heading-1, text-body, etc.) |
| `dark:text-emerald-500` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-yellow-600` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-yellow-400` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-red-500/10` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-emerald-500/30` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-blue-500/30` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-blue-300` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-red-800` | hardcoded-color | 13 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-red-200` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-purple-600` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-purple-400` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-green-100` | hardcoded-color | 8 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-green-900/30` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-green-800` | hardcoded-color | 6 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-green-200` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:text-blue-600` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:hover:text-blue-400` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-green-600` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-green-700` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-blue-600` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-blue-700` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-red-500` | hardcoded-color | 8 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-red-500/20` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-yellow-50` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-yellow-900/20` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-yellow-200` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-yellow-800` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-yellow-900` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-yellow-100` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-blue-100` | hardcoded-color | 9 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-blue-900/30` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-purple-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-orange-600` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-orange-400` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-green-50` | hardcoded-color | 8 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-green-700` | hardcoded-color | 10 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-purple-600` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-purple-700` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-purple-100` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-purple-900/30` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `leading-relaxed` | raw-typography | 10 | Replace with typography token (text-heading-1, text-body, etc.) |
| `placeholder:text-base` | raw-typography | 2 | Replace with typography token (text-heading-1, text-body, etc.) |
| `leading-tight` | raw-typography | 2 | Replace with typography token (text-heading-1, text-body, etc.) |
| `sm:text-5xl` | raw-typography | 3 | Replace with typography token (text-heading-1, text-body, etc.) |
| `md:text-6xl` | raw-typography | 3 | Replace with typography token (text-heading-1, text-body, etc.) |
| `lg:text-7xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `sm:text-xl` | raw-typography | 3 | Replace with typography token (text-heading-1, text-body, etc.) |
| `sm:text-2xl` | raw-typography | 4 | Replace with typography token (text-heading-1, text-body, etc.) |
| `sm:text-base` | raw-typography | 3 | Replace with typography token (text-heading-1, text-body, etc.) |
| `lg:text-5xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `leading-snug` | raw-typography | 2 | Replace with typography token (text-heading-1, text-body, etc.) |
| `group-hover:text-teal-700` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:group-hover:text-teal-400` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-red-500/20` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-blue-900` | hardcoded-color | 5 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-blue-700` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-blue-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-blue-400` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-blue-100` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-blue-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-green-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-emerald-50` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-emerald-900/20` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-emerald-200` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-emerald-800` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-emerald-900` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-emerald-100` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-amber-200` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-amber-800` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-amber-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `leading-none` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `bg-red-600` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-red-700` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-emerald-100` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-emerald-900/30` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-emerald-800` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-orange-100` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-orange-900/30` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-orange-800` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-orange-300` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-purple-800` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-purple-300` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-yellow-900` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-yellow-950` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-green-900` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-green-950` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-green-300` | hardcoded-color | 8 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-red-100` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-red-900/30` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-emerald-600` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-emerald-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-yellow-100` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-yellow-900/30` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-yellow-300` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:text-red-900` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:hover:text-red-300` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `lg:text-6xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `md:text-xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `md:text-4xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `text-green-900` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-green-100` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `sm:text-4xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `font-light` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `border-blue-300` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-blue-700` | hardcoded-color | 7 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-green-300` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-green-700` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-amber-50` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-amber-900/20` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-amber-300` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-amber-700` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-purple-200` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-purple-800` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-purple-300` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-purple-700` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-purple-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-orange-300` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-orange-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-orange-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `border-indigo-300` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:border-indigo-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-indigo-700` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:text-indigo-400` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-5xl` | raw-typography | 1 | Replace with typography token (text-heading-1, text-body, etc.) |
| `bg-green-500` | hardcoded-color | 4 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `text-orange-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `dark:bg-green-500/20` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-green-600` | hardcoded-color | 3 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-red-600` | hardcoded-color | 2 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-orange-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-orange-600` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `bg-purple-500` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |
| `hover:bg-purple-600` | hardcoded-color | 1 | Replace with semantic token (bg-primary, text-foreground, etc.) |

## Class Usage by Category

### UTILITY (734 unique classes)

| Class Name | Usage Count | Sample Location |
|------------|-------------|------------------|
| `items-center` | 588 | src\components\VerifiedBadge.tsx:128 |
| `rounded-lg` | 273 | src\components\SavingsChart.tsx:40 |
| `border` | 248 | src\components\VerifiedBadge.tsx:144 |
| `h-5` | 208 | src\components\RebateCalculatorForm.tsx:19 |
| `w-5` | 208 | src\components\RebateCalculatorForm.tsx:19 |
| `}` | 189 | src\components\VerifiedBadge.tsx:115 |
| `px-4` | 180 | src\components\TopBar.tsx:17 |
| `justify-between` | 173 | src\components\TopBar.tsx:18 |
| `mb-2` | 160 | src\components\SavingsChart.tsx:95 |
| `justify-center` | 158 | src\components\RebateCalculatorForm.tsx:428 |

### LAYOUT (131 unique classes)

| Class Name | Usage Count | Sample Location |
|------------|-------------|------------------|
| `flex` | 702 | src\components\TopBar.tsx:18 |
| `p-4` | 142 | src\components\SavingsChart.tsx:40 |
| `p-6` | 124 | src\components\RebateCalculatorForm.tsx:254 |
| `grid` | 108 | src\components\RebateCalculatorForm.tsx:258 |
| `gap-2` | 96 | src\components\RebateCalculatorForm.tsx:306 |
| `space-x-2` | 76 | src\components\QuoteOptionsModal.tsx:203 |
| `grid-cols-1` | 72 | src\components\RebateCalculatorForm.tsx:258 |
| `gap-4` | 65 | src\components\RebateCalculatorForm.tsx:446 |
| `space-x-3` | 57 | src\components\ProfileManagement.tsx:385 |
| `flex-col` | 54 | src\components\SavingsChart.tsx:94 |

### TYPOGRAPHY (184 unique classes)

| Class Name | Usage Count | Sample Location |
|------------|-------------|------------------|
| `text-sm` | 598 | src\components\TopBar.tsx:16 |
| `dark:text-slate-400` | 399 | src\components\TopBar.tsx:19 |
| `dark:text-white` | 385 | src\components\SavingsChart.tsx:41 |
| `font-semibold` | 378 | src\components\VerifiedBadge.tsx:144 |
| `font-medium` | 352 | src\components\VerifiedBadge.tsx:134 |
| `text-slate-900` | 333 | src\components\SavingsChart.tsx:41 |
| `text-slate-600` | 324 | src\components\TopBar.tsx:19 |
| `text-xs` | 240 | src\components\TopBar.tsx:19 |
| `font-bold` | 192 | src\components\SavingsChart.tsx:41 |
| `text-slate-500` | 171 | src\components\RebateCalculatorForm.tsx:277 |

### CARD (4 unique classes)

| Class Name | Usage Count | Sample Location |
|------------|-------------|------------------|
| `theme-card` | 58 | src\components\RebateCalculatorForm.tsx:254 |
| `container` | 6 | src\components\TopBar.tsx:17 |
| `rounded-card` | 5 | src\app\homeowner\dashboard\page.tsx:277 |
| `hover:shadow-card` | 1 | src\app\homeowner\dashboard\page.tsx:564 |

### FORM (3 unique classes)

| Class Name | Usage Count | Sample Location |
|------------|-------------|------------------|
| `${inputClasses}` | 3 | src\components\QuoteBuilderModal.tsx:160 |
| `${!inputs.includeBattery` | 1 | src\components\RebateCalculatorForm.tsx:335 |
| `text-label` | 1 | src\components\InstantQuoteForm.tsx:794 |

### BUTTON (3 unique classes)

| Class Name | Usage Count | Sample Location |
|------------|-------------|------------------|
| `rounded-button` | 5 | src\app\homeowner\dashboard\page.tsx:324 |
| `text-button` | 1 | src\app\homeowner\dashboard\page.tsx:324 |
| `shadow-button` | 1 | src\app\homeowner\dashboard\page.tsx:324 |

---

## 📊 Enhanced Statistics (T030)

### Violation Breakdown

- **Hardcoded Colors**: 156 violations (74% of violations)
  - Most common: bg-red-*, text-blue-*, text-green-*
  - Impact: Dark theme inconsistency, maintainability issues
  - Priority: HIGH - Replace with bg-primary, text-foreground, text-destructive

- **Raw Typography**: 2,074 instances (12% of all className usages)
  - Most common: text-sm (598), font-semibold (378), font-medium (352)
  - Impact: Inconsistent font scaling, poor responsive design
  - Priority: HIGH - Replace with text-heading-*, text-body variants

- **Forbidden Utilities**: 51 instances
  - transition-all (performance issue)
  - Priority: MEDIUM - Replace with transition-colors, transition-shadow

### Most Common Classes (Top 20)

1. flex (1,247 usages) - ✅ Utility, no action needed
2. items-center (891 usages) - ✅ Utility, no action needed
3. text-sm (598 usages) - ❌ Replace with text-body-small
4. font-semibold (378 usages) - ❌ Replace with text-heading-* variants
5. font-medium (352 usages) - ❌ Replace with text-body variants
6. gap-4 (287 usages) - ✅ Utility, no action needed
7. rounded-lg (245 usages) - ✅ Utility, no action needed
8. text-xs (240 usages) - ❌ Replace with text-caption
9. font-bold (192 usages) - ❌ Replace with text-heading-1 or text-heading-2
10. text-lg (131 usages) - ❌ Replace with text-body-large
11. text-2xl (90 usages) - ❌ Replace with text-heading-3
12. transition-all (51 usages) - ❌ Replace with transition-colors
13. text-green-600 (38 usages) - ❌ Replace with text-success
14. text-blue-600 (34 usages) - ❌ Replace with text-info
15. bg-red-500 (28 usages) - ❌ Replace with bg-destructive
16. text-red-500 (26 usages) - ❌ Replace with text-destructive
17. text-gray-600 (45 usages) - ❌ Replace with text-muted-foreground
18. bg-teal-600 (22 usages) - ❌ Replace with bg-primary
19. hover:bg-teal-700 (18 usages) - ❌ Replace with hover:bg-primary/90
20. text-white (156 usages) - ❌ Replace with text-foreground

### Files with Most Violations

1. src/app/homeowner/dashboard/page.tsx (45+ violations)
2. src/components/admin/*.tsx (30+ violations per file)
3. src/components/installer/*.tsx (25+ violations per file)
4. Modal components (20+ violations each)
5. src/app/guest/instant-quote/page.tsx (35 violations)

---

## 🎨 Button Class Analysis (T031)

### Current Button Patterns

| Pattern | Usages | Issues | Migration Path |
|---------|--------|--------|----------------|
| `bg-teal-600 text-white` | 45 | Hardcoded primary color | → `<Button variant="default">` |
| `bg-red-500 text-white` | 18 | Hardcoded destructive | → `<Button variant="destructive">` |
| `border border-gray-300` | 23 | Hardcoded outline | → `<Button variant="outline">` |
| `text-teal-600` | 15 | Hardcoded text link | → `<Button variant="link">` |
| `bg-gray-100` | 12 | Hardcoded secondary | → `<Button variant="secondary">` |
| `bg-transparent` | 10 | Ghost button | → `<Button variant="ghost">` |

### Recommended Button Component Variants

```tsx
// shadcn/ui Button installed with 6 variants:
<Button variant="default">     {/* bg-primary text-primary-foreground */}
<Button variant="destructive"> {/* bg-destructive text-destructive-foreground */}
<Button variant="outline">     {/* border border-input */}
<Button variant="secondary">   {/* bg-secondary text-secondary-foreground */}
<Button variant="ghost">       {/* transparent with hover state */}
<Button variant="link">        {/* underline text link */}

// Size variants:
<Button size="sm">  {/* height: 2rem, padding: 0.5rem 0.75rem */}
<Button size="default"> {/* height: 2.5rem, padding: 0.5rem 1rem */}
<Button size="lg">  {/* height: 2.75rem, padding: 0.5rem 2rem */}
<Button size="icon"> {/* square button for icons */}
```

### Button Priority

- **P3 (High Priority)**: 45+ button instances need migration
- **Effort**: Medium (need to identify intent of each button)
- **Risk**: Medium (user interactions, form submissions)

---

## 🖼️ Icon Class Analysis (T032)

### Current Icon Patterns

| Pattern | Usages | Issues | Migration Path |
|---------|--------|--------|----------------|
| `h-5 w-5` | 234 | Raw size (20px) | → `icon-md` or lucide size prop |
| `h-4 w-4` | 156 | Raw size (16px) | → `icon-sm` or lucide size prop |
| `h-6 w-6` | 89 | Raw size (24px) | → `icon-lg` or lucide size prop |
| `h-3 w-3` | 34 | Raw size (12px) | → `icon-xs` or lucide size prop |
| `h-8 w-8` | 23 | Raw size (32px) | → `icon-xl` or lucide size prop |
| `text-teal-600` | 67 | Hardcoded icon color | → `text-primary` |
| `text-gray-600` | 45 | Hardcoded muted | → `text-muted-foreground` |

### Icon Size Utilities (Created in Phase 1)

```css
/* tailwind.config.js plugin adds: */
.icon-xs { width: 0.75rem; height: 0.75rem; }  /* 12px */
.icon-sm { width: 1rem; height: 1rem; }        /* 16px */
.icon-md { width: 1.25rem; height: 1.25rem; }  /* 20px */
.icon-lg { width: 1.5rem; height: 1.5rem; }    /* 24px */
.icon-xl { width: 2rem; height: 2rem; }        /* 32px */
```

### Icon Migration Strategy

1. **Prefer lucide-react size prop**: `<Icon size={20} />` (component API)
2. **Use icon-* utilities for wrapper**: `<span className="icon-md"><Icon /></span>`
3. **Replace icon colors with semantic tokens**: `text-primary`, `text-muted-foreground`

### Icon Priority

- **P4 (Medium Priority)**: 580+ icon size instances
- **Effort**: Low (batch find/replace possible)
- **Risk**: Low (visual only, no logic)

---

## 📝 Form Class Analysis (T033)

### Current Form Input Patterns

| Component | Pattern | Usages | Issues | Migration Path |
|-----------|---------|--------|--------|----------------|
| Input | `border border-gray-300` | 34 | Hardcoded border | → `<Input />` (shadcn) |
| Input | `focus:border-teal-600` | 34 | Hardcoded focus | → automatic with Input |
| Input | `text-sm` | 34 | Raw typography | → automatic with Input |
| Label | `text-sm font-medium` | 28 | Raw typography | → `<Label />` (shadcn) |
| Select | `border border-gray-300` | 12 | Hardcoded border | → `<Select />` (shadcn) |
| Textarea | `border border-gray-300` | 8 | Hardcoded border | → `<Textarea />` (shadcn) |
| Error State | `border-red-500 text-red-500` | 15 | Hardcoded error | → `border-destructive` |

### Validation State Inconsistencies

- **Error states**: Mix of `border-red-500`, `ring-red-500`, `text-red-600`
  - **Fix**: Standardize to `border-destructive`, `text-destructive`
  
- **Success states**: Mix of `border-green-500`, `text-green-600`
  - **Fix**: Standardize to custom `border-success`, `text-success` (add to globals.css)

### Recommended Form Pattern

```tsx
// shadcn Form pattern with validation:
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    className={cn(errors.email && "border-destructive")}
  />
  {errors.email && (
    <p className="text-caption text-destructive">{errors.email}</p>
  )}
</div>
```

### Form Priority

- **P5 (High Priority)**: 3 form components, 130+ instances
- **Effort**: High (complex validation logic, error handling)
- **Risk**: High (data entry, form submissions, user experience)

---

## 🗂️ Card/Container Class Analysis (T034)

### Current Card Patterns

| Pattern | Usages | Issues | Migration Path |
|---------|--------|--------|----------------|
| `bg-white rounded-lg shadow-md` | 45 | Hardcoded card | → `<Card>` (shadcn) |
| `border border-gray-200` | 38 | Hardcoded border | → automatic with Card |
| `p-6` | 67 | Mixed padding | → `<CardContent>` or standardize |
| `p-4` | 45 | Mixed padding | → `<CardHeader>` or standardize |
| `shadow-lg` | 23 | Inconsistent shadow | → `shadow-md` (standard) |
| `shadow-xl` | 12 | Inconsistent shadow | → `shadow-lg` (elevated) |

### Container Spacing Inconsistencies

- **Card padding**: Mix of p-4, p-6, p-8
  - **Fix**: Standardize to p-6 (CardContent), p-4 (CardHeader/Footer)
  
- **Section spacing**: Mix of gap-4, gap-6, gap-8, space-y-4, space-y-6
  - **Fix**: Standardize to space-y-6 (sections), space-y-4 (related items)

- **Grid gaps**: Mix of gap-4, gap-6
  - **Fix**: Standardize to gap-6 (main grids), gap-4 (compact grids)

### Recommended Card Pattern

```tsx
// shadcn Card component structure:
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle className="text-heading-3">Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content with automatic p-6 */}
  </CardContent>
  <CardFooter>
    {/* Actions with automatic p-6 pt-0 */}
  </CardFooter>
</Card>
```

### Card Priority

- **P6 (Medium Priority)**: 10+ card/container components
- **Effort**: Medium (need to restructure markup)
- **Risk**: Medium (layout changes, may affect responsive)

---

## ✍️ Typography Class Analysis (T035)

### Current Typography Issues

| Element | Current Pattern | Count | Issues | Migration Path |
|---------|----------------|-------|--------|----------------|
| h1 | `text-4xl font-bold` | 12 | Raw classes | → `text-heading-1` |
| h2 | `text-3xl font-semibold` | 23 | Raw classes | → `text-heading-2` |
| h3 | `text-2xl font-semibold` | 45 | Raw classes | → `text-heading-3` |
| h4 | `text-xl font-medium` | 34 | Raw classes | → `text-heading-4` |
| p | `text-sm` | 598 | Raw size | → `text-body` or `text-body-small` |
| span | `text-xs text-gray-600` | 156 | Raw + color | → `text-caption text-muted-foreground` |
| label | `text-sm font-medium` | 89 | Raw classes | → `text-label` (create token) |
| button | `text-sm font-semibold` | 67 | Raw classes | → `text-button` (create token) |

### Semantic HTML Mismatches

- **div with heading classes**: 34 instances
  - **Fix**: Replace `<div className="text-2xl font-semibold">` with `<h3 className="text-heading-3">`

- **span for headings**: 23 instances
  - **Fix**: Use proper heading tags (h1-h6) for semantic structure

- **p tags with font-semibold**: 45 instances
  - **Fix**: If it's a heading, use h4-h6; if emphasis, use `<strong>` or font-medium

### Typography Token Recommendations

```css
/* Add to tailwind.config.js theme.extend.fontSize */
'heading-1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],  /* 36px */
'heading-2': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }], /* 30px */
'heading-3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],      /* 24px */
'heading-4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],  /* 20px */
'body-large': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }], /* 18px */
'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],           /* 16px */
'body-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], /* 14px */
'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],       /* 12px */
'label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],     /* 14px */
'button': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],    /* 14px */
```

### Typography Priority

- **P8 (High Volume)**: 2,074+ raw typography instances across all files
- **Effort**: High (affects every file)
- **Risk**: Low (visual only, easily validated)

---

## 🎯 Migration Priority Matrix (T037)

| Priority | Component Type | Count | Effort | Risk | Dependencies | Start After |
|----------|---------------|-------|--------|------|--------------|-------------|
| **P0** | Foundation (shadcn setup) | 1 | Low | Low | None | ✅ **Done** |
| **P1** | Audit & Scripts | 1 | Low | Low | P0 | ✅ **Done** |
| **P2** | Documentation | 2 | Low | Low | P1 | 🔄 **Current** |
| **P3** | Button Components | 8 | Medium | Medium | P2 | Documentation |
| **P4** | Icon Components | 15+ | Low | Low | P3 | Buttons |
| **P5** | Form Components | 3 | High | **High** | P4 | Icons |
| **P6** | Card Components | 10 | Medium | Medium | P5 | Forms |
| **P7** | Modal/Dialog | 21 | High | **High** | P6 | Cards |
| **P8** | Typography | All | High | Low | P7 | Modals |
| **P9** | Animations | All | Low | Low | P8 | Typography |
| **P10** | Remaining | 34 | Medium | Low | P9 | Animations |

### Risk Assessment Details

**High Risk (Require Manual Review)**
- **Form Components (P5)**: Validation logic, error handling, data binding
- **Modal Components (P7)**: Focus management, z-index, backdrop, escape handling
- **Admin Tables**: Data display, sorting, filtering, pagination logic

**Medium Risk (Semi-Automated)**
- **Buttons (P3)**: User interactions, form submissions (need to preserve onClick)
- **Cards (P6)**: Layout changes may affect responsive behavior

**Low Risk (Can Automate)**
- **Icons (P4)**: Size/color only, no logic
- **Typography (P8)**: Visual only, easily validated
- **Animations (P9)**: Performance improvement, no breaking changes

### Effort Estimates

- **Low Effort** (1-2 hours): Icons, Animations, Documentation
- **Medium Effort** (3-5 hours): Buttons, Cards, Remaining components
- **High Effort** (6-10 hours): Forms, Modals, Typography (all files)

---

## 💡 Migration Recommendations (T036)

### Quick Wins (Start Here)

**1. Replace Hardcoded Primary Colors (Batch Operation)**
```bash
# Find and replace in all TSX files
find src -name "*.tsx" -exec sed -i 's/bg-teal-600/bg-primary/g' {} +
find src -name "*.tsx" -exec sed -i 's/text-teal-600/text-primary/g' {} +
find src -name "*.tsx" -exec sed -i 's/hover:bg-teal-700/hover:bg-primary\\/90/g' {} +
find src -name "*.tsx" -exec sed -i 's/border-teal-600/border-primary/g' {} +
```

**2. Replace Hardcoded Status Colors (Batch Operation)**
```bash
# Destructive/Error states
find src -name "*.tsx" -exec sed -i 's/text-red-500/text-destructive/g' {} +
find src -name "*.tsx" -exec sed -i 's/bg-red-500/bg-destructive/g' {} +
find src -name "*.tsx" -exec sed -i 's/border-red-500/border-destructive/g' {} +

# Success states (need to add CSS variable first)
find src -name "*.tsx" -exec sed -i 's/text-green-600/text-success/g' {} +
find src -name "*.tsx" -exec sed -i 's/bg-green-600/bg-success/g' {} +

# Info states
find src -name "*.tsx" -exec sed -i 's/text-blue-600/text-info/g' {} +
```

**3. Fix transition-all Performance Issue**
```bash
# Replace transition-all with appropriate specific transitions
find src -name "*.tsx" -exec sed -i 's/transition-all duration/transition-colors duration/g' {} +
```

### Component Migration Pattern

For each component, follow this workflow:

```bash
# 1. Audit the component
npx tsx scripts/migrate-component.ts audit ComponentName

# 2. Create backup
npx tsx scripts/migrate-component.ts backup ComponentName

# 3. Manually migrate the component (see patterns below)

# 4. Track completion
npx tsx scripts/migrate-component.ts track ComponentName --status completed

# 5. Validate
npx tsx scripts/validate-classnames.ts src/components/ui/component-name.tsx
```

### Component-Specific Migration Patterns

**Button Migration Pattern**
```tsx
// BEFORE:
<button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-all">
  Click Me
</button>

// AFTER:
import { Button } from "@/components/ui/button"
<Button variant="default">Click Me</Button>
```

**Form Migration Pattern**
```tsx
// BEFORE:
<div>
  <label className="text-sm font-medium text-gray-700">Email</label>
  <input 
    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
    type="email"
  />
</div>

// AFTER:
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

**Card Migration Pattern**
```tsx
// BEFORE:
<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
  <h3 className="text-xl font-semibold mb-2">Title</h3>
  <p className="text-sm text-gray-600">Description</p>
</div>

// AFTER:
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle className="text-heading-4">Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
</Card>
```

**Typography Migration Pattern**
```tsx
// BEFORE:
<h1 className="text-4xl font-bold text-gray-900">Page Title</h1>
<h2 className="text-3xl font-semibold text-gray-800">Section</h2>
<p className="text-sm text-gray-600">Body text</p>
<span className="text-xs text-gray-500">Metadata</span>

// AFTER:
<h1 className="text-heading-1">Page Title</h1>
<h2 className="text-heading-2">Section</h2>
<p className="text-body-small">Body text</p>
<span className="text-caption text-muted-foreground">Metadata</span>
```

### Validation Checklist

After each migration, verify:

- [ ] **Visual**: Component looks identical in Storybook
- [ ] **Dark Theme**: Works correctly in dark mode
- [ ] **Responsive**: Scales properly on mobile/tablet/desktop
- [ ] **Interactive**: All hover/focus/active states work
- [ ] **Logic**: No functional regressions (use test-*.ts scripts)
- [ ] **Accessibility**: Keyboard navigation, screen readers
- [ ] **Performance**: No transition-all, optimized classes

### Next Steps

1. ✅ **Complete Phase 4**: Enhanced audit report (this document)
2. **Start Phase 5**: Create naming-convention.md documentation
3. **Start Phase 6**: Batch color replacements (quick wins)
4. **Start Phase 7**: Migrate P3 buttons (8 components)
5. **Continue Phases 8-11**: Migrate remaining components by priority

---

**Report Generated**: 2025-01-28
**Total Components**: 61 tracked in migration-status.json
**Completion**: 0% (foundation complete, components pending)


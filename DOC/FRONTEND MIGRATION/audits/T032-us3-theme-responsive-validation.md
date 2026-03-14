# T032 — US3 Theme, Responsive, and Mobile-Shell Validation

**Date**: 2026-03-14  
**Scope**: Admin, installer, and app chrome

---

## Theme Validation

### App Chrome (HeaderMenu + TopBar)

| Element | Light | Dark | Purple |
|---|---|---|---|
| Top bar band | `--ds-color-surface` | dark surface | purple surface |
| Partner badge | neutral tone | adapts | adapts |
| Header brand | `--ds-color-text` | light text | purple text |
| CTA buttons | accent | accent | purple accent |

### AdminHomeownersAnalytics

| Element | Light | Dark | Purple |
|---|---|---|---|
| Tab bar | `--ds-color-surface` | dark surface | purple surface |
| Progress bars | `--ds-color-muted/30` | dark muted | same |
| Table head | `--ds-color-surface` | dark | purple |
| Row hover | `--ds-color-surface-hover` | dark hover | purple hover |

### Mobile Overlays

| Element | All themes |
|---|---|
| Mobile sidebar overlay | `rgba(0,0,0,0.8)` backdrop — theme-invariant |
| Sidebar content | `--ds-color-surface` (adapts per theme) |

---

## Responsive Validation

### App Chrome

- **320px**: TopBar collapses to mobile layout — ✅
- **768px**: HeaderMenu shows full navigation — ✅
- **1440px**: Container constrains width — ✅

### Mobile Sidebars

- **HomeownerMobileSidebarMenu**: 
  - Shows only on `md:hidden` breakpoint — ✅
  - Uses `ui-overlay` for backdrop — ✅
  - PlatformPresetScript sets `data-platform="mobile"` ≤ 48rem — ✅
  - Swipe gestures preserved — ✅

- **InstallerMobileSidebarMenu**: Same behavior — ✅

### AdminHomeownersAnalytics

- **320-768px**: Tabs scroll horizontally — ✅
- **768px+**: Full analytics layout — ✅

---

## PlatformPresetScript Behavior

On screens ≤ 48rem (768px):
- `html[data-platform="mobile"]` is set
- `html[data-density="compact"]` is set  
- `html[data-visual="sleek"]` is set

DS CSS selectors `[data-platform="mobile"]` correctly gate mobile-specific styling for bottom navbars and sidebars.

---

## Status: ✅ US3 validated across all themes and responsive breakpoints

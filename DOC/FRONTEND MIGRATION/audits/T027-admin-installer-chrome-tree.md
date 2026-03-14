# T027 — US3 Admin, Installer, and App Chrome Tree Audit

**Date**: 2026-03-14  
**Scope**: Navigation chrome, admin surfaces, mobile sidebars

---

## Component Tree

```
App Chrome (DS Runtime):
├── src/ds/runtime/web/AppChrome.tsx        ← orchestrator
├── src/ds/runtime/web/HeaderMenu.tsx       ← public header (already DS)
└── src/ds/runtime/web/TopBar.tsx           ← partner bar (already DS)

Admin Surfaces:
├── src/components/admin/InstallerSelectorModal.tsx
├── src/components/AdminHomeownersAnalytics.tsx
└── src/components/AdminSignIn.tsx

Mobile Chrome:
├── src/components/HomeownerMobileSidebarMenu.tsx
└── src/components/InstallerMobileSidebarMenu.tsx
```

---

## Audit Results

| Component | Issues Found | Fix Applied |
|---|---|---|
| `AppChrome.tsx` | Already DS-governed — no hardcoded colors | ✅ No change needed |
| `HeaderMenu.tsx` | Already DS-governed (`ui-public-header`, `ui-topbar`) | ✅ No change needed |
| `TopBar.tsx` | Already DS-governed (`ui-topbar-band`, `ui-topbar`) | ✅ No change needed |
| `InstallerSelectorModal.tsx` | `text-gray-400/700`, `border-gray-400`, `bg-black/50` | ✅ Migrated |
| `AdminHomeownersAnalytics.tsx` | `bg-slate-100/200/50`, `hover:bg-slate-50` | ✅ Migrated |
| `AdminSignIn.tsx` | No hardcoded colors | ✅ No change needed |
| `HomeownerMobileSidebarMenu.tsx` | `bg-black/80 backdrop-blur-sm z-50` overlay | ✅ → `ui-overlay md:hidden` |
| `InstallerMobileSidebarMenu.tsx` | `bg-black/80 backdrop-blur-sm z-50` overlay | ✅ → `ui-overlay md:hidden` |

---

## PlatformPresetScript Wiring (T028)

Per T008 decision, `PlatformPresetScript` has been wired into `src/app/layout.tsx`.

This enables:
- `data-platform="mobile"` on `<html>` at breakpoints ≤ 48rem
- `data-density="compact"` for dense mobile layouts
- `data-visual="sleek"` for app-like visual mode on mobile

Mobile sidebar menus and bottom navbars will benefit from `[data-platform="mobile"]` CSS overrides.

---

## Business Logic Preserved

- AppChrome: All routing, session management, modal orchestration unchanged
- InstallerSelectorModal: Filter logic, installer selection flow unchanged
- AdminHomeownersAnalytics: All chart data, table filtering unchanged
- Mobile sidebars: Navigation, logout flow, route transitions unchanged

---

## Status: ✅ All US3 components migrated to DS contracts

# DS Migration Audit Report

**Generated**: 2026-03-14T18:52:56.010Z
**Files scanned**: 210

---

## 1. DS Barrel Misuse

✅ No barrel misuse detected.

---

## 2. Hardcoded Visual Token Violations

⚠️ 7 file(s) with hardcoded colors:

  src/components/VerifiedBadge.tsx: 1x "bg-slate-N" — replace with DS token class
  src/components/ProfileManagement.tsx: 1x "bg-black (raw)" — replace with DS token class
  src/components/InstallerMessagingModal.tsx: 1x "bg-gray-N" — replace with DS token class
  src/components/CountdownTimer.tsx: 1x "bg-gray-N" — replace with DS token class
  src/app/installer/page.tsx: 1x "bg-slate-N" — replace with DS token class
  src/app/installer/page.tsx: 2x "border-slate-N" — replace with DS token class
  src/app/homeowner/page.tsx: 1x "border-slate-N" — replace with DS token class

---

## 3. Summary

| Check | Result |
|---|---|
| DS barrel misuse | ✅ Clean |
| Hardcoded colors | ⚠️ 7 files |

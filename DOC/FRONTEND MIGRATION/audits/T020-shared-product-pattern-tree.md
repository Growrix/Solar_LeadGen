# T020 — US2 Shared Product Pattern Tree Audit

**Date**: 2026-03-14  
**Scope**: Shared product components across homeowner, installer, and messaging surfaces

---

## Component Tree

```
Homeowner Quote Flow:
├── src/components/homeowner/SimplifiedQuoteForm.tsx   (barrel fix done in T004)
│   └── src/components/SavingsChart.tsx              (barrel fix done in T004)
├── src/components/homeowner/LeadPreviewModal.tsx      (uses info-section — T007 defines it)
├── src/components/homeowner/LeadEditModal.tsx
├── src/components/homeowner/HomeownerBiddingReviewModal.tsx
└── src/components/quote-builder/InstantQuoteResult.tsx (barrel fix done in T004)

Messaging:
├── src/components/MessagingModal.tsx
└── src/components/InstallerMessagingModal.tsx

Installer Marketplace:
├── src/components/InstallerMarketplace.tsx
├── src/components/InstallerPurchasedLeads.tsx
└── src/components/installer/InstallerAssignedLeads.tsx
```

---

## Component Audit

| Component | Issues Found | Fix Applied |
|---|---|---|
| `SimplifiedQuoteForm.tsx` | DS barrel misuse (SavingsChart) | ✅ T004 |
| `InstantQuoteResult.tsx` | DS barrel misuse (SavingsChart) | ✅ T004 |
| `LeadPreviewModal.tsx` | `info-section` class not in DS | ✅ T007 defines it |
| `LeadEditModal.tsx` | No hardcoded colors found | No change |
| `HomeownerBiddingReviewModal.tsx` | No hardcoded colors found | No change |
| `MessagingModal.tsx` | `bg-black/50`, `bg-gray-200`, `bg-slate-400` | ✅ Migrated |
| `InstallerMessagingModal.tsx` | `bg-black/50`, `bg-slate-400`, `bg-gray-200` | ✅ Migrated |
| `InstallerMarketplace.tsx` | `bg-slate-200`, `bg-slate-50`, `bg-slate-300` | ✅ Migrated |
| `InstallerPurchasedLeads.tsx` | `bg-slate-200`, `bg-slate-600` | ✅ Migrated |
| `InstallerAssignedLeads.tsx` | `text-gray-400`, `text-gray-700` | ✅ Migrated |

---

## DS Contracts Used

All US2 components now rely on:
- `ui-overlay--dim` for 50% overlay backdrops
- `bg-muted/30` for skeleton loading states
- `hover:bg-surface-hover` for hover states (replacing `hover:bg-slate-50`, `hover:bg-gray-200`)
- `bg-foreground-muted` for typing indicators and muted icons
- `text-foreground` for body text (replacing `text-gray-700`)
- `text-foreground-muted` for muted text (replacing `text-gray-400`)
- `bg-muted/40` for disabled states

---

## Business Logic Preserved

- HomeoOwner quote flow: All form validation, API calls, step navigation unchanged
- Messaging: Send/receive flow, typing indicators, empty state routing unchanged
- Installer marketplace: Filter logic, lead purchase flow, pagination unchanged
- InstallerPurchasedLeads: All action callbacks, state management unchanged

---

## Status: ✅ All US2 components migrated to DS contracts

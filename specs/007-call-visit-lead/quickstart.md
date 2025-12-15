# CALL_VISIT Lead Purchase Quickstart

## Objective
Implement and validate atomic purchase + feed rendering for CALL_VISIT leads using backend-derived flags. No client-side simulation.

## Endpoints
- GET `/api/installer/leads?quoteType=CALL_VISIT` – Feed with derived flags
- POST `/api/installer/leads/{id}/purchase` – Atomic purchase operation

## Data Flags (Server Derived Only)
- `purchasedByMe`: `installerId === currentInstallerId`
- `purchasedByOther`: `status === PURCHASED && installerId !== currentInstallerId`
- `canPurchase`: `status === APPROVED`
- `maskedContact`: `!purchasedByMe`

## Purchase Flow (Atomic)
1. Installer clicks Purchase on APPROVED lead.
2. Backend transaction:
   - Conditional update: `WHERE id = ? AND status = 'APPROVED'`
   - Set: `status='PURCHASED', installerId=?, purchasedAt=NOW()`
   - Insert `PurchaseLogEntry` audit row.
3. On success return full lead with unmasked contact.
4. If 0 rows updated => return 409 race or status error.

## Race Condition Test
Open two browser sessions (Installer A & B):
1. Both load feed, see same APPROVED lead with `canPurchase=true`.
2. A purchases first -> receives 200.
3. B attempts purchase -> receives 409; feed refresh shows `purchasedByOther=true`, `canPurchase=false`, `maskedContact=true`.

## Response Validation Checklist
- APPROVED lead pre-purchase: `maskedContact=true`, `contact` null or redacted.
- Successful purchase: `status=PURCHASED`, `purchasedByMe=true`, `maskedContact=false`, full `contact` object present.
- Purchased by other: `status=PURCHASED`, `purchasedByOther=true`, `maskedContact=true`, `contact` null/redacted.

## UI Rendering Rules
- Never infer flags locally; consume API booleans directly.
- Purchase button visible only if `canPurchase`.
- Contact panel renders either masked placeholder or real data based on `maskedContact`.

## Error Handling
- 409: Show toast "Lead already purchased"; refetch feed.
- 400: Generic invalid state; refetch.
- 404: Show not found, remove from list if present.

## Minimal Fetch Example (TypeScript)
```ts
async function fetchFeed(page: number = 1) {
  const res = await fetch(`/api/installer/leads?quoteType=CALL_VISIT&page=${page}`);
  if (!res.ok) throw new Error('Feed error');
  return res.json() as Promise<FeedResponse>;
}

async function purchaseLead(id: string) {
  const res = await fetch(`/api/installer/leads/${id}/purchase`, { method: 'POST' });
  if (res.status === 409) return { conflict: true };
  if (!res.ok) throw new Error('Purchase error');
  return res.json();
}
```

## Smoke Test Script (Pseudo)
1. Load feed -> assert all flags align with spec.
2. Pick first APPROVED lead; call purchase; assert returned `purchasedByMe=true`.
3. Refresh feed; same lead shows `purchasedByMe=true`, `maskedContact=false`.
4. Simulate second session attempt -> expect 409.
5. Accessibility: Tab to Purchase button; space/enter triggers purchase.

## Success Metrics
- 100% purchases atomic (no duplicate ownership).
- Zero leaked contact before purchase.
- Derived flags match state transitions in all test cases.

## Next Steps
Proceed to Phase 2 implementation: endpoint resolver + Prisma transaction + UI refactor removing mock logic.

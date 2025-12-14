# DEPRECATED: src/lib/services/notification-service.ts

**Deprecation Date**: 2025-12-14  
**Canonical Location**: `src/lib/notifications/notification-service.ts`

## Why Deprecated

This file has been superseded by the normalized notification service architecture:

### Old Pattern (THIS FILE - DEPRECATED)
```typescript
await createNotification({
  userId,
  type: 'NEW_LEAD',
  title: 'New Lead Received',
  message: 'A new solar lead has been submitted',
  actionUrl: '/admin/leads/123'
});
```

### New Pattern (USE THIS)
```typescript
await createNotification({
  recipientUserId: userId,
  role: 'ADMIN',
  actionType: 'NEW_LEAD',
  messageKey: 'LEAD_SUBMITTED_FOR_ADMIN',
  routeKey: 'ADMIN_LEAD_DETAIL',
  routeParams: { leadId: '123' },
  metadata: {}
});
```

## Benefits of New Pattern

1. **Centralized Messaging**: All notification text in `message-catalog.ts`
2. **Type-Safe Routes**: Route keys prevent broken links
3. **Role-Aware**: Explicit role targeting
4. **Audit Trail**: Structured metadata
5. **Consistent Formatting**: Normalized HTML templates

## Migration Path

DO NOT import from this file:
```typescript
// ❌ OLD (Don't use)
import { createNotification } from '@/lib/services/notification-service';
```

Use the canonical service:
```typescript
// ✅ NEW (Use this)
import { createNotification } from '@/lib/notifications/notification-service';
```

## File Status

- **Current Status**: Deprecated, pending removal
- **Removal Date**: TBD (after all references updated)
- **Blockers**: Audit all imports first
- **Owner**: System Architecture Team

## References

- **Audit Report**: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md
- **Fix Plan**: DOC/AUDIT-REPORTS/System/FIX-PLAN-2025-12-14.md (Phase 2)
- **Authority**: Constitution Section 4.2 (Service Consolidation)

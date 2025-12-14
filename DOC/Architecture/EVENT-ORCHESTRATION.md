# Event Orchestration Architecture

**Authority**: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md (Phase 6)  
**Status**: Foundation Phase  
**Last Updated**: 2025-12-14  

## Purpose

Establish an event-driven architecture foundation to decouple side effects (notifications, emails, webhooks, analytics) from core business logic. This addresses the audit finding that "side effects are not formalized as events."

## Problem Statement

### Current State (Audit Findings)
```typescript
// ❌ BEFORE: Tightly coupled side effects
async function approveLead(leadId: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { status: 'APPROVED' } });
  await sendEmail(...); // Side effect 1
  await createNotification(...); // Side effect 2
  await logAudit(...); // Side effect 3
  // If any side effect fails, entire operation fails
}
```

**Issues**:
1. **Tight Coupling**: Business logic mixed with side effects
2. **Failure Cascade**: Email failure breaks lead approval
3. **No Retry Logic**: Failed notifications lost forever
4. **Hard to Test**: Must mock all side effects
5. **No Event History**: Can't replay/debug event flows

### Target State (Event-Driven)
```typescript
// ✅ AFTER: Event-driven decoupling
async function approveLead(leadId: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { status: 'APPROVED' } });
  await eventBus.emit('lead.approved', { leadId, approvedAt: new Date() });
  // Side effects happen asynchronously via event handlers
}

// Separate event handlers (can fail independently)
eventBus.on('lead.approved', sendApprovalEmail);
eventBus.on('lead.approved', createApprovalNotification);
eventBus.on('lead.approved', logLeadApprovedAudit);
```

**Benefits**:
1. **Decoupling**: Business logic doesn't know about side effects
2. **Resilience**: Side effect failures don't break core operations
3. **Extensibility**: Add new handlers without modifying core logic
4. **Testability**: Test business logic without mocking all side effects
5. **Observability**: Event log provides audit trail

## Architecture

### Event Bus Pattern

```
┌─────────────────┐
│  Business Logic │
│  (API Routes)   │
└────────┬────────┘
         │ emit('lead.approved', data)
         ▼
┌─────────────────┐
│   Event Bus     │
│  (In-Memory)    │
└────────┬────────┘
         │ fanout
         ├──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │Handler1│ │Handler2│ │Handler3│ │Handler4│
    │ Email  │ │  Push  │ │  Audit │ │Analytics│
    └────────┘ └────────┘ └────────┘ └────────┘
```

### Event Schema

```typescript
interface DomainEvent {
  id: string;                    // Unique event ID (cuid)
  type: string;                  // Event type (e.g., 'lead.approved')
  aggregateId: string;           // Entity ID (e.g., leadId)
  aggregateType: string;         // Entity type (e.g., 'Lead')
  data: Record<string, any>;     // Event payload
  metadata: {
    userId?: string;             // Actor who triggered event
    userRole?: string;           // Actor's role
    timestamp: Date;             // When event occurred
    source: string;              // Where event originated (e.g., 'api')
    correlationId?: string;      // For tracing related events
  };
}
```

## Domain Events Catalog

### Lead Events

| Event Type | Trigger | Data | Handlers |
|------------|---------|------|----------|
| `lead.created` | Homeowner submits lead | `{ leadId, homeownerEmail }` | Send confirmation email |
| `lead.approved` | Admin approves lead | `{ leadId, approvedBy }` | Send homeowner email, notify installers, create notifications |
| `lead.purchased` | Installer buys lead | `{ leadId, installerId, installerEmail }` | Send homeowner email, send admin email, create notifications |
| `lead.rejected` | Admin rejects lead | `{ leadId, reason }` | Send homeowner refund email, log audit |

### Bid Events

| Event Type | Trigger | Data | Handlers |
|------------|---------|------|----------|
| `bid.submitted` | Installer submits bid | `{ bidId, leadId, installerId }` | Notify admin, notify homeowner |
| `bid.selected` | Homeowner selects winner | `{ bidId, leadId, winnerId }` | Send winner email, send loser emails, create notifications |
| `bid.purchased` | Installer buys bid lead | `{ bidId, leadId, installerId }` | Send purchase confirmation, update lead status |

### User Events

| Event Type | Trigger | Data | Handlers |
|------------|---------|------|----------|
| `user.registered` | New user signup | `{ userId, email, role }` | Send verification email, create welcome notification |
| `user.verified` | Email verified | `{ userId }` | Send welcome email, log audit |
| `user.deactivated` | Admin deactivates user | `{ userId, reason }` | Send deactivation email, revoke sessions, log audit |

## Implementation Phases

### Phase 1: Foundation (Current)

**Goal**: Establish event infrastructure without breaking existing code.

**Deliverables**:
1. ✅ Event bus interface (`src/lib/events/event-bus.ts`)
2. ✅ Event schema types (`src/lib/events/types.ts`)
3. ✅ Event catalog documentation (this file)
4. ❌ In-memory event bus implementation
5. ❌ Basic event handlers (email, notification)

### Phase 2: Migration (Future)

**Goal**: Migrate existing side effects to event handlers.

**Approach**:
- **Parallel Run**: Keep old code + emit events
- **Verify**: Ensure event handlers work correctly
- **Remove**: Delete old side effect code

**Example Migration**:
```typescript
// Step 1: Keep old code, add event emission
await sendEmail(...);           // OLD (keep temporarily)
await emit('lead.approved', {}); // NEW (add in parallel)

// Step 2: Verify event handler works (test in production)
// Monitor logs, check EmailDelivery table

// Step 3: Remove old code
// await sendEmail(...);         // OLD (remove)
await emit('lead.approved', {}); // NEW (keep)
```

### Phase 3: Persistence (Future)

**Goal**: Persist events to database for audit/replay.

**Schema**:
```prisma
model DomainEvent {
  id              String   @id @default(cuid())
  type            String
  aggregateId     String
  aggregateType   String
  data            Json
  metadata        Json
  createdAt       DateTime @default(now())
  
  @@index([type])
  @@index([aggregateId])
  @@index([createdAt])
}
```

**Benefits**:
- Event sourcing (rebuild state from events)
- Audit trail (who did what when)
- Replay failed events
- Analytics/reporting

### Phase 4: Async Processing (Future)

**Goal**: Move heavy handlers to background jobs.

**Technologies**:
- **BullMQ**: Redis-based job queue
- **Worker Threads**: CPU-intensive tasks
- **Webhooks**: External integrations

**Example**:
```typescript
// Lightweight handlers (in-process)
eventBus.on('lead.approved', createNotification);

// Heavy handlers (background job)
eventBus.on('lead.approved', (event) => {
  queue.add('send-bulk-emails', event);
});
```

## Code Patterns

### Emitting Events

```typescript
import { eventBus } from '@/lib/events/event-bus';

// In API route or service
export async function approveLead(leadId: string, userId: string) {
  // 1. Perform business logic
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'APPROVED' },
  });

  // 2. Emit domain event (async, non-blocking)
  await eventBus.emit({
    type: 'lead.approved',
    aggregateId: leadId,
    aggregateType: 'Lead',
    data: {
      leadId: lead.id,
      homeownerEmail: lead.email,
      postcode: lead.propertyPostcode,
    },
    metadata: {
      userId,
      userRole: 'ADMIN',
      timestamp: new Date(),
      source: 'api',
    },
  });

  return lead;
}
```

### Registering Event Handlers

```typescript
import { eventBus } from '@/lib/events/event-bus';
import { sendEmail } from '@/lib/sendgrid';
import { createNotification } from '@/lib/notifications/notification-service';

// Register handler (typically in bootstrap/startup code)
eventBus.on('lead.approved', async (event) => {
  try {
    await sendEmail({
      to: event.data.homeownerEmail,
      subject: 'Your Solar Quote Request Was Approved!',
      text: `Your request for postcode ${event.data.postcode} has been approved.`,
      recipientRole: 'HOMEOWNER',
    });
    console.log(`✅ [Event Handler] Sent approval email for lead ${event.aggregateId}`);
  } catch (error) {
    console.error(`❌ [Event Handler] Failed to send approval email:`, error);
    // Don't throw - handler failures shouldn't crash the app
  }
});

eventBus.on('lead.approved', async (event) => {
  try {
    const homeowner = await prisma.user.findFirst({
      where: { email: event.data.homeownerEmail },
    });

    if (homeowner) {
      await createNotification({
        recipientUserId: homeowner.id,
        role: 'HOMEOWNER',
        actionType: 'LEAD_APPROVED',
        messageKey: 'LEAD_APPROVED_FOR_HOMEOWNER',
        routeKey: 'HOMEOWNER_LEAD_DETAIL',
        routeParams: { leadId: event.aggregateId },
      });
    }
    console.log(`✅ [Event Handler] Created notification for lead ${event.aggregateId}`);
  } catch (error) {
    console.error(`❌ [Event Handler] Failed to create notification:`, error);
  }
});
```

### Testing with Events

```typescript
// Unit test: Mock event bus
import { eventBus } from '@/lib/events/event-bus';

jest.mock('@/lib/events/event-bus');

test('approveLead emits lead.approved event', async () => {
  await approveLead('lead_123', 'admin_456');
  
  expect(eventBus.emit).toHaveBeenCalledWith({
    type: 'lead.approved',
    aggregateId: 'lead_123',
    // ... other fields
  });
});

// Integration test: Spy on event handlers
const emailSpy = jest.fn();
eventBus.on('lead.approved', emailSpy);

await approveLead('lead_123', 'admin_456');
await waitForHandlers(); // Wait for async handlers

expect(emailSpy).toHaveBeenCalled();
```

## Monitoring and Observability

### Event Metrics

**Key Metrics**:
- Events emitted per type (last 24h)
- Handler execution time (P50, P95, P99)
- Handler failure rate (target: <1%)
- Event throughput (events/second)

**Queries**:
```sql
-- Event volume by type (future: after persistence)
SELECT type, COUNT(*) as count
FROM domain_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY count DESC;
```

### Error Handling

**Handler Failures**:
- Log to console (captured by logging infrastructure)
- Increment failure counter (Prometheus/CloudWatch)
- Alert if failure rate > 5% (PagerDuty)

**Retry Logic** (Phase 4):
- Failed handlers moved to dead-letter queue
- Exponential backoff (1m, 5m, 15m, 1h, 4h)
- Manual replay via admin UI

## Migration Checklist

### Per-Event Migration

- [ ] Define event schema in catalog
- [ ] Create event type constant
- [ ] Implement event emission in business logic
- [ ] Create event handler(s)
- [ ] Test in parallel (old + new code)
- [ ] Verify logs/metrics
- [ ] Remove old side effect code
- [ ] Update tests

### Example: `lead.approved` Migration

- [x] ✅ Define `lead.approved` event schema
- [ ] ❌ Emit event in `/api/leads/[id]/approve/route.ts`
- [ ] ❌ Create email handler
- [ ] ❌ Create notification handler
- [ ] ❌ Test in staging environment
- [ ] ❌ Deploy to production (parallel run)
- [ ] ❌ Remove old `createBulkNotifications` call
- [ ] ❌ Update integration tests

## References

- **Audit Report**: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md
- **Event Sourcing**: https://martinfowler.com/eaaDev/EventSourcing.html
- **Domain Events**: https://martinfowler.com/eaaDev/DomainEvent.html
- **Event-Driven Architecture**: https://aws.amazon.com/event-driven-architecture/

## Changelog

- **2025-12-14**: Initial documentation (Phase 6 foundation)
- **TBD**: Implement in-memory event bus
- **TBD**: Migrate first event (`lead.approved`)
- **TBD**: Add event persistence layer

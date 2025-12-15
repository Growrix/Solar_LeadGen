# Data Model: CALL_VISIT Purchase Flow
Date: 2025-11-24

## Entities

### Lead (subset relevant to purchase)
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| id | string (UUID) | Unique identifier | Required, UUID format |
| status | enum | Lifecycle state | Must be APPROVED for purchase; transitions to PURCHASED |
| quoteType | enum | Differentiates lead type | Must be CALL_VISIT in this feature scope |
| installerId | string? | Purchasing installer | Null pre-purchase; set on purchase |
| purchasedAt | DateTime? | Timestamp of purchase | Set exactly once on success |
| leadPrice | Decimal | Price displayed & charged | Must be > 0; required pre-purchase |
| postcode | string | Location reference | Non-empty; format validated elsewhere |
| expiresAt | DateTime? | Optional expiry | If present and past, purchase blocked |
| propertyType | enum/string | Display context | Optional; informational |
| roofType | string? | Display context | Optional; if present show |

### PurchaseLogEntry
| Field | Type | Purpose | Validation |
|-------|------|---------|------------|
| id | string (UUID) | Log entry id | Generated |
| leadId | string | Link to Lead | Must exist |
| installerId | string | Actor | Must exist |
| outcome | enum(success|already_purchased|invalid_status|error) | Result classification | Required |
| timestamp | DateTime | Audit trail times | Auto-set |
| message | string? | Additional info | Optional |

## State Transition (CALL_VISIT)
APPROVED → PURCHASED
- Guard: status == APPROVED AND installerId IS NULL
- Action: set installerId, purchasedAt, status PURCHASED
- Post-condition: Exactly one installer owns lead; others see purchased-by-other

## Derived Flags (Feed UI)
| Flag | Derivation |
|------|------------|
| purchasedByMe | lead.installerId == currentInstallerId |
| purchasedByOther | lead.installerId != null AND lead.installerId != currentInstallerId |
| canPurchase | status == APPROVED AND installerId == null AND (expiresAt null OR expiresAt > now) |
| maskedContact | purchasedByMe ? false : true |

## Validation Rules
- Purchase attempt without leadPrice → error (configuration issue)
- Purchase attempt with invalid status (not APPROVED) → invalid_status outcome
- Expired lead (expiresAt <= now) → invalid_status outcome (treated as unavailable)
- Duplicate purchase attempt after success → already_purchased outcome

End of Data Model.

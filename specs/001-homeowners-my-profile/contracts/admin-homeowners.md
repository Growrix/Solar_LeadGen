# API Contract — Admin Homeowners List

Resource: `/api/admin/homeowners`

## Auth
- Requires ADMIN role (server-side enforced)

## GET — List homeowners
Query params
```
q?: string            # search across name/email/phone/postcode (case-insensitive)
postcode?: string     # exact or prefix match (implementation-defined)
status?: string       # active|inactive (maps to isActive)
from?: string         # ISO date (createdAt >= from)
to?: string           # ISO date (createdAt <= to)
page?: number         # default 1
pageSize?: number     # default 25 (max 100)
```

Response 200
```json
{
  "total": 123,
  "page": 1,
  "pageSize": 25,
  "items": [
    {
      "id": "string",
      "name": "string|null",
      "email": "string",
      "phone": "string|null",
      "postcode": "string|null",
      "createdAt": "ISO-8601",
      "isActive": true
    }
  ]
}
```

Errors
- 401/403 if unauthorized
- 400 for invalid paging/params

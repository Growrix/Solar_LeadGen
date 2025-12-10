# API Contract — Admin Homeowners Analytics

Resource: `/api/admin/homeowners/analytics`

## Auth
- Requires ADMIN role (server-side enforced)

## GET — Aggregated counts
Query params
```
window?: string   # one of: all (default), 30d, 90d
```

Response 200
```json
{
  "window": "all|30d|90d",
  "totals": {
    "homeowners": 1234
  },
  "byPostcode": [
    { "postcode": "AB12", "count": 40, "percent": 3.24 }
  ],
  "byLocation": [
    { "location": "City/Region or Unspecified", "count": 120, "percent": 9.72 }
  ]
}
```

Notes
- "location" grouping depends on available data; unknowns should be grouped under "Unspecified"
- Percent is computed against totals.homeowners for the selected window

Errors
- 401/403 if unauthorized

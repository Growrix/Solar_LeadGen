# API Contract — Homeowner Profile

Resource: `/api/homeowner/profile`

## Auth
- Requires logged-in session (HOMEOWNER/INSTALLER/ADMIN)
- Homeowner may only access/modify their own profile; admins should not use this route to edit others

## GET — Fetch current user profile
Request: none (session-derived)

Response 200
```json
{
  "id": "string",
  "name": "string|null",
  "email": "string",
  "phone": "string|null",
  "postcode": "string|null",
  "image": "string|null",
  "updatedAt": "ISO-8601"
}
```

Errors
- 401 if unauthenticated

## PUT — Update current user profile
Request (JSON)
```json
{
  "name": "string",
  "phone": "string|null",
  "postcode": "string|null",
  "image": {
    "action": "set|remove",
    "url": "string|null"
  }
}
```

Rules
- Email is read-only in this flow
- `name` length 1–100
- `phone` optional; validate common formats (numbers, +, spaces, hyphens)
- `postcode` optional; up to 12 chars
- `image.action` = "set" requires `url`, "remove" sets image to null
- Server updates `updatedAt` automatically

Responses
- 200 with updated profile (same shape as GET)
- 400 for validation errors (with `fieldErrors` map)
- 401 if unauthenticated
- 409 on concurrent update conflict (optional; otherwise 200 last-write-wins)

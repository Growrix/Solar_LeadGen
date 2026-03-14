# SolarMatch — Replit Development Guide

## Overview

SolarMatch is a **solar lead generation platform** built with Next.js 14 (App Router). It connects three user types:

- **Homeowners** — submit solar installation quote requests
- **Installers** — browse, bid on, and purchase leads
- **Admins** — review and approve leads, manage users, monitor platform activity

Core workflows include lead submission, lead approval, bidding (competitive and written quote), payments via Stripe, real-time notifications via Pusher, file uploads to AWS S3, and email/SMS delivery via SendGrid/Resend/Twilio.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend

- **Framework**: Next.js 14 with the App Router (`src/app/`) and TypeScript
- **Styling**: Tailwind CSS with a custom design-token layer — semantic tokens (e.g. `bg-surface`, `text-foreground`, `border-border`) are defined as CSS variables and mapped in `tailwind.config.js`. Hardcoded Tailwind color shades (e.g. `bg-teal-600`) are treated as violations.
- **State management**: Redux Toolkit + React Redux for global client state
- **Forms**: React Hook Form + Zod for schema validation
- **Charts**: Recharts for analytics dashboards
- **Toasts**: Sonner for notifications
- **Icons**: Lucide React + Heroicons
- **Dark mode**: Class-based (`darkMode: 'class'`) driven by CSS variable theming

### Backend

- **Runtime**: Next.js API Routes (`src/app/api/`) — all backend logic lives here as serverless route handlers
- **ORM**: Prisma with a PostgreSQL database (`DATABASE_URL`)
- **Auth**: NextAuth v4 with the Prisma adapter (`@next-auth/prisma-adapter`). JWT-based sessions with a `role` claim (`ADMIN`, `INSTALLER`, `HOMEOWNER`).
- **Middleware** (`src/middleware.ts`): Route protection with role-based access control. Admins bypass all role checks. Non-admin users are gated by role on `/admin/*`, `/installer/*`, and `/homeowner/*` paths.

### Database

- **Database**: PostgreSQL (accessed via Prisma)
- **Schema location**: `prisma/schema.prisma`
- **Migrations**: Managed with `prisma migrate dev` (dev) and `prisma migrate deploy` (production). 25+ migrations exist.
- **Key models**: `User` (roles: ADMIN, INSTALLER, HOMEOWNER), `Lead`, `LeadAssignment`, `Bid`, `Notification`, `Settings`
- **Seeding**: `prisma/seed-admin.ts` (admin user), `prisma/seed-complete.ts` (test data), `prisma/seed-settings.ts` (system settings)

### Real-time

- **Pusher** (server SDK `pusher` + client SDK `pusher-js`) for real-time notifications pushed to users when key events occur (bids submitted, leads purchased, etc.)

### File Storage

- **AWS S3** (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`) for installer document and image uploads. Presigned URLs are generated server-side; the browser uploads directly to S3.

### Payments

- **Stripe** (`stripe` server SDK + `@stripe/stripe-js` client SDK) handles installer payments when purchasing leads.

### Email & SMS

- **Resend** and **SendGrid** (`@sendgrid/mail`) for transactional emails
- **Twilio** for SMS/OTP delivery

### Testing

- **E2E**: Playwright (`tests/e2e/`), configured in `playwright.config.ts`. Runs against port 3001 (`npm run dev:e2e`).
- **Component stories**: Storybook for UI isolation and visual testing; Chromatic for visual regression CI.
- **TypeScript gate**: A separate `tsconfig.gate.json` runs `tsc --noEmit` as a pre-build gate.

### Development Scripts

Several utility scripts live in `scripts/` for one-off tasks:
- Design token migration passes (replacing hardcoded Tailwind classes with semantic tokens)
- Component migration tracking (`migration-status.json`)
- CSS class auditing and validation
- S3 CORS setup
- Database check scripts

---

## External Dependencies

| Service | Purpose | SDK / Package |
|---|---|---|
| **PostgreSQL** | Primary database | Prisma (`@prisma/client`) |
| **NextAuth** | Authentication & session management | `next-auth`, `@next-auth/prisma-adapter` |
| **Pusher** | Real-time push notifications | `pusher` (server), `pusher-js` (client) |
| **Stripe** | Payment processing for lead purchases | `stripe`, `@stripe/stripe-js` |
| **AWS S3** | File/document storage with presigned URLs | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |
| **Resend** | Transactional email delivery | `resend` |
| **SendGrid** | Transactional email (alternative/secondary) | `@sendgrid/mail` |
| **Twilio** | SMS / OTP delivery | `twilio` |
| **Playwright** | End-to-end browser testing | `@playwright/test` |
| **Storybook** | Component isolation and visual testing | storybook packages |
| **Chromatic** | Visual regression CI | `chromatic` |

### Required Environment Variables

The app expects these to be set (`.env` or Replit Secrets):

```
# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# Email
RESEND_API_KEY=
SENDGRID_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Safety Rules

- **Never run** `DROP DATABASE`, `TRUNCATE`, or `db:reset` commands.
- Always warn before any destructive database operation.
- Use `prisma migrate deploy` in production; use `prisma migrate dev` in development only.
- Admin password seeding is done via `npm run seed:admin` — never hardcode credentials in source.
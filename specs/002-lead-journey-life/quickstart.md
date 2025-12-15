# Quickstart Guide: Lead Journey & Life Cycle

**Feature**: Lead Journey & Life Cycle Management  
**Branch**: `002-lead-journey-life`  
**Last Updated**: 2025-10-15

This guide helps developers get the lead management system up and running quickly.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Next.js 14.2.33+ development environment
- ✅ PostgreSQL database (Supabase) configured
- ✅ Node.js 20.8+ installed
- ✅ Prisma CLI installed (`npm install -g prisma`)
- ✅ Git branch `002-lead-journey-life` checked out

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/solarmatch"
DIRECT_URL="postgresql://postgres:password@localhost:5432/solarmatch"

# Auth (already configured)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Twilio (OTP Verification)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# SendGrid (Email Notifications)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Pusher (Real-time Chat & Notifications)
PUSHER_APP_ID="your_app_id"
PUSHER_KEY="your_key"
PUSHER_SECRET="your_secret"
PUSHER_CLUSTER="us2"

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx"

# AWS S3 (Document Storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIAxxxxxxxxxxxxxxxxx"
AWS_SECRET_ACCESS_KEY="your_secret_key_here"
AWS_S3_BUCKET="solarmatch-documents"
```

### Step 2: Database Schema

Run Prisma migrations to create all tables:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name lead-journey-init

# (Optional) Seed database with test data
npm run db:seed
```

### Step 3: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server will run on http://localhost:3000
```

### Step 4: Verify Installation

1. Open browser to `http://localhost:3000/admin`
2. Login as admin (use seeded credentials if available)
3. Navigate to **Admin Dashboard → Lead Management**
4. Should see empty lead list (ready for submissions)

---

## 📦 Database Models

The feature adds 9 new Prisma models:

1. **Lead** - Core entity for quote requests
2. **PhoneVerification** - OTP verification records
3. **InstallDocument** - Installer verification documents
4. **ChatMessage** - Real-time chat messages
5. **Quote** - Installer quote submissions
6. **LeadFeedback** - Installer feedback on leads
7. **AuditLog** - Comprehensive action logging
8. **Notification** - User notifications
9. **Settings** - System-wide configuration (approval mode, pricing)

See [`data-model.md`](./data-model.md) for complete schema definitions.

---

## 🔌 API Endpoints

### Leads Management

- `POST /api/leads` - Create new lead
- `GET /api/leads` - List leads (filtered by role)
- `GET /api/leads/[id]` - Get lead details
- `POST /api/leads/[id]/approve` - Admin approve lead
- `POST /api/leads/[id]/reject` - Admin reject lead
- `POST /api/leads/[id]/purchase` - Installer purchase lead

### Phone Verification

- `POST /api/verification/send-otp` - Send OTP to phone
- `POST /api/verification/verify-otp` - Verify OTP code

### Chat System

- `GET /api/chat/[leadId]/messages` - Get chat history
- `POST /api/chat/[leadId]/messages` - Send message

### Quotes Management

- `POST /api/quotes` - Submit quote
- `GET /api/quotes/[id]` - Get quote details
- `POST /api/quotes/[id]/approve` - Approve quote (admin/homeowner)
- `POST /api/quotes/[id]/reject` - Reject quote

### Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read

See [`contracts/`](./contracts/) directory for complete OpenAPI specifications.

---

## 🎯 Testing the Feature

### Test Scenario 1: Homeowner Lead Submission

1. **As Guest User**:
   - Go to homepage `http://localhost:3000`
   - Complete instant quote calculator
   - Click "Get Real Quotes from Installers"
   - Select quote type (Call/Visit or Written Quote)
   - See signup modal → Create account
   - Submit lead → See success modal

2. **Verify in Admin Dashboard**:
   - Go to `http://localhost:3000/admin/leads`
   - Should see new lead with status "New"

### Test Scenario 2: Admin Approval Workflow

1. **As Admin**:
   - Go to `http://localhost:3000/admin/leads`
   - Click on lead
   - Set price (e.g., £50 for Call/Visit)
   - Assign to installers (or "All Installers")
   - Click "Approve Lead"
   - Status changes to "Pending"

2. **Verify in Installer Dashboard**:
   - Go to `http://localhost:3000/installer/marketplace`
   - Should see approved lead in marketplace

### Test Scenario 3: Installer Purchase & Chat

1. **As Installer**:
   - Go to `http://localhost:3000/installer/marketplace`
   - Click on lead
   - Click "Purchase Lead" → Complete Stripe payment
   - Lead moves to "Purchased Leads"
   - Contact details now visible
   - Open chat window
   - Send message to homeowner

2. **Verify Real-Time Chat**:
   - Open two browser windows (homeowner + installer)
   - Send messages from both sides
   - Messages should appear instantly

### Test Scenario 4: Phone Verification

1. **As Homeowner** (after 1st lead submission):
   - Try to submit 2nd lead
   - See OTP verification prompt
   - Enter phone number
   - Receive SMS with 6-digit code
   - Enter code
   - Get "Verified Homeowner" badge
   - Can now submit up to 4 more leads (5 total)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Homeowner  │  │   Installer  │  │     Admin    │     │
│  │  Dashboard   │  │  Marketplace │  │  Dashboard   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                     Backend (API Routes)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Leads     │  │     Chat     │  │    Quotes    │     │
│  │  Management  │  │    System    │  │  Management  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴───────┐    │
│  │           Prisma ORM (Database Layer)               │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                  PostgreSQL (Supabase)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Leads  │  │  Users  │  │  Chats  │  │ Quotes  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└───────────────────────────────────────────────────────────────┘

External Services:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Twilio    │  │  SendGrid   │  │   Pusher    │  │   Stripe    │
│  (OTP SMS)  │  │   (Email)   │  │ (Real-time) │  │  (Payment)  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🔧 Common Development Tasks

### Add a New Lead Status

1. Update Prisma schema:
   ```prisma
   enum LeadStatus {
     New
     Pending
     InProgress
     DealClosed
     Void
     NoResponse
     YourNewStatus  // Add here
   }
   ```

2. Run migration:
   ```bash
   npx prisma migrate dev --name add-new-status
   ```

3. Update state machine in `src/lib/lead-state-machine.ts`

### Add a New Notification Type

1. Update notification type enum in `src/lib/notifications.ts`
2. Add email template in `src/lib/email-templates/`
3. Call `sendNotification()` where event occurs

### Customize Pricing Rules

1. Go to Admin Dashboard → Settings
2. Update global default prices (Call/Visit, Written Quote)
3. Or override per-lead in lead details page

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check Prisma connection
npx prisma db pull

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### OTP Not Sending

- Verify Twilio credentials in `.env`
- Check Twilio console for account balance
- Test with Twilio CLI: `twilio phone-numbers:update`

### Real-Time Chat Not Working

- Verify Pusher credentials in `.env`
- Check browser console for WebSocket connection errors
- Test Pusher connection: https://pusher.com/docs/channels/getting_started/javascript

### Stripe Webhooks Not Firing

- Use Stripe CLI for local testing:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```
- Copy webhook signing secret to `.env`

---

## 📚 Additional Resources

- [Feature Specification](./spec.md) - Complete user stories and requirements
- [Data Model](./data-model.md) - Database schema definitions
- [Research Document](./research.md) - Technical decisions and rationale
- [API Contracts](./contracts/) - OpenAPI specifications for all endpoints

---

## 🆘 Getting Help

- Check existing documentation in `DOC/Records/`
- Review constitution: `.specify/memory/constitution.md`
- Search codebase for similar implementations
- Check inline comments in code files (teaching-first approach)

---

## ✅ Checklist: Ready to Start?

- [ ] Environment variables configured in `.env`
- [ ] Database migrations run successfully
- [ ] Development server running (`npm run dev`)
- [ ] Admin dashboard accessible
- [ ] External services (Twilio, Stripe, Pusher) configured
- [ ] Test data seeded (optional)
- [ ] Familiarized with feature spec and API contracts

**All set?** Start with Test Scenario 1 above to verify your setup!

---

**Happy Coding! 🚀**

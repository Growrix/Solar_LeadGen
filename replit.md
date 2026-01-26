# SolarMatch - Solar Lead Generation Platform

## Overview

SolarMatch is a Next.js-based solar lead generation web application that connects homeowners seeking solar installations with verified installers. The platform supports three user roles (Admin, Installer, Homeowner) with distinct dashboards and workflows including lead management, competitive bidding, written quote negotiations, and real-time messaging.

The application features a comprehensive news engine for content management, Stripe payment integration for lead purchases, and AWS S3 for file storage. It uses Prisma ORM with PostgreSQL for data persistence and implements real-time notifications via Pusher.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom design tokens defined in `src/design-tokens`
- **State Management**: Redux Toolkit with React-Redux for global state
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Rich Text**: TipTap editor for news content creation
- **Real-time**: Pusher-js for live notifications and messaging
- **Charts**: Recharts for dashboard analytics

### Backend Architecture
- **API Routes**: Next.js App Router API handlers in `src/app/api/`
- **Authentication**: NextAuth.js v4 with Prisma adapter, supporting credentials-based login
- **Authorization**: Role-based middleware in `src/middleware.ts` (ADMIN, INSTALLER, HOMEOWNER)
- **Database ORM**: Prisma Client for type-safe database queries

### Data Storage
- **Primary Database**: PostgreSQL accessed via Prisma ORM
- **Schema Location**: `prisma/schema.prisma`
- **Migrations**: Managed via Prisma Migrate in `prisma/migrations/`
- **File Storage**: AWS S3 for document uploads (quotes, images)

### Key Data Models
- **Users**: Multi-role system with Admin, Installer, and Homeowner roles
- **Leads**: Solar installation requests from homeowners with status workflow
- **Bids**: Competitive bidding system with rich JSON fields for system data
- **Written Quotes**: Alternative quote flow with negotiation history
- **Notifications**: Real-time notification system per user
- **News Engine**: Content management with AI drafting capabilities
- **Blog Feature** (Added 2026-01-26):
  - **BlogAuthor**: Author profiles with status, bio, social links (linked to Users)
  - **BlogComment**: Post comments with moderation workflow (PENDING/APPROVED/REJECTED/SPAM)
  - **BlogPost**: Extended with comments relation and optional BlogAuthor
- **Media Library** (Added 2026-01-26):
  - **MediaAsset**: Files with type (IMAGE/VIDEO/DOCUMENT), trash/restore, tags, metadata
  - **MediaFolder**: Hierarchical folder structure for asset organization

### Authentication Flow
1. NextAuth handles session management with JWT tokens
2. Middleware validates role-based access to protected routes
3. Admins have bypass access to all dashboards for support purposes
4. Password hashing uses bcryptjs with 10 salt rounds

### Design Token System
The application uses a centralized design token approach:
- CSS variables for theme-aware colors (light/dark mode)
- Semantic color tokens (primary, secondary, success, warning, error)
- Typography scale with heading and body text presets
- Consistent spacing, shadows, and animation tokens

## External Dependencies

### Payment Processing
- **Stripe**: Payment processing for lead purchases
  - Client: @stripe/stripe-js
  - Server: stripe SDK

### Email Services
- **SendGrid**: Transactional email delivery (@sendgrid/mail)
- **Resend**: Alternative email provider

### SMS/Voice
- **Twilio**: SMS notifications and OTP verification

### Real-time Communication
- **Pusher**: WebSocket-based real-time notifications and messaging
  - Server: pusher
  - Client: pusher-js

### Cloud Storage
- **AWS S3**: File uploads for documents and images
  - @aws-sdk/client-s3
  - @aws-sdk/s3-request-presigner for secure upload URLs
- **Replit Object Storage**: Media library file storage (Added 2026-01-26)
  - Presigned URL upload flow via sidecar
  - Integration in `src/lib/replit_integrations/object_storage/`

### AI Integration
- **OpenAI**: News content drafting and automation (configured via environment)

### Testing
- **Playwright**: End-to-end testing framework
- **Storybook**: Component documentation and visual testing
- **Chromatic**: Visual regression testing

### Development Tools
- **Husky**: Git hooks for pre-commit checks
- **ESLint**: Code linting with Next.js and Tailwind plugins
- **TypeScript**: Strict mode enabled for type safety
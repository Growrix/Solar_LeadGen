# SolarMatch - Solar Lead Generation Platform

## Overview

SolarMatch is a Next.js 14 solar lead generation web application that connects homeowners seeking solar installations with verified installers. The platform facilitates lead management, competitive bidding, written quotes, and real-time messaging between parties. It features a multi-role system (Admin, Installer, Homeowner) with role-based dashboards and comprehensive notification systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom design tokens defined in `src/design-tokens.js`
- **State Management**: Redux Toolkit with React-Redux for global state
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Real-time Updates**: Pusher.js for WebSocket-based notifications and messaging
- **UI Components**: Custom component library in `src/components/` with semantic design tokens
- **Dark Mode**: Class-based dark mode with CSS variables for theme-aware colors

### Backend Architecture
- **API Layer**: Next.js API routes in `src/app/api/` following RESTful patterns
- **Authentication**: NextAuth.js v4 with Prisma adapter for session management
- **Authorization**: Role-based middleware in `src/middleware.ts` with admin bypass capability
- **Database ORM**: Prisma Client for type-safe database queries
- **File Storage**: AWS S3 with presigned URLs for secure file uploads

### Data Storage
- **Database**: PostgreSQL accessed via Prisma ORM
- **Schema Location**: `prisma/schema.prisma`
- **Key Models**: User, Lead, Bid, Notification, LeadAssignment, WrittenQuote
- **Migrations**: Managed via Prisma Migrate in `prisma/migrations/`

### Authentication & Authorization
- **Provider**: NextAuth.js with credentials-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Session Strategy**: JWT tokens with role claims
- **Role System**: Three roles - ADMIN, INSTALLER, HOMEOWNER
- **Route Protection**: Middleware-based with role verification

### Key Design Patterns
- **UI-First Development**: Build UI with mock data before backend implementation
- **Spec-Driven Workflow**: Features documented in specs before implementation
- **Semantic Design Tokens**: All colors, typography, and spacing use semantic tokens rather than hardcoded values
- **Feature-based Organization**: Components organized by user role (admin, installer, homeowner)

## External Dependencies

### Payment Processing
- **Stripe**: Payment processing for lead purchases and subscriptions
  - Server: `stripe` package
  - Client: `@stripe/stripe-js`

### Email Services
- **Resend**: Primary email delivery service
- **SendGrid**: Alternative email service via `@sendgrid/mail`

### SMS/Phone
- **Twilio**: SMS notifications and phone verification

### Real-time Communication
- **Pusher**: WebSocket service for real-time notifications and messaging
  - Server: `pusher` package
  - Client: `pusher-js`

### Cloud Storage
- **AWS S3**: File storage for documents and images
  - `@aws-sdk/client-s3` for S3 operations
  - `@aws-sdk/s3-request-presigner` for secure upload URLs

### Testing & Quality
- **Playwright**: End-to-end testing configured in `playwright.config.ts`
- **Storybook**: Component development and documentation
- **ESLint**: Code linting with Next.js and Tailwind plugins
- **Husky**: Git hooks for pre-commit checks

### Charts & Visualization
- **Recharts**: Data visualization for analytics dashboards
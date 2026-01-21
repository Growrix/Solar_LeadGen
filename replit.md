# SolarMatch - Solar Lead Generation Platform

## Overview

SolarMatch is a Next.js 14 solar lead generation web application that connects homeowners seeking solar installations with verified installers. The platform supports three user roles (Admin, Installer, Homeowner) with distinct dashboards and workflows including lead management, competitive bidding, written quotes, and real-time messaging.

The application also includes a News Engine feature for content management with AI-assisted article drafting and RSS feed integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom design tokens system (semantic colors, typography)
- **State Management**: Redux Toolkit with React-Redux
- **UI Components**: Custom component library with TipTap rich text editor
- **Real-time**: Pusher.js for live notifications and messaging
- **Forms**: React Hook Form with Zod validation

### Admin Design System (New)
The admin dashboard uses a dedicated design system separate from public pages:

**Design Tokens** (`src/design-tokens/admin/`):
- `colors.ts`: Modern color palette (blue primary, teal accent, semantic status colors)
- `elevation.ts`: 4-level shadow system replacing neumorphic effects
- `spacing.ts`, `typography.ts`, `radius.ts`: Consistent spacing and typography scales

**CSS Variables** (in `globals.css`):
- All admin tokens use `--admin-*` prefix (e.g., `--admin-primary`, `--admin-bg-base`)
- Supports light/dark theme variations

**Component Library** (`src/components/admin/ui/`):
- `AdminButton`: Primary, secondary, ghost, destructive variants
- `AdminInput`: Text input with label, hint, error states
- `AdminSelect`: Dropdown with consistent styling
- `AdminCard`: Container with elevation variants
- `AdminBadge`: Status indicators (primary, success, warning, destructive)
- `AdminModal`: Dialog with header, body, footer sections
- `AdminTable`: Data table with sorting and selection
- `AdminToolbar`: Action bar for bulk operations
- `AdminPagination`: Page navigation controls
- `AdminTabs`: Tab navigation component
- `AdminCheckbox`: Styled checkbox input
- `AdminFileUploader`: Drag-and-drop file upload zone
- `AdminEmptyState`: Placeholder for empty data states

All components use semantic tokens via CSS custom properties for theme flexibility.

### Backend Architecture
- **API Layer**: Next.js API Routes (App Router)
- **Authentication**: NextAuth.js with Prisma adapter, role-based access control
- **Database ORM**: Prisma with PostgreSQL
- **File Storage**: AWS S3 with presigned URLs for uploads
- **Email**: SendGrid and Resend for transactional emails
- **SMS**: Twilio for phone notifications

### Data Models (Key Entities)
- **User**: Supports ADMIN, INSTALLER, HOMEOWNER roles with verification status
- **Lead**: Solar installation requests with quote types (Call/Visit, Written Quote, Bidding)
- **Bid**: Installer bids on leads with detailed system/pricing JSON data
- **WrittenQuote**: Negotiation workflow between installers and homeowners
- **Notification**: Real-time notification system with message keys for i18n
- **NewsItem/NewsSource**: Content management for solar industry news

### Authentication Flow
- NextAuth.js with credentials provider and bcrypt password hashing
- Role-based middleware protection for /admin, /installer, /homeowner routes
- Admin users have bypass access to all protected routes for support purposes
- JWT tokens store user role for client-side authorization

### Key Workflows
1. **Lead Generation**: Homeowners submit requests → Admin approval → Available to installers
2. **Bidding Flow**: Installers bid on leads → Homeowner reviews → Winner selection
3. **Written Quote**: Direct negotiation between installer and homeowner with revision history
4. **News Engine**: RSS ingestion → AI drafting → Admin review → Publication

## External Dependencies

### Database
- **PostgreSQL**: Primary database via Prisma ORM
- Migrations managed through `prisma/migrations/`
- Seed scripts for admin users and test data

### Third-Party Services
- **AWS S3**: Document and image storage with presigned upload URLs
- **Stripe**: Payment processing for lead purchases (`@stripe/stripe-js`, `stripe`)
- **SendGrid/Resend**: Transactional email delivery
- **Twilio**: SMS notifications
- **Pusher**: Real-time WebSocket events for notifications/messaging
- **OpenAI**: AI-powered content generation for News Engine

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT signing secret
- `AWS_*`: S3 bucket configuration
- `STRIPE_*`: Payment processing keys
- `SENDGRID_API_KEY` or `RESEND_API_KEY`: Email service
- `TWILIO_*`: SMS service credentials
- `PUSHER_*`: Real-time notification keys
- `OPENAI_API_KEY`: AI content generation (News Engine)

### Development Tools
- **Storybook**: Component documentation and visual testing
- **Playwright**: End-to-end testing with auth state persistence
- **Husky**: Git hooks for pre-commit checks
- **ESLint**: Code quality with Tailwind CSS plugin
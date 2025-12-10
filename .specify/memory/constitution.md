# SolarMatch Constitution
**Solar Lead Generation Platform - Technical Standards & Principles**

---

## Core Principles

### 0. Development Workflow (UI-First, Spec-Driven)

**Phase 1: UI/UX First - MANDATORY**
- ALL features MUST start with UI/UX implementation
- Build complete UI mockup in isolation (page preview with mock data)
- No backend work until UI is reviewed and approved
- Iterate on UI based on feedback WITHOUT touching backend
- **Approval Gate**: Developer confirms UI/UX meets requirements before proceeding

**Phase 2: Spec Alignment - MANDATORY**
- Update ALL SpecKit files BEFORE backend implementation:
  - `spec.md`: Update functional requirements, success criteria
  - `tasks.md`: Update task status, add new tasks as discovered
  - `execution-plan.md`: Update phase status, timelines
  - `changelog.md`: Document what changed and why
- Every UI change triggers spec update (no exceptions)
- Every error fix triggers spec update (document lesson learned)
- Every new task discovered triggers spec update (add to tasks.md + spec.md)

**Phase 3: Backend Implementation - After UI Approval**
- Implement backend only after UI approved and specs updated
- Use approved UI as contract for API requirements
- Backend changes that affect UI require returning to Phase 1

**Workflow Rule**: UI → Spec Update → Backend → Never Backend First

### I. Next.js App Router First
**All features must use Next.js 14+ App Router architecture**
- Server Components by default (use 'use client' only when necessary)
- File-based routing in `src/app/` directory
- API routes as `route.ts` files with GET/POST/PATCH/DELETE exports
- Parallel routes and layouts for role-based dashboards
- Middleware for authentication and route protection
- **Layout Consistency MANDATORY**: NEVER create standalone pages with separate sidebars/navigation
- **Layout Inheritance**: All dashboard pages MUST use a shared layout (see Route Group Model below)
- **Route Planning**: BEFORE creating new page, verify existing layout and navigation structure
- **No Duplicate UI Elements**: Never recreate sidebars, headers, navigation — always extend existing layouts

#### Route Group Model & Folder Structure Blueprint (Standard)

To eliminate layout duplication and routing drift, all authenticated app pages should live under a single dashboard route group, with public and auth flows separated. New work MUST follow this pattern; legacy role folders remain supported and can be migrated incrementally.

```
app/
 ├─ (marketing)/               # Public site pages
 │   ├─ layout.tsx             # Public layout
 │   ├─ page.tsx               # Home page
 │   └─ about/page.tsx
 │
 ├─ (dashboard)/               # Authenticated app (shared shell)
 │   ├─ layout.tsx             # Sidebar + Topbar wrapper
 │   ├─ page.tsx               # Dashboard overview
 │   ├─ settings/
 │   │   ├─ page.tsx
 │   │   ├─ profile/page.tsx
 │   │   ├─ billing/page.tsx
 │   │   └─ layout.tsx         # Optional local tabs for section
 │   ├─ members/
 │   │   ├─ page.tsx
 │   │   └─ [id]/page.tsx
 │   └─ analytics/
 │       ├─ layout.tsx         # Optional section-level layout
 │       ├─ page.tsx
 │       └─ trends/page.tsx
 │
 ├─ (auth)/                    # Login, Register, Forgot Password
 │   ├─ layout.tsx
 │   └─ login/page.tsx
 │
 └─ api/                       # API routes
     ├─ users/route.ts
     └─ reports/route.ts
```

Rules:
- Global layouts: `/app/layout.tsx` (root), `/app/(marketing)/layout.tsx`, `/app/(dashboard)/layout.tsx`, `/app/(auth)/layout.tsx`.
- Local (section) layouts are optional and scoped: never include Sidebar/Topbar there (inherit from `(dashboard)` layout).
- Subpages must be nested under their parent folder (hierarchical routing only).
- Folder names: lowercase, kebab-case; avoid plural/singular mix unless intentional.

Dashboard layout contract example:

```tsx
// /app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

> No page inside `(dashboard)` may import or redefine Sidebar/Topbar.

Navigation & routing standards:
- Centralize sidebar items in a single config (e.g., `src/config/navigation.ts`). Each entry defines `label`, `href`, `icon`, and optional `subRoutes`.
- Active state derives from the current pathname (via `next/navigation`). Subpages inherit their parent highlight.
- Any new dashboard page MUST be integrated into the sidebar config; standalone dashboard pages are prohibited.

PR guardrails (enforced during review/CI where possible):
- Layout consistency: all dashboard pages render within `/app/(dashboard)/layout.tsx`.
- Navigation check: every new dashboard route has a matching sidebar entry.
- No layout duplication: reject imports of `Sidebar`/`Topbar` from page files.
- Manual layout validation: test page in dev server across all breakpoints (mobile, tablet, desktop).

### II. TypeScript Strict Mode
**Type safety is non-negotiable**
- All files must be `.ts` or `.tsx` (no JavaScript)
- Strict mode enabled in `tsconfig.json`
- No `any` types unless absolutely necessary (document why)
- Type definitions for all props, API responses, and database models
- Extended NextAuth types for custom session fields (`src/types/next-auth.d.ts`)

### III. Database-First Design
**Prisma ORM is the single source of truth**
- All database changes start with `prisma/schema.prisma` updates
- Migrations required: `npx prisma migrate dev --name descriptive_name`
- Always run `npx prisma generate` after schema changes
- Use Prisma Client singleton pattern (`src/lib/prisma.ts`)
- Never write raw SQL without justification
- Teaching comments mandatory for complex schemas

### IV. Authentication & Authorization
**NextAuth.js handles all authentication**
- Credentials provider for email/password authentication
- JWT-based sessions (30-day expiry)
- Password hashing with bcryptjs (10 rounds minimum)
- Role-based access control (GUEST, HOMEOWNER, INSTALLER, ADMIN)
- Middleware enforces route protection (`src/middleware.ts`)
- Admin bypass pattern: Admins can access all routes for support
- Session data includes: `id`, `role`, `email`, `name`, `image`

### V. Security & Privacy
**Security is built-in, not bolted-on**
- Environment variables for all secrets (`.env` file, never committed)
- Password complexity requirements enforced
- Email validation with typo detection
- CSRF protection via NextAuth
- Database credentials use connection pooling (Supabase/Vercel Postgres)
- User input validation on both client and server
- SQL injection protection via Prisma parameterized queries
- Admin operations require ADMIN role verification

### VI. Styling & Theming
**Neumorphic Dark-First Design System**

#### Design Philosophy
- **Neumorphic Design**: Soft shadows create depth perception (works on dark AND light backgrounds)
- **Multi-Theme First**: Built with 3 themes from the start (Dark #121212, Light #E0E5EC, Purple #2C1D4D)
- **Theme-Agnostic Components**: All components work in all themes via CSS variables (no theme-specific code)
- **Custom Components**: No third-party UI libraries (shadcn/ui, Material-UI, etc.)
- **Design Tokens**: Semantic variables for all design decisions (identical names across themes)
- **Utility-First CSS**: Tailwind CSS with custom design token extensions

#### Theme System (Updated: Phase 0.2 - Multi-Theme Implementation)
- **Multi-Theme Architecture**: 3 themes supported (Dark, Light, Purple Dark)
- **Theme Switching**: Class-based system (`.theme-dark`, `.theme-light`, `.theme-purple` on `<html>`)
- **ThemeProvider**: React Context manages theme state and persists to `localStorage`
- **CSS Variables**: All themes use identical variable names, only values differ
- **Dynamic Switching**: Theme changes apply instantly via CSS variable updates (200ms transition)
- **Default Theme**: Dark (#121212 background) - Google AI Studio aligned
- **Light Theme**: Neumorphic light (#E0E5EC background) with dark text
- **Purple Theme**: Premium dark purple (#2C1D4D background) with lavender accents

**Theme Architecture**:
```css
/* All themes share same variable names */
:root.theme-dark {
  --color-background: 18 18 18;        /* #121212 */
  --color-foreground: 243 244 246;     /* #F3F4F6 */
  --shadow-dark: #000000;
  /* ... 15+ variables */
}

:root.theme-light {
  --color-background: 224 229 236;     /* #E0E5EC */
  --color-foreground: 18 18 18;        /* #121212 */
  --shadow-dark: #A3B1C6;
  /* ... same variable names, different values */
}

:root.theme-purple {
  --color-background: 44 29 77;        /* #2C1D4D */
  --color-foreground: 233 227 255;     /* #E9E3FF */
  --shadow-dark: #1A112E;
  /* ... same variable names, different values */
}
```

**Component Requirements**:
- ALL components MUST be tested in all 3 themes before completion
- Use design token utilities only: `bg-background`, `text-foreground`, `shadow-neu-outset`
- NEVER use hardcoded colors: `bg-slate-700`, `dark:bg-gray-800` are prohibited
- ThemeSwitcher component available in HeaderMenu and TopBar for user preference

#### Design Token Architecture

**Two-Tier System**: Primitives → Semantic Tokens

```
Primitives (Raw Values)          Semantic Tokens (Meaningful Names)
├── #101010, #1A1A1A            → bg-primary, bg-secondary
├── #00DFA9, #00B88A            → bg-accent, text-accent
├── 12px, 14px, 16px            → text-body, text-heading-1
└── 4px, 8px, 12px, 16px        → space-xs, space-sm, space-md
```

**Token Sources**:
- **TypeScript Files**: `src/design-tokens/` (colors.ts, typography.ts, spacing.ts, shadows.ts, animations.ts)
- **CSS Variables**: `src/app/globals.css` (mapped from TypeScript tokens)
- **Tailwind Config**: `tailwind.config.js` extends theme with semantic tokens

#### Component Standards (Updated: Phase 0.2 - Multi-Theme Requirements)

**MANDATORY: All Components Must Support All 3 Themes**
- Every component MUST be tested in Dark, Light, AND Purple themes before completion
- Use ThemeSwitcher during development to verify visual correctness in all themes
- Components failing in any theme MUST be fixed before marking complete

**Never Use Hardcoded Values**:
- ❌ `bg-slate-700`, `text-teal-500`, `border-gray-300`
- ❌ `text-2xl`, `font-bold`, `px-6`
- ❌ `dark:text-white`, `dark:bg-slate-800`
- ❌ ANY theme-specific classes or conditionals

**Always Use Design Tokens**:
- ✅ `bg-background`, `bg-surface`, `text-foreground`
- ✅ `text-heading-2`, `text-body`, `text-muted-foreground`
- ✅ `shadow-neu-outset`, `shadow-neu-inset`
- ✅ CSS variables handle ALL theming automatically (zero theme-specific code)

**Neumorphic Component Classes** (Theme-Agnostic):
- **Buttons**: `.neu-btn-primary`, `.neu-btn-secondary`, `.neu-btn-link`, `.neu-btn-icon`
- **Cards**: `.neu-card`, `.theme-card`, `.neu-card-hover`
- **Inputs**: `.neu-input`, `.auth-input-icon`, `.neu-input-error`
- **Shadows**: `.shadow-neu-outset`, `.shadow-neu-inset`, `.shadow-neu-card`

**Centralized Components** (src/components/auth/):
- AuthInput, AuthButton, AuthModal, AuthAlert, AuthDivider, SocialAuthButtons
- ThemeSwitcher component for user theme selection
- Icon library: `src/components/icons/auth/`
- All auth components use consistent neumorphic styling across all themes

#### Quality Validation (Updated: Phase 0.2 - Multi-Theme Testing)

**Manual QA Checklist** (Required for all UI changes):
- [ ] **DARK THEME TEST**: Switch to Dark theme → Component renders correctly, text readable, shadows visible
- [ ] **LIGHT THEME TEST**: Switch to Light theme → Component renders correctly, text readable, neumorphic shadows visible
- [ ] **PURPLE THEME TEST**: Switch to Purple theme → Component renders correctly, text readable, purple shadows visible
- [ ] **Theme Switching**: All 3 themes switch instantly (no flash, no lag, colors update correctly)
- [ ] All interactive states work (hover, focus, active, disabled) in ALL 3 themes
- [ ] Responsive design tested (mobile 320px, tablet 768px, desktop 1024px+) in ALL 3 themes
- [ ] Accessibility validated (WCAG 2.1 AA, keyboard navigation, ARIA labels) in ALL 3 themes
- [ ] Zero hardcoded values (all use design tokens)
- [ ] No console errors or warnings

**Component Completion Criteria**:
- Component CANNOT be marked complete unless it passes QA in ALL 3 themes
- IF any theme fails, component must be fixed before moving forward
- Theme testing is NOT optional - it is MANDATORY for every component
- [ ] Component logic preserved (if migrating from old patterns)

**Atomic Migration Rule**:
- Only ONE component or feature per commit
- No batch refactoring (too risky, hard to review)
- Each migration includes before/after validation

**Browser Testing**:
- Chrome DevTools for responsive testing
- Manual testing on real devices when possible
- Focus ring visibility check for accessibility

#### Mobile-First Rules (Unchanged and Enforced)

- Mobile-first design 320–640px
- Typography base 14px mobile / 16px desktop
- Spacing tighter on mobile (50–75% of desktop)
- Touch targets ≥ 44×44px (WCAG 2.5.5)
- Progressive enhancement (mobile → tablet → desktop)

#### Current State

**Completed**:
- Design token system (`src/design-tokens/`)
- Neumorphic CSS classes (`src/app/globals.css`)
- Centralized auth components (`src/components/auth/`)
- Tailwind config with semantic tokens
- Icon library for auth flows

**In Progress**:
- Component-by-component migration (spec 006)
- 40% → 95% design system compliance
- Eliminating 285 hardcoded class violations

**Reference Documents**:
- `DOC/DESIGN-SYSTEM-SOT.md`: Complete token reference
- `DOC/DESIGN-SYSTEM-AUDIT-REPORT.md`: Compliance status and action plan
- `specs/006-component-by-component/spec.md`: Migration specification
- `specs/007-migration-and-build/spec.md`: **Migration and Build Execution Standards (MANDATORY)** - Complete workflow, verification commands, and quality gates for ALL migration and build work

### VII. Code Documentation
**Teaching-first documentation philosophy**
- Extensive inline comments explaining "why", not just "what"
- File headers with purpose, structure, and usage examples
- API routes: Document inputs, outputs, error cases, and security
- Complex logic: Step-by-step explanations for future developers
- Database models: Field descriptions, relationships, and constraints
- Configuration files: Setup instructions and troubleshooting tips

---

## Technical Stack

### Core Framework
- **Next.js**: 14.2.33 (App Router, Server Components)
- **React**: 18.2.0 (Server/Client Components)
- **TypeScript**: ~5.3.3 (Strict mode)
- **Node.js**: 20.8+ (LTS version)

### Database & ORM
- **Prisma**: 6.17.1 (ORM and migration tool)
- **@prisma/client**: 6.17.1 (Generated client)
- **PostgreSQL**: Supabase-hosted (connection pooling)
- **Database URL**: Environment variable with pooler support

### Authentication
- **next-auth**: 4.24.11 (NextAuth.js v4)
- **@next-auth/prisma-adapter**: 1.0.7 (Database sessions)
- **bcryptjs**: 3.0.2 (Password hashing)
- **@types/bcryptjs**: 2.4.6 (TypeScript types)

### Styling & UI
- **Tailwind CSS**: 3.4.18 (Utility-first CSS with custom design tokens)
- **PostCSS**: 8.5.6 (CSS processing)
- **Autoprefixer**: 10.4.21 (Browser compatibility)
- **Design Tokens**: Custom system in `src/design-tokens/` (TypeScript interfaces)
- **Neumorphic Components**: Custom-built in `src/components/` (no third-party UI library)
- **recharts**: 3.2.1 (Data visualization for dashboards)

### Development Tools
- **ESLint**: 8.53.0 (Code linting)
- **eslint-config-next**: 14.2.33 (Next.js rules)
- **tsx**: For running TypeScript scripts (e.g., seed files)

### Package Manager
- **npm**: Primary package manager (not yarn/pnpm)
- Scripts: `dev`, `build`, `start`, `lint`, `seed:admin`

---

## Project Structure Standards

### Directory Organization
```
solarmatch/
├── src/
│   ├── app/                    # Next.js App Router (pages & API routes)
│   │   ├── api/               # API endpoints (route.ts files)
│   │   │   ├── auth/          # Authentication APIs
│   │   │   ├── newsletter/    # Newsletter subscription
│   │   │   ├── instant-quote/ # Quote generation
│   │   │   └── admin/         # Admin management APIs
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── homeowner/         # Homeowner dashboard pages
│   │   ├── installer/         # Installer dashboard pages
│   │   ├── blog/              # Blog pages
│   │   ├── layout.tsx         # Root layout (NextAuthProvider, ThemeProvider)
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable React components (33+ components)
│   │   ├── *SignInModal.tsx   # Role-specific login modals
│   │   ├── *SignupModal.tsx   # Role-specific signup modals
│   │   ├── *BottomNavBar.tsx  # Role-specific navigation bars
│   │   ├── ThemeProvider.tsx  # Dark mode context provider
│   │   └── NextAuthProvider.tsx # NextAuth session provider
│   ├── lib/                   # Utility libraries
│   │   └── prisma.ts          # Prisma Client singleton
│   ├── types/                 # TypeScript type definitions
│   │   └── next-auth.d.ts     # Extended NextAuth types
│   ├── middleware.ts          # Route protection & role-based access
│   └── globals.css            # Global CSS (minimal, Tailwind-based)
├── prisma/
│   ├── schema.prisma          # Database schema (single source of truth)
│   ├── migrations/            # SQL migration files (auto-generated)
│   └── seed-admin.ts          # Admin user seeding script
├── DOC/                       # Documentation & progress reports
│   ├── Records/               # Implementation records & audits
│   ├── executionPlan.md       # Agile feature roadmap
│   └── *.md                   # Feature-specific documentation
├── .github/
│   ├── copilot-instructions.md # AI assistant guidelines
│   └── prompts/               # SpecKit prompt templates
├── .specify/
│   ├── memory/
│   │   └── constitution.md    # This file
│   └── templates/             # SpecKit templates
├── .env                       # Environment variables (NEVER commit)
├── .env.example               # Environment template (commit this)
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── next.config.js             # Next.js configuration
```

### File Naming Conventions
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx` (route-specific layouts)
- **API Routes**: `route.ts` (HTTP method exports)
- **Components**: PascalCase (e.g., `HomeownerSignupModal.tsx`)
- **Utilities**: camelCase (e.g., `prisma.ts`)
- **Types**: `.d.ts` extension (e.g., `next-auth.d.ts`)
- **Migrations**: Timestamp + description (e.g., `20251012_add_user_authentication`)

---

## Database Schema Standards

### Model Naming
- **Singular PascalCase**: `User`, `GuestInstantQuote`, `NewsletterSubscriber`
- **Table mapping**: Use `@@map("plural_snake_case")` for database table names
- **Enums**: PascalCase values (e.g., `UserRole { GUEST, HOMEOWNER, INSTALLER, ADMIN }`)

### Field Requirements
- **Primary Keys**: `id String @id @default(cuid())` (CUID for distributed systems)
- **Timestamps**: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- **Email Fields**: `@unique` constraint, validated on application layer
- **Status Fields**: Use enums (not strings) for type safety
- **Relations**: Always use `@relation` with proper cascade behavior

### Current Schema Models
1. **User** - Authentication & profiles (email, password, role, timestamps)
2. **Account** - OAuth provider data (NextAuth required)
3. **Session** - Active user sessions (NextAuth required)
4. **VerificationToken** - Email verification (NextAuth required)
5. **GuestInstantQuote** - Anonymous quote requests (48 fields, comprehensive)
6. **NewsletterSubscriber** - Email subscriptions (email, subscribed date, active status)

---

## API Design Standards

### Endpoint Structure
- **RESTful conventions**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **File location**: `src/app/api/[resource]/route.ts`
- **Authentication**: Check session with `getServerSession(authOptions)`
- **Response format**: JSON with consistent structure

### Request Validation
```typescript
// 1. Parse request body
const body = await request.json();

// 2. Validate required fields
if (!body.email || !body.password) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  );
}

// 3. Validate format (email, password strength, etc.)
// 4. Check business logic (duplicates, permissions, etc.)
// 5. Perform database operation
// 6. Return success or error response
```

### Error Handling
- **400 Bad Request**: Invalid input, validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate data (e.g., email already exists)
- **500 Internal Server Error**: Unexpected server errors (log details)

### Security Checklist
- [ ] Authentication check (if protected endpoint)
- [ ] Role authorization (if role-specific)
- [ ] Input validation & sanitization
- [ ] Rate limiting (future: implement for public endpoints)
- [ ] Error messages don't leak sensitive data
- [ ] Passwords never returned in responses

---

## Authentication Patterns

### User Registration Flow
1. User fills signup form (name, email, password)
2. Frontend sends POST to `/api/auth/register/[role]`
3. Server validates input (email format, password strength)
4. Check for duplicate email (`findUnique`)
5. Hash password with bcryptjs (10 rounds)
6. Create user with role (HOMEOWNER or INSTALLER)
7. Return success (do NOT auto-login, require explicit signIn)

### User Login Flow
1. User fills login form (email, password)
2. Frontend calls `signIn('credentials', { email, password })`
3. NextAuth validates with CredentialsProvider
4. Provider queries database for user (`findUnique`)
5. Verify password with bcrypt.compare()
6. Check if account is active (`isActive` field)
7. Update `lastLoginAt` timestamp
8. Create JWT token with user data (id, role, email, name, image)
9. Return session to client

### Session Management
- **JWT Strategy**: Tokens stored client-side, verified server-side
- **Expiration**: 30 days (configurable in NextAuth options)
- **Refresh**: Automatic on session check
- **Custom Fields**: Added via `jwt` and `session` callbacks
- **Access**: `useSession()` hook (client), `getServerSession()` (server)

### Route Protection
```typescript
// middleware.ts pattern
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Admin bypass (support access)
    if (token.role === 'ADMIN') return NextResponse.next();
    
    // Role-based checks
    if (path.startsWith('/homeowner') && token.role !== 'HOMEOWNER') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public paths (login pages)
        if (req.nextUrl.pathname === '/admin') return true;
        
        // Protected paths require token
        return !!token;
      }
    }
  }
);
```

---

## Page & Routing Architecture Standards

### Layout Structure (CRITICAL)

**NEVER create standalone pages with duplicate UI elements**

#### Current Layout Hierarchy
```
src/app/
├── layout.tsx                 # Root layout (NextAuthProvider, ThemeProvider)
├── page.tsx                   # Public homepage
├── admin/
│   ├── layout.tsx            # Admin layout (AdminSidebar, AdminHeader)
│   ├── page.tsx              # Admin dashboard home
│   └── [feature]/
│       └── page.tsx          # Admin feature pages (inherit admin layout)
├── homeowner/
│   ├── layout.tsx            # Homeowner layout (HomeownerSidebar, HomeownerHeader)
│   ├── page.tsx              # Homeowner dashboard home
│   └── [feature]/
│       └── page.tsx          # Homeowner feature pages (inherit homeowner layout)
├── installer/
│   ├── layout.tsx            # Installer layout (InstallerSidebar, InstallerHeader)
│   ├── page.tsx              # Installer dashboard home
│   └── [feature]/
│       └── page.tsx          # Installer feature pages (inherit installer layout)
└── blog/
    └── page.tsx              # Public blog pages
```

### Mandatory Pre-Page Creation Workflow

**BEFORE creating ANY new page, complete this 10-minute audit**:

#### 1. Layout Discovery (5 minutes)
```bash
# Find existing layouts
ls -la src/app/**/layout.tsx

# Read the target role's layout file
cat src/app/admin/layout.tsx           # For admin pages
cat src/app/homeowner/layout.tsx       # For homeowner pages
cat src/app/installer/layout.tsx       # For installer pages

# Check what components the layout uses
grep -E "(Sidebar|Header|Nav)" src/app/admin/layout.tsx
```

**Checklist**:
- [ ] I have read the existing layout file for my target role
- [ ] I understand what UI elements the layout provides (sidebar, header, navigation)
- [ ] I know where my new page will be placed in the route hierarchy
- [ ] I verified the layout uses correct role-based components

#### 2. Navigation Structure Discovery (3 minutes)
```bash
# Find sidebar/navigation components
ls -la src/components/*Sidebar* src/components/*Nav*

# Read the sidebar component for target role
cat src/components/AdminSidebar.tsx       # For admin pages
cat src/components/HomeownerSidebar.tsx   # For homeowner pages
cat src/components/InstallerSidebar.tsx   # For installer pages

# Check existing navigation links
grep -E "(href|Link)" src/components/AdminSidebar.tsx
```

**Checklist**:
- [ ] I have read the sidebar component for my target role
- [ ] I understand the existing navigation structure
- [ ] I know where my new page link should be added in the sidebar
- [ ] I verified the sidebar uses consistent link patterns

#### 3. Routing Pattern Verification (2 minutes)
```bash
# List existing pages in target role
ls -la src/app/admin/**/*.tsx            # For admin
ls -la src/app/homeowner/**/*.tsx        # For homeowner
ls -la src/app/installer/**/*.tsx        # For installer

# Check route naming patterns
ls -la src/app/admin/
```

**Checklist**:
- [ ] I understand the existing route naming pattern (kebab-case, camelCase, etc.)
- [ ] I know if my feature should be a single page or a nested route
- [ ] I verified no duplicate or conflicting routes exist

### Page Creation Rules

#### ✅ CORRECT: Inherit Existing Layout
```typescript
// ✅ src/app/admin/settings/page.tsx
// This page automatically inherits AdminSidebar + AdminHeader from admin/layout.tsx

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      {/* Page content only - no sidebar, no header */}
    </div>
  );
}
```

#### ❌ WRONG: Create Standalone Page with Duplicate UI
```typescript
// ❌ NEVER DO THIS
// src/app/admin/settings/page.tsx

import { AdminSidebar } from '@/components/AdminSidebar';  // ❌ Duplicate
import { AdminHeader } from '@/components/AdminHeader';    // ❌ Duplicate

export default function AdminSettingsPage() {
  return (
    <div className="flex">
      <AdminSidebar />  {/* ❌ Already in layout */}
      <div className="flex-1">
        <AdminHeader />  {/* ❌ Already in layout */}
        <div className="p-6">
          <h1>Settings</h1>
        </div>
      </div>
    </div>
  );
}
```

### Navigation Link Addition

**When adding new page, update ONLY the sidebar component**:

#### ✅ CORRECT: Add Link to Existing Sidebar
```typescript
// src/components/AdminSidebar.tsx
export function AdminSidebar() {
  return (
    <aside>
      <nav>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/settings">Settings</Link>  {/* ✅ Added here */}
      </nav>
    </aside>
  );
}
```

#### ❌ WRONG: Create New Sidebar or Duplicate Links
```typescript
// ❌ NEVER create a separate sidebar for one page
// src/components/SettingsSidebar.tsx  // ❌ Don't create this
```

### Mobile-Responsive Layout Patterns

**Mobile layouts MUST differ from desktop layouts**:

#### Desktop Layout (> 768px)
```typescript
// src/app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop: Sidebar visible on left */}
      <AdminSidebar className="hidden md:block w-64" />
      
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### Mobile Layout (< 768px)
```typescript
// src/app/admin/layout.tsx
export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile: Header with hamburger menu */}
      <AdminHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {/* Mobile: Sidebar as overlay/drawer */}
      <AdminSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        className="md:hidden"
      />
      
      {/* Desktop: Sidebar visible on left */}
      <div className="flex flex-1">
        <AdminSidebar className="hidden md:block w-64" />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Route Organization Best Practices

#### Feature-Based Routing
```
src/app/admin/
├── layout.tsx              # Admin layout (sidebar, header)
├── page.tsx                # Admin dashboard home
├── users/
│   ├── page.tsx           # List users
│   ├── [id]/
│   │   └── page.tsx       # View/edit specific user
│   └── new/
│       └── page.tsx       # Create new user
├── leads/
│   ├── page.tsx           # List leads
│   └── [id]/
│       └── page.tsx       # View/edit specific lead
└── settings/
    ├── page.tsx           # Settings home
    ├── profile/
    │   └── page.tsx       # Profile settings
    └── billing/
        └── page.tsx       # Billing settings
```

### 🚨 Red Flags - Layout/Routing Issues

**STOP immediately if you see ANY of these**:

1. **Duplicate Sidebar Import**: Page imports sidebar component directly
2. **Duplicate Header Import**: Page imports header component directly
3. **Inconsistent Navigation**: Different pages have different sidebar menus
4. **Standalone Layout**: Page creates its own layout without using app/[role]/layout.tsx
5. **Route Conflicts**: Multiple pages with same route path
6. **Missing Mobile Layout**: Layout doesn't adapt to mobile (no hamburger menu, drawer, or bottom nav)
7. **Hardcoded Role Checks in Pages**: Pages check user role instead of using layout hierarchy
8. **Duplicate Navigation Links**: Same link appears in multiple places

### Page Creation Checklist (Mandatory)

**Before creating new page, verify**:

- [ ] I have read the existing layout file (`src/app/[role]/layout.tsx`)
- [ ] I have read the existing sidebar component (`src/components/[Role]Sidebar.tsx`)
- [ ] I understand the current route structure for this role
- [ ] I know where my new page fits in the navigation hierarchy
- [ ] My new page does NOT import sidebar or header components
- [ ] My new page will inherit layout from parent layout.tsx
- [ ] I will only update the sidebar component to add navigation link
- [ ] I have verified no duplicate or conflicting routes exist
- [ ] I have planned mobile-responsive layout (if custom layout needed)
- [ ] I have verified the page will work on mobile (320px-640px width)

**After creating new page, verify**:

- [ ] Page renders correctly with inherited layout (sidebar + header visible)
- [ ] Navigation link in sidebar works (correct href, active state)
- [ ] Page is accessible at correct URL
- [ ] Page respects role-based access control (middleware protection)
- [ ] Mobile layout works (drawer/overlay sidebar, responsive spacing)
- [ ] No duplicate UI elements (only one sidebar, only one header)

---

## Mobile-First Responsive Design Standards

### Philosophy: Design for Mobile FIRST, Scale Up

**Industry Standard**: Progressive Enhancement (Mobile → Tablet → Desktop)

#### Why Mobile-First?
- **70%+ of users** access web apps on mobile devices
- **Mobile constraints** force better UX decisions (simplified, focused)
- **Easier to scale up** (add features for desktop) than scale down (remove features for mobile)
- **Performance benefits** (load only what's needed for mobile, enhance for desktop)

### Viewport Breakpoints (Tailwind CSS)

**Critical**: Design for SMALLEST screen first, then add responsive classes.

```
Mobile:      < 640px   (sm: prefix)   [DEFAULT - no prefix needed]
Tablet:      640-1024px (md: prefix)
Desktop:     > 1024px   (lg: prefix)
Large:       > 1280px   (xl: prefix)
Extra Large: > 1536px   (2xl: prefix)
```

### Mobile-First Typography

**Problem**: Desktop font sizes are TOO LARGE on mobile (poor readability, excessive scrolling).

#### ✅ CORRECT: Mobile-First Font Sizes
```tsx
// ✅ Mobile-first: base 14px, desktop 16px
<p className="text-base md:text-lg">
  Body text is 14px on mobile, 16px on desktop
</p>

// ✅ Mobile-first: h1 is 24px mobile, 36px desktop
<h1 className="text-3xl md:text-5xl font-bold">
  Main Heading
</h1>

// ❌ WRONG: Same size on all devices (too big on mobile)
<p className="text-lg">  {/* 16px on mobile - TOO BIG */}
  This text is too large on small screens
</p>
```

### Mobile-First Spacing

**Problem**: Desktop spacing (24px, 32px) creates excessive white space on mobile.

```tsx
// ✅ Mobile: 16px padding, Desktop: 24px padding
<div className="p-4 md:p-6">
  Content with responsive padding
</div>

// ❌ WRONG: Same spacing on all devices (too much on mobile)
<div className="p-8">  {/* 32px padding on mobile - EXCESSIVE */}
  Content loses visible space
</div>
```

### Mobile-First Component Layouts

#### Cards
```tsx
// ✅ CORRECT: Full-width mobile, grid desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>

// ❌ WRONG: Fixed 3-column grid (breaks on mobile)
<div className="grid grid-cols-3 gap-6">  {/* Tiny columns on mobile */}
  <Card />
</div>
```

#### Forms
```tsx
// ✅ CORRECT: Full-width mobile, multi-column desktop
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField label="First Name" />  {/* Stack on mobile, side-by-side desktop */}
    <FormField label="Last Name" />
  </div>
  
  <Button className="w-full md:w-auto">
    Submit
  </Button>
</form>
```

#### Tables
```tsx
// ✅ CORRECT: Card-based mobile, table desktop
<div className="block md:hidden">
  {/* Mobile: Stack as cards */}
  {data.map(item => (
    <Card key={item.id} className="p-4 mb-4">
      <div className="font-bold">{item.name}</div>
      <div className="text-sm text-gray-600">{item.email}</div>
    </Card>
  ))}
</div>

<div className="hidden md:block overflow-x-auto">
  {/* Desktop: Traditional table */}
  <table className="w-full">...</table>
</div>
```

### Touch-Friendly Mobile UI

**WCAG 2.5.5**: Minimum touch target size is 44px × 44px.

#### Buttons
```tsx
// ✅ CORRECT: Larger touch targets on mobile
<Button className="h-12 md:h-10 px-6 md:px-4 text-base md:text-sm">
  Click Me
</Button>

// ❌ WRONG: Tiny buttons on mobile (hard to tap)
<Button className="h-8 px-2 text-sm">  {/* 32px height - too small */}
  Click Me
</Button>
```

#### Navigation
```tsx
// ✅ CORRECT: Bottom navigation mobile, sidebar desktop
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
  <div className="flex justify-around">
    <NavLink href="/dashboard" icon={<HomeIcon />}>
      Home
    </NavLink>
  </div>
</nav>

<aside className="hidden md:block w-64 border-r">
  <nav className="p-4">
    <NavLink href="/dashboard">Dashboard</NavLink>
  </nav>
</aside>
```

### Mobile-First Testing Checklist

**For EVERY page/component, test on mobile FIRST**:

- [ ] **320px width**: iPhone SE (smallest common device)
- [ ] **375px width**: iPhone 12/13 (most common)
- [ ] **414px width**: iPhone 14 Pro Max (large phone)
- [ ] Text is readable (minimum 14px font size)
- [ ] Touch targets are minimum 44px × 44px
- [ ] No horizontal scroll (content fits in viewport)
- [ ] Spacing is comfortable (not cramped or excessive)
- [ ] Navigation is thumb-friendly (bottom nav or easy-to-reach)
- [ ] Forms are usable (full-width inputs, large buttons)
- [ ] Modals work correctly (full-screen on mobile or properly sized)
- [ ] Tables are readable (card layout or horizontal scroll)
- [ ] Performance is good (< 3s load time on 3G)

### App-Like Mobile Experience Characteristics

- **Full-Screen Content**: No wasted space, edge-to-edge design
- **Bottom Navigation**: Thumb-friendly (not top hamburger menu)
- **Large Touch Targets**: Minimum 44px, prefer 48-56px
- **Simplified UI**: Fewer options, focused interactions
- **Loading States**: Skeleton screens, not just spinners

### Mobile-First Red Flags 🚨

**STOP immediately if you see**:

1. **Fixed Desktop Widths**: `w-[600px]` without responsive alternative
2. **Tiny Text on Mobile**: `text-xs` or smaller as body text
3. **Excessive Spacing**: `p-8` or larger without mobile override
4. **Multi-Column on Mobile**: `grid-cols-3` without `grid-cols-1` for mobile
5. **Small Touch Targets**: Buttons < 44px height on mobile
6. **Horizontal Scroll**: Content wider than viewport on mobile
7. **Desktop-Only Navigation**: Sidebar without mobile hamburger/drawer
8. **Same Table on Mobile**: No card alternative for complex tables

---

## Component Architecture

### Server vs Client Components
**Default to Server Components** (better performance, smaller bundles)
- No `'use client'` directive needed
- Can fetch data directly (async components)
- Direct database access allowed
- Cannot use hooks (useState, useEffect, useContext)

**Use Client Components when:**
- Interactive features (onClick, onChange, etc.)
- React hooks required (useState, useEffect)
- Browser APIs needed (localStorage, window)
- Context providers (ThemeProvider, NextAuthProvider)

### Provider Pattern
```typescript
// Root layout wraps entire app with providers
<NextAuthProvider>        {/* Session context */}
  <ThemeProvider>          {/* Dark mode context */}
    <LayoutContent>
      {children}           {/* Page content */}
    </LayoutContent>
  </ThemeProvider>
</NextAuthProvider>
```

### Component Props
- Always type props with TypeScript interfaces
- Use optional props with default values
- Destructure props for clarity
- Document complex prop types with JSDoc comments

### Modal Components
- Controlled components (parent manages open/close state)
- Backdrop click closes modal (unless critical action pending)
- Escape key closes modal
- Focus trap for accessibility
- Form validation before submission

---

## Development Workflow

### Feature Implementation Cycle
1. **Audit Current State** - Review existing code/database/APIs
2. **Plan Feature** - Document in `DOC/` directory with clear spec
3. **Update Schema** - Modify `prisma/schema.prisma` if needed
4. **Run Migration** - `npx prisma migrate dev --name feature_name`
5. **Build Backend** - Create API routes with validation
6. **Build Frontend** - Create/update components
7. **Test Manually** - Verify all flows work correctly
8. **Document** - Update progress reports and implementation notes
9. **Commit** - Clear commit message describing what was built
10. **Move to Next Feature** - Iterate

### Git Workflow
- **Branch**: `Version-2` (current development branch)
- **Commits**: Descriptive messages ("Add development quick access menu to admin dashboard")
- **Never commit**: `.env` files, `node_modules/`, build artifacts
- **Always commit**: `.env.example`, migration files, type definitions

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in database connection string (Supabase/Vercel Postgres)
3. Add NextAuth secret: `openssl rand -base64 32`
4. Run `npm install` to install dependencies
5. Run `npx prisma generate` to generate Prisma Client
6. Run `npx prisma migrate dev` to apply migrations
7. Run `npm run seed:admin` to create initial admin user
8. Run `npm run dev` to start development server

### Testing Checklist
- [ ] Authentication flows (signup, login, logout)
- [ ] Role-based access control (each role can only access their routes)
- [ ] Admin bypass (admins can access all dashboards)
- [ ] Form validations (client-side and server-side)
- [ ] Error handling (display user-friendly messages)
- [ ] Database operations (create, read, update work correctly)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode (components render correctly in both themes)

---

## Development Workflow Standards

### Mandatory Pre-Phase Workflow
**EVERY feature phase MUST begin with this 30-60 minute audit**

#### 1. Specification Review (20 minutes)
- [ ] Read ALL spec files thoroughly (`spec.md`, `data-model.md`, `contracts/*.openapi.yaml`)
- [ ] Identify ALL affected database models and fields
- [ ] Review API contracts for exact request/response structures
- [ ] List all new types, interfaces, and enums needed
- [ ] Verify no conflicts with existing models or fields
- [ ] Document assumptions and edge cases
- [ ] **RULE**: If spec says use existing field, use it. Don't invent new fields mid-implementation.

#### 2. Schema Verification (10 minutes)
```bash
# Check Prisma schema for exact model structure
cat prisma/schema.prisma | grep -A 20 "model YourModel"

# Validate schema matches spec
npx prisma validate

# Check what relations exist
grep -E "model (User|Lead|YourModel)" prisma/schema.prisma -A 15
```
- [ ] Verify all required fields exist in schema
- [ ] Check field types match spec (String vs Int vs DateTime)
- [ ] Verify relations match data model (userId vs leadId)
- [ ] Confirm enums match spec values

#### 3. Service Signature Verification (10 minutes)
```bash
# Check what a service actually exports
grep "^export" src/lib/services/your-service.ts

# Check function signatures
grep "export async function" src/lib/services/your-service.ts -A 3

# Example: Before calling getSetting()
grep "export.*getSetting" src/lib/services/settings-service.ts -A 5
# Result: getSetting(key: string) - only ONE parameter!
```
- [ ] Verify all service functions exist with correct signatures
- [ ] Check parameter types and return types
- [ ] Note async vs sync functions
- [ ] Identify required imports

#### 4. Type Verification (5 minutes)
```bash
# Check NextAuth session type
grep -A 20 "interface Session" src/types/next-auth.d.ts

# Check if field exists in session.user
grep "interface.*User" src/lib/auth.ts -A 10

# Check Prisma Client types
grep "export.*YourType" src/types/your-type.ts -A 10
```
- [ ] Verify all TypeScript types exist
- [ ] Check type definitions match Prisma models
- [ ] Confirm session types include needed fields

#### 5. Existing Patterns Review (10 minutes)
- [ ] Open 2-3 similar existing files
- [ ] Note how they import Prisma client: `import { prisma } from '@/lib/prisma'`
- [ ] Note how they handle errors: try/catch patterns
- [ ] Note how they call other services: `await createAuditLog({ ... })`
- [ ] Copy-paste patterns, don't reinvent

#### 6. Pre-Implementation Checklist
- [ ] Read spec section for this phase completely
- [ ] Checked Prisma schema matches spec requirements
- [ ] Verified all service functions I'll call exist with correct signatures
- [ ] Confirmed all types I'll use exist and have required fields
- [ ] Reviewed 1-2 similar existing files for patterns
- [ ] Identified all imports needed (services, types, Prisma)
- [ ] Know exact field names from spec (not inventing new ones)

**TIME INVESTMENT**: 30-60 minutes of verification SAVES 3+ hours of build error fixing

---

### Mandatory During-Phase Workflow
**For EACH task within a phase**

#### Spec-Driven Implementation
1. **Re-read relevant spec section FIRST** before coding
2. **Copy exact field names** from spec (don't paraphrase)
3. **Use existing service patterns** (grep for similar code)
4. **Type everything strictly** (no `any` unless documented)
5. **Test incrementally** (don't wait until end of phase)

#### Manual QA Checklist (For Tasks with Frontend + Backend)
**Required for ANY task that includes BOTH backend and frontend changes**

Create checklist directly under task with:
- [ ] UI state validation (loading, success, error states)
- [ ] API call testing (success path)
- [ ] API call testing (at least ONE error path)
- [ ] Data accuracy verification (database check)
- [ ] Theme switching (Light/Dark/System)
- [ ] Interactive states (hover, focus, active, disabled)
- [ ] Responsive breakpoints (mobile, tablet, desktop)
- [ ] Accessibility check (ARIA labels, keyboard navigation)
- [ ] Console error check (no errors/warnings)

**Role-Specific QA Steps**:
- Admin: Can perform action, sees correct data, proper authorization
- Homeowner: Can only access own data, sees correct UI
- Installer: Can only access purchased leads, correct permissions
- Guest: Redirected appropriately, cannot access protected routes

---

### Mandatory Post-Phase Workflow
**MUST COMPLETE BEFORE ANY COMMIT**

#### Validation Checklist (30-45 minutes)
- [ ] **Schema Validation**: Run `npx prisma validate` - must pass with 0 errors
- [ ] **Schema-Spec Alignment**: Verify schema matches spec exactly (fields, types, relations)
- [ ] **TypeScript Check**: Run `npx tsc --noEmit` - must pass with 0 errors
- [ ] **Build Check**: Run `npm run build` - must pass (0 errors, warnings acceptable if documented)
- [ ] **Service Integration**: All service calls use correct function names and signatures
- [ ] **Type Safety**: No `any` types introduced (or documented if unavoidable)
- [ ] **Import Correctness**: All imports resolve correctly (no missing modules)
- [ ] **Database Query Test**: Test database operations work (create, read, update, delete)
- [ ] **API Testing** (if applicable):
  - [ ] Test with curl, Postman, or Thunder Client
  - [ ] Verify request/response matches OpenAPI contract
  - [ ] Test authentication/authorization (401, 403 responses)
  - [ ] Test validation errors (400 responses)
  - [ ] Test success path (200, 201 responses)
- [ ] **UI Testing** (if applicable):
  - [ ] Component renders without errors
  - [ ] All interactive elements work (buttons, forms, modals)
  - [ ] Theme switching works (Light/Dark/System)
  - [ ] Responsive design works (mobile, tablet, desktop)
  - [ ] Loading states display correctly
  - [ ] Error states display user-friendly messages
- [ ] **Manual QA Checklist**: All task-specific QA items completed
- [ ] **Regression Check**: Existing features still work (spot-check critical paths)
- [ ] **No Spec Drift**: Implementation matches spec (no undocumented changes)
- [ ] **No Architecture Changes**: Followed existing patterns (no new paradigms mid-phase)

#### Commit Approval Process
**❌ NEVER commit without explicit user approval**

1. **Request Approval**:
   - List all completed tasks with evidence
   - Show validation checklist results
   - Highlight any warnings or minor issues
   - Ask: "Ready to commit Phase X?"

2. **Wait for Explicit Approval**:
   - User reviews changes
   - User approves with explicit "yes, commit" or similar
   - User may request additional testing or fixes

3. **Only After Approval**:
   ```bash
   git add .
   git commit -m "Phase X: [Clear description]
   
   - Task 1: Description
   - Task 2: Description
   
   Validation:
   - Schema validated
   - Build passed
   - Manual QA completed"
   ```

---

### Component Migration Workflow (UI Components)
**MANDATORY for all UI component refactoring or design token migration**

---

## 🎯 MANDATORY: USE SPEC 007 FOR ALL MIGRATION WORK

> **⚠️ CRITICAL CHANGE (November 4, 2025)**: This section is now DEPRECATED. For complete, authoritative migration and build standards, **ALWAYS** reference:
> 
> ## **PRIMARY REFERENCE: `specs/007-migration-and-build/spec.md`**
> ### Migration and Build Execution Standards
> 
> **This spec is the SINGLE SOURCE OF TRUTH for all migration and build work.**
> 
> ### What's in the Spec:
> 
> #### **Foundation (Must Complete First)**
> - **GATE 0 Pre-Flight Checks** (FR-001 to FR-007) - Verify system health BEFORE any work
> - **6 Comprehensive Verification Commands** (FR-008 to FR-016) - Detect ALL hardcoded values
> - **Multi-Theme Testing Requirements** (FR-017 to FR-022) - Dark, Light, Purple themes mandatory
> 
> #### **Complete Workflow**
> - **13-Step Migration Workflow** - From GATE 0 through commit
> - **10 User Stories** (P0 to P3 prioritized) - Each independently testable
> - **64 Functional Requirements** (FR-001 to FR-064) - All testable and measurable
> - **12 Success Criteria** (SC-001 to SC-012) - 80% rework reduction, 90% first-time quality
> 
> #### **Quality & Prevention**
> - **8 Edge Case Scenarios** - System failures, partial migrations, theme bugs, build failures
> - **Complete Failure Handling** - Exact procedures for each failure type
> - **Prevention Mechanisms** - Stops all 15 pain points from MIGRATION-PAIN-POINTS.md
> 
> ### When to Use the Spec:
> - ✅ Starting ANY component migration → See US1 (GATE 0)
> - ✅ Verifying completion → See US2 (6 verification commands)
> - ✅ Testing themes → See US3 (multi-theme testing)
> - ✅ Creating logic audit → See US4 (logic preservation)
> - ✅ Committing work → See US9 (atomic commits)
> - ✅ Unsure if "done" → Check all success criteria
> 
> ### Why This Matters:
> Previous migrations suffered from 15+ repeated mistakes (documented in MIGRATION-PAIN-POINTS.md):
> - Wrong background class usage
> - Incomplete verification (found hardcoded values later)
> - No multi-theme testing (broke light/purple themes)
> - No pre-migration audit (broke functionality)
> - Partial migrations (false "complete" reports)
> 
> **Spec 007 systematically prevents ALL of these issues.**
> 
> ---
> 
> **This constitution section remains for quick reference only. For actual work, ALWAYS use the spec.**

---

#### 1. Pre-Migration Audit (10 minutes) - **SEE SPEC US4 FOR COMPLETE REQUIREMENTS**
**Goal**: Document current component state BEFORE touching code

> **Updated Process**: See `specs/007-migration-and-build/spec.md` → User Story 4: Logic Preservation Audit (FR-023 to FR-030) for comprehensive audit requirements.

```bash
# Read the component file
cat src/components/YourComponent.tsx

# Identify violations - RUN ALL 6 VERIFICATION COMMANDS (see spec)
# Command 1: Hardcoded gray/slate colors
grep -E "(bg-slate-|text-slate-|text-zinc-|bg-gray-|bg-zinc-|border-gray-|border-slate-)" src/components/YourComponent.tsx

# Command 2: Manual dark mode classes
grep "dark:" src/components/YourComponent.tsx

# Command 3: RGB/RGBA/HEX colors (excluding SVG)
grep -E "(rgba\(|rgb\(|#[0-9a-fA-F]{3,6})" src/components/YourComponent.tsx | grep -v "viewBox\|fill="

# Command 4: Hardcoded white/black
grep -E "(text-white|bg-white|text-black|bg-black)" src/components/YourComponent.tsx

# Command 5: Hardcoded typography
grep -E "(text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|font-bold|font-semibold)" src/components/YourComponent.tsx

# Command 6: Manual responsive classes without semantic tokens
grep -E "(sm:text-|md:text-|lg:text-)" src/components/YourComponent.tsx
```

**Create Logic Preservation Checklist** (see spec for complete template):
- [ ] List all state variables and their purposes
- [ ] List all event handlers and what they do
- [ ] Document form validation logic (if applicable)
- [ ] Document API calls or data fetching (if applicable)
- [ ] Identify high-risk areas (complex logic, nested conditionals)

#### 2. Migration Planning (5 minutes) - **SEE SPEC US5 FOR COMPLETE REQUIREMENTS**
**Map Old → New Patterns** (see `DESIGN-SYSTEM-SOT.md` for complete token reference):

| Old Pattern | New Pattern | Example |
|------------|-------------|---------|
| `bg-slate-700` | `bg-surface` | Card backgrounds |
| `text-slate-400` | `text-muted-foreground` | Secondary text |
| `dark:text-white` | `text-foreground` | CSS variables handle theme |
| `text-2xl font-bold` | `text-heading-2` | Typography tokens |
| `px-6 py-4` | `px-card-padding py-card-padding` | Spacing tokens |
| Inline SVG icons | Icon library | `<MailIcon className="w-5 h-5" />` |

> **Updated Requirements**: See `specs/007-migration-and-build/spec.md` → User Story 5: 100% Clean Replacement Enforcement (FR-031 to FR-037)

#### 3. Execute Migration (20-40 minutes) - **FOLLOW 13-STEP WORKFLOW IN SPEC**
**100% Clean Replacement Rule**: NO hybrid patterns allowed (see spec FR-031)

```tsx
// ❌ WRONG: Mixing old and new
<div className="bg-slate-700 text-foreground">  // Don't do this

// ✅ CORRECT: All tokens
<div className="bg-surface text-foreground">    // Do this
```

**Migration Steps**:
1. Replace background colors (`bg-*`)
2. Replace text colors (`text-*`)
3. Replace typography (`text-2xl` → `text-heading-2`)
4. Replace spacing (`px-6` → `px-card-padding`)
5. Replace borders (`border-gray-300` → `border-border`)
6. Replace shadows (use neumorphic classes: `.shadow-neu-outset`)
7. Remove ALL `dark:` manual classes (CSS variables handle theme)
8. Replace inline SVG with icon library components

#### 4. Immediate Testing (10 minutes) - **SEE SPEC US3, US6, US7 FOR COMPLETE REQUIREMENTS**
**Test in Development Server**:

```bash
npm run dev
```

**Manual QA Checklist** (see spec for comprehensive requirements):
- [ ] **MANDATORY**: Test in ALL 3 themes (Dark, Light, Purple) - See spec US3 (FR-017 to FR-022)
- [ ] **MANDATORY**: Test at 5 breakpoints (320px, 375px, 768px, 1024px, 1440px) - See spec US6 (FR-038 to FR-042)
- [ ] Component renders without errors
- [ ] All interactive states work (hover, focus, active, disabled)
- [ ] Responsive design works (mobile 320px, tablet 768px, desktop 1024px+)
- [ ] All functionality preserved (buttons click, forms submit, modals open)
- [ ] No console errors or warnings
- [ ] Browser DevTools shows no CSS conflicts

**Logic Preservation Verification** (see spec US4):
- [ ] All state variables still work correctly
- [ ] All event handlers fire correctly
- [ ] Form validation still works (if applicable)
- [ ] API calls still work (if applicable)
- [ ] Conditional rendering still works correctly

> **Critical Update**: Multi-theme testing is now MANDATORY. See `specs/007-migration-and-build/spec.md` → User Story 3 for complete theme testing requirements.

#### 5. Accessibility Check (5 minutes) - **SEE SPEC US7 FOR COMPLETE REQUIREMENTS**
**WCAG 2.1 AA Compliance** (see spec FR-043 to FR-048):

- [ ] Color contrast ≥ 4.5:1 (body text vs background) - MANDATORY
- [ ] Color contrast ≥ 3:1 (large text 18px+ vs background) - MANDATORY
- [ ] Focus ring visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels present where needed
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Forms have visible labels or aria-labels
- [ ] Modals trap focus and close on Escape
- [ ] Decorative icons have aria-hidden="true"
- [ ] Functional icons have aria-label

**Tools**:
- Chrome DevTools Lighthouse (Accessibility score)
- Manual keyboard navigation test
- Color contrast checker (built into DevTools)

> **Updated Requirements**: See `specs/007-migration-and-build/spec.md` → User Story 7: Accessibility Validation for complete WCAG 2.1 AA requirements.

#### 6. Build Validation (5 minutes) - **SEE SPEC US8 FOR COMPLETE REQUIREMENTS**
**Pre-Commit Checks** (see spec FR-049 to FR-053):

```bash
# MANDATORY: TypeScript validation - MUST pass with 0 errors
npx tsc --noEmit --project .

# MANDATORY: Production build test - MUST succeed
npm run build

# Optional: Prisma validation (if schema changes)
npx prisma validate
```

> **Updated Requirements**: See `specs/007-migration-and-build/spec.md` → User Story 8: Build Validation and Error Prevention. TypeScript and build checks are MANDATORY before commit.

#### 7. Commit When 100% Validated - **SEE SPEC US9 FOR COMPLETE REQUIREMENTS**
**Atomic Commit Rule**: ONE component per commit (see spec FR-054 to FR-058)

> **Updated Format**: See `specs/007-migration-and-build/spec.md` → User Story 9: Git Commit Standards for complete commit message format.

```bash
git add src/components/YourComponent.tsx
git commit -m "Migrate: YourComponent - Replace hardcoded classes with design tokens

- Replaced 15 hardcoded bg-slate-* with bg-surface/bg-primary
- Replaced 8 text-slate-* with text-foreground/text-muted-foreground
- Replaced text-2xl font-bold with text-heading-2
- Replaced px-6 py-4 with px-card-padding py-card-padding
- Removed all dark: manual classes (CSS variables now handle theme)
- Migrated to AuthInput component for form fields

Logic preserved:
- All state management unchanged
- All event handlers unchanged
- Form validation unchanged
- API calls unchanged

Validation:
- Verification: 0/0/0/0/0/0 (all 6 commands passed)
- Multi-theme testing: Dark ✓, Light ✓, Purple ✓
- Responsive testing: 320px ✓, 375px ✓, 768px ✓, 1024px ✓, 1440px ✓
- Accessibility: WCAG 2.1 AA compliant
- TypeScript: 0 errors
- Build: Successful
- Zero console errors

Refs: specs/007-migration-and-build/spec.md"
```

#### 8. Documentation Update - **SEE SPEC US10 FOR COMPLETE REQUIREMENTS**
**Update Migration Tracker** (see spec FR-059 to FR-064):

```markdown
| Component | Status | Violations Before | Violations After | Date | Commit | Themes | Responsive | A11y |
|-----------|--------|-------------------|------------------|------|--------|--------|------------|------|
| YourComponent | ✅ Complete | 25 | 0 | 2025-11-04 | abc1234 | ✓✓✓ | ✓✓✓✓✓ | ✓ |
```

**Update Spec Progress** (if applicable):
- Mark user story complete in `specs/006-component-by-component/spec.md`
- Update compliance metric (40% → 47% → ...)
- Update `tasks.md` task status
- Add single changelog entry summarizing day's work (not per component)

> **Important**: Do NOT create new documentation files unless specifically requested (see spec FR-062). Update tracker + tasks.md only.

#### Red Flags 🚨
**STOP immediately if you see** (see spec Edge Cases section for complete failure handling):

1. **GATE 0 Failed**: System health checks not passing (STOP all work, fix system)
2. **Functionality Broken**: Component doesn't work after migration
3. **TypeScript Errors**: Type errors introduced
4. **Build Fails**: Production build broken
5. **Hybrid Patterns**: Mixed old + new class names (verification failed)
6. **Logic Changed**: Behavior different from original
7. **Console Errors**: New warnings or errors
8. **Accessibility Regression**: Keyboard nav broken, contrast too low
9. **Theme Switching Broken**: Component doesn't adapt to theme changes
10. **Partial Verification**: Some verification commands passed but not all 6

**If any red flag appears**: Revert changes, fix issue, re-test before committing.

> **Complete Failure Handling**: See `specs/007-migration-and-build/spec.md` → Edge Cases section for detailed procedures on handling each failure scenario.

---

### 🚨 RED FLAGS - STOP IMMEDIATELY

**If you encounter ANY of these, STOP and ask user for guidance:**

1. **Schema doesn't match spec** → Review spec, verify field exists
2. **Service function signatures differ from usage** → Check existing services, align
3. **Build errors persist >30 minutes** → Report to user, don't spiral
4. **Creating new patterns not in existing codebase** → Use existing patterns
5. **Inventing field names not in spec** → Use exact spec names
6. **"I'll fix it later" thoughts** → Fix now according to spec, or ask user
7. **TypeScript errors** → Fix immediately, don't accumulate
8. **Visual regression failures** → Fix before proceeding
9. **Manual QA failures** → Fix before commit
10. **Spec ambiguity** → Ask user for clarification

---

### Phase Completion Criteria

**ALL of these MUST be true before phase is considered complete:**

- ✅ All tasks marked complete with evidence
- ✅ Implementation matches spec exactly (data model, API contracts, types)
- ✅ Prisma schema validated (`npx prisma validate`)
- ✅ TypeScript compiles with no errors (`npx tsc --noEmit`)
- ✅ Build passes (`npm run build`)
- ✅ No critical lint errors
- ✅ No spec drift or architectural changes mid-phase
- ✅ Manual QA checklists completed for all tasks
- ✅ Visual regression tests passed (UI components only)
- ✅ User approval received
- ✅ Git commit created with detailed message

**If ANY criterion fails**: Fix immediately, don't proceed to next phase.

---

## Testing Standards

### Component Testing Requirements (UI Components)
**MANDATORY for all UI component work**

#### Testing Philosophy
- **Manual Testing**: Primary validation method (no automated visual regression)
- **Browser DevTools**: Chrome DevTools for responsive/accessibility testing
- **Real Device Testing**: Test on actual mobile devices when possible
- **Incremental Validation**: Test after EACH change, not at the end

#### Testing Workflow
1. **Pre-Migration Audit** (document current state)
2. **Execute Migration** (one component at a time)
3. **Test in Development Server** (npm run dev)
4. **Complete Manual QA Checklist** (all states, themes, responsive)
5. **Validate Build** (TypeScript + production build)
6. **Commit when 100% validated** (atomic commits)

#### Manual QA Checklist Template
Every UI component MUST verify:

**Functionality**:
- [ ] Component renders without errors
- [ ] All interactive elements work (buttons, links, forms)
- [ ] All functionality preserved from original (no regressions)
- [ ] State management works correctly
- [ ] Event handlers fire correctly
- [ ] Form validation works (if applicable)
- [ ] API calls work (if applicable)

**Visual & Theme** (UPDATED: Phase 0.2 - Multi-Theme Testing MANDATORY):
- [ ] **Dark theme**: Component renders correctly, text readable (#F3F4F6 on #121212), shadows visible
- [ ] **Light theme**: Component renders correctly, text readable (#121212 on #E0E5EC), neumorphic shadows visible
- [ ] **Purple theme**: Component renders correctly, text readable (#E9E3FF on #2C1D4D), purple shadows visible
- [ ] **Theme switching**: Instant transition between all 3 themes (no flash, colors update correctly)
- [ ] **Contrast ratios**: WCAG 2.1 AA compliance in ALL 3 themes (4.5:1 for text, 3:1 for large text)
- [ ] **System theme preference**: Will auto-detect OS preference and map to closest theme (future enhancement)
- [ ] No color flicker or layout shift
- [ ] Neumorphic shadows render correctly

**Interactive States**:
- [ ] Hover state: Visual feedback clear
- [ ] Focus state: Focus ring visible (WCAG 2.1 AA)
- [ ] Active state: Visual feedback (pressed state)
- [ ] Disabled state: Clearly disabled (visual + cursor)
- [ ] Loading state: Spinner/skeleton visible (if applicable)
- [ ] Error state: Error message displayed (if applicable)

**Responsive Design**:
- [ ] Mobile (320px-640px): Layout appropriate, touch targets ≥ 44px
- [ ] Tablet (640px-1024px): Layout appropriate
- [ ] Desktop (1024px+): Layout appropriate
- [ ] No horizontal scroll on any breakpoint
- [ ] Text remains readable at all sizes

**Accessibility (WCAG 2.1 AA)**:
- [ ] Color contrast ≥ 4.5:1 (text vs background)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus ring visible on all interactive elements
- [ ] ARIA labels present where needed
- [ ] Screen reader compatible (alt text, labels)

**Code Quality**:
- [ ] Zero hardcoded values (all use design tokens)
- [ ] No console errors or warnings
- [ ] TypeScript validation passes (`npx tsc --noEmit`)
- [ ] Production build passes (`npm run build`)
- [ ] No `dark:` manual classes (CSS variables handle theme)

### API Testing Requirements
**MANDATORY for all API routes**

#### Tools
- **curl**, **Postman**, or **Thunder Client**
- **Prisma Studio** (database verification)

#### Testing Checklist
- [ ] Authentication: Returns 401 if unauthorized
- [ ] Authorization: Returns 403 if insufficient permissions
- [ ] Validation: Returns 400 for invalid input
- [ ] Success path: Returns correct status (200, 201)
- [ ] Response format: Matches OpenAPI contract
- [ ] Database changes: Verified in Prisma Studio
- [ ] Audit logs: Created for important actions
- [ ] Error messages: User-friendly (no stack traces)

### Database Testing Requirements
**MANDATORY for all schema changes**

#### Validation Steps
- [ ] Run `npx prisma validate` (0 errors)
- [ ] Migration applied successfully
- [ ] Prisma Client regenerated (`npx prisma generate`)
- [ ] Database tables match schema (check with Prisma Studio)
- [ ] Relations work correctly (foreign keys)
- [ ] Enums have correct values
- [ ] Default values applied
- [ ] Unique constraints enforced

### Integration Testing
**Test real user flows, not isolated components**

#### Critical Paths to Test
- [ ] Authentication: Signup → Login → Dashboard
- [ ] Role-based access: Each role can only access allowed routes
- [ ] Admin bypass: Admin can access all dashboards
- [ ] Data flow: Form submit → API → Database → UI refresh
- [ ] Error handling: Network error → User-friendly message
- [ ] Theme switching: No visual glitches or state loss

### Regression Testing
**Verify existing features still work after changes**

#### Spot-Check List
- [ ] Login/logout flow works
- [ ] Navigation between pages works
- [ ] Existing forms submit correctly
- [ ] Data displays correctly on dashboards
- [ ] Theme switching still works
- [ ] No new console errors

### Performance Testing (Optional, for large features)
- [ ] Page load time < 3 seconds (Lighthouse)
- [ ] No memory leaks (Chrome DevTools)
- [ ] Database queries optimized (use indexes)
- [ ] Bundle size acceptable (check build output)

---

## Code Quality Standards

### TypeScript Best Practices
- Use interfaces for object shapes, types for unions/primitives
- Avoid type assertions (`as`) unless necessary
- Use optional chaining (`?.`) for nullable values
- Use nullish coalescing (`??`) for default values
- Prefer const over let (no var)

### React Best Practices
- One component per file (unless helper components)
- Extract reusable logic into custom hooks
- Memoize expensive calculations (useMemo)
- Memoize callback functions passed to children (useCallback)
- Use fragments (<></>) to avoid unnecessary divs

### Async/Await Patterns
- Always use try/catch for error handling
- Never ignore errors silently
- Log errors with context (what operation failed)
- Return user-friendly error messages
- Clean up resources in finally blocks

### Performance Considerations
- Lazy load heavy components (React.lazy)
- Optimize images (Next.js Image component)
- Minimize client-side JavaScript (prefer server components)
- Use database indexes for frequent queries
- Implement pagination for large datasets (future)

---

## Security Requirements

### Password Security
- **Minimum length**: 8 characters
- **Complexity**: At least one uppercase, lowercase, number, special character
- **Hashing**: bcryptjs with 10 salt rounds
- **Storage**: Never log or display passwords
- **Transmission**: HTTPS only (enforced in production)

### Email Validation
- **Format**: Standard email regex pattern
- **Typo detection**: Common domain misspellings (gail.com → gmail.com)
- **Valid TLDs**: 2-6 character top-level domains only
- **Uniqueness**: Enforce unique constraint at database level

### Session Security
- **JWT Secret**: Strong random string (32+ characters)
- **Expiration**: 30 days (configurable)
- **HttpOnly**: Cookies not accessible via JavaScript
- **SameSite**: CSRF protection enabled
- **Secure**: HTTPS-only in production

### Admin Access
- **Initial admin**: Created via seed script (not publicly accessible)
- **Password change**: Required after first login in production
- **Multi-dashboard access**: Allowed for support purposes
- **Role verification**: Server-side checks (JWT-based, cannot be faked)
- **Development menu**: Only visible in `NODE_ENV === 'development'`

---

## Documentation Standards

### Code Comments
- **File headers**: Purpose, structure, and usage examples
- **Function comments**: Describe what, why, and edge cases
- **Complex logic**: Step-by-step explanations for future developers
- **TODOs**: Include context and priority (e.g., `// TODO (PRIORITY): Description`)
- **Teaching notes**: Explain patterns for junior developers

### Progress Documentation
- **Location**: `DOC/Records/` directory
- **Naming**: `FEATURE-DESCRIPTION-DATE.md` or `FEATURE-DESCRIPTION.md`
- **Content**: Implementation details, decisions made, testing results
- **Updates**: Modify when significant changes occur
- **Audits**: Document current state before major features

### API Documentation
- **Endpoint**: Full path (e.g., `/api/auth/register/homeowner`)
- **Method**: HTTP method (GET, POST, PATCH, DELETE)
- **Auth required**: Yes/No, which roles
- **Request body**: TypeScript interface or example JSON
- **Response**: Success and error response structures
- **Error codes**: All possible status codes and meanings

---

## Role-Based Features

### Guest (Unauthenticated)
- ✅ View homepage and public content
- ✅ Submit instant quote requests (anonymous, stored in database)
- ✅ Subscribe to newsletter
- ✅ Access blog posts
- ❌ Cannot access any dashboard
- ❌ Cannot save quotes to account (must create account)

### Homeowner
- ✅ Create account (email/password)
- ✅ Login to homeowner dashboard
- ✅ Request detailed solar quotes
- ✅ View quote history
- ✅ Message installers
- ✅ Manage profile
- ❌ Cannot access installer or admin dashboards

### Installer
- ✅ Create account (email/password + company details)
- ✅ Login to installer dashboard
- ✅ View lead feed (homeowner quote requests)
- ✅ Purchase leads
- ✅ Message homeowners
- ✅ Manage business profile
- ❌ Cannot access homeowner or admin dashboards

### Admin
- ✅ Login with credentials (no public signup)
- ✅ Access admin dashboard
- ✅ View all instant quotes
- ✅ Update quote statuses
- ✅ Delete invalid quotes
- ✅ **Bypass**: Access homeowner and installer dashboards (support feature)
- ✅ View all users and activity
- 🚧 Create/manage other admin users (future feature)

---

## Current Implementation Status

### ✅ Completed Features
- Full authentication system (NextAuth.js + Prisma + bcryptjs)
- User registration (homeowner & installer roles)
- Role-based dashboards (admin, homeowner, installer)
- Admin seeding script (`npm run seed:admin`)
- Admin bypass middleware (access all routes)
- Newsletter subscription (frontend + backend + database)
- Instant quote form (guest submissions to database)
- Admin instant quote management (view, update status, delete)
- Dark mode theme system (ThemeProvider + Tailwind)
- Responsive navigation bars (role-specific bottom navbars)
- Email validation with typo detection
- Scroll-responsive header (show on scroll up, hide on scroll down)
- Development quick access menu (admin dashboard only, dev mode)
- **Neumorphic Design System** (custom, no third-party UI libraries)
- **Design Token System** (`src/design-tokens/` - colors, typography, spacing, shadows, animations)
- **Centralized Auth Components** (`src/components/auth/` - AuthInput, AuthButton, AuthModal, etc.)
- **Icon Library** (`src/components/icons/auth/` - 16+ icons for auth flows)
- **Neumorphic CSS Classes** (`src/app/globals.css` - buttons, cards, inputs, shadows)

### 🚧 In Progress / Future Features
- **Component-by-Component Migration** (Spec 007 - active)
  - Goal: 40% → 95% design system compliance
  - Eliminate 285 hardcoded class violations
  - Migrate 15 components to design token system
  - Priority: InstantQuoteForm → Hero → QuoteOptions → SimplifiedQuoteForm → MobileSidebar → Auth components
- Lead management system (installer purchases)
- Messaging system (homeowner ↔ installer communication)
- Payment integration (Stripe for lead purchases)
- Email verification flow
- Password reset functionality
- OAuth providers (Google, Apple)
- Admin user management UI
- Quote builder with pricing calculator
- Rebate/incentive calculator
- Blog CMS integration
- Light theme (after dark theme 100% complete)

---

## Environment Variables

### Required Variables
```bash
# Database (Supabase or Vercel Postgres)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth.js
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"  # Production: your-domain.com

# OAuth (Future - not yet implemented)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Optional Variables
```bash
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Future integrations
# STRIPE_SECRET_KEY="sk_test_..."
# SENDGRID_API_KEY="SG..."
# CLOUDINARY_CLOUD_NAME="..."
```

---

## Governance

### Constitution Authority
- This constitution supersedes all other development practices
- All features must comply with these standards
- Amendments require documentation and team approval (if applicable)
- Non-compliance must be documented with justification

### Code Review Standards
- All code must follow TypeScript strict mode
- API routes must include authentication checks
- Database changes require migrations
- No direct SQL without Prisma review
- Security vulnerabilities = immediate fix priority
- **Manual QA checklists must be completed** for all tasks with frontend + backend changes
- **Component testing mandatory**: Test in dev server + browser DevTools before commit
- **No batch refactoring**: Only one component or feature per commit
- **Spec compliance mandatory**: Implementation must match specification exactly
- **Design token compliance**: Zero hardcoded values in components (bg-slate-*, text-2xl, etc.)
- **Atomic migrations**: One component per commit with validation evidence

### Breaking Changes
- Database schema changes: Create migration, test locally, document
- API contract changes: Version endpoints or maintain backward compatibility
- Authentication changes: Test all user flows before deployment
- Component API changes: Update all usages in codebase

### Development Principles
- **Iterate quickly**: Build one feature at a time, test immediately (follow mandatory workflow standards)
- **Document decisions**: Record what was done and why
- **Security first**: Validate all inputs, protect all routes
- **Teaching mindset**: Write code that future developers can understand
- **YAGNI**: Build what's needed now, not what might be needed later
- **Zero "Hoping for the Best"**: Follow pre-phase audit, during-phase testing, post-phase validation (see Development Workflow Standards)
- **Design Token First**: For UI changes, use design tokens (no hardcoded values)
- **Component-by-Component**: Migrate one component at a time with full validation
- **Atomic Commits**: One component or feature per commit (no batch refactoring)
- **Spec Compliance**: Implementation must match spec exactly (no improvisation)
- **Neumorphic Standards**: All components follow neumorphic design patterns

---

**Version**: 1.0.2  
**Ratified**: October 13, 2025  
**Last Amended**: November 1, 2025  
**Amendment**: Aligned with neumorphic design system (removed shadcn/ui, Storybook, Chromatic)  
**Project**: SolarMatch - Solar Lead Generation Platform

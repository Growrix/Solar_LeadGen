# Feature Specification: Comprehensive CSS Class Audit & Standardization

**Feature Branch**: `005-comprehensive-css-class`  
**Created**: 2025-10-30  
**Status**: Draft  
**Input**: User description: "Comprehensive CSS class audit and standardization: identify inconsistent button, icon, and component classes across the site, create a centralized naming convention aligned with design token system, and systematically migrate messy classes component-by-component while preserving consistent patterns"

## 🎨 CRITICAL SCOPE CHANGE: Dark Theme ONLY

**IMPORTANT**: This feature will ONLY implement dark theme. Light/Brand themes will be added AFTER dark theme is 100% perfect.

**Rationale**:
- ✅ **Quality over quantity**: One perfect theme > three mediocre themes
- ✅ **Template approach**: Dark theme becomes template for light/brand (copy-paste with color swaps)
- ✅ **Faster validation**: Test/iterate/ship faster with single theme
- ✅ **Zero rework**: Won't need to refactor components twice

**During Migration**:
- App will be locked to dark theme (ThemeProvider default='dark')
- Theme toggle will be temporarily hidden
- Storybook will show dark theme only
- All testing/validation for dark theme only

**After Dark Theme 100% Complete**:
- Restore theme switcher
- Add light theme (copy dark theme structure, swap colors)
- Add brand theme (copy dark theme structure, swap colors)

---

## 🚫 CRITICAL MIGRATION PRINCIPLE: 100% Clean Replacement

**INDUSTRY STANDARD REQUIREMENT**: NO hybrid old+new class patterns allowed. Each component migration MUST be complete replacement.

**Rationale**:
- ✅ **Maintainability**: Mixing `bg-teal-600` and `bg-primary` creates confusion about which to use
- ✅ **Consistency**: Partial migrations lead to inconsistent UX (some buttons themed, others not)
- ✅ **Technical Debt**: Hybrid patterns accumulate, making future refactors harder
- ✅ **Industry Standard**: All major design systems (Material UI, Chakra, Ant Design) require complete component replacement

**Migration Rules**:
1. ❌ **FORBIDDEN**: `<Button className="bg-teal-600 hover:bg-primary">` (mixing old+new)
2. ❌ **FORBIDDEN**: Some buttons use `bg-red-500`, others use `bg-destructive` (inconsistent)
3. ❌ **FORBIDDEN**: Leaving ANY hardcoded classes in migrated components
4. ✅ **REQUIRED**: 100% replacement: `bg-teal-600` → `bg-primary` (ALL instances)
5. ✅ **REQUIRED**: Verification task after each phase confirms ZERO old classes remain
6. ✅ **REQUIRED**: Pre-commit hooks BLOCK commits with forbidden classes

**What "Preserve" Means**:
- ✅ **Preserve Logic**: `onClick={handleSubmit}`, `disabled={isLoading}` ← Keep these
- ✅ **Preserve Behavior**: Form validation, loading states, navigation ← Keep these
- ❌ **Don't Preserve Classes**: `className="bg-teal-600"` ← Replace completely

**Enforcement**:
- Each phase has CRITICAL VERIFICATION task (T064a, T075a, T089a, T100a, T112a, T129a)
- Validation script flags ANY remaining hardcoded classes
- Migration considered INCOMPLETE until verification passes
- Pre-commit hooks prevent new violations from being added

---

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Setup shadcn/ui & Component Logic Audit (Priority: P0) 🎯 FOUNDATION

Developer needs to install shadcn/ui, audit existing component logic/state/props, and create a "logic preservation map" to ensure UI upgrades don't break functionality. **DARK THEME ONLY.**

**Why this priority**: MUST be completed first. Cannot migrate to shadcn components without understanding what logic to preserve. Prevents "hoping for the best" by documenting every component's behavior before touching it.

**Independent Test**: shadcn/ui installed with design tokens configured, audit report shows every component's logic signature (props, state, handlers, side effects), and developer can see real-time UI changes in Storybook as they migrate. App locked to dark theme.

**Acceptance Scenarios**:

1. **Given** project needs shadcn/ui, **When** developer runs setup script, **Then** shadcn/ui is installed with CLI configured to use dark theme CSS variables (`--background: 0 0% 0%` = pure black)
2. **Given** shadcn/ui is installed, **When** developer initializes first component (Button), **Then** `components/ui/button.tsx` is created with variants mapped to dark theme design tokens (`bg-primary`, `bg-secondary`, `bg-destructive`)
3. **Given** existing components have logic, **When** audit script runs, **Then** markdown report lists every component with: state variables, props interface, event handlers, useEffect hooks, API calls, routing logic
4. **Given** audit identifies component logic, **When** developer reviews report, **Then** each component section shows "Logic Preservation Checklist" (what to keep unchanged when migrating UI)
5. **Given** developer migrates component, **When** Storybook is open, **Then** hot reload shows UI changes in real-time without page refresh (developer sees exactly what changes as they type) in DARK THEME
6. **Given** component uses conditional rendering (if/else, ternary), **When** audit runs, **Then** report documents all conditional logic paths that must be preserved
7. **Given** component has form validation or async operations, **When** audit runs, **Then** report flags these as "High Risk - Test Thoroughly" with step-by-step test instructions
8. **Given** app needs theme locking, **When** ThemeProvider mounts, **Then** theme defaults to 'dark' and toggle is hidden (temporary during migration)
9. **Given** dark theme CSS variables are defined, **When** developer views globals.css, **Then** shadcn-compatible variables defined: `--background`, `--foreground`, `--card`, `--primary`, `--destructive`, `--muted`, `--border`, `--ring`, `--radius`

---

### User Story 1 - Generate Comprehensive Class Audit Report (Priority: P1) 🎯 MVP

Developer needs to understand the current state of CSS class usage across the entire codebase to identify inconsistencies and patterns before making changes.

**Why this priority**: Foundation for all other work. Cannot standardize without first understanding what exists. Delivers immediate value by documenting technical debt.

**Independent Test**: Run audit tool and generate report showing all CSS classes grouped by component type (buttons, icons, forms, cards, etc.), with categorization of consistent vs. inconsistent patterns. Report must highlight industry standard violations.

**Acceptance Scenarios**:

1. **Given** the codebase contains mixed CSS patterns, **When** developer runs audit script, **Then** a detailed markdown report is generated listing all unique className values found in `.tsx` and `.ts` files
2. **Given** audit report is generated, **When** developer reviews button section, **Then** all button-related classes are grouped together showing usage count and file locations
3. **Given** audit report contains icon classes, **When** developer compares with button classes, **Then** report clearly identifies classes shared between different component types (problematic overlap)
4. **Given** classes follow or violate standards, **When** report is generated, **Then** each class pattern is marked as "Consistent", "Inconsistent", or "Industry Standard Violation" with explanations
5. **Given** audit identifies hardcoded colors, **When** developer reviews report, **Then** all instances of hardcoded color values (bg-teal-600, text-blue-500, etc.) are listed with file locations and recommended token replacements

---

### User Story 2 - Define Token-Based Class Naming Convention (Priority: P2)

Developer needs a clear, documented naming convention that aligns with the existing design token system to ensure future consistency.

**Why this priority**: Provides the rulebook for standardization work. Must be defined before systematic migration begins.

**Independent Test**: Review convention document and verify it covers all common component patterns (buttons, icons, forms, typography, spacing, colors), maps to existing design tokens, and includes decision tree for choosing appropriate classes.

**Acceptance Scenarios**:

1. **Given** design token system exists with semantic tokens, **When** developer creates naming convention, **Then** convention document maps each token category (colors, spacing, typography, shadows, borders) to corresponding Tailwind utility classes
2. **Given** buttons have multiple states (default, hover, focus, disabled), **When** naming convention is applied, **Then** convention provides clear pattern for state-based styling using design tokens (e.g., `bg-primary`, `hover:bg-primary-dark`, `focus:ring-primary`)
3. **Given** components need responsive behavior, **When** convention is applied, **Then** mobile-first responsive patterns are documented with breakpoint prefixes (`sm:`, `md:`, `lg:`)
4. **Given** developer encounters new component, **When** referencing convention, **Then** decision flowchart helps choose between semantic tokens vs. utility classes vs. custom component classes
5. **Given** convention is complete, **When** developer reviews against Constitution and industry standards, **Then** all patterns align with Tailwind best practices, BEM methodology where applicable, and atomic design principles

---

### User Story 3 - Migrate Button Components to shadcn/ui + Standard Classes (Priority: P3)

Developer replaces custom button components with shadcn/ui Button, preserving all existing logic (onClick handlers, loading states, disabled conditions, routing) while upgrading UI to use design tokens.

**Why this priority**: Buttons are the most visible interactive elements and demonstrate immediate visual consistency improvement. shadcn/ui Button provides accessible, battle-tested foundation.

**Independent Test**: After migration, all buttons use shadcn/ui `<Button>` with variant prop (`variant="default"`, `variant="secondary"`, `variant="destructive"`), maintain ALL existing functionality (clicks work, loading spinners work, form submissions work), and developer can see changes in Storybook hot reload.

**Acceptance Scenarios**:

1. **Given** custom button has onClick handler, **When** migrated to shadcn/ui, **Then** onClick is preserved exactly: `<Button onClick={handleSubmit}>` works identically to previous implementation
2. **Given** button has loading state (`isLoading && <Spinner />`), **When** migrated, **Then** loading logic preserved with shadcn Button: `<Button disabled={isLoading}>{isLoading ? <Spinner /> : 'Submit'}</Button>`
3. **Given** button navigates with Next.js Link, **When** migrated, **Then** routing preserved: `<Button asChild><Link href="/dashboard">Dashboard</Link></Button>`
4. **Given** button has conditional disabled state, **When** migrated, **Then** condition preserved: `<Button disabled={!isValid || isSubmitting}>`
5. **Given** button is migrated, **When** developer opens Storybook with hot reload, **Then** can toggle between variants (default/secondary/destructive) and see live updates without manual refresh
6. **Given** button had hardcoded class `bg-teal-600`, **When** migrated to shadcn, **Then** uses variant system: `<Button variant="default">` which internally uses `bg-primary` from design tokens
7. **Given** migration is complete, **When** visual regression test runs, **Then** buttons look identical (or intentionally improved), all functionality verified via interaction testing
8. **Given** button component file is migrated, **When** developer views file, **Then** inline comment documents logic preservation: `{/* Preserved: onClick, loading state, disabled condition - migrated from CustomButton to shadcn Button */}`

---

### User Story 4 - Migrate Icon Components to Standard Classes (Priority: P4)

Developer updates icon usage to separate icon-specific styling from button/text styling, ensuring icons have their own consistent class patterns.

**Why this priority**: Icons currently share classes with other components causing confusion. Separation improves maintainability.

**Independent Test**: Icons use dedicated size/color tokens (`icon-sm`, `icon-md`, `icon-primary-color`) and no longer conflict with button classes.

**Acceptance Scenarios**:

1. **Given** icon shares classes with button (`text-teal-600 text-lg`), **When** migrated, **Then** icon uses semantic icon classes (`text-icon-primary size-icon-md`) with inline comment
2. **Given** icon appears in multiple contexts (button, card, navbar), **When** standardized, **Then** icon uses consistent base classes with contextual modifiers when needed
3. **Given** icon has interactive state (clickable), **When** migrated, **Then** hover/focus states use icon-specific tokens consistent with parent component
4. **Given** Heroicons library is used, **When** convention applied, **Then** standard wrapper pattern is documented for icon sizing and coloring

---

### User Story 5 - Migrate Form Components to shadcn/ui (Input, Label, Textarea, Select) (Priority: P5)

Developer replaces custom form components with shadcn/ui equivalents, preserving all validation logic, error handling, onChange handlers, form state management (React Hook Form, Formik, or custom state).

**Why this priority**: Forms are critical for user interaction. shadcn/ui provides accessible, WCAG-compliant form components with built-in error states.

**Independent Test**: All form elements use shadcn/ui components (`<Input>`, `<Label>`, `<Textarea>`, `<Select>`), maintain existing validation logic (required fields, regex patterns, async validation), and error messages display correctly.

**Acceptance Scenarios**:

1. **Given** custom input has onChange handler updating state, **When** migrated to shadcn Input, **Then** state management preserved: `<Input value={email} onChange={(e) => setEmail(e.target.value)} />`
2. **Given** input has validation logic (email regex, min length), **When** migrated, **Then** validation logic preserved exactly, errors still display: `{errors.email && <p className="text-destructive">{errors.email}</p>}`
3. **Given** form uses React Hook Form, **When** migrated, **Then** register syntax preserved: `<Input {...register('email', { required: true, pattern: /email-regex/ })} />`
4. **Given** input has conditional error styling, **When** migrated, **Then** shadcn Input variants used: `<Input className={errors.email ? 'border-destructive' : ''} />`
5. **Given** select dropdown has options array, **When** migrated to shadcn Select, **Then** options logic preserved: `<Select onValueChange={setValue}><SelectTrigger>...<SelectContent>{options.map(...)}</SelectContent></Select>`
6. **Given** textarea has character limit logic, **When** migrated, **Then** logic preserved: `<Textarea value={bio} onChange={handleChange} maxLength={500} /> <span>{bio.length}/500</span>`
7. **Given** form has async submission (API call), **When** migrated, **Then** onSubmit handler preserved with loading/error states: `<form onSubmit={handleSubmit(onSubmit)}>`
8. **Given** developer migrates form in Storybook, **When** typing in input, **Then** sees real-time updates (validation errors, character count) without page refresh

---

### User Story 6 - Migrate Card/Container Components to shadcn/ui (Priority: P6)

Developer replaces custom card components with shadcn/ui Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter), preserving all content rendering logic, conditional rendering, data mapping.

**Why this priority**: Cards define visual hierarchy and layout consistency across pages. shadcn/ui Card provides semantic structure with built-in responsive spacing.

**Independent Test**: All cards use shadcn/ui Card components with semantic structure, maintain existing content logic (data.map, conditional sections, dynamic loading), and display correctly across breakpoints.

**Acceptance Scenarios**:

1. **Given** custom card renders list of items with .map(), **When** migrated to shadcn Card, **Then** mapping logic preserved: `<Card><CardContent>{items.map(item => <div key={item.id}>...</div>)}</CardContent></Card>`
2. **Given** card has conditional sections (show header only if title exists), **When** migrated, **Then** conditionals preserved: `{title && <CardHeader><CardTitle>{title}</CardTitle></CardHeader>}`
3. **Given** card has click handler for navigation, **When** migrated, **Then** handler preserved: `<Card className="cursor-pointer hover:shadow-lg" onClick={() => router.push(\`/item/\${id}\`)}>`
4. **Given** card displays loading skeleton, **When** migrated, **Then** loading state preserved: `{isLoading ? <Skeleton className="h-24" /> : <Card>...actual content...</Card>}`
5. **Given** card has footer with action buttons, **When** migrated, **Then** structure preserved: `<CardFooter><Button onClick={onEdit}>Edit</Button><Button variant="destructive" onClick={onDelete}>Delete</Button></CardFooter>`
6. **Given** card used hardcoded spacing/shadows, **When** migrated, **Then** shadcn Card uses design tokens automatically (p-6, shadow-sm by default, customizable via className)
7. **Given** developer migrates dashboard with multiple cards, **When** viewing in Storybook, **Then** sees grid layout update in real-time as cards are migrated one-by-one

---

### User Story 7 - Migrate Modal/Dialog Components to shadcn/ui (Priority: P7)

Developer replaces custom modals/dialogs with shadcn/ui Dialog, ensuring consistent backdrop styling, z-index layering, and animation behavior. All modal logic (close handlers, form submission, conditional rendering) preserved.

**Why this priority**: Modals have inconsistent backdrops (some blur, some don't, different opacity), z-index conflicts, and accessibility issues. shadcn Dialog provides WCAG-compliant implementation.

**Independent Test**: All modals use shadcn/ui `<Dialog>` with consistent dark backdrop (80% black + 8px blur), proper z-index (50), smooth fade-in animation, trap focus, and close on ESC.

**Acceptance Scenarios**:

1. **Given** custom modal has backdrop, **When** migrated to shadcn Dialog, **Then** uses DialogOverlay with consistent dark theme styling: `bg-black/80 backdrop-blur-sm`
2. **Given** modal has close button, **When** migrated, **Then** DialogClose preserved: `<DialogClose><X className="h-4 w-4" /></DialogClose>` with keyboard support (ESC)
3. **Given** modal has form submission, **When** migrated, **Then** onSubmit logic preserved in DialogContent with proper state management
4. **Given** modal stacks above sidebar, **When** rendered, **Then** z-index hierarchy correct: Dialog (50) > Sidebar (40) > Header (30)
5. **Given** modal opens, **When** animation plays, **Then** fade-in transition uses shadcn built-in (data-state="open") with smooth 200ms duration
6. **Given** modal traps focus, **When** user presses Tab, **Then** focus stays within dialog (shadcn automatic behavior) until closed
7. **Given** modal has conditional sections, **When** migrated, **Then** conditionals preserved: `{showAdvanced && <DialogDescription>...</DialogDescription>}`

---

### User Story 8 - Standardize Typography Hierarchy (Priority: P8)

Developer migrates headings and text elements to use semantic typography scale from feature 004, removing ALL inline font size/weight/line-height classes. Typography tokens include responsive scaling, optimal line-heights, letter-spacing, and dark theme colors.

**Why this priority**: Typography token system EXISTS (feature 004) but components DON'T USE IT. Still using raw Tailwind classes (text-2xl, text-sm) causing inconsistent heading hierarchy, no responsive scaling, broken dark mode colors, missing letter-spacing. WCAG 2.1 requires semantic HTML match visual hierarchy.

**Independent Test**: 100% of headings use typography tokens (`text-heading-1` through `text-heading-4`), 100% of body text uses `text-body`/`text-body-small`/`text-body-large`, zero inline text-X/font-X/leading-X classes, all text colors use CSS variables (text-foreground, text-muted-foreground), semantic HTML matches visual size.

**Acceptance Scenarios**:

1. **Given** page has h1 heading with raw Tailwind class, **When** migrated, **Then** uses typography token: `<h1 className="text-heading-1 text-foreground">` (font-bold, line-height, letter-spacing automatic)
2. **Given** h2 heading has inconsistent size (text-2xl on some pages, text-3xl on others), **When** migrated, **Then** ALL h2 use: `<h2 className="text-heading-2 text-foreground">` (consistent 20px mobile, 24px tablet, 30px desktop)
3. **Given** body text uses raw Tailwind class, **When** migrated, **Then** uses semantic token: `<p className="text-body text-muted-foreground">` (14px mobile, 16px desktop, line-height 1.5 automatic)
4. **Given** small text or labels, **When** migrated, **Then** uses token: `<span className="text-body-small text-muted-foreground">` (14px, line-height 1.5 automatic)
5. **Given** caption or metadata, **When** migrated, **Then** uses token: `<span className="text-caption text-muted-foreground">` (12px, letter-spacing 0.025em automatic)
6. **Given** heading has inline font-weight (`font-bold`, `font-semibold`), **When** migrated to typography token, **Then** font-weight class removed (weight defined in token: h1/h2 = bold, h3/h4 = semibold)
7. **Given** text has inline line-height (`leading-relaxed`, `leading-tight`), **When** migrated to typography token, **Then** line-height class removed (optimal line-height defined in token: headings = 1.25, body = 1.5)
8. **Given** component uses `dark:text-white` or `dark:text-slate-300`, **When** migrated, **Then** uses CSS variable: `text-foreground` (auto dark mode, #F5F5F5 in dark theme, not pure white)
9. **Given** component uses raw Tailwind font size with manual responsive (`text-2xl sm:text-3xl lg:text-4xl`), **When** migrated, **Then** uses typography token: `text-heading-1` (responsive scaling automatic: 24px → 30px → 36px)
10. **Given** semantic HTML (h1) doesn't match visual size (uses text-sm), **When** audit runs, **Then** flagged as "Semantic Mismatch - h1 should use text-heading-1"
11. **Given** code snippet exists, **When** migrated, **Then** uses: `<code className="font-mono text-body-small">` (Fira Code font, 14px)
12. **Given** ALL-CAPS label exists, **When** migrated, **Then** uses: `<span className="text-caption uppercase">` (12px with letter-spacing 0.025em automatic)
13. **Given** button text uses custom font-weight, **When** migrated to shadcn Button, **Then** font-weight removed (shadcn Button uses font-semibold, letter-spacing 0.025em automatic)
14. **Given** developer views typography in Storybook dark theme, **When** inspected, **Then** all text colors use CSS variables (--color-foreground, --color-subtle), NOT hardcoded hex/rgb
15. **Given** typography migration complete, **When** audit runs, **Then** zero raw Tailwind font classes (text-xl, text-2xl, text-sm), zero inline font-weights on typography elements, zero dark:text-X classes

---

### User Story 9 - Standardize Animations & Transitions (Priority: P9)

Developer replaces custom animations with shadcn/ui built-in animations and defined transition tokens. Removes performance-killing `transition-all` utilities, standardizes durations (fast/normal/slow).

**Why this priority**: Inconsistent animation durations (200ms vs 300ms vs 500ms), performance issues (transition-all), missing animations (modals just appear). shadcn provides optimized, accessible animations.

**Independent Test**: All interactive elements use shadcn animations or defined tokens, zero `transition-all`, consistent durations, smooth 60fps performance.

**Acceptance Scenarios**:

1. **Given** button has hover state, **When** migrated to shadcn Button, **Then** uses built-in transition: `transition-colors duration-200` (automatic in Button component)
2. **Given** modal opens, **When** animation plays, **Then** uses shadcn Dialog animation (data-state="open" triggers fade-in) with 200ms duration
3. **Given** card has hover effect, **When** migrated, **Then** uses specific transition: `transition-shadow duration-200 hover:shadow-lg` (not transition-all)
4. **Given** custom animation exists, **When** migration reviewed, **Then** replaced with shadcn equivalent or defined token: `duration-fast` (150ms), `duration-normal` (200ms), `duration-slow` (300ms)
5. **Given** loading spinner animates, **When** migrated, **Then** uses lucide-react Loader2 with `animate-spin` (optimized transform animation)
6. **Given** accordion expands, **When** migrated to shadcn Accordion, **Then** uses built-in slide-down animation (data-state="open") with smooth easing
7. **Given** animation token is defined, **When** developer applies, **Then** uses semantic class: `className={cn("transition-colors", animations.normal)}` where `animations.normal = "duration-200"`

---

### User Story 10 - Create Migration Tracking System (Priority: P10)

Developer can track migration progress per component and identify remaining inconsistent patterns.

**Why this priority**: Ensures systematic completion and prevents regression.

**Independent Test**: Dashboard or report shows migration status: X% of components migrated, Y hardcoded classes remaining, Z files pending review.

**Acceptance Scenarios**:

1. **Given** migration is in progress, **When** developer runs status script, **Then** markdown report shows completed vs. pending components with file counts
2. **Given** component is fully migrated, **When** marked complete, **Then** file is added to "migrated" list and excluded from future inconsistency scans
3. **Given** new hardcoded class is introduced, **When** pre-commit hook runs, **Then** developer receives warning about violating naming convention

---

### Edge Cases

#### Migration Process
- What happens when a component uses both old and new class patterns during migration? (Component should be fully migrated in single commit to avoid confusion)
- How does system handle third-party component libraries that don't follow convention? (Document exceptions, wrapper with semantic classes, add to exceptions list)
- What if a hardcoded class is intentional (one-off design)? (Add inline comment with justification and exemption marker: `{/* Exception: Marketing hero - approved by design */}`)
- How to handle dynamic class names (conditional styling)? (Use design token utilities with conditional logic, document pattern: `className={cn("text-body", isActive && "text-primary")}`)
- What if design token doesn't exist for a needed style? (Add to design token system first, then use in component - don't create one-off classes)

#### Technical Edge Cases
- What if component uses CSS Modules alongside Tailwind? (Preserve CSS Modules, migrate only Tailwind classes in className prop)
- How to handle template literal className with dynamic values? (e.g., `className={\`text-\${color}-600\`}` - flag for manual review, likely needs refactor to use variant pattern)
- What if component has both inline styles AND className? (Migrate className only, flag inline styles for separate refactor if they duplicate design tokens)
- How to handle className on SVG elements (fill, stroke)? (Migrate to design token colors: `fill-primary`, `stroke-border`)
- What if component uses clsx or classnames library? (Replace with shadcn's cn() utility for consistency: `cn("base-class", condition && "conditional-class")`)

#### Component-Specific Edge Cases
- How to migrate button with custom loading spinner? (Use shadcn Button with lucide-react Loader2 icon, preserve loading state logic)
- What if form uses Formik instead of React Hook Form? (shadcn components work with both - preserve Formik logic, just swap UI components)
- How to handle card with custom shadow on hover? (Use shadcn Card with className override: `<Card className="hover:shadow-2xl">`)
- What if modal has custom backdrop color (not 80% black)? (Document as exception if design requirement, otherwise standardize)
- How to migrate icon that changes color based on state? (Use lucide-react with conditional className: `<Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />`)

#### Accessibility Edge Cases
- What if focus state conflicts with design system? (Design system focus states are WCAG compliant - use those, update design if needed)
- How to handle components with custom focus indicators (outlines, underlines)? (Migrate to shadcn focus-visible pattern: `focus-visible:ring-2 focus-visible:ring-ring`)
- What if screen reader text needs specific styling (sr-only)? (Use Tailwind's sr-only utility - works with design tokens)

#### Testing Edge Cases
- What if Chromatic shows intentional visual changes? (Approve changes in Chromatic after design review, document reason)
- How to test components that require authentication? (Use Storybook with mock auth context, test both logged-in and logged-out states)
- What if migration breaks in specific browser? (Test in Chrome, Firefox, Safari, Edge - shadcn supports all modern browsers)

#### Deployment Edge Cases
- What if migration needs to be rolled back? (Use backup/ directory, restore files, redeploy - document rollback steps)
- How to handle migration across multiple environments (dev, staging, prod)? (Deploy to dev first, validate, then staging, then prod with feature flags if needed)
- What if migration conflicts with other in-flight features? (Coordinate with team, merge order: design tokens → CSS migration → feature work)

## Requirements *(mandatory)*

### Functional Requirements

#### shadcn/ui Setup & Logic Preservation (NEW - P0)
- **FR-000**: System MUST install shadcn/ui CLI and configure to use dark theme CSS variables in `globals.css`
- **FR-000a**: Dark theme CSS variables MUST be defined in shadcn-compatible format:
  - `--background: 0 0% 0%;` (pure black background)
  - `--foreground: 210 40% 91%;` (light slate text)
  - `--primary: 173 58% 39%;` (teal accent)
  - `--card: 222 47% 11%;` (dark slate cards)
  - `--destructive: 0 63% 31%;` (red for errors)
  - `--muted: 217 33% 17%;` (muted backgrounds)
  - `--border: 215 28% 17%;` (slate borders)
  - `--ring: 173 58% 39%;` (teal focus rings)
  - `--radius: 0.5rem;` (8px border radius)
- **FR-000b**: App MUST be locked to dark theme during migration: ThemeProvider default='dark', theme toggle hidden
- **FR-001a**: shadcn/ui components MUST be initialized with variants mapped to dark theme design tokens (`primary` → `bg-primary`, `destructive` → `bg-destructive`)
- **FR-001b**: System MUST audit every existing component and extract logic signature: props interface, state variables (useState), event handlers (onClick, onChange), side effects (useEffect, API calls), routing logic (useRouter, Link)
- **FR-001c**: Logic audit report MUST generate "Logic Preservation Checklist" for each component with step-by-step migration instructions
- **FR-001d**: Components with high-risk logic (async operations, form validation, authentication checks) MUST be flagged with "Test Thoroughly" warnings
- **FR-001e**: Storybook MUST be configured with hot reload enabled (Fast Refresh) so developer sees UI changes in real-time without manual refresh IN DARK THEME ONLY
- **FR-001f**: Each component migration MUST include "Before/After Logic Verification" with test cases proving functionality unchanged
- **FR-001g**: Developer workflow MUST support "see-as-you-go": open Storybook + component file side-by-side, make changes, see updates instantly

#### Audit & Analysis
- **FR-001**: System MUST scan all `.tsx`, `.ts`, `.jsx`, `.js` files in `src/` directory for `className` attribute usage
- **FR-002**: System MUST extract and catalog every unique class name with usage count and file locations
- **FR-003**: System MUST categorize classes by component type (button, icon, form, card, typography, layout, utility)
- **FR-004**: System MUST identify hardcoded color classes (e.g., `bg-teal-600`, `text-blue-500`) and flag as "Inconsistent"
- **FR-005**: System MUST identify hardcoded spacing classes without semantic meaning (e.g., `p-4` instead of `p-card-padding`)
- **FR-006**: System MUST detect shared classes between unrelated component types (e.g., same class on button and icon)
- **FR-007**: System MUST flag industry standard violations (e.g., missing focus states, non-mobile-first responsive, arbitrary values)
- **FR-008**: Audit report MUST be generated as markdown file with sections for each component category
- **FR-009**: Each class entry MUST show: class name, usage count, file locations, categorization (consistent/inconsistent/violation), recommended replacement

#### Naming Convention Definition
- **FR-010**: Convention document MUST define mapping between design token categories and Tailwind utilities
- **FR-011**: Convention MUST provide clear rules for color usage: semantic tokens only (`bg-primary`, not `bg-teal-600`)
- **FR-012**: Convention MUST define spacing pattern: semantic tokens for component padding/margins (`p-card-padding`, `m-section-margin`)
- **FR-013**: Convention MUST define typography pattern: use typography tokens (`text-heading-1`, `text-body`, `text-label`)
- **FR-014**: Convention MUST define shadow pattern: use shadow tokens (`shadow-card`, `shadow-modal`)
- **FR-015**: Convention MUST define border pattern: use border tokens (`rounded-card`, `rounded-button`, `border-input`)
- **FR-016**: Convention MUST include decision flowchart for when to use utility classes vs. component-specific classes
- **FR-017**: Convention MUST document inline comment pattern for token attribution: `{/* Component context - token.path */}`
- **FR-018**: Convention MUST align with Constitution Section VI (Styling & Theming) requirements
- **FR-019**: Convention MUST support mobile-first responsive design with documented breakpoint usage

#### Migration Tooling (Enhanced for shadcn/ui)
- **FR-020**: System MUST provide migration script that replaces custom components with shadcn/ui equivalents while preserving logic
- **FR-020a**: Migration script MUST map custom component patterns to shadcn/ui components (CustomButton → shadcn Button, CustomInput → shadcn Input, CustomCard → shadcn Card)
- **FR-020b**: Migration script MUST preserve ALL props and handlers when swapping components (onClick, onChange, value, disabled, className, etc.)
- **FR-021**: Migration script MUST add inline comments documenting what logic was preserved: `{/* Preserved: onClick handler, loading state, validation logic */}`
- **FR-022**: Migration script MUST preserve existing consistent patterns (no unnecessary changes to working logic)
- **FR-022a**: Migration script MUST NOT touch component logic (state management, API calls, routing) - ONLY swap UI layer
- **FR-023**: Migration script MUST operate on single component file at a time for controlled updates with immediate Storybook verification
- **FR-024**: Migration script MUST create backup before modifying files (timestamped in `backup/` directory)
- **FR-025**: Migration script MUST validate shadcn/ui component exists before applying migration (check `components/ui/` directory)
- **FR-025a**: If shadcn/ui component doesn't exist, script MUST prompt to install it: `npx shadcn-ui@latest add button`

#### Typography System (ENHANCED - Leverages Feature 004)
- **FR-026**: Typography MUST use semantic tokens from feature 004 design system (NOT raw Tailwind classes):
  - Headings: `text-heading-1` (36px desktop), `text-heading-2` (30px desktop), `text-heading-3` (24px desktop), `text-heading-4` (20px desktop)
  - Body: `text-body` (14px mobile, 16px desktop), `text-body-large` (16px mobile, 18px desktop), `text-body-small` (14px)
  - Labels: `text-label` (14px, font-medium)
  - Captions: `text-caption` (12px with letter-spacing)
  - Buttons: `text-button` (14px mobile, 16px desktop, font-semibold, letter-spacing) - OR use shadcn Button (handles automatically)
- **FR-027**: Semantic HTML MUST match visual hierarchy (WCAG 2.1 SC 1.3.1 Information and Relationships):
  - h1 elements MUST use `text-heading-1` (largest)
  - h2 elements MUST use `text-heading-2` (second largest)
  - h3 elements MUST use `text-heading-3`
  - h4 elements MUST use `text-heading-4`
  - NO `<div>` styled as heading (use proper h1-h6 elements)
  - NO h1 with smaller class than h2 (breaks semantic hierarchy)
- **FR-028**: Typography tokens include font-weight, line-height, letter-spacing - components MUST NOT override:
  - NO `font-bold` with `text-heading-1` (weight already 700 in token)
  - NO `leading-relaxed` with `text-body` (line-height already 1.5 in token)
  - NO `tracking-tight` with `text-heading-1` (letter-spacing already -0.025em in token)
  - Exception: Utility classes like `uppercase`, `truncate`, `text-center` are allowed
- **FR-029**: Font family MUST use design tokens with full fallback stack:
  - Remove `inter.className` from layout.tsx (use Tailwind's `font-sans` instead)
  - Default font: `font-sans` = Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
  - Code snippets: `font-mono` = "Fira Code", "Courier New", Consolas, Monaco, monospace
  - Email templates: Use `font-family: Inter, system-ui, sans-serif;` (NOT Arial)
- **FR-030**: Text colors in dark theme MUST use CSS variables (NOT hardcoded slate/white):
  - Primary text: `text-foreground` (uses `--color-foreground`: #F5F5F5 in dark theme, NOT pure white)
  - Secondary text: `text-muted-foreground` (uses `--color-subtle`: #A0A0A0 in dark theme)
  - Remove ALL `dark:text-white`, `dark:text-slate-300`, `dark:text-slate-200` classes
  - Exception: `text-white` on colored backgrounds (buttons, badges) is allowed
- **FR-031**: Responsive typography MUST scale mobile → desktop automatically:
  - Body text: 14px mobile → 16px desktop (use `text-body`, NOT manual `text-sm lg:text-base`)
  - Headings: Mobile (smaller) → Desktop (larger) per token definition (use `text-heading-X`, NOT manual responsive classes)
  - Typography tokens handle responsive scaling automatically
- **FR-032**: Typography audit script MUST detect violations:
  - Flag raw Tailwind font classes (text-xl, text-2xl, text-sm, text-base) as "Use typography token instead"
  - Flag inline font-weight on headings as "Remove - weight defined in token"
  - Flag inline line-height on body text as "Remove - line-height defined in token"
  - Flag `dark:text-X` as "Use text-foreground or text-muted-foreground instead"
  - Flag semantic mismatch (h1 with text-sm) as "Semantic HTML violation - WCAG 2.1"

#### Accessibility & Polish
- **FR-033**: System MUST enforce focus-visible states on ALL interactive elements (buttons, inputs, links, cards with onClick) using `focus-visible:ring-2 focus-visible:ring-ring`
- **FR-034**: Button component MUST support loading prop with consistent spinner (lucide-react Loader2), disabled state, and `aria-busy="true"` during loading
- **FR-035**: Form components MUST display validation errors below field using shadcn FormMessage with `text-destructive` color and AlertCircle icon
- **FR-036**: Modal/Dialog MUST use shadcn Dialog with standardized dark backdrop (80% black, 8px blur) and z-index 50, above all other layers
- **FR-037**: Icon sizes MUST follow semantic scale using lucide-react library:
  - `h-3 w-3` (12px - Badge icons)
  - `h-4 w-4` (16px - Button icons)
  - `h-5 w-5` (20px - Card icons)
  - `h-6 w-6` (24px - Header icons)
  - `h-8 w-8` (32px - Hero icons)
- **FR-038**: Animations MUST use shadcn built-in animations (Dialog fade-in, Accordion slide-down) or defined tokens (duration-fast/normal/slow), NEVER `transition-all`
- **FR-039**: Glassmorphism MUST be shadcn Card variant with dark theme styling: `bg-card/80 backdrop-blur-sm`, not global CSS class
- **FR-040**: Card component MUST have glassmorphism variant: `<Card variant="glass">` applies dark theme glassmorphism automatically

#### Validation & Tracking
- **FR-041**: System MUST provide validation script that checks component against naming convention
- **FR-042**: Validation script MUST detect remaining hardcoded colors, spacing, typography violations
- **FR-043**: System MUST track migration status per file (not started, in progress, completed, verified)
- **FR-044**: System MUST generate progress report showing percentage completion by component category
- **FR-045**: System MUST support marking files as "exception" with documented justification
- **FR-046**: Migration MUST complete dark theme to 100% before adding light/brand themes (tracked via checklist)

#### Documentation & Knowledge Transfer (NEW - Critical for Team)
- **FR-047**: System MUST generate migration guide with before/after code examples for each component type
- **FR-048**: Guide MUST include troubleshooting section for common migration issues (broken props, missing imports, type errors)
- **FR-049**: Guide MUST document exception handling process (when to use custom classes, how to justify)
- **FR-050**: System MUST create Storybook stories for all shadcn/ui components with dark theme variants
- **FR-051**: Stories MUST show all states (default, hover, focus, disabled, loading, error) for each component
- **FR-052**: System MUST document rollback procedure if migration causes critical bugs (restore from backup/)
- **FR-053**: Guide MUST include onboarding checklist for new developers (setup shadcn, configure Storybook, run audit)

#### Testing & Quality Assurance (NEW - Critical for Production)
- **FR-054**: System MUST run visual regression tests (Chromatic) for EVERY migrated component before marking complete
- **FR-055**: System MUST provide interaction test templates for high-risk components (forms, auth, checkout)
- **FR-056**: System MUST validate accessibility with automated tools (axe-core, Lighthouse) after migration
- **FR-057**: System MUST verify responsive behavior on mobile (375px), tablet (768px), desktop (1440px) breakpoints
- **FR-058**: System MUST test keyboard navigation (Tab, Enter, Space, Esc) for interactive components
- **FR-059**: System MUST verify focus-visible states work correctly (not just focus) using keyboard navigation
- **FR-060**: System MUST test with screen readers (NVDA on Windows, VoiceOver on Mac) for critical flows
- **FR-061**: System MUST measure and compare bundle size before/after migration (should not increase >5%)
- **FR-062**: System MUST verify dark theme colors match design system (use color picker to validate hex values)

#### Third-Party Integration & Edge Cases (NEW - Production Readiness)
- **FR-063**: System MUST document how to wrap third-party components (React Select, Date Pickers) with shadcn styling
- **FR-064**: System MUST handle dynamic className (cn() utility, conditional classes) in migration script
- **FR-065**: System MUST preserve CSS modules if used alongside Tailwind (don't break existing patterns)
- **FR-066**: System MUST handle template literals in className (e.g., `className={\`text-\${color}\`}`) - flag as manual review
- **FR-067**: System MUST handle clsx/classnames library usage (replace with shadcn's cn() utility)
- **FR-068**: System MUST document pattern for client/server components (Next.js 'use client' directive preserved)
- **FR-069**: System MUST handle SVG components with className props (migrate fill/stroke to design tokens)

### Key Entities

- **CSS Class Pattern**: Represents a unique className string with metadata (usage count, locations, type, consistency status, recommended replacement, industry standard compliance)
- **Component Category**: Groups related components (Button, Icon, Form, Card, Typography, Layout, Utility)
- **Design Token Mapping**: Links CSS utility classes to design token paths (e.g., `bg-primary` → `colors.primary.light`)
- **Migration Status**: Tracks per-file migration state (not started, in progress, completed, verified, exception)
- **Naming Convention Rule**: Defines allowed patterns for each component category with examples and anti-patterns
- **Component Logic Signature** (NEW): Documents component's behavioral contract (props interface, state variables, event handlers, side effects, routing) - used to verify logic preservation after migration
- **shadcn/ui Component Mapping** (NEW): Links custom components to shadcn/ui equivalents (CustomButton → Button, CustomInput → Input, CustomCard → Card, etc.)
- **Logic Preservation Checklist** (NEW): Per-component checklist ensuring all functionality verified after UI migration (click handlers work, validation fires, API calls succeed, routing navigates)
- **Exception Record** (NEW): Documents components/patterns exempt from migration with justification (third-party components, one-off designs, technical limitations)
- **Visual Regression Baseline** (NEW): Chromatic snapshots of components before migration - used to validate no unintended visual changes
- **Accessibility Test Result** (NEW): axe-core scan results + manual screen reader testing notes for each component
- **Bundle Size Metric** (NEW): Before/after bundle size comparison per component category (ensures no performance regression)
- **Migration Guide Entry** (NEW): Before/after code example + troubleshooting tips for each component type

## Success Criteria *(mandatory)*

### Measurable Outcomes (DARK THEME ONLY)

- **SC-000**: shadcn/ui installed and configured with dark theme CSS variables within 30 minutes, developer can see real-time UI updates in Storybook (dark theme) with <3 second hot reload
- **SC-000a**: App locked to dark theme during migration: ThemeProvider defaults to 'dark', theme toggle hidden, Storybook shows dark theme only
- **SC-001**: 100% of CSS classes AND component logic in the codebase are documented in audit report within 2 hours of running audit script
- **SC-001a**: Logic audit report documents 100% of component behavioral contracts (props, state, handlers, effects) with "Logic Preservation Checklist" for each component
- **SC-002**: Audit report clearly separates consistent patterns (token-based) from inconsistent patterns (hardcoded) with visual distinction (tables, color coding, emojis)
- **SC-003**: Naming convention document covers all component categories in existing design token system AND shadcn/ui component mapping guide FOR DARK THEME
- **SC-004**: 90% of developers can correctly migrate component to shadcn/ui while preserving logic after reviewing convention + logic audit once
- **SC-005**: Button component migration demonstrates zero functional regression (all clicks work, loading states work, routing works) AND zero visual regression (Chromatic comparison in dark theme shows intentional improvements only)
- **SC-006**: After button migration, 100% of buttons use shadcn/ui Button component with dark theme design token variants, zero hardcoded color/spacing values, and ALL original functionality intact
- **SC-007**: Migration adds inline comments to 100% of migrated components documenting what logic was preserved: `{/* Preserved: [list of handlers/state/effects] */}`
- **SC-008**: Migration progress report shows real-time completion percentage, remaining file count, AND logic verification status per component category
- **SC-009**: Pre-commit hook catches 95% of new hardcoded class additions AND prevents merging components that lost functionality
- **SC-010**: Codebase consistency score improves from current baseline to >90% shadcn/ui component usage with >85% dark theme design token usage
- **SC-011**: Developer can migrate one component, save file, and see updated dark theme UI in Storybook within 3 seconds without manual refresh (hot reload working)
- **SC-012**: Zero "hoping for the best" - every migrated component has automated test OR manual checklist verifying functionality before marking complete
- **SC-013**: 100% of interactive elements have visible focus states in dark theme (focus-visible:ring-2 focus-visible:ring-ring)
- **SC-014**: 100% of buttons with loading state use lucide-react Loader2 spinner with aria-busy="true"
- **SC-015**: 100% of form validation errors display using shadcn FormMessage with text-destructive color in dark theme
- **SC-016**: 100% of modals use shadcn Dialog with consistent dark backdrop (bg-black/80 backdrop-blur-sm) and z-index 50
- **SC-017**: 100% of icons from lucide-react library with semantic size classes (h-4 for buttons, h-5 for cards, etc.)
- **SC-018**: 100% of headings use typography scale with dark theme compatible colors (text-foreground, text-muted-foreground)
- **SC-019**: Zero use of transition-all, all animations use shadcn built-ins or defined tokens (duration-fast/normal/slow)
- **SC-020**: Dark theme is 100% complete and perfect before light/brand themes are added (gated by checklist approval)
- **SC-021**: 100% of headings use typography scale tokens (`text-heading-1` through `text-heading-4`), zero raw Tailwind classes (`text-xl`, `text-2xl`, `text-3xl`, `text-4xl`)
- **SC-022**: 100% of body text uses semantic tokens (`text-body`, `text-body-large`, `text-body-small`, `text-caption`, `text-label`)
- **SC-023**: Zero inline font-weight classes on elements using typography tokens (font-bold, font-semibold automatic in tokens)
- **SC-024**: Zero inline line-height classes on elements using typography tokens (leading-tight, leading-relaxed automatic in tokens)
- **SC-025**: Zero `dark:text-white`, `dark:text-slate-X` classes - all text uses CSS variables (`text-foreground`, `text-muted-foreground`)
- **SC-026**: 100% semantic HTML matches visual hierarchy - h1 = text-heading-1 (largest), h2 = text-heading-2, etc. (WCAG 2.1 SC 1.3.1 compliant)
- **SC-027**: Font family uses `font-sans` (Inter) with full fallback stack, code snippets use `font-mono` (Fira Code)
- **SC-028**: Typography responsive scaling verified: 14px mobile → 16px desktop (body), 24px mobile → 36px desktop (h1)

### Documentation & Team Readiness
- **SC-029**: Migration guide published with 10+ before/after code examples covering all component types
- **SC-030**: Storybook has stories for 100% of shadcn/ui components used, showing all variants and states in dark theme
- **SC-031**: Troubleshooting section in guide resolves 90% of common migration issues without escalation
- **SC-032**: New developer can complete setup (shadcn install, Storybook config, run audit) in <15 minutes following guide

### Testing & Quality Gates
- **SC-033**: 100% of migrated components pass visual regression tests (Chromatic) with zero unintended differences
- **SC-034**: Automated accessibility tests (axe-core) show zero new violations post-migration (maintain or improve WCAG AA score)
- **SC-035**: Critical user flows (signup, quote request, dashboard) tested with screen reader, zero navigation blockers
- **SC-036**: Bundle size increase <5% compared to pre-migration baseline (measured with `next build` and analyzed)
- **SC-037**: Lighthouse performance score ≥90, accessibility score 100, best practices ≥95 post-migration
- **SC-038**: All interactive components keyboard-navigable with visible focus indicators (Tab through entire page works)

### Production Readiness & Maintenance
- **SC-039**: Exception documentation exists for 100% of third-party components that can't use shadcn (with wrapper patterns)
- **SC-040**: Pre-commit hook blocks 95% of new violations (hardcoded colors, missing focus states, raw Tailwind font classes)
- **SC-041**: Rollback procedure documented and tested (can restore from backup/ and deploy in <30 minutes)
- **SC-042**: CI/CD pipeline includes automated checks: audit validation, accessibility tests, bundle size monitoring
- **SC-043**: Zero production incidents related to UI breakage in first 2 weeks post-deployment (rollout plan with feature flags if needed)

## Assumptions *(optional)*

- Design token system is complete and covers all necessary color, spacing, typography, shadow, border, and animation values (from feature 004-centralized-theme-color)
- Tailwind config is already extended with design tokens and generates custom utility classes
- Visual regression testing via Chromatic is available for verifying migration doesn't change UI
- Components are primarily React/Next.js with TypeScript (`.tsx` files)
- Migration will happen component-by-component in multiple commits (not big-bang)
- Developers have read Constitution Section VI (Styling & Theming) and understand token-first philosophy
- Storybook stories exist for most components to enable isolated testing

## Dependencies *(optional)*

- **Feature 004**: Centralized design token system must be complete (primitives, semantic tokens, Tailwind integration) - shadcn/ui will consume these tokens FOR DARK THEME ONLY
- **shadcn/ui**: Official shadcn/ui CLI and component library with Tailwind CSS compatibility, configured for dark theme
- **lucide-react**: Icon library for consistent icons across all components (replaces mix of heroicons + custom SVGs)
- Storybook with Fast Refresh (hot reload) for real-time dark theme UI feedback
- Chromatic for visual regression testing (pre/post migration comparison in dark theme)
- Constitution.md Section VI (Styling & Theming) as naming convention reference
- TypeScript/ESLint for static analysis and prop type validation
- Git pre-commit hooks for validation enforcement (blocks hardcoded colors, missing focus states)
- React Testing Library or Playwright for interaction testing (optional but recommended for high-risk components)
- ThemeProvider modification: Lock to dark theme during migration (restore light/brand after dark is perfect)

## Out of Scope *(optional)*

- **Light theme implementation** (will be added AFTER dark theme is 100% complete)
- **Brand theme implementation** (will be added AFTER dark theme is 100% complete)
- **Theme toggle functionality** (hidden during migration, restored after dark theme complete)
- Refactoring component logic or structure (only UI layer changes, logic preserved)
- Creating new components or features (only migrating existing)
- Changing design or visual appearance (maintain dark theme pixel-perfect parity)
- Migrating third-party library components (document exceptions only)
- Automated migration of all files (deliberate, component-by-component approach)
- Performance optimization (not the focus of this feature)
- Adding new design tokens (use existing dark theme token system only)
- Backend/API changes (UI-only feature)
- Database schema changes (UI-only feature)
- Email template HTML/CSS migration (separate feature - document standards only)
- PDF generation styling (separate feature - document standards only)
- Server-side rendered content outside Next.js (e.g., API documentation, external integrations)

## Security Considerations *(optional - include only if feature has security implications)*

- Migration scripts must not expose sensitive data in audit reports (sanitize file paths if needed)
- Pre-commit hooks must not block critical hotfixes (provide override mechanism with justification)
- Audit reports must not include API keys, tokens, or credentials found in className strings
- Migration backups must be excluded from version control (.gitignore entry for `backup/` directory)
- shadcn/ui components must use latest stable versions to avoid known vulnerabilities

## Accessibility Considerations *(optional - include only if feature significantly impacts accessibility)*

- **WCAG 2.1 AA Compliance**: All migrated components must maintain or improve accessibility (minimum target)
- **Focus Management**: Naming convention must preserve WCAG-compliant focus states on interactive elements (SC 2.4.7 Focus Visible)
- **Keyboard Navigation**: Migration must maintain keyboard navigation functionality (SC 2.1.1 Keyboard)
- **Color Contrast**: Color token usage must preserve sufficient contrast ratios (design tokens already WCAG AA compliant - 4.5:1 for normal text, 3:1 for large text)
- **Semantic HTML**: Typography migration must enforce semantic heading hierarchy (SC 1.3.1 Information and Relationships)
- **ARIA Attributes**: shadcn/ui components include built-in ARIA (aria-busy, aria-label, aria-describedby) - must be preserved
- **Screen Reader Testing**: High-priority components (forms, modals, navigation) must be tested with NVDA/JAWS
- **Focus Trapping**: Modal/Dialog components must properly trap focus (shadcn Dialog handles automatically)
- **Reduced Motion**: Animations must respect `prefers-reduced-motion` media query (shadcn built-in support)
- **Touch Target Size**: Interactive elements must be at least 44x44px (WCAG 2.5.5 Target Size) - verify after migration

## Performance Considerations *(optional - include only if feature significantly impacts performance)*

- **Audit Script Performance**: Should complete scan of entire codebase in under 5 minutes (optimize with parallel file processing)
- **Migration Script Performance**: Should process single component file in under 10 seconds (use AST parsing, not regex)
- **Bundle Size**: Token-based utility classes should not increase bundle size (same Tailwind utilities, just consistent usage)
- **CSS Purging**: Tailwind purge must be configured to remove unused classes (verify in production build)
- **Storybook Hot Reload**: Fast Refresh must complete in <3 seconds for single component change
- **Animation Performance**: All animations must run at 60fps (use transform/opacity, avoid layout thrashing)
- **Lazy Loading**: Large icon libraries (lucide-react) should use tree-shaking (import { Icon } from 'lucide-react')
- **CSS Variables**: Dark theme CSS variables add negligible runtime cost (<1ms paint time)
- **Component Re-renders**: Migration must not introduce unnecessary re-renders (verify with React DevTools Profiler)
- **Lighthouse Scores**: Post-migration Lighthouse performance score must be ≥90 (same as pre-migration baseline)

## Rollout Strategy & Risk Mitigation *(critical for production deployment)*

### Phase 1: Foundation (Week 1)
1. Install shadcn/ui and configure dark theme CSS variables
2. Run component logic audit - generate preservation checklist
3. Set up Storybook with hot reload for all component categories
4. Lock app to dark theme (hide theme toggle temporarily)
5. Create visual regression baselines (Chromatic snapshots)
6. **Risk**: shadcn config conflicts with existing Tailwind - **Mitigation**: Test in isolated branch, verify build before merging

### Phase 2: Low-Risk Components (Week 2)
1. Migrate icons (lucide-react) - no logic, pure visual
2. Migrate typography (semantic tokens) - document semantic HTML patterns
3. Run visual regression tests after each category
4. **Risk**: Icon sizes break layouts - **Mitigation**: Use semantic size tokens (h-4, h-5), validate responsive behavior

### Phase 3: Medium-Risk Components (Week 3)
1. Migrate buttons (shadcn Button) - preserve onClick, loading states
2. Migrate cards (shadcn Card) - preserve mapping logic, conditional rendering
3. Run interaction tests (click handlers, navigation)
4. **Risk**: Button variants don't match design - **Mitigation**: Customize shadcn Button variants in component file, validate with design team

### Phase 4: High-Risk Components (Week 4)
1. Migrate forms (shadcn Input, Select, Textarea) - preserve validation, error handling
2. Migrate modals (shadcn Dialog) - preserve form submission, close handlers
3. Run end-to-end tests for critical flows (signup, quote request)
4. **Risk**: Form validation breaks - **Mitigation**: Test with React Hook Form integration, verify error states, manual QA before deployment

### Phase 5: Validation & Cleanup (Week 5)
1. Run full audit validation script - verify zero violations
2. Accessibility testing with screen readers (NVDA, VoiceOver)
3. Performance testing (Lighthouse, bundle size analysis)
4. Document exceptions and create migration guide
5. **Risk**: Accessibility regressions - **Mitigation**: axe-core in CI, manual keyboard navigation testing

### Phase 6: Deployment (Week 6)
1. Deploy to staging environment - full QA regression testing
2. Monitor error rates, performance metrics (no increase in errors)
3. Deploy to production with feature flag (gradual rollout 10% → 50% → 100%)
4. Monitor for 48 hours - rollback if critical issues
5. **Risk**: Production incidents - **Mitigation**: Feature flag allows instant rollback, backup/ directory for emergency restore

### Rollback Procedures
- **Immediate Rollback** (P0 incident): Disable feature flag, restore from backup/, redeploy (target: <30 minutes)
- **Partial Rollback** (specific component broken): Revert single file from backup/, test, redeploy
- **Full Rollback** (multiple issues): Revert entire feature branch, deploy previous release

### Monitoring & Success Metrics (Post-Deployment)
- **Error Rate**: Should not increase >2% compared to pre-deployment baseline
- **Performance**: Page load time should not increase >100ms
- **Accessibility**: Zero new accessibility violations reported by users or automated tools
- **User Feedback**: Monitor support tickets for UI-related issues (target: <5 tickets/week)
- **Developer Velocity**: Time to add new component should decrease by 30% (consistent patterns)

# Tasks: Comprehensive CSS Class Audit & Standardization

**Feature**: 005-comprehensive-css-class  
**Input**: Design documents from `specs/005-comprehensive-css-class/`  
**Prerequisites**: ✅ plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT REQUIRED (tests are optional, not requested in spec)  
**Organization**: Tasks grouped by user story for independent implementation

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US0, US1, US2, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shadcn/ui installation

- [X] T001 Install shadcn/ui CLI and initialize with dark theme configuration: `npx shadcn@latest init` (creates `components.json`, `src/lib/utils.ts` with cn() utility, adds CSS variables to `src/app/globals.css`)
- [X] T002 [P] Install lucide-react icon library: `npm install lucide-react` (replacement for heroicons)
- [X] T003 [P] Install core shadcn/ui components: `npx shadcn@latest add button card input label select dialog tooltip badge form`
- [X] T004 Configure Tailwind with custom typography tokens in `tailwind.config.js` (text-heading-1 through text-heading-4, text-body, text-body-large, text-body-small, text-caption, text-label, text-button with responsive sizing)
- [X] T005 Add custom icon size utilities to `tailwind.config.js` via plugin: icon-xs (12px), icon-sm (16px), icon-md (20px), icon-lg (24px), icon-xl (32px)
- [X] T006 Update `src/app/globals.css` with shadcn-compatible dark theme CSS variables: --background (0 0% 0%), --foreground (210 40% 91%), --primary (174 100% 29%), --card, --destructive, --muted, --border, --ring, --radius
- [X] T007 Lock ThemeProvider to dark theme in `src/components/ThemeProvider.tsx` (set defaultTheme='dark', remove theme toggle temporarily)
- [X] T008 [P] Create backup directory structure: `backup/` with .gitignore entry (exclude from version control)
- [X] T009 [P] Setup Storybook 7+ if not exists: `npx storybook@latest init`, configure dark theme decorator in `.storybook/preview.ts` (import globals.css, set dark mode)
- [X] T010 [P] Install Chromatic for visual regression: `npm install --save-dev chromatic` (sign up at chromatic.com, get project token)

**Checkpoint**: ✅ Foundation infrastructure ready - shadcn/ui configured, Storybook running with dark theme, backups enabled

---

## Phase 2: Foundational (Blocking Prerequisites) 🎯 US0

**Purpose**: Component audit and migration scripts that ALL user stories depend on

**⚠️ CRITICAL**: No component migration can begin until audit and scripts are complete

- [X] T011 [US0] Create CSS class audit script in `scripts/audit-css-classes.ts`: scan all .tsx/.jsx files for className usage, categorize by component type (button/icon/form/card/typography), identify hardcoded colors (bg-teal-600, text-blue-500), flag industry standard violations, output to `specs/005-comprehensive-css-class/audit-report.md`
- [X] T012 [US0] Create component logic audit script in `scripts/audit-component-logic.ts`: use ts-morph to parse TypeScript AST, extract props interface, state variables (useState), event handlers (onClick, onChange), effects (useEffect), API calls (fetch, axios), router usage (useRouter, router.push), conditional rendering (ternary, logical-and, if-statement), output to `specs/005-comprehensive-css-class/logic-audit/[ComponentName].md` with risk level (low/medium/high) and preservation checklist
- [X] T013 [US0] Run CSS class audit script and generate initial report: `npx tsx scripts/audit-css-classes.ts > specs/005-comprehensive-css-class/audit-report.md`
- [X] T014 [US0] Run component logic audit on high-priority components (Button, Input, Card, Modal): `npx tsx scripts/audit-component-logic.ts src/components/Button.tsx` (repeat for each component, generates logic-audit/Button.md with props/state/handlers)
- [X] T015 [US0] Create migration tracking JSON structure in `specs/005-comprehensive-css-class/migration-status.json`: define MigrationStatus interface (componentName, filePath, status, priority, migrationDate, migratedBy, logicPreservationChecklist, testingStatus)
- [X] T016 [US0] Initialize migration status for all components: populate migration-status.json with 33+ components from audit report, set all to status="not-started", assign priorities (P0-P10 based on user stories)
- [X] T017 [US0] Create migration script in `scripts/migrate-component.ts`: implement CLI with commands (audit, migrate, track, report, rollback, validate), AST-based transformation logic, backup creation before migration, dry-run mode, interactive prompts for replacements
- [X] T018 [US0] Create validation script in `scripts/validate-classnames.ts`: check for forbidden patterns (hardcoded colors, raw typography utilities, transition-all), suggest fixes (bg-teal-600 → bg-primary, text-2xl → text-heading-2), exit with error if violations found (for CI/CD)
- [X] T019 [US0] Create progress tracking script in `scripts/track-progress.ts`: read migration-status.json, generate markdown report with completion percentage, breakdown by priority, list of pending files, estimated completion date
- [X] T020 [US0] Setup pre-commit hook with Husky: `npm install --save-dev husky`, `npx husky init`, create `.husky/pre-commit` that runs validate-classnames.ts on staged files only (must complete <3 seconds)
- [X] T021 [US0] Install ESLint Tailwind plugin: `npm install --save-dev eslint-plugin-tailwindcss`, configure in `.eslintrc.js` with rules (no-custom-classname warn, no-contradicting-classname error)
- [X] T022 [US0] Create naming convention JSON in `specs/005-comprehensive-css-class/naming-convention.json`: define allowed patterns (semantic tokens), forbidden patterns (hardcoded colors, raw utilities), examples (correct/incorrect)
- [X] T023 [US0] Create exception tracking JSON in `specs/005-comprehensive-css-class/exceptions.json`: define ComponentException structure (componentName, reason, justification, workaround, approvedBy, approvalDate)

**Checkpoint**: ✅ Foundation ready - audit reports generated (211 violations found), migration scripts operational, validation in place, tracking system initialized with 61 components. Component migration can now begin in parallel.

---

## Phase 3: User Story 0 - Setup shadcn/ui & Component Logic Audit (Priority: P0) 🎯 FOUNDATION

**Goal**: Install shadcn/ui with dark theme, audit all component logic, create Storybook stories for real-time development

**Independent Test**: shadcn/ui installed with dark theme CSS variables, audit reports show logic signatures for all components, Storybook hot reload works, app locked to dark theme

**NOTE**: Most tasks already completed in Phase 1 and Phase 2. These remaining tasks finalize US0:

- [X] T024 [US0] Create Button Storybook story in `stories/button.stories.tsx`: import shadcn Button, define meta with title="Components/Button" and autodocs, create stories for all variants (default, destructive, outline, secondary, ghost, link) and all sizes (default, sm, lg, icon), add loading state story
- [X] T025 [P] [US0] Create Input Storybook story in `stories/input.stories.tsx`: import shadcn Input and Label, create stories for text/email/password types, error state with border-destructive, disabled state
- [X] T026 [P] [US0] Create Card Storybook story in `stories/card.stories.tsx`: import shadcn Card components, create stories with different content structures (CardHeader + CardContent, CardContent + CardFooter, full structure)
- [X] T027 [P] [US0] Create Dialog Storybook story in `stories/dialog.stories.tsx`: import shadcn Dialog components, create story with form inside dialog, story with confirmation dialog
- [ ] T028 [US0] Configure Chromatic baseline: `npx chromatic --project-token=<TOKEN>` (creates initial visual regression snapshots for all Storybook stories in dark theme)
- [ ] T029 [US0] Document logic preservation workflow in `specs/005-comprehensive-css-class/quickstart.md` section "How to Use Audit Reports" with step-by-step checklist

**Checkpoint**: ✅ US0 nearly complete - shadcn/ui ready, audit system operational, Storybook stories created, developer can migrate first component (Chromatic setup pending - requires project token)

---

## Phase 4: User Story 1 - Generate Comprehensive Class Audit Report (Priority: P1) 🎯 MVP

**Goal**: Understand current CSS class usage across codebase, identify inconsistencies and patterns

**Independent Test**: Audit report shows all CSS classes grouped by component type with consistency analysis and industry standard violation flags

**NOTE**: Audit script already created in Phase 2 (T011). These tasks enhance and validate the report:

- [x] T030 [US1] Enhance audit report with statistics section: add total files scanned, total className instances, unique class count, most common classes (top 20), most violated patterns (hardcoded colors, raw typography) - **COMPLETED 2025-01-28** - Added Enhanced Statistics section with violation breakdown (hardcoded colors 74%, raw typography 12%, forbidden utilities), top 20 most common classes with ✅/❌ indicators, files with most violations
- [x] T031 [US1] Add button class analysis section to audit report: group all button-related classes, identify primary action styling patterns (bg-teal-600 vs bg-primary), flag inconsistencies (different buttons use different colors) - **COMPLETED 2025-01-28** - Added Button Class Analysis with 6 current patterns mapped to shadcn Button variants, recommended variants table, P3 priority assessment
- [x] T032 [US1] Add icon class analysis section to audit report: group all icon size classes (h-X w-X patterns), identify color patterns (text-X on icons), flag shared classes between icons and text (problematic) - **COMPLETED 2025-01-28** - Added Icon Class Analysis with 7 size/color patterns (580+ instances), icon size utilities reference, migration strategy (lucide size prop vs icon-* utilities), P4 priority
- [x] T033 [US1] Add form class analysis section to audit report: group input/select/textarea classes, identify label styling patterns, flag validation state inconsistencies - **COMPLETED 2025-01-28** - Added Form Class Analysis with 7 input patterns, validation state inconsistencies documented, recommended shadcn Form pattern with error handling, P5 high-risk priority
- [x] T034 [US1] Add card/container class analysis section to audit report: group card wrapper classes, identify padding/spacing patterns, flag shadow inconsistencies - **COMPLETED 2025-01-28** - Added Card/Container Class Analysis with 6 card patterns, container spacing inconsistencies (padding, section spacing, grid gaps), recommended shadcn Card pattern, P6 priority
- [x] T035 [US1] Add typography class analysis section to audit report: group heading classes (text-X font-X), identify body text patterns, flag semantic HTML mismatches (h1 using text-sm) - **COMPLETED 2025-01-28** - Added Typography Class Analysis with 8 element patterns (h1-h4, p, span, label, button), semantic HTML mismatches (34 divs, 23 spans), typography token recommendations with Tailwind config, P8 high-volume priority
- [x] T036 [US1] Add recommendations section to audit report: for each violation, suggest fix with migration path (bg-teal-600 → bg-primary, text-2xl → text-heading-2) - **COMPLETED 2025-01-28** - Added Migration Recommendations section with 3 quick wins (bash commands), component migration pattern (5-step workflow), component-specific patterns (Button, Form, Card, Typography examples), validation checklist
- [x] T037 [US1] Generate priority matrix in audit report: categorize components by migration priority (P0 foundation → P10 tracking), estimate effort (low/medium/high), flag high-risk components (forms, modals) - **COMPLETED 2025-01-28** - Added Migration Priority Matrix table (P0-P10 with count/effort/risk/dependencies), risk assessment details, effort estimates (1-2h/3-5h/6-10h)
- [x] T038 [US1] Validate audit report completeness: ensure all 33+ components documented, all className patterns categorized, all hardcoded values flagged, statistics accurate - **COMPLETED 2025-01-28** - Validated: 61 components covered in priority matrix, all violation categories have recommendations, all analysis sections complete

**Checkpoint**: US1 complete - comprehensive audit report generated, all inconsistencies documented with recommended fixes, migration priorities assigned ✅

---

## Phase 5: User Story 2 - Define Token-Based Class Naming Convention (Priority: P2)

**Goal**: Create clear naming convention that maps design tokens to Tailwind classes

**Independent Test**: Convention document covers all component patterns, maps to design tokens, includes decision tree, validated against Constitution and industry standards

- [x] T039 [US2] Create naming convention document structure in `specs/005-comprehensive-css-class/naming-convention.md`: sections for Colors, Typography, Spacing, Shadows, Borders, Icons, Animations - **COMPLETED 2025-01-28** - Created comprehensive naming-convention.md with table of contents (11 sections) and full document structure
- [x] T040 [US2] Document color token conventions: map feature 004 tokens to shadcn CSS variables (bg-primary, text-foreground, border-border), provide examples (correct: bg-primary, incorrect: bg-teal-600) - **COMPLETED 2025-01-28** - Documented color conventions with semantic tokens table (15 background colors, 5 text colors, 4 border colors), custom status colors (success/info/warning), migration examples
- [x] T041 [US2] Document typography token conventions: define semantic heading scale (text-heading-1 through text-heading-4), body text scale (text-body, text-body-large, text-body-small), specialty text (text-caption, text-label, text-button) - **COMPLETED 2025-01-28** - Documented typography with heading scale table (4 levels), body text scale (3 sizes), specialty tokens (label/button), Tailwind config implementation, semantic HTML alignment rules
- [x] T042 [US2] Document spacing conventions: standard spacing scale (space-1 through space-12), usage guidelines (card padding, button spacing, section gaps) - **COMPLETED 2025-01-28** - Documented spacing with common patterns table (9 contexts), container padding standards, responsive spacing examples
- [x] T043 [US2] Document shadow conventions: elevation scale (shadow-sm through shadow-xl), usage per component type (cards use shadow, modals use shadow-lg) - **COMPLETED 2025-01-28** - Documented shadows with elevation scale table (6 levels), shadow values from Tailwind, component-specific guidelines, migration examples
- [x] T044 [US2] Document border radius conventions: rounding scale (rounded-sm through rounded-xl, rounded-full), usage per component (buttons use rounded, cards use rounded-lg) - **COMPLETED 2025-01-28** - Documented borders with radius scale table (7 values), border width standards, component-specific guidelines, migration examples
- [x] T045 [US2] Document icon sizing conventions: semantic size classes (icon-xs through icon-xl), usage per context (button icons use icon-sm, hero icons use icon-xl) - **COMPLETED 2025-01-28** - Documented icons with size utilities table (5 sizes), implementation code, usage patterns (lucide size prop vs icon-* utilities), contextual sizing examples
- [x] T046 [US2] Document animation conventions: duration tokens (duration-fast 150ms, duration-normal 200ms, duration-slow 300ms), transition types (transition-colors, transition-shadow, never transition-all) - **COMPLETED 2025-01-28** - Documented animations with duration tokens table (3 levels), transition types (NEVER transition-all), easing functions, Tailwind config, common patterns, migration examples
- [x] T047 [US2] Create decision tree flowchart: "When to use semantic token vs utility class vs custom component class", add to naming-convention.md - **COMPLETED 2025-01-28** - Created flowchart with 8 decision nodes (common UI component → color → typography → icon → spacing → shadow → border → animation → standard utility), quick reference table
- [x] T048 [US2] Add state pattern section: document hover/focus/active/disabled patterns using design tokens, provide shadcn component examples - **COMPLETED 2025-01-28** - Documented state patterns: hover states (buttons/cards/links), focus states (inputs/custom), active states (buttons/toggles), disabled states, validation states (error/success/warning), loading states
- [x] T049 [US2] Add responsive pattern section: document mobile-first approach, breakpoint usage (sm:, md:, lg:), responsive typography (clamp usage in tokens) - **COMPLETED 2025-01-28** - Documented responsive patterns: mobile-first approach, breakpoints table (5 breakpoints), responsive typography with clamp(), responsive grids, visibility utilities, responsive spacing
- [x] T050 [US2] Add dark theme pattern section: document CSS variable usage, explain how shadcn .dark class applies variables automatically - **COMPLETED 2025-01-28** - Documented dark theme patterns: CSS variable approach (:root and .dark), using theme colors (automatic switching), manual overrides (rare cases), theme-aware components, dark mode testing (locked during migration), adding custom colors
- [x] T051 [US2] Validate convention against Constitution Section VI: ensure alignment with tokenized utilities requirement, verify atomic migration approach documented - **COMPLETED 2025-01-28** - Added Constitution VI Alignment section validating 4 key requirements (tokenized utilities, dark-first, atomic migration, no hardcoded values), constitution references quoted
- [x] T052 [US2] Validate convention against industry standards: verify Tailwind best practices followed, BEM methodology where applicable, atomic design principles - **COMPLETED 2025-01-28** - Added Industry Standards Alignment section validating Tailwind best practices (utility-first, semantic layer, consistency), shadcn best practices (CSS variables, composition, copy-paste), BEM methodology, atomic design principles

**Checkpoint**: US2 complete - naming convention documented, all token categories covered, decision tree provided, validated against standards ✅

---

## Phase 6: REVISED STRATEGY - Complete File-by-File Migration (Priority: P3) 🎯 NEW APPROACH

**NEW PHILOSOPHY**: Migrate each file COMPLETELY in one pass - fix buttons, icons, typography, spacing, colors ALL AT ONCE. Never touch the same file twice.

**Goal**: Work sequentially through homepage, page by page, section by section, modal by modal. Each file gets ONE complete migration pass.

---

### Step 1: Foundation Setup ✅ COMPLETED
- [x] T053 Component Library page created with all variants documented
- [x] T054 Hero.tsx buttons migrated (default, secondary)
- [x] T055 HeaderMenu.tsx buttons migrated (outline, default, ghost)
- [x] T056 InstantQuoteForm.tsx buttons migrated to default/secondary
- [x] T057 QuoteOptionsModal.tsx buttons migrated to default

---

### Step 2: HOMEPAGE COMPLETE MIGRATION - Page by Page 🏠

**MIGRATION ORDER**: Homepage (page.tsx) → sections → modals → dashboards

#### **T058 [P3] Homepage Main (src/app/page.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] Calculator toggle buttons (Quote/Rebate switcher)
- [ ] Replace inline SVG icons with lucide-react
- [ ] Fix all button variants (already partially done)
- [ ] Typography: heading classes → text-heading-* tokens
- [ ] Colors: remove all hardcoded bg-*/text-* → semantic tokens
- [ ] Spacing: standardize padding/margins
- [ ] Verify modal triggers work
- **Estimated time**: 1-2 hours
- **Test**: Full homepage interaction, calculator switching, modal flows

#### **T059 [P3] Hero Section (src/components/Hero.tsx)** - PARTIALLY DONE, NEEDS COMPLETION
**What to migrate in ONE pass**:
- [x] Buttons already migrated (default, secondary)
- [ ] Typography: h1, p tags → semantic tokens (text-heading-1, text-body)
- [ ] Icons: Replace inline SVGs with lucide-react (ArrowRight, Calculator)
- [ ] Colors: Gradient overlays, background colors → CSS variables
- [ ] Spacing: Container padding, button spacing
- [ ] Animations: Verify fade-in animations use standard durations
- **Estimated time**: 30-45 min
- **Test**: Hero displays correctly, buttons work, animations smooth

#### **T060 [P3] InstantQuoteForm (src/components/InstantQuoteForm.tsx)** - PARTIALLY DONE, NEEDS COMPLETION
**What to migrate in ONE pass**:
- [x] Buttons already migrated (default, secondary)
- [ ] Form inputs: Replace with shadcn Input/Label/Select
- [ ] Toggle switches: Residential/Commercial, feature toggles
- [ ] Icons: Replace all inline SVGs with lucide-react (Home, Building, Calculator, etc.)
- [ ] Typography: All headings, labels, help text → semantic tokens
- [ ] Colors: Input borders, backgrounds, validation states
- [ ] Spacing: Form grid, input spacing, section gaps
- [ ] Progress stepper: Use semantic colors
- **Estimated time**: 2-3 hours (COMPLEX - forms, validation, state)
- **Test**: Full quote flow, all 3 steps, validation, result display

#### **T061 [P3] RebateCalculatorForm (src/components/RebateCalculatorForm.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] Buttons: All action buttons → default/secondary variants
- [ ] Form inputs: shadcn Input/Label/Select
- [ ] Icons: lucide-react replacements
- [ ] Typography: headings, labels → tokens
- [ ] Colors: form styling, result cards
- [ ] Spacing: form layout
- [ ] Result modal styling
- **Estimated time**: 2-3 hours
- **Test**: Calculate rebate, view results, modal display

#### **T062 [P3] QuoteOptionsModal (src/components/QuoteOptionsModal.tsx)** - PARTIALLY DONE, NEEDS COMPLETION
**What to migrate in ONE pass**:
- [x] Buttons already migrated (default variant)
- [ ] shadcn Dialog wrapper (if not already)
- [ ] Icons: Phone, FileText, CheckCircle → lucide-react
- [ ] Typography: Modal title, descriptions → tokens
- [ ] Colors: Card backgrounds, hover states
- [ ] Spacing: Modal padding, card spacing
- [ ] Close button: Use shadcn X icon
- **Estimated time**: 45-60 min
- **Test**: Open modal, select quote type, close, backdrop click

#### **T063 [P3] QuoteSuccessModal (src/components/QuoteSuccessModal.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] shadcn Dialog wrapper
- [ ] Buttons: Dashboard, close → variants
- [ ] Icons: CheckCircle, etc. → lucide-react
- [ ] Typography: Success message → tokens
- [ ] Colors: Success styling
- [ ] Spacing: Modal layout
- **Estimated time**: 30-45 min
- **Test**: Success flow, dashboard navigation

#### **T064 [P3] DetailedQuoteAuthModal (src/components/DetailedQuoteAuthModal.tsx)** - NOT STARTED  
**What to migrate in ONE pass**:
- [ ] shadcn Dialog wrapper
- [ ] Form: shadcn Input/Label components
- [ ] Buttons: Submit, close → variants
- [ ] Icons: lucide-react
- [ ] Typography: Form labels → tokens
- [ ] Colors: Form styling
- [ ] Spacing: Form layout
- [ ] Validation states
- **Estimated time**: 1-1.5 hours
- **Test**: Signup flow, validation, submission

#### **T065 [P3] HomeownerSignupModal (src/components/HomeownerSignupModal.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] shadcn Dialog wrapper
- [ ] shadcn Form components (Input/Label)
- [ ] Buttons: Submit, switch to sign-in → variants
- [ ] Icons: lucide-react
- [ ] Typography: Form labels, help text → tokens
- [ ] Colors: Form styling
- [ ] Spacing: Form layout
- [ ] Validation states
- **Estimated time**: 1-1.5 hours
- **Test**: Signup flow, validation, switch modals

#### **T066 [P3] BlogSection (src/components/BlogSection.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] Buttons: "See All Posts", article cards → variants
- [ ] shadcn Card for article cards
- [ ] Icons: category icons → lucide-react
- [ ] Typography: Article titles, excerpts → tokens
- [ ] Colors: Card styling, hover states
- [ ] Spacing: Grid layout, card padding
- **Estimated time**: 1-1.5 hours
- **Test**: Article grid, hover states, navigation

#### **T067 [P3] NewsletterSignup (src/components/NewsletterSignup.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] shadcn Input for email
- [ ] Button: Subscribe → default variant
- [ ] Icons: Mail icon → lucide-react
- [ ] Typography: Heading, description → tokens
- [ ] Colors: Section background, input styling
- [ ] Spacing: Section padding, form layout
- **Estimated time**: 30-45 min
- **Test**: Email input, subscribe button

#### **T068 [P3] Footer (src/components/Footer.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] Buttons: All footer links → appropriate variants
- [ ] Icons: Social icons, Sun logo → lucide-react
- [ ] Typography: Headings, links → tokens
- [ ] Colors: Footer background, link colors
- [ ] Spacing: Footer grid, section spacing
- **Estimated time**: 45-60 min
- **Test**: All footer links, social icons, responsive layout

---

### Step 3: Blog Pages Complete Migration 📝

#### **T069 [P3] Blog Page (src/app/blog/page.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] Search/filter buttons and inputs
- [ ] shadcn Input for search
- [ ] Article cards (reuse BlogSection patterns)
- [ ] Buttons: Filter, load more → variants
- [ ] Icons: Search, filter → lucide-react
- [ ] Typography: Page title, article content → tokens
- [ ] Colors: Page background, card styling
- [ ] Spacing: Page layout, grid
- **Estimated time**: 1.5-2 hours
- **Test**: Search, filter, pagination, article navigation

#### **T070 [P3] Blog Post Page (src/app/blog/post/page.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] Buttons: Back, share, comment → variants
- [ ] shadcn Input/Textarea for comments
- [ ] Icons: Share, comment → lucide-react
- [ ] Typography: Post title, content → tokens
- [ ] Colors: Post styling
- [ ] Spacing: Post layout, comment section
- **Estimated time**: 1.5-2 hours
- **Test**: Read post, comment, share, navigation

---

### Step 4: Dashboard Pages Complete Migration 📊

#### **T071 [P3] Homeowner Dashboard (src/app/homeowner/dashboard/page.tsx)** - NOT STARTED
**What to migrate in ONE pass**:
- [ ] ALL dashboard components in ONE file
- [ ] shadcn Card for stat cards
- [ ] Buttons: All dashboard actions → variants
- [ ] Icons: All dashboard icons → lucide-react
- [ ] Typography: Dashboard headings, labels → tokens
- [ ] Colors: Dashboard theme
- [ ] Spacing: Dashboard layout
- [ ] Tables/lists: shadcn Table if applicable
- **Estimated time**: 3-4 hours (LARGE FILE)
- **Test**: Full dashboard, all tabs, all interactions

#### **T072 [P3] Installer Dashboard (src/app/installer/dashboard/page.tsx)** - NOT STARTED
**Similar scope to homeowner dashboard**
- **Estimated time**: 3-4 hours
- **Test**: Full installer dashboard

#### **T073 [P3] Admin Dashboard (src/app/admin/dashboard/page.tsx)** - NOT STARTED
**Similar scope, likely complex**
- **Estimated time**: 3-4 hours
- **Test**: Full admin dashboard

---

### Step 5: Verification After EACH File ✅ CRITICAL

**T074 [P3] Per-File Verification Checklist** (run after EACH file above):
```bash
# 1. Check for old button classes
grep -r "bg-teal\|bg-primary text-white\|border-gray-300" [file]

# 2. Check for hardcoded typography
grep -r "text-xs\|text-sm\|text-lg\|text-2xl\|text-4xl" [file]

# 3. Check for inline SVG icons (should use lucide-react)
grep -r "<svg" [file]

# 4. Check for hardcoded colors
grep -r "bg-slate-\|text-slate-\|border-slate-" [file]

# 5. Result MUST be ZERO violations before moving to next file
```

---

### Estimated Timeline

**Homepage Section**: ~12-16 hours
- page.tsx, Hero, InstantQuoteForm, RebateCalculator, 4 modals, BlogSection, Newsletter, Footer

**Blog Pages**: ~3-4 hours  
- Blog listing, blog post pages

**Dashboards**: ~9-12 hours
- Homeowner, Installer, Admin dashboards

**TOTAL**: ~24-32 hours (3-4 full work days)

---

**Checkpoint**: US3 REVISED - New file-by-file approach defined. Each file migrated completely in ONE pass (buttons + icons + typography + colors + spacing). No file touched twice. Work sequentially through homepage first.

---

## Phase 7: User Story 4 - Migrate Icon Components to Standard Classes (Priority: P4)

**Goal**: Standardize icon usage with semantic size classes and consistent patterns

**Independent Test**: Icons use dedicated size/color tokens (icon-sm, icon-md, text-foreground), no className conflicts with other components

- [ ] T065 [US4] Create icon audit section in audit report: scan codebase for icon usage patterns (h-X w-X on svg/Icon components), identify size inconsistencies (h-5 w-5 vs h-6 w-6 on similar contexts)
- [ ] T066 [US4] Create icon migration guide in `specs/005-comprehensive-css-class/contracts/icon-migration-guide.md`: document heroicons → lucide-react mapping, provide size token usage examples (icon-sm for button icons, icon-md for cards, icon-lg for headers)
- [ ] T067 [US4] Replace heroicons imports with lucide-react: find all `@heroicons/react` imports with `grep -r "@heroicons/react" src/`, replace with lucide-react equivalents (CheckIcon → Check, XMarkIcon → X, etc.)
- [ ] T068 [US4] Standardize icon sizes in button components: replace hardcoded h-4 w-4 with icon-sm class, ensure consistent sizing across all button variants
- [ ] T069 [US4] Standardize icon sizes in card components: replace hardcoded h-5 w-5 with icon-md class, ensure consistent sizing across all card headers
- [ ] T070 [US4] Standardize icon sizes in navigation components: replace hardcoded h-6 w-6 with icon-lg class, ensure consistent sizing in header/sidebar
- [ ] T071 [US4] Standardize icon colors: replace hardcoded text-teal-600 with text-primary, replace dark:text-white with text-foreground (auto dark mode)
- [ ] T072 [US4] Update icon hover/focus states: ensure icons in clickable contexts use hover:text-primary-foreground or similar semantic tokens
- [ ] T073 [US4] Create icon Storybook stories in `stories/icons.stories.tsx`: showcase all icon sizes (icon-xs through icon-xl), showcase color variants (text-foreground, text-primary, text-destructive), showcase interactive states (hover, focus)
- [ ] T074 [US4] Validate icon accessibility: ensure decorative icons have aria-hidden="true", ensure interactive icons have accessible labels
- [ ] T075 [US4] Update migration status for icons: mark all icon-related components as completed in migration-status.json
- [ ] T075a [US4] **CRITICAL VERIFICATION**: Run validation script to ensure ZERO hardcoded icon classes (h-5 w-5, text-teal-600 on icons) remain. ALL icons MUST use semantic tokens (icon-sm/md/lg, text-foreground/primary). NO hybrid patterns allowed.

**Checkpoint**: US4 complete - all icons use lucide-react, semantic size classes applied, consistent colors from design tokens, ZERO old classes

---

## Phase 8: User Story 5 - Migrate Form Components to shadcn/ui (Priority: P5)

**Goal**: Replace custom form components with shadcn Input/Label/Textarea/Select, preserve validation and state management

**Independent Test**: All forms use shadcn components, maintain validation logic, error messages display correctly

- [ ] T076 [US5] Audit form component logic: run audit-component-logic.ts on Input, Label, Textarea, Select components, document validation patterns, error handling, onChange handlers
- [ ] T077 [US5] Create backups of form components: backup Input.tsx, Label.tsx, Textarea.tsx, Select.tsx with timestamps
- [ ] T078 [US5] Replace Input implementation in `src/components/Input.tsx`: import shadcn Input from @/components/ui/input, create wrapper that preserves existing props, handle error state with className={errors.field ? 'border-destructive' : ''}, preserve onChange/value props for controlled inputs
- [ ] T079 [US5] Replace Label implementation in `src/components/Label.tsx`: import shadcn Label from @/components/ui/label, ensure htmlFor association preserved, maintain text-label styling
- [ ] T080 [US5] Replace Textarea implementation in `src/components/Textarea.tsx`: import shadcn Textarea from @/components/ui/textarea, preserve character limit logic if exists, handle error states same as Input
- [ ] T081 [US5] Replace Select implementation in `src/components/Select.tsx`: import shadcn Select components (Select, SelectTrigger, SelectValue, SelectContent, SelectItem), preserve options mapping logic, handle value/onChange for controlled selects
- [ ] T082 [US5] Test form components in isolation: create Storybook stories for Input (text, email, password, error state), Label, Textarea (with character count), Select (with multiple options)
- [ ] T083 [US5] Update forms with React Hook Form: find forms using register() syntax, update to use shadcn Form components with FormField/FormControl/FormMessage pattern from `<Form {...form}>`
- [ ] T084 [US5] Update auth forms (signin, signup, forgot password): verify email validation works, verify password requirements work, verify error messages display with text-destructive, verify form submission handlers preserved
- [ ] T085 [US5] Update quote request forms: verify all required fields validated, verify async submission works with loading states, verify success/error notifications still work
- [ ] T086 [US5] Update profile edit forms: verify field updates persist, verify conditional fields work (show/hide based on selections), verify file upload inputs work if present
- [ ] T087 [US5] Validate form accessibility: run axe-core on form Storybook stories, ensure all inputs have associated labels, ensure error messages are announced to screen readers, verify keyboard navigation works (Tab order correct)
- [ ] T088 [US5] Run form integration tests manually: test signup flow end-to-end, test quote request submission, test profile updates, verify no regressions
- [ ] T089 [US5] Update migration status for forms: mark Input, Label, Textarea, Select as completed with detailed logicPreservationChecklist (validation, error handling, state management all verified)
- [ ] T089a [US5] **CRITICAL VERIFICATION**: Search all form files for hardcoded classes (border-gray-300, bg-white, text-gray-600). Result MUST be ZERO. ALL forms MUST use shadcn components with semantic tokens only. NO mixing old Input classes with new shadcn Input.

**Checkpoint**: US5 complete - all forms use shadcn components, validation logic preserved, accessibility verified, integration tests passed, ZERO old classes

---

## Phase 9: User Story 6 - Migrate Card/Container Components to shadcn/ui (Priority: P6)

**Goal**: Replace custom cards with shadcn Card, maintain content rendering and conditional logic

**Independent Test**: All cards use shadcn Card with semantic structure, maintain data mapping and dynamic content

- [ ] T090 [US6] Audit existing card components: identify all card-like wrappers in codebase (components with border, shadow, padding), document content structure patterns, identify conditional rendering (show/hide sections)
- [ ] T091 [US6] Create backups of card components: backup any custom Card/Container components with timestamps
- [ ] T092 [US6] Replace card implementations with shadcn Card: import Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter from @/components/ui/card, restructure content to use semantic components
- [ ] T093 [US6] Update dashboard cards: migrate stat cards (solar savings, quote count), migrate chart cards (usage graphs), preserve data fetching logic, preserve loading skeletons
- [ ] T094 [US6] Update listing cards: migrate installer cards (grid view), migrate quote cards (list view), preserve click handlers for navigation, preserve conditional actions (edit/delete buttons)
- [ ] T095 [US6] Update profile cards: migrate user info card, migrate solar system card, preserve edit buttons, preserve conditional sections (show only if data exists)
- [ ] T096 [US6] Standardize card spacing and shadows: remove hardcoded padding classes, rely on shadcn Card defaults (p-6 in CardContent), verify shadow-sm applied consistently
- [ ] T097 [US6] Update card hover states: add hover:shadow-lg to clickable cards, ensure transition-shadow duration-200 for smooth animation
- [ ] T098 [US6] Test card responsiveness: verify cards stack correctly on mobile (single column), verify cards use grid on desktop (2-3 columns), verify content doesn't overflow
- [ ] T099 [US6] Create card Storybook stories in `stories/card-variants.stories.tsx`: showcase stat card, showcase clickable card with hover, showcase card with footer actions, showcase loading skeleton card
- [ ] T100 [US6] Update migration status for cards: mark all card components as completed in migration-status.json
- [ ] T100a [US6] **CRITICAL VERIFICATION**: Search all card files for hardcoded padding (p-4, p-6, py-8), hardcoded shadows (shadow-md, shadow-xl), hardcoded borders (border-gray-200). Result MUST be ZERO. ALL cards MUST use shadcn Card with semantic structure only.

**Checkpoint**: US6 complete - all cards use shadcn Card, content structure semantic, responsive behavior verified, ZERO old classes

---

## Phase 10: User Story 7 - Migrate Modal/Dialog Components to shadcn/ui (Priority: P7)

**Goal**: Replace custom modals with shadcn Dialog, ensure consistent backdrop and animations

**Independent Test**: All modals use shadcn Dialog with consistent dark backdrop (80% black + 8px blur), proper z-index, smooth animations, focus trap

- [ ] T101 [US7] Audit existing modal components: identify all modal/dialog implementations, document backdrop styles (opacity, blur), document close handlers (X button, ESC key, backdrop click), document form submission logic
- [ ] T102 [US7] Create backups of modal components: backup all custom Modal/Dialog components with timestamps
- [ ] T103 [US7] Replace modal implementations with shadcn Dialog: import Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose from @/components/ui/dialog, restructure content to use semantic components
- [ ] T104 [US7] Migrate confirmation modals: migrate delete confirmations (are you sure?), migrate discard changes dialogs, preserve cancel/confirm button handlers
- [ ] T105 [US7] Migrate form modals: migrate add installer modal (admin), migrate edit quote modal, preserve form submission logic inside DialogContent, preserve validation and error states
- [ ] T106 [US7] Migrate info modals: migrate welcome modal (first-time user), migrate feature announcement modals, preserve dismiss handlers and local storage logic (don't show again)
- [ ] T107 [US7] Verify backdrop consistency: ensure all DialogOverlay use bg-black/80 backdrop-blur-sm, verify z-index hierarchy (Dialog 50 > Sidebar 40 > Header 30)
- [ ] T108 [US7] Verify animations: ensure fade-in on open (data-state="open" triggers transition), ensure fade-out on close, verify 200ms duration, test on slow CPU (should still be smooth)
- [ ] T109 [US7] Verify focus management: test Tab key cycles through dialog elements only (focus trap), test ESC key closes dialog, test backdrop click closes dialog (unless set to persistent), test Return key submits forms inside dialog
- [ ] T110 [US7] Test modal accessibility: run axe-core on modal Storybook stories, ensure dialog has accessible name (DialogTitle), ensure close button has aria-label, verify screen reader announces modal open/close
- [ ] T111 [US7] Test modal stacking: open modal from within modal if needed, verify z-index correct for nested modals, verify backdrop overlays correctly
- [ ] T112 [US7] Update migration status for modals: mark all dialog/modal components as completed in migration-status.json with detailed testing notes
- [ ] T112a [US7] **CRITICAL VERIFICATION**: Search all modal files for hardcoded backdrop classes (bg-black/70, backdrop-blur-md), hardcoded z-index values (z-40, z-50). Result MUST be ZERO. ALL modals MUST use shadcn Dialog with consistent backdrop (bg-black/80 backdrop-blur-sm) from DialogOverlay.

**Checkpoint**: US7 complete - all modals use shadcn Dialog, consistent styling, animations smooth, accessibility verified, focus management working, ZERO old classes

---

## Phase 11: User Story 8 - Standardize Typography Hierarchy (Priority: P8)

**Goal**: Migrate all text to use semantic typography tokens, remove raw Tailwind font classes

**Independent Test**: 100% of headings use typography tokens, 100% of body text uses tokens, zero raw text-X/font-X classes, colors use CSS variables

- [ ] T113 [US8] Create typography audit section: scan codebase for text-X classes (text-xs through text-9xl), scan for font-X classes (font-thin through font-black), scan for leading-X classes (leading-none through leading-loose), scan for dark:text-X classes
- [ ] T114 [US8] Document typography token mapping in `specs/005-comprehensive-css-class/contracts/typography-mapping.md`: map text-4xl → text-heading-1 (h1), map text-3xl → text-heading-2 (h2), map text-2xl → text-heading-3 (h3), map text-xl → text-heading-4 (h4), map text-base → text-body, map text-sm → text-body-small, map text-xs → text-caption
- [ ] T115 [US8] Create typography migration script enhancement in `scripts/migrate-typography.ts`: scan file for text-X classes, suggest semantic token replacement, preserve responsive variants (sm: md: lg:), apply replacements with --auto-fix flag
- [ ] T116 [US8] Migrate page headings (h1): find all `<h1>` elements, replace text-4xl with text-heading-1, remove inline font-bold (included in token), remove dark:text-white, add text-foreground if needed
- [ ] T117 [US8] Migrate section headings (h2): find all `<h2>` elements, replace text-3xl with text-heading-2, ensure semantic HTML matches visual hierarchy
- [ ] T118 [US8] Migrate subsection headings (h3, h4): find all `<h3>` and `<h4>` elements, replace with text-heading-3 and text-heading-4, remove inline font-semibold
- [ ] T119 [US8] Migrate body text (p, div, span): find all paragraph and div text, replace text-base with text-body, replace text-sm with text-body-small, ensure line-height classes removed (included in tokens)
- [ ] T120 [US8] Migrate caption/metadata text: find small text and labels, replace text-xs with text-caption, ensure text-muted-foreground applied for secondary information
- [ ] T121 [US8] Migrate label text: find all `<label>` elements, replace text-sm with text-label, ensure font-medium removed (included in token)
- [ ] T122 [US8] Migrate button text: verify shadcn Button already uses correct typography (font-medium text-sm), ensure custom button wrappers don't override
- [ ] T123 [US8] Migrate code/monospace text: find `<code>` elements, apply font-mono text-body-small, ensure syntax highlighting styles preserved if present
- [ ] T124 [US8] Remove manual responsive font sizing: find patterns like `text-2xl sm:text-3xl lg:text-4xl`, replace with single token `text-heading-1` (responsive scaling built-in via clamp)
- [ ] T125 [US8] Verify semantic HTML matches visual hierarchy: audit headings to ensure h1 is largest, h2 next, etc., flag any mismatches (e.g. h1 with text-sm), fix by using correct HTML tag or correct token
- [ ] T126 [US8] Update dark mode text colors: replace all dark:text-white with text-foreground, replace dark:text-slate-300 with text-foreground, replace dark:text-slate-500 with text-muted-foreground
- [ ] T127 [US8] Test typography in Storybook: create typography showcase story with all tokens, verify responsive scaling works (test mobile, tablet, desktop viewports), verify dark theme colors correct
- [ ] T128 [US8] Validate typography token coverage: run audit script to verify zero raw Tailwind font classes remain, verify zero dark:text-X classes on typography, verify all headings use semantic tokens
- [ ] T129 [US8] Update migration status for typography: mark typography migration as completed in migration-status.json with validation notes
- [ ] T129a [US8] **CRITICAL VERIFICATION**: Run validation script to ensure ZERO raw Tailwind font classes (text-xs, text-sm, text-xl, text-2xl, text-4xl), ZERO inline font-weight (font-bold, font-semibold on headings), ZERO dark:text-X classes. ALL text MUST use semantic tokens (text-heading-1/2/3/4, text-body, text-caption) with text-foreground/text-muted-foreground.

**Checkpoint**: US8 complete - all text uses semantic tokens, responsive scaling works, dark theme colors consistent, ZERO raw font utilities

---

## Phase 12: User Story 9 - Standardize Animations & Transitions (Priority: P9)

**Goal**: Replace custom animations with shadcn built-in and standardize durations, remove transition-all

**Independent Test**: All interactive elements use shadcn animations or tokens, zero transition-all, consistent durations, 60fps performance

- [ ] T130 [US9] Create animation audit section: scan codebase for transition-all usage, scan for custom animation classes (@keyframes), scan for inconsistent durations (200ms vs 300ms vs 500ms)
- [ ] T131 [US9] Document animation token mapping in `specs/005-comprehensive-css-class/contracts/animation-tokens.md`: define duration-fast (150ms), duration-normal (200ms), duration-slow (300ms), define transition types (transition-colors, transition-shadow, transition-transform, transition-opacity)
- [ ] T132 [US9] Remove transition-all usage: find all instances with `grep -r "transition-all" src/`, replace with specific transition (transition-colors for hover states, transition-shadow for elevation changes), document reason for each replacement
- [ ] T133 [US9] Standardize button animations: verify shadcn Button uses transition-colors duration-200 (built-in), test hover state smoothness (should be 60fps)
- [ ] T134 [US9] Standardize card animations: add transition-shadow duration-200 to clickable cards, verify hover:shadow-lg animates smoothly
- [ ] T135 [US9] Verify modal/dialog animations: ensure shadcn Dialog fade-in/out uses 200ms (data-state="open" triggers), test animation on slow CPU, verify no jank
- [ ] T136 [US9] Verify accordion animations: if accordions exist, ensure shadcn Accordion slide-down uses built-in animation (data-state="open"), test expand/collapse smoothness
- [ ] T137 [US9] Standardize loading spinner: ensure all spinners use lucide-react Loader2 with animate-spin (optimized transform), verify 60fps on all devices
- [ ] T138 [US9] Add prefers-reduced-motion support: verify shadcn components respect prefers-reduced-motion media query (disable animations for users who request it)
- [ ] T139 [US9] Test animation performance: use Chrome DevTools Performance tab, record interaction (button hover, modal open), verify no layout thrashing, verify 60fps maintained
- [ ] T140 [US9] Update migration status for animations: mark animation standardization as completed in migration-status.json

**Checkpoint**: US9 complete - animations standardized, transition-all removed, 60fps performance verified, prefers-reduced-motion supported

---

## Phase 13: User Story 10 - Create Migration Tracking System (Priority: P10)

**Goal**: Track migration progress and generate reports showing completion status

**Independent Test**: Dashboard/report shows X% completed, Y hardcoded classes remaining, Z files pending, pre-commit hook prevents violations

**NOTE**: Tracking scripts already created in Phase 2 (T019). These tasks finalize the tracking system:

- [ ] T141 [US10] Enhance progress report script in `scripts/track-progress.ts`: add completion percentage by priority (P0-P10), add velocity calculation (components per week), add estimated completion date based on current velocity
- [ ] T142 [US10] Generate initial migration progress report: `npx tsx scripts/track-progress.ts > specs/005-comprehensive-css-class/progress-report.md`, verify statistics accurate (components completed, pending, exception)
- [ ] T143 [US10] Create migration dashboard component (optional): if want visual dashboard, create `src/components/MigrationDashboard.tsx` that reads migration-status.json and displays progress bars, charts, component list with status badges
- [ ] T144 [US10] Setup GitHub Actions workflow for validation in `.github/workflows/css-audit.yml`: run validate-classnames.ts on every PR, fail CI if violations found, post results as PR comment
- [ ] T145 [US10] Test pre-commit hook: make intentional violation (add bg-teal-600 to file), attempt git commit, verify hook blocks commit with helpful error message, fix violation, verify commit succeeds
- [ ] T146 [US10] Document tracking workflow in `specs/005-comprehensive-css-class/quickstart.md`: explain how to mark component completed, how to generate progress report, how to approve exceptions
- [ ] T147 [US10] Generate final migration report: run track-progress.ts one last time, verify 100% completion if all user stories done, document any remaining exceptions, celebrate completion 🎉

**Checkpoint**: US10 complete - tracking system operational, progress visible, CI/CD blocks violations, migration quality maintained

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T148 [P] Update main README.md with migration summary: add "CSS Class Standardization" section explaining shadcn/ui usage, link to quickstart.md for developers
- [ ] T149 [P] Create migration retrospective document in `specs/005-comprehensive-css-class/RETROSPECTIVE.md`: document what went well, what was challenging, lessons learned, recommendations for future migrations
- [ ] T150 [P] Update Constitution Section VI with lessons learned: if migration revealed gaps in styling guidelines, submit PR to update constitution with new rules
- [ ] T151 Update `.github/copilot-instructions.md`: ensure shadcn/ui components documented, ensure typography tokens documented, ensure all future development follows standards
- [ ] T152 Run final validation: execute validate-classnames.ts on entire codebase, verify zero violations, generate clean report for documentation
- [ ] T153 Run final visual regression: execute Chromatic one last time, approve all changes, create final baseline for future development
- [ ] T154 Run final accessibility audit: execute Lighthouse on key pages, verify all scores ≥90, run axe-core, verify zero violations
- [ ] T155 Performance validation: measure bundle size before/after migration, verify increase <5%, measure Lighthouse performance score, verify ≥90
- [ ] T156 Generate comprehensive feature completion report in `specs/005-comprehensive-css-class/COMPLETION-REPORT.md`: document all user stories completed, document statistics (components migrated, classes standardized), document test results (visual regression, accessibility, performance)
- [ ] T157 Archive migration artifacts: move audit-report.md, progress-report.md, logic-audit/ to archive/ subdirectory, keep for historical reference
- [ ] T158 Run quickstart.md validation: have new developer follow quickstart.md to migrate a new component, verify documentation accurate, verify <2 hour completion time
- [ ] T159 Schedule knowledge transfer session: present migration workflow to team, demonstrate Storybook usage, explain pre-commit hooks, answer questions

**Checkpoint**: Feature 005 complete - all user stories delivered, tracking operational, documentation comprehensive, team trained

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 0 (Phase 3)**: Depends on Setup and Foundational - Foundation for all component migrations
- **User Stories 1-10 (Phases 4-13)**: All depend on US0 completion
  - US1 (Audit Report): Can start after US0 - No dependencies on other stories
  - US2 (Naming Convention): Can start after US0 - No dependencies on other stories
  - US3 (Button Migration): Can start after US0 - Recommended after US1+US2 for guidance
  - US4 (Icon Migration): Can start after US0 - Independent, but easier after US3 (button icons)
  - US5 (Form Migration): Can start after US0 - Independent, but easier after US3 (form buttons)
  - US6 (Card Migration): Can start after US0 - Independent
  - US7 (Modal Migration): Can start after US0 - Independent, but easier after US5 (modals often contain forms)
  - US8 (Typography): Can start after US0 - Independent, but easier after US3-US7 (fewer files to update)
  - US9 (Animations): Can start after US0 - Independent, but easier after US3-US7 (components already use shadcn animations)
  - US10 (Tracking): Can start after US0 - Runs parallel to all migrations (tracks progress)
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### User Story Dependencies Graph

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) - BLOCKS EVERYTHING
    ↓
US0 (Phase 3) - FOUNDATION
    ↓
    ├→ US1 (Audit) ────────────┐
    ├→ US2 (Convention) ───────┤
    ├→ US3 (Button) ───────────┤
    ├→ US4 (Icon) ─────────────┤
    ├→ US5 (Form) ─────────────┤  ← All can run in parallel after US0
    ├→ US6 (Card) ─────────────┤
    ├→ US7 (Modal) ────────────┤
    ├→ US8 (Typography) ───────┤
    ├→ US9 (Animations) ───────┤
    └→ US10 (Tracking) ────────┘
             ↓
    Polish (Phase 14)
```

### Recommended Sequence (if working solo)

1. Phase 1: Setup
2. Phase 2: Foundational ← CRITICAL BLOCKER
3. Phase 3: US0 (Foundation)
4. Phase 4: US1 (Audit) - Understand current state
5. Phase 5: US2 (Convention) - Define standards
6. Phase 6: US3 (Button) - Most visible, good starting point
7. Phase 7: US4 (Icon) - Quick win after buttons
8. Phase 8: US5 (Form) - Higher complexity, critical functionality
9. Phase 9: US6 (Card) - Medium complexity
10. Phase 10: US7 (Modal) - Higher complexity
11. Phase 11: US8 (Typography) - Apply across all migrated components
12. Phase 12: US9 (Animations) - Polish pass
13. Phase 13: US10 (Tracking) - Runs throughout, finalize at end
14. Phase 14: Polish

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002 (lucide-react), T003 (shadcn components), T008 (backup dir), T009 (Storybook), T010 (Chromatic) can all run in parallel

**Within Foundational (Phase 2)**:
- T011 (CSS audit), T012 (logic audit), T017 (migration script), T018 (validation script), T019 (progress script), T020 (pre-commit), T021 (ESLint), T022 (naming JSON), T023 (exception JSON) can run in parallel after T015-T016 (migration status setup)

**Within US0 (Phase 3)**:
- T025 (Input story), T026 (Card story), T027 (Dialog story) can run in parallel after T024 (Button story)

**Across User Stories**:
- If team has multiple developers, after US0 completes, assign:
  - Developer A: US1 + US2 (documentation) → US8 (typography)
  - Developer B: US3 (button) → US4 (icon) → US9 (animations)
  - Developer C: US5 (form) → US7 (modal)
  - Developer D: US6 (card) → US10 (tracking)

---

## Parallel Example: Foundational Phase

```bash
# After T015-T016 (migration status setup), launch in parallel:

# Terminal 1:
npx tsx scripts/audit-css-classes.ts > specs/005-comprehensive-css-class/audit-report.md

# Terminal 2:
npx tsx scripts/audit-component-logic.ts src/components/Button.tsx

# Terminal 3:
# Implement migration script (scripts/migrate-component.ts)

# Terminal 4:
# Implement validation script (scripts/validate-classnames.ts)

# Terminal 5:
# Setup pre-commit hook (.husky/pre-commit)
```

---

## Implementation Strategy

### MVP First (User Story 0 + 1 Only)

1. Complete Phase 1: Setup (shadcn/ui installed, Storybook ready)
2. Complete Phase 2: Foundational (audit scripts, migration tools ready)
3. Complete Phase 3: US0 (shadcn components in Storybook, logic audited)
4. Complete Phase 4: US1 (audit report generated, current state documented)
5. **STOP and VALIDATE**: Review audit report, understand current state
6. Deploy/demo if ready (foundation solid, can show Storybook)

### Incremental Delivery

1. Complete Setup + Foundational + US0 → Foundation ready
2. Add US1 (Audit) → Document current state → Share with team
3. Add US2 (Convention) → Standards defined → Review with design team
4. Add US3 (Button) → Most visible component migrated → Deploy to staging, gather feedback
5. Add US4 (Icon) → Icons consistent → Deploy to staging
6. Add US5 (Form) → Critical functionality migrated → Deploy to staging, extensive testing
7. Add US6 (Card) → Layout consistency → Deploy to staging
8. Add US7 (Modal) → Complex components done → Deploy to staging
9. Add US8 (Typography) → Typography standardized → Deploy to staging
10. Add US9 (Animations) → Polish complete → Deploy to staging
11. Add US10 (Tracking) → Quality maintained → Deploy to production 🚀

Each deployment adds value, can be independently tested, doesn't break previous work.

### Parallel Team Strategy

With 4 developers (after Foundational phase completes):

**Week 1**: Foundation (all developers)
- Complete Phase 1 (Setup) together
- Complete Phase 2 (Foundational) together
- Complete Phase 3 (US0) together

**Week 2-6**: Parallel development
- **Developer A**: US1 (Audit) → US2 (Convention) → US8 (Typography)
- **Developer B**: US3 (Button) → US4 (Icon) → US9 (Animations)
- **Developer C**: US5 (Form) → US7 (Modal)
- **Developer D**: US6 (Card) → US10 (Tracking)

**Week 6**: Integration & Polish (all developers)
- Merge all user stories
- Phase 14 (Polish) together
- Final testing and deployment

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 13 tasks
- **Phase 3 (US0)**: 6 tasks
- **Phase 4 (US1)**: 9 tasks
- **Phase 5 (US2)**: 14 tasks
- **Phase 6 (US3)**: 12 tasks
- **Phase 7 (US4)**: 11 tasks
- **Phase 8 (US5)**: 14 tasks
- **Phase 9 (US6)**: 11 tasks
- **Phase 10 (US7)**: 12 tasks
- **Phase 11 (US8)**: 17 tasks
- **Phase 12 (US9)**: 11 tasks
- **Phase 13 (US10)**: 7 tasks
- **Phase 14 (Polish)**: 12 tasks

**Total**: 159 tasks

**Parallelizable**: 35+ tasks marked with [P]

**Estimated Timeline**:
- Solo developer: 6-8 weeks (following recommended sequence)
- 2 developers: 4-5 weeks (parallel user stories)
- 4 developers: 3-4 weeks (parallel user stories with integration week)

---

## Notes

- [P] tasks = different files/scripts, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group (atomic commits)
- Review audit reports before migration to understand logic preservation needs
- Run visual regression tests after each component category
- Run accessibility tests on high-priority components (forms, modals)
- Celebrate small wins - each user story completion is a milestone 🎉

# Phase 0 Research: Comprehensive CSS Class Audit & Standardization

**Feature**: 005-comprehensive-css-class  
**Date**: 2025-10-30  
**Status**: Complete

---

## Research Task 1: shadcn/ui Installation & Configuration

### Decision
Install shadcn/ui using official CLI with Next.js 14 App Router configuration, integrating with existing Tailwind and design token system.

### Rationale
- **Official CLI** automates setup, reduces configuration errors
- **CSS Variables approach** aligns with Constitution Section VI requirement
- **Incremental installation** allows adding components as needed (not bulk install)
- **TypeScript-first** matches project standards

### Implementation Steps

```bash
# 1. Install shadcn/ui CLI dependencies
npm install -D @shadcn/ui

# 2. Initialize shadcn/ui (creates components.json)
npx shadcn-ui@latest init

# Configuration prompts:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes (CRITICAL - required for theming)
# - TypeScript: Yes
# - Tailwind config: tailwind.config.js
# - Components path: src/components/ui
# - Utils path: src/lib/utils
# - React Server Components: Yes
# - Write configuration: Yes

# 3. Install first component (Button) to test
npx shadcn-ui@latest add button

# 4. Install lucide-react for icons
npm install lucide-react
```

### components.json Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "src/components/ui",
    "utils": "src/lib/utils"
  }
}
```

### CSS Variables Setup (globals.css)

Add to `src/app/globals.css` after existing content:

```css
@layer base {
  :root {
    /* Dark theme variables (Constitution Section VI compliant) */
    --background: 0 0% 0%; /* pure black */
    --foreground: 210 40% 91%; /* light slate text */
    
    --card: 222 47% 11%; /* dark slate cards */
    --card-foreground: 210 40% 91%;
    
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 91%;
    
    --primary: 173 58% 39%; /* teal accent */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 217 33% 17%; /* muted slate */
    --secondary-foreground: 210 40% 91%;
    
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 91%;
    
    --destructive: 0 63% 31%; /* red for errors */
    --destructive-foreground: 210 40% 91%;
    
    --border: 215 28% 17%; /* slate borders */
    --input: 215 28% 17%;
    --ring: 173 58% 39%; /* teal focus rings */
    
    --radius: 0.5rem; /* 8px border radius */
  }
  
  /* Light theme disabled during migration (add later) */
  /* .light { ... } */
}
```

### Tailwind Config Integration

Update `tailwind.config.js` to map CSS variables:

```javascript
// Add to theme.extend
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
},
borderRadius: {
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
},
```

### Alternatives Considered

1. **Bulk install all components** - Rejected: Bloats bundle, installs unused components
2. **Manual component copying** - Rejected: Error-prone, misses updates, no CLI tooling
3. **Radix UI directly** - Rejected: shadcn provides better DX, pre-styled components
4. **Chakra UI / MUI** - Rejected: Heavier bundles, less Tailwind-native, more opinions

### Integration Notes

- **Design Token Compatibility**: shadcn CSS variables coexist with feature 004 TypeScript tokens. Migration path: Gradually replace TypeScript token usage with shadcn variables.
- **Theme Locking**: Update ThemeProvider to force dark mode: `<ThemeProvider defaultTheme="dark" forcedTheme="dark">`
- **Storybook**: Import globals.css in `.storybook/preview.ts` to ensure CSS variables load

---

## Research Task 2: Component Logic Audit Strategy

### Decision
Use **ts-morph** (TypeScript Compiler API wrapper) for AST-based component analysis, extracting props, state, handlers, and effects.

### Rationale
- **AST parsing** is accurate (regex fails on complex patterns)
- **ts-morph** provides high-level API over TypeScript compiler
- **Type information** extracted directly from TypeScript interfaces
- **Preserves comments** for context

### Audit Script Architecture

```typescript
// scripts/audit-component-logic.ts
import { Project, SyntaxKind } from "ts-morph";

interface ComponentLogic {
  name: string;
  filePath: string;
  propsInterface?: string;
  stateVariables: Array<{ name: string; type: string }>;
  eventHandlers: Array<{ name: string; type: string }>;
  effects: Array<{ dependencies: string[]; hasCleanup: boolean }>;
  apiCalls: Array<{ method: string; endpoint: string }>;
  routerUsage: Array<{ method: string; path?: string }>;
  conditionalRendering: Array<{ condition: string; lineNumber: number }>;
  riskLevel: "low" | "medium" | "high";
}

async function auditComponent(filePath: string): Promise<ComponentLogic> {
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const sourceFile = project.addSourceFileAtPath(filePath);
  
  // Extract component name (function/const declaration)
  const componentDeclaration = sourceFile.getFunctions()[0] || 
                                sourceFile.getVariableStatements()[0];
  
  // Extract props interface from parameters
  const propsParam = componentDeclaration.getParameters()[0];
  const propsType = propsParam?.getType().getText();
  
  // Find useState calls
  const stateVariables = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => call.getExpression().getText() === "useState")
    .map(call => ({
      name: call.getParent()?.getChildrenOfKind(SyntaxKind.ArrayBindingPattern)[0]
              ?.getElements()[0]?.getText() || "unknown",
      type: call.getTypeArguments()[0]?.getText() || "any"
    }));
  
  // Find event handlers (onClick, onChange, onSubmit, etc.)
  const eventHandlers = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)
    .filter(attr => attr.getName().startsWith("on"))
    .map(attr => ({
      name: attr.getName(),
      type: attr.getInitializer()?.getText() || "unknown"
    }));
  
  // Find useEffect calls
  const effects = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => call.getExpression().getText() === "useEffect")
    .map(call => ({
      dependencies: call.getArguments()[1]
        ?.getDescendantsOfKind(SyntaxKind.Identifier)
        .map(id => id.getText()) || [],
      hasCleanup: call.getArguments()[0]
        ?.getDescendantsOfKind(SyntaxKind.ReturnStatement).length > 0
    }));
  
  // Find API calls (fetch, axios, etc.)
  const apiCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => ["fetch", "axios.get", "axios.post"].some(api => 
      call.getExpression().getText().includes(api)))
    .map(call => ({
      method: call.getExpression().getText(),
      endpoint: call.getArguments()[0]?.getText() || "unknown"
    }));
  
  // Find router usage (useRouter, usePathname, router.push, etc.)
  const routerUsage = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => call.getExpression().getText().includes("router.push") ||
                    call.getExpression().getText() === "useRouter")
    .map(call => ({
      method: call.getExpression().getText(),
      path: call.getArguments()[0]?.getText()
    }));
  
  // Find conditional rendering (ternary, &&, if statements in JSX)
  const conditionalRendering = sourceFile.getDescendantsOfKind(SyntaxKind.ConditionalExpression)
    .concat(sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression)
      .filter(expr => expr.getOperatorToken().getText() === "&&"))
    .map(expr => ({
      condition: expr.getText().slice(0, 100), // First 100 chars
      lineNumber: expr.getStartLineNumber()
    }));
  
  // Determine risk level
  const riskLevel = 
    apiCalls.length > 0 || effects.some(e => e.hasCleanup) ? "high" :
    stateVariables.length > 3 || eventHandlers.length > 5 ? "medium" :
    "low";
  
  return {
    name: componentDeclaration.getName() || "UnknownComponent",
    filePath,
    propsInterface: propsType,
    stateVariables,
    eventHandlers,
    effects,
    apiCalls,
    routerUsage,
    conditionalRendering,
    riskLevel
  };
}
```

### Output Format (Markdown)

```markdown
# Component Logic Audit: Button

**File**: `src/components/Button.tsx`  
**Risk Level**: 🟢 Low  
**Audit Date**: 2025-10-30

## Props Interface
\`\`\`typescript
{ onClick?: () => void; disabled?: boolean; loading?: boolean; variant?: string }
\`\`\`

## State Variables
- `isLoading: boolean` - Loading state for async operations

## Event Handlers
- `onClick` - Button click handler, triggers form submission
- (Pass through from props)

## Effects
None

## API Calls
None

## Router Usage
None

## Conditional Rendering
- Line 15: `{loading && <Spinner />}` - Show spinner when loading
- Line 16: `{!loading && children}` - Show button text when not loading

## Logic Preservation Checklist
- [ ] Preserve onClick handler (pass through to shadcn Button)
- [ ] Preserve disabled prop (pass through to shadcn Button)
- [ ] Preserve loading state logic (isLoading && <Spinner />)
- [ ] Test click functionality after migration
- [ ] Verify disabled state works
- [ ] Verify loading state shows spinner
```

### Alternatives Considered

1. **Regex parsing** - Rejected: Fails on complex nested code, misses TypeScript types
2. **Manual audit** - Rejected: Error-prone, time-consuming for 33+ components
3. **@typescript-eslint/parser** - Rejected: Lower-level API, more boilerplate than ts-morph
4. **babel-parser** - Rejected: Doesn't preserve TypeScript type information

---

## Research Task 3: Migration Script Architecture

### Decision
Build AST-based migration scripts with dry-run mode, backup creation, and rollback capability using ts-morph for transformations.

### Rationale
- **AST transformation** preserves formatting, comments, type information
- **Dry-run mode** allows validation before changes
- **Automatic backups** enable instant rollback
- **Idempotent** - can run multiple times safely

### Migration Script Design

```typescript
// scripts/migrate-component.ts
import { Project, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

interface MigrationOptions {
  component: string; // e.g., "Button"
  targetShadcnComponent: string; // e.g., "Button" (from shadcn)
  dryRun: boolean;
  backup: boolean;
}

async function migrateComponent(options: MigrationOptions) {
  const { component, targetShadcnComponent, dryRun, backup } = options;
  
  // Step 1: Create backup
  if (backup && !dryRun) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `backup/${timestamp}`;
    fs.mkdirSync(backupDir, { recursive: true });
    // Copy component file to backup
    // ... (implementation)
  }
  
  // Step 2: Load component file
  const project = new Project({ tsConfigFilePath: "./tsconfig.json" });
  const filePath = `src/components/${component}.tsx`;
  const sourceFile = project.addSourceFileAtPath(filePath);
  
  // Step 3: Add shadcn import
  sourceFile.addImportDeclaration({
    moduleSpecifier: `@/components/ui/${targetShadcnComponent.toLowerCase()}`,
    namedImports: [targetShadcnComponent]
  });
  
  // Step 4: Find component JSX return statement
  const componentFunc = sourceFile.getFunctions()[0] || 
                        sourceFile.getVariableStatements()[0];
  const returnStatement = componentFunc.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
  
  // Step 5: Replace custom component with shadcn component
  // (This is simplified - actual implementation needs to:
  //  - Preserve all props (spread operator)
  //  - Map variant props to shadcn variants
  //  - Preserve className merging with cn()
  //  - Preserve children
  //  - Add inline comment documenting what was preserved)
  
  // Step 6: Add preservation comment
  const preservedLogic = [
    "onClick handler",
    "loading state",
    "disabled condition"
  ];
  componentFunc.insertStatements(0, 
    `/* Preserved: ${preservedLogic.join(", ")} - migrated to shadcn ${targetShadcnComponent} */`
  );
  
  // Step 7: Save or print
  if (dryRun) {
    console.log("=== DRY RUN - Changes Preview ===");
    console.log(sourceFile.getFullText());
  } else {
    await sourceFile.save();
    console.log(`✅ Migrated ${component} to shadcn ${targetShadcnComponent}`);
  }
}
```

### Backup Strategy

```typescript
interface BackupManifest {
  timestamp: string;
  components: Array<{
    name: string;
    originalPath: string;
    backupPath: string;
    sha256: string; // File hash for integrity
  }>;
}

function createBackup(filePath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join("backup", timestamp);
  fs.mkdirSync(backupDir, { recursive: true });
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, fileName);
  fs.copyFileSync(filePath, backupPath);
  
  // Update manifest
  const manifestPath = path.join(backupDir, "manifest.json");
  // ... (implementation)
  
  return backupPath;
}

function rollback(backupTimestamp: string) {
  const backupDir = path.join("backup", backupTimestamp);
  const manifest: BackupManifest = JSON.parse(
    fs.readFileSync(path.join(backupDir, "manifest.json"), "utf-8")
  );
  
  for (const component of manifest.components) {
    fs.copyFileSync(component.backupPath, component.originalPath);
    console.log(`✅ Rolled back ${component.name}`);
  }
}
```

### Error Handling

```typescript
try {
  await migrateComponent(options);
} catch (error) {
  console.error(`❌ Migration failed: ${error.message}`);
  
  if (!options.dryRun && options.backup) {
    console.log("🔄 Rolling back changes...");
    rollback(currentBackupTimestamp);
  }
  
  process.exit(1);
}
```

### Alternatives Considered

1. **Find-and-replace scripts** - Rejected: Too brittle, breaks on edge cases
2. **Codemod (jscodeshift)** - Rejected: React-focused, less TypeScript support than ts-morph
3. **Manual migration** - Rejected: Error-prone, inconsistent results across team
4. **AI-powered migration** - Rejected: Non-deterministic, requires validation anyway

---

## Research Task 4: Visual Regression Testing Setup

### Decision
Use Chromatic with Storybook for visual regression testing, configured for dark theme only during migration.

### Rationale
- **Chromatic** integrates seamlessly with Storybook
- **Pixel-perfect comparison** catches unintended visual changes
- **CI/CD integration** blocks PRs with visual regressions
- **Baseline management** handles approved changes

### Chromatic Setup

```bash
# 1. Install Chromatic
npm install --save-dev chromatic

# 2. Build Storybook
npm run build-storybook

# 3. Run Chromatic (first time - creates baseline)
npx chromatic --project-token=<CHROMATIC_PROJECT_TOKEN>

# 4. Subsequent runs (compares against baseline)
npx chromatic --project-token=<CHROMATIC_PROJECT_TOKEN>
```

### Storybook Dark Theme Configuration

Update `.storybook/preview.ts`:

```typescript
import "../src/app/globals.css";
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    // Force dark theme for all stories
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#000000",
        },
      ],
    },
    // Disable other themes during migration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" data-theme="dark">
        <div className="bg-background text-foreground p-4">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default preview;
```

### CI/CD Integration (GitHub Actions)

```.github/workflows/chromatic.yml
name: Visual Regression Tests

on:
  push:
    branches: [005-comprehensive-css-class]
  pull_request:
    branches: [main, develop]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Required for Chromatic
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: false # Fail build if visual changes detected
          exitOnceUploaded: true
```

### Alternatives Considered

1. **Percy** - Rejected: More expensive, less Storybook integration
2. **Loki** - Rejected: Requires Docker, slower, less CI/CD support
3. **Playwright visual comparison** - Rejected: Requires full E2E setup, overkill for component testing
4. **Manual screenshot comparison** - Rejected: Time-consuming, human error, no automation

---

## Research Task 5: Accessibility Testing Tools

### Decision
Multi-layer accessibility testing: axe-core (Storybook addon), Lighthouse CI (automated), manual screen reader testing (NVDA/VoiceOver).

### Rationale
- **axe-core** catches 57% of WCAG issues automatically
- **Lighthouse** provides overall accessibility score (target: 100)
- **Screen readers** catch issues automation misses (focus order, announcements)
- **Keyboard testing** ensures navigation works without mouse

### axe-core Integration (Storybook)

```bash
# Install Storybook accessibility addon
npm install --save-dev @storybook/addon-a11y
```

Update `.storybook/main.ts`:

```typescript
const config = {
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y", // Add this
  ],
};
```

### Lighthouse CI Configuration

```bash
# Install Lighthouse CI
npm install --save-dev @lhci/cli

# Create lighthouserc.js
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:accessibility": ["error", { minScore: 1 }], // 100% required
        "categories:performance": ["warn", { minScore: 0.9 }], // 90% required
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

### Screen Reader Testing Checklist

**NVDA (Windows)**:
- [ ] Install NVDA (free, open-source)
- [ ] Test critical flows: Login, quote request, dashboard navigation
- [ ] Verify button announcements include role + label
- [ ] Verify form inputs announce label + error state
- [ ] Verify modal focus trapping works
- [ ] Verify keyboard shortcuts (Tab, Enter, Space, Esc)

**VoiceOver (Mac)**:
- [ ] Enable VoiceOver (Cmd+F5)
- [ ] Test same critical flows as NVDA
- [ ] Verify rotor navigation (headings, links, form controls)
- [ ] Verify announcements match NVDA (consistency check)

### Keyboard Navigation Testing

```typescript
// Keyboard testing checklist per component
const keyboardTests = {
  Button: [
    "Tab to button (focus visible)",
    "Enter activates button",
    "Space activates button",
    "Shift+Tab moves focus backward",
  ],
  Input: [
    "Tab to input (focus visible)",
    "Type text (value updates)",
    "Tab to next field",
    "Shift+Tab to previous field",
  ],
  Dialog: [
    "Open dialog (focus moves to dialog)",
    "Tab cycles through dialog elements only (focus trapped)",
    "Escape closes dialog (focus returns to trigger)",
    "Click outside closes dialog (optional)",
  ],
};
```

### Alternatives Considered

1. **WAVE browser extension** - Rejected: Manual, not CI/CD compatible
2. **pa11y** - Rejected: Similar to axe-core, less ecosystem support
3. **Tenon.io** - Rejected: Paid service, axe-core sufficient
4. **Manual WCAG checklist only** - Rejected: Time-consuming, misses edge cases

---

## Research Task 6: Pre-commit Hook Configuration

### Decision
Use Husky for git hooks with ESLint rules for className patterns, optimized for <3 second execution.

### Rationale
- **Husky** is standard for Next.js projects
- **ESLint** can enforce className patterns via plugins
- **Performance** optimized by only linting staged files (lint-staged)
- **Bypass mechanism** via --no-verify for emergencies (with documentation)

### Husky Setup

```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### lint-staged Configuration

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ]
  }
}
```

### ESLint Rules for className Patterns

Create custom ESLint rule or use eslint-plugin-tailwindcss:

```bash
npm install --save-dev eslint-plugin-tailwindcss
```

Update `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended"
  ],
  "plugins": ["tailwindcss"],
  "rules": {
    // Warn on hardcoded color classes
    "tailwindcss/no-custom-classname": "warn",
    
    // Custom rule: Block raw Tailwind font size classes
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='className'] Literal[value=/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/]",
        "message": "Use typography tokens (text-heading-1, text-body) instead of raw Tailwind font classes"
      },
      {
        "selector": "JSXAttribute[name.name='className'] Literal[value=/bg-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-(\\d{3})/]",
        "message": "Use semantic color tokens (bg-primary, bg-destructive) instead of hardcoded colors"
      }
    ]
  }
}
```

### Bypass Mechanism

Developers can bypass pre-commit hooks in emergencies:

```bash
# Emergency commit (MUST document reason in commit message)
git commit --no-verify -m "EMERGENCY FIX: Production down - CSS violation fix tracked in TECH-DEBT-123"
```

Documentation: Require that --no-verify commits:
1. Include "EMERGENCY" or "HOTFIX" in commit message
2. Reference tracking ticket (TECH-DEBT-XXX)
3. Must be fixed in follow-up PR within 48 hours

### Performance Optimization

```bash
# Only lint staged files (not entire codebase)
# lint-staged handles this automatically

# Parallel ESLint execution
# Add to .eslintrc.json:
{
  "cache": true, // Cache results for faster subsequent runs
  "cacheLocation": ".eslintcache"
}
```

Target: <3 second execution for typical commit (5-10 files)

### Alternatives Considered

1. **Pre-push hooks** - Rejected: Slower feedback loop, devs commit violations
2. **CI-only checks** - Rejected: Too late, wastes PR review time
3. **Editor integration only** - Rejected: Not enforced, depends on dev setup
4. **Git server-side hooks** - Rejected: Harder to bypass for emergencies

---

## Consolidation Summary

### Key Decisions

| Area | Decision | Tool/Approach |
|------|----------|---------------|
| **shadcn/ui Setup** | Official CLI with CSS variables | `npx shadcn-ui@latest init` |
| **Component Audit** | AST parsing for logic extraction | ts-morph |
| **Migration** | AST transformation with backups | ts-morph + backup manifest |
| **Visual Regression** | Chromatic with Storybook | @chromatic/storybook |
| **Accessibility** | Multi-layer (axe + Lighthouse + manual) | @storybook/addon-a11y, @lhci/cli, NVDA/VoiceOver |
| **Pre-commit Hooks** | Husky + lint-staged + ESLint rules | husky, lint-staged, eslint-plugin-tailwindcss |

### Dependencies to Install

```bash
# shadcn/ui & icons
npm install lucide-react
npm install -D @shadcn/ui

# Component audit & migration
npm install -D ts-morph

# Visual regression
npm install -D chromatic

# Accessibility
npm install -D @storybook/addon-a11y @lhci/cli

# Pre-commit hooks
npm install -D husky lint-staged eslint-plugin-tailwindcss
```

### Configuration Files to Create/Update

- ✅ `components.json` - shadcn/ui configuration
- ✅ `src/app/globals.css` - CSS variables for dark theme
- ✅ `tailwind.config.js` - Map CSS variables to utilities
- ✅ `.storybook/preview.ts` - Dark theme configuration
- ✅ `.storybook/main.ts` - Add a11y addon
- ✅ `lighthouserc.js` - Lighthouse CI configuration
- ✅ `.husky/pre-commit` - Pre-commit hook
- ✅ `package.json` - lint-staged configuration
- ✅ `.eslintrc.json` - Custom className rules

### Next Phase

With research complete, proceed to **Phase 1: Design & Contracts** to generate:
- `data-model.md` - Migration status tracking, audit report structures
- `contracts/` - CLI contracts, shadcn component APIs, design token mappings
- `quickstart.md` - Developer onboarding guide

---

**Research Status**: ✅ Complete  
**All unknowns resolved**: Yes  
**Ready for Phase 1**: Yes

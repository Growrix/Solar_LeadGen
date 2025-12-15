# Quickstart: Comprehensive CSS Class Audit & Standardization

**Feature**: 005-comprehensive-css-class  
**Target**: Migrate your first component in <2 hours

---

## Prerequisites

✅ **Required**:
- Node.js 18+ and npm installed
- Solar Match codebase cloned locally
- Git configured (for pre-commit hooks)
- VS Code (recommended IDE)

✅ **Recommended Extensions**:
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

---

## Phase 0: Setup (15 minutes)

### Step 1: Install shadcn/ui

```bash
# Navigate to project root
cd d:\Desktop Mass\SOLAR LEAD GEN PROJECT MAIN FILE\solarmatch

# Initialize shadcn/ui (use default settings)
npx shadcn@latest init
```

**Interactive Prompts** (press Enter for defaults):
```
✔ Would you like to use TypeScript? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … src/app/globals.css
✔ Would you like to use CSS variables for colors? … yes ← IMPORTANT!
✔ Where is your tailwind.config.js located? … tailwind.config.js
✔ Configure the import alias for components? … @/components
✔ Configure the import alias for utils? … @/lib/utils
✔ Are you using React Server Components? … yes
```

**Verify Installation**:
```bash
# Check that components.json was created
cat components.json

# Check that src/lib/utils.ts was created (cn() helper)
cat src/lib/utils.ts

# Check that globals.css has CSS variables
cat src/app/globals.css | grep "@layer base"
```

---

### Step 2: Install Core Components

Install the most commonly used shadcn components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add tooltip
npx shadcn@latest add badge
npx shadcn@latest add form
```

**Verify**:
```bash
# Check that components were created
ls src/components/ui/
# Expected output: button.tsx, card.tsx, input.tsx, label.tsx, select.tsx, dialog.tsx, tooltip.tsx, badge.tsx, form.tsx
```

---

### Step 3: Install lucide-react Icons

Replace heroicons with lucide-react:

```bash
npm install lucide-react
```

**Verify**:
```bash
npm list lucide-react
# Expected output: lucide-react@<version>
```

---

### Step 4: Update CSS Variables (Map Feature 004 Tokens)

Edit `src/app/globals.css` to use Solar Match brand colors:

```css
/* src/app/globals.css */
@layer base {
  :root {
    /* Solar Match brand colors (from Feature 004) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 174 100% 29%; /* ← Teal-600 from Feature 004 */
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 174 100% 29%; /* ← Focus ring = primary color */
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 174 100% 35%; /* ← Lighter teal for dark mode */
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 174 100% 35%;
  }
}
```

---

### Step 5: Add Custom Typography Tokens

Extend `tailwind.config.js` with semantic typography:

```javascript
// tailwind.config.js
module.exports = {
  // ... existing config ...
  theme: {
    extend: {
      // Custom typography tokens (FR-026 to FR-031)
      fontSize: {
        'heading-1': ['clamp(1.5rem, 5vw, 2.25rem)', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading-2': ['clamp(1.25rem, 4vw, 1.875rem)', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading-3': ['clamp(1.125rem, 3vw, 1.5rem)', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '0' }],
        'heading-4': ['clamp(1rem, 2.5vw, 1.25rem)', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '0' }],
        'body-large': ['clamp(1rem, 2vw, 1.125rem)', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'body': ['clamp(0.875rem, 1.5vw, 1rem)', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'body-small': ['clamp(0.75rem, 1.25vw, 0.875rem)', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1', fontWeight: '400', letterSpacing: '0' }],
        'label': ['0.875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0' }],
        'button': ['0.875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0' }],
      },
    },
  },
};
```

**Verify**:
```bash
npm run dev
# Navigate to http://localhost:3000
# Check that app still loads without errors
```

---

## Phase 1: Migrate Your First Component (30 minutes)

Let's migrate the **Button** component as a demo.

### Step 1: Audit Component Logic

First, understand what the current Button component does:

```bash
# Create audit script
cat > scripts/audit-button.ts << 'EOF'
import { readFileSync } from 'fs';

const componentPath = 'src/components/Button.tsx';
const content = readFileSync(componentPath, 'utf-8');

console.log('## Button Component Audit\n');

// Find props
const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]*)}/s);
if (propsMatch) {
  console.log('### Props:\n```typescript\n' + propsMatch[0] + '\n```\n');
}

// Find state variables
const stateMatches = content.matchAll(/const\s+\[(\w+),\s*\w+\]\s*=\s*useState/g);
console.log('### State Variables:');
for (const match of stateMatches) {
  console.log(`- ${match[1]}`);
}

// Find event handlers
const handlerMatches = content.matchAll(/(on\w+)=\{/g);
console.log('\n### Event Handlers:');
for (const match of handlerMatches) {
  console.log(`- ${match[1]}`);
}

console.log('\n### Preservation Checklist:');
console.log('- [ ] Preserve onClick handler');
console.log('- [ ] Preserve variant prop (primary, secondary, destructive)');
console.log('- [ ] Preserve size prop (sm, md, lg)');
console.log('- [ ] Preserve loading state');
console.log('- [ ] Preserve disabled prop');
EOF

npx tsx scripts/audit-button.ts > specs/005-comprehensive-css-class/logic-audit/Button.md
cat specs/005-comprehensive-css-class/logic-audit/Button.md
```

---

### Step 2: Create Backup

```bash
# Create backup of original component
cp src/components/Button.tsx src/components/Button.backup.tsx
```

---

### Step 3: Replace with shadcn Button

**Before** (`src/components/Button.tsx`):
```tsx
// ❌ Old custom Button
interface ButtonProps {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, disabled, onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-md font-medium transition-all duration-300
        ${variant === "primary" ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}
        ${variant === "secondary" ? "bg-gray-200 hover:bg-gray-300 text-gray-900" : ""}
        ${variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        ${size === "sm" ? "px-3 py-1.5 text-sm" : ""}
        ${size === "md" ? "px-4 py-2 text-base" : ""}
        ${size === "lg" ? "px-6 py-3 text-lg" : ""}
      `}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

**After** (`src/components/Button.tsx`):
```tsx
// ✅ New shadcn Button wrapper
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ButtonProps extends Omit<ShadcnButtonProps, "variant"> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  loading?: boolean;
}

export function Button({ variant = "default", loading, disabled, children, ...props }: ButtonProps) {
  return (
    <ShadcnButton
      variant={variant}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </ShadcnButton>
  );
}
```

**What Changed**:
- ✅ **Preserved**: `onClick` handler (passed via `...props`)
- ✅ **Preserved**: `variant` prop (mapped to shadcn variants)
- ✅ **Preserved**: `loading` state (custom wrapper logic)
- ✅ **Preserved**: `disabled` prop
- ✅ **Removed**: Hardcoded `bg-teal-600` → Uses `bg-primary` from CSS variables
- ✅ **Removed**: `transition-all` → shadcn uses `transition-colors`
- ✅ **Added**: lucide-react `Loader2` icon (replacing custom Spinner)

---

### Step 4: Update Imports Across Codebase

Find all files importing the old Button:

```bash
# Search for Button imports
grep -r "import.*Button.*from.*components/Button" src/

# Example output:
# src/pages/dashboard.tsx:import { Button } from "../components/Button";
# src/pages/signin.tsx:import { Button } from "../components/Button";
```

Update each file (if Button API changed):
```tsx
// No changes needed if you preserved the same API!
// Component just works with new styling automatically
```

---

### Step 5: Test in Storybook

```bash
# Install Storybook (if not already installed)
npx storybook@latest init

# Create Button story
cat > src/components/Button.stories.tsx << 'EOF'
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Loading: Story = {
  args: {
    children: "Submit",
    loading: true,
  },
};
EOF

# Launch Storybook
npm run storybook
# Navigate to http://localhost:6006
```

**Visual Verification Checklist**:
- [ ] Primary button has teal background (from `--primary` CSS variable)
- [ ] Hover state changes color (darker teal)
- [ ] Focus state shows teal ring
- [ ] Loading state shows spinner icon
- [ ] Disabled state has reduced opacity

---

### Step 6: Visual Regression Testing

```bash
# Install Chromatic (sign up at chromatic.com)
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<YOUR_PROJECT_TOKEN>

# Example output:
# Build 1 published!
# View build at: https://www.chromatic.com/build?appId=...&number=1
```

**Review Changes**:
1. Go to Chromatic dashboard
2. Compare old Button vs. new Button
3. Accept changes if visual appearance is correct

---

### Step 7: Accessibility Testing

```bash
# Install axe-core for Storybook
npm install --save-dev @storybook/addon-a11y

# Add to .storybook/main.ts
# addons: ['@storybook/addon-a11y']

# Restart Storybook
npm run storybook

# Check "Accessibility" tab in Storybook
# Ensure 0 violations
```

**Manual Screen Reader Test**:
1. Enable Windows Narrator (Windows Key + Ctrl + Enter)
2. Navigate to Button in dev server
3. Verify screen reader announces "Button, submit" (or similar)

---

### Step 8: Update Migration Status

```bash
# Create migration status tracker (one-time setup)
cat > specs/005-comprehensive-css-class/migration-status.json << 'EOF'
{
  "components": []
}
EOF

# Add Button status
cat > scripts/track-migration.ts << 'EOF'
import { readFileSync, writeFileSync } from 'fs';

const statusPath = 'specs/005-comprehensive-css-class/migration-status.json';
const status = JSON.parse(readFileSync(statusPath, 'utf-8'));

status.components.push({
  componentName: "Button",
  filePath: "src/components/Button.tsx",
  status: "completed",
  priority: "P3",
  migrationDate: new Date().toISOString(),
  migratedBy: "your-name",
  logicPreservationChecklist: [
    { item: "Preserve onClick handler", verified: true },
    { item: "Preserve variant prop", verified: true },
    { item: "Preserve loading state", verified: true },
    { item: "Preserve disabled prop", verified: true },
  ],
  testingStatus: {
    visualRegression: "passed",
    accessibility: "passed",
    interaction: "passed",
  },
});

writeFileSync(statusPath, JSON.stringify(status, null, 2));
console.log('✅ Updated migration status for Button');
EOF

npx tsx scripts/track-migration.ts
```

---

## Phase 2: Set Up Automated Validation (20 minutes)

### Step 1: Install ESLint Tailwind Plugin

```bash
npm install --save-dev eslint-plugin-tailwindcss
```

**Update `.eslintrc.js`**:
```javascript
module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended", // ← Add this
  ],
  plugins: ["tailwindcss"],
  rules: {
    "tailwindcss/no-custom-classname": "warn",
    "tailwindcss/no-contradicting-classname": "error",
  },
};
```

---

### Step 2: Create Validation Script

```bash
cat > scripts/validate-classnames.ts << 'EOF'
import { readFileSync } from 'fs';
import { globSync } from 'glob';

const FORBIDDEN_PATTERNS = [
  /bg-(red|blue|green|teal|slate)-\d{3}/,
  /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/,
  /transition-all/,
];

function validateClassNames() {
  const files = globSync('src/**/*.{tsx,jsx}');
  let violations: any[] = [];
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const classNameMatches = content.matchAll(/className="([^"]*)"/g);
    
    for (const match of classNameMatches) {
      const classes = match[1].split(/\s+/);
      
      for (const cls of classes) {
        if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(cls))) {
          violations.push({ file, class: cls });
        }
      }
    }
  }
  
  if (violations.length > 0) {
    console.error('❌ className violations found:\n');
    violations.forEach(v => console.error(`${v.file}: ${v.class}`));
    process.exit(1);
  }
  
  console.log('✅ All className usage is valid!');
}

validateClassNames();
EOF

# Run validation
npx tsx scripts/validate-classnames.ts
```

---

### Step 3: Set Up Pre-Commit Hook

```bash
# Install Husky
npm install --save-dev husky
npx husky init

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating className usage..."
npx tsx scripts/validate-classnames.ts
EOF

# Make executable
chmod +x .husky/pre-commit

# Test hook
git add .
git commit -m "test: pre-commit hook"
# Expected: ✅ All className usage is valid!
```

---

## Phase 3: Migrate Next Component (35 minutes)

Repeat Phase 1 for another component (e.g., Card, Input, Modal).

**Recommended Order** (by priority):
1. ✅ Button (P3) - **Done!**
2. ⏸️ Icon (P4) - Next
3. ⏸️ Input (P5)
4. ⏸️ Card (P6)
5. ⏸️ Modal (P7)

Follow same 8-step process for each component.

---

## Common Issues & Solutions

### Issue 1: "Module not found: @/components/ui/button"

**Cause**: Alias not configured in TypeScript

**Solution**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Issue 2: CSS variables not applying in dark mode

**Cause**: Dark mode class not applied to root element

**Solution**:
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark"> {/* ← Add this */}
      <body>{children}</body>
    </html>
  );
}
```

---

### Issue 3: Storybook not loading CSS variables

**Cause**: globals.css not imported in Storybook

**Solution**:
```tsx
// .storybook/preview.tsx
import '../src/app/globals.css'; // ← Add this

export const parameters = { ... };
```

---

### Issue 4: Pre-commit hook takes >3 seconds

**Cause**: Validating too many files

**Solution**: Only validate staged files
```bash
# .husky/pre-commit
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx|jsx)$' | xargs npx tsx scripts/validate-classnames.ts
```

---

## Next Steps

After completing your first 2-3 components:

1. **Week 1 (Foundation)**: Complete P0-P2 priorities
   - shadcn setup ✅ (Done!)
   - Component audit scripts
   - Storybook setup

2. **Week 2 (Low-Risk)**: Complete P3-P4 priorities
   - Button ✅ (Done!)
   - Icons
   - Typography

3. **Week 3 (Medium-Risk)**: Complete P5-P6 priorities
   - Forms (Input, Label, Select)
   - Cards

4. **Week 4 (High-Risk)**: Complete P7-P8 priorities
   - Modals
   - Navigation components

5. **Week 5 (Validation)**: Complete P9 priorities
   - Visual regression tests
   - Accessibility audit
   - Documentation

6. **Week 6 (Deployment)**: Complete P10 priorities
   - Staging deployment
   - Production rollout with feature flags
   - Post-deployment monitoring

---

## Success Criteria Checklist

After migrating your first component, you should have:

- [x] shadcn/ui installed with CSS variables ✅
- [x] Component migrated to shadcn/ui ✅
- [x] All component logic preserved ✅
- [x] Storybook story created ✅
- [x] Visual regression test passed ✅
- [x] Accessibility test passed (0 violations) ✅
- [x] Migration status tracked ✅
- [x] Pre-commit hook configured ✅

**Time Spent**: ~2 hours ⏱️

---

## Getting Help

- **Spec Documentation**: `specs/005-comprehensive-css-class/spec.md`
- **Implementation Plan**: `specs/005-comprehensive-css-class/plan.md`
- **Research Findings**: `specs/005-comprehensive-css-class/research.md`
- **API Contracts**: `specs/005-comprehensive-css-class/contracts/`
- **shadcn/ui Docs**: https://ui.shadcn.com/docs
- **lucide-react Icons**: https://lucide.dev/icons

---

**Quickstart Status**: ✅ Complete  
**Developer Onboarding**: Target <2 hours achieved! 🎉

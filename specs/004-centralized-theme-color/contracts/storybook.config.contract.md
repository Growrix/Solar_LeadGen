# Storybook Configuration Contract

**Purpose**: Define Storybook setup for isolated visual testing of design tokens and components.

---

## Installation

```bash
# Install Storybook (latest version)
npx storybook@latest init

# Install Chromatic for visual regression testing
npm install --save-dev chromatic

# Install additional addons
npm install --save-dev @storybook/addon-a11y @storybook/addon-viewport
```

---

## Configuration Files

### 1. Main Configuration (`

.storybook/main.ts`)

```typescript
import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
    '@storybook/addon-viewport', // Responsive breakpoint testing
  ],
  
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  
  docs: {
    autodocs: 'tag',
  },
  
  // Webpack configuration for design tokens
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        '@/design-tokens': path.resolve(__dirname, '../src/design-tokens'),
        '@/components': path.resolve(__dirname, '../src/components'),
        '@/hooks': path.resolve(__dirname, '../src/hooks'),
      };
    }
    return config;
  },
};

export default config;
```

---

### 2. Preview Configuration (`.storybook/preview.ts`)

```typescript
import type { Preview } from '@storybook/react';
import '../src/globals.css'; // Import Tailwind CSS
import { ThemeProvider } from '../src/components/ThemeProvider';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Viewport addon configuration (responsive testing)
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (320px)',
          styles: { width: '320px', height: '568px' },
        },
        mobileMd: {
          name: 'Mobile MD (375px)',
          styles: { width: '375px', height: '667px' },
        },
        mobileLg: {
          name: 'Mobile LG (414px)',
          styles: { width: '414px', height: '896px' },
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop (1024px)',
          styles: { width: '1024px', height: '768px' },
        },
        desktopLg: {
          name: 'Desktop LG (1440px)',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
  
  // Global decorators (wrap all stories)
  decorators: [
    (Story, context) => {
      // Theme decorator (Light/Dark toggle)
      const theme = context.globals.theme || 'light';
      
      return (
        <ThemeProvider initialTheme={theme}>
          <div className={theme === 'dark' ? 'dark' : ''}>
            <div className="bg-background text-foreground min-h-screen p-4">
              <Story />
            </div>
          </div>
        </ThemeProvider>
      );
    },
  ],
  
  // Global types (theme switcher in toolbar)
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
```

---

### 3. Theme Decorator (`.storybook/theme-decorator.tsx`)

```typescript
import React from 'react';
import { ThemeProvider as CustomThemeProvider } from '../src/components/ThemeProvider';

/**
 * Theme Decorator for Storybook
 * 
 * Wraps all stories with ThemeProvider and applies dark class to root.
 * Enables theme switching via Storybook toolbar.
 */
export const ThemeDecorator = (Story: any, context: any) => {
  const theme = context.globals.theme || 'light';
  
  React.useEffect(() => {
    // Apply dark class to Storybook root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <CustomThemeProvider initialTheme={theme}>
      <div className="bg-background text-foreground min-h-screen p-4">
        <Story />
      </div>
    </CustomThemeProvider>
  );
};
```

---

## Story Structure

### Design Token Stories (Showcase)

**File**: `stories/design-tokens/Colors.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { colors } from '@/design-tokens';

const meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
      {/* Primary */}
      <div>
        <div className="bg-primary h-24 rounded-card shadow-card mb-2"></div>
        <p className="text-body font-semibold">Primary</p>
        <code className="text-caption text-muted">{colors.primary.light}</code>
      </div>
      
      {/* Secondary */}
      <div>
        <div className="bg-secondary h-24 rounded-card shadow-card mb-2"></div>
        <p className="text-body font-semibold">Secondary</p>
        <code className="text-caption text-muted">{colors.secondary.light}</code>
      </div>
      
      {/* Success */}
      <div>
        <div className="bg-success h-24 rounded-card shadow-card mb-2"></div>
        <p className="text-body font-semibold">Success</p>
        <code className="text-caption text-muted">{colors.success.light}</code>
      </div>
      
      {/* Error */}
      <div>
        <div className="bg-error h-24 rounded-card shadow-card mb-2"></div>
        <p className="text-body font-semibold">Error</p>
        <code className="text-caption text-muted">{colors.error.light}</code>
      </div>
    </div>
  ),
};

export const ThemeComparison: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-heading-2 mb-4">Light Theme</h2>
        <div className="bg-background p-card-padding rounded-card shadow-card">
          <p className="text-foreground text-body">Foreground text on background</p>
          <p className="text-muted text-body">Muted text</p>
        </div>
      </div>
      
      <div className="dark">
        <h2 className="text-heading-2 mb-4">Dark Theme</h2>
        <div className="bg-background p-card-padding rounded-card shadow-card">
          <p className="text-foreground text-body">Foreground text on background</p>
          <p className="text-muted text-body">Muted text</p>
        </div>
      </div>
    </div>
  ),
};
```

---

### Component Stories (Migration Testing)

**File**: `stories/components/Button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => (
    <button className="bg-primary hover:bg-primary-hover text-white px-button-padding-x py-button-padding-y rounded-button text-button">
      Click Me
    </button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 p-8">
      <button className="bg-primary hover:bg-primary-hover text-white px-button-padding-x py-button-padding-y rounded-button">
        Primary
      </button>
      <button className="bg-secondary hover:bg-secondary-hover text-white px-button-padding-x py-button-padding-y rounded-button">
        Secondary
      </button>
      <button className="bg-success hover:bg-green-700 text-white px-button-padding-x py-button-padding-y rounded-button">
        Success
      </button>
      <button className="bg-error hover:bg-red-700 text-white px-button-padding-x py-button-padding-y rounded-button">
        Error
      </button>
    </div>
  ),
};

export const ResponsiveSizes: Story = {
  render: () => (
    <div className="space-y-4 p-8">
      <button className="bg-primary text-white p-mobile-sm lg:p-desktop-md rounded-button">
        Responsive Button
      </button>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

---

## Visual Regression Testing with Chromatic

### Setup

1. **Create Chromatic project**:
   ```bash
   npx chromatic --project-token=<YOUR_PROJECT_TOKEN>
   ```

2. **Add to `package.json`**:
   ```json
   {
     "scripts": {
       "storybook": "storybook dev -p 6006",
       "build-storybook": "storybook build",
       "chromatic": "chromatic --exit-zero-on-changes"
     }
   }
   ```

3. **Run visual regression tests**:
   ```bash
   npm run chromatic
   ```

### Workflow

1. **Baseline capture** (first run):
   - Chromatic captures screenshots of all stories
   - Accept baselines as "correct" state

2. **Subsequent runs** (after changes):
   - Chromatic compares new screenshots to baselines
   - Flags any visual differences
   - Review differences in Chromatic UI
   - Accept changes (intentional) or reject (bugs)

3. **CI Integration** (GitHub Actions):
   ```yaml
   # .github/workflows/chromatic.yml
   name: Chromatic
   on: [push, pull_request]
   jobs:
     chromatic:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
         - run: npm ci
         - run: npm run chromatic
           env:
             CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
   ```

---

## Testing Workflow

### Per-Component Migration Testing

1. **Before refactoring**:
   - Create story for component (with hardcoded values)
   - Run Chromatic → Capture baseline
   - Save screenshots locally

2. **After refactoring**:
   - Update component to use design tokens
   - Run Chromatic → Compare to baseline
   - If visual diff: Fix immediately
   - If identical: Approve and commit

3. **Theme testing**:
   - Switch theme in Storybook toolbar (Light → Dark)
   - Verify component renders correctly in both themes
   - Check contrast, readability, colors

4. **Responsive testing**:
   - Use Viewport addon to test all breakpoints
   - Verify spacing, typography, layout at 320px, 768px, 1024px
   - Check touch targets (44px+ on mobile)

---

## Approval Checklist

Before considering Storybook setup complete:

- [ ] Storybook installed and running (`npm run storybook`)
- [ ] Chromatic installed and configured
- [ ] Theme switcher in toolbar works (Light/Dark toggle)
- [ ] Viewport addon configured (320px, 768px, 1024px viewports)
- [ ] Design token showcase stories created (Colors, Typography, Spacing)
- [ ] Sample component story created (Button or Card)
- [ ] ThemeProvider decorator applied to all stories
- [ ] Tailwind CSS imported in `.storybook/preview.ts`
- [ ] Chromatic baseline captured
- [ ] Visual regression tests pass

---

## Maintenance

**When adding new components**:

1. Create story file: `stories/components/[ComponentName].stories.tsx`
2. Export variants (default, states, responsive)
3. Run `npm run chromatic` to capture baseline
4. Document in `changelog.md`

**When updating tokens**:

1. Update token showcase stories (Colors, Typography, etc.)
2. Run `npm run chromatic` to detect changes
3. Review visual diffs in Chromatic UI
4. Accept changes if intentional

---

## Troubleshooting

### Issue: Storybook not showing Tailwind styles

**Cause**: CSS not imported.

**Fix**: Add `import '../src/globals.css';` to `.storybook/preview.ts`

### Issue: Theme switcher not working

**Cause**: ThemeProvider decorator not applied or dark class not added.

**Fix**:
1. Verify `ThemeDecorator` in `preview.ts`
2. Check `dark` class applied to root element
3. Verify ThemeProvider exported from components

### Issue: Chromatic showing false positives

**Cause**: Timing issues, animations, or font loading.

**Fix**:
1. Add delays to stories with animations:
   ```typescript
   export const Story: Story = {
     play: async () => {
       await new Promise(resolve => setTimeout(resolve, 500));
     },
   };
   ```
2. Disable animations in Chromatic:
   ```typescript
   parameters: {
     chromatic: { disableSnapshot: false, delay: 500 },
   }
   ```

---

## Next Steps

1. **Run Storybook**: `npm run storybook`
2. **Create token showcase stories** (Colors, Typography, Spacing)
3. **Capture Chromatic baseline**: `npm run chromatic`
4. **Build sample page story** to validate all tokens
5. **Get stakeholder approval** before Phase 3 migration

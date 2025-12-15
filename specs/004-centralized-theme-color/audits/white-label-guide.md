# White-Label Customization Guide

**Version**: 1.0  
**Last Updated**: 2025-10-28  
**Purpose**: Guide for creating client-specific white-label versions of SolarMatch

---

## Overview

The SolarMatch design token system supports **white-label rebranding** by allowing you to override brand colors (Primary/Secondary) while maintaining consistent status colors, spacing, typography, and theme support.

### What is White-Labeling?

White-labeling allows you to create custom-branded versions of SolarMatch for different solar installation companies. Each client gets:
- ✅ Their own brand colors (Primary/Secondary)
- ✅ Custom logo and favicon
- ✅ Optional custom CSS variables
- ✅ **Zero component code changes** (all updates automatic)

### What Stays Consistent?

- ✅ **Status colors** (Success/Warning/Error/Info) - for user familiarity
- ✅ **Typography system** - for readability consistency
- ✅ **Spacing system** - for layout consistency
- ✅ **Shadow/Elevation** - for visual hierarchy
- ✅ **Border radius** - for UI consistency
- ✅ **Animations** - for motion consistency

**Philosophy**: Only brand colors change. Everything else remains consistent for best UX.

---

## Quick Start (5 Minutes)

### Step 1: Create New Theme File

Create `src/design-tokens/themes/client-name.ts`:

```typescript
/**
 * [Client Name] Theme
 * 
 * White-label theme for [Client Company Name]
 * 
 * Brand Guidelines:
 * - Primary: [Color Name] ([Hex Code])
 * - Secondary: [Color Name] ([Hex Code])
 * - Logo: [Path to logo files]
 */

import { primitives } from '../primitives/colors'
import { defaultTheme, mergeThemeColors, type Theme } from './index'

export const clientNameTheme: Theme = {
  id: 'client-name',                    // URL-safe ID (lowercase, hyphens)
  name: '[Client Display Name]',        // Human-readable name
  client: '[Company Name]',             // Client company name
  
  colors: mergeThemeColors(defaultTheme, {
    // Override PRIMARY color
    primary: {
      light: primitives.[color][shade],  // For light theme (e.g., primitives.blue[800])
      dark: primitives.[color][shade],   // For dark theme (e.g., primitives.blue[300])
      DEFAULT: primitives.[color][shade],
    },
    
    // Override SECONDARY color
    secondary: {
      light: primitives.[color][shade],  // For light theme (e.g., primitives.green[600])
      dark: primitives.[color][shade],   // For dark theme (e.g., primitives.green[400])
      DEFAULT: primitives.[color][shade],
    },
    
    // Status colors INHERITED from defaultTheme (don't override unless required)
  }),
  
  logo: {
    light: '/themes/[client-name]/logo-light.svg',
    dark: '/themes/[client-name]/logo-dark.svg',
  },
  
  favicon: '/themes/[client-name]/favicon.ico',
  
  // Optional: Custom CSS variables
  cssVariables: {
    '--brand-tagline': '"Your custom tagline"',
  },
}
```

### Step 2: Register Theme

Add to `src/design-tokens/themes/index.ts`:

```typescript
import { clientNameTheme } from './client-name'

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  'client-name': clientNameTheme,  // Add here
}
```

### Step 3: Test in Storybook

```bash
npm run storybook
```

Navigate to **Pages → WhiteLabelDemo** and toggle between themes to verify your new brand colors.

### Step 4: Deploy to Production

Set environment variable:

```bash
# .env.production
NEXT_PUBLIC_THEME=client-name
```

Or use dynamic theme selection:

```typescript
// In tailwind.config.js or app layout
import { getTheme } from './src/design-tokens/themes'

const themeId = process.env.NEXT_PUBLIC_THEME || 'default'
const activeTheme = getTheme(themeId)

// Use activeTheme.colors in Tailwind config
```

---

## Detailed Workflow

### 1. Gather Client Brand Guidelines

**Required Information**:
- [ ] **Primary brand color** (hex code or Pantone)
- [ ] **Secondary brand color** (hex code or Pantone)
- [ ] **Logo files** (SVG preferred, Light + Dark variants)
- [ ] **Favicon** (ICO or PNG, 32x32px minimum)
- [ ] **Company name** (full legal name)
- [ ] **Tagline** (optional, for hero sections)

**Nice to Have**:
- [ ] Brand font family (if different from Inter)
- [ ] Custom spacing preferences (rare)
- [ ] Additional brand colors (tertiary, accent)

**Deliverable**: Brand guidelines document with color swatches and asset files

---

### 2. Choose Primitive Color Shades

Map client colors to our primitive palette (Tailwind shades 50-950):

#### Available Primitive Colors

| Color Family | Available Shades | Common Use Cases |
|--------------|------------------|------------------|
| **Gray** | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Backgrounds, text, borders |
| **Teal** | 50-950 | Default primary (solar association) |
| **Amber** | 50-950 | Default secondary (warmth, energy) |
| **Green** | 50-950 | Success states, eco-friendly brands |
| **Yellow** | 50-950 | Warning states, bright accents |
| **Red** | 50-950 | Error states, urgent actions |
| **Blue** | 50-950 | Corporate, tech, trust |

#### Shade Selection Guidelines

**For Light Theme (Primary Color)**:
- **Shade 600-800**: Best for primary buttons, links (dark enough for white text)
- **Shade 500**: Good for large UI elements with dark text
- **Avoid 50-300**: Too light, poor contrast with white backgrounds

**For Dark Theme (Primary Color)**:
- **Shade 300-500**: Best for primary buttons, links (light enough for dark backgrounds)
- **Avoid 700-950**: Too dark, blends with dark backgrounds

**Example**:
```typescript
// Client brand: Corporate Blue (#1e40af is close to blue-800)
primary: {
  light: primitives.blue[800],  // #1e40af for light theme
  dark: primitives.blue[300],   // #93c5fd for dark theme
  DEFAULT: primitives.blue[800],
}
```

**Pro Tip**: Use [Color Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify your chosen shade meets WCAG AA (4.5:1 for normal text, 3:1 for large text).

---

### 3. Verify WCAG AA Contrast Compliance

**WCAG AA Requirements**:
- **Normal text** (<18px): Contrast ratio ≥ 4.5:1
- **Large text** (≥18px or bold ≥14px): Contrast ratio ≥ 3:1
- **UI components** (buttons, borders): Contrast ratio ≥ 3:1

#### Testing Primary Color Contrast

**Scenario 1: Primary Button (White Text on Primary Background)**

```typescript
// Client primary: blue-800 (#1e40af)
// White text: #ffffff

// Contrast ratio: 8.59:1 ✅ (exceeds 4.5:1)
```

**Scenario 2: Primary Link (Primary Color on White Background)**

```typescript
// Client primary: blue-500 (#0ea5e9)
// White background: #ffffff

// Contrast ratio: 3.27:1 ⚠️ (marginal, use for large text only)
```

**Fix**: If contrast is too low, darken the shade:
```typescript
// Instead of blue-500, use blue-600 or blue-700
primary: {
  light: primitives.blue[600],  // #2563eb (contrast 5.89:1 ✅)
  dark: primitives.blue[300],
  DEFAULT: primitives.blue[600],
}
```

#### Testing in Storybook

1. **Open Storybook**: `npm run storybook`
2. **Navigate to**: Pages → AccessibilityTest → Contrast Ratio Test
3. **Open Accessibility addon panel** (bottom of screen)
4. **Review violations**: Check for "Insufficient contrast" errors
5. **Fix violations**: Adjust shade in your theme file, rebuild Storybook

**Automated Tool**: Storybook Accessibility addon automatically flags contrast violations

---

### 4. Create Logo Assets

#### Required Logo Files

```
public/
  themes/
    client-name/
      logo-light.svg       # Logo for light theme (dark text/graphics)
      logo-dark.svg        # Logo for dark theme (light text/graphics)
      favicon.ico          # Favicon (32x32px minimum)
      logo-large.png       # Optional: High-res for print/marketing (1200x400px)
```

#### Logo Design Guidelines

**Light Theme Logo** (`logo-light.svg`):
- Dark text/graphics (readable on white/light backgrounds)
- Recommended colors: Primary dark shade (e.g., blue-800) or black
- SVG preferred (scalable, small file size)

**Dark Theme Logo** (`logo-dark.svg`):
- Light text/graphics (readable on dark backgrounds)
- Recommended colors: Primary light shade (e.g., blue-300) or white
- Same dimensions as light logo (for consistent layout)

**Favicon** (`favicon.ico`):
- Simple, recognizable at small sizes (16x16px, 32x32px, 64x64px)
- Square aspect ratio
- Incorporate primary brand color

**Example**: TechCorp Blue theme logos
```svg
<!-- public/themes/techcorp/logo-light.svg -->
<svg width="200" height="50" viewBox="0 0 200 50">
  <text x="10" y="35" font-family="Inter" font-size="24" font-weight="bold" fill="#1e40af">
    TechCorp
  </text>
</svg>

<!-- public/themes/techcorp/logo-dark.svg -->
<svg width="200" height="50" viewBox="0 0 200 50">
  <text x="10" y="35" font-family="Inter" font-size="24" font-weight="bold" fill="#93c5fd">
    TechCorp
  </text>
</svg>
```

---

### 5. Build and Test

#### Development Testing

```bash
# 1. Start Storybook
npm run storybook

# 2. Navigate to WhiteLabelDemo story
# Pages → WhiteLabelDemo → Side-by-Side Comparison

# 3. Toggle between Default and your new theme
# Verify all UI elements update correctly

# 4. Test Accessibility
# Pages → AccessibilityTest → Contrast Ratio Test
# Open Accessibility addon panel
# Fix any contrast violations
```

#### Production Build Testing

```bash
# 1. Set theme environment variable
export NEXT_PUBLIC_THEME=client-name

# 2. Build production
npm run build

# 3. Start production server
npm run start

# 4. Test in browser
# - Navigate to http://localhost:3000
# - Verify theme colors applied
# - Test Light/Dark theme switching
# - Test all pages (Dashboard, Forms, Modals)
```

#### Cross-Browser Testing

Test in:
- [ ] **Chrome** (latest) - Most common browser
- [ ] **Firefox** (latest) - Different rendering engine
- [ ] **Safari** (latest, macOS/iOS) - WebKit engine, known for CSS bugs
- [ ] **Edge** (latest) - Chromium-based, similar to Chrome
- [ ] **Mobile Safari** (iOS) - Mobile-specific issues
- [ ] **Chrome Mobile** (Android) - Mobile-specific issues

**Common Issues**:
- Safari: Custom CSS variables rendering
- Mobile Safari: Touch target sizes (ensure buttons ≥44x44px)
- Firefox: Flexbox/Grid layout differences

---

### 6. Deploy to Production

#### Environment Variables

**Option 1: Static Theme (Single Client)**

```bash
# .env.production
NEXT_PUBLIC_THEME=client-name
```

**Option 2: Dynamic Theme (Multi-Tenant)**

```bash
# .env.production
NEXT_PUBLIC_ENABLE_MULTI_THEME=true
```

Then implement theme selection logic:

```typescript
// src/app/layout.tsx or middleware
import { getTheme } from '@/design-tokens/themes'

// Example: Subdomain-based theme selection
const subdomain = request.headers.get('host')?.split('.')[0]
const themeId = subdomainToTheme[subdomain] || 'default'
const theme = getTheme(themeId)

// Apply theme to Tailwind config dynamically
```

#### Deployment Checklist

- [ ] Theme file created and registered
- [ ] Logo assets uploaded to `/public/themes/[client-name]/`
- [ ] Environment variable set (`NEXT_PUBLIC_THEME`)
- [ ] Production build successful (`npm run build`)
- [ ] Accessibility tests passed (0 contrast violations)
- [ ] Cross-browser testing completed
- [ ] Client approval received (show WhiteLabelDemo in Storybook)
- [ ] Deploy to staging environment
- [ ] Final QA on staging
- [ ] Deploy to production
- [ ] Post-deployment smoke test

---

## Advanced: Multiple Client Deployments

### Subdomain-Based Themes

**Architecture**: Each client gets their own subdomain with custom theme
- `client1.solarmatch.com` → `client-1-theme`
- `client2.solarmatch.com` → `client-2-theme`
- `app.solarmatch.com` → `default`

**Implementation**:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTheme } from '@/design-tokens/themes'

const subdomainToTheme: Record<string, string> = {
  'client1': 'client-1-blue',
  'client2': 'client-2-green',
  'client3': 'client-3-purple',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  
  const themeId = subdomainToTheme[subdomain] || 'default'
  const theme = getTheme(themeId)
  
  // Set theme in response headers for client-side access
  const response = NextResponse.next()
  response.headers.set('X-Theme-ID', themeId)
  
  return response
}
```

### URL Parameter-Based Themes

**Use Case**: Demo environment where sales team shows multiple themes

```typescript
// Example: https://app.solarmatch.com?theme=client-blue

import { useSearchParams } from 'next/navigation'
import { getTheme } from '@/design-tokens/themes'

export function ThemeProvider({ children }) {
  const searchParams = useSearchParams()
  const themeId = searchParams.get('theme') || process.env.NEXT_PUBLIC_THEME || 'default'
  const theme = getTheme(themeId)
  
  // Apply theme colors dynamically
  React.useEffect(() => {
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value.light)
    })
  }, [theme])
  
  return <>{children}</>
}
```

---

## Troubleshooting

### Issue 1: Theme Colors Not Applying

**Symptoms**: After creating new theme, colors still show default teal/amber

**Causes**:
1. Theme not registered in `themes/index.ts`
2. Environment variable not set
3. Tailwind cache not cleared

**Fix**:
```bash
# 1. Verify theme registration
cat src/design-tokens/themes/index.ts | grep "client-name"

# 2. Set environment variable
echo "NEXT_PUBLIC_THEME=client-name" >> .env.local

# 3. Clear Tailwind cache and rebuild
rm -rf .next
npm run build
npm run dev
```

---

### Issue 2: Contrast Violations in Accessibility Tests

**Symptoms**: Storybook Accessibility addon shows "Insufficient contrast" errors

**Causes**:
1. Primary/Secondary color too light for white text
2. Primary/Secondary color too dark for dark theme

**Fix**:
```typescript
// If primary color fails contrast test:
// Original: blue-500 (#0ea5e9) on white = 3.27:1 ⚠️
primary: {
  light: primitives.blue[500],  // Too light!
  
// Fix: Use darker shade
primary: {
  light: primitives.blue[600],  // #2563eb = 5.89:1 ✅
  dark: primitives.blue[300],
  DEFAULT: primitives.blue[600],
}
```

**Verification**:
1. Open Storybook → Pages → AccessibilityTest
2. Open Accessibility addon panel
3. Should show 0 violations (or only low-severity)

---

### Issue 3: Logo Not Displaying

**Symptoms**: Logo path broken, showing 404 error

**Causes**:
1. Logo files not uploaded to `/public/themes/`
2. Incorrect file path in theme object
3. File extension mismatch (SVG vs PNG)

**Fix**:
```bash
# 1. Verify logo files exist
ls -la public/themes/client-name/

# 2. Check file paths in theme
# Should be:
logo: {
  light: '/themes/client-name/logo-light.svg',  # Note: NO 'public/' prefix
  dark: '/themes/client-name/logo-dark.svg',
}

# 3. Restart dev server
npm run dev
```

---

### Issue 4: Theme Works in Storybook but Not in App

**Symptoms**: WhiteLabelDemo story shows correct colors, but main app still uses default

**Causes**:
1. Theme applied to Storybook config but not Tailwind config
2. Components using hardcoded colors instead of semantic tokens

**Fix**:
```typescript
// 1. Update tailwind.config.js to use theme colors
import { getTheme } from './src/design-tokens/themes'

const themeId = process.env.NEXT_PUBLIC_THEME || 'default'
const activeTheme = getTheme(themeId)

export default {
  theme: {
    extend: {
      colors: activeTheme.colors,  // Apply theme colors here
    }
  }
}

// 2. Audit components for hardcoded colors
# Search for hardcoded hex values:
grep -r "#[0-9a-fA-F]\{6\}" src/

# Replace with semantic tokens:
# Before: className="bg-[#0d9488]"
# After:  className="bg-primary"
```

---

## Best Practices

### ✅ DO

- **Test contrast ratios** before client approval (use WebAIM Contrast Checker)
- **Keep status colors consistent** (Success/Warning/Error/Info) across all themes
- **Use SVG logos** for scalability and small file size
- **Test in Light and Dark themes** (verify both work correctly)
- **Document client brand guidelines** in theme file comments
- **Version control logo assets** (commit to Git)
- **Test on mobile devices** (touch targets, responsive layout)

### ❌ DON'T

- **Override status colors** (Success/Warning/Error/Info) - users expect consistency
- **Use extremely bright colors** (neon green, hot pink) - accessibility issues
- **Hardcode colors in components** - always use semantic tokens
- **Skip accessibility testing** - legal liability in many jurisdictions
- **Use raster logos** (JPG, PNG) - use SVG for crisp scaling
- **Forget Dark theme variants** - poor UX if Dark mode breaks

---

## Example Themes

### Corporate Blue (Tech Companies)

```typescript
export const corporateBlueTheme: Theme = {
  id: 'corporate-blue',
  name: 'Corporate Blue',
  client: 'TechCorp',
  colors: mergeThemeColors(defaultTheme, {
    primary: {
      light: primitives.blue[800],   // Deep blue #1e40af
      dark: primitives.blue[300],    // Light blue #93c5fd
      DEFAULT: primitives.blue[800],
    },
    secondary: {
      light: primitives.blue[500],   // Sky blue #0ea5e9
      dark: primitives.blue[400],    // Lighter sky #60a5fa
      DEFAULT: primitives.blue[500],
    },
  }),
}
```

### Eco-Friendly Green (Environmental Focus)

```typescript
export const ecoGreenTheme: Theme = {
  id: 'eco-green',
  name: 'Eco Green',
  client: 'GreenEnergy Inc',
  colors: mergeThemeColors(defaultTheme, {
    primary: {
      light: primitives.green[700],  // Forest green #15803d
      dark: primitives.green[400],   // Bright green #4ade80
      DEFAULT: primitives.green[700],
    },
    secondary: {
      light: primitives.teal[600],   // Teal accent #0d9488
      dark: primitives.teal[400],    // Light teal #2dd4bf
      DEFAULT: primitives.teal[600],
    },
  }),
}
```

### Warm Orange (Energy/Solar Focus)

```typescript
export const warmOrangeTheme: Theme = {
  id: 'warm-orange',
  name: 'Warm Orange',
  client: 'SunPower Solutions',
  colors: mergeThemeColors(defaultTheme, {
    primary: {
      light: primitives.amber[600],  // Deep orange #d97706
      dark: primitives.amber[400],   // Bright orange #fbbf24
      DEFAULT: primitives.amber[600],
    },
    secondary: {
      light: primitives.yellow[500], // Warm yellow #eab308
      dark: primitives.yellow[400],  // Lighter yellow #facc15
      DEFAULT: primitives.yellow[500],
    },
  }),
}
```

---

## Resources

### Color Tools
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Coolors**: https://coolors.co/ (color palette generator)
- **Color Hunt**: https://colorhunt.co/ (curated palettes)

### Accessibility
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool

### Logo Design
- **Figma**: https://www.figma.com/ (vector design tool)
- **SVGOMG**: https://jakearchibald.github.io/svgomg/ (SVG optimizer)
- **Favicon Generator**: https://realfavicongenerator.net/

### Tailwind CSS
- **Color Palette**: https://tailwindcss.com/docs/customizing-colors
- **Theme Configuration**: https://tailwindcss.com/docs/theme

---

## Support

**Questions?** Create an issue in GitHub with the `design-system` label.

**Need help choosing colors?** Tag the design team in your pull request.

**Accessibility concerns?** Run `npm run storybook` → Pages → AccessibilityTest and share the Accessibility addon report.

---

**Last Updated**: 2025-10-28  
**Version**: 1.0  
**Maintained By**: Design System Team

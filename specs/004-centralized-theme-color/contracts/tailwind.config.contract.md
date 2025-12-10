# Tailwind CSS Configuration Contract

**Purpose**: Define how design tokens integrate with Tailwind CSS configuration.

---

## Configuration Strategy

### 1. Use `theme.extend` (NOT `theme` replace)

**Why**: Preserves existing Tailwind utility classes during migration.

```javascript
// ❌ WRONG - Breaks existing classes
module.exports = {
  theme: {
    colors: designTokens.colors, // This REMOVES bg-teal-600, bg-gray-900, etc.
  },
};

// ✅ CORRECT - Adds new classes, keeps existing
module.exports = {
  theme: {
    extend: {
      colors: designTokens.colors, // Adds bg-primary, KEEPS bg-teal-600
    },
  },
};
```

---

## Full Configuration

**File**: `tailwind.config.js` (root directory)

```javascript
const { colors, typography, spacing, shadows, animations, borders } = require('./src/design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use .dark class for dark mode (existing setup)
  
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}', // Include Storybook stories
  ],
  
  theme: {
    extend: {
      // Colors (semantic tokens)
      colors: {
        primary: colors.primary.DEFAULT,
        'primary-hover': colors['primary-hover'].DEFAULT,
        'primary-dark': colors['primary-dark'].DEFAULT,
        secondary: colors.secondary.DEFAULT,
        'secondary-hover': colors['secondary-hover'].DEFAULT,
        success: colors.success.DEFAULT,
        warning: colors.warning.DEFAULT,
        error: colors.error.DEFAULT,
        info: colors.info.DEFAULT,
        background: colors.background.DEFAULT,
        'background-alt': colors['background-alt'].DEFAULT,
        surface: colors.surface.DEFAULT,
        foreground: colors.foreground.DEFAULT,
        muted: colors.muted.DEFAULT,
        subtle: colors.subtle.DEFAULT,
        border: colors.border.DEFAULT,
        'border-focus': colors['border-focus'].DEFAULT,
      },
      
      // Typography
      fontFamily: {
        sans: typography.fontFamily.sans.split(', '),
        mono: typography.fontFamily.mono.split(', '),
      },
      fontSize: {
        'heading-1': [typography.heading[1].fontSize.DEFAULT, { lineHeight: typography.heading[1].lineHeight, fontWeight: typography.heading[1].fontWeight }],
        'heading-2': [typography.heading[2].fontSize.DEFAULT, { lineHeight: typography.heading[2].lineHeight, fontWeight: typography.heading[2].fontWeight }],
        'heading-3': [typography.heading[3].fontSize.DEFAULT, { lineHeight: typography.heading[3].lineHeight, fontWeight: typography.heading[3].fontWeight }],
        'heading-4': [typography.heading[4].fontSize.DEFAULT, { lineHeight: typography.heading[4].lineHeight, fontWeight: typography.heading[4].fontWeight }],
        'body': [typography.body.fontSize.DEFAULT, { lineHeight: typography.body.lineHeight, fontWeight: typography.body.fontWeight }],
        'body-large': [typography['body-large'].fontSize.DEFAULT, { lineHeight: typography['body-large'].lineHeight }],
        'body-small': [typography['body-small'].fontSize, { lineHeight: typography['body-small'].lineHeight }],
        'caption': [typography.caption.fontSize, { lineHeight: typography.caption.lineHeight }],
        'label': [typography.label.fontSize, { lineHeight: typography.label.lineHeight, fontWeight: typography.label.fontWeight }],
        'button': [typography.button.fontSize.DEFAULT, { lineHeight: typography.button.lineHeight, fontWeight: typography.button.fontWeight, letterSpacing: typography.button.letterSpacing }],
      },
      
      // Spacing (semantic + explicit responsive)
      spacing: {
        ...spacing,
      },
      
      // Shadows (elevation)
      boxShadow: {
        card: shadows.card.DEFAULT,
        modal: shadows.modal.DEFAULT,
        dropdown: shadows.dropdown.DEFAULT,
        button: shadows.button.DEFAULT,
        focus: shadows.focus.DEFAULT,
      },
      
      // Border radius
      borderRadius: {
        card: borders.radius.card,
        button: borders.radius.button,
        input: borders.radius.input,
        modal: borders.radius.modal,
        badge: borders.radius.badge,
      },
      
      // Animations
      transitionDuration: animations.duration,
      transitionTimingFunction: animations.easing,
      keyframes: animations.keyframes,
      animation: {
        'fade-in': 'fadeIn 250ms ease-in-out',
        'fade-out': 'fadeOut 250ms ease-in-out',
        'slide-in-up': 'slideInUp 250ms ease-in-out',
        'slide-out-down': 'slideOutDown 250ms ease-in-out',
      },
    },
  },
  
  plugins: [
    // Responsive spacing plugin (for semantic auto-responsive tokens)
    require('tailwindcss/plugin')(function({ addUtilities, theme }) {
      const responsiveSpacing = theme('spacing');
      const newUtilities = {};

      Object.entries(responsiveSpacing).forEach(([key, value]) => {
        if (typeof value === 'object' && value.DEFAULT && !Array.isArray(value)) {
          // Padding
          newUtilities[`.p-${key}`] = {
            padding: value.DEFAULT,
            '@screen md': value.md ? { padding: value.md } : {},
            '@screen lg': value.lg ? { padding: value.lg } : {},
          };
          
          // Margin
          newUtilities[`.m-${key}`] = {
            margin: value.DEFAULT,
            '@screen md': value.md ? { margin: value.md } : {},
            '@screen lg': value.lg ? { margin: value.lg } : {},
          };
          
          // Gap
          newUtilities[`.gap-${key}`] = {
            gap: value.DEFAULT,
            '@screen md': value.md ? { gap: value.md } : {},
            '@screen lg': value.lg ? { gap: value.lg } : {},
          };
        }
      });

      addUtilities(newUtilities, ['responsive']);
    }),
  ],
};
```

---

## Dark Mode Support

**Mechanism**: Class-based dark mode (`.dark` class on root element)

**How Theme Colors Work**:
1. **Light theme** (default): Uses `.DEFAULT` values from color tokens
2. **Dark theme** (`.dark` class present): Requires manual dark mode classes

**Example**:
```tsx
// Light theme: bg-primary (uses colors.primary.DEFAULT = teal-600)
// Dark theme: dark:bg-primary-dark (manually specify dark variant)

<button className="bg-primary dark:bg-teal-400 text-white">
  Click Me
</button>
```

**Limitation**: Tailwind's `extend` doesn't auto-generate dark mode variants for custom colors. Must use explicit `dark:` classes.

**Alternative** (future enhancement): Create custom plugin to auto-generate dark mode classes from token light/dark variants.

---

## Usage Examples

### Example 1: Semantic Color Classes

```tsx
// PRIMARY
<button className="bg-primary hover:bg-primary-hover text-white">Primary Button</button>

// SUCCESS
<div className="bg-success text-white">Success Message</div>

// BACKGROUND
<div className="bg-background dark:bg-gray-900">Content Area</div>
```

### Example 2: Typography Classes

```tsx
// HEADINGS
<h1 className="text-heading-1">Main Heading</h1>
<h2 className="text-heading-2">Subheading</h2>

// BODY
<p className="text-body">Regular paragraph text</p>
<small className="text-caption text-muted">Small caption text</small>
```

### Example 3: Semantic Responsive Spacing

```tsx
// Auto-responsive (12px mobile → 16px tablet → 24px desktop)
<div className="p-card-padding space-y-form-gap">
  Card content with responsive padding and gap
</div>

// Explicit responsive (manual breakpoints)
<div className="p-mobile-md lg:p-desktop-lg">
  Custom responsive padding
</div>
```

### Example 4: Shadows and Borders

```tsx
// SHADOWS
<div className="shadow-card hover:shadow-modal">Elevated Card</div>

// BORDER RADIUS
<button className="rounded-button">Rounded Button</button>
<div className="rounded-card">Rounded Card</div>
```

---

## Testing Configuration

**After updating `tailwind.config.js`**:

1. **Test build**:
   ```bash
   npm run build
   ```
   - Should complete without errors
   - Check for any "unknown utility class" warnings

2. **Test in Storybook**:
   ```bash
   npm run storybook
   ```
   - Verify new classes render correctly
   - Check dark mode toggle works

3. **Verify IntelliSense**:
   - Open any `.tsx` file
   - Type `className="bg-primary"` → Should show IntelliSense suggestions
   - Type `className="text-heading-1"` → Should show IntelliSense suggestions

---

## Migration Notes

### Backward Compatibility

**Existing classes still work**:
```tsx
// OLD (hardcoded) - Still works during migration
<button className="bg-teal-600 hover:bg-teal-700 text-white">Button</button>

// NEW (token-based) - Gradually migrate to this
<button className="bg-primary hover:bg-primary-hover text-white">Button</button>
```

**Gradual migration strategy**:
1. Phase 1: Add token classes to Tailwind config
2. Phase 2: Old classes (`bg-teal-600`) and new classes (`bg-primary`) coexist
3. Phase 3: Migrate pages one by one (old → new)
4. Phase 4: Remove unused old classes (cleanup)

### Breaking Changes (NONE)

Using `theme.extend` ensures **zero breaking changes**. All existing Tailwind classes remain functional.

---

## Maintenance

**When adding new tokens**:

1. Add to appropriate design token file:
   ```typescript
   // src/design-tokens/semantic/colors.ts
   export const colors = {
     ...existing,
     newColor: {
       light: primitives.blue[600],
       dark: primitives.blue[400],
       DEFAULT: primitives.blue[600],
     },
   };
   ```

2. Update `tailwind.config.js`:
   ```javascript
   colors: {
     ...existing,
     'new-color': colors.newColor.DEFAULT,
   },
   ```

3. Test:
   ```bash
   npm run build && npm run storybook
   ```

4. Document in `changelog.md`:
   ```markdown
   ### 2025-01-28 - Added New Color Token
   - Added `newColor` token for [use case]
   - Tailwind class: `bg-new-color`
   ```

---

## Troubleshooting

### Issue: "Unknown utility class" error

**Cause**: Tailwind not recognizing custom class name.

**Fix**: 
1. Verify token imported in `tailwind.config.js`
2. Verify `content` paths include your file
3. Restart dev server: `npm run dev`

### Issue: Dark mode not working

**Cause**: Missing `.dark` class on root element or missing `dark:` prefix.

**Fix**:
1. Ensure ThemeProvider adds `.dark` class to `<html>` element
2. Use explicit dark mode classes: `bg-primary dark:bg-teal-400`

### Issue: IntelliSense not showing custom classes

**Cause**: VS Code Tailwind extension not recognizing custom config.

**Fix**:
1. Install "Tailwind CSS IntelliSense" extension
2. Restart VS Code
3. Check `.vscode/settings.json` has:
   ```json
   {
     "tailwindCSS.experimental.classRegex": [
       ["className\\s*[:=]\\s*['\"`]([^'\"`]*)['\"`]", "([a-zA-Z0-9\\-:]+)"]
     ]
   }
   ```

---

## Approval Checklist

Before considering Tailwind configuration complete:

- [ ] All semantic color tokens added to `colors` section
- [ ] All typography tokens added to `fontSize` section
- [ ] All spacing tokens added to `spacing` section
- [ ] All shadow tokens added to `boxShadow` section
- [ ] All border radius tokens added to `borderRadius` section
- [ ] All animation tokens added to `keyframes` and `animation` sections
- [ ] Responsive spacing plugin added and tested
- [ ] Build succeeds (`npm run build`)
- [ ] Storybook renders all token examples correctly
- [ ] IntelliSense works for all custom classes
- [ ] Dark mode toggle works in Storybook
- [ ] No breaking changes to existing code

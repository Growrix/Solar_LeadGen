# Three-Theme System Documentation

## Overview
Solar Match implements a comprehensive 3-theme system that users can switch between:

1. **Light Theme** - Clean, professional cream/white design
2. **Dark Theme** - Modern black background with teal accents
3. **System Theme** - Eco-friendly dark green theme (solar-inspired)

## Theme Architecture

### CSS Variables
Each theme defines consistent variables in `globals.css`:
- `--bg-primary`: Main background color
- `--bg-secondary`: Secondary/card backgrounds
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--border-color`: Border colors
- `--accent-color`: Brand accent color

### Theme Classes
- **Light**: No class (default)
- **Dark**: `.dark` class on `<html>`
- **System**: `.dark.theme-system` classes on `<html>`

## Components

### ThemeProvider (`src/components/ThemeProvider.tsx`)
Client-side React context that manages theme state:
- Stores theme preference in localStorage
- Listens to system color scheme changes
- Applies appropriate classes to `<html>` element
- Provides `useTheme()` hook for components

### ThemeSwitcher (`src/components/HeaderMenu.tsx`)
UI component with 3 buttons for theme selection:
- Light (sun icon)
- Dark (moon icon)
- System (monitor icon)

## Usage

### In Components
```tsx
'use client';
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark
    </button>
  );
}
```

### In CSS
Use Tailwind's dark mode classes or custom theme classes:

```css
/* Tailwind dark mode */
.my-element {
  @apply bg-white dark:bg-gray-900;
}

/* Custom theme targeting */
.dark.theme-system .my-element {
  background-color: #0a2f1a;
}
```

## Theme Styles

### Light Theme
- Background: #F2F0EF (cream)
- Text: #0F172A (dark slate)
- Accent: #0d9488 (teal)
- Style: Solid colors, clean shadows

### Dark Theme
- Background: #000000 (black)
- Text: #E2E8F0 (light slate)
- Accent: #14b8a6 (bright teal)
- Style: Glassmorphism, subtle glows

### System Theme
- Background: #001405 (dark green)
- Text: #FFFFFF (white)
- Accent: #0d9488 (teal)
- Style: Eco-friendly, green glassmorphism

## Files Modified
- `src/app/globals.css` - Theme styles and variables
- `src/components/ThemeProvider.tsx` - Theme management logic
- `src/components/HeaderMenu.tsx` - Theme switcher UI
- `src/app/layout.tsx` - ThemeProvider wrapper
- `tailwind.config.js` - Dark mode configuration

## Benefits
- ✅ User preference persistence
- ✅ System theme auto-detection
- ✅ Smooth transitions between themes
- ✅ Consistent styling across all components
- ✅ Accessible color contrasts
- ✅ Reduced motion support for animations

const { typography, spacing, shadows, animations, borders, layout } = require('./src/ds/tokens');

function toNumberPx(value) {
  if (typeof value !== 'string') return NaN;
  const trimmed = value.trim();
  if (!trimmed.endsWith('px')) return NaN;
  const parsed = Number(trimmed.slice(0, -2));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function responsiveFontSizeToClamp(fontSize) {
  if (!fontSize) return fontSize;
  if (typeof fontSize === 'string') return fontSize;
  const min = fontSize.DEFAULT;
  const max = fontSize.lg ?? fontSize.md ?? fontSize.DEFAULT;

  const minPx = toNumberPx(min);
  const maxPx = toNumberPx(max);
  if (!Number.isFinite(minPx) || !Number.isFinite(maxPx) || minPx === maxPx) {
    return min;
  }

  // Interpolate between mobile and desktop viewports.
  const minViewport = 375;
  const maxViewport = 1440;
  const slope = (maxPx - minPx) / (maxViewport - minViewport);
  const yIntercept = minPx - slope * minViewport;
  const preferred = `calc(${yIntercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw)`;

  return `clamp(${min}, ${preferred}, ${max})`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}', // Include Storybook stories
  ],
  // Tailwind `dark:` variants should follow the app theme class on <html>
  // App uses: `theme-dark` / `theme-light` / `theme-purple`
  darkMode: ['class', '.theme-dark'],
  theme: {
    // Universal breakpoints (see Design System SOT)
    // Tailwind screens are min-widths, mapping to:
    // xs: 0–480, sm: 481–768, md: 769–1024, lg: 1025–1440, xl: 1441–1920, xxl: 1921+
    screens: {
      xs: '0px',
      sm: '481px',
      md: '769px',
      lg: '1025px',
      xl: '1441px',
      xxl: '1921px',
    },
    extend: {
      // Semantic color tokens with theme-aware variants (CSS VARIABLES)
      colors: {
        // Brand colors - Use CSS variables for automatic dark mode
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        
        // Background colors
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'background-dark': 'rgb(var(--color-background) / <alpha-value>)',
        'background-alt': 'rgb(var(--color-background-alt) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-dark': 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
        
        // Text colors - 3-level hierarchy (Google AI Studio aligned)
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        'foreground-dark': 'rgb(var(--color-foreground) / <alpha-value>)',
        'foreground-secondary': 'rgb(var(--color-foreground-secondary) / <alpha-value>)',
        'foreground-tertiary': 'rgb(var(--color-foreground-tertiary) / <alpha-value>)',
        'foreground-subtle': 'rgb(var(--color-foreground-subtle) / <alpha-value>)',
        'foreground-muted': 'rgb(var(--color-foreground-muted) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--color-foreground-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        
        // Icon color
        icon: 'rgb(var(--color-icon) / <alpha-value>)',
        
        // Border colors
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-dark': 'rgb(var(--color-border) / <alpha-value>)',

        // Overlay / Scrim (modal backdrops)
        scrim: 'rgb(var(--color-scrim) / <alpha-value>)',
        
        // Accent colors (Orange)
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--color-accent-hover) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        
        // Status colors
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-foreground': 'rgb(255 255 255 / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-foreground': 'rgb(255 255 255 / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'error-foreground': 'rgb(255 255 255 / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        'info-foreground': 'rgb(255 255 255 / <alpha-value>)',
        
        // shadcn/ui HSL-based colors (from globals.css)
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
        'destructive-foreground': 'hsl(var(--destructive-foreground) / <alpha-value>)',

        // Optional centralized scales (SolarConnect compatibility)
        // These map to CSS variables so they remain theme-driven.
        brand: {
          50: 'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          200: 'rgb(var(--color-brand-200) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700) / <alpha-value>)',
          800: 'rgb(var(--color-brand-800) / <alpha-value>)',
          900: 'rgb(var(--color-brand-900) / <alpha-value>)',
          950: 'rgb(var(--color-brand-950) / <alpha-value>)',
        },
        neutral: {
          50: 'rgb(var(--color-neutral-50) / <alpha-value>)',
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
          950: 'rgb(var(--color-neutral-950) / <alpha-value>)',
        },

        // Compatibility alias for SolarConnect components.
        // Prefer semantic keys (background/surface/foreground/accent) or `neutral-*` in new code.
        slate: {
          50: 'rgb(var(--color-neutral-50) / <alpha-value>)',
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
          950: 'rgb(var(--color-neutral-950) / <alpha-value>)',
        },
        
        // Custom status colors (HSL format)
        'success-hsl': 'hsl(var(--success) / <alpha-value>)',
        'success-foreground-hsl': 'hsl(var(--success-foreground) / <alpha-value>)',
        'info-hsl': 'hsl(var(--info) / <alpha-value>)',
        'info-foreground-hsl': 'hsl(var(--info-foreground) / <alpha-value>)',
        'warning-hsl': 'hsl(var(--warning) / <alpha-value>)',
        'warning-foreground-hsl': 'hsl(var(--warning-foreground) / <alpha-value>)',
      },
      
      // Typography tokens
      fontFamily: {
        sans: typography.fontFamily.sans.split(', '),
        mono: typography.fontFamily.mono.split(', '),
      },
      fontSize: {
        'heading-1': [responsiveFontSizeToClamp(typography.heading[1].fontSize), { lineHeight: typography.heading[1].lineHeight, fontWeight: typography.heading[1].fontWeight }],
        'heading-2': [responsiveFontSizeToClamp(typography.heading[2].fontSize), { lineHeight: typography.heading[2].lineHeight, fontWeight: typography.heading[2].fontWeight }],
        'heading-3': [responsiveFontSizeToClamp(typography.heading[3].fontSize), { lineHeight: typography.heading[3].lineHeight, fontWeight: typography.heading[3].fontWeight }],
        'heading-4': [responsiveFontSizeToClamp(typography.heading[4].fontSize), { lineHeight: typography.heading[4].lineHeight, fontWeight: typography.heading[4].fontWeight }],
        'heading-5': ['14px', { lineHeight: '1.5', fontWeight: '600' }], // 14px semibold for smaller headings
        'heading-6': ['12px', { lineHeight: '1.5', fontWeight: '600' }], // 12px semibold for smallest headings
        body: [responsiveFontSizeToClamp(typography.body.fontSize), { lineHeight: typography.body.lineHeight, fontWeight: typography.body.fontWeight }],
        'body-large': [responsiveFontSizeToClamp(typography['body-large'].fontSize), { lineHeight: typography['body-large'].lineHeight }],
        'body-small': [typography['body-small'].fontSize, { lineHeight: typography['body-small'].lineHeight }],
        caption: [typography.caption.fontSize, { lineHeight: typography.caption.lineHeight }],
        micro: [typography.micro.fontSize, { lineHeight: typography.micro.lineHeight, fontWeight: typography.micro.fontWeight, letterSpacing: typography.micro.letterSpacing }],
        label: [typography.label.fontSize, { lineHeight: typography.label.lineHeight, fontWeight: typography.label.fontWeight }],
        button: [responsiveFontSizeToClamp(typography.button.fontSize), { lineHeight: typography.button.lineHeight, fontWeight: typography.button.fontWeight }],
      },
      
      // Spacing tokens (semantic + responsive)
      spacing: {
        ...spacing,
      },
      
      // Shadow tokens (elevation system)
      boxShadow: {
        card: shadows.card.DEFAULT,
        modal: shadows.modal.DEFAULT,
        dropdown: shadows.dropdown.DEFAULT,
        button: shadows.button.DEFAULT,
        focus: shadows.focus.DEFAULT,
        // Neumorphism shadows for dark theme
        'neu-outset': 'var(--shadow-neu-outset)',
        'neu-inset': 'var(--shadow-neu-inset)',
        'neu-outset-sm': 'var(--shadow-neu-outset-sm)',
        'neu-inset-sm': 'var(--shadow-neu-inset-sm)',
        'neu-outset-lg': 'var(--shadow-neu-outset-lg)',

        // Optional SolarConnect-style brand glows
        'brand-glow-sm': 'var(--shadow-brand-glow-sm)',
        'brand-glow-md': 'var(--shadow-brand-glow-md)',
      },

      // Subtle interaction scales (avoid arbitrary scale-[...])
      scale: {
        98: '0.98',
        101: '1.01',
        102: '1.02',
      },
      
      // Border radius tokens
      borderRadius: {
        card: borders.radius.card,
        button: borders.radius.button,
        input: borders.radius.input,
        modal: borders.radius.modal,
        badge: borders.radius.badge,
      },

      // Semantic z-index scale (backed by CSS variables)
      zIndex: {
        ...layout.zIndex,
      },

      // Semantic sizing helpers (backed by CSS variables)
      maxWidth: {
        ...layout.maxWidth,
      },
      maxHeight: {
        ...layout.maxHeight,
      },
      width: {
        'toggle-indicator': 'var(--size-toggle-indicator-w)',
      },
      height: {
        // SolarConnect import cleanup (avoid h-[...] in migrated components)
        'hero-headline': '200px',
        'hero-headline-md': '240px',
      },
      minHeight: {
        ...layout.minHeight,
        // SolarConnect import cleanup (avoid min-h-[...] in migrated components)
        'featured-news': '400px',
      },

      // Avoid arbitrary `grid-cols-[...]` in app code
      gridTemplateColumns: {
        'pricing-engine-cost': 'minmax(100px,1fr) minmax(120px,2fr) 60px 90px 90px 50px 90px 40px',
        'pricing-engine': 'minmax(100px,1.5fr) minmax(150px,3fr) 80px 120px 60px 120px 50px',
      },

      // Compatibility: SolarConnect components commonly use `ring-offset-slate-900`
      // Keep it theme-driven via CSS variables.
      ringOffsetColor: {
        'slate-900': 'rgb(var(--color-background) / 1)',
      },
      
      // Animation tokens
      transitionDuration: animations.duration,
      transitionTimingFunction: animations.easing,
      keyframes: {
        ...animations.keyframes,
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-in-out',
        'fade-out': 'fadeOut 250ms ease-in-out',
        'slide-in-up': 'slideInUp 250ms ease-in-out',
        'slide-out-down': 'slideOutDown 250ms ease-in-out',
        'scale-in': 'scaleIn 250ms ease-in-out',
        'scale-out': 'scaleOut 250ms ease-in-out',

        // SolarConnect compatibility
        'fade-in-up': 'fadeInUp 600ms var(--ease-out) both',
        'ken-burns': 'kenBurns 15s ease-out forwards',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
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
            ...(value.md && { '@screen md': { padding: value.md } }),
            ...(value.lg && { '@screen lg': { padding: value.lg } }),
          };
          
          // Margin
          newUtilities[`.m-${key}`] = {
            margin: value.DEFAULT,
            ...(value.md && { '@screen md': { margin: value.md } }),
            ...(value.lg && { '@screen lg': { margin: value.lg } }),
          };
          
          // Gap
          newUtilities[`.gap-${key}`] = {
            gap: value.DEFAULT,
            ...(value.md && { '@screen md': { gap: value.md } }),
            ...(value.lg && { '@screen lg': { gap: value.lg } }),
          };
        }
      });

      addUtilities(newUtilities, ['responsive']);
    }),
    // Icon size utilities (T005)
    require('tailwindcss/plugin')(function({ addUtilities }) {
      const iconUtilities = {
        '.icon-xs': { width: '12px', height: '12px' },
        '.icon-sm': { width: '16px', height: '16px' },
        '.icon-md': { width: '20px', height: '20px' },
        '.icon-lg': { width: '24px', height: '24px' },
        '.icon-xl': { width: '32px', height: '32px' },
      };
      addUtilities(iconUtilities);
    }),
  ],
}
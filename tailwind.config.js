/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}', // Include Storybook stories
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Semantic color tokens with theme-aware variants (CSS VARIABLES)
      colors: {
        // Brand colors (DS-driven)
        primary: 'rgb(var(--ds-color-accent-rgb) / <alpha-value>)',
        'primary-hover': 'var(--ds-color-accent-hover)',
        'primary-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--ds-color-accent-rgb) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',

        // Background colors
        background: 'rgb(var(--ds-color-background-rgb) / <alpha-value>)',
        'background-dark': 'rgb(var(--ds-color-background-rgb) / <alpha-value>)',
        'background-alt': 'var(--ds-color-surface-2)',
        surface: 'rgb(var(--ds-color-surface-rgb) / <alpha-value>)',
        'surface-dark': 'rgb(var(--ds-color-surface-rgb) / <alpha-value>)',
        'surface-hover': 'color-mix(in oklab, var(--ds-color-surface) 90%, var(--ds-color-foreground-secondary))',

        // Text colors
        foreground: 'rgb(var(--ds-color-foreground-rgb) / <alpha-value>)',
        'foreground-dark': 'rgb(var(--ds-color-foreground-rgb) / <alpha-value>)',
        'foreground-secondary': 'rgb(var(--ds-color-foreground-secondary-rgb) / <alpha-value>)',
        'foreground-tertiary': 'var(--ds-color-text-muted)',
        'foreground-subtle': 'var(--ds-color-text-muted)',
        'foreground-muted': 'var(--ds-color-text-muted)',
        // NOTE: `muted`/`subtle` are used widely with Tailwind opacity modifiers
        // (e.g. `bg-muted/20`, `border-muted/30`). These must support `<alpha-value>`.
        muted: 'rgb(var(--ds-color-foreground-rgb) / <alpha-value>)',
        'muted-foreground': 'var(--ds-color-text-muted)',
        subtle: 'rgb(var(--ds-color-foreground-rgb) / <alpha-value>)',

        // Icon color
        icon: 'rgb(var(--ds-color-foreground-secondary-rgb) / <alpha-value>)',

        // Border colors
        border: 'rgb(var(--ds-color-border-rgb) / <alpha-value>)',
        'border-dark': 'rgb(var(--ds-color-border-rgb) / <alpha-value>)',

        // Accent colors
        accent: 'rgb(var(--ds-color-accent-rgb) / <alpha-value>)',
        'accent-hover': 'var(--ds-color-accent-hover)',

        // Status colors
        success: 'rgb(var(--ds-color-success-rgb) / <alpha-value>)',
        'success-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',
        warning: 'rgb(var(--ds-color-warning-rgb) / <alpha-value>)',
        'warning-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',
        error: 'rgb(var(--ds-color-danger-rgb) / <alpha-value>)',
        'error-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',
        info: 'rgb(var(--ds-color-info-rgb) / <alpha-value>)',
        'info-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',

        // shadcn-compatible aliases
        destructive: 'rgb(var(--ds-color-danger-rgb) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--ds-color-on-primary-rgb) / <alpha-value>)',
      },
      // Shadow tokens (DS-driven)
      boxShadow: {
        card: 'var(--ds-shadow-sm)',
        modal: 'var(--ds-shadow-md)',
        dropdown: 'var(--ds-shadow-md)',
        button: 'var(--ds-shadow-sm)',
        focus: '0 0 0 3px var(--ds-color-focus-ring)',
      },

      // Border radius tokens (DS-driven)
      borderRadius: {
        card: 'var(--ds-radius-card)',
        button: 'var(--ds-radius-full)',
        input: 'var(--ds-radius-card)',
        modal: 'var(--ds-radius-modal)',
        badge: 'var(--ds-radius-full)',
      },

      // Motion tokens (DS-driven)
      transitionDuration: {
        fast: 'var(--ds-duration-fast)',
        normal: 'var(--ds-duration-normal)',
        slow: 'var(--ds-duration-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ds-ease-standard)',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-out-down': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(18px)' },
        },
        'slide-in-top': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.98)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms var(--ds-ease-standard)',
        'fade-out': 'fade-out 250ms var(--ds-ease-standard)',
        'fade-in-up': 'fade-in-up 600ms var(--ds-ease-standard) forwards',
        'slide-in-up': 'slide-in-up 250ms var(--ds-ease-standard)',
        'slide-out-down': 'slide-out-down 250ms var(--ds-ease-standard)',
        'slide-in-top': 'slide-in-top 500ms var(--ds-ease-standard) forwards',
        'scale-in': 'scale-in 250ms var(--ds-ease-standard)',
        'scale-out': 'scale-out 250ms var(--ds-ease-standard)',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
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
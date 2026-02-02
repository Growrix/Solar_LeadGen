'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

export type Theme = 'dark' | 'light' | 'purple' | 'system';

type ResolvedTheme = Exclude<Theme, 'system'>;

const THEME_STORAGE_KEY = 'solarmatch-theme';
const THEME_CLASSES: ResolvedTheme[] = ['dark', 'light', 'purple'];

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  const applyThemeClass = (resolvedTheme: ResolvedTheme) => {
    const root = document.documentElement;

    // Remove only our theme classes, preserve any other <html> classes.
    THEME_CLASSES.forEach((t) => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${resolvedTheme}`);
  };

  const resolveTheme = (preferredTheme: Theme): ResolvedTheme => {
    if (preferredTheme !== 'system') return preferredTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (savedTheme && ['dark', 'light', 'purple', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
      applyThemeClass(resolveTheme(savedTheme));
    } else {
      // Default to dark theme
      applyThemeClass('dark');
    }
  }, []);

  // If user selects "system", keep theme synced with OS preference.
  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyThemeClass(resolveTheme('system'));
    };

    // Apply immediately
    onChange();

    // Subscribe (with legacy fallback)
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeClass(resolveTheme(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

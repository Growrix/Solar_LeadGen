'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { applyTheme, DEFAULT_THEME, resolveTheme, THEME_STORAGE_KEY } from '@/ds';

export type Theme = 'dark' | 'light' | 'purple' | 'system';

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

  // Load theme from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

    if (raw === 'system') {
      setTheme('system');
      applyTheme(DEFAULT_THEME);
      return;
    }

    const resolved = resolveTheme(raw);
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    if (newTheme === 'system') {
      applyTheme(DEFAULT_THEME);
      return;
    }

    applyTheme(newTheme);
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

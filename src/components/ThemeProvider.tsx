'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

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
    const savedTheme = localStorage.getItem('solarmatch-theme') as Theme;
    if (savedTheme && ['dark', 'light', 'purple', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.className = `theme-${savedTheme}`;
    } else {
      // Default to dark theme
      document.documentElement.className = 'theme-dark';
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('solarmatch-theme', newTheme);
    document.documentElement.className = `theme-${newTheme}`;
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

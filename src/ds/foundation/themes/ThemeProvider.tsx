'use client';

import React, { createContext, useContext, useEffect, useState } from "react";

import { DEFAULT_THEME, isActiveThemeName, type ThemeName } from "./registry";
import { applyTheme, readStoredTheme, storeTheme } from "./theme";

// Back-compat alias for existing app imports.
export type Theme = ThemeName;

export interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const raw = readStoredTheme();
    const resolved = raw && isActiveThemeName(raw) ? raw : DEFAULT_THEME;
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const handleSetTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    storeTheme(newTheme);
    applyTheme(newTheme);
  };

  return <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
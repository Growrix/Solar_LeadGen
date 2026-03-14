'use client';

import React, { createContext, useContext, useEffect, useState } from "react";

import { DEFAULT_THEME } from "./registry";
import { applyTheme, resolveTheme, THEME_STORAGE_KEY } from "./theme";

export type Theme = "dark" | "light" | "purple" | "system";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const raw = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

    if (raw === "system") {
      setTheme("system");
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

    if (newTheme === "system") {
      applyTheme(DEFAULT_THEME);
      return;
    }

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
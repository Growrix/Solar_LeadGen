export type ThemeName = "dark" | "light" | "purple";

export const THEME_STORAGE_KEY = "solarmatch-theme";

const THEME_CLASS_PREFIX = "theme-";

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  for (const cls of Array.from(root.classList)) {
    if (cls.startsWith(THEME_CLASS_PREFIX)) root.classList.remove(cls);
  }
  root.classList.add(`${THEME_CLASS_PREFIX}${theme}`);
}

export function readStoredTheme(): ThemeName | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === "dark" || raw === "light" || raw === "purple") return raw;
  return null;
}

export function storeTheme(theme: ThemeName) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

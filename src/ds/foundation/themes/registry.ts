export type ThemeName = "dark" | "light" | "purple";

export type ThemeDefinition = {
  name: ThemeName;
  label: string;
  colorScheme: "dark" | "light";
};

export const ALL_THEMES: ThemeDefinition[] = [
  { name: "light", label: "Light", colorScheme: "light" },
  { name: "dark", label: "Dark", colorScheme: "dark" },
  { name: "purple", label: "Purple", colorScheme: "dark" },
];

export const THEMES: ThemeDefinition[] = ALL_THEMES.filter((theme) => theme.name === "light" || theme.name === "dark");

export const DEFAULT_THEME: ThemeName = "light";

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "dark" || value === "light" || value === "purple";
}

export function isActiveThemeName(value: string | null | undefined): value is ThemeName {
  return THEMES.some((theme) => theme.name === value);
}

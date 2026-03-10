export type ThemeName = "dark" | "light" | "purple";

export type ThemeDefinition = {
  name: ThemeName;
  label: string;
  colorScheme: "dark" | "light";
};

export const DEFAULT_THEME: ThemeName = "dark";

export const THEMES: ThemeDefinition[] = [
  { name: "dark", label: "Dark", colorScheme: "dark" },
  { name: "light", label: "Light", colorScheme: "light" },
  { name: "purple", label: "Purple", colorScheme: "dark" },
];

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === "dark" || value === "light" || value === "purple";
}

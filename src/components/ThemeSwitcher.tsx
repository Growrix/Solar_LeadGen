'use client';

import { useTheme } from '@/components/ThemeProvider';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'dark' as const, label: 'Dark', icon: '🌙' },
    { value: 'light' as const, label: 'Light', icon: '☀️' },
    { value: 'purple' as const, label: 'Purple', icon: '�️' },
  ];

  return (
    <div className="flex items-center gap-2 bg-background rounded-full p-1 shadow-neu-inset">
      {themes.map((themeOption) => (
        <button
          key={themeOption.value}
          onClick={() => setTheme(themeOption.value)}
          aria-label={`Switch to ${themeOption.label} theme`}
          title={themeOption.label}
          className={`
            w-9 h-9 rounded-full flex items-center justify-center
            transition-colors duration-200
            ${
              theme === themeOption.value
                ? 'bg-surface shadow-neu-outset scale-100'
                : 'bg-background shadow-neu-inset-sm hover:shadow-neu-inset scale-90 opacity-60 hover:opacity-100'
            }
          `}
        >
          <span className="text-heading-4">{themeOption.icon}</span>
        </button>
      ))}
    </div>
  );
}

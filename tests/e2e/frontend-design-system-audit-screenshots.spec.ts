import { test } from '@playwright/test';
import path from 'path';

const outputDir = path.join(
  process.cwd(),
  'DOC',
  'Prompts',
  'PROMPTS & TEMPLATES',
  'FRONTEND',
  'AUDIT-OUTPUT-2026-02-01',
  'screenshots'
);

const themes = ['dark', 'light', 'purple'] as const;
const viewports = [
  { name: 'mobile-320', width: 320, height: 700 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
] as const;

const pages = [
  { name: 'home', path: '/' },
  { name: 'component-library', path: '/component-library' },
  { name: 'theme-test', path: '/theme-test' },
] as const;

function slug(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

test.describe('Frontend design system audit - screenshots', () => {
  for (const theme of themes) {
    for (const viewport of viewports) {
      for (const pageInfo of pages) {
        test(`${theme} / ${viewport.name} / ${pageInfo.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });

          // Ensure theme is applied as early as possible.
          await page.addInitScript(({ theme }) => {
            const key = 'solarmatch-theme';
            localStorage.setItem(key, theme);

            // Match the app's real theme mechanism: <html class="theme-...">.
            document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-purple');
            document.documentElement.classList.add(`theme-${theme}`);
          }, { theme });

          await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
          await page.waitForTimeout(300);

          const fileName = `${slug(theme)}__${slug(viewport.name)}__${slug(pageInfo.name)}.png`;
          await page.screenshot({
            path: path.join(outputDir, fileName),
            fullPage: true,
          });
        });
      }
    }
  }
});

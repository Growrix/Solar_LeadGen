/**
 * DS Migration Audit Script (T009)
 *
 * Extended audit for the centralized DS styling migration.
 * Reports:
 * 1. DS barrel misuse (feature components imported from @/ds)
 * 2. Undefined semantic class names used in feature files
 * 3. Hardcoded visual tokens (bg-gray-*, text-slate-*, etc.)
 *
 * Usage: npx tsx scripts/ds-migration-audit.ts [--output path/to/report.md]
 *
 * SOT: DOC/FRONTEND MIGRATION/newtasks.md — T009
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ─── Configuration ────────────────────────────────────────────────────────────

const SCAN_PATTERNS = [
  'src/app/**/*.{ts,tsx}',
  'src/components/**/*.{ts,tsx}',
];

const DS_BARREL_PATH = 'src/ds/index.ts';

/** Semantic class names that feature files use — must be defined in DS styles */
const REQUIRED_SEMANTIC_CLASSES = [
  'toggle-switch', 'toggle-knob', 'toggle-switch-sm', 'toggle-switch-md',
  'toggle-switch-on', 'toggle-switch-off', 'toggle-knob-sm', 'toggle-knob-md',
  'detail-card', 'detail-card-header',
  'cost-item-label', 'performance-item-label', 'performance-item-value',
  'info-section', 'neu-card', 'panel-surface',
  'ui-overlay', 'ui-page', 'ui-band', 'ui-container',
  'ui-hero', 'ui-table', 'ui-navlink',
];

/** Hardcoded Tailwind color patterns (violations) */
const HARDCODED_COLOR_PATTERNS = [
  { name: 'bg-gray-N', pattern: /bg-gray-\d+/g },
  { name: 'bg-slate-N', pattern: /bg-slate-\d+/g },
  { name: 'bg-zinc-N', pattern: /bg-zinc-\d+/g },
  { name: 'bg-black (raw)', pattern: /\bbg-black\b(?!\/)/g },
  { name: 'text-gray-N', pattern: /text-gray-\d+/g },
  { name: 'text-slate-N', pattern: /text-slate-\d+/g },
  { name: 'border-gray-N', pattern: /border-gray-\d+/g },
  { name: 'border-slate-N', pattern: /border-slate-\d+/g },
];

/** Known DS exports that are legitimately imported from @/ds */
function getDsExports(): Set<string> {
  const exports = new Set<string>();
  try {
    const content = fs.readFileSync(DS_BARREL_PATH, 'utf-8');
    const matches = content.matchAll(/export \* from ['"](.+)['"]/g);
    for (const m of matches) exports.add(m[1]);
    const namedMatches = content.matchAll(/export \{([^}]+)\}/g);
    for (const m of namedMatches) {
      m[1].split(',').forEach(e => exports.add(e.trim()));
    }
  } catch { /* ignore */ }
  return exports;
}

/** Detect @/ds barrel imports and flag non-DS members */
function checkBarrelMisuse(file: string, content: string): string[] {
  const issues: string[] = [];
  const dsImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@\/ds['"]/g);
  if (!dsImportMatch) return issues;

  // Known feature-only components that should never be in @/ds
  const FEATURE_ONLY = [
    'OTPVerificationModal', 'SavingsChart', 'InstantQuoteForm', 'QuoteOptionsModal',
    'SimplifiedQuoteForm', 'InstantQuoteResult', 'HomeownerSignupModal',
    'RebateCalculatorForm', 'QuoteSuccessModal',
  ];

  for (const importStr of dsImportMatch) {
    const members = importStr.match(/import\s*\{([^}]+)\}/)?.[1]?.split(',') ?? [];
    for (const m of members) {
      const name = m.trim().split(' as ')[0].trim();
      if (FEATURE_ONLY.includes(name)) {
        issues.push(`  ${path.relative(process.cwd(), file)}: "${name}" is a feature component imported from @/ds — use direct path instead`);
      }
    }
  }
  return issues;
}

/** Detect hardcoded color classes */
function checkHardcodedColors(file: string, content: string): string[] {
  const issues: string[] = [];
  const relFile = path.relative(process.cwd(), file);
  for (const { name, pattern } of HARDCODED_COLOR_PATTERNS) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      issues.push(`  ${relFile}: ${matches.length}x "${name}" — replace with DS token class`);
    }
  }
  return issues;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const outputArg = process.argv.indexOf('--output');
  const outputPath = outputArg >= 0 ? process.argv[outputArg + 1] : null;

  const files = await glob(SCAN_PATTERNS, { absolute: true });

  const barrelIssues: string[] = [];
  const colorIssues: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    barrelIssues.push(...checkBarrelMisuse(file, content));
    colorIssues.push(...checkHardcodedColors(file, content));
  }

  const report = [
    `# DS Migration Audit Report`,
    ``,
    `**Generated**: ${new Date().toISOString()}`,
    `**Files scanned**: ${files.length}`,
    ``,
    `---`,
    ``,
    `## 1. DS Barrel Misuse`,
    ``,
    barrelIssues.length === 0
      ? `✅ No barrel misuse detected.`
      : `❌ ${barrelIssues.length} violation(s):\n\n${barrelIssues.join('\n')}`,
    ``,
    `---`,
    ``,
    `## 2. Hardcoded Visual Token Violations`,
    ``,
    colorIssues.length === 0
      ? `✅ No hardcoded color violations detected.`
      : `⚠️ ${colorIssues.length} file(s) with hardcoded colors:\n\n${colorIssues.join('\n')}`,
    ``,
    `---`,
    ``,
    `## 3. Summary`,
    ``,
    `| Check | Result |`,
    `|---|---|`,
    `| DS barrel misuse | ${barrelIssues.length === 0 ? '✅ Clean' : `❌ ${barrelIssues.length} issues`} |`,
    `| Hardcoded colors | ${colorIssues.length === 0 ? '✅ Clean' : `⚠️ ${colorIssues.length} files`} |`,
    ``,
  ].join('\n');

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report, 'utf-8');
    console.log(`Report written to: ${outputPath}`);
  } else {
    console.log(report);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

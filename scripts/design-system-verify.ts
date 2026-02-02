/**
 * Design System Verification (Enforcement Gate)
 *
 * Purpose:
 * - Prevent new UI/component work from introducing hardcoded values or non-semantic Tailwind patterns.
 * - Keep the design system enforceable for humans + AI/codegen.
 *
 * Default scope is intentionally narrow (new UI primitives only):
 *   src/components/ui/**\/*.{ts,tsx}
 *
 * Usage:
 *   npx tsx scripts/design-system-verify.ts
 *   npx tsx scripts/design-system-verify.ts --pattern "src/components/**\/*.{ts,tsx}" --report-only
 */

import * as fs from 'fs';
import { glob } from 'glob';
import ts from 'typescript';

type ViolationType =
  | 'hardcoded-tailwind-color'
  | 'hardcoded-black-white'
  | 'dark-variant'
  | 'tailwind-arbitrary-value'
  | 'raw-typography'
  | 'transition-all'
  | 'responsive-typography';

interface Violation {
  file: string;
  line: number;
  className: string;
  type: ViolationType;
  suggestion: string;
}

interface ClassStringCandidate {
  classString: string;
  line: number;
}

const DEFAULT_PATTERN = 'src/components/ui/**/*.{ts,tsx}';

const IGNORE_GLOBS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  'out/**',
  'coverage/**',
  'DOC/**',
  'specs/**',
  'backup/**',
  'backup-*/**',
];

const CLASSNAME_REGEXES: RegExp[] = [
  /className=["'`]([^"'`]+)["'`]/g,
  /className=\{[^}]*["'`]([^"'`]+)["'`][^}]*\}/g,
];

const HARDCODED_TAILWIND_COLOR =
  /\b(bg|text|border|ring|divide|decoration|placeholder|caret|accent|shadow|outline|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/;

const HARDCODED_BLACK_WHITE = /\b(bg|text)-(black|white)(\b|\/)/;

const TAILWIND_ARBITRARY_VALUE = /^[-\w]+-\[[^\]]+\]$/;
const TAILWIND_ARBITRARY_PROPERTY = /^\[[^\]]+:[^\]]+\]$/;

const RAW_TYPOGRAPHY = [
  /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/,
  /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/,
];

function parseArgs(argv: string[]) {
  const args = {
    pattern: DEFAULT_PATTERN,
    reportOnly: false,
    allowDarkVariant: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const value = argv[i];
    if (value === '--pattern' && argv[i + 1]) {
      args.pattern = argv[i + 1];
      i++;
      continue;
    }
    if (value === '--report-only') {
      args.reportOnly = true;
      continue;
    }
    if (value === '--allow-dark') {
      args.allowDarkVariant = true;
      continue;
    }
  }

  return args;
}

function getLineNumberFromIndex(source: string, index: number): number {
  // 1-based line number
  return source.slice(0, index).split('\n').length;
}

function normalizeToken(token: string): { raw: string; base: string; hasDark: boolean } {
  const raw = token.trim();
  const parts = raw.split(':');
  const hasDark = parts.includes('dark');
  const base = parts[parts.length - 1] ?? raw;
  return { raw, base, hasDark };
}

function looksLikeClassList(value: string): boolean {
  const text = value.trim();
  if (text.length < 6) return false;
  if (!/\s/.test(text)) return false;

  // Heuristic: must contain at least one Tailwind-like token.
  return /\b(bg-|text-|border-|ring-|shadow-|rounded-|flex\b|grid\b|items-|justify-|gap-|space-|p-|m-|w-|h-|hover:|focus:|focus-visible:|disabled:|sm:|md:|lg:|xl:|2xl:)\b/.test(
    text
  );
}

function extractClassStringCandidates(filePath: string, content: string): ClassStringCandidate[] {
  const candidates: ClassStringCandidate[] = [];

  // 1) Inline className="..." and className={..."..."...}
  for (const regex of CLASSNAME_REGEXES) {
    for (const match of content.matchAll(regex)) {
      const classString = match[1];
      const matchIndex = match.index ?? 0;
      const line = getLineNumberFromIndex(content, matchIndex);
      if (looksLikeClassList(classString)) candidates.push({ classString, line });
    }
  }

  // 2) Strings stored in variables/cva variants/etc.
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node: ts.Node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const value = node.text;
      if (looksLikeClassList(value)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        candidates.push({ classString: value, line: line + 1 });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return candidates;
}

function scanContent(filePath: string, content: string, allowDarkVariant: boolean): Violation[] {
  const violations: Violation[] = [];

  const candidates = extractClassStringCandidates(filePath, content);
  for (const { classString, line } of candidates) {
    const tokens = classString.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const { raw, base, hasDark } = normalizeToken(token);

        if (!allowDarkVariant && hasDark) {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'dark-variant',
            suggestion: 'Prefer theme-driven semantic tokens (CSS variables) instead of `dark:` variants.',
          });
        }

        if (TAILWIND_ARBITRARY_VALUE.test(base) || TAILWIND_ARBITRARY_PROPERTY.test(base)) {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'tailwind-arbitrary-value',
            suggestion: 'Avoid Tailwind arbitrary values. Add a semantic token/util instead.',
          });
        }

        if (base === 'transition-all') {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'transition-all',
            suggestion: 'Use targeted transitions: transition-colors, transition-shadow, transition-transform, transition-opacity.',
          });
        }

        if (HARDCODED_TAILWIND_COLOR.test(base)) {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'hardcoded-tailwind-color',
            suggestion: 'Use semantic tokens like bg-background, bg-surface, text-foreground, border-border, text-muted-foreground.',
          });
        }

        if (HARDCODED_BLACK_WHITE.test(base)) {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'hardcoded-black-white',
            suggestion: 'Use semantic tokens (e.g., bg-background, text-foreground) or an explicit semantic inverted token.',
          });
        }

        if (RAW_TYPOGRAPHY.some((p) => p.test(base))) {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'raw-typography',
            suggestion: 'Use semantic typography tokens (text-heading-*, text-body, text-body-small, text-caption, text-label).',
          });
        }

        if (/\b(sm|md|lg|xl|2xl):text-/.test(raw)) {
          violations.push({
            file: filePath,
            line,
            className: raw,
            type: 'responsive-typography',
            suggestion: 'Avoid manual responsive typography utilities; use semantic typography tokens that already encode responsive sizes.',
          });
        }
    }
  }

  return violations;
}

async function main() {
  const { pattern, reportOnly, allowDarkVariant } = parseArgs(process.argv);

  const files = await glob(pattern, { ignore: IGNORE_GLOBS });

  if (files.length === 0) {
    console.log(`design-system-verify: no files matched pattern: ${pattern}`);
    process.exit(0);
  }

  const allViolations: Violation[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    allViolations.push(...scanContent(file, content, allowDarkVariant));
  }

  if (allViolations.length === 0) {
    console.log(`design-system-verify: OK (pattern: ${pattern})`);
    process.exit(0);
  }

  const byFile = new Map<string, Violation[]>();
  for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file)!.push(v);
  }

  console.error(`design-system-verify: found ${allViolations.length} violation(s) (pattern: ${pattern})`);

  for (const [file, violations] of byFile) {
    console.error(`\n${file}`);
    for (const v of violations) {
      console.error(`  Line ${v.line}: ${v.className}  [${v.type}]`);
      console.error(`    Suggestion: ${v.suggestion}`);
    }
  }

  if (reportOnly) {
    console.log('\ndesign-system-verify: report-only mode (not failing build)');
    process.exit(0);
  }

  process.exit(1);
}

main().catch((err) => {
  console.error('design-system-verify: failed to run');
  console.error(err);
  process.exit(1);
});

/**
 * Design System Verification (CSS)
 *
 * Purpose:
 * - Prevent hardcoded colors/values in runtime CSS entrypoints.
 * - Keep theme entrypoints semantic and token-driven.
 *
 * Usage:
 *   npx tsx scripts/design-system-verify-css.ts
 *   npx tsx scripts/design-system-verify-css.ts --pattern "src/app/globals.css" --report-only
 */

import * as fs from 'fs';
import { glob } from 'glob';

type ViolationType =
  | 'hardcoded-hex'
  | 'hardcoded-rgb'
  | 'hardcoded-black-white'
  | 'transition-all'
  | 'media-typography';

interface Violation {
  file: string;
  line: number;
  excerpt: string;
  type: ViolationType;
  suggestion: string;
}

type Args = {
  pattern: string;
  reportOnly: boolean;
  summary: boolean;
  json: boolean;
};

const DEFAULT_PATTERN = 'src/app/globals.css';

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

function parseArgs(argv: string[]): Args {
  const args: Args = {
    pattern: DEFAULT_PATTERN,
    reportOnly: false,
    summary: false,
    json: false,
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
    if (value === '--summary') {
      args.summary = true;
      continue;
    }
    if (value === '--json') {
      args.json = true;
      continue;
    }
  }

  return args;
}

function stripBlockComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, '');
}

function isCssVarDeclarationLine(line: string): boolean {
  return line.trimStart().startsWith('--');
}

function scanCss(filePath: string, rawContent: string): Violation[] {
  const content = stripBlockComments(rawContent);
  const lines = content.split(/\r?\n/);

  const violations: Violation[] = [];

  const HEX = /#[0-9a-fA-F]{3,8}\b/g;
  const RGB_FN = /rgba?\(/g;
  const COLOR_KEYWORD_VALUE = /:\s*(white|black)\b/i;
  const TRANSITION_ALL = /transition\s*:\s*all\b/i;
  const TYPO_PROPS = /\b(font-size|line-height|letter-spacing|font-weight)\s*:/i;

  let braceDepth = 0;
  let mediaBraceDepthStart: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Update block depth using a simple brace counter.
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }

    if (trimmed.startsWith('@media')) {
      mediaBraceDepthStart = braceDepth;
    }

    const inMedia = mediaBraceDepthStart !== null;
    if (inMedia && braceDepth < (mediaBraceDepthStart ?? 0)) {
      mediaBraceDepthStart = null;
    }

    // Ignore empty lines
    if (!trimmed) continue;

    // 1) Hardcoded hex colors (outside comments)
    if (!isCssVarDeclarationLine(line)) {
      const hexMatches = line.match(HEX);
      if (hexMatches) {
        for (const match of hexMatches) {
          violations.push({
            file: filePath,
            line: lineNumber,
            excerpt: match,
            type: 'hardcoded-hex',
            suggestion: 'Avoid hardcoded hex colors in runtime CSS. Prefer tokens or numeric RGB variables.',
          });
        }
      }
    }

    // 2) Hardcoded rgb()/rgba() usage.
    // Allow: rgb(var(--...)) and any rgb() used inside CSS variable declarations (token definitions).
    if (RGB_FN.test(line)) {
      if (!isCssVarDeclarationLine(line) && !/rgba?\(\s*var\(--/i.test(line)) {
        violations.push({
          file: filePath,
          line: lineNumber,
          excerpt: 'rgb()/rgba()',
          type: 'hardcoded-rgb',
          suggestion: 'Avoid hardcoded rgb()/rgba() in rules; prefer rgb(var(--token)) or Tailwind semantic tokens.',
        });
      }
    }

    // 3) Hardcoded white/black keyword as a CSS value.
    if (!isCssVarDeclarationLine(line) && COLOR_KEYWORD_VALUE.test(line) && !/rgba?\(\s*var\(--/i.test(line)) {
      const m = line.match(COLOR_KEYWORD_VALUE);
      if (m?.[1]) {
        violations.push({
          file: filePath,
          line: lineNumber,
          excerpt: m[1],
          type: 'hardcoded-black-white',
          suggestion: 'Avoid hardcoded `white`/`black` values; use semantic tokens or theme variables.',
        });
      }
    }

    // 4) transition: all
    if (TRANSITION_ALL.test(line)) {
      violations.push({
        file: filePath,
        line: lineNumber,
        excerpt: 'transition: all',
        type: 'transition-all',
        suggestion: 'Avoid `transition: all`; use targeted transitions (colors/shadow/transform/opacity).',
      });
    }

    // 5) @media-driven typography
    if (inMedia && !isCssVarDeclarationLine(line) && TYPO_PROPS.test(line)) {
      violations.push({
        file: filePath,
        line: lineNumber,
        excerpt: trimmed,
        type: 'media-typography',
        suggestion: 'Avoid responsive typography defined inside @media; prefer semantic typography tokens.',
      });
    }
  }

  return violations;
}

function printSummary(violations: Violation[]) {
  const byType = new Map<ViolationType, number>();
  const byFile = new Map<string, number>();

  for (const v of violations) {
    byType.set(v.type, (byType.get(v.type) ?? 0) + 1);
    byFile.set(v.file, (byFile.get(v.file) ?? 0) + 1);
  }

  const topFiles = Array.from(byFile.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const types = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);

  console.log('\nTop violating files (top 20):');
  for (const [file, count] of topFiles) {
    console.log(`  ${count.toString().padStart(4, ' ')}  ${file}`);
  }

  console.log('\nViolation types:');
  for (const [type, count] of types) {
    console.log(`  ${count.toString().padStart(4, ' ')}  ${type}`);
  }
}

async function main() {
  const { pattern, reportOnly, summary, json } = parseArgs(process.argv);

  const files = await glob(pattern, { ignore: IGNORE_GLOBS });

  if (files.length === 0) {
    console.log(`design-system-verify:css: no files matched pattern: ${pattern}`);
    process.exit(0);
  }

  const allViolations: Violation[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf-8');
    allViolations.push(...scanCss(file, raw));
  }

  if (allViolations.length === 0) {
    console.log(`design-system-verify:css: OK (pattern: ${pattern})`);
    process.exit(0);
  }

  if (json) {
    console.log(JSON.stringify({ pattern, violations: allViolations }, null, 2));
    if (reportOnly) process.exit(0);
    process.exit(1);
  }

  console.error(`design-system-verify:css: found ${allViolations.length} violation(s) (pattern: ${pattern})`);

  if (summary) {
    printSummary(allViolations);
    if (reportOnly) {
      console.log('design-system-verify:css: report-only mode (not failing build)');
      process.exit(0);
    }
    process.exit(1);
  }

  const byFile = new Map<string, Violation[]>();
  for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file)!.push(v);
  }

  for (const [file, violations] of byFile) {
    console.error(`\n${file}`);
    for (const v of violations) {
      console.error(`  Line ${v.line}: ${v.excerpt}  [${v.type}]`);
      console.error(`    Suggestion: ${v.suggestion}`);
    }
  }

  if (reportOnly) {
    console.log('\ndesign-system-verify:css: report-only mode (not failing build)');
    process.exit(0);
  }

  process.exit(1);
}

main().catch((err) => {
  console.error('design-system-verify:css failed:', err);
  process.exit(1);
});

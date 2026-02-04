/**
 * Design System Verification (Enforcement Gate)
 *
 * Purpose:
 * - Prevent new UI/component work from introducing hardcoded values or non-semantic Tailwind patterns.
 * - Keep the design system enforceable for humans + AI/codegen.
 *
 * Default scope is intentionally narrow (new UI primitives only).
 *
 * Usage:
 *   npx tsx scripts/design-system-verify.ts
 *   npx tsx scripts/design-system-verify.ts --pattern "<glob pattern>" --report-only
 *   npx tsx scripts/design-system-verify.ts --pattern "<glob pattern>" --report-only --summary
 *   npx tsx scripts/design-system-verify.ts --pattern "<glob pattern>" --json
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

const HARDCODED_BLACK_WHITE = /\b(bg|text|border|ring|outline|divide)-(black|white)(\b|\/)/;

const TAILWIND_ARBITRARY_VALUE = /^[-\w]+-\[[^\]]+\]$/;
const TAILWIND_ARBITRARY_PROPERTY = /^\[[^\]]+:[^\]]+\]$/;

const RAW_TYPOGRAPHY = [
  /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/,
  /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/,
];

type Args = {
  pattern: string;
  reportOnly: boolean;
  allowDarkVariant: boolean;
  summary: boolean;
  json: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    pattern: DEFAULT_PATTERN,
    reportOnly: false,
    allowDarkVariant: false,
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
    if (value === '--allow-dark') {
      args.allowDarkVariant = true;
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
  if (text.length < 3) return false;

  // Heuristic: must contain at least one Tailwind-like token.
  return /\b(bg-|text-|border-|ring-|shadow-|rounded-|flex\b|grid\b|items-|justify-|gap-|space-|p-|m-|w-|h-|min-h-|max-h-|max-w-|min-w-|overflow-|hover:|focus:|focus-visible:|disabled:|sm:|md:|lg:|xl:|2xl:)\b/.test(
    text
  );
}

function extractClassStringCandidates(filePath: string, content: string): ClassStringCandidate[] {
  const candidates: ClassStringCandidate[] = [];
  const seen = new Set<string>();

  function pushCandidate(classString: string, line: number) {
    if (!looksLikeClassList(classString)) return;
    const key = `${line}::${classString}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ classString, line });
  }

  function collectStaticStringSegmentsFromExpression(expr: ts.Expression, out: string[]) {
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      out.push(expr.text);
      return;
    }

    if (ts.isTemplateExpression(expr)) {
      out.push(expr.head.text);
      for (const span of expr.templateSpans) {
        out.push(span.literal.text);
      }
      return;
    }

    if (ts.isParenthesizedExpression(expr)) {
      collectStaticStringSegmentsFromExpression(expr.expression, out);
      return;
    }

    if (ts.isAsExpression(expr) || ts.isTypeAssertionExpression(expr)) {
      collectStaticStringSegmentsFromExpression(expr.expression, out);
      return;
    }

    if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      collectStaticStringSegmentsFromExpression(expr.left, out);
      collectStaticStringSegmentsFromExpression(expr.right, out);
      return;
    }

    if (ts.isConditionalExpression(expr)) {
      collectStaticStringSegmentsFromExpression(expr.whenTrue, out);
      collectStaticStringSegmentsFromExpression(expr.whenFalse, out);
      return;
    }

    if (ts.isCallExpression(expr)) {
      for (const arg of expr.arguments) {
        if (ts.isExpression(arg)) collectStaticStringSegmentsFromExpression(arg, out);
      }
      return;
    }

    if (ts.isArrayLiteralExpression(expr)) {
      for (const element of expr.elements) {
        if (ts.isExpression(element)) collectStaticStringSegmentsFromExpression(element, out);
      }
      return;
    }

    if (ts.isObjectLiteralExpression(expr)) {
      for (const prop of expr.properties) {
        if (ts.isPropertyAssignment(prop)) {
          if (ts.isStringLiteral(prop.name)) {
            out.push(prop.name.text);
          }
          if (ts.isExpression(prop.initializer)) {
            collectStaticStringSegmentsFromExpression(prop.initializer, out);
          }
        }
      }
    }
  }

  // 1) Inline className="..." and className={..."..."...}
  for (const regex of CLASSNAME_REGEXES) {
    for (const match of content.matchAll(regex)) {
      const classString = match[1];
      const matchIndex = match.index ?? 0;
      const line = getLineNumberFromIndex(content, matchIndex);
      pushCandidate(classString, line);
    }
  }

  // 2) Strings stored in variables/cva variants/etc.
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node: ts.Node) {
    // Base case: string literals (variables, cva variants, etc)
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const value = node.text;
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      pushCandidate(value, line + 1);
    }

    // Template strings with substitutions: scan the static literal segments.
    if (ts.isTemplateExpression(node)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      pushCandidate(node.head.text, line + 1);
      for (const span of node.templateSpans) {
        const literalText = span.literal.text;
        const { line: spanLine } = sourceFile.getLineAndCharacterOfPosition(span.literal.getStart(sourceFile));
        pushCandidate(literalText, spanLine + 1);
      }
    }

    // className={...} expressions: collect any static strings contained within.
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && node.name.text === 'className' && node.initializer) {
      const init = node.initializer;
      const { line } = sourceFile.getLineAndCharacterOfPosition(init.getStart(sourceFile));

      if (ts.isStringLiteral(init)) {
        pushCandidate(init.text, line + 1);
      }

      if (ts.isJsxExpression(init) && init.expression) {
        const parts: string[] = [];
        collectStaticStringSegmentsFromExpression(init.expression, parts);
        for (const part of parts) pushCandidate(part, line + 1);
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
          suggestion:
            'Use targeted transitions: transition-colors, transition-shadow, transition-transform, transition-opacity.',
        });
      }

      if (HARDCODED_TAILWIND_COLOR.test(base)) {
        violations.push({
          file: filePath,
          line,
          className: raw,
          type: 'hardcoded-tailwind-color',
          suggestion:
            'Use semantic tokens like bg-background, bg-surface, text-foreground, border-border, text-muted-foreground.',
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
          suggestion:
            'Avoid manual responsive typography utilities; use semantic typography tokens that already encode responsive sizes.',
        });
      }
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
  const { pattern, reportOnly, allowDarkVariant, summary, json } = parseArgs(process.argv);

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

  if (json) {
    console.log(JSON.stringify({ pattern, violations: allViolations }, null, 2));
    if (reportOnly) process.exit(0);
    process.exit(1);
  }

  console.error(`design-system-verify: found ${allViolations.length} violation(s) (pattern: ${pattern})`);

  if (summary) {
    printSummary(allViolations);
    if (reportOnly) {
      console.log('design-system-verify: report-only mode (not failing build)');
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
  console.error('design-system-verify failed:', err);
  process.exit(1);
});

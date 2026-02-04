/**
 * SolarConnect Codemod (Phase 2)
 *
 * Goal:
 * - Convert SolarConnect-style raw Tailwind class patterns into SolarMatch semantic tokens.
 * - Keep changes safe + repeatable.
 * - Default is dry-run; use --write to apply.
 *
 * Usage:
 *   npx tsx scripts/solarconnect-codemod.ts
 *   npx tsx scripts/solarconnect-codemod.ts --pattern "<glob pattern for files>"
 *   npx tsx scripts/solarconnect-codemod.ts --write --pattern "<glob pattern for files>"
 */

import { glob } from 'glob';
import { Project, SyntaxKind, Node } from 'ts-morph';

type Args = {
  pattern: string;
  write: boolean;
  verbose: boolean;
};

const DEFAULT_PATTERN = 'src/components/solarconnect/**/*.{js,jsx,ts,tsx}';

const IGNORE_GLOBS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  'out/**',
  'coverage/**',
  'specs/**',
  'backup/**',
  'backup-*/**',
];

function parseArgs(argv: string[]): Args {
  const args: Args = {
    pattern: DEFAULT_PATTERN,
    write: false,
    verbose: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const value = argv[i];

    if (value === '--pattern' && argv[i + 1]) {
      args.pattern = argv[i + 1];
      i++;
      continue;
    }

    if (value === '--write') {
      args.write = true;
      continue;
    }

    if (value === '--dry-run') {
      args.write = false;
      continue;
    }

    if (value === '--verbose') {
      args.verbose = true;
      continue;
    }
  }

  return args;
}

function looksLikeClassList(value: string): boolean {
  const text = value.trim();
  if (text.length < 6) return false;
  if (!/\s/.test(text)) return false;

  return /\b(bg-|text-|border-|ring-|shadow-|rounded-|flex\b|grid\b|items-|justify-|gap-|space-|p-|m-|w-|h-|hover:|focus:|focus-visible:|disabled:|sm:|md:|lg:|xl:|2xl:)\b/.test(
    text
  );
}

function splitPrefixes(token: string): { prefixes: string[]; base: string } {
  const parts = token.split(':');
  if (parts.length === 1) return { prefixes: [], base: token };
  const base = parts[parts.length - 1] ?? token;
  const prefixes = parts.slice(0, -1);
  return { prefixes, base };
}

function joinToken(prefixes: string[], base: string): string {
  if (prefixes.length === 0) return base;
  return `${prefixes.join(':')}:${base}`;
}

function isRawTypographyToken(base: string): boolean {
  return (
    /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(base) ||
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(base) ||
    /^(sm|md|lg|xl|2xl):text-/.test(base)
  );
}

function isResponsiveTextToken(token: string): boolean {
  return /\b(sm|md|lg|xl|2xl):text-/.test(token);
}

function isFontWeightToken(base: string): boolean {
  return /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(base);
}

function dedupePreserveOrder(tokens: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function escapeForTemplateLiteral(raw: string): string {
  // Ensure reconstructed template literals stay syntactically valid.
  return raw.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function transformToken(rawToken: string): string[] {
  const token = rawToken.trim();
  if (!token) return [];

  const { prefixes, base } = splitPrefixes(token);

  const isFocusRingContext = prefixes.includes('focus') || prefixes.includes('focus-visible');

  // 1) Fix transition-all (disallowed)
  if (base === 'transition-all') {
    return [
      joinToken(prefixes, 'transition-colors'),
      joinToken(prefixes, 'transition-shadow'),
      joinToken(prefixes, 'transition-transform'),
    ];
  }

  // 2) SolarConnect common arbitrary values
  if (base === 'text-[10px]') return [joinToken(prefixes, 'text-micro')];
  if (base === 'scale-[1.02]') return [joinToken(prefixes, 'scale-102')];

  // 3) Brand scale → semantic accent
  const brandMatch = base.match(/^(bg|text|border|ring|from|via|to)-brand-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (brandMatch) {
    const kind = brandMatch[1];
    const shade = brandMatch[2];
    const alpha = brandMatch[3];

    // Heuristic: 500 = base accent, 600+ = hover-ish
    const semanticBase =
      kind === 'bg' && (shade === '600' || shade === '700')
        ? 'bg-accent-hover'
        : kind === 'bg'
          ? 'bg-accent'
          : kind === 'text'
            ? 'text-accent'
            : kind === 'border'
              ? 'border-accent'
              : kind === 'ring'
                ? 'ring-accent'
                : kind === 'from'
                  ? 'from-accent'
                  : kind === 'via'
                    ? 'via-accent'
                    : 'to-accent';

    const mapped = alpha ? `${semanticBase}/${alpha}` : semanticBase;
    return [joinToken(prefixes, mapped)];
  }

  // 3b) Status colors (prototype hardcodes red/green/yellow/blue) → semantic status tokens
  const statusMatch = base.match(
    /^(bg|text|border|ring|from|via|to)-(red|green|emerald|lime|yellow|amber|orange|blue|sky|cyan)-(\d{2,3})(?:\/(\d{1,3}))?$/
  );
  if (statusMatch) {
    const kind = statusMatch[1];
    const family = statusMatch[2];
    const alpha = statusMatch[4];

    const statusKey =
      family === 'red'
        ? 'error'
        : family === 'green' || family === 'emerald' || family === 'lime'
          ? 'success'
          : family === 'yellow' || family === 'amber' || family === 'orange'
            ? 'warning'
            : 'info';

    const semanticBase =
      kind === 'bg'
        ? `bg-${statusKey}`
        : kind === 'text'
          ? `text-${statusKey}`
          : kind === 'border'
            ? `border-${statusKey}`
            : kind === 'ring'
              ? `ring-${statusKey}`
              : kind === 'from'
                ? `from-${statusKey}`
                : kind === 'via'
                  ? `via-${statusKey}`
                  : `to-${statusKey}`;

    const mapped = alpha ? `${semanticBase}/${alpha}` : semanticBase;
    return [joinToken(prefixes, mapped)];
  }

  // Colored shadows (e.g., shadow-red-500/20) → semantic shadow token
  const coloredShadow = base.match(/^shadow-(red|green|emerald|lime|yellow|amber|orange|blue|sky|cyan)-(\d{2,3})\/(\d{1,3})$/);
  if (coloredShadow) {
    return [joinToken(prefixes, 'shadow-button')];
  }

  // 4) Replace hardcoded white/black usage → semantic
  const whiteBlackMatch = base.match(/^(bg|text|border)-(white|black)(?:\/(\d{1,3}))?$/);
  if (whiteBlackMatch) {
    const kind = whiteBlackMatch[1];
    const wb = whiteBlackMatch[2];
    const alpha = whiteBlackMatch[3];

    // White/black are not theme-aware. Prefer semantic tokens.
    const mappedBase =
      kind === 'text'
        ? wb === 'white'
          ? 'text-foreground-secondary'
          : 'text-foreground'
        : kind === 'bg'
          ? wb === 'white'
            ? 'bg-surface'
            : 'bg-background'
          : wb === 'white'
            ? 'border-border'
            : 'border-border';

    const mapped = alpha ? `${mappedBase}/${alpha}` : mappedBase;
    return [joinToken(prefixes, mapped)];
  }

  // 5) Neutral/slate scales → semantic (limited, safe-ish defaults)
  // Text
  const textSlate = base.match(/^text-(slate|neutral)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (textSlate) {
    const shade = Number(textSlate[2]);
    const alpha = textSlate[3];

    let mapped = 'text-foreground';
    if (shade <= 200) mapped = 'text-foreground-secondary';
    else if (shade === 300) mapped = 'text-icon';
    else if (shade >= 600) mapped = 'text-foreground-muted';

    const withAlpha = alpha ? `${mapped}/${alpha}` : mapped;
    return [joinToken(prefixes, withAlpha)];
  }

  // Background
  const bgSlate = base.match(/^bg-(slate|neutral)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (bgSlate) {
    const shade = Number(bgSlate[2]);
    const alpha = bgSlate[3];

    let mapped = 'bg-surface';
    if (shade >= 900) mapped = 'bg-background';
    else if (shade >= 800) mapped = 'bg-surface';

    const withAlpha = alpha ? `${mapped}/${alpha}` : mapped;
    return [joinToken(prefixes, withAlpha)];
  }

  // Ring (focus rings in prototype often use slate scales)
  const ringSlate = base.match(/^ring-(slate|neutral)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (ringSlate) {
    const alpha = ringSlate[3];
    const mappedBase = isFocusRingContext ? 'ring-accent' : 'ring-border';
    const mapped = alpha ? `${mappedBase}/${alpha}` : mappedBase;
    return [joinToken(prefixes, mapped)];
  }

  // Gradients (prototype uses slate scales)
  const gradSlate = base.match(/^(from|via|to)-(slate|neutral)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (gradSlate) {
    const kind = gradSlate[1];
    const alpha = gradSlate[4];
    const mappedBase = kind === 'via' ? 'via-surface' : 'from-background';
    const mapped = alpha ? `${mappedBase}/${alpha}` : mappedBase;
    return [joinToken(prefixes, mapped)];
  }

  // Border
  const borderSlate = base.match(/^border-(slate|neutral)-(\d{2,3})(?:\/(\d{1,3}))?$/);
  if (borderSlate) {
    const alpha = borderSlate[3];
    const mapped = alpha ? `border-border/${alpha}` : 'border-border';
    return [joinToken(prefixes, mapped)];
  }

  // 6) Brand glow shadows
  const shadowBrand = base.match(/^shadow-brand-500\/(\d{1,3})$/);
  if (shadowBrand) {
    const alpha = Number(shadowBrand[1]);
    const mapped = alpha >= 28 ? 'shadow-brand-glow-md' : 'shadow-brand-glow-sm';
    return [joinToken(prefixes, mapped)];
  }

  return [token];
}

function chooseSemanticTypography(originalTokens: string[]): string | null {
  const tokens = originalTokens;

  const isButtonLike =
    tokens.some((t) => t === 'inline-flex') &&
    tokens.some((t) => t.startsWith('items-')) &&
    tokens.some((t) => t.startsWith('justify-')) &&
    tokens.some((t) => t.startsWith('px-') || t.startsWith('py-')) &&
    tokens.some((t) => t.startsWith('rounded'));

  if (isButtonLike) return 'text-button';

  const has = (re: RegExp) => tokens.some((t) => re.test(t));

  // Headings (SolarConnect typical patterns)
  if (has(/(^|:)text-(4xl|5xl|6xl)$/)) return 'text-heading-1';
  if (has(/(^|:)text-(3xl|4xl)$/) && has(/(^|:)font-(bold|extrabold)/)) return 'text-heading-2';
  if (has(/(^|:)text-2xl$/)) return 'text-heading-3';
  if (has(/(^|:)text-xl$/) && has(/(^|:)font-(semibold|bold)/)) return 'text-heading-4';

  // Body sizes
  if (has(/(^|:)text-lg$/) || has(/(^|:)text-xl$/)) return 'text-body-large';
  if (has(/(^|:)text-base$/)) return 'text-body';
  if (has(/(^|:)text-sm$/)) return 'text-body-small';
  if (has(/(^|:)text-xs$/)) return 'text-caption';
  if (has(/text-\[10px\]/)) return 'text-micro';

  return null;
}

function transformClassString(classString: string): { value: string; changed: boolean } {
  const originalTokens = classString.split(/\s+/).filter(Boolean);

  // 0) Special-case: glass surfaces
  const hasBackdropBlur = originalTokens.some((t) => /(^|:)backdrop-blur/.test(t));
  const hasWhiteGlass = originalTokens.some((t) => /(^|:)(bg|border)-white\//.test(t));
  const applyGlass = hasBackdropBlur && hasWhiteGlass;

  const typographyToken = chooseSemanticTypography(originalTokens);

  const alreadyHasSemanticTypography = originalTokens.some((t) => /^text-(heading-|body|body-large|body-small|caption|micro|label|button)\b/.test(t));

  const transformed: string[] = [];

  for (const token of originalTokens) {
    // Remove responsive text tokens (semantic typography handles responsiveness)
    if (isResponsiveTextToken(token)) continue;

    const { prefixes, base } = splitPrefixes(token);

    // Glass conversion: replace backdrop-blur + white overlays with surface-glass
    if (applyGlass) {
      if (/^backdrop-blur(-\w+)?$/.test(base)) continue;
      if (/^(bg|border)-white\/(\d{1,3})$/.test(base)) continue;
    }

    // Remove raw typography once we choose a semantic typography token
    if (typographyToken || alreadyHasSemanticTypography) {
      if (/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(base)) continue;
      if (base === 'text-[10px]') continue;
      if (isFontWeightToken(base)) continue;
    }

    // Transform common tokens
    const replaced = transformToken(token);
    transformed.push(...replaced);
  }

  if (applyGlass) {
    transformed.push('surface-glass');
  }

  if (typographyToken) {
    transformed.push(typographyToken);
  }

  const cleaned = dedupePreserveOrder(transformed).join(' ');
  return { value: cleaned, changed: cleaned !== classString };
}

function isCandidateNode(node: Node): boolean {
  const parent = node.getParent();

  // className="..." or className={'...'} etc
  if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
    const attr = parent.asKind(SyntaxKind.JsxAttribute);
    const name = attr?.getNameNode().getText();
    if (name === 'className') return true;
  }

  // cn("..."), clsx("..."), cva("...")
  if (parent && parent.getKind() === SyntaxKind.CallExpression) {
    const call = parent.asKind(SyntaxKind.CallExpression);
    const exprText = call?.getExpression().getText() ?? '';
    if (['cn', 'clsx', 'cva'].includes(exprText)) return true;
  }

  // Allow typical variant objects / variables if it looks like Tailwind classes.
  return true;
}

async function main() {
  const args = parseArgs(process.argv);

  const files = await glob(args.pattern, { ignore: IGNORE_GLOBS });

  if (files.length === 0) {
    console.log(`solarconnect-codemod: no files matched pattern: ${args.pattern}`);
    process.exit(0);
  }

  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
    skipAddingFilesFromTsConfig: true,
  });

  project.addSourceFilesAtPaths(files);

  let touchedFiles = 0;
  let changedStrings = 0;

  for (const sourceFile of project.getSourceFiles()) {
    let fileChanged = false;

    const literals = [
      ...sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral),
      ...sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral),
    ];

    for (const lit of literals) {
      const text = lit.getLiteralText();
      if (!looksLikeClassList(text)) continue;
      if (!isCandidateNode(lit)) continue;

      const { value, changed } = transformClassString(text);
      if (!changed) continue;

      // Update literal content
      lit.setLiteralValue(value);
      fileChanged = true;
      changedStrings++;

      if (args.verbose) {
        const pos = lit.getStartLineNumber();
        console.log(`- ${sourceFile.getFilePath()}:${pos} updated class string`);
      }
    }

    // Template literals with interpolations: className={`... ${expr} ...`}
    const templateExprs = sourceFile.getDescendantsOfKind(SyntaxKind.TemplateExpression);
    for (const tpl of templateExprs) {
      const headText = tpl.getHead().getLiteralText();
      const newHead = looksLikeClassList(headText) ? transformClassString(headText).value : headText;

      const spans = tpl.getTemplateSpans();
      let anyChanged = newHead !== headText;
      const spanParts: string[] = [];

      for (const span of spans) {
        const exprText = span.getExpression().getText();
        const litText = span.getLiteral().getLiteralText();
        const newLit = looksLikeClassList(litText) ? transformClassString(litText).value : litText;
        if (newLit !== litText) anyChanged = true;
        spanParts.push(`\${${exprText}}${escapeForTemplateLiteral(newLit)}`);
      }

      if (!anyChanged) continue;

      const rebuilt = `\`${escapeForTemplateLiteral(newHead)}${spanParts.join('')}\``;
      tpl.replaceWithText(rebuilt);
      fileChanged = true;
      changedStrings++;

      if (args.verbose) {
        console.log(`- ${sourceFile.getFilePath()}:${tpl.getStartLineNumber()} updated template expression`);
      }
    }

    if (fileChanged) {
      touchedFiles++;
      if (args.write) {
        await sourceFile.save();
      }
    }
  }

  const mode = args.write ? 'WRITE' : 'DRY-RUN';
  console.log(`solarconnect-codemod (${mode}) complete:`);
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- Files touched: ${touchedFiles}`);
  console.log(`- Class strings updated: ${changedStrings}`);

  if (!args.write) {
    console.log('Tip: re-run with --write to apply changes.');
  }
}

main().catch((err) => {
  console.error('solarconnect-codemod failed:', err);
  process.exit(1);
});

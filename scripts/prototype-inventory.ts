/**
 * Prototype Tailwind Inventory (TXXX)
 *
 * Scans the prototype source-of-truth folder for Tailwind utility usage.
 * Outputs a markdown report intended to drive DS token + semantic contract creation.
 *
 * Usage:
 *   npx tsx scripts/prototype-inventory.ts
 *   npx tsx scripts/prototype-inventory.ts --root "DOC/FRONTEND MIGRATION/solarconnect (3)" --out "DOC/FRONTEND MIGRATION/protoinventory.md"
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

type ClassRecord = {
  raw: string;
  base: string;
  variants: string[];
  file: string;
  line: number;
};

type Counts = Map<string, number>;

const DEFAULT_ROOT = path.join('DOC', 'FRONTEND MIGRATION', 'solarconnect (3)');
const DEFAULT_OUT = path.join('DOC', 'FRONTEND MIGRATION', 'protoinventory.md');

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root' || a === '--out') {
      args.set(a, argv[i + 1] ?? '');
      i++;
    }
  }
  return {
    root: args.get('--root') || DEFAULT_ROOT,
    out: args.get('--out') || DEFAULT_OUT,
  };
}

function inc(map: Counts, key: string, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

function toRel(p: string) {
  return p.replace(/\\/g, '/');
}

function splitVariants(utility: string): { base: string; variants: string[] } {
  const normalized = utility.startsWith('!') ? utility.slice(1) : utility;
  const parts = normalized.split(':').filter(Boolean);
  if (parts.length <= 1) return { base: normalized, variants: [] };
  return { base: parts[parts.length - 1]!, variants: parts.slice(0, -1) };
}

function isLikelyTailwindToken(token: string) {
  if (!token) return false;
  if (token === '...') return false;
  if (token.includes('{') || token.includes('}') || token.includes('(') || token.includes(')')) return false;
  if (token.startsWith('[') && token.endsWith(']')) return true; // arbitrary values
  return /^[!a-zA-Z0-9_\-\[\]./:]+$/.test(token);
}

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length;
}

function extractClassStringsFromContent(content: string): Array<{ value: string; index: number }> {
  const results: Array<{ value: string; index: number }> = [];
  const patterns: RegExp[] = [
    /\bclassName\s*=\s*"([^\"]*)"/g,
    /\bclassName\s*=\s*'([^']*)'/g,
    /\bclassName\s*=\s*`([^`]*)`/g,
    /\bclass\s*=\s*"([^\"]*)"/g,
    /\bclass\s*=\s*'([^']*)'/g,
    /\bclass\s*=\s*`([^`]*)`/g,
    /\bclassName\s*=\s*\{\s*"([^\"]*)"\s*\}/g,
    /\bclassName\s*=\s*\{\s*'([^']*)'\s*\}/g,
    /\bclassName\s*=\s*\{\s*`([^`]*)`\s*\}/g,
  ];

  for (const rx of patterns) {
    for (const m of content.matchAll(rx)) {
      const value = m[1] ?? '';
      const idx = m.index ?? 0;
      if (value) results.push({ value, index: idx });
    }
  }

  return results;
}

function categorizeBase(base: string): string {
  if (/^text-(left|center|right|justify)$/.test(base)) return 'Layout';
  if (/^outline-none$/.test(base)) return 'Surface';

  const isTextSize = /^(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|text-\[[^\]]+\])$/.test(base);
  if (isTextSize || /^(font-|leading-|tracking-|uppercase|lowercase|capitalize|truncate|line-clamp-)/.test(base)) {
    return 'Typography';
  }
  if (/^(bg-|text-|border-|ring-|from-|to-|via-|fill-|stroke-|decoration-)/.test(base)) return 'Color';
  if (/^(p[trblxy]?\-|m[trblxy]?\-|gap\-|space-[xy]\-|inset-|top-|left-|right-|bottom-)/.test(base)) return 'Spacing';
  if (/^(w-|h-|min-w-|max-w-|min-h-|max-h-|aspect-)/.test(base)) return 'Sizing';
  if (/^(flex|grid|block|inline|hidden|items-|justify-|content-|self-|place-|col-|row-|order-|basis-|grow|shrink|container)/.test(base)) return 'Layout';
  if (/^(rounded|border(?!-[a-z]+\d)|shadow|ring(?!-[a-z]+\d))/ .test(base)) return 'Surface';
  if (/^(transition|duration-|ease-|animate-)/.test(base)) return 'Motion';
  if (/^(hover|focus|active|disabled|group|aria|data|peer)/.test(base)) return 'State';
  return 'Other';
}

function topN(map: Counts, n: number): Array<[string, number]> {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function formatTable(rows: Array<[string, number]>, headerA: string, headerB: string) {
  let out = `| ${headerA} | ${headerB} |\n|---|---:|\n`;
  for (const [k, v] of rows) {
    out += `| \`${k}\` | ${v} |\n`;
  }
  return out;
}

async function main() {
  const { root, out } = parseArgs(process.argv.slice(2));

  const patterns = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js', '**/*.html'];
  const files = await glob(patterns, {
    cwd: root,
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
  });

  const classRecords: ClassRecord[] = [];

  for (const rel of files) {
    const abs = path.join(root, rel);
    const content = fs.readFileSync(abs, 'utf8');
    const classStrings = extractClassStringsFromContent(content);

    for (const entry of classStrings) {
      const tokens = entry.value.split(/\s+/).map((t) => t.trim()).filter(Boolean);
      for (const rawToken of tokens) {
        if (!isLikelyTailwindToken(rawToken)) continue;
        const { base, variants } = splitVariants(rawToken);
        classRecords.push({
          raw: rawToken,
          base,
          variants,
          file: toRel(path.join(root, rel)),
          line: lineNumberAt(content, entry.index),
        });
      }
    }
  }

  const uniqueRaw = new Map<string, number>();
  const uniqueBase = new Map<string, number>();
  const variants = new Map<string, number>();
  const variantCombos = new Map<string, number>();
  const categories = new Map<string, Counts>();
  const examples = new Map<string, { file: string; line: number }>();

  for (const rec of classRecords) {
    inc(uniqueRaw, rec.raw);
    inc(uniqueBase, rec.base);

    if (rec.variants.length) {
      rec.variants.forEach((v) => inc(variants, v));
      inc(variantCombos, rec.variants.join(':'));
    }

    const cat = categorizeBase(rec.base);
    if (!categories.has(cat)) categories.set(cat, new Map());
    inc(categories.get(cat)!, rec.base);

    if (!examples.has(rec.base)) examples.set(rec.base, { file: rec.file, line: rec.line });
  }

  const scannedRoot = toRel(root);

  let md = '';
  md += `# Prototype Tailwind Inventory (SOT)\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;
  md += `## Source\n\n`;
  md += `- **Prototype root (SOT)**: \`${scannedRoot}\`\n`;
  md += `- **Files scanned**: ${files.length}\n`;
  md += `- **Total class tokens found**: ${classRecords.length}\n`;
  md += `- **Unique raw tokens**: ${uniqueRaw.size}\n`;
  md += `- **Unique base utilities** (variants stripped): ${uniqueBase.size}\n\n`;

  md += `## Variants / Breakpoints\n\n`;
  if (variants.size === 0) {
    md += `- No variant prefixes found.\n\n`;
  } else {
    md += formatTable(topN(variants, 50), 'Variant', 'Count') + '\n';
    md += `### Common Variant Combos\n\n`;
    md += formatTable(topN(variantCombos, 25), 'Variant combo', 'Count') + '\n';
  }

  const order = ['Typography', 'Color', 'Spacing', 'Sizing', 'Layout', 'Surface', 'Motion', 'Other'];
  md += `## Utilities By Category (Top)\n\n`;
  for (const cat of order) {
    const map = categories.get(cat);
    if (!map || map.size === 0) continue;
    md += `### ${cat}\n\n`;
    const rows = topN(map, 60).map(([k, v]) => {
      const ex = examples.get(k);
      const location = ex ? `${ex.file}:${ex.line}` : '';
      return [`${k} — ${location}`, v] as [string, number];
    });
    md += `| Utility (example location) | Count |\n|---|---:|\n`;
    for (const [k, v] of rows) {
      md += `| \`${k}\` | ${v} |\n`;
    }
    md += `\n`;
  }

  md += `## Notes (How To Use This Inventory)\n\n`;
  md += `- This file is **inventory only** — it lists what the prototype uses.\n`;
  md += `- Next step is a **DS gap report**: for each prototype utility (or combination), define the equivalent DS token/semantic class.\n`;
  md += `- Once DS tokens/classes exist, migrate app components by replacing raw utilities with DS semantic contracts (no hardcoding).\n`;

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md, 'utf8');

  console.log(`✅ Prototype inventory written to: ${out}`);
  console.log(`   - Root: ${root}`);
  console.log(`   - Files scanned: ${files.length}`);
  console.log(`   - Tokens: ${classRecords.length}`);
  console.log(`   - Unique raw: ${uniqueRaw.size}`);
  console.log(`   - Unique base: ${uniqueBase.size}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

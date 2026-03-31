/**
 * Prototype → DS Gap Report
 *
 * Produces an actionable, token-level diff between the prototype Tailwind SOT
 * (CDN config + utility usage) and the current Design System tokens.
 *
 * Usage:
 *   npx tsx scripts/prototype-ds-gap-report.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const PROTO_ROOT = path.join('DOC', 'FRONTEND MIGRATION', 'solarconnect (3)');
const PROTO_INDEX = path.join(PROTO_ROOT, 'index.html');
const DS_TOKENS = path.join('src', 'ds', 'styles', 'ds.tokens.css');
const OUT = path.join('DOC', 'FRONTEND MIGRATION', 'proto-ds-gap-report.md');

type Palette = Map<string, string>; // key=scale step, value=hex

type TokenCounts = Map<string, { count: number; example?: { file: string; line: number } }>;

function toRel(p: string) {
  return p.replace(/\\/g, '/');
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function parseTailwindPaletteFromIndexHtml(indexHtml: string, paletteName: 'brand' | 'slate'): Palette {
  const palette = new Map<string, string>();

  // Grab the palette block (very tolerant; this is an internal tool).
  const blockMatch = indexHtml.match(new RegExp(`${paletteName}\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\s*[,]?`, 'm'));
  if (!blockMatch) return palette;

  const block = blockMatch[1];
  for (const m of block.matchAll(/(\d+)\s*:\s*'\s*(#[0-9a-fA-F]{3,6})\s*'/g)) {
    palette.set(m[1], m[2].toLowerCase());
  }

  return palette;
}

function parseDsVarMap(css: string, varPrefix: string): Map<string, string> {
  const map = new Map<string, string>();
  // Example: --ds-palette-brand-500: #e46c1a;
  const rx = new RegExp(`--${varPrefix}-([a-zA-Z0-9_-]+)\\s*:\\s*([^;]+);`, 'g');
  for (const m of css.matchAll(rx)) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

function parseDsPalette(css: string, name: 'brand' | 'neutral'): Palette {
  const palette = new Map<string, string>();
  const rx = new RegExp(`--ds-palette-${name}-(\\d+):\\s*(#[0-9a-fA-F]{3,6})\\s*;`, 'g');
  for (const m of css.matchAll(rx)) {
    palette.set(m[1], m[2].toLowerCase());
  }
  return palette;
}

function parseDsFontSizes(css: string): Array<{ name: string; raw: string; px?: number }> {
  const out: Array<{ name: string; raw: string; px?: number }> = [];
  const rx = /--ds-font-size-([a-zA-Z0-9_-]+):\s*([^;]+);/g;
  for (const m of css.matchAll(rx)) {
    const name = m[1];
    const raw = m[2].trim();
    const rem = raw.endsWith('rem') ? Number.parseFloat(raw) : undefined;
    const px = Number.isFinite(rem) ? rem! * 16 : undefined;
    out.push({ name, raw, px });
  }
  return out;
}

function parseDsLineHeights(css: string): Map<string, number> {
  const out = new Map<string, number>();
  const rx = /--ds-line-height-([a-zA-Z0-9_-]+):\s*([^;]+);/g;
  for (const m of css.matchAll(rx)) {
    const v = Number.parseFloat(m[2]);
    if (Number.isFinite(v)) out.set(m[1], v);
  }
  return out;
}

function parseDsLetterSpacing(css: string): Map<string, string> {
  const out = new Map<string, string>();
  const rx = /--ds-letter-spacing-([a-zA-Z0-9_-]+):\s*([^;]+);/g;
  for (const m of css.matchAll(rx)) {
    out.set(m[1], m[2].trim());
  }
  return out;
}

function isLikelyUtilityToken(token: string) {
  if (!token) return false;
  if (token === '...') return false;
  if (token.includes('{') || token.includes('}') || token.includes('(') || token.includes(')')) return false;
  return /^[!a-zA-Z0-9_\-\[\]./:]+$/.test(token);
}

function splitVariants(utility: string): { base: string; variants: string[] } {
  const normalized = utility.startsWith('!') ? utility.slice(1) : utility;
  const parts = normalized.split(':').filter(Boolean);
  if (parts.length <= 1) return { base: normalized, variants: [] };
  return { base: parts[parts.length - 1]!, variants: parts.slice(0, -1) };
}

function extractClassStringsFromLine(line: string): string[] {
  const results: string[] = [];
  for (const match of line.matchAll(/\b(className|class)=(["'`])([^\2]+?)\2/g)) {
    results.push(match[3]);
  }
  for (const match of line.matchAll(/className=\{[^}]*(["'`])([^"'`]+?)\1[^}]*\}/g)) {
    results.push(match[2]);
  }
  return results;
}

function lineNumberAt(content: string, index: number): number {
  // 1-based
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

function incToken(map: TokenCounts, key: string, file: string, line: number) {
  const existing = map.get(key);
  if (!existing) {
    map.set(key, { count: 1, example: { file, line } });
    return;
  }
  existing.count++;
}

function topN(map: TokenCounts, n: number): Array<[string, number, string]> {
  return Array.from(map.entries())
    .map(([k, v]) => {
      const loc = v.example ? `${toRel(v.example.file)}:${v.example.line}` : '';
      return [k, v.count, loc] as [string, number, string];
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function mdTable(rows: Array<[string, number, string]>, headers: [string, string, string]) {
  let out = `| ${headers[0]} | ${headers[1]} | ${headers[2]} |\n|---|---:|---|\n`;
  for (const [a, b, c] of rows) {
    out += `| \`${a}\` | ${b} | \`${c}\` |\n`;
  }
  return out;
}

function formatPaletteDiff(proto: Palette, ds: Palette, title: string) {
  const steps = Array.from(new Set([...proto.keys(), ...ds.keys()])).sort((a, b) => Number(a) - Number(b));
  let out = `### ${title}\n\n`;
  out += `| Step | Prototype | DS | Status |\n|---:|---|---|---|\n`;
  for (const step of steps) {
    const p = proto.get(step);
    const d = ds.get(step);
    const status = p && d ? (p === d ? 'OK' : 'MISMATCH') : p ? 'MISSING_IN_DS' : 'EXTRA_IN_DS';
    out += `| ${step} | ${p ? `\`${p}\`` : ''} | ${d ? `\`${d}\`` : ''} | ${status} |\n`;
  }
  out += `\n`;
  return out;
}

async function main() {
  const indexHtml = readText(PROTO_INDEX);
  const protoBrand = parseTailwindPaletteFromIndexHtml(indexHtml, 'brand');
  const protoSlate = parseTailwindPaletteFromIndexHtml(indexHtml, 'slate');

  const dsCss = readText(DS_TOKENS);
  const dsBrand = parseDsPalette(dsCss, 'brand');
  const dsNeutral = parseDsPalette(dsCss, 'neutral');

  // Prototype utility scan
  const files = await glob(['**/*.{ts,tsx,js,jsx,html}'], {
    cwd: PROTO_ROOT,
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
  });

  const rawTokens: TokenCounts = new Map();
  const baseTokens: TokenCounts = new Map();
  const arbitraryTokens: TokenCounts = new Map();

  for (const rel of files) {
    const abs = path.join(PROTO_ROOT, rel);
    const content = readText(abs);

    const classStrings = extractClassStringsFromContent(content);
    for (const entry of classStrings) {
      const tokens = entry.value.split(/\s+/).map((t) => t.trim()).filter(Boolean);
      for (const token of tokens) {
        if (!isLikelyUtilityToken(token)) continue;
        incToken(rawTokens, token, abs, lineNumberAt(content, entry.index));

        const { base } = splitVariants(token);
        incToken(baseTokens, base, abs, lineNumberAt(content, entry.index));

        if (token.includes('[')) {
          incToken(arbitraryTokens, token, abs, lineNumberAt(content, entry.index));
        }
      }
    }
  }

  // Pull prototype typography targets (Tailwind defaults)
  const tailwindTextSizesPx: Record<string, number> = {
    'text-xs': 12,
    'text-sm': 14,
    'text-base': 16,
    'text-lg': 18,
    'text-xl': 20,
    'text-2xl': 24,
    'text-3xl': 30,
    'text-4xl': 36,
    'text-5xl': 48,
    'text-6xl': 60,
  };

  const usedTextSizes = Array.from(baseTokens.keys())
    .filter((k) => k in tailwindTextSizesPx)
    .sort((a, b) => tailwindTextSizesPx[a] - tailwindTextSizesPx[b]);

  const dsFontSizes = parseDsFontSizes(dsCss);
  const dsFontSizePxSet = new Set<number>();
  for (const s of dsFontSizes) {
    if (typeof s.px === 'number' && Number.isFinite(s.px)) {
      dsFontSizePxSet.add(Math.round(s.px * 1000) / 1000);
    }
  }

  const dsLineHeights = parseDsLineHeights(dsCss);
  const dsTracking = parseDsLetterSpacing(dsCss);

  const requiredTracking = new Map<string, string>([
    ['tracking-tight', '-0.025em'],
    ['tracking-wide', '0.025em'],
    ['tracking-wider', '0.05em'],
    ['tracking-widest', '0.1em'],
  ]);

  const requiredLeading = new Map<string, number>([
    ['leading-none', 1],
    ['leading-tight', 1.25],
    ['leading-snug', 1.375],
    ['leading-normal', 1.5],
    ['leading-relaxed', 1.625],
  ]);

  const usedTracking = Array.from(baseTokens.keys()).filter((k) => requiredTracking.has(k));
  const usedLeading = Array.from(baseTokens.keys()).filter((k) => requiredLeading.has(k));

  let md = '';
  md += `# Prototype → DS Gap Report\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;
  md += `## Inputs\n\n`;
  md += `- Prototype SOT: \`${toRel(PROTO_ROOT)}\` (Tailwind CDN config in \`${toRel(PROTO_INDEX)}\`)\n`;
  md += `- DS tokens: \`${toRel(DS_TOKENS)}\`\n\n`;

  md += `## Executive Summary (What’s Blocking “Prototype as DS”)\n\n`;
  md += `1. **Brand palette mismatch**: Prototype defines purple brand scale; DS currently defines an orange brand palette.\n`;
  md += `2. **Slate/neutral mismatch**: Prototype uses a custom slate scale (incl. slate-800/900/950); DS neutral scale does not match those hexes.\n`;
  md += `3. **Typography scale gaps**: Prototype relies on Tailwind sizes (12/14/16/18/20/24/36/60px etc). DS lacks several of these or uses different values.\n`;
  md += `4. **Tracking/leading gaps**: Prototype uses tracking-wider/widest and leading-none/snug/relaxed values that DS doesn’t fully encode.\n`;
  md += `5. **Arbitrary utilities**: Prototype uses custom shadows like \`shadow-[0_0_8px_rgba(...)]\` which require DS tokens/classes to avoid hardcoding.\n\n`;

  md += `## Color Palettes (Token-Level Diff)\n\n`;
  md += formatPaletteDiff(protoBrand, dsBrand, 'Brand (Prototype vs DS --ds-palette-brand-*)');
  md += formatPaletteDiff(protoSlate, dsNeutral, 'Slate (Prototype) vs Neutral (DS --ds-palette-neutral-*)');

  md += `## Typography Scale Gaps\n\n`;
  md += `### Prototype Text Sizes Used\n\n`;
  md += `| Utility | Tailwind px | Present in DS font-size set? |\n|---|---:|---|\n`;
  for (const util of usedTextSizes) {
    const px = tailwindTextSizesPx[util];
    const present = dsFontSizePxSet.has(px) ? 'YES' : 'NO';
    md += `| \`${util}\` | ${px} | ${present} |\n`;
  }
  md += `\n`;

  md += `### DS Font Sizes (Current)\n\n`;
  md += `| DS token | Raw | Approx px (@16px/rem) |\n|---|---|---:|\n`;
  dsFontSizes
    .sort((a, b) => (a.px ?? 0) - (b.px ?? 0))
    .forEach((t) => {
      md += `| \`--ds-font-size-${t.name}\` | \`${t.raw}\` | ${typeof t.px === 'number' ? Math.round(t.px * 1000) / 1000 : ''} |\n`;
    });
  md += `\n`;

  md += `## Letter-Spacing (Tracking)\n\n`;
  if (usedTracking.length === 0) {
    md += `- Prototype does not use tracking utilities beyond defaults (unexpected).\n\n`;
  } else {
    md += `| Utility | Prototype value | DS has exact token value? | DS tokens |\n|---|---|---|---|\n`;
    for (const k of usedTracking) {
      const expected = requiredTracking.get(k)!;
      const dsTokens = Array.from(dsTracking.entries()).map(([n, v]) => `${n}=${v}`).join(', ');
      const exact = Array.from(dsTracking.values()).some((v) => v.replace(/\s+/g, '') === expected.replace(/\s+/g, ''));
      md += `| \`${k}\` | \`${expected}\` | ${exact ? 'YES' : 'NO'} | \`${dsTokens}\` |\n`;
    }
    md += `\n`;
  }

  md += `## Line-Height (Leading)\n\n`;
  if (usedLeading.length === 0) {
    md += `- Prototype does not use leading utilities beyond defaults (unexpected).\n\n`;
  } else {
    md += `| Utility | Prototype value | DS has exact value? | DS line-heights |\n|---|---:|---|---|\n`;
    const dsList = Array.from(dsLineHeights.entries()).map(([n, v]) => `${n}=${v}`).join(', ');
    for (const k of usedLeading) {
      const expected = requiredLeading.get(k)!;
      const exact = Array.from(dsLineHeights.values()).some((v) => Math.abs(v - expected) < 0.0001);
      md += `| \`${k}\` | ${expected} | ${exact ? 'YES' : 'NO'} | \`${dsList}\` |\n`;
    }
    md += `\n`;
  }

  md += `## Arbitrary Utilities (Must Become DS Tokens/Classes)\n\n`;
  if (arbitraryTokens.size === 0) {
    md += `- None found.\n\n`;
  } else {
    md += mdTable(topN(arbitraryTokens, 50), ['Utility', 'Count', 'Example']);
    md += `\n`;
  }

  md += `## Highest-Impact Prototype Utilities (Top 60 Raw Tokens)\n\n`;
  md += mdTable(topN(rawTokens, 60), ['Raw token', 'Count', 'Example']);
  md += `\n`;

  md += `## Recommended DS Worklist (Prioritized)\n\n`;
  md += `1. **Replace DS brand palette** in \`ds.tokens.css\` with prototype \`brand\` scale from \`index.html\`.\n`;
  md += `2. **Add/align DS slate/neutral scale** to match prototype \`slate\` values (or introduce \`--ds-palette-slate-*\` and remap semantics).\n`;
  md += `3. **Add missing font sizes** to cover Tailwind defaults used (12, 14, 24, 36, 60px) and update semantic typography classes to use them.\n`;
  md += `4. **Add tracking tokens** for 0.05em and 0.1em and semantic classes for uppercase labels.\n`;
  md += `5. **Add leading tokens** matching Tailwind \`none/snug/relaxed\` where used (1, 1.375, 1.625).\n`;
  md += `6. **Convert arbitrary shadows** to DS tokens (e.g. hero indicator glow) and expose semantic classes.\n\n`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md, 'utf8');

  console.log(`✅ Gap report written to: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

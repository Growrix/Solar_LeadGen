import * as fs from 'fs';
import * as path from 'path';

type AuditResult = {
  generatedAt: string;
  rules: {
    keepGlobs: string[];
    removeRoots: string[];
    frozenModalHeuristics: string[];
  };
  totals: {
    srcFilesScanned: number;
    keepFiles: number;
    removeFiles: number;
    undecidedFiles: number;
  };
  keepFiles: string[];
  removeFiles: string[];
  undecidedFiles: string[];
  frozenModalEntryFiles: string[];
};

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const OUT_DIR = path.join(PROJECT_ROOT, 'DOC', 'Prompts', 'PROMPTS & TEMPLATES', 'FRONTEND', 'purge-audit');

const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.md', '.json']);

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function walk(dir: string): string[] {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'build' || entry.name === 'out') continue;
      out.push(...walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function isUnder(relPosix: string, prefixPosix: string): boolean {
  return relPosix === prefixPosix || relPosix.startsWith(prefixPosix + '/');
}

function readTextIfSmall(absPath: string, maxBytes = 512 * 1024): string | null {
  try {
    const st = fs.statSync(absPath);
    if (st.size > maxBytes) return null;
    return fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
}

function extractImports(sourceText: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+(?:type\s+)?[^;]*?from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const m of sourceText.matchAll(importRegex)) imports.push(m[1] ?? '');
  for (const m of sourceText.matchAll(requireRegex)) imports.push(m[1] ?? '');
  return imports.filter(Boolean);
}

function resolveImport(fromFileAbs: string, spec: string): string | null {
  // Only resolve internal imports.
  if (spec.startsWith('@/')) {
    const rel = spec.slice(2);
    const base = path.join(SRC_ROOT, rel);
    return resolveFileLike(base);
  }

  if (spec.startsWith('.')) {
    const base = path.resolve(path.dirname(fromFileAbs), spec);
    return resolveFileLike(base);
  }

  return null;
}

function resolveFileLike(baseAbs: string): string | null {
  const candidates = [
    baseAbs,
    baseAbs + '.ts',
    baseAbs + '.tsx',
    baseAbs + '.js',
    baseAbs + '.jsx',
    path.join(baseAbs, 'index.ts'),
    path.join(baseAbs, 'index.tsx'),
    path.join(baseAbs, 'index.js'),
    path.join(baseAbs, 'index.jsx'),
  ];
  for (const c of candidates) {
    try {
      const st = fs.statSync(c);
      if (st.isFile()) return c;
    } catch {
      // ignore
    }
  }
  return null;
}

function isFrozenModalEntry(relPosix: string): boolean {
  const base = path.posix.basename(relPosix);
  if (!/\.(tsx|ts|jsx|js)$/.test(base)) return false;
  // Heuristic: modal/dialog files in src/components.
  if (!isUnder(relPosix, 'src/components')) return false;
  return /Modal|Dialog|Drawer|Sheet/.test(base);
}

function main() {
  ensureDir(OUT_DIR);

  const all = walk(SRC_ROOT);
  const srcFiles = all
    .map((abs) => ({ abs, rel: toPosix(path.relative(PROJECT_ROOT, abs)) }))
    .filter(({ rel }) => isUnder(rel, 'src'))
    .filter(({ abs }) => TEXT_EXTENSIONS.has(path.extname(abs)));

  const allRel = srcFiles.map((x) => x.rel);

  // Hard keep roots: new DS + tokens + backend/API.
  const keepRoots = [
    'src/ds',
    'src/design-tokens',
    'src/app/api',
    'src/lib',
    'src/utils',
    'src/types',
    'src/hooks',
    'src/middleware.ts',
    'src/app/globals.css',
    'src/app/layout.tsx',
    'src/app/not-found.tsx',
  ];

  const keep = new Set<string>();
  const frozenModalEntries = allRel.filter(isFrozenModalEntry);

  function addKeep(rel: string) {
    keep.add(rel);
  }

  // Keep roots.
  for (const rel of allRel) {
    if (keepRoots.some((r) => isUnder(rel, r))) addKeep(rel);
  }

  // Keep frozen modal entry files.
  for (const rel of frozenModalEntries) addKeep(rel);

  // Resolve dependencies of frozen modal entries to avoid breaking builds.
  const relToAbs = new Map<string, string>();
  for (const f of srcFiles) relToAbs.set(f.rel, f.abs);

  const queue: string[] = [...frozenModalEntries];
  const visited = new Set<string>();

  while (queue.length) {
    const rel = queue.pop()!;
    if (visited.has(rel)) continue;
    visited.add(rel);

    const abs = relToAbs.get(rel);
    if (!abs) continue;

    const text = readTextIfSmall(abs);
    if (!text) continue;

    const specs = extractImports(text);
    for (const spec of specs) {
      const resolvedAbs = resolveImport(abs, spec);
      if (!resolvedAbs) continue;
      const resolvedRel = toPosix(path.relative(PROJECT_ROOT, resolvedAbs));
      if (!isUnder(resolvedRel, 'src')) continue;
      if (!relToAbs.has(resolvedRel)) continue;

      if (!keep.has(resolvedRel)) {
        keep.add(resolvedRel);
        queue.push(resolvedRel);
      }
    }
  }

  // Removal candidates: legacy UI roots.
  const removeRoots = [
    'src/components',
    'src/app',
    'src/pages',
  ];

  // But never remove keep roots / API / DS.
  const remove = new Set<string>();
  const undecided = new Set<string>();

  for (const rel of allRel) {
    const underRemoveRoot = removeRoots.some((r) => isUnder(rel, r));
    if (!underRemoveRoot) {
      if (!keep.has(rel)) {
        // Not in remove root and not explicitly kept: undecided (probably safe to keep, but not UI-purge target)
        undecided.add(rel);
      }
      continue;
    }

    // Under remove roots.
    if (keep.has(rel)) continue;

    // Never remove backend API.
    if (isUnder(rel, 'src/app/api')) continue;

    // Never remove DS.
    if (isUnder(rel, 'src/ds')) continue;

    // Remove UI routes in src/app except backend-related files we kept.
    remove.add(rel);
  }

  const result: AuditResult = {
    generatedAt: new Date().toISOString(),
    rules: {
      keepGlobs: [
        'src/ds/**',
        'src/design-tokens/**',
        'src/app/api/**',
        'src/lib/**',
        'src/utils/**',
        'src/types/**',
        'src/hooks/**',
        'src/middleware.ts',
        'src/app/globals.css',
        'src/app/layout.tsx',
        'src/app/not-found.tsx',
        'src/components/**/*{Modal,Dialog,Drawer,Sheet}*.{ts,tsx,js,jsx}',
        '(plus dependencies resolved via import graph)',
      ],
      removeRoots,
      frozenModalHeuristics: ['src/components/** + filename contains Modal|Dialog|Drawer|Sheet'],
    },
    totals: {
      srcFilesScanned: srcFiles.length,
      keepFiles: keep.size,
      removeFiles: remove.size,
      undecidedFiles: undecided.size,
    },
    keepFiles: Array.from(keep).sort(),
    removeFiles: Array.from(remove).sort(),
    undecidedFiles: Array.from(undecided).sort(),
    frozenModalEntryFiles: frozenModalEntries.sort(),
  };

  fs.writeFileSync(path.join(OUT_DIR, 'audit.json'), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'keep-files.txt'), result.keepFiles.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT_DIR, 'remove-files.txt'), result.removeFiles.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT_DIR, 'undecided-files.txt'), result.undecidedFiles.join('\n') + '\n');

  const reportMd = buildReportMd(result);
  fs.writeFileSync(
    path.join(PROJECT_ROOT, 'DOC', 'Prompts', 'PROMPTS & TEMPLATES', 'FRONTEND', 'FRESH-START-LEGACY-PURGE-SOT-2026-02-04.md'),
    reportMd
  );

  // eslint-disable-next-line no-console
  console.log(`frontend-purge-audit: scanned=${result.totals.srcFilesScanned} keep=${result.totals.keepFiles} remove=${result.totals.removeFiles} undecided=${result.totals.undecidedFiles}`);
  // eslint-disable-next-line no-console
  console.log(`Outputs: ${toPosix(path.relative(PROJECT_ROOT, OUT_DIR))}/(audit.json, keep-files.txt, remove-files.txt, undecided-files.txt)`);
}

function buildReportMd(result: AuditResult): string {
  const lines: string[] = [];
  lines.push('# Fresh Start Legacy Purge SOT (Next Implementation Plan)');
  lines.push('');
  lines.push(`**Generated:** ${result.generatedAt}`);
  lines.push('');
  lines.push('## Goal');
  lines.push('- Eliminate legacy frontend UI/classes and start fresh on the new DS only.');
  lines.push('- Keep backend unchanged (locked).');
  lines.push('- Keep modal flows intact by freezing all modal files + their import dependencies (temporary exception).');
  lines.push('');
  lines.push('## Non-Negotiable Rules (Aligned to Strict Instructions)');
  lines.push('- Backend/API/DB/Prisma must not change.');
  lines.push('- Modal triggers/flows/import-export wiring must not change.');
  lines.push('- New UI must import from `@/ds` only (no legacy UI/classes).');
  lines.push('');
  lines.push('## What Counts As “Legacy Frontend” in This Repo');
  lines.push('- `src/components/**` (app UI + legacy UI kit)');
  lines.push('- `src/app/**` (UI routes/pages/layouts) except backend routes under `src/app/api/**` and minimal bootstrapping files.');
  lines.push('- `src/pages/**` (Pages Router remnants)');
  lines.push('');
  lines.push('## Audit Totals');
  lines.push(`- Files scanned (src): ${result.totals.srcFilesScanned}`);
  lines.push(`- Keep (DS + backend + frozen modals + dependencies): ${result.totals.keepFiles}`);
  lines.push(`- Remove candidates (legacy UI): ${result.totals.removeFiles}`);
  lines.push(`- Undecided (non-UI or not targeted): ${result.totals.undecidedFiles}`);
  lines.push('');
  lines.push('## Keep Set (Authoritative)');
  lines.push('The following outputs list the KEEP set (must remain to keep backend and modal flows compiling):');
  lines.push('- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/keep-files.txt`');
  lines.push('- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/audit.json`');
  lines.push('');
  lines.push('## Remove Set (Authoritative)');
  lines.push('The following output lists all files that can be removed to start fresh (legacy UI purge):');
  lines.push('- `DOC/Prompts/PROMPTS & TEMPLATES/FRONTEND/purge-audit/remove-files.txt`');
  lines.push('');
  lines.push('## Plan (High-Level)');
  lines.push('1. Create a new branch (fresh-ui).');
  lines.push('2. Delete every file in `remove-files.txt`.');
  lines.push('3. Keep DS (`src/ds/**`) and tokens (`src/design-tokens/**`).');
  lines.push('4. Ensure the app still compiles by adding minimal DS-only placeholder routes as needed (e.g. `src/app/page.tsx`).');
  lines.push('5. Rebuild the component library inside DS (`src/ds/components/**`) before rebuilding pages.');
  lines.push('6. Do NOT touch modals until the DS component library is stable; treat modals as a frozen compatibility island.');
  lines.push('');
  lines.push('## Verification (Acceptance Criteria)');
  lines.push('- `npm run gate0` passes.');
  lines.push('- No imports from legacy UI in new code (enforce via lint rules in a follow-up step).');
  lines.push('- Backend routes under `src/app/api/**` behave unchanged.');
  lines.push('- Frozen modal flows still compile and triggers remain intact (no wiring changes).');
  lines.push('');
  return lines.join('\n');
}

main();

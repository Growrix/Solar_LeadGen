/**
 * ClassName Validation Script (T018)
 * 
 * Checks for forbidden patterns in className usage:
 * - Hardcoded colors (bg-teal-600, text-blue-500)
 * - Raw typography utilities (text-2xl, font-bold)
 * - transition-all (performance issue)
 * 
 * Suggests fixes using semantic tokens.
 * Exits with error if violations found (for CI/CD).
 * 
 * Usage: npx tsx scripts/validate-classnames.ts [file-pattern]
 */

import * as fs from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';

interface Violation {
  file: string;
  line: number;
  className: string;
  type: 'hardcoded-color' | 'raw-typography' | 'transition-all';
  suggestion: string;
}

const VIOLATIONS: Violation[] = [];

const HARDCODED_COLOR_PATTERNS = [
  { pattern: /bg-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-\d+/, suggestion: 'bg-primary, bg-secondary, bg-surface' },
  { pattern: /text-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-\d+/, suggestion: 'text-foreground, text-muted-foreground, text-primary' },
  { pattern: /border-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-\d+/, suggestion: 'border-border, border-primary' },
];

const RAW_TYPOGRAPHY_PATTERNS = [
  { pattern: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)(?!\w)/, suggestion: 'text-heading-1, text-heading-2, text-body, text-body-small, text-caption' },
  { pattern: /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?!\w)/, suggestion: 'Use semantic typography tokens (included in text-heading-*, text-body)' },
];

const FORBIDDEN_PATTERNS = [
  { pattern: /transition-all/, suggestion: 'transition-colors, transition-shadow, transition-transform, transition-opacity' },
];

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Match className="..." or className={...}
    const classNameMatches = [
      ...line.matchAll(/className=["'`]([^"'`]+)["'`]/g),
      ...line.matchAll(/className=\{[^}]*["'`]([^"'`]+)["'`][^}]*\}/g),
    ];
    
    classNameMatches.forEach((match) => {
      const classString = match[1];
      const classes = classString.split(/\s+/);
      
      classes.forEach(className => {
        // Check hardcoded colors
        for (const { pattern, suggestion } of HARDCODED_COLOR_PATTERNS) {
          if (pattern.test(className)) {
            VIOLATIONS.push({
              file: filePath,
              line: lineNumber,
              className,
              type: 'hardcoded-color',
              suggestion,
            });
          }
        }
        
        // Check raw typography
        for (const { pattern, suggestion } of RAW_TYPOGRAPHY_PATTERNS) {
          if (pattern.test(className)) {
            VIOLATIONS.push({
              file: filePath,
              line: lineNumber,
              className,
              type: 'raw-typography',
              suggestion,
            });
          }
        }
        
        // Check forbidden patterns
        for (const { pattern, suggestion } of FORBIDDEN_PATTERNS) {
          if (pattern.test(className)) {
            VIOLATIONS.push({
              file: filePath,
              line: lineNumber,
              className,
              type: 'transition-all',
              suggestion,
            });
          }
        }
      });
    });
  });
}

function getStagedTsxJsxFiles(): string[] {
  const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => /\.(tsx|jsx)$/.test(file))
    .filter((file) => !file.startsWith('node_modules/'))
    .filter((file) => !file.startsWith('dist/'))
    .filter((file) => !file.startsWith('build/'))
    .filter((file) => !file.startsWith('.next/'));
}

async function main() {
  const args = process.argv.slice(2);
  const wantsAll = args.includes('--all');
  const explicitPattern = args.find((arg) => arg !== '--all');

  if (!explicitPattern && !wantsAll) {
    const stagedFiles = getStagedTsxJsxFiles();
    console.log(`🔍 Validating className usage (staged files): ${stagedFiles.length}\n`);

    if (stagedFiles.length === 0) {
      console.log('✅ No staged TSX/JSX files to validate.\n');
      process.exit(0);
    }

    for (const file of stagedFiles) {
      checkFile(file);
    }
  } else {
    const filePattern = explicitPattern || 'src/**/*.{tsx,jsx}';
    const label = wantsAll && !explicitPattern ? 'src/**/*.{tsx,jsx}' : filePattern;
    console.log(`🔍 Validating className usage: ${label}\n`);

    const files = await glob(filePattern, {
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**'],
    });

    for (const file of files) {
      checkFile(file);
    }
  }
  
  if (VIOLATIONS.length === 0) {
    console.log('✅ No violations found! All className usage follows standards.\n');
    process.exit(0);
  }
  
  console.error(`❌ Found ${VIOLATIONS.length} violations:\n`);
  
  const grouped = new Map<string, Violation[]>();
  VIOLATIONS.forEach(v => {
    if (!grouped.has(v.file)) {
      grouped.set(v.file, []);
    }
    grouped.get(v.file)!.push(v);
  });
  
  grouped.forEach((violations, file) => {
    console.error(`\n📄 ${file}`);
    violations.forEach(v => {
      console.error(`  Line ${v.line}: \`${v.className}\` (${v.type})`);
      console.error(`    → Suggestion: ${v.suggestion}`);
    });
  });
  
  console.error(`\n💡 Fix these violations to ensure consistency and maintainability.\n`);
  process.exit(1);
}

main().catch(console.error);

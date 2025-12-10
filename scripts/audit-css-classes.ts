/**
 * CSS Class Audit Script (T011)
 * 
 * Scans all .tsx/.jsx files for className usage and categorizes patterns.
 * Identifies:
 * - Hardcoded colors (bg-teal-600, text-blue-500)
 * - Industry standard violations
 * - Component type usage (button/icon/form/card/typography)
 * 
 * Output: specs/005-comprehensive-css-class/audit-report.md
 * 
 * Usage: npx tsx scripts/audit-css-classes.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ClassUsage {
  className: string;
  usageCount: number;
  fileLocations: Array<{ file: string; line: number }>;
  category: 'button' | 'icon' | 'form' | 'card' | 'typography' | 'layout' | 'utility' | 'unknown';
  violation?: 'hardcoded-color' | 'raw-typography' | 'transition-all' | 'non-semantic';
}

interface AuditReport {
  scanDate: string;
  filesScanned: number;
  totalClassNames: number;
  uniqueClassNames: number;
  categories: Map<string, ClassUsage[]>;
  violations: ClassUsage[];
}

// Hardcoded color patterns to detect
const COLOR_PATTERNS = [
  /bg-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-\d+/,
  /text-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-\d+/,
  /border-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|violet|fuchsia|rose|sky|amber)-\d+/,
];

// Raw typography patterns to detect
const TYPOGRAPHY_PATTERNS = [
  /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
  /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
  /leading-(none|tight|snug|normal|relaxed|loose)/,
];

// Forbidden patterns
const FORBIDDEN_PATTERNS = [
  { pattern: /transition-all/, violation: 'transition-all' as const },
];

function categorizeClass(className: string): ClassUsage['category'] {
  if (className.includes('btn') || className.includes('button')) return 'button';
  if (className.match(/h-\d+/) && className.match(/w-\d+/)) return 'icon';
  if (className.includes('input') || className.includes('select') || className.includes('textarea') || className.includes('label')) return 'form';
  if (className.includes('card') || className.includes('container') || className.includes('wrapper')) return 'card';
  if (className.match(/text-|font-|leading-/)) return 'typography';
  if (className.match(/flex|grid|p-|m-|space-|gap-/)) return 'layout';
  return 'utility';
}

function detectViolation(className: string): ClassUsage['violation'] | undefined {
  for (const pattern of COLOR_PATTERNS) {
    if (pattern.test(className)) return 'hardcoded-color';
  }
  for (const pattern of TYPOGRAPHY_PATTERNS) {
    if (pattern.test(className)) return 'raw-typography';
  }
  for (const { pattern, violation } of FORBIDDEN_PATTERNS) {
    if (pattern.test(className)) return violation;
  }
  return undefined;
}

async function scanFile(filePath: string): Promise<Map<string, ClassUsage>> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const classUsageMap = new Map<string, ClassUsage>();
  
  // Match className="..." or className={...}
  const classNameRegex = /className=["'`]([^"'`]+)["'`]/g;
  const classNameObjectRegex = /className=\{[^}]*["'`]([^"'`]+)["'`][^}]*\}/g;
  
  let match;
  let lineNumber = 0;
  
  content.split('\n').forEach((line, index) => {
    lineNumber = index + 1;
    
    // Match template literal classNames
    const matches = [...line.matchAll(classNameRegex), ...line.matchAll(classNameObjectRegex)];
    
    matches.forEach((match) => {
      const classString = match[1];
      const classes = classString.split(/\s+/).filter(c => c.length > 0);
      
      classes.forEach(className => {
        if (!classUsageMap.has(className)) {
          classUsageMap.set(className, {
            className,
            usageCount: 0,
            fileLocations: [],
            category: categorizeClass(className),
            violation: detectViolation(className),
          });
        }
        
        const usage = classUsageMap.get(className)!;
        usage.usageCount++;
        usage.fileLocations.push({ file: filePath, line: lineNumber });
      });
    });
  });
  
  return classUsageMap;
}

async function generateAuditReport(): Promise<AuditReport> {
  const files = await glob('src/**/*.{tsx,jsx}', { ignore: ['node_modules/**', 'dist/**', 'build/**'] });
  
  const globalClassUsage = new Map<string, ClassUsage>();
  
  for (const file of files) {
    const fileClassUsage = await scanFile(file);
    
    fileClassUsage.forEach((usage, className) => {
      if (!globalClassUsage.has(className)) {
        globalClassUsage.set(className, usage);
      } else {
        const existing = globalClassUsage.get(className)!;
        existing.usageCount += usage.usageCount;
        existing.fileLocations.push(...usage.fileLocations);
      }
    });
  }
  
  // Categorize classes
  const categories = new Map<string, ClassUsage[]>();
  const violations: ClassUsage[] = [];
  
  globalClassUsage.forEach((usage) => {
    const category = usage.category;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(usage);
    
    if (usage.violation) {
      violations.push(usage);
    }
  });
  
  return {
    scanDate: new Date().toISOString(),
    filesScanned: files.length,
    totalClassNames: Array.from(globalClassUsage.values()).reduce((sum, u) => sum + u.usageCount, 0),
    uniqueClassNames: globalClassUsage.size,
    categories,
    violations,
  };
}

function generateMarkdownReport(report: AuditReport): string {
  let md = `# CSS Class Audit Report\n\n`;
  md += `**Generated**: ${report.scanDate}\n\n`;
  md += `## Summary Statistics\n\n`;
  md += `- **Files Scanned**: ${report.filesScanned}\n`;
  md += `- **Total className Instances**: ${report.totalClassNames}\n`;
  md += `- **Unique Class Names**: ${report.uniqueClassNames}\n`;
  md += `- **Violations Found**: ${report.violations.length}\n\n`;
  
  md += `## Violations (Priority: Fix First)\n\n`;
  if (report.violations.length === 0) {
    md += `✅ No violations found!\n\n`;
  } else {
    md += `| Class Name | Type | Usage Count | Recommendation |\n`;
    md += `|------------|------|-------------|----------------|\n`;
    report.violations.forEach(v => {
      let recommendation = '';
      if (v.violation === 'hardcoded-color') {
        recommendation = `Replace with semantic token (bg-primary, text-foreground, etc.)`;
      } else if (v.violation === 'raw-typography') {
        recommendation = `Replace with typography token (text-heading-1, text-body, etc.)`;
      } else if (v.violation === 'transition-all') {
        recommendation = `Replace with specific transition (transition-colors, transition-shadow)`;
      }
      md += `| \`${v.className}\` | ${v.violation} | ${v.usageCount} | ${recommendation} |\n`;
    });
    md += `\n`;
  }
  
  md += `## Class Usage by Category\n\n`;
  report.categories.forEach((usages, category) => {
    md += `### ${category.toUpperCase()} (${usages.length} unique classes)\n\n`;
    const topUsages = usages.sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
    md += `| Class Name | Usage Count | Sample Location |\n`;
    md += `|------------|-------------|------------------|\n`;
    topUsages.forEach(u => {
      const sampleLoc = u.fileLocations[0];
      md += `| \`${u.className}\` | ${u.usageCount} | ${sampleLoc.file}:${sampleLoc.line} |\n`;
    });
    md += `\n`;
  });
  
  return md;
}

async function main() {
  console.log('🔍 Starting CSS class audit...\n');
  
  const report = await generateAuditReport();
  const markdown = generateMarkdownReport(report);
  
  const outputPath = path.join('specs', '005-comprehensive-css-class', 'audit-report.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown);
  
  console.log(`✅ Audit complete!`);
  console.log(`📊 Report saved to: ${outputPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Files scanned: ${report.filesScanned}`);
  console.log(`  - Unique classes: ${report.uniqueClassNames}`);
  console.log(`  - Violations: ${report.violations.length}\n`);
}

main().catch(console.error);

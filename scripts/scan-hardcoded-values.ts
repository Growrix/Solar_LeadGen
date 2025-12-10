/**
 * Hardcoded Value Scanner
 * 
 * Scans the codebase for hardcoded values that should be replaced with design tokens:
 * - Hardcoded colors (hex codes, Tailwind color classes like bg-teal-600)
 * - Hardcoded spacing (Tailwind spacing classes like p-4, m-8)
 * - Hardcoded font sizes (text-lg, text-xl)
 * - Hardcoded shadows, radii, animations
 * 
 * Usage: npx ts-node scripts/scan-hardcoded-values.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScanResult {
  file: string;
  line: number;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius' | 'animation';
  value: string;
  context: string;
}

interface ScanStats {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesByFile: Record<string, number>;
}

// Patterns to detect hardcoded values
const PATTERNS = {
  // Hex colors: #RRGGBB or #RGB
  hexColor: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
  
  // RGB/RGBA colors: rgb(r,g,b) or rgba(r,g,b,a)
  rgbColor: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)/g,
  
  // Tailwind color classes (bg-*, text-*, border-*) with specific color shades
  tailwindColor: /\b(bg|text|border|ring|divide|decoration|placeholder|caret|accent|shadow|outline|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/g,
  
  // Hardcoded spacing: p-4, m-8, gap-6, space-x-4 (but NOT semantic tokens like p-card-padding)
  tailwindSpacing: /\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|inset|top|right|bottom|left)-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)\b/g,
  
  // Hardcoded font sizes: text-xs, text-sm, text-base, text-lg, etc.
  tailwindFontSize: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
  
  // Hardcoded shadows: shadow-sm, shadow-md, shadow-lg, etc.
  tailwindShadow: /\bshadow-(sm|md|lg|xl|2xl|inner|none)\b/g,
  
  // Hardcoded border radius: rounded-sm, rounded-md, rounded-lg, etc.
  tailwindRadius: /\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g,
  
  // Hardcoded animations/transitions: duration-*, ease-*
  tailwindAnimation: /\b(duration|transition|ease|animate)-(75|100|150|200|300|500|700|1000|none|linear|in|out|in-out|spin|ping|pulse|bounce)\b/g,
};

// Files/directories to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'build',
  'dist',
  'out',
  'storybook-static',
  'coverage',
  '.git',
  'backup-',
  'design-tokens', // Design token files themselves are OK to have hardcoded values
  'tailwind.config.js', // Tailwind config needs hardcoded values
  'globals.css', // Global CSS defines the tokens
  '.storybook', // Storybook config
  'scan-hardcoded-values.ts', // This script itself
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css'];

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath: string): ScanResult[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: ScanResult[] = [];

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
      return;
    }

    // Check for hex colors
    const hexMatches = line.matchAll(PATTERNS.hexColor);
    for (const match of hexMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'color',
        value: match[0],
        context: line.trim(),
      });
    }

    // Check for RGB colors
    const rgbMatches = line.matchAll(PATTERNS.rgbColor);
    for (const match of rgbMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'color',
        value: match[0],
        context: line.trim(),
      });
    }

    // Check for Tailwind color classes
    const tailwindColorMatches = line.matchAll(PATTERNS.tailwindColor);
    for (const match of tailwindColorMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'color',
        value: match[0],
        context: line.trim(),
      });
    }

    // Check for Tailwind spacing classes
    const tailwindSpacingMatches = line.matchAll(PATTERNS.tailwindSpacing);
    for (const match of tailwindSpacingMatches) {
      // Skip if it looks like a semantic token (contains hyphen after the value)
      if (!line.includes(`${match[0]}-`)) {
        results.push({
          file: filePath,
          line: index + 1,
          type: 'spacing',
          value: match[0],
          context: line.trim(),
        });
      }
    }

    // Check for Tailwind font size classes
    const tailwindFontSizeMatches = line.matchAll(PATTERNS.tailwindFontSize);
    for (const match of tailwindFontSizeMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'typography',
        value: match[0],
        context: line.trim(),
      });
    }

    // Check for Tailwind shadow classes
    const tailwindShadowMatches = line.matchAll(PATTERNS.tailwindShadow);
    for (const match of tailwindShadowMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'shadow',
        value: match[0],
        context: line.trim(),
      });
    }

    // Check for Tailwind radius classes
    const tailwindRadiusMatches = line.matchAll(PATTERNS.tailwindRadius);
    for (const match of tailwindRadiusMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'radius',
        value: match[0],
        context: line.trim(),
      });
    }

    // Check for Tailwind animation classes
    const tailwindAnimationMatches = line.matchAll(PATTERNS.tailwindAnimation);
    for (const match of tailwindAnimationMatches) {
      results.push({
        file: filePath,
        line: index + 1,
        type: 'animation',
        value: match[0],
        context: line.trim(),
      });
    }
  });

  return results;
}

function scanDirectory(dir: string, results: ScanResult[] = []): ScanResult[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldExcludeFile(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, results);
    } else if (entry.isFile() && SCAN_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      const fileResults = scanFile(fullPath);
      results.push(...fileResults);
    }
  }

  return results;
}

function generateStats(results: ScanResult[]): ScanStats {
  const stats: ScanStats = {
    totalFiles: 0,
    filesWithIssues: 0,
    totalIssues: results.length,
    issuesByType: {},
    issuesByFile: {},
  };

  const uniqueFiles = new Set<string>();

  for (const result of results) {
    uniqueFiles.add(result.file);

    // Count by type
    stats.issuesByType[result.type] = (stats.issuesByType[result.type] || 0) + 1;

    // Count by file
    stats.issuesByFile[result.file] = (stats.issuesByFile[result.file] || 0) + 1;
  }

  stats.filesWithIssues = uniqueFiles.size;

  return stats;
}

function formatResults(results: ScanResult[], stats: ScanStats): string {
  let output = '# Hardcoded Value Scan Report\n\n';
  output += `**Generated**: ${new Date().toISOString()}\n\n`;
  output += '## Summary\n\n';
  output += `- **Total Issues**: ${stats.totalIssues}\n`;
  output += `- **Files with Issues**: ${stats.filesWithIssues}\n\n`;

  output += '### Issues by Type\n\n';
  for (const [type, count] of Object.entries(stats.issuesByType).sort((a, b) => b[1] - a[1])) {
    output += `- **${type}**: ${count}\n`;
  }

  output += '\n### Top 20 Files with Most Issues\n\n';
  const topFiles = Object.entries(stats.issuesByFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  for (const [file, count] of topFiles) {
    output += `- ${file.replace(/\\/g, '/')}: **${count}** issues\n`;
  }

  output += '\n## Detailed Results\n\n';

  // Group results by file
  const resultsByFile: Record<string, ScanResult[]> = {};
  for (const result of results) {
    if (!resultsByFile[result.file]) {
      resultsByFile[result.file] = [];
    }
    resultsByFile[result.file].push(result);
  }

  // Sort files by number of issues (descending)
  const sortedFiles = Object.entries(resultsByFile)
    .sort((a, b) => b[1].length - a[1].length);

  for (const [file, fileResults] of sortedFiles) {
    output += `### ${file.replace(/\\/g, '/')}\n\n`;
    output += `**Total Issues**: ${fileResults.length}\n\n`;

    // Group by type
    const byType: Record<string, ScanResult[]> = {};
    for (const result of fileResults) {
      if (!byType[result.type]) {
        byType[result.type] = [];
      }
      byType[result.type].push(result);
    }

    for (const [type, typeResults] of Object.entries(byType)) {
      output += `#### ${type} (${typeResults.length})\n\n`;
      for (const result of typeResults) {
        output += `- Line ${result.line}: \`${result.value}\`\n`;
        output += `  \`\`\`\n  ${result.context}\n  \`\`\`\n`;
      }
      output += '\n';
    }
  }

  return output;
}

// Main execution
const srcDir = path.join(process.cwd(), 'src');
const results = scanDirectory(srcDir);
const stats = generateStats(results);
const report = formatResults(results, stats);

// Write report to file
const reportPath = path.join(process.cwd(), 'specs', '004-centralized-theme-color', 'audits', 'hardcoded-values-scan.md');
fs.writeFileSync(reportPath, report, 'utf-8');

console.log('✅ Hardcoded value scan complete!');
console.log(`📊 Found ${stats.totalIssues} issues in ${stats.filesWithIssues} files`);
console.log(`📝 Report written to: ${reportPath}`);
console.log('\nIssues by type:');
for (const [type, count] of Object.entries(stats.issuesByType).sort((a, b) => b[1] - a[1])) {
  console.log(`  - ${type}: ${count}`);
}

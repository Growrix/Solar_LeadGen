const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🚀 SAFE Design Token Migration Script');
console.log('══════════════════════════════════════════════════════════════');

// Statistics
let stats = {
  filesProcessed: 0,
  filesChanged: 0,
  typographyFixes: 0,
  colorFixes: 0,
  darkModeRemovals: 0,
  totalFixes: 0
};

const startTime = Date.now();

// SAFE replacement function that preserves string terminators
function safeReplace(content, pattern, replacement) {
  let count = 0;
  const newContent = content.replace(pattern, (match) => {
    count++;
    return replacement;
  });
  return { content: newContent, count };
}

// Process a single file
function processFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  let fileChanges = 0;

  // PHASE 1: Typography Fixes (SAFE - no string boundary issues)
  const typographyReplacements = [
    // Heading combinations (most specific first)
    [/\btext-3xl\s+font-bold\b/g, 'text-heading-1'],
    [/\btext-2xl\s+font-bold\b/g, 'text-heading-2'],
    [/\btext-xl\s+font-bold\b/g, 'text-heading-3'],
    [/\btext-lg\s+font-semibold\b/g, 'text-heading-4'],
    
    // Body combinations
    [/\btext-sm\s+font-semibold\b/g, 'text-label'],
    
    // Individual typography (only if not part of larger class)
    [/\btext-sm\b(?![-:])/g, 'text-body-small'],
    [/\btext-xs\b(?![-:])/g, 'text-caption'],
  ];

  typographyReplacements.forEach(([pattern, replacement]) => {
    const result = safeReplace(content, pattern, replacement);
    content = result.content;
    if (result.count > 0) {
      fileChanges += result.count;
      stats.typographyFixes += result.count;
    }
  });

  // PHASE 2: Remove dark mode variants (CRITICAL - preserve string terminators)
  // This regex ONLY matches dark: prefixes, NOT closing quotes
  const darkModePattern = /\s*dark:([^\s"'`}]+)/g;
  const darkMatches = (content.match(darkModePattern) || []).length;
  if (darkMatches > 0) {
    content = content.replace(darkModePattern, '');
    fileChanges += darkMatches;
    stats.darkModeRemovals += darkMatches;
  }

  // PHASE 3: Color replacements (SAFE - word boundaries)
  const colorReplacements = [
    // Background colors
    [/\bbg-white\b(?![-:])/g, 'bg-surface'],
    [/\bbg-gray-50\b/g, 'bg-surface'],
    [/\bbg-gray-100\b/g, 'bg-surface'],
    [/\bbg-slate-900\b/g, 'bg-surface'],
    [/\bbg-slate-800\b/g, 'bg-surface'],
    [/\bbg-slate-700\b/g, 'bg-surface'],
    
    // Text colors
    [/\btext-white\b(?![-:])/g, 'text-foreground-secondary'],
    [/\btext-slate-900\b/g, 'text-foreground'],
    [/\btext-slate-800\b/g, 'text-foreground'],
    [/\btext-slate-700\b/g, 'text-foreground'],
    [/\btext-slate-600\b/g, 'text-muted'],
    [/\btext-slate-500\b/g, 'text-muted'],
    [/\btext-slate-400\b/g, 'text-muted'],
    [/\btext-gray-900\b/g, 'text-foreground'],
    [/\btext-gray-800\b/g, 'text-foreground'],
    [/\btext-gray-600\b/g, 'text-muted'],
    [/\btext-gray-500\b/g, 'text-muted'],
    
    // Border colors
    [/\bborder-gray-200\b/g, 'border-border'],
    [/\bborder-gray-300\b/g, 'border-border'],
    [/\bborder-slate-200\b/g, 'border-border'],
    [/\bborder-slate-300\b/g, 'border-border'],
    [/\bborder-slate-600\b/g, 'border-border'],
    [/\bborder-slate-700\b/g, 'border-border'],
    
    // Success colors
    [/\bbg-green-50\b/g, 'bg-success/10'],
    [/\bbg-green-100\b/g, 'bg-success/20'],
    [/\bbg-green-400\b/g, 'bg-success'],
    [/\bbg-green-500\b/g, 'bg-success'],
    [/\bbg-green-600\b/g, 'bg-success'],
    [/\btext-green-600\b/g, 'text-success'],
    [/\btext-green-700\b/g, 'text-success'],
    [/\bborder-green-200\b/g, 'border-success'],
    
    // Warning colors
    [/\bbg-yellow-50\b/g, 'bg-warning/10'],
    [/\bbg-yellow-100\b/g, 'bg-warning/20'],
    [/\bbg-yellow-500\b/g, 'bg-warning'],
    [/\btext-yellow-600\b/g, 'text-warning'],
    [/\btext-yellow-700\b/g, 'text-warning'],
    [/\bborder-yellow-200\b/g, 'border-warning'],
    
    // Error/Destructive colors
    [/\bbg-red-50\b/g, 'bg-error/10'],
    [/\bbg-red-100\b/g, 'bg-error/20'],
    [/\bbg-red-500\b/g, 'bg-error'],
    [/\bbg-red-600\b/g, 'bg-error'],
    [/\btext-red-600\b/g, 'text-error'],
    [/\btext-red-700\b/g, 'text-error'],
    [/\bborder-red-200\b/g, 'border-error'],
  ];

  colorReplacements.forEach(([pattern, replacement]) => {
    const result = safeReplace(content, pattern, replacement);
    content = result.content;
    if (result.count > 0) {
      fileChanges += result.count;
      stats.colorFixes += result.count;
    }
  });

  // PHASE 4: Clean up orphaned font-weight and font-size
  const cleanupPatterns = [
    [/\s+font-bold\b/g, ''],
    [/\s+font-semibold\b/g, ''],
    [/\s+font-medium\b/g, ''],
  ];

  cleanupPatterns.forEach(([pattern, replacement]) => {
    const result = safeReplace(content, pattern, replacement);
    content = result.content;
    fileChanges += result.count;
  });

  // PHASE 5: Clean up multiple spaces in className
  content = content.replace(/className="([^"]*)  +([^"]*)"/g, 'className="$1 $2"');

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesChanged++;
    stats.totalFixes += fileChanges;
    console.log(`✅ ${filePath.replace(process.cwd(), '.')} (${fileChanges} fixes)`);
    return true;
  }

  return false;
}

// Main execution
async function main() {
  console.log('📂 Scanning for TypeScript/TSX files...');
  
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/*.d.ts']
  });
  
  console.log(`📄 Found ${files.length} files\n`);
  console.log('🔧 Processing files...\n');

  files.forEach(file => {
    stats.filesProcessed++;
    processFile(file);
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('📊 MIGRATION SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`Files Processed:    ${stats.filesProcessed}`);
  console.log(`Files Changed:      ${stats.filesChanged}`);
  console.log(`Typography Fixes:   ${stats.typographyFixes}`);
  console.log(`Color Fixes:        ${stats.colorFixes}`);
  console.log(`Dark Mode Removals: ${stats.darkModeRemovals}`);
  console.log(`Total Fixes:        ${stats.totalFixes}`);
  console.log(`Duration:           ${duration}s`);
  console.log('══════════════════════════════════════════════════════════════');
  console.log('\n✅ MIGRATION COMPLETE\n');
  console.log('📋 NEXT STEPS:');
  console.log('   1. Review changes: git diff --stat');
  console.log('   2. Test build: npm run build');
  console.log('   3. Test pre-commit: git add . && git commit -m "test"');
  console.log('   4. Visual testing (Dark/Light/Purple themes)');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Design Token Migration - Pass 3 (Cleanup)');
console.log('══════════════════════════════════════════════════════════════');

let stats = {
  filesProcessed: 0,
  filesChanged: 0,
  totalFixes: 0
};

const startTime = Date.now();

function processFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  let fileChanges = 0;

  // Clean up orphaned typography and transitions
  const cleanupPatterns = [
    // Replace transition-all with transition-colors (safer)
    [/\btransition-all\b/g, 'transition-colors'],
    
    // Remove orphaned font weights (with or without leading space)
    [/\bfont-bold\b/g, ''],
    [/\bfont-semibold\b/g, ''],
    [/\bfont-medium\b/g, ''],
    
    // Replace remaining raw typography sizes (including responsive variants)
    [/\btext-base\b(?![-:])/g, 'text-body'],
    [/\btext-lg\b(?![-:])/g, 'text-heading-4'],
    [/\btext-xl\b(?![-:])/g, 'text-heading-3'],
    [/\btext-2xl\b(?![-:])/g, 'text-heading-2'],
    [/\btext-3xl\b(?![-:])/g, 'text-heading-1'],
    [/\btext-4xl\b(?![-:])/g, 'text-heading-1'],
    [/\btext-5xl\b(?![-:])/g, 'text-heading-1'],
    [/\bmd:text-4xl\b/g, 'md:text-heading-1'],
    [/\bmd:text-5xl\b/g, 'md:text-heading-1'],
  ];

  cleanupPatterns.forEach(([pattern, replacement]) => {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      content = content.replace(pattern, replacement);
      fileChanges += matches;
    }
  });

  // Clean up multiple spaces that may have been created
  content = content.replace(/className="([^"]*)  +([^"]*)"/g, 'className="$1 $2"');
  content = content.replace(/className=" /g, 'className="');
  content = content.replace(/ "/g, '"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesChanged++;
    stats.totalFixes += fileChanges;
    console.log(`✅ ${filePath.replace(process.cwd(), '.')} (${fileChanges} fixes)`);
    return true;
  }

  return false;
}

async function main() {
  console.log('📂 Scanning for remaining cleanup items...\n');
  
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/*.d.ts']
  });
  
  console.log('🔧 Processing files...\n');

  files.forEach(file => {
    stats.filesProcessed++;
    processFile(file);
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('📊 PASS 3 SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`Files Processed:    ${stats.filesProcessed}`);
  console.log(`Files Changed:      ${stats.filesChanged}`);
  console.log(`Total Fixes:        ${stats.totalFixes}`);
  console.log(`Duration:           ${duration}s`);
  console.log('══════════════════════════════════════════════════════════════');
  console.log('\n✅ PASS 3 COMPLETE\n');
  console.log('📋 FINAL STEP: Commit changes');
  console.log('   git add . && git commit -m "fix: complete design token migration with cleanup"');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

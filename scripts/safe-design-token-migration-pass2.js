const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Design Token Migration - Pass 2 (Edge Cases)');
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

  // Status/State-specific colors that weren't caught in first pass
  const edgeCaseReplacements = [
    // Blue (Primary) colors
    [/\bbg-blue-50\b/g, 'bg-primary/10'],
    [/\bbg-blue-100\b/g, 'bg-primary/20'],
    [/\bbg-blue-500\b/g, 'bg-primary'],
    [/\bbg-blue-600\b/g, 'bg-primary'],
    [/\bbg-blue-700\b/g, 'bg-primary'],
    [/\btext-blue-500\b/g, 'text-primary'],
    [/\btext-blue-600\b/g, 'text-primary'],
    [/\btext-blue-700\b/g, 'text-primary'],
    [/\btext-blue-800\b/g, 'text-primary'],
    [/\bborder-blue-200\b/g, 'border-primary'],
    [/\bborder-blue-300\b/g, 'border-primary'],
    [/\bhover:bg-blue-700\b/g, 'hover:bg-primary/90'],
    
    // Purple (Accent) colors
    [/\bbg-purple-50\b/g, 'bg-accent/10'],
    [/\bbg-purple-100\b/g, 'bg-accent/20'],
    [/\bbg-purple-500\b/g, 'bg-accent'],
    [/\bbg-purple-600\b/g, 'bg-accent'],
    [/\btext-purple-600\b/g, 'text-accent'],
    [/\btext-purple-700\b/g, 'text-accent'],
    [/\bborder-purple-200\b/g, 'border-accent'],
    
    // Amber/Orange (Warning variations)
    [/\bbg-amber-50\b/g, 'bg-warning/10'],
    [/\bbg-amber-100\b/g, 'bg-warning/20'],
    [/\bbg-amber-500\b/g, 'bg-warning'],
    [/\btext-amber-500\b/g, 'text-warning'],
    [/\btext-amber-600\b/g, 'text-warning'],
    [/\btext-amber-700\b/g, 'text-warning'],
    [/\bbg-orange-500\b/g, 'bg-warning'],
    [/\btext-orange-600\b/g, 'text-warning'],
    
    // Additional yellow variations
    [/\btext-yellow-500\b/g, 'text-warning'],
    [/\btext-yellow-800\b/g, 'text-warning'],
    [/\btext-yellow-900\b/g, 'text-warning'],
    
    // Additional green variations
    [/\bbg-green-700\b/g, 'bg-success'],
    [/\btext-green-500\b/g, 'text-success'],
    [/\btext-green-800\b/g, 'text-success'],
    [/\bhover:bg-green-700\b/g, 'hover:bg-success/90'],
    
    // Additional red/error variations
    [/\bbg-red-700\b/g, 'bg-error'],
    [/\btext-red-800\b/g, 'text-error'],
    [/\bhover:bg-red-700\b/g, 'hover:bg-error/90'],
  ];

  edgeCaseReplacements.forEach(([pattern, replacement]) => {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      content = content.replace(pattern, replacement);
      fileChanges += matches;
    }
  });

  // Clean up any remaining multiple spaces
  content = content.replace(/className="([^"]*)  +([^"]*)"/g, 'className="$1 $2"');

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
  console.log('📂 Scanning for remaining violations...\n');
  
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
  console.log('📊 PASS 2 SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`Files Processed:    ${stats.filesProcessed}`);
  console.log(`Files Changed:      ${stats.filesChanged}`);
  console.log(`Total Fixes:        ${stats.totalFixes}`);
  console.log(`Duration:           ${duration}s`);
  console.log('══════════════════════════════════════════════════════════════');
  console.log('\n✅ PASS 2 COMPLETE\n');
  console.log('📋 NEXT STEP: Test commit');
  console.log('   git add . && git commit -m "fix: complete design token migration"');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

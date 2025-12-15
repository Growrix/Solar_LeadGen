const fs = require('fs');

const filePath = 'src/components/InstallerMessagingModal.tsx';

console.log('Fixing InstallerMessagingModal design tokens...\n');

let content = fs.readFileSync(filePath, 'utf8');
let changes = 0;

// Typography fixes
const typographyReplacements = [
  [/text-xl font-bold/g, 'text-heading-3'],
  [/text-lg font-semibold/g, 'text-heading-4'],
  [/text-sm font-semibold/g, 'text-label'],
  [/text-sm(?![:-])/g, 'text-body-small'],
  [/text-xs(?![:-])/g, 'text-caption'],
  [/font-medium/g, ''],
];

typographyReplacements.forEach(([pattern, replacement]) => {
  const matches = (content.match(pattern) || []).length;
  if (matches > 0) {
    content = content.replace(pattern, replacement);
    changes += matches;
  }
});

// Remove dark mode variants
const darkModeMatches = (content.match(/dark:[^\s"'`}]+/g) || []).length;
content = content.replace(/\s*dark:[^\s"'`}]+/g, '');
changes += darkModeMatches;

// Color replacements
const colorReplacements = [
  [/bg-white(?!\s)/g, 'bg-surface'],
  [/bg-gray-50/g, 'bg-surface'],
  [/bg-gray-100/g, 'bg-surface'],
  [/bg-slate-900/g, 'bg-surface'],
  [/bg-slate-800/g, 'bg-surface'],
  [/bg-slate-700/g, 'bg-surface'],
  [/text-slate-900/g, 'text-foreground'],
  [/text-slate-500/g, 'text-muted'],
  [/text-slate-400/g, 'text-muted'],
  [/text-white(?!\s)/g, 'text-foreground-secondary'],
  [/border-gray-200/g, 'border-border'],
  [/border-slate-700/g, 'border-border'],
  [/border-slate-600/g, 'border-border'],
  [/bg-green-400/g, 'bg-success'],
  [/text-green-600/g, 'text-success'],
  [/hover:bg-gray-100/g, 'hover:bg-surface'],
];

colorReplacements.forEach(([pattern, replacement]) => {
  const matches = (content.match(pattern) || []).length;
  if (matches > 0) {
    content = content.replace(pattern, replacement);
    changes += matches;
  }
});

// Clean up double spaces
content = content.replace(/className="([^"]*)  +([^"]*)"/g, 'className="$1 $2"');

fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ Fixed ${changes} violations in InstallerMessagingModal.tsx`);

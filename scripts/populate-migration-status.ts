/**
 * Populate Migration Status (T016)
 * 
 * Scans src/components and populates migration-status.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

async function main() {
  const files = await glob('src/components/**/*.tsx', { 
    ignore: ['src/components/ui/**', 'node_modules/**'] 
  });
  
  const components = files.map(f => {
    const name = path.basename(f, '.tsx');
    // Assign priority based on component type
    let priority = 'P10';
    if (name.includes('Modal') || name.includes('Dialog')) priority = 'P7';
    else if (name.includes('Form')) priority = 'P5';
    else if (name.includes('Card')) priority = 'P6';
    else if (name.includes('Header') || name.includes('Navigation')) priority = 'P4';
    
    return {
      componentName: name,
      filePath: f,
      status: 'not-started',
      priority,
      logicPreservationChecklist: [],
      testingStatus: {
        visualRegression: 'pending',
        accessibility: 'pending',
        interaction: 'pending'
      }
    };
  });
  
  const outputPath = 'specs/005-comprehensive-css-class/migration-status.json';
  fs.writeFileSync(outputPath, JSON.stringify({ components }, null, 2));
  
  console.log(`✅ Populated migration-status.json with ${components.length} components`);
  console.log(`\nPriority breakdown:`);
  const priorities = new Map();
  components.forEach(c => {
    priorities.set(c.priority, (priorities.get(c.priority) || 0) + 1);
  });
  priorities.forEach((count, priority) => {
    console.log(`  ${priority}: ${count} components`);
  });
}

main().catch(console.error);

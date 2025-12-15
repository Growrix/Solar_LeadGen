/**
 * Migration Script (T017)
 * 
 * CLI tool for migrating components to shadcn/ui.
 * Commands:
 * - audit: Run component logic audit
 * - migrate: Migrate a component (with backup)
 * - track: Update migration status
 * - report: Generate progress report
 * - rollback: Restore from backup
 * - validate: Check for violations
 * 
 * Usage: npx tsx scripts/migrate-component.ts <command> [args]
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface MigrationStatus {
  componentName: string;
  filePath: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'verified';
  priority: string;
  migrationDate?: string;
  migratedBy?: string;
  logicPreservationChecklist: Array<{ item: string; verified: boolean }>;
  testingStatus: {
    visualRegression: 'pending' | 'passed' | 'failed';
    accessibility: 'pending' | 'passed' | 'failed';
    interaction: 'pending' | 'passed' | 'failed';
  };
}

function loadMigrationStatus(): { components: MigrationStatus[] } {
  const statusPath = path.join('specs', '005-comprehensive-css-class', 'migration-status.json');
  if (fs.existsSync(statusPath)) {
    return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
  }
  return { components: [] };
}

function saveMigrationStatus(status: { components: MigrationStatus[] }) {
  const statusPath = path.join('specs', '005-comprehensive-css-class', 'migration-status.json');
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
}

function createBackup(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = path.basename(filePath);
  const backupDir = path.join('backup', timestamp.split('T')[0]);
  fs.mkdirSync(backupDir, { recursive: true });
  
  const backupPath = path.join(backupDir, fileName);
  fs.copyFileSync(filePath, backupPath);
  
  console.log(`✅ Backup created: ${backupPath}`);
  return backupPath;
}

function trackMigration(componentName: string, status: string, verifiedBy?: string) {
  const migrationStatus = loadMigrationStatus();
  
  let component = migrationStatus.components.find(c => c.componentName === componentName);
  
  if (!component) {
    component = {
      componentName,
      filePath: `src/components/${componentName}.tsx`,
      status: 'not-started',
      priority: 'P10',
      logicPreservationChecklist: [],
      testingStatus: {
        visualRegression: 'pending',
        accessibility: 'pending',
        interaction: 'pending',
      },
    };
    migrationStatus.components.push(component);
  }
  
  component.status = status as any;
  if (status === 'completed' || status === 'verified') {
    component.migrationDate = new Date().toISOString();
    if (verifiedBy) {
      component.migratedBy = verifiedBy;
    }
  }
  
  saveMigrationStatus(migrationStatus);
  console.log(`✅ Migration status updated: ${componentName} → ${status}`);
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'audit':
      if (args.length === 0) {
        console.error('❌ Error: Please provide a file path');
        console.log('Usage: npx tsx scripts/migrate-component.ts audit src/components/Button.tsx');
        process.exit(1);
      }
      execSync(`npx tsx scripts/audit-component-logic.ts ${args[0]}`, { stdio: 'inherit' });
      break;
    
    case 'backup':
      if (args.length === 0) {
        console.error('❌ Error: Please provide a file path');
        process.exit(1);
      }
      createBackup(args[0]);
      break;
    
    case 'track':
      if (args.length < 2) {
        console.error('❌ Error: Please provide component name and status');
        console.log('Usage: npx tsx scripts/migrate-component.ts track Button completed --verified-by john');
        process.exit(1);
      }
      const verifiedBy = args.find(arg => arg.startsWith('--verified-by='))?.split('=')[1];
      trackMigration(args[0], args[1], verifiedBy);
      break;
    
    case 'report':
      const status = loadMigrationStatus();
      const total = status.components.length;
      const completed = status.components.filter(c => c.status === 'completed' || c.status === 'verified').length;
      console.log(`\n📊 Migration Progress Report`);
      console.log(`─────────────────────────────`);
      console.log(`Total Components: ${total}`);
      console.log(`Completed: ${completed}`);
      console.log(`Pending: ${total - completed}`);
      console.log(`Progress: ${total > 0 ? Math.round((completed / total) * 100) : 0}%\n`);
      break;
    
    case 'validate':
      execSync(`npx tsx scripts/validate-classnames.ts`, { stdio: 'inherit' });
      break;
    
    default:
      console.log(`
Migration CLI Tool

Commands:
  audit <file>              Run component logic audit
  backup <file>             Create backup of component
  track <name> <status>     Update migration status
  report                    Show progress report
  validate                  Check for className violations

Examples:
  npx tsx scripts/migrate-component.ts audit src/components/Button.tsx
  npx tsx scripts/migrate-component.ts backup src/components/Button.tsx
  npx tsx scripts/migrate-component.ts track Button completed --verified-by=john
  npx tsx scripts/migrate-component.ts report
  npx tsx scripts/migrate-component.ts validate
      `);
  }
}

main().catch(console.error);

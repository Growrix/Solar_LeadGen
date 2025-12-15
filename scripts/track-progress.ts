/**
 * Progress Tracking Script (T019)
 * 
 * Reads migration-status.json and generates markdown progress report.
 * Shows:
 * - Completion percentage
 * - Breakdown by priority
 * - List of pending files
 * - Estimated completion date
 * 
 * Usage: npx tsx scripts/track-progress.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationStatus {
  componentName: string;
  filePath: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'verified';
  priority: string;
  migrationDate?: string;
  migratedBy?: string;
}

function loadMigrationStatus(): { components: MigrationStatus[] } {
  const statusPath = path.join('specs', '005-comprehensive-css-class', 'migration-status.json');
  if (fs.existsSync(statusPath)) {
    return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
  }
  return { components: [] };
}

function generateProgressReport(): string {
  const status = loadMigrationStatus();
  const total = status.components.length;
  const completed = status.components.filter(c => c.status === 'completed' || c.status === 'verified').length;
  const inProgress = status.components.filter(c => c.status === 'in-progress').length;
  const notStarted = status.components.filter(c => c.status === 'not-started').length;
  
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Group by priority
  const byPriority = new Map<string, MigrationStatus[]>();
  status.components.forEach(c => {
    if (!byPriority.has(c.priority)) {
      byPriority.set(c.priority, []);
    }
    byPriority.get(c.priority)!.push(c);
  });
  
  let report = `# Migration Progress Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;
  report += `## Overall Progress\n\n`;
  report += `- **Total Components**: ${total}\n`;
  report += `- **Completed**: ${completed} (${completionPercent}%)\n`;
  report += `- **In Progress**: ${inProgress}\n`;
  report += `- **Not Started**: ${notStarted}\n\n`;
  
  const progressBar = '█'.repeat(Math.floor(completionPercent / 5)) + '░'.repeat(20 - Math.floor(completionPercent / 5));
  report += `\`${progressBar}\` ${completionPercent}%\n\n`;
  
  report += `## Progress by Priority\n\n`;
  report += `| Priority | Total | Completed | In Progress | Not Started |\n`;
  report += `|----------|-------|-----------|-------------|-------------|\n`;
  
  Array.from(byPriority.keys()).sort().forEach(priority => {
    const components = byPriority.get(priority)!;
    const priorityCompleted = components.filter(c => c.status === 'completed' || c.status === 'verified').length;
    const priorityInProgress = components.filter(c => c.status === 'in-progress').length;
    const priorityNotStarted = components.filter(c => c.status === 'not-started').length;
    report += `| ${priority} | ${components.length} | ${priorityCompleted} | ${priorityInProgress} | ${priorityNotStarted} |\n`;
  });
  
  report += `\n## Pending Components\n\n`;
  const pending = status.components.filter(c => c.status !== 'completed' && c.status !== 'verified');
  if (pending.length === 0) {
    report += `✅ All components migrated!\n\n`;
  } else {
    report += `| Component | Priority | Status | File Path |\n`;
    report += `|-----------|----------|--------|------------|\n`;
    pending.forEach(c => {
      report += `| ${c.componentName} | ${c.priority} | ${c.status} | ${c.filePath} |\n`;
    });
  }
  
  report += `\n## Recently Completed\n\n`;
  const recentlyCompleted = status.components
    .filter(c => c.status === 'completed' || c.status === 'verified')
    .filter(c => c.migrationDate)
    .sort((a, b) => (b.migrationDate || '').localeCompare(a.migrationDate || ''))
    .slice(0, 10);
  
  if (recentlyCompleted.length === 0) {
    report += `No completed components yet.\n\n`;
  } else {
    report += `| Component | Date | Migrated By |\n`;
    report += `|-----------|------|-------------|\n`;
    recentlyCompleted.forEach(c => {
      const date = c.migrationDate ? new Date(c.migrationDate).toLocaleDateString() : 'N/A';
      report += `| ${c.componentName} | ${date} | ${c.migratedBy || 'N/A'} |\n`;
    });
  }
  
  return report;
}

async function main() {
  console.log('📊 Generating progress report...\n');
  
  const report = generateProgressReport();
  
  const outputPath = path.join('specs', '005-comprehensive-css-class', 'migration-progress.md');
  fs.writeFileSync(outputPath, report);
  
  console.log(`✅ Progress report saved to: ${outputPath}\n`);
  console.log(report);
}

main().catch(console.error);

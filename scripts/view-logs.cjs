#!/usr/bin/env node

// Use CommonJS for better command-line compatibility
const fs = require('fs');
const path = require('path');

/**
 * Simple viewer for action logs
 * Usage:
 *   node view-logs.cjs [date] [action]
 *   - date: Specific date to view (YYYY-MM-DD), defaults to today
 *   - action: Filter by action type (e.g., 'sync_push', 'deploy_workflow')
 */

// Parse arguments
const dateArg = process.argv[2]?.match(/^\d{4}-\d{2}-\d{2}$/) ? process.argv[2] : null;
const actionArg = !dateArg ? process.argv[2] : process.argv[3];

// Get target date
const targetDate = dateArg || new Date().toISOString().split('T')[0];
const logDir = path.resolve(__dirname, '..', 'cursor_logs', 'actions');
const logFile = path.join(logDir, `${targetDate}.log`);

// Check if log file exists
if (!fs.existsSync(logFile)) {
  console.error(`No logs found for ${targetDate}`);
  console.log('Available log dates:');
  
  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir)
      .filter(f => f.endsWith('.log'))
      .map(f => f.replace('.log', ''))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('  No logs found');
    } else {
      files.forEach(f => console.log(`  ${f}`));
    }
  } else {
    console.log('  No logs directory found');
  }
  
  process.exit(1);
}

// Read and parse logs
try {
  const content = fs.readFileSync(logFile, 'utf8');
  const logs = content
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (err) {
        console.error(`Error parsing line: ${line}`);
        return null;
      }
    })
    .filter(Boolean);

  // Filter by action if specified
  const filteredLogs = actionArg 
    ? logs.filter(log => log.action === actionArg)
    : logs;

  // Display logs
  console.log(`📊 Log report for ${targetDate}${actionArg ? ` (action: ${actionArg})` : ''}\n`);

  if (filteredLogs.length === 0) {
    console.log('No matching logs found');
    if (actionArg) {
      console.log('\nAvailable actions in this log:');
      const actions = [...new Set(logs.map(log => log.action))];
      actions.forEach(a => console.log(`  ${a}`));
    }
    process.exit(0);
  }

  // Group by action
  const byAction = {};
  filteredLogs.forEach(log => {
    byAction[log.action] = byAction[log.action] || [];
    byAction[log.action].push(log);
  });

  // Display summary by action
  Object.entries(byAction).forEach(([action, entries]) => {
    const successes = entries.filter(e => e.status === 'success').length;
    const warnings = entries.filter(e => e.status === 'warning').length;
    const failures = entries.filter(e => e.status === 'failure').length;
    
    console.log(`\n🔷 ${action} (${entries.length} entries)`);
    console.log(`  ✅ Success: ${successes}`);
    if (warnings > 0) console.log(`  ⚠️ Warnings: ${warnings}`);
    if (failures > 0) console.log(`  ❌ Failures: ${failures}`);
    
    // Show details for each entry
    entries.forEach((entry, i) => {
      const ts = new Date(entry.timestamp).toLocaleTimeString();
      const emoji = entry.status === 'success' ? '✅' : entry.status === 'warning' ? '⚠️' : '❌';
      console.log(`\n  ${emoji} [${ts}] Entry #${i+1}`);
      
      // Handle different action types appropriately
      switch (action) {
        case 'sync_pull':
          console.log(`    Downloaded ${entry.details.count} workflows`);
          break;
        case 'sync_push':
          console.log(`    Pushed ${entry.details.successCount} of ${entry.details.totalCount} workflows`);
          if (entry.details.failureCount > 0) {
            console.log(`    Failed: ${entry.details.results.filter(r => r.status === 'failure').map(r => r.name).join(', ')}`);
          }
          break;
        case 'deploy_workflow':
          console.log(`    File: ${entry.details.file}`);
          if (entry.details.name) console.log(`    Workflow: ${entry.details.name}`);
          if (entry.details.error) console.log(`    Error: ${entry.details.error}`);
          break;
        case 'deploy_directory':
          console.log(`    Directory: ${entry.details.directory}`);
          console.log(`    Results: ${entry.details.successCount}/${entry.details.totalCount} successful`);
          break;
        default:
          // Generic display for other action types
          Object.entries(entry.details).forEach(([key, value]) => {
            // Skip complex objects to avoid clutter
            if (typeof value === 'object' && value !== null) {
              console.log(`    ${key}: [Complex data]`);
            } else {
              console.log(`    ${key}: ${value}`);
            }
          });
      }
    });
  });
} catch (error) {
  console.error(`Error reading log file: ${error.message}`);
  process.exit(1);
} 
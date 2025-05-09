#!/usr/bin/env node

// Simple CommonJS script for logging actions
const fs = require('fs');
const path = require('path');

/**
 * Logs an action performed in the system
 * @param {string} action - The action performed (e.g., 'workflow_sync', 'deployment')
 * @param {Object} details - Additional details about the action
 * @param {string} [status='success'] - Status of the action ('success', 'failure', 'warning')
 */
function logAction(action, details, status = 'success') {
  try {
    // Create logs directory if it doesn't exist
    const logDir = path.resolve(__dirname, '..', 'cursor_logs', 'actions');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create timestamp and filename
    const timestamp = new Date().toISOString();
    const dateForFilename = timestamp.split('T')[0];
    const logFile = path.join(logDir, `${dateForFilename}.log`);
    
    // Format log entry
    const logEntry = {
      timestamp,
      action,
      status,
      details
    };
    
    // Append to log file
    fs.appendFileSync(
      logFile, 
      `${JSON.stringify(logEntry)}\n`, 
      'utf8'
    );
    
    // Also log to console
    const statusEmoji = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${statusEmoji} ${action}: ${JSON.stringify(details)}`);
    
    return true;
  } catch (error) {
    // Log error to error file
    const errorFile = path.resolve(__dirname, '..', 'cursor_logs', 'error.log');
    fs.appendFileSync(
      errorFile, 
      `\n[${new Date().toISOString()}] Action Logger Error: ${error.message}\n${error.stack}\n`, 
      'utf8'
    );
    console.error(`❌ Error logging action: ${error.message}`);
    return false;
  }
}

// Direct execution
if (require.main === module) {
  const testAction = process.argv[2] || 'test_action';
  const testDetails = process.argv[3] ? JSON.parse(process.argv[3]) : { message: 'Test action log' };
  const testStatus = process.argv[4] || 'success';
  
  const result = logAction(testAction, testDetails, testStatus);
  console.log(`Log creation ${result ? 'successful' : 'failed'}`);
}

module.exports = { logAction }; 
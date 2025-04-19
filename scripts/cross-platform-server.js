/**
 * Cross-platform server wrapper for Quizzoo App
 * This script ensures that server commands work properly on both Windows and Unix-like systems
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Determine if we're running on Windows
const isWindows = os.platform() === 'win32';
console.log(`[Server] Detected platform: ${isWindows ? 'Windows' : 'Unix-like'}`);

// Helper function to run commands cross-platform
function runCommand(command, args, options = {}) {
  console.log(`[Server] Running command: ${command} ${args.join(' ')}`);
  
  if (isWindows) {
    // Windows-specific command execution
    return spawn('cmd', ['/c', command, ...args], {
      stdio: 'inherit',
      shell: true,
      ...options
    });
  } else {
    // Unix-like systems
    return spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
  }
}

// Define server start command - adjust as needed based on your actual server
function startServer() {
  console.log('[Server] Starting Quizzoo server...');
  
  // Increase timeout for Supabase connection
  process.env.SUPABASE_TIMEOUT = '60000';
  
  // Start server with increased timeout
  const serverProcess = runCommand('npx', ['expo', 'start'], {
    env: {
      ...process.env,
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
      REACT_NATIVE_PACKAGER_HOSTNAME: '127.0.0.1'
    }
  });
  
  // Handle server process events
  serverProcess.on('error', (err) => {
    console.error('[Server] Failed to start server:', err);
    retryServerStart();
  });
  
  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`[Server] Server process exited with code ${code}, attempting to restart...`);
      retryServerStart();
    }
  });
  
  return serverProcess;
}

// Helper to retry server start with delay
function retryServerStart(delay = 3000) {
  console.log(`[Server] Retrying server start in ${delay/1000} seconds...`);
  setTimeout(() => {
    startServer();
  }, delay);
}

// Start server immediately
startServer(); 
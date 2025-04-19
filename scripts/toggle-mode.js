/**
 * Toggle-Mode Script for Quizzoo App (Simplified)
 * 
 * This script allows toggling between development and Expo modes
 * with 'S' key press
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Add polyfill for replaceAll
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(str, newStr) {
    // If a regex pattern
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
      return this.replace(str, newStr);
    }
    
    // If a string
    return this.replace(new RegExp(str, 'g'), newStr);
  };
  console.log('Applied replaceAll polyfill');
}

// Configure modes
const MODES = {
  EXPO: {
    name: 'Expo Mode',
    command: 'expo',
    args: ['start'],
    env: { EXPO_NO_DEV_LAUNCHER: '1' }
  },
  DEV: {
    name: 'Development Mode',
    command: 'expo',
    args: ['start', '--dev-client'],
    env: {}
  }
};

// State tracking
let currentMode = 'EXPO';
let currentProcess = null;

// Start the server in the current mode
function startServer() {
  console.log(`Starting Quizzoo App in ${MODES[currentMode].name}`);
  
  // Stop existing process if running
  if (currentProcess) {
    currentProcess.kill();
    currentProcess = null;
  }
  
  // Start new process with the correct mode
  const mode = MODES[currentMode];
  currentProcess = spawn('npx', [mode.command, ...mode.args], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...mode.env
    }
  });
  
  console.log(`Press 'S' to switch modes (current: ${mode.name})`);
}

// Toggle between modes
function toggleMode() {
  currentMode = currentMode === 'EXPO' ? 'DEV' : 'EXPO';
  console.log(`Switching to ${MODES[currentMode].name}...`);
  startServer();
}

// Setup keyboard input listener
function setupKeyboardListener() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  
  process.stdin.on('keypress', (str, key) => {
    // Exit on Ctrl+C
    if (key.ctrl && key.name === 'c') {
      if (currentProcess) {
        currentProcess.kill();
      }
      process.exit();
    }
    
    // Toggle mode on 'S' key press
    if (key.name === 's' || key.name === 'S') {
      toggleMode();
    }
  });
  
  console.log('Keyboard listener set up - press S to toggle modes');
}

// Initialize
console.log('QUIZZOO APP MODE TOGGLER');
console.log('------------------------');
setupKeyboardListener();
startServer(); 
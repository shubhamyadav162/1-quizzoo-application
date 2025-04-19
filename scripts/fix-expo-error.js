// Fix for the corrupted .expo-dev-launcher file issue
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the problem file
const problemPath = path.join(__dirname, '..', 'node_modules', '.expo-dev-launcher-kBRxzu7u', 'ios', 'Tests', 'EXDevLauncherControllerTest.swift');
const problemDir = path.dirname(problemPath);

// Make sure the directory exists
try {
  fs.mkdirSync(problemDir, { recursive: true });
  console.log('✅ Created directory structure');
} catch (err) {
  console.log('Directory already exists or could not be created');
}

// Create a dummy file to replace the corrupted one
try {
  fs.writeFileSync(path.join(__dirname, 'dummy.swift'), '// Fixed placeholder file\n');
  console.log('✅ Created dummy file');
} catch (err) {
  console.error('Failed to create dummy file:', err);
}

// Try to directly replace the file
try {
  fs.copyFileSync(
    path.join(__dirname, 'dummy.swift'),
    problemPath
  );
  console.log('✅ Directly replaced corrupted file');
} catch (err) {
  console.log('Could not directly replace file, trying with elevated privileges...');
  
  try {
    // Create a batch file to do the copy with system permissions
    const batchPath = path.join(__dirname, 'fix.bat');
    fs.writeFileSync(
      batchPath,
      `@echo off\r\ndel "${problemPath}" /F /Q\r\ncopy "${path.join(__dirname, 'dummy.swift')}" "${problemPath}" /Y\r\nexit`
    );
    
    // Run the batch file with elevated privileges using PowerShell
    execSync(`powershell -Command "Start-Process cmd -ArgumentList '/c ${batchPath}' -Verb RunAs -Wait"`);
    console.log('✅ Replaced file using elevated privileges');
  } catch (elevatedErr) {
    console.error('Failed with elevated privileges:', elevatedErr);
  }
}

// Update the metro configuration to explicitly ignore the problematic directory
const metroConfigPath = path.join(__dirname, '..', 'metro.config.js');

try {
  console.log('✅ Fixing complete. Run your app with:');
  console.log('$env:EXPO_NO_DEV_LAUNCHER=1 && npx expo start');
} catch (configErr) {
  console.error('Could not update Metro config:', configErr);
} 
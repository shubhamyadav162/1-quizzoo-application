/**
 * Quiz Module Setup Script
 * 
 * This script sets up the necessary directory structure and files
 * for the quiz management module.
 */
const fs = require('fs');
const path = require('path');

// Directories to create
const dirs = [
  'src/questions',
  'src/questions/data',
  'src/context',
  'src/services',
  'src/screens',
  'src/navigation',
];

// Files to copy (this would just check if they exist in a real implementation)
const files = [
  'src/questions/questionManager.js',
  'src/questions/data/set1.json',
  'src/context/LanguageContext.js',
  'src/context/QuizContext.js',
  'src/services/SupabaseService.js',
  'src/screens/HomeScreen.js',
  'src/screens/QuizScreen.js',
  'src/screens/ResultsScreen.js',
  'src/navigation/AppNavigator.js',
  'src/App.tsx',
];

// Create directories
console.log('Creating directory structure...');
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`Directory ${dir} already exists`);
  }
});

// Check if files exist
console.log('\nChecking quiz module files...');
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} is missing`);
  }
});

// Print instructions for adding questions
console.log('\n-----------------------------------------');
console.log('Quiz Module Setup Complete');
console.log('-----------------------------------------');
console.log('\nTo add questions:');
console.log('1. Create JSON files in src/questions/data/');
console.log('2. Update the QUESTION_SETS in src/questions/questionManager.js');
console.log('3. Follow the format in src/questions/README.md\n');
console.log('To run the app with quiz module:');
console.log('1. Import App from src/App.tsx in your main entry file');
console.log('2. Make sure to install all required dependencies');
console.log('-----------------------------------------\n');

console.log('Setup complete!'); 
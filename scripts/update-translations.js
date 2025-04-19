const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * This script helps identify components that need to be migrated 
 * to use ThemedText for proper translations across the app.
 * 
 * Run with: node scripts/update-translations.js
 */

console.log('Scanning for components that need translation updates...');

// Find all components using standard Text component
const findTextComponentsCommand = 'grep -r "<Text" --include="*.tsx" --include="*.jsx" ./app ./components';
try {
  const result = execSync(findTextComponentsCommand).toString();
  const lines = result.split('\n').filter(Boolean);
  
  console.log(`Found ${lines.length} potential lines to check for translation updates.`);
  console.log('\nFiles that need to be updated:');
  
  // Get unique files
  const files = [...new Set(lines.map(line => line.split(':')[0]))];
  
  files.forEach(file => {
    console.log(`- ${file}`);
  });
  
  console.log('\nInstructions:');
  console.log('1. For each file, replace the React Native Text import with:');
  console.log('   import { Text } from \'@/components/AutoText\';');
  console.log('   Remove "Text" from the react-native import destructuring.');
  console.log('2. For any hardcoded strings, consider adding them to the translation dictionary in:');
  console.log('   app/lib/LanguageContext.tsx');
  console.log('3. For strings that should not be translated (like dynamic values), use:');
  console.log('   <ThemedText skipTranslation={true}>...<ThemedText>');
  console.log('4. For strings that should use a specific translation key, use:');
  console.log('   <ThemedText translationKey="key_name">...<ThemedText>');
  
} catch (error) {
  console.error('Error scanning components:', error.message);
} 
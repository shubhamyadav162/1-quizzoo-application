/**
 * Module fix script for Expo compatibility issues
 * Resolves ES module vs CommonJS issues with specific packages
 */
const fs = require('fs');
const path = require('path');

console.log('Starting module compatibility fixes...');

// Fix for expo-web-browser
try {
  const webBrowserPath = path.join(__dirname, '..', 'node_modules', 'expo-web-browser', 'build', 'WebBrowser.js');
  
  if (fs.existsSync(webBrowserPath)) {
    console.log('Fixing expo-web-browser module...');
    
    let content = fs.readFileSync(webBrowserPath, 'utf8');
    
    // Replace all ES imports with CommonJS requires
    content = content.replace(
      "import { UnavailabilityError } from 'expo-modules-core';", 
      "const { UnavailabilityError } = require('expo-modules-core');"
    );
    
    content = content.replace(
      "import { AppState, Linking, Platform, processColor, } from 'react-native';",
      "const { AppState, Linking, Platform, processColor } = require('react-native');"
    );
    
    // Replace any additional import statements
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g, 
      (match, imports, module) => {
        const importItems = imports.split(',').map(item => item.trim());
        return `const { ${importItems.join(', ')} } = require('${module}');`;
      }
    );
    
    // Fix export statements
    content = content.replace(/export\s+\{([^}]+)\}/g, 
      (match, exports) => {
        const exportItems = exports.split(',').map(item => item.trim());
        return `module.exports = { ${exportItems.join(', ')} }`;
      }
    );
    
    fs.writeFileSync(webBrowserPath, content, 'utf8');
    console.log('Fixed expo-web-browser module successfully!');
  } else {
    console.log('expo-web-browser module not found at expected path');
  }
} catch (error) {
  console.error('Error fixing expo-web-browser:', error);
}

console.log('Module fixes completed.'); 
// Metro bundler polyfill file
// This fixes the "Cannot read properties of undefined (reading 'replaceAll')" error

// Add replaceAll polyfill to prevent Metro bundler errors
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(str, newStr) {
    // If a regex pattern
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') 
      return this.replace(str, newStr);
    
    // If a string
    return this.replace(new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
  };
  console.log('📱 Applied replaceAll polyfill to Metro bundler');
}

// Export the polyfill so it can be required
module.exports = {}; 
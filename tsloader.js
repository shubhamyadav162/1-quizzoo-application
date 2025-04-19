/**
 * Custom Haste implementation to fix duplicated files error
 * This implementation returns an empty haste map to completely disable the system
 */
module.exports = {
  // Return empty/null values for all Haste methods
  getHasteName: () => null,
  getModulePath: () => null,
  getDependencies: () => [],
  
  // No-op emitter
  emit: () => {},
  on: () => {},
  
  // Required caching method
  getCacheKey: () => 'metro-resolver-cache-key',
  
  // This is the most important part - disable name creation entirely
  createModuleIdFactory: () => path => {
    // Use path directly instead of Haste-based naming
    return path;
  }
}; 
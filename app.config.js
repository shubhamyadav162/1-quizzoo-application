const appJson = require('./app.json');

// Get environment variables or use defaults
const appEnv = process.env.APP_ENV || 'development';
const isProduction = appEnv === 'production';
const isMinimal = appEnv === 'minimal';
const isPreview = appEnv === 'preview';

// Start with the base config from app.json
const config = { ...appJson.expo };

// Ensure the EAS project ID is set
if (!config.extra) {
  config.extra = {};
}

if (!config.extra.eas) {
  config.extra.eas = {};
}

config.extra.eas.projectId = "305a21b0-7873-4d5c-af5f-c87d08a147f5";

// Set asset bundle patterns based on build profile
if (isMinimal || isPreview) {
  config.assetBundlePatterns = [
    "assets/fonts/*",
    "assets/images/*.png",
    "assets/animations/*.json",
    "assets/sounds/*.mp3",
  ];
}

// Add Android-specific optimizations for minimal builds
if (isMinimal || isPreview) {
  if (!config.android) {
    config.android = {};
  }
  
  config.android.buildType = 'apk';
}

// For minimal builds, remove development features
if (isMinimal) {
  delete config.developmentClient;
  delete config.packagerOpts;
  delete config.devClient;
}

module.exports = config; 
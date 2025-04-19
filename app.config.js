const appJson = require('./app.json');
const path = require('path');

// Get environment variables or use defaults
const appEnv = process.env.APP_ENV || 'development';
const isProduction = appEnv === 'production';
const isMinimal = appEnv === 'minimal';
const isPreview = appEnv === 'preview';

// Optimization for minimal build
const config = {
  ...appJson.expo,
  hooks: {
    postExport: {
      config: async (config) => {
        if (isMinimal || isPreview) {
          // Apply optimizations here
          return {
            ...config,
            android: {
              ...config.android,
              buildType: 'apk',
              enableProguardInReleaseBuilds: true,
              enableShrinkResources: true,
              useNextNativeModulesDir: true,
              proguardRules: `
                -keep class com.quizzoo.app.** { *; }
                -dontwarn com.facebook.hermes.**
                -keep class com.facebook.hermes.** { *; }
                -dontwarn java.awt.**
              `
            },
          };
        }
        return config;
      },
    },
  },
  // Optimized asset loading for minimal builds
  assetBundlePatterns: isMinimal || isPreview
    ? [
        "assets/fonts/*",
        "assets/images/*.png",
        "assets/animations/*.json",
        "assets/sounds/*.mp3",
      ]
    : appJson.expo.assetBundlePatterns || ["**/*"],
};

if (isMinimal) {
  // Remove unnecessary features for minimal build
  delete config.developmentClient;
  delete config.packagerOpts;
  delete config.devClient;
}

module.exports = config; 
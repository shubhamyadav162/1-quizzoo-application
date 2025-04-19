# How to Build an Optimized Android APK for Quizzoo App

This guide provides step-by-step instructions to build an Android APK with minimal size and optimizations.

## Prerequisites

- Node.js and npm installed
- Android SDK installed (for local builds)
- JDK 11 or newer

## Option 1: Using the Provided Build Scripts (Recommended)

We've created several build scripts to make APK generation easy:

### For Minimal APK Size

```bash
# Run the optimized build script
./build-optimized-apk.bat
```

This script:
1. Cleans unnecessary assets to reduce APK size
2. Generates a production-ready Android project
3. Creates an optimized JavaScript bundle
4. Builds a release APK with ProGuard enabled
5. Places the final APK in the `build/` directory

### For EAS Build (Alternative)

```bash
# Build using Expo Application Services
./eas-build.bat
```

## Option 2: Manual Build Process

If you prefer manual control, follow these steps:

1. **Clean assets** to reduce APK size:
   ```bash
   node scripts/clean-assets.js
   ```

2. **Generate native code** with Expo:
   ```bash
   npx expo prebuild --platform android --clean
   ```

3. **Generate production bundle**:
   ```bash
   mkdir -p android/app/src/main/assets
   npx react-native bundle --platform android --dev false \
     --entry-file index.js \
     --bundle-output android/app/src/main/assets/index.android.bundle \
     --assets-dest android/app/src/main/res
   ```

4. **Build the APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. The final APK will be in `android/app/build/outputs/apk/release/app-release.apk`

## Optimizations Applied

The APK is optimized using several techniques:

- **ProGuard** to remove unused code
- **Resource shrinking** to remove unused resources
- **PNG optimization** for smaller image sizes
- **Asset filtering** to include only necessary files
- **Code minification** to reduce JavaScript size

## Troubleshooting

If you encounter any issues:

1. Ensure all required dependencies are installed
2. Check Android SDK and JDK versions
3. Verify that environment variables are set correctly
4. Look for errors in the build output

## Additional Notes

- The debug keystore is used for development builds. For production, generate a proper keystore file.
- To reduce APK size further, consider removing unused fonts, animations, and assets.
- Test the APK thoroughly after building to ensure all features work correctly.

## Support

For assistance, contact the development team or check the project documentation. 
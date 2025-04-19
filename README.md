# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Building APK for Android

To build an APK for Android, follow these steps:

1. Install EAS CLI if you haven't already:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Create a build profile for Android APK:
   ```bash
   eas build:configure
   ```

4. Build the APK:
   ```bash
   eas build -p android --profile preview
   ```

5. Once the build is complete, you can download the APK from the Expo website or use the direct link provided in the command output.

## Project Structure

The project follows this structure:

- `/app` - Main application code with screens and navigation
- `/assets` - Static assets like images and fonts
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/constants` - App constants and configuration
- `/database` - Database related files and SQL scripts
- `/docs` - Documentation files
- `/env` - Environment configuration files
- `/scripts` - Utility scripts for development
- `/types` - TypeScript type definitions

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# Quizzoo App

## Logo Implementation Guide

Buffalo logo files needed:

1. **App Icon**: `assets/images/buffalo-icon.png`
   - Square format (1024×1024px)
   - Used in app stores and as main app icon

2. **Favicon**: `assets/images/buffalo-favicon.png`
   - Small square format (32×32px)
   - Used in web browsers

3. **Adaptive Icon**: `assets/images/buffalo-adaptive-icon.png`
   - Foreground image for Android (108×108px)
   - Keep important content in center circle (72px diameter)

4. **Splash Screen Icon**: `assets/images/buffalo-splash-icon.png`
   - High resolution version (at least 200px width)
   - Used on app loading screen

## Implementation Status

**Current Status**: Temporary placeholder files have been created with the buffalo-prefix. These files need to be replaced with properly optimized versions of the buffalo logo.

## Next Steps:

1. Use the buffalo image from `photo_2025-03-18_16-21-42.jpg` to create optimized versions for each format
2. Replace the temporary files with the properly sized/formatted buffalo logo
3. Ensure each file is saved in PNG format with transparency where appropriate
4. Test the app on different devices to verify logo appearance

For best results:
- Keep transparent backgrounds for adaptive icon
- Ensure the favicon is clear even at small sizes
- Make sure the splash icon looks good on a white background

## Unified Status Bar Implementation

The app now uses a single, unified status bar component that provides consistent appearance across all screens. Key changes:

1. Removed all individual status bar implementations from screens
2. Created a centralized `UnifiedStatusBar` component that:
   - Maintains consistent styling in both dark and light modes
   - Never gets hidden during gameplay or transitions
   - Is automatically applied to all screens

### Key Benefits

- Consistent user experience across the entire app
- No more status bar refreshing or glitches during gameplay
- Simplified codebase with one source of truth for status bar styling
- Proper adaptation to both dark and light modes

### Implementation Details

The `UnifiedStatusBar` component is mounted at the root app layout, ensuring it's applied globally to all screens without requiring individual screen components to manage the status bar.

```tsx
// From app/_layout.tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <AuthProvider>
    <AppThemeProvider>
      <UnifiedStatusBar />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* App screens */}
        </Stack>
      </ThemeProvider>
    </AppThemeProvider>
  </AuthProvider>
</GestureHandlerRootView>
```

This approach ensures a stable, consistent status bar across the entire application without the need for per-screen adjustments.

## Profile Table Infinite Recursion Fix

If you encounter the error `"infinite recursion detected in policy for relation \"profiles\""`, follow these steps:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the SQL from the file `database/profiles-fix.sql` 
4. Run the SQL query to fix the RLS policies
5. Restart your application

The fix removes problematic policies that were causing the infinite recursion and replaces them with simplified ones that work properly.

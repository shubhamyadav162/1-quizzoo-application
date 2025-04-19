# Status Bar Migration Guide

## Overview

We've implemented a unified status bar approach using a new `UnifiedStatusBar` component that is mounted at the app's root layout. This provides consistent status bar styling across the entire app.

## Current Status

✅ Created the new `UnifiedStatusBar` component in `components/UnifiedStatusBar.tsx`  
✅ Added the component to the root layout in `app/_layout.tsx`  
✅ Removed old status bar components `ThemedStatusBar.tsx` and `StatusBarController.tsx`  
✅ Created a temporary compatibility component to prevent bundling errors  

## Next Steps to Complete Migration

To fully implement the unified status bar approach, follow these steps:

1. We've created a temporary `StatusBarFixer.tsx` component that provides compatibility with existing code. This is just a temporary measure to keep the app running while migrations are completed.

2. Systematically update all files that still reference `ThemedStatusBar`:

   - Remove imports: `import ThemedStatusBar from '@/components/ThemedStatusBar';` or `import { ThemedStatusBar } from '@/components/ThemedStatusBar';`
   - Remove usage: Delete all `<ThemedStatusBar />` component instances
   - Remove status bar options: Delete any `statusBarStyle` or `statusBarTranslucent` properties in `Stack.Screen` options

3. Files that need updating:

   - `app/game/[id].tsx`
   - `app/game/kbc.tsx`
   - `app/contest/[id].tsx`
   - `app/bypass-login.tsx`
   - `app/auth/verify.tsx`
   - `app/auth/update-password.tsx`
   - `app/auth/reset-password.tsx`
   - `app/(tabs)/wallet.tsx`
   - `app/(tabs)/profile.tsx`
   - `app/(tabs)/contests.tsx`
   - `app/(tabs)/_layout.tsx` (already fixed)

4. After all files are updated, you can delete the temporary `components/StatusBarFixer.tsx` file.

## Benefits of Unified Status Bar

- Consistent user experience across the entire app
- No more status bar flickering or glitches during gameplay 
- Simplified code with a single source of truth for status bar styling
- Proper adaptation to both dark and light modes

## Implementation Details

The `UnifiedStatusBar` component is mounted at the root app layout, ensuring it's applied globally:

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

This approach ensures a stable, consistent status bar across the entire application. 
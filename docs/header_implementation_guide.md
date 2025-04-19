# Quizzoo App Header Implementation Guide

This guide explains how to implement consistent, beautiful headers across the entire Quizzoo app using our new header components.

## Background

We've developed a unified approach to app headers with these goals:

- Beautiful, immersive headers that match status bar styling
- Consistent UI across all screens
- Proper dark/light mode support
- Reduced code duplication

## Overview of Components

We have three main header options to choose from:

### 1. GradientHeader

This component provides a beautiful gradient background header that extends to the status bar for an immersive feel.

```tsx
import { GradientHeader } from '@/components/GradientHeader';

<GradientHeader 
  title="Profile" 
  showBackButton={true}
  rightElement={<TouchableOpacity onPress={handleSettings}><Ionicons name="settings" size={24} color="#FFFFFF" /></TouchableOpacity>}
  // Optional: Override default gradient colors
  // lightColors={['#3949AB', '#5C6BC0']} // Default light mode colors
  // darkColors={['#1A237E', '#303F9F']} // Default dark mode colors
/>
```

### 2. TransparentHeader

This component provides a transparent header that works well with background images or videos.

```tsx
import { TransparentHeader } from '@/components/TransparentHeader';

<TransparentHeader 
  title="Game Tutorial" 
  showBackButton={true}
  // Optional: Override default text colors
  lightTextColor="#FFFFFF" // Light mode text color 
  darkTextColor="#FFFFFF" // Dark mode text color
/>
```

### 3. Standard Header (Existing Component)

Our existing `Header` component is still available for regular screens:

```tsx
import { Header } from '@/components/Header';

<Header 
  title="Settings" 
  showBackButton={true}
  // Other standard header props
/>
```

## Status Bar Handling

All status bar styling is now handled by the `UnifiedStatusBar` component added at the root layout level. This means:

1. DO NOT add additional status bar components to your screens
2. Remove any existing `ThemedStatusBar` or `StatusBar` components
3. Status bar styling will automatically adapt to light/dark mode
4. For games or immersive experiences where you want a specific status bar look, use the appropriate header component

## Implementation Strategy

Use each header type based on the screen type:

| Screen Type | Recommended Header | Examples |
|-------------|-------------------|----------|
| Main/Primary | GradientHeader | Profile, Home, Contests |
| Game/Immersive | TransparentHeader | Game screens, Onboarding |
| Utility/Info | Standard Header | Settings, Help, FAQ |

## Removing Old Status Bar Components

Follow these steps to migrate existing screens:

1. Remove imports: `import ThemedStatusBar from '@/components/ThemedStatusBar';` or `import { ThemedStatusBar } from '@/components/ThemedStatusBar';`
2. Remove usage: Delete all `<ThemedStatusBar />` component instances
3. Implement the appropriate header component from the options above

## Examples of Implementation

### Profile Screen (GradientHeader)

```tsx
import { GradientHeader } from '@/components/GradientHeader';

return (
  <ThemedView style={styles.container}>
    <GradientHeader 
      title="Profile" 
      showBackButton={false}
      rightElement={<SettingsButton />}
    />
    <ScrollView>
      {/* Profile content */}
    </ScrollView>
  </ThemedView>
);
```

### Game Screen (TransparentHeader)

```tsx
import { TransparentHeader } from '@/components/TransparentHeader';

return (
  <View style={styles.container}>
    <TransparentHeader 
      title="Quiz Game" 
      showBackButton={true}
      lightTextColor="#FFFFFF" 
      darkTextColor="#FFFFFF"
    />
    <GameComponent />
  </View>
);
```

## Testing Your Implementation

After implementing a new header, verify:

1. It displays correctly in both light and dark modes
2. The status bar text color is appropriate (light on dark backgrounds, dark on light backgrounds)
3. The header styling is consistent with similar screens
4. All actions (back button, right elements) work correctly

## Need Help?

Check the example header implementations in the scripts directory:
- `scripts/create-header-examples.js`

For migration assistance, see:
- `scripts/fix-statusbar.js` 
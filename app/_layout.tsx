import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, useColorScheme as useDeviceColorScheme, LogBox, UIManager, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import { StatusBarController } from '@/components/StatusBarController';
import { ThemedView } from '@/components/ThemedView';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Ignore ALL console warnings in production
// This is not recommended for development but helps with user experience
LogBox.ignoreAllLogs();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle deep linking setup for authentication
  useEffect(() => {
    // Set up deep link handling for the app
    const setupLinking = async () => {
      // Check for initial URL (cold start with deep link)
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('App started with URL:', initialUrl);
        
        // If the URL contains tokens, handle the authentication here
        if (initialUrl.includes('access_token') || initialUrl.includes('error')) {
          console.log('Initial URL contains auth parameters');
        }
      }
      
      // Listen for incoming links
      const subscription = Linking.addEventListener('url', ({ url }) => {
        console.log('Received URL event:', url);
        
        // Handle authentication URLs
        if (url.includes('access_token') || url.includes('error')) {
          console.log('URL contains auth parameters');
        }
      });
      
      return () => {
        subscription.remove();
      };
    };

    setupLinking();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const deviceColorScheme = useDeviceColorScheme();
  const prefix = Linking.createURL('/');
  
  console.log('Deep link prefix:', prefix);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemeProvider>
        <NavigationThemeProvider value={deviceColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <ThemedView style={styles.container}>
              <StatusBarController />
              <Stack
                initialRouteName="index"
                screenOptions={{
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'slide_from_right',
                  animationDuration: 200,
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
              </Stack>
            </ThemedView>
          </AuthProvider>
        </NavigationThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureRoot: {
    flex: 1,
  }
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, StatusBar, AppState, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs, useRouter, Slot, SplashScreen as ExpoRouterSplashScreen } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { ThemeProvider as CustomThemeProvider } from './lib/ThemeContext';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { AuthProvider, useAuth } from '@/app/lib/AuthContext';
import { FilterProvider } from '@/app/lib/FilterContext';
import { PrivateContestProvider } from '@/app/lib/PrivateContestContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import Constants from 'expo-constants';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { handleAuthRedirect } from './lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TemplateSystemProvider } from '../components/TemplateSystemProvider';
import { AppControlProvider } from '../components/AppControlProvider';
import { cleanupSupabaseChannels } from '../lib/supabase';
import { UnifiedStatusBar } from '@/components/UnifiedStatusBar';
import LoadingIndicator from '@/components/LoadingIndicator';
import HookRulesErrorHandler from '@/components/errors/HookRulesErrorHandler';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(home)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom splash screen handler to manage splash screen better
let splashHidden = false;
const hideSplashScreenSafely = async () => {
  try {
    if (!splashHidden) {
      console.log('[App] Hiding splash screen');
      await SplashScreen.hideAsync();
      splashHidden = true;
    }
  } catch (e) {
    console.warn('[App] Error hiding splash screen:', e);
  }
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('[App] Font loading error:', error);
      setInitError(error);
    }
  }, [error]);

  // Initialize app and load assets
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Initializing app and loading assets');
        
        // Wait 1 second to ensure everything is properly initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mark initialization as completed
        setIsInitializing(false);
        
        // If fonts are loaded, hide splash screen
        if (loaded) {
          await hideSplashScreenSafely();
        }
      } catch (e) {
        console.error('[App] Error during app initialization:', e);
        setInitError(e instanceof Error ? e : new Error(String(e)));
        await hideSplashScreenSafely();
      }
    };
    
    initializeApp();
  }, [loaded]);

  // Hide splash screen whenever assets are loaded
  useEffect(() => {
    if (loaded && !isInitializing) {
      hideSplashScreenSafely();
    }
  }, [loaded, isInitializing]);

  // Set up WebBrowser auto-close
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);
  
  // Add a URL listener for deep links
  useEffect(() => {
    // Listen to incoming links when the app is open
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      console.log('Deep link received while app is running:', url);
      
      // Check if it's an auth-related URL
      if (url.includes('auth') || url.includes('callback') || url.includes('token')) {
        console.log('Processing auth deep link:', url);
        
        try {
          // Try to process the auth
          const result = await handleAuthRedirect(url);
          
          if (result.success) {
            console.log('Auth successful from deep link, navigating to main app');
            // Clear the auth progress flag
            await AsyncStorage.setItem('google-auth-in-progress', 'false');
            router.replace('/(tabs)');
          } else {
            console.error('Auth failed from deep link:', result.error);
            // If auth failed but we were in Google flow, show the login screen
            const inGoogleFlow = await AsyncStorage.getItem('google-auth-in-progress');
            if (inGoogleFlow === 'true') {
              router.replace('/login');
            }
          }
        } catch (error) {
          console.error('Error processing deep link auth:', error);
          router.replace('/login');
        }
      }
    });

    // Also check if app was opened with a URL
    const checkInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          console.log('App opened with URL:', initialURL);
          
          // Handle auth links on app startup
          if (initialURL.includes('auth') || initialURL.includes('callback') || initialURL.includes('token')) {
            console.log('Processing auth deep link on startup:', initialURL);
            
            // Try to handle the URL directly
            const result = await handleAuthRedirect(initialURL);
            if (result.success) {
              console.log('Initial URL auth successful, navigating to main app');
              await AsyncStorage.setItem('google-auth-in-progress', 'false');
              router.replace('/(tabs)');
            } else {
              console.log('Initial URL auth failed, going to login');
              router.replace('/login');
            }
          }
        }
      } catch (error) {
        console.error('Error checking initial URL:', error);
      }
    };
    
    checkInitialURL();

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Show loading or error state
  if (!loaded || isInitializing) {
    return <LoadingIndicator message="Starting Quiz Adventure..." fullscreen={true} />;
  }
  
  if (initError) {
    console.error('[App] Initialization error:', initError);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <FontAwesome name="exclamation-triangle" size={40} color="red" />
        <Text style={{ marginTop: 20, fontSize: 18, textAlign: 'center' }}>
          {initError.message || "Something went wrong while starting the app."}
        </Text>
        <Text style={{ marginTop: 10, marginBottom: 20, fontSize: 14, textAlign: 'center', color: '#666' }}>
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 12, backgroundColor: '#4285F4', borderRadius: 6 }}
          onPress={() => {
            console.log('Retry button pressed');
            setInitError(null);
            setIsInitializing(true);
            router.replace('/');
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <HookRulesErrorHandler
      reset={() => {
        console.log("Resetting after error...");
        // Perform any necessary resets here
        router.replace('/');
      }}
    >
      <RootLayoutNav />
    </HookRulesErrorHandler>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLayoutMounted, setIsLayoutMounted] = useState(false);
  
  // Set a flag once the component is mounted to ensure navigation works properly
  useEffect(() => {
    console.log('[RootLayoutNav] Component mounted');
    setIsLayoutMounted(true);
    
    // Listen for app state changes to cleanup Supabase connections when app goes to background
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('[Supabase] App going to background, cleaning up connections');
        cleanupSupabaseChannels();
      }
    });
    
    return () => {
      console.log('[RootLayoutNav] Component unmounted, cleaning up connections');
      appStateSubscription.remove();
      cleanupSupabaseChannels();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HookRulesErrorHandler>
        <AuthProvider>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <CustomThemeProvider>
              <LanguageProvider>
                <AppControlProvider>
                  <TemplateSystemProvider>
                    <UnifiedStatusBar transparentBackground={true} />
                    <AppNavigator isDark={isDark} isLayoutMounted={isLayoutMounted} />
                  </TemplateSystemProvider>
                </AppControlProvider>
              </LanguageProvider>
            </CustomThemeProvider>
          </ThemeProvider>
        </AuthProvider>
      </HookRulesErrorHandler>
    </GestureHandlerRootView>
  );
}

// Separate component to access the language context
function AppNavigator({ isDark, isLayoutMounted }: { isDark: boolean, isLayoutMounted: boolean }) {
  const { t } = useLanguage();
  
  return (
    <FilterProvider>
      <PrivateContestProvider>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <View style={[
            styles.statusBarFill,
            { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
          ]} />}
          <AuthStateHandler>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: Platform.OS === 'android' ? 'fade_from_bottom' : undefined,
                contentStyle: { 
                  backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                  flex: 1
                }
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="contest/[id]" 
                options={{ 
                  headerShown: true,
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                  },
                  headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
                  headerShadowVisible: false,
                  headerBackTitle: t('back'),
                }} 
              />
              <Stack.Screen 
                name="game/[id]" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen
                name="game/quiz"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="game/gaming-24-7"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="auth/callback"
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="auth/index" 
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="auth/layout" 
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="auth/reset-password" 
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="auth/update-password" 
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="auth/verify" 
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="add-money" 
                options={{ 
                  headerShown: true,
                  title: t('add_money'),
                  headerStyle: {
                    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                  },
                  headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
                  headerShadowVisible: false,
                }} 
              />
              <Stack.Screen 
                name="my-contests" 
                options={{ 
                  headerShown: true,
                  title: t('my_contests'),
                  headerStyle: {
                    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                  },
                  headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
                  headerShadowVisible: false,
                }} 
              />
            </Stack>
          </AuthStateHandler>
        </View>
      </PrivateContestProvider>
    </FilterProvider>
  );
}

// Separate component to handle auth state and routing
function AuthStateHandler({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  
  // Get current path outside useEffect
  useEffect(() => {
    try {
      const state = (router as any).getState?.();
      const path = state?.routes?.[state.routes.length - 1]?.path || '';
      setCurrentPath(path);
    } catch (error) {
      console.error('[AuthStateHandler] Error getting current path:', error);
    }
  }, [router]);
  
  // Check auth state when component mounts
  useEffect(() => {
    if (!loading) {
      console.log('[AuthStateHandler] Auth state loaded, user:', user ? 'logged in' : 'not logged in');
      console.log('[AuthStateHandler] Current path:', currentPath);
      
      try {
        // Only run the routing logic after the initial auth check is complete
        if (!initialAuthCheckDone) {
          // If user is not logged in and trying to access protected routes, redirect to login
          if (!user && !currentPath.includes('/login') && !currentPath.includes('/register') 
              && !currentPath.includes('/auth') && currentPath !== '/') {
            console.log('[AuthStateHandler] User not authenticated, redirecting to login');
            router.replace('/login');
          }
          
          // If user is logged in and on login/register page, redirect to main app
          if (user && (currentPath.includes('/login') || currentPath.includes('/register'))) {
            console.log('[AuthStateHandler] User already authenticated, redirecting to home');
            router.replace('/(tabs)');
          }
          
          setInitialAuthCheckDone(true);
        }
      } catch (error) {
        console.error('[AuthStateHandler] Error during auth routing:', error);
        setAuthError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [user, loading, router, initialAuthCheckDone, currentPath]);
  
  // Retry auth check on error
  useEffect(() => {
    if (authError && retryCount < 3) {
      console.log(`[AuthStateHandler] Retrying auth check (${retryCount + 1}/3)...`);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setAuthError(null);
        setInitialAuthCheckDone(false);
      }, 1000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [authError, retryCount]);
  
  // Show loading state
  if (loading) {
    return <LoadingIndicator message="Loading your profile..." fullscreen={true} />;
  }
  
  // Show error state
  if (authError && retryCount >= 3) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <FontAwesome name="exclamation-circle" size={40} color="red" />
        <Text style={{ marginTop: 20, fontSize: 18, textAlign: 'center' }}>
          There was an error connecting to the server.
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 12, backgroundColor: '#4285F4', borderRadius: 6 }}
          onPress={() => {
            setRetryCount(0);
            setAuthError(null);
            setInitialAuthCheckDone(false);
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return <>{children}</>;
}

export function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? Colors.dark.tint : Colors.light.tint,
        tabBarInactiveTintColor: isDark ? '#888' : '#888',
        headerStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
        },
        headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contests"
        options={{
          title: 'Contests',
          tabBarIcon: ({ color }) => <FontAwesome5 name="trophy" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// Pure layout component with no routing dependencies
export function PureLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: 'white',
      padding: 0,
      margin: 0,
    }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {children}
    </View>
  );
}

// Override the simple layout to handle children directly without routing
export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  statusBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Constants.statusBarHeight,
    zIndex: 999,
  },
});

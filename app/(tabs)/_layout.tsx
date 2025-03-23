import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Import only what we need
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/app/lib/ThemeContext';
import { ThemedView } from '@/components/ThemedView';

// Define type for Material Icon names
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isDark } = useTheme();
  
  // Define tab icons consistently to prevent changes on click
  const tabIcons = useMemo(() => ({
    home: 'home' as MaterialIconName,
    contests: 'emoji-events' as MaterialIconName,
    wallet: 'account-balance-wallet' as MaterialIconName,
    profile: 'person' as MaterialIconName
  }), []);

  // Define colors for each tab
  const tabColors = useMemo(() => ({
    home: '#4CAF50',  // Green
    contests: '#FF9800', // Orange
    wallet: '#2196F3', // Blue
    profile: '#9C27B0'  // Purple
  }), []);

  return (
    <ThemedView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarInactiveTintColor: isDark ? '#777' : '#999',
          headerShown: false,
          tabBarBackground: () => <TabBarBackground isDark={isDark} />,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            paddingBottom: 4,
          },
          tabBarStyle: {
            ...Platform.select({
              ios: {
                shadowColor: isDark ? '#000' : '#333',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 6,
              },
              android: {
                elevation: 12,
              },
            }),
            height: 65,
            borderTopWidth: 0,
            backgroundColor: isDark ? '#1f1f1f' : '#fff',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <MaterialIcons 
                name={tabIcons.home} 
                size={26} 
                color={focused ? tabColors.home : `${tabColors.home}${isDark ? '70' : '80'}`} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="contests"
          options={{
            title: 'Contests',
            tabBarIcon: ({ focused }) => (
              <MaterialIcons 
                name={tabIcons.contests} 
                size={26} 
                color={focused ? tabColors.contests : `${tabColors.contests}${isDark ? '70' : '80'}`} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ focused }) => (
              <MaterialIcons 
                name={tabIcons.wallet} 
                size={26} 
                color={focused ? tabColors.wallet : `${tabColors.wallet}${isDark ? '70' : '80'}`} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <MaterialIcons 
                name={tabIcons.profile} 
                size={26} 
                color={focused ? tabColors.profile : `${tabColors.profile}${isDark ? '70' : '80'}`} 
              />
            ),
          }}
        />
      </Tabs>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

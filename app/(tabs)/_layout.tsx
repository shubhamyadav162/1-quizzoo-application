import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet, StatusBar, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import { ContestProvider } from '@/app/lib/ContestContext';
import { useLanguage } from '@/app/lib/LanguageContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
export default function TabLayout() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [screenWidth] = useState(Dimensions.get('window').width);

  // Render colorful emoji with glow effect
  const renderEmoji = (emoji: string, focused: boolean) => (
    <View style={[
      styles.emojiContainer,
      focused && styles.emojiContainerFocused,
      { backgroundColor: focused ? (isDark ? 'rgba(94, 92, 230, 0.2)' : 'rgba(94, 92, 230, 0.1)') : 'transparent' }
    ]}>
      <Text style={[
        styles.emoji,
        focused && styles.emojiFocused
      ]}>
        {emoji}
      </Text>
    </View>
  );

  return (
    <ContestProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: isDark ? Colors.dark.text : Colors.light.text,
          tabBarStyle: {
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
            paddingTop: 10,
            height: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 8,
            // Force max width to ensure the tab bar only shows 4 items
            width: screenWidth,
            maxWidth: screenWidth,
            overflow: 'hidden'
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginBottom: 5,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => renderEmoji('🏠', focused),
            tabBarButton: (props) => <HapticTab {...props} />,
          }}
        />
        <Tabs.Screen
          name="contests"
          options={{
            title: 'Contest',
            tabBarIcon: ({ color, focused }) => renderEmoji('🏆', focused),
            tabBarButton: (props) => <HapticTab {...props} />,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color, focused }) => renderEmoji('💰', focused),
            tabBarButton: (props) => <HapticTab {...props} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => renderEmoji('👤', focused),
            tabBarButton: (props) => <HapticTab {...props} />,
          }}
        />
        {/* No additional tabs should be visible */}
      </Tabs>
    </ContestProvider>
  );
}

const styles = StyleSheet.create({
  emojiContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  emojiContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 24,
    opacity: 0.8,
  },
  emojiFocused: {
    opacity: 1,
    fontSize: 26,
  },
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

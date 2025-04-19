import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

interface GradientHeaderProps {
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

/**
 * GradientHeader component that provides a consistent, immersive header
 * with gradient background that extends to the status bar and includes the app mascot.
 */
export const GradientHeader: React.FC<GradientHeaderProps> = ({
  showBackButton = true,
  rightComponent
}) => {
  const { isDark } = useTheme();

  const gradientColors = isDark 
    ? ['#2E2E3E', '#1A1A2E'] 
    : ['#6C63FF', '#5C55FF'];

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={isDark ? Colors.dark.text : '#fff'} 
              />
            </TouchableOpacity>
          )}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/buffalo-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          {rightComponent && (
            <View style={styles.rightComponent}>
              {rightComponent}
            </View>
          )}
        </View>
      </LinearGradient>
    </>
  );
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  headerContainer: {
    height: 56 + STATUSBAR_HEIGHT,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: STATUSBAR_HEIGHT,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 40,
    width: 40,
  },
  rightComponent: {
    marginLeft: 8,
  },
}); 
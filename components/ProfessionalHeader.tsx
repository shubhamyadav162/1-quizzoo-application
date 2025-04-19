import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { UnifiedStatusBar } from './UnifiedStatusBar';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  leftIcon?: {
    name: string;
    type?: 'Ionicons' | 'MaterialIcons'; 
    color?: string;
  };
  gradient?: boolean;
  transparent?: boolean;
  onBackPress?: () => void;
  showLogo?: boolean;
}

/**
 * A professional header component with proper status bar handling and consistent styling
 * across both light and dark themes. Designed to be used on all screens for a unified look.
 */
export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  rightContent,
  leftIcon,
  gradient = false,
  transparent = false,
  onBackPress,
  showLogo = false,
}) => {
  const { isDark } = useTheme();
  
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const backgroundColor = transparent 
    ? 'transparent'
    : isDark ? Colors.dark.background : Colors.light.background;
    
  const gradientColors = isDark 
    ? ['#2E2E3E', '#1A1A2E'] 
    : ['#5C55FF', '#4CAF50'];
    
  const renderContent = () => (
    <View style={styles.headerContent}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={isDark ? Colors.dark.text : Colors.light.text} 
            />
          </TouchableOpacity>
        )}
        
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon.type === 'MaterialIcons' ? (
              <MaterialIcons 
                name={leftIcon.name as any} 
                size={26} 
                color={leftIcon.color || (isDark ? Colors.dark.tint : Colors.light.tint)}
              />
            ) : (
              <Ionicons 
                name={leftIcon.name as any} 
                size={26} 
                color={leftIcon.color || (isDark ? Colors.dark.tint : Colors.light.tint)}
              />
            )}
          </View>
        )}
      </View>
      
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      
      <View style={styles.rightSection}>
        {rightContent}
        {showLogo && (
          <Image 
            source={require('../assets/images/craiyon_203413_transparent.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <UnifiedStatusBar 
        transparentBackground={transparent || gradient}
        forceLightContent={gradient}
        backgroundColor={backgroundColor}
        includeStatusBarHeight={true}
      />
      
      {gradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBackground}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View style={[
          styles.headerBackground,
          { backgroundColor }
        ]}>
          {renderContent()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  headerBackground: {
    width: '100%',
    paddingBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 6,
  },
  iconContainer: {
    marginRight: 8,
  },
  logo: {
    width: 32,
    height: 32,
  }
}); 
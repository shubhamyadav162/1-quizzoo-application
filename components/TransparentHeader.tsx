import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

interface TransparentHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
  style?: ViewStyle;
  lightTextColor?: string;
  darkTextColor?: string;
}

/**
 * TransparentHeader component that provides a clean, transparent header
 * that works well with the UnifiedStatusBar.
 */
export const TransparentHeader: React.FC<TransparentHeaderProps> = ({
  title,
  showBackButton = true,
  rightElement,
  onBackPress,
  style,
  lightTextColor = Colors.light.text,
  darkTextColor = Colors.dark.text,
}) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const textColor = isDark ? darkTextColor : lightTextColor;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.safeArea}>
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.titleSection}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              {title}
            </ThemedText>
          </View>

          <View style={styles.rightSection}>
            {rightElement}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
}); 
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';
import { useLanguage } from '@/app/lib/LanguageContext';

interface HeaderProps {
  title: string;
  titleTranslationKey?: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  actionButtons?: {
    icon: string;
    label?: string;
    labelTranslationKey?: string;
    onPress: () => void;
    isPrimary?: boolean;
  }[];
  transparent?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  titleTranslationKey,
  showBackButton = true,
  rightElement,
  actionButtons,
  transparent = false,
  onBackPress,
}) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Get title text (translated if translation key is provided)
  const titleText = titleTranslationKey ? t(titleTranslationKey) : title;

  return (
    <View
      style={[
        styles.container,
        transparent
          ? styles.transparentBackground
          : {
              backgroundColor: isDark
                ? Colors.dark.cardBackground
                : Colors.light.cardBackground,
              borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
              borderBottomWidth: 1,
            },
      ]}
    >
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleSection}>
        <ThemedText style={styles.title}>{titleText}</ThemedText>
      </View>

      <View style={styles.rightSection}>
        {actionButtons ? (
          <View style={styles.actionButtonsContainer}>
            {actionButtons.map((button, index) => {
              // Get button label (translated if translation key is provided)
              const buttonLabel = button.labelTranslationKey 
                ? t(button.labelTranslationKey) 
                : button.label;
                
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    button.isPrimary && styles.primaryActionButton,
                    button.isPrimary 
                      ? { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
                      : { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' },
                    index > 0 && { marginLeft: 8 }
                  ]}
                  onPress={button.onPress}
                >
                  <Ionicons
                    name={button.icon as any}
                    size={16}
                    color={button.isPrimary ? '#FFFFFF' : (isDark ? Colors.dark.text : Colors.light.text)}
                    style={{ marginRight: buttonLabel ? 4 : 0 }}
                  />
                  {buttonLabel && (
                    <Text 
                      style={[
                        styles.actionButtonText,
                        { 
                          color: button.isPrimary ? '#FFFFFF' : (isDark ? Colors.dark.text : Colors.light.text) 
                        }
                      ]}
                    >
                      {buttonLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          rightElement
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    width: '100%',
    zIndex: 100,
  },
  transparentBackground: {
    backgroundColor: 'transparent',
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
    minWidth: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  primaryActionButton: {
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 
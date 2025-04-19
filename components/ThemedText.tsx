import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/app/lib/ThemeContext';
import { useLanguage } from '@/app/lib/LanguageContext';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'label';
  colorType?: 'primary' | 'secondary' | 'muted';
  translate?: boolean;
  translationKey?: string;
  skipTranslation?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  colorType,
  translate = true,
  translationKey,
  skipTranslation = false,
  children,
  ...rest
}: ThemedTextProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Get base color from theme system
  let color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Override with special colors if specified
  if (colorType === 'primary') {
    color = isDark ? Colors.dark.tint : Colors.light.tint;
  } else if (colorType === 'secondary') {
    color = Colors.secondary;
  } else if (colorType === 'muted') {
    color = isDark ? '#888888' : '#666666';
  }

  // Handle translation if needed
  let content = children;
  
  // Only attempt to translate if it's a string and translation isn't explicitly skipped
  if (!skipTranslation && typeof children === 'string') {
    if (translationKey) {
      // If a specific translation key is provided, use that
      content = t(translationKey);
    } else if (translate) {
      // Otherwise try to translate the text directly as a key
      content = t(children as string);
    }
    // Fallback: if translation is missing or not a string, use children as string
    if (typeof content !== 'string') {
      content = children as string;
    }
    // Final fallback: if still not a string, use the key itself
    if (typeof content !== 'string') {
      content = translationKey || (children as string) || '';
    }
  }

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? { ...styles.link, color: isDark ? '#6BABDE' : '#0a7ea4' } : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'label' ? styles.label : undefined,
        style,
      ]}
      {...rest}
    >
      {content}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  }
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../app/lib/ThemeContext';
import { useLanguage } from '../lib/LanguageContext';
import { getTranslation } from '../lib/translations';
import { Ionicons } from '@expo/vector-icons';

interface ContestRulesProps {
  rules?: string[];
  isDark?: boolean;
}

export const ContestRules: React.FC<ContestRulesProps> = ({ rules: propRules, isDark: propIsDark }) => {
  const themeContext = useTheme();
  const { language } = useLanguage();
  
  // Use props if provided, otherwise use context values
  const isDark = propIsDark !== undefined ? propIsDark : themeContext.isDark;

  const defaultRules = [
    {
      icon: 'timer-outline',
      key: 'timeLimit',
      value: '30 seconds',
    },
    {
      icon: 'checkmark-circle-outline',
      key: 'correctAnswers',
      value: '+10 points',
    },
    {
      icon: 'close-circle-outline',
      key: 'incorrectAnswers',
      value: '0 points',
    },
    {
      icon: 'help-circle-outline',
      key: 'totalQuestions',
      value: '10',
    },
  ];

  // Use text rules from props if provided
  const textRules = propRules || [];
  const hasTextRules = textRules.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
          {getTranslation('contestRulesTitle', language)}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
          {getTranslation('readCarefully', language)}
        </Text>
      </View>

      {/* Display text rules if provided */}
      {hasTextRules && (
        <View style={styles.rulesList}>
          {textRules.map((rule, index) => (
            <View 
              key={index}
              style={[
                styles.textRuleItem,
                { borderBottomColor: isDark ? '#374151' : '#E5E7EB' },
                index === textRules.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <Text style={[styles.bulletPoint, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>•</Text>
              <Text style={[styles.ruleText, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                {rule}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Display default rules if no text rules */}
      {!hasTextRules && (
        <View style={styles.rulesList}>
          {defaultRules.map((rule, index) => (
            <View 
              key={index}
              style={[
                styles.ruleItem,
                { borderBottomColor: isDark ? '#374151' : '#E5E7EB' },
                index === defaultRules.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <View style={styles.ruleIcon}>
                <Ionicons
                  name={rule.icon as any}
                  size={24}
                  color={isDark ? '#D1D5DB' : '#6B7280'}
                />
              </View>
              <View style={styles.ruleContent}>
                <Text style={[styles.ruleTitle, { color: isDark ? '#F9FAFB' : '#111827' }]}>
                  {getTranslation(rule.key, language)}
                </Text>
                <Text style={[styles.ruleValue, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
                  {rule.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  rulesList: {
    marginLeft: 4,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  textRuleItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 8,
  },
  bulletPoint: {
    fontSize: 18,
    marginRight: 8,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  ruleIcon: {
    marginRight: 12,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ruleValue: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ContestRules; 
import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  emoji?: string;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  right,
  emoji = '',
  showBackButton = false
}) => {
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.headerContainer}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.statusBarFill} />
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={[styles.titleContainer, showBackButton && styles.titleWithBackButton]}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              {title}
            </ThemedText>
            {emoji && (
              <ThemedText style={styles.emojiText}>{emoji}</ThemedText>
            )}
          </View>
          {subtitle && (
            <ThemedText style={styles.headerSubtitle} numberOfLines={2}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        {right && (
          <View style={styles.rightContainer}>
            {right}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 0,
  },
  statusBarFill: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleWithBackButton: {
    marginLeft: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  emojiText: {
    fontSize: 26,
    marginLeft: 8,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rightContainer: {
    marginLeft: 10,
  },
}); 
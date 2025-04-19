import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { router } from 'expo-router';

export default function NotificationPreviewScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gradientColors = isDark
    ? ['#232526', '#414345']
    : ['#8EC5FC', '#E0C3FC'];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="notifications" size={60} color="#F59E42" />
        </View>
        <Text style={styles.title}>Notification Preview</Text>
        <View style={styles.notificationCard}>
          <Text style={styles.notificationText}>
            The contest you registered for is starting in 12 hours! Get ready to play and win big!
          </Text>
          <Text style={styles.notificationTextHindi}>
            आपने जिस प्रतियोगिता के लिए रजिस्टर किया है, वह 12 घंटे में शुरू होने वाली है! खेलने और जीतने के लिए तैयार हो जाएं!
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back / वापस जाएं</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E42',
    marginBottom: 18,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    width: '100%',
  },
  notificationText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  notificationTextHindi: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F59E42',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
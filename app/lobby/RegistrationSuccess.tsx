import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { router } from 'expo-router';

export default function RegistrationSuccessScreen() {
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
          <Ionicons name="checkmark-circle" size={90} color="#22C55E" />
        </View>
        <Text style={styles.title}>Registration Successful!</Text>
        <Text style={styles.titleHindi}>रजिस्ट्रेशन सफल!</Text>
        <Text style={styles.subtitle}>
          You have successfully registered for the contest. You will receive a notification 12 hours before the contest starts if the pool is full.
        </Text>
        <Text style={styles.subtitleHindi}>
          आप प्रतियोगिता के लिए सफलतापूर्वक रजिस्टर हो गए हैं। यदि पूल भर जाता है, तो प्रतियोगिता शुरू होने से 12 घंटे पहले आपको सूचना मिलेगी।
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/') }>
          <Text style={styles.buttonText}>Go to Home / होम पर जाएं</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/lobby/NotificationPreview') }>
          <Text style={styles.secondaryButtonText}>Preview Notification / नोटिफिकेशन देखें</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 6,
    textAlign: 'center',
  },
  titleHindi: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleHindi: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
}); 
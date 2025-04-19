import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { router } from 'expo-router';

export default function DemoPlayLobby() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gradientColors = isDark
    ? ['#0f766e', '#5eead4']
    : ['#14b8a6', '#99f6e4'];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="game-controller" size={80} color="#fff" />
        </View>
        <Text style={styles.title}>Demo Play Instructions</Text>
        <Text style={styles.titleHindi}>डेमो खेल निर्देश</Text>
        <Text style={styles.subtitle}>
          Experience the game for free! In Demo Play, you will:
        </Text>
        <Text style={styles.subtitleHindi}>
          डेमो खेल में, आप निःशुल्क खेल का अनुभव करेंगे:
        </Text>
        <View style={styles.instructionsBox}>
          <Text style={styles.instruction}>• Read the instructions carefully.</Text>
          <Text style={styles.instructionHindi}>• निर्देश ध्यान से पढ़ें।</Text>
          <Text style={styles.instruction}>• You will answer 10 quiz questions.</Text>
          <Text style={styles.instructionHindi}>• आपको 10 क्विज़ सवालों के जवाब देने होंगे।</Text>
          <Text style={styles.instruction}>• No money is required for demo play.</Text>
          <Text style={styles.instructionHindi}>• डेमो खेल के लिए कोई पैसे की आवश्यकता नहीं है।</Text>
          <Text style={styles.instruction}>• At the end, you will see your results and learn how the game works.</Text>
          <Text style={styles.instructionHindi}>• अंत में, आप अपना परिणाम देखेंगे और समझेंगे कि गेम कैसे चलता है।</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: '/game/quiz', params: { mode: 'demo' } } as any)}>
          <Text style={styles.buttonText}>Start Demo Quiz / डेमो क्विज़ शुरू करें</Text>
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
    width: '90%',
    alignSelf: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  titleHindi: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleHindi: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  instruction: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
  },
  instructionHindi: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
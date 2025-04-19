import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/ThemeContext';
import { router } from 'expo-router';

export default function InstructionsDemo() {
  const { isDark } = useTheme();

  // Royal blue and royal red gradients
  const gradientColors = isDark
    ? ['#1a237e', '#b71c1c'] // darker royal blue to dark royal red
    : ['#274B8C', '#B22234']; // royal blue to royal red

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#fff' }]}>How to Play Quiz (कैसे खेलें?)</Text>
        <View style={styles.instructionsBox}>
          <Text style={[styles.instruction, { color: isDark ? '#e3e3e3' : '#f3f3f3' }]}>1. You will get 10 questions, each with 4 options. (आपको 10 सवाल मिलेंगे, हर एक के 4 विकल्प होंगे।)</Text>
          <Text style={[styles.instruction, { color: isDark ? '#e3e3e3' : '#f3f3f3' }]}>2. Select the correct answer before the timer runs out. (सही उत्तर समय समाप्त होने से पहले चुनें।)</Text>
          <Text style={[styles.instruction, { color: isDark ? '#e3e3e3' : '#f3f3f3' }]}>3. Fast answers get more points! (तेज़ उत्तर पर ज्यादा अंक मिलेंगे!)</Text>
          <Text style={[styles.instruction, { color: isDark ? '#e3e3e3' : '#f3f3f3' }]}>4. No negative marking. (कोई नकारात्मक अंक नहीं है।)</Text>
          <Text style={[styles.instruction, { color: isDark ? '#e3e3e3' : '#f3f3f3' }]}>5. Try to score as high as possible! (जितना हो सके उतना अधिक स्कोर करें!)</Text>
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('../game/number-12?mode=demo&demoOnly=1')}
        >
          <LinearGradient
            colors={isDark ? ['#3949ab', '#c62828'] : ['#3b5998', '#d7263d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Start Demo Quiz / डेमो क्विज़ शुरू करें</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 32) : 44,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 1,
  },
  instructionsBox: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 36,
    width: '100%',
  },
  instruction: {
    fontSize: 18,
    marginBottom: 14,
    textAlign: 'left',
    lineHeight: 26,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 
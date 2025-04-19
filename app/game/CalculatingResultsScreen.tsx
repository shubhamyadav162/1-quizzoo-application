import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, useColorScheme, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CalculatingResultsScreenProps {
  onDone: () => void;
  isHindi?: boolean;
}

const mascot = require('../../assets/images/craiyon_203413_transparent.png');

export default function CalculatingResultsScreen({ onDone, isHindi }: CalculatingResultsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Mascot bounce animation
  const bounceAnim = useRef(new Animated.Value(0)).current;
  // Dots animation
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -20, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      ])
    ).start();
    // Dots loop
    Animated.loop(
      Animated.timing(dotsAnim, { toValue: 3, duration: 1200, useNativeDriver: false })
    ).start();
    // Auto proceed after 10 seconds
    const timer = setTimeout(onDone, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Animated dots for the text
  const dots = dotsAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['.', '..', '...', '']
  });

  // Gradient colors
  const gradientColors = isDark
    ? ['#23243a', '#3a1c71', '#6a5bf7']
    : ['#f9fafb', '#a18cd1', '#fbc2eb'];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.centerContent}>
        <Animated.Image
          source={mascot}
          style={[
            styles.mascot,
            { transform: [{ translateY: bounceAnim }] }
          ]}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: isDark ? '#fff' : '#23243a' }]}> 
          {isHindi ? 'परिणाम की गणना हो रही है' : 'Calculating Results'}
          <Animated.Text style={styles.dots}>{dots}</Animated.Text>
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#d1d5db' : '#6a5bf7' }]}> 
          {isHindi ? 'कृपया प्रतीक्षा करें...' : 'Please wait...'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  mascot: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dots: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6a5bf7',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 
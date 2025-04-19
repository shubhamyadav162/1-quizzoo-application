import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface LoadingIndicatorProps {
  message?: string;
  size?: number;
  color?: string;
  fullscreen?: boolean;
}

export default function LoadingIndicator({ 
  message = 'Loading...', 
  size = 40, 
  color,
  fullscreen = false 
}: LoadingIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const defaultColor = color || (isDark ? Colors.dark.tint : Colors.light.tint);
  
  // Animation for spinner
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    spinAnimation.start();
    
    return () => {
      spinAnimation.stop();
    };
  }, [spinValue]);
  
  // Create rotation interpolation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Styles based on whether it's fullscreen or inline
  const containerStyle = fullscreen ? styles.fullscreenContainer : styles.container;
  
  return (
    <View style={[
      containerStyle,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <FontAwesome name="spinner" size={size} color={defaultColor} />
      </Animated.View>
      {message && (
        <Text style={[
          styles.message, 
          { color: isDark ? Colors.dark.text : Colors.light.text }
        ]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
}); 
import React, { ReactNode, useState, useRef } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

interface SwipeableScreenViewProps {
  children: ReactNode;
  nextScreenPath?: string;
  prevScreenPath?: string;
}

export const SwipeableScreenView: React.FC<SwipeableScreenViewProps> = ({
  children,
  nextScreenPath,
  prevScreenPath,
}) => {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    // Only start responder if movement is horizontal
    onMoveShouldSetPanResponder: (_, gesture) => {
      return Math.abs(gesture.dx) > Math.abs(gesture.dy * 3);
    },
    onPanResponderMove: (_, gesture) => {
      // Only allow horizontal movement and limit how far it can go
      const newX = Math.max(-SCREEN_WIDTH/3, Math.min(SCREEN_WIDTH/3, gesture.dx));
      position.setValue({ x: newX, y: 0 });
    },
    onPanResponderRelease: (_, gesture) => {
      // Don't try to navigate if already animating
      if (isAnimating) return;

      // Swipe left - go to next screen
      if (gesture.dx < -SWIPE_THRESHOLD && nextScreenPath) {
        setIsAnimating(true);
        Animated.timing(position, {
          toValue: { x: -SCREEN_WIDTH/2, y: 0 },
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          position.setValue({ x: 0, y: 0 });
          router.push(nextScreenPath as any);
          setTimeout(() => setIsAnimating(false), 300);
        });
      }
      // Swipe right - go to previous screen
      else if (gesture.dx > SWIPE_THRESHOLD && prevScreenPath) {
        setIsAnimating(true);
        Animated.timing(position, {
          toValue: { x: SCREEN_WIDTH/2, y: 0 },
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          position.setValue({ x: 0, y: 0 });
          router.push(prevScreenPath as any);
          setTimeout(() => setIsAnimating(false), 300);
        });
      }
      // Not enough to trigger navigation - reset position
      else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    },
    // Prevent parent ScrollView from capturing gesture
    onPanResponderTerminationRequest: () => false,
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: position.x }] },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 
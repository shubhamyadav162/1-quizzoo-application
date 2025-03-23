import React, { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type ValidRoute = '/' | '/contests' | '/wallet' | '/profile' | '/(tabs)' | '/(tabs)/index' | 
  '/(tabs)/contests' | '/(tabs)/wallet' | '/(tabs)/profile';

interface SwipeNavigationWrapperProps {
  children: ReactNode;
  nextScreen?: ValidRoute;
  prevScreen?: ValidRoute;
}

export const SwipeNavigationWrapper: React.FC<SwipeNavigationWrapperProps> = ({
  children,
  nextScreen,
  prevScreen,
}) => {
  const router = useRouter();

  // Create horizontal swipe gesture
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      // Handle left swipe (go to next screen)
      if (event.translationX < -50 && nextScreen) {
        router.push(nextScreen);
      }
      // Handle right swipe (go to prev screen)
      else if (event.translationX > 50 && prevScreen) {
        router.push(prevScreen);
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 
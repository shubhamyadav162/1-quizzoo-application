import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

type QuickPlayButtonProps = {
  style?: any;
  size?: 'small' | 'medium' | 'large';
  entryFee?: number;
};

export const QuickPlayButton = ({ 
  style, 
  size = 'medium',
  entryFee = 10
}: QuickPlayButtonProps) => {
  const { isDark } = useTheme();
  const [pulseAnim] = React.useState(new Animated.Value(1));
  
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handleQuickPlay = () => {
    router.navigate('/instant-match');
  };
  
  // Size styles based on the size prop
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: {
            paddingVertical: 8,
            paddingHorizontal: 12,
          },
          text: {
            fontSize: 14,
          },
          icon: 20,
        };
      case 'large':
        return {
          button: {
            paddingVertical: 16,
            paddingHorizontal: 30,
          },
          text: {
            fontSize: 18,
          },
          icon: 28,
        };
      default: // medium
        return {
          button: {
            paddingVertical: 12,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: 16,
          },
          icon: 24,
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  
  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        { transform: [{ scale: pulseAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          sizeStyles.button,
          {
            backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
          },
        ]}
        onPress={handleQuickPlay}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={sizeStyles.icon} color="#fff" />
        <View style={styles.textContainer}>
          <Text style={[styles.buttonText, sizeStyles.text]}>
            Play Now
          </Text>
          {entryFee > 0 && (
            <Text style={styles.feeText}>
              ₹{entryFee} Entry
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    // This ensures the animation doesn't affect layout
    alignSelf: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  textContainer: {
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
}); 
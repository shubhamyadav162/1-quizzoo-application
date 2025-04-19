import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

type InstantPlayFabProps = {
  style?: StyleProp<ViewStyle>;
};

export const InstantPlayFab = ({ style }: InstantPlayFabProps) => {
  const { isDark } = useTheme();
  
  // Handle play button press - modified to use our new lobby
  const handleInstantPlay = () => {
    // Create a unique ID for this instant session
    const instantId = `instant_${Date.now()}`;
    
    // Navigate to lobby with this instant ID
    console.log(`Navigating to lobby for instant play: ${instantId}`);
    
    // We need to ensure this navigation works - use direct URL
    router.push(`/lobby/${instantId}`);
  };
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.fabButton,
          { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
        ]}
        onPress={handleInstantPlay}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Play Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 
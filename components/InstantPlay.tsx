import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

type InstantPlayProps = {
  onPlay?: () => void;
};

export const InstantPlay = ({ onPlay }: InstantPlayProps) => {
  const { isDark } = useTheme();

  const handlePlay = () => {
    // Direct route to quiz with all required parameters to bypass lobbies
    router.navigate('/game/quiz?mode=demo&skipLoading=true&directStart=true&bypassLobby=true');
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
      ]}
      onPress={handlePlay}
      activeOpacity={0.8}
    >
      <Ionicons name="flash" size={24} color="#fff" />
      <Text style={styles.buttonText}>Play Now</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 
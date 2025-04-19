import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  ViewStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

// Generate Indian-sounding names for our UI
const firstNames = ['Rahul', 'Priya', 'Arun', 'Neha', 'Vijay', 'Anita', 'Amit', 'Sunita', 'Rajesh', 'Kavita'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Verma', 'Kumar', 'Joshi', 'Malhotra', 'Kapoor', 'Reddy'];

// Player colors for variety
const playerColors = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', 
  '#1abc9c', '#d35400', '#8e44ad', '#27ae60', '#f1c40f'
];

// Tier data for entry fees
const entryFeeTiers = [10, 25, 50, 100, 250];

// Demo players data (fixed, not randomly generated)
const demoPlayers = [
  { id: '1', name: 'Demo Player 1', color: '#3498db', entryFee: 25, lastSeen: 5, isPlaying: true },
  { id: '2', name: 'Demo Player 2', color: '#e74c3c', entryFee: 50, lastSeen: 3, isPlaying: true },
  { id: '3', name: 'Demo Player 3', color: '#2ecc71', entryFee: 10, lastSeen: 8, isPlaying: false },
  { id: '4', name: 'Demo Player 4', color: '#f39c12', entryFee: 100, lastSeen: 10, isPlaying: true },
  { id: '5', name: 'Demo Player 5', color: '#9b59b6', entryFee: 25, lastSeen: 15, isPlaying: false },
  { id: '6', name: 'Demo Player 6', color: '#1abc9c', entryFee: 50, lastSeen: 2, isPlaying: true },
  { id: '7', name: 'Demo Player 7', color: '#d35400', entryFee: 10, lastSeen: 12, isPlaying: false },
  { id: '8', name: 'Demo Player 8', color: '#8e44ad', entryFee: 25, lastSeen: 7, isPlaying: true },
  { id: '9', name: 'Demo Player 9', color: '#27ae60', entryFee: 100, lastSeen: 9, isPlaying: true },
  { id: '10', name: 'Demo Player 10', color: '#f1c40f', entryFee: 50, lastSeen: 4, isPlaying: false },
];

type InstantPlayersProps = {
  onQuickPlay: () => void;
  style?: ViewStyle;
};

export const InstantPlayersSection = ({ onQuickPlay, style }: InstantPlayersProps) => {
  const { isDark } = useTheme();
  // Use our fixed demo players instead of generating random ones
  const [players, setPlayers] = useState(demoPlayers);
  const [activityValue] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(0));
  
  // Simplified animation approach - use a single reusable animation for all cards
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  
  // Demo mode - no random player generation or changes
  useEffect(() => {
    // Just update the player activity status occasionally
    const interval = setInterval(() => {
      setPlayers(prev => {
        return prev.map(player => ({
          ...player,
          isPlaying: !player.isPlaying ? Math.random() > 0.7 : Math.random() > 0.2
        }));
      });
      
      // Animate activity indicator
      Animated.sequence([
        Animated.timing(activityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(activityValue, {
          toValue: 0,
          duration: 300,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);
    
    // Create continuous pulse animation for the dot
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    startPulseAnimation();
    
    // Start the shared animations for cards
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePlayerPress = () => {
    // Redirect to home screen since game screens are deleted
    router.replace('/(tabs)');
    Alert.alert("Game Disabled", "The game screens have been temporarily disabled.");
  };
  
  const activityScale = activityValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  
  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  
  const bgColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#333';
  const borderColor = isDark ? '#333' : '#e0e0e0';
  const mutedTextColor = isDark ? '#aaa' : '#777';
  
  // Simplified renderPlayer function that doesn't rely on per-index animations
  const renderPlayer = ({ item, index }: { item: any, index: number }) => {
    // Stagger effect using item's index
    const animStyle = {
      opacity: opacityAnim,
      transform: [
        { 
          translateY: translateYAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }) 
        }
      ]
    };
    
    return (
      <Animated.View
        style={[
          styles.playerCardWrapper,
          animStyle
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.playerCard,
            {
              backgroundColor: bgColor,
              borderColor: borderColor,
            }
          ]}
          onPress={handlePlayerPress}
          activeOpacity={0.8}
        >
          <View style={[styles.playerAvatar, { backgroundColor: item.color }]}>
            <Text style={styles.playerInitial}>{item.name.charAt(0)}</Text>
          </View>
          
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: textColor }]}>
              {item.name}
            </Text>
            
            <View style={styles.playerStatus}>
              {item.isPlaying ? (
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeStatusGradient}
                >
                  <View style={styles.activeIndicator} />
                  <Text style={styles.activeStatusText}>
                    Playing now
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={[styles.statusText, { color: mutedTextColor }]}>
                  {item.lastSeen}m ago
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.entryFeeContainer}>
            <Text style={[styles.entryFeeLabel, { color: mutedTextColor }]}>Fee</Text>
            <Text style={[styles.entryFeeValue, { color: textColor }]}>₹{item.entryFee}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.playButton}
            onPress={handlePlayerPress}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playButtonGradient}
            >
              <Text style={styles.playButtonText}>Play</Text>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <View style={styles.activityContainer}>
          <Animated.View style={[
            styles.activityDot,
            { backgroundColor: '#22C55E' },
            { transform: [{ scale: pulseScale }] }
          ]} />
          <Text style={[styles.activityText, { color: mutedTextColor }]}>
            Demo Mode
          </Text>
        </View>
      </View>
      
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playersList}
        bounces={true}
        snapToAlignment="start"
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 220, // width of the item + margin
          offset: 220 * index,
          index
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activityText: {
    fontSize: 14,
  },
  playersList: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 10,
  },
  playerCardWrapper: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  playerCard: {
    borderRadius: 16,
    padding: 16,
    width: 200,
    borderWidth: 1,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  playerInfo: {
    marginBottom: 12,
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  playerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  activeStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
  },
  entryFeeContainer: {
    marginBottom: 14,
  },
  entryFeeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  entryFeeValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  playButton: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  playButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 
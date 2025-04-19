import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

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

// Generate random player data
const generateRandomPlayers = (count: number) => {
  const players = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName.charAt(0)}.`;
    const color = playerColors[Math.floor(Math.random() * playerColors.length)];
    const entryFee = entryFeeTiers[Math.floor(Math.random() * entryFeeTiers.length)];
    const lastSeen = Math.floor(Math.random() * 25) + 1; // 1-25 minutes
    
    players.push({
      id: i.toString(),
      name,
      color,
      entryFee,
      lastSeen,
      isPlaying: Math.random() > 0.3, // 70% chance of being "playing now"
    });
  }
  return players;
};

export const SimplePlayerList = () => {
  const { isDark } = useTheme();
  const [players, setPlayers] = useState(generateRandomPlayers(10));
  const [activityValue] = useState(new Animated.Value(0));
  
  // Every few seconds, refresh some of the players to create the illusion of activity
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        // Replace 1-3 players
        const replacementCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < replacementCount; i++) {
          const indexToReplace = Math.floor(Math.random() * newPlayers.length);
          const randomPlayer = generateRandomPlayers(1)[0];
          newPlayers[indexToReplace] = {
            ...randomPlayer,
            id: newPlayers[indexToReplace].id, // Keep the same ID to avoid UI flicker
          };
        }
        return newPlayers;
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
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePlayerPress = () => {
    router.navigate('/instant-match');
  };
  
  const activityScale = activityValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  
  const bgColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#333';
  const borderColor = isDark ? '#333' : '#e0e0e0';
  const mutedTextColor = isDark ? '#aaa' : '#777';
  
  const renderPlayer = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.playerCard,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        }
      ]}
      onPress={handlePlayerPress}
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
            <>
              <View style={styles.activeIndicator} />
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                Playing now
              </Text>
            </>
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
      
      <Ionicons name="chevron-forward" size={18} color={mutedTextColor} />
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            Instant Play
          </Text>
          
          <View style={styles.activityIndicator}>
            <Animated.View 
              style={[
                styles.pulsingDot,
                { transform: [{ scale: activityScale }] }
              ]} 
            />
            <Text style={[styles.activityText, { color: mutedTextColor }]}>
              {players.filter(p => p.isPlaying).length} playing now
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.playButton,
            { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
          ]}
          onPress={handlePlayerPress}
        >
          <Ionicons name="flash" size={16} color="#fff" />
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playersList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  activityText: {
    fontSize: 14,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  playersList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    width: 220,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
  },
  entryFeeContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  entryFeeLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  entryFeeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 
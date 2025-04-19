import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

type StatsObject = {
  totalPrizePool: number;
  activeContests: number;
  totalPlayers: number;
};

type ContestStatsProps = {
  totalPrizePool?: number;
  activeContests?: number;
  totalPlayers?: number;
  stats?: StatsObject;
  isDark?: boolean;
};

export const ContestStats = ({ 
  totalPrizePool: propsTotalPrizePool, 
  activeContests: propsActiveContests, 
  totalPlayers: propsTotalPlayers,
  stats,
  isDark: propIsDark
}: ContestStatsProps) => {
  const themeContext = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeContext.isDark;
  
  // Use either direct props or stats object
  const totalPrizePool = propsTotalPrizePool !== undefined ? propsTotalPrizePool : stats?.totalPrizePool || 0;
  const activeContests = propsActiveContests !== undefined ? propsActiveContests : stats?.activeContests || 0;
  const totalPlayers = propsTotalPlayers !== undefined ? propsTotalPlayers : stats?.totalPlayers || 0;
  
  const backgroundColor = isDark ? '#222' : '#fff';
  const textColor = isDark ? '#fff' : '#333';
  const accentColor = isDark ? Colors.dark.tint : Colors.light.tint;
  const secondaryColor = isDark ? '#444' : '#f0f0f0';
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.header, { color: textColor }]}>
        Today's Stats
      </Text>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: secondaryColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
            <Ionicons name="trophy" size={22} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            ₹{totalPrizePool.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Prize Pool
          </Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: secondaryColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
            <Ionicons name="game-controller" size={22} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            {activeContests}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Active Contests
          </Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: secondaryColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: accentColor }]}>
            <Ionicons name="people" size={22} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            {totalPlayers.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>
            Players
          </Text>
        </View>
      </View>
      
      <View style={[styles.leaderboardPreview, { backgroundColor: secondaryColor }]}>
        <View style={styles.leaderboardHeader}>
          <Text style={[styles.leaderboardTitle, { color: textColor }]}>
            Top Players
          </Text>
          <Text style={[styles.leaderboardLink, { color: accentColor }]}>
            View All
          </Text>
        </View>
        
        <View style={styles.leaderboardEntries}>
          {[
            { name: 'Alex K.', winnings: 12450, rank: 1 },
            { name: 'Jordan T.', winnings: 9870, rank: 2 },
            { name: 'Morgan L.', winnings: 7650, rank: 3 }
          ].map((player, index) => (
            <View key={index} style={styles.leaderboardEntry}>
              <View style={styles.rankContainer}>
                <Text style={[
                  styles.rankText, 
                  { color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
                ]}>
                  {player.rank}
                </Text>
              </View>
              <Text style={[styles.playerName, { color: textColor }]}>
                {player.name}
              </Text>
              <Text style={[styles.playerWinnings, { color: accentColor }]}>
                ₹{player.winnings.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  leaderboardPreview: {
    borderRadius: 8,
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardLink: {
    fontSize: 14,
  },
  leaderboardEntries: {},
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  rankContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  playerWinnings: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 
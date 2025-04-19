import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useTheme } from './lib/ThemeContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { 
  getGameHistory, 
  GameHistoryEntry, 
  clearGameHistory, 
  deleteGameFromHistory,
  syncGameHistoryWithSupabase,
  getGameHistoryFromSupabase,
  updateUserProfile,
  getUserProfile,
  syncProfileStatsWithSupabase
} from './lib/LocalStorage';
import { supabase, getProfile, updateProfile } from '@/lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function GameHistoryScreen() {
  const { isDark } = useTheme();
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'none' | 'syncing' | 'success' | 'failed'>('none');
  const [userId, setUserId] = useState<string | null>(null);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!state.isConnected;
      setIsOnline(online);
      
      // If we just came online and we're authenticated, trigger a sync
      if (online && isAuthenticated && !refreshing && !loading && userId) {
        syncAllData();
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, userId, loading, refreshing]);

  // Initial load
  useEffect(() => {
    checkAuthStatus();
    loadGameHistory();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await supabase.auth.getSession();
      const authenticated = !!session?.data?.session?.user?.id;
      setIsAuthenticated(authenticated);
      
      if (authenticated && session?.data?.session?.user?.id) {
        setUserId(session.data.session.user.id);
      } else {
        setUserId(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserId(null);
    }
  };

  // Sync all user data with Supabase
  const syncAllData = async () => {
    if (!isAuthenticated || !userId || !isOnline) return;
    
    setSyncStatus('syncing');
    try {
      // Sync game history
      const syncSuccess = await syncGameHistoryWithSupabase();
      
      // Sync profile data
      const userProfile = await getUserProfile();
      if (userProfile && userId) {
        await syncProfileStatsWithSupabase(userId, userProfile);
        
        // Reconcile profile data with Supabase to ensure consistency
        await reconcileProfileStats(userId, userProfile);
      }
      
      setSyncStatus(syncSuccess ? 'success' : 'failed');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus('failed');
    }
  };

  // Reconcile local and remote profile statistics
  const reconcileProfileStats = async (userId: string, localProfile: any) => {
    try {
      // Get Supabase profile
      const { data: supabaseProfile } = await getProfile(userId);
      
      if (!supabaseProfile) return;
      
      // Keep track of if we need to update Supabase
      let needsSupabaseUpdate = false;
      let supabaseUpdates: any = {};
      
      // Keep track of if we need to update local storage
      let needsLocalUpdate = false;
      let localUpdates: any = {};
      
      // Compare games played
      if (localProfile.totalGamesPlayed > (supabaseProfile.total_games_played || 0)) {
        needsSupabaseUpdate = true;
        supabaseUpdates.total_games_played = localProfile.totalGamesPlayed;
      } else if ((supabaseProfile.total_games_played || 0) > localProfile.totalGamesPlayed) {
        needsLocalUpdate = true;
        localUpdates.totalGamesPlayed = supabaseProfile.total_games_played;
      }
      
      // Compare earnings
      if (localProfile.totalEarnings > (supabaseProfile.total_earnings || 0)) {
        needsSupabaseUpdate = true;
        supabaseUpdates.total_earnings = localProfile.totalEarnings;
      } else if ((supabaseProfile.total_earnings || 0) > localProfile.totalEarnings) {
        needsLocalUpdate = true;
        localUpdates.totalEarnings = supabaseProfile.total_earnings;
      }
      
      // Compare highest score
      if (localProfile.highestScore > (supabaseProfile.highest_score || 0)) {
        needsSupabaseUpdate = true;
        supabaseUpdates.highest_score = localProfile.highestScore;
      } else if ((supabaseProfile.highest_score || 0) > localProfile.highestScore) {
        needsLocalUpdate = true;
        localUpdates.highestScore = supabaseProfile.highest_score;
      }
      
      // Update Supabase if needed
      if (needsSupabaseUpdate) {
        await updateProfile(userId, supabaseUpdates);
        console.log('Updated Supabase profile with local data:', supabaseUpdates);
      }
      
      // Update local storage if needed
      if (needsLocalUpdate) {
        await updateUserProfile(localUpdates);
        console.log('Updated local profile with Supabase data:', localUpdates);
      }
    } catch (error) {
      console.error('Error reconciling profile stats:', error);
    }
  };

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      let history: GameHistoryEntry[] = [];
      
      // If authenticated and online, try to get from Supabase first
      const session = await supabase.auth.getSession();
      const authenticated = !!session?.data?.session?.user?.id;
      setIsAuthenticated(authenticated);
      
      if (authenticated && isOnline) {
        try {
          // Get the user ID
          if (!session?.data?.session) {
            throw new Error("Session data is missing");
          }
          const currentUserId = session.data.session.user.id;
          setUserId(currentUserId);
          
          // Try to get history from Supabase
          const supabaseHistory = await getGameHistoryFromSupabase();
          if (supabaseHistory && supabaseHistory.length > 0) {
            history = supabaseHistory;
            setLastSyncTime(new Date());
            
            // Recalculate profile statistics from game history
            await updateProfileFromHistory(supabaseHistory, currentUserId);
          } else {
            // If no history in Supabase but we're authenticated, sync local history
            history = await getGameHistory();
            if (history.length > 0) {
              const syncSuccess = await syncGameHistoryWithSupabase();
              setSyncStatus(syncSuccess ? 'success' : 'failed');
              
              // Fetch again after sync
              const updatedHistory = await getGameHistoryFromSupabase();
              if (updatedHistory && updatedHistory.length > 0) {
                history = updatedHistory;
                
                // Recalculate profile statistics
                await updateProfileFromHistory(updatedHistory, currentUserId);
              }
              setLastSyncTime(new Date());
            }
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
          setSyncStatus('failed');
          // Fall back to local storage on error
          history = await getGameHistory();
        }
      } else {
        // Not authenticated or offline, use local storage
        history = await getGameHistory();
      }
      
      setGameHistory(history);
    } catch (error) {
      console.error('Error loading game history:', error);
      Alert.alert('Error', 'Failed to load game history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update profile statistics based on game history
  const updateProfileFromHistory = async (history: GameHistoryEntry[], userId: string) => {
    if (!history || history.length === 0 || !userId) return;
    
    try {
      // Calculate statistics from game history
      let totalGamesPlayed = history.length;
      let totalEarnings = 0;
      let highestScore = 0;
      
      // Loop through history to calculate stats
      history.forEach(game => {
        totalEarnings += game.earnings || 0;
        if (game.score > highestScore) {
          highestScore = game.score;
        }
      });
      
      // Get current profile from Supabase
      const { data: supabaseProfile } = await getProfile(userId);
      
      // Only update if stats are higher than current values
      let needsUpdate = false;
      const updates: any = {};
      
      if (!supabaseProfile) {
        // Profile doesn't exist, create it with all stats
        needsUpdate = true;
        updates.total_games_played = totalGamesPlayed;
        updates.total_earnings = totalEarnings;
        updates.highest_score = highestScore;
      } else {
        // Profile exists, only update if new stats are higher
        if (totalGamesPlayed > (supabaseProfile.total_games_played || 0)) {
          needsUpdate = true;
          updates.total_games_played = totalGamesPlayed;
        }
        
        if (totalEarnings > (supabaseProfile.total_earnings || 0)) {
          needsUpdate = true;
          updates.total_earnings = totalEarnings;
        }
        
        if (highestScore > (supabaseProfile.highest_score || 0)) {
          needsUpdate = true;
          updates.highest_score = highestScore;
        }
      }
      
      // Update Supabase profile if needed
      if (needsUpdate) {
        await updateProfile(userId, updates);
        console.log('Updated profile stats in Supabase based on history:', updates);
        
        // Also update local profile
        await updateUserProfile({
          totalGamesPlayed: Math.max(totalGamesPlayed, supabaseProfile?.total_games_played || 0),
          totalEarnings: Math.max(totalEarnings, supabaseProfile?.total_earnings || 0),
          highestScore: Math.max(highestScore, supabaseProfile?.highest_score || 0)
        });
      }
    } catch (error) {
      console.error('Error updating profile from history:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    syncAllData();
    loadGameHistory();
  }, [userId, isAuthenticated, isOnline]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteGame = (gameId: string) => {
    Alert.alert(
      "Delete Game",
      "Are you sure you want to remove this game from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from storage (will handle both local and Supabase)
              await deleteGameFromHistory(gameId);
              
              // Update the state
              setGameHistory(prevHistory => prevHistory.filter(game => game.id !== gameId));
              
              // Refresh game history from source
              if (isAuthenticated && userId && isOnline) {
                await loadGameHistory();
              }
              
              // Show success message
              Alert.alert("Success", "Game removed from history");
            } catch (error) {
              console.error('Error deleting game:', error);
              Alert.alert('Error', 'Failed to delete game. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Game History",
      "Are you sure you want to clear your entire game history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearGameHistory();
              setGameHistory([]);
              Alert.alert("Success", "Game history cleared");
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Render a game history item (simple row layout)
  const renderGameHistoryItem = ({ item }: { item: GameHistoryEntry }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/game-result', params: { id: item.id } } as any)}
      activeOpacity={0.8}
      style={styles.rowTouchable}
    >
      <View style={[
        styles.tableRow,
        isDark ? { backgroundColor: '#23171a' } : { backgroundColor: '#fff' }
      ]}>
        <ThemedText style={[styles.tableCell, { color: isDark ? '#fff' : '#222', opacity: 1 }]}>{formatDate(item.date)}</ThemedText>
        <ThemedText style={[styles.tableCell, { color: isDark ? '#fff' : '#222', opacity: 1 }]}>{item.score}</ThemedText>
        <ThemedText style={[styles.tableCell, { color: isDark ? '#fff' : '#222', opacity: 1 }]}>{item.rank <= 3 ? (item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉') : `#${item.rank}`}</ThemedText>
        <ThemedText style={[styles.tableCell, { color: isDark ? '#fff' : '#222', opacity: 1 }]}>{item.correctAnswers}/{item.totalQuestions}</ThemedText>
        <ThemedText style={[styles.tableCell, styles.earningsCell, { color: isDark ? '#ffb3b3' : '#c31432', opacity: 1 }]}>₹{item.earnings}</ThemedText>
        <ThemedText style={[styles.tableCell, { color: isDark ? '#fff' : '#222', opacity: 1 }]}>{item.avgResponseTime?.toFixed(1)}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  // --- Stats calculation ---
  const totalGames = gameHistory.length;
  const totalEarnings = gameHistory.reduce((sum, g) => sum + (g.earnings || 0), 0);
  const totalCorrect = gameHistory.reduce((sum, g) => sum + (g.correctAnswers || 0), 0);
  const totalQuestions = gameHistory.reduce((sum, g) => sum + (g.totalQuestions || 0), 0);
  const highestScore = gameHistory.reduce((max, g) => g.score > max ? g.score : max, 0);
  const averageAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : '0.0';

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={isDark ? ['#6a040f', '#370617'] : ['#ff4e50', '#c31432']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          {/* Stats Summary with dark red gradient */}
          <View style={styles.statsSummaryContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statsBox}>
                <ThemedText style={[styles.statsValue, { color: '#fff' }]}>{totalGames}</ThemedText>
                <ThemedText style={styles.statsLabel}>Games / गेम्स</ThemedText>
              </View>
              <View style={styles.statsBox}>
                <ThemedText style={[styles.statsValue, { color: '#fff' }]}>₹{totalEarnings}</ThemedText>
                <ThemedText style={styles.statsLabel}>Earnings / कमाई</ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsBox}>
                <ThemedText style={[styles.statsValue, { color: '#fff' }]}>{totalCorrect}/{totalQuestions}</ThemedText>
                <ThemedText style={styles.statsLabel}>Correct / सही</ThemedText>
              </View>
              <View style={styles.statsBox}>
                <ThemedText style={[styles.statsValue, { color: '#fff' }]}>{averageAccuracy}%</ThemedText>
                <ThemedText style={styles.statsLabel}>Accuracy / सटीकता</ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsBox}>
                <ThemedText style={[styles.statsValue, { color: '#fff' }]}>{highestScore}</ThemedText>
                <ThemedText style={styles.statsLabel}>High Score / उच्च स्कोर</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={isDark ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Game History</ThemedText>
            {gameHistory.length > 0 && (
              <TouchableOpacity 
                onPress={handleClearHistory}
                style={styles.clearButton}
              >
                <Ionicons 
                  name="trash-outline" 
                  size={20} 
                  color={isDark ? "#ff6b6b" : "#d63031"} 
                />
              </TouchableOpacity>
            )}
          </View>
          {lastSyncTime && isAuthenticated && (
            <View style={styles.syncInfoContainer}>
              <Ionicons 
                name="cloud-done-outline" 
                size={16} 
                color={isDark ? "#64B5F6" : "#2196F3"} 
                style={styles.iconMargin}
              />
              <ThemedText style={styles.syncInfoText}>
                {`Last synced: ${lastSyncTime.toLocaleTimeString()}`}
              </ThemedText>
            </View>
          )}
          {/* Table header */}
          <View style={[styles.tableHeader, isDark && { backgroundColor: '#370617' }]}> 
            <View style={styles.tableHeaderCell}><ThemedText style={styles.headerText}>Date</ThemedText><ThemedText style={styles.headerTextHindi}>तारीख</ThemedText></View>
            <View style={styles.tableHeaderCell}><ThemedText style={styles.headerText}>Score</ThemedText><ThemedText style={styles.headerTextHindi}>स्कोर</ThemedText></View>
            <View style={styles.tableHeaderCell}><ThemedText style={styles.headerText}>Rank</ThemedText><ThemedText style={styles.headerTextHindi}>रैंक</ThemedText></View>
            <View style={styles.tableHeaderCell}><ThemedText style={styles.headerText}>Correct</ThemedText><ThemedText style={styles.headerTextHindi}>सही</ThemedText></View>
            <View style={styles.tableHeaderCell}><ThemedText style={[styles.headerText, styles.earningsCell]}>Earnings</ThemedText><ThemedText style={[styles.headerTextHindi, styles.earningsCell]}>कमाई</ThemedText></View>
            <View style={styles.tableHeaderCell}><ThemedText style={styles.headerText}>Avg. Time</ThemedText><ThemedText style={styles.headerTextHindi}>औसत समय</ThemedText></View>
          </View>
          <FlatList
            data={gameHistory}
            renderItem={renderGameHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3949AB']}
                tintColor={isDark ? '#fff' : '#3949AB'}
              />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="large" color={isDark ? "#fff" : "#3949AB"} />
                  <ThemedText style={styles.emptyText}>Loading game history...</ThemedText>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons 
                    name="game-controller-outline" 
                    size={64} 
                    color={isDark ? "#555" : "#ccc"} 
                  />
                  <ThemedText style={styles.emptyText}>
                    No game history yet. Play some games to see your stats here!
                  </ThemedText>
                  <TouchableOpacity 
                    style={[styles.playGameButton, {backgroundColor: '#3949AB'}]}
                    onPress={() => router.push({ pathname: '/(tabs)' } as any)}
                  >
                    <ThemedText style={styles.playGameButtonText}>Play a Game</ThemedText>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        </ThemedView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
    opacity: 0.7,
  },
  playGameButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  playGameButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gameHistoryItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameHistoryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameHistoryDateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  iconMargin: {
    marginRight: 5,
  },
  gameHistoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameHistoryStat: {
    alignItems: 'center',
    flex: 1,
  },
  gameHistoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameHistoryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  syncInfoText: {
    fontSize: 12,
    opacity: 0.8,
  },
  statsSummaryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsBox: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  rowTouchable: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    marginTop: 8,
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 14,
  },
  headerTextHindi: {
    fontWeight: 'normal',
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 13,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
    color: '#222',
  },
  earningsCell: {
    color: '#c31432',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
}); 
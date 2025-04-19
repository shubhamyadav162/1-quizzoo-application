import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/lib/ThemeContext';
import { useFilters } from '@/app/lib/FilterContext';
import { CONTEST_POOLS, getPoolsByCategory, getPoolsByEntryFeeRange } from '@/app/lib/ContestPoolDefinitions';
import { ContestPoolType } from '@/app/lib/types/ContestTypes';
import { supabase } from '@/app/lib/supabase';
import { Animated as RNAnimated } from 'react-native';
import { useRef } from 'react';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 200;

// Pool type images using static assets
const poolTypeImages = {
  standard: require('@/assets/images/icon.png'),
  medium: require('@/assets/images/icon.png'),
  large: require('@/assets/images/icon.png'),
  duel: require('@/assets/images/icon.png'),
  special: require('@/assets/images/icon.png'),
};

// Enhanced ContestPool type with additional properties
type EnhancedContestPool = ContestPoolType & {
  participants: number;
  maxParticipants: number;
  isFilling: boolean;
};

// Default filter type for fallback
const defaultFilters = {
  entryFeeRange: {
    enabled: false,
    min: 10,
    max: 1000,
    custom: null,
  },
  playerCounts: [],
};

type AnimatedJoinButtonProps = {
  onPress: () => void;
  disabled: boolean;
  children: React.ReactNode;
  gradientColors: string[];
};

const AnimatedJoinButton: React.FC<AnimatedJoinButtonProps> = ({ onPress, disabled, children, gradientColors }) => {
  const joinScale = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    RNAnimated.spring(joinScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    RNAnimated.spring(joinScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <RNAnimated.View style={{ transform: [{ scale: joinScale }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.joinButton}
      >
        <LinearGradient
          colors={[gradientColors[1], gradientColors[0]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.joinButtonGradient}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    </RNAnimated.View>
  );
};

export const ContestPoolSection = () => {
  const { isDark } = useTheme();
  const filtersContext = useFilters();
  const filters = filtersContext?.filters || defaultFilters;
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pools, setPools] = useState<EnhancedContestPool[]>([]);
  const [filteredPools, setFilteredPools] = useState<EnhancedContestPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    
    getUser();
  }, []);

  // Initialize pools with mock data
  useEffect(() => {
    const enhancedPools = CONTEST_POOLS.map(pool => ({
      ...pool,
      participants: Math.floor(Math.random() * pool.playerCount), // Mock participants
      maxParticipants: pool.playerCount,
      isFilling: true
    }));

    setPools(enhancedPools);
    setFilteredPools(enhancedPools);
  }, []);

  // Filter pools based on selected category and filter criteria
  useEffect(() => {
    filterPools();
  }, [selectedCategory, filters, pools]);

  const filterPools = () => {
    let result = [...pools];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(pool => pool.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Apply entry fee filter if enabled
    if (filters.entryFeeRange && filters.entryFeeRange.enabled) {
      const { min, max } = filters.entryFeeRange;
      result = result.filter(pool => pool.entryFee >= min && pool.entryFee <= max);
    }
    
    // Apply player count filter if any selected
    if (filters.playerCounts && Array.isArray(filters.playerCounts) && filters.playerCounts.some(pc => pc.selected)) {
      const selectedCounts = filters.playerCounts
        .filter(pc => pc.selected)
        .map(pc => pc.count);
      
      if (selectedCounts.length > 0) {
        result = result.filter(pool => selectedCounts.includes(pool.playerCount));
      }
    }
    
    setFilteredPools(result);
  };

  // Handle joining a contest
  const handleJoinContest = async (item: EnhancedContestPool) => {
    try {
      setJoining(true);
      
      // In a real app, you would make an API call to register the user for this contest
      console.log('Joining contest:', item.id, 'Entry fee:', item.entryFee);
      
      // Simulate API call with timeout
      setTimeout(() => {
        setJoining(false);
        
        // Navigate to lobby-12 instead of quiz game screen
        // For debugging in console
        const params = {
          contestId: item.id,
          entryFee: item.entryFee ? item.entryFee.toString() : "0",
          mode: "contest" // Specify the mode explicitly
        };
        
        console.log("Navigating with params:", params);
        
        router.push({
          pathname: '/game/lobby-12' as any,
          params: params
        });
      }, 1000);
    } catch (error) {
      console.error('Error joining contest:', error);
      setJoining(false);
      Alert.alert('Error', 'Failed to join the contest. Please try again.');
    }
  };

  // Get gradient colors based on pool category
  const getGradientColors = (type: string): string[] => {
    switch(type.toLowerCase()) {
      case 'duel':
        return ['#F43F5E', '#FB7185'];
      case 'standard':
        return ['#3B82F6', '#60A5FA'];
      case 'medium':
        return ['#8B5CF6', '#A78BFA'];
      case 'large':
        return ['#10B981', '#34D399'];
      case 'special':
        return ['#F59E0B', '#FBBF24'];
      default:
        return ['#6B7280', '#9CA3AF'];
    }
  };

  // Calculate fill percentage for progress bar
  const calculateFillPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  // 1. Add a helper to get emoji by pool type/category
  const getPoolEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'standard': return '🏆';
      case 'medium': return '⚡';
      case 'large': return '💰';
      case 'duel': return '🤼';
      case 'special': return '🌟';
      default: return '🎲';
    }
  };

  // 2. Add a scale animation for the Join Now button
  const renderPoolCard = ({ item }: { item: EnhancedContestPool }) => {
    const gradientColors = getGradientColors(item.category);
    const imageSource = poolTypeImages.standard;

    return (
      <TouchableOpacity
        style={styles.poolCard}
        onPress={() => handleJoinContest(item)}
        activeOpacity={0.9}
        disabled={joining}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.poolCardBackground}
        >
          <ImageBackground
            source={imageSource}
            style={styles.poolCardOverlay}
            imageStyle={{ opacity: 0.15 }}
            resizeMode="cover"
          >
            <View style={styles.poolCardContent}>
              <Text style={styles.poolTitle}>
                {getPoolEmoji(item.category)} {item.name}
              </Text>
              <View style={styles.poolInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Entry Fee</Text>
                  <Text style={styles.infoValue}>₹{item.entryFee}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Prize Pool</Text>
                  <Text style={styles.infoValue}>₹{item.netPrizePool}</Text>
                </View>
              </View>
              <View style={styles.participantsInfo}>
                <View style={styles.participantsBar}>
                  <View 
                    style={[
                      styles.participantsFill,
                      { width: `${Math.min((item.participants / item.maxParticipants) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.participantsText}>
                  {item.participants}/{item.maxParticipants} Players
                </Text>
              </View>
              <AnimatedJoinButton
                onPress={() => handleJoinContest(item)}
                disabled={joining}
                gradientColors={gradientColors}
              >
                {joining ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.joinButtonText}>Join Now</Text>
                )}
              </AnimatedJoinButton>
            </View>
          </ImageBackground>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category filters */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
          Contest Pools
        </Text>
      </View>
      
      {/* Category selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {['All', 'Standard', 'Medium', 'Large', 'Duel', 'Special'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
              {
                backgroundColor: isDark
                  ? selectedCategory === category
                    ? '#4B5563'
                    : '#262626'
                  : selectedCategory === category
                  ? '#E5E7EB'
                  : '#F3F4F6',
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
                { color: isDark ? '#FFFFFF' : '#1F2937' },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Pool cards */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.poolsContainer}
        contentContainerStyle={styles.poolsContent}
        data={filteredPools}
        keyExtractor={(item) => item.id}
        renderItem={renderPoolCard}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
              No contests available in this category
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    fontWeight: '700',
  },
  poolsContainer: {
    overflow: 'visible',
  },
  poolsContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  poolCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  poolCardBackground: {
    width: '100%',
    height: '100%',
  },
  poolCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  poolCardContent: {
    gap: 12,
  },
  poolTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  poolInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  participantsInfo: {
    marginTop: 4,
  },
  participantsBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 4,
  },
  participantsFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  participantsText: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  joinButton: {
    marginTop: 8,
  },
  joinButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    width: width - 40,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 
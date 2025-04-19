import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
  Image, 
  ActivityIndicator,
  Alert,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';
import { useFilters } from '@/app/lib/FilterContext';
import { ContestFilters } from './ContestFilters';
import { LinearGradient } from 'expo-linear-gradient';
import { Text as AutoText } from './AutoText';
import { Colors } from '@/constants/Colors';
import contestApi, { Contest, registerForScheduledContest } from '@/app/lib/api';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CONTEST_POOLS, getPoolById, getPoolsByCategory, getPoolsByEntryFeeRange, getPoolsByStakeTier, POOL_CATEGORIES, STAKE_TIERS } from '@/app/lib/ContestPoolDefinitions';
import { ContestPoolType } from '@/app/lib/types/ContestTypes';
import { Animated as RNAnimated } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 250;
const CARD_MARGIN = 10;

// Define pool types
type PoolType = 'bollywood' | 'cricket' | 'football' | 'technology' | 'science' | 'special' | 'politics' | 'history' | 'geography' | 'music' | 'literature' | 'current_affairs' | 'regional' | 'celebrities' | 'movies_new' | 'sports_new' | 'food_culture' | 'standup_comedy' | 'religious' | 'languages' | 'art' | 'standard' | 'medium' | 'large' | 'duel';

// Contest pool images based on type
const poolTypeImages: Record<string, string> = {
  bollywood: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?q=80&w=800',
  cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800',
  football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800',
  technology: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800',
  science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800',
  special: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800',
  politics: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=800',
  history: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800',
  geography: 'https://images.unsplash.com/photo-1589519160732-576f165b9aad?q=80&w=800',
  music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800',
  literature: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800',
  current_affairs: 'https://images.unsplash.com/photo-1601467556245-abea47376d89?q=80&w=800',
  regional: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800',
  celebrities: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800',
  movies_new: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800',
  sports_new: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=800',
  food_culture: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800',
  standup_comedy: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=800',
  religious: 'https://images.unsplash.com/photo-1520188740392-665a11453fde?q=80&w=800',
  languages: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800',
  art: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800',
  standard: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=800',
  medium: 'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?q=80&w=800',
  large: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800',
  duel: 'https://images.unsplash.com/photo-1560420025-9453f02b4051?q=80&w=800',
};

// Update ContestPool type
type ContestPool = ContestPoolType & {
  participants: number;
  maxParticipants: number;
  startsIn: number;
  startTime?: Date;
  isFilling: boolean;
};

// Replace mockPools with transformed CONTEST_POOLS
const transformPoolToContestPool = (pool: ContestPoolType): ContestPool => {
  return {
    ...pool,
    participants: Math.floor(Math.random() * pool.playerCount), // Mock data: actual participants
    maxParticipants: pool.playerCount,
    startsIn: Math.floor(Math.random() * 60) + 5, // Mock data: random start time between 5-65 minutes
    isFilling: true
  };
};

type AnimatedJoinButtonProps = {
  onPress: () => void;
  disabled?: boolean;
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

export const GamingPools = () => {
  const { isDark } = useTheme();
  const { filters, showFilters, setShowFilters, isFilterActive } = useFilters();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<ContestPool | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState<ContestPool[]>([]);
  const [filteredPools, setFilteredPools] = useState<ContestPool[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  
  // Animation values for pool cards
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  
  // Fetch user ID from Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    
    getUser();
  }, []);
  
  // Subscribe to contest changes
  useEffect(() => {
    // Fetch initial contests
    fetchContests();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:contests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contests'
      }, (payload: any) => {
        console.log('Contest table changed:', payload);
        fetchContests();
      })
      .subscribe();
      
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [fadeAnim, translateYAnim]);
  
  // Fetch contests from API or use transformed pools 
  const fetchContests = async () => {
    setIsLoading(true);
    
    try {
      // Try to fetch real contests from API
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('status', 'upcoming')
        .eq('is_disabled', false);
      
      if (error) {
      console.error('Error fetching contests:', error);
        // Fall back to predefined pools if API fails
        const transformedPools = CONTEST_POOLS.map(transformPoolToContestPool);
        setPools(transformedPools);
        setFilteredPools(transformedPools);
        updateCategoryCounts(transformedPools);
      } else if (data && data.length > 0) {
        // Map API contests to ContestPool format
        const apiPools = data.map(mapContestToPool);
        setPools(apiPools);
        setFilteredPools(apiPools);
        updateCategoryCounts(apiPools);
      } else {
        // No contests found in API, use predefined pools
        const transformedPools = CONTEST_POOLS.map(transformPoolToContestPool);
        setPools(transformedPools);
        setFilteredPools(transformedPools);
        updateCategoryCounts(transformedPools);
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error);
      // Fall back to predefined pools
      const transformedPools = CONTEST_POOLS.map(transformPoolToContestPool);
      setPools(transformedPools);
      setFilteredPools(transformedPools);
      updateCategoryCounts(transformedPools);
    }
    
      setIsLoading(false);
  };
  
  // Update category counts for filter display
  const updateCategoryCounts = (pools: ContestPool[]) => {
    const counts: Record<string, number> = { 'All': pools.length };
    
    pools.forEach(pool => {
      if (pool.category) {
        counts[pool.category] = (counts[pool.category] || 0) + 1;
      }
    });
    
    setCategoryCounts(counts);
  };
  
  // Map Contest from API to ContestPool
  const mapContestToPool = (contest: Contest): ContestPool => {
    const totalPool = contest.entry_fee * contest.max_participants;
    const platformFee = totalPool * (contest.platform_fee_percentage / 100);
    const netPrizePool = totalPool - platformFee;
    
    // Calculate prizes based on standard distribution (50/30/20)
    const firstPlaceReward = netPrizePool * 0.5;
    const secondPlaceReward = netPrizePool * 0.3;
    const thirdPlaceReward = netPrizePool * 0.2;
    
    // Determine category based on contest type or player count
    let category: string = 'standard';
    if (contest.contest_type) {
      category = contest.contest_type.toLowerCase();
    } else if (contest.max_participants === 2) {
      category = 'duel';
    } else if (contest.max_participants === 20) {
      category = 'medium';
    } else if (contest.max_participants === 50) {
      category = 'large';
    }
    
    // Get actual participant count
    let participants = 0;
    let isFilling = true;
    
    // Calculate start time in minutes
    let startsIn = 30;
    if (contest.start_time) {
      const startTime = new Date(contest.start_time);
      const now = new Date();
      const diffMs = startTime.getTime() - now.getTime();
      startsIn = Math.floor(diffMs / (1000 * 60));
      
      if (startsIn < 0) {
        startsIn = 0;
      }
    }
    
    return {
      id: contest.id,
      name: contest.name,
      entryFee: contest.entry_fee,
      playerCount: contest.max_participants,
      totalPool: totalPool,
      platformFee: platformFee,
      netPrizePool: netPrizePool,
      firstPlaceReward: firstPlaceReward,
      secondPlaceReward: secondPlaceReward,
      thirdPlaceReward: thirdPlaceReward,
      category: category,
      description: contest.description || `${category.charAt(0).toUpperCase() + category.slice(1)} Contest`,
      questionCount: 10, // Default
      timePerQuestionSec: 6, // Default
      participants: participants,
      maxParticipants: contest.max_participants,
      startsIn: startsIn,
      startTime: contest.start_time ? new Date(contest.start_time) : undefined,
      isInstant: contest.is_instant,
      isFilling: isFilling
    };
  };
  
  // Filter pools based on category and filter criteria
  const filterPools = () => {
    let result = [...pools];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(pool => pool.category === selectedCategory.toLowerCase());
    }
    
    // Apply entry fee filter if set
    if (filters.entryFeeRange.enabled) {
      const { min, max } = filters.entryFeeRange;
      result = result.filter(pool => pool.entryFee >= min && pool.entryFee <= max);
    }
    
    // Apply player count filter if any selected
    if (filters.playerCounts.some(pc => pc.selected)) {
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
  const handleJoinContest = async (item: ContestPool) => {
    if (!userId) {
      Alert.alert("Login Required", "Please log in to join contests");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Joining contest ${item.id} with entry fee ${item.entryFee}`);
      
      // Check if we have the user's wallet information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
      
      if (userError || !userData) {
        console.error('Error fetching user wallet:', userError);
        throw new Error('Could not fetch user wallet information');
      }
      
      // Check user wallet balance before proceeding
      if (userData.wallet_balance < item.entryFee) {
        setIsLoading(false);
        Alert.alert(
          "Insufficient Balance",
          "Please add money to your wallet to join this contest.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Add Money", 
              onPress: () => {
                // You need to define this state elsewhere in your component
                // setAddMoneyModalVisible(true);
                console.log("Open add money modal");
              }
            }
          ]
        );
        return;
      }
      
      setIsLoading(false);
      // Navigate to the lobby screen with all pool data as query params
      router.push({
        pathname: '/lobby/' + item.id,
        params: {
          id: item.id,
          name: item.name,
          entryFee: item.entryFee,
          playerCount: item.playerCount,
          totalPool: item.totalPool,
          platformFee: item.platformFee,
          netPrizePool: item.netPrizePool,
          firstPlaceReward: item.firstPlaceReward,
          secondPlaceReward: item.secondPlaceReward,
          thirdPlaceReward: item.thirdPlaceReward,
          category: item.category,
          description: item.description,
          questionCount: item.questionCount,
          timePerQuestionSec: item.timePerQuestionSec,
          isInstant: item.isInstant,
          image: item.image,
        },
      } as any);
    } catch (error) {
      console.error('Error joining contest:', error);
      Alert.alert(
        "Failed to Join Contest",
        "There was an error joining the contest. Please try again."
      );
      setIsLoading(false);
    }
  };
  
  // Register for scheduled contest
  const registerForContest = async () => {
    if (!selectedContest || !userId) return;
    
    const registered = await contestApi.registerForScheduledContest(
      selectedContest.id, 
      userId
    );
    
    if (registered) {
      setIsRegistered(true);
      
      // Close the modal first
      setShowStartTimeModal(false); 

      // Show confirmation alert (optional, as we are navigating away)
      // Alert.alert(
      //   'Registration Successful!',
      //   `You have successfully registered for ${selectedContest.title}. You will receive a notification when the contest is about to start.`,
      //   // Remove onPress navigation from here
      // );

      // Navigate to the lobby screen after successful registration
      console.log(`Navigating to lobby for registered scheduled contest ${selectedContest.id}`);
      router.push('/lobby/RegistrationSuccess' as any);

    } else {
      Alert.alert(
        'Registration Failed',
        'There was an error registering for the contest. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getGradientColors = (type: string): [string, string] => {
    switch(type) {
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

  // Format time helper function
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}h ${mins > 0 ? mins + 'm' : ''}`;
    }
  };

  // Format date for specific start times
  const formatStartTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Calculate time remaining until contest starts
  const getTimeRemaining = (startTime: Date) => {
    const now = new Date();
    const diffMs = startTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Starting now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
  };

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
      case 'bollywood': return '🎬';
      case 'cricket': return '🏏';
      case 'football': return '⚽';
      case 'technology': return '💻';
      case 'science': return '🔬';
      case 'history': return '📜';
      case 'music': return '🎵';
      case 'art': return '🎨';
      default: return '🎲';
    }
  };

  // 2. Add a scale animation for the Join/Register button
  const renderPoolCard = ({ item, index }: { item: ContestPool, index: number }) => {
    const fillPercentage = calculateFillPercentage(item.participants, item.maxParticipants);
    const gradientColors = getGradientColors(item.category);
    const imageSource = poolTypeImages[item.category];
    const isFull = item.participants >= item.maxParticipants;

    return (
      <TouchableOpacity
        style={styles.poolCard}
        activeOpacity={0.9}
        disabled={isFull}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.poolCardBackground}
        >
          <ImageBackground
            source={{ uri: imageSource }}
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
                      { width: `${(item.participants / item.maxParticipants) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.participantsText}>
                  {item.participants}/{item.maxParticipants} Players
                </Text>
              </View>
              <AnimatedJoinButton
                onPress={async () => {
                  console.log('Register button pressed for pool:', item.name, item.id);
                  if (!userId) {
                    Alert.alert('Login Required', 'Please log in to register for this pool.\n\nकृपया रजिस्टर करने के लिए लॉगिन करें।');
                    return;
                  }
                  setIsLoading(true);
                  try {
                    const result = await registerForScheduledContest(item.id, userId);
                    setIsLoading(false);
                    if (result) {
                      router.push('/lobby/RegistrationSuccess' as any);
                    } else {
                      Alert.alert(
                        'Registration Failed',
                        'Registration failed. The pool may be full or you are already registered.\n\nरजिस्ट्रेशन असफल रहा। हो सकता है पूल फुल हो या आप पहले से रजिस्टर्ड हों।',
                        [{ text: 'OK' }]
                      );
                    }
                  } catch (error) {
                    setIsLoading(false);
                    Alert.alert(
                      'Error',
                      'An error occurred during registration. Please try again.\n\nरजिस्ट्रेशन के दौरान कोई त्रुटि हुई। कृपया पुनः प्रयास करें।',
                      [{ text: 'OK' }]
                    );
                  }
                }}
                disabled={isLoading}
                gradientColors={gradientColors}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.joinButtonText}>Register / रजिस्टर करें</Text>
                )}
              </AnimatedJoinButton>
            </View>
          </ImageBackground>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Calculate active contest count
  const getActiveContestCount = () => {
    let count = 0;
    pools.forEach(pool => {
      if (pool.participants < pool.maxParticipants) {
        count++;
      }
    });
    return count;
  };
  
  return (
    <View style={styles.container}>
      {/* Category filters */}
      <View style={styles.headerRow}>
        <Text style={[styles.activeContestText, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
          Active Contests: {getActiveContestCount()}
        </Text>
        
        {/* Apply to All button */}
        <TouchableOpacity
          style={[
            styles.applyAllButton,
            { backgroundColor: isDark ? '#374151' : '#E5E7EB' }
          ]}
          onPress={() => filterPools()}
        >
          <Text style={[styles.applyAllText, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
            Apply to All
          </Text>
        </TouchableOpacity>
      </View>
      
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
            onPress={() => {
              setSelectedCategory(category);
              filterPools();
            }}
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
      
      {/* Start Time Modal */}
      <Modal
        visible={showStartTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStartTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {selectedContest?.name || 'Contest Details'}
              </Text>
              <TouchableOpacity onPress={() => setShowStartTimeModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
            </View>
            
            {selectedContest && (
              <View style={styles.modalContent}>
                <View style={styles.startTimeContainer}>
                  <Text style={[styles.startTimeLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    Contest Starts At
                  </Text>
                  <Text style={[styles.startTimeValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {selectedContest.startTime ? formatStartTime(selectedContest.startTime) : 'TBD'}
                  </Text>
                  <Text style={[styles.timeRemaining, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    ({selectedContest.startTime ? getTimeRemaining(selectedContest.startTime) : 'Soon'})
                  </Text>
                </View>
                
                <View style={styles.contestDetailRow}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                      Entry Fee
                    </Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      ₹{selectedContest.entryFee}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                      Prize Pool
                    </Text>
                    <Text style={[styles.detailValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      ₹{selectedContest.netPrizePool}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.registrationNote}>
                  <Text style={[styles.noteText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    Register now to secure your spot in this contest. You will be notified when the contest is about to start.
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.registerButton, { opacity: isRegistered ? 0.7 : 1 }]}
                  onPress={registerForContest}
                  disabled={isRegistered}
                >
                  <LinearGradient
                    colors={isRegistered ? ['#9CA3AF', '#6B7280'] : ['#22C55E', '#16A34A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.registerButtonGradient}
                  >
                    <Text style={styles.registerButtonText}>
                      {isRegistered ? 'Registered' : 'Register Now'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Show filters modal when active */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <ContestFilters onClose={() => setShowFilters(false)} />
      </Modal>
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
  activeContestText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  applyAllText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  poolInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  participantsInfo: {
    marginTop: 8,
  },
  participantsBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  participantsFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  participantsText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  joinButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    width: width - 40,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    width: '80%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    paddingBottom: 30,
  },
  startTimeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  startTimeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  startTimeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 16,
  },
  contestDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  registrationNote: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
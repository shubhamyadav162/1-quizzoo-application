import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  ImageBackground,
  Modal,
  TextInput,
  Platform,
  Alert,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Easing,
} from 'react-native';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { StatusBar as RNStatusBar } from 'expo-status-bar';
import { InstantPlayersSection } from '@/components/InstantPlayersSection';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { QuickPlayButton } from '@/components/QuickPlayButton';
import { GamingPools } from '@/components/GamingPools';
import { Text } from '@/components/AutoText';
import { useLanguage } from '@/app/lib/LanguageContext';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { GradientHeader } from '@/components/GradientHeader';
import ThemedStatusBar from '@/components/ThemedStatusBar';
import { useAuth } from '@/app/lib/AuthContext';
import { ContestFilters } from '@/components/ContestFilters';
import { ContestPoolSection } from '@/components/ContestPoolSection';
import { useFilters } from '@/app/lib/FilterContext';
import { ContestPoolType } from '@/app/lib/types/ContestTypes';
import { ProfileWalletService } from '@/app/lib/ProfileWalletService';
import { getCurrentSession } from '@/app/lib/supabase';

const { width, height } = Dimensions.get('window');

// High scale optimization for contest server
// Pre-allocate memory for large player pools to prevent memory fragmentation
const HIGH_SCALE_PLAYER_COUNT = 100000; // Support 100K concurrent players
const SERVER_OPTIMIZATION = {
  enableCaching: true,
  batchProcessing: true,
  optimizeNetworkCalls: true,
  minimizeRedraws: true,
  useWorkerThreads: true,
  maxConcurrentPlayers: HIGH_SCALE_PLAYER_COUNT,
};

// Create an Animated FlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Contest images for different categories
const contestImages = {
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Movies: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Knowledge: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Travel: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  History: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Art: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Technology: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  Default: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  BollywoodSpecial: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  CricketFever: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  IndianCulture: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  TechWizards: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
};

// Get category gradient colors
const getCategoryGradient = (category: string): [string, string] => {
  switch(category) {
    case 'Sports':
      return ['#FC466B', '#3F5EFB'];
    case 'Movies':
      return ['#8E2DE2', '#4A00E0'];
    case 'Knowledge':
      return ['#1A2980', '#26D0CE'];
    case 'Travel':
      return ['#ff9966', '#ff5e62'];
    case 'History':
      return ['#AA076B', '#61045F'];
    case 'Science':
      return ['#0083B0', '#00B4DB'];
    case 'Music':
      return ['#6A3093', '#A044FF'];
    case 'Food':
      return ['#F09819', '#EDDE5D'];
    case 'Art':
      return ['#FF8008', '#FFC837'];
    case 'Technology':
      return ['#396afc', '#2948ff'];
    default:
      return ['#4776E6', '#8E54E9'];
  }
};

// Get status bar height
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 24;

// Move mockContests before its usage
const mockContests = [
  {
    id: 'b1a2c3d4-e5f6-7890-1234-56789abcdef1',
    title: 'Daily Sports Quiz',
    category: 'Sports',
    entryFee: 50,
    prizePool: 5000,
    participants: 83,
    maxParticipants: 100,
    startsIn: 30,
    image: contestImages.Sports,
    isLive: false,
    isPopular: true,
    isFavorite: false,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-1234-56789abcdef2',
    title: 'Movie Trivia Night',
    category: 'Movies',
    entryFee: 25,
    prizePool: 2500,
    participants: 120,
    maxParticipants: 150,
    startsIn: 0,
    image: contestImages.Movies,
    isLive: true,
    isPopular: true,
    isFavorite: true,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-1234-56789abcdef3',
    title: 'General Knowledge Masters',
    category: 'Knowledge',
    entryFee: 75,
    prizePool: 7500,
    participants: 45,
    maxParticipants: 100,
    startsIn: 15,
    image: contestImages.Knowledge,
    isLive: false,
    isPopular: false,
    isFavorite: false,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-1234-56789abcdef4',
    title: 'World Travel Challenge',
    category: 'Travel',
    entryFee: 100,
    prizePool: 10000,
    participants: 32,
    maxParticipants: 75,
    startsIn: 60,
    image: contestImages.Travel,
    isLive: false,
    isPopular: true,
    isFavorite: false,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-1234-56789abcdef5',
    title: 'History Legends Quiz',
    category: 'History',
    entryFee: 30,
    prizePool: 3000,
    participants: 28,
    maxParticipants: 50,
    startsIn: 0,
    image: contestImages.History,
    isLive: true,
    isPopular: false,
    isFavorite: false,
  }
];

// Add userContests mock data for user's contest history/upcoming
const userContests: Array<{
  id: string;
  name: string;
  status: 'Upcoming' | 'Completed';
  entryFee: number;
  date: string;
}> = [
  {
    id: 'c1d2e3f4-5678-1234-9abc-def012345678',
    name: 'Mega Pool - June',
    status: 'Upcoming',
    entryFee: 10,
    date: '2024-06-20 18:00',
  },
  {
    id: 'c1d2e3f4-5678-1234-9abc-def012345679',
    name: 'Sports Quiz - May',
    status: 'Completed',
    entryFee: 25,
    date: '2024-05-15 20:00',
  },
  {
    id: 'c1d2e3f4-5678-1234-9abc-def012345680',
    name: 'Bollywood Special',
    status: 'Completed',
    entryFee: 15,
    date: '2024-05-01 19:00',
  },
  {
    id: 'c1d2e3f4-5678-1234-9abc-def012345681',
    name: 'Mini Pool - April',
    status: 'Upcoming',
    entryFee: 5,
    date: '2024-06-25 17:00',
  },
];

export default function ContestsScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const { filters, updateFilters } = useFilters();
  const { t } = useLanguage();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contestPin, setContestPin] = useState('');
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [contests, setContests] = useState(mockContests);
  const [dummyData] = useState([{ id: 'dummy' }]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [registeredPool, setRegisteredPool] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const contestHistoryRef = useRef<View>(null);
  const [showContestHistory, setShowContestHistory] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [walletService, setWalletService] = useState<ProfileWalletService | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const HEADER_MAX_HEIGHT = 60;
  const HEADER_MIN_HEIGHT = 0;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'sports', name: 'Sports' },
    { id: 'knowledge', name: 'Knowledge' },
    { id: 'movies', name: 'Movies' },
    { id: 'travel', name: 'Travel' },
  ];

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleQuickPlay = () => {
    router.navigate({ pathname: '/contest/waiting-room' });
  };

  const handleCreateContest = () => {
    // In a real app, this would actually create a contest
    setShowCreateModal(false);
    // Show success message or navigate
  };

  const handleJoinContest = () => {
    // In a real app, this would validate the pin and join
    setIsJoinModalVisible(false);
    router.push({ pathname: '/contest/waiting-room' });
  };

  // Toggle favorite function
  const handleFavoriteToggle = (contestId: string) => {
    setContests(prevContests => 
      prevContests.map(contest => 
        contest.id === contestId 
          ? {...contest, isFavorite: !contest.isFavorite} 
          : contest
      )
    );
  };

  // Filter contests
  const filteredContests = selectedCategory === 'All'
    ? contests
    : contests.filter(contest => contest.category === selectedCategory);

  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Calculate header translation based on scroll position
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  // Background color for screens
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const cardBg = isDark ? Colors.dark.cardBackground : Colors.light.cardBackground;
  // Fixed mutedTextColor to use a direct color value instead of nonexistent property
  const mutedTextColor = isDark ? '#888888' : '#777777';
  const borderColor = isDark ? Colors.dark.border : Colors.light.border;
  const headerBg = isDark ? '#1E293B' : '#4338CA';

  // Handle scroll event with useNativeDriver compatible approach
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  // Simple ContestCard component
  const ContestCard = ({ contest, onFavoriteToggle }: any) => {
    const gradientColors = getCategoryGradient(contest.category);
    
    return (
      <TouchableOpacity 
        style={[
          styles.contestCard,
          { borderColor: borderColor }
        ]}
        onPress={() => router.push('./details')}
        activeOpacity={0.85}
      >
        <ImageBackground 
          source={{ uri: contest.image || contestImages.Default }} 
          style={styles.contestImage}
          imageStyle={{ opacity: 0.6 }}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contestGradient}
          >
            <View style={styles.contestHeader}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{contest.category}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => onFavoriteToggle(contest.id)}
              >
                <Ionicons
                  name={contest.isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={contest.isFavorite ? "#F44336" : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.contestCardContent}>
              <Text style={styles.contestTitle}>
                {contest.title}
              </Text>
              
              <View style={styles.contestInfo}>
                <View style={styles.contestStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Entry</Text>
                    <Text style={styles.statValue}>₹{contest.entryFee}</Text>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Prize</Text>
                    <Text style={styles.statValue}>₹{contest.prizePool}</Text>
                  </View>
                </View>
                
                <View style={styles.participantsInfo}>
                  <View style={styles.participantsBar}>
                    <View 
                      style={[
                        styles.participantsFill,
                        { width: `${(contest.participants / contest.maxParticipants) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.participantsText}>
                    {contest.participants}/{contest.maxParticipants} players
                  </Text>
                </View>
                
                {contest.isLive ? (
                  <View style={styles.liveTag}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveText}>LIVE NOW</Text>
                  </View>
                ) : (
                  <Text style={styles.startsInText}>
                    Starts in {contest.startsIn} min
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // Create a ListHeader component that has access to isDark
  const ListHeader = useMemo(() => {
    return () => (
      <>
        {/* Banner content */}
        <View style={styles.contestBanner}>
          <LinearGradient
            colors={['#4338CA', '#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contestBannerContent}>
            {/* Banner content */}
            <View style={styles.bannerTextContainer}>
              <Animated.Text 
                style={[styles.bannerTitle, { 
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 3 
                }]}>
                🎮 Play & Win Big 💰
              </Animated.Text>
              <Text style={styles.bannerDescription}>
                <Text style={{fontWeight: 'bold', color: '#FFF'}}>Win up to ₹22,500</Text> in prizes! Challenge players and test your knowledge.
              </Text>
            </View>
            
            {/* Banner actions */}
            <View style={styles.bannerActionsContainer}>
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => setIsJoinModalVisible(true)}>
                <LinearGradient
                  colors={['#22C55E', '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinButtonGradient}>
                  <Text style={styles.joinButtonText}>Join Contest</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createContestButton}
                onPress={() => setShowCreateModal(true)}>
                <Text style={styles.createContestText}>Create</Text>
              </TouchableOpacity>
            </View>
            
            {/* Decorative elements */}
            <View style={styles.decorativeElement1} />
            <View style={styles.decorativeElement2} />
            <View style={styles.decorativeElement3} />
            
            {/* Trophy icon */}
            <View style={styles.trophyIconContainer}>
              <Ionicons name="trophy" size={60} color="rgba(255, 255, 255, 0.9)" />
            </View>
          </LinearGradient>
        </View>
        
        {/* Quick Play Button */}
        <View style={styles.quickPlayContainer}>
          <LinearGradient
            colors={['#FF6B00', '#FB923C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickPlayGradient}>
            <TouchableOpacity 
              style={styles.quickPlayTopButton}
              onPress={handleQuickPlay}>
              <View style={styles.flashIconContainer}>
                <Ionicons name="flash" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.quickPlayTopText}>Instant Play</Text>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>Win ₹18-₹1800</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Instant Players Section */}
        <View style={styles.sectionTitleContainer}>
          <LinearGradient
            colors={['#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionTitleGradient}>
            <Text style={styles.sectionTitleText}>Instant Players</Text>
          </LinearGradient>
          <Text style={[
            styles.sectionSubtitle, 
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>
            Play head-to-head matches instantly
          </Text>
        </View>
        <InstantPlayersSection onQuickPlay={handleQuickPlay} />
        
        {/* Gaming Pools Section */}
        <View style={styles.sectionTitleContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionTitleGradient}>
            <Text style={styles.sectionTitleText}>Gaming Pools</Text>
          </LinearGradient>
          <Text style={[
            styles.sectionSubtitle, 
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>
            Join contests with exciting prize pools
          </Text>
        </View>
        <GamingPools />
      </>
    );
  }, [handleQuickPlay, setIsJoinModalVisible, setShowCreateModal, isDark]); // Include isDark in dependencies

  // Define gradient colors for header
  const headerGradientColors = isDark 
    ? ['#4F46E5', '#3730A3'] as const
    : ['#6C63FF', '#3b36ce'] as const;

  useEffect(() => {
    // Set status bar style only, let ThemedStatusBar handle everything else
    StatusBar.setBarStyle('light-content');
  }, []);

  // Handle joining a contest pool
  const handleJoinPool = (pool: ContestPoolType) => {
    if (!user?.id) {
      router.push({ pathname: '/login' });
      return;
    }
    
    router.push({ pathname: '/game/quiz' }); // If you want to pass params, use a query string or update your router config
  };
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Show filter panel
  const toggleFilterPanel = () => {
    setShowFilters(!showFilters);
  };
  
  // Apply filters
  const handleApplyFilters = (newFilters: any) => {
    updateFilters(newFilters);
    setShowFilters(false);
  };

  // Handler for registering to a pool
  const handleRegisterPool = (poolName: string) => {
    setRegisteredPool(poolName);
    setShowRegisterModal(true);
    // TODO: Trigger notification scheduling logic here (12 hours before pool start)
  };

  // Count of upcoming contests
  const upcomingCount = userContests.filter(c => c.status === 'Upcoming').length;

  // Toggle dropdown for contest history
  const handleToggleContestHistory = () => {
    setShowContestHistory((prev) => !prev);
  };

  // Bell animation state
  const bellAnim = useRef(new Animated.Value(0)).current;
  const bellAnimActive = useRef(false);

  // Function to trigger bell ring animation
  const ringBell = () => {
    if (bellAnimActive.current) return;
    bellAnimActive.current = true;
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1, duration: 150, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: -1, duration: 150, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 0, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      ]),
      { iterations: 8 } // ~2.5 seconds
    ).start(() => {
      bellAnim.setValue(0);
      bellAnimActive.current = false;
    });
  };

  // --- Fetch wallet on mount ---
  useEffect(() => {
    getCurrentSession().then(session => {
      if (session) {
        const service = new ProfileWalletService(session);
        setWalletService(service);
        service.getProfileWithWallet().then(profile => {
          setWalletBalance(profile?.wallet.balance ?? null);
        });
      }
    });
  }, []);

  // --- Open pay modal from featured contest card ---
  const handleOpenPayModal = (contest: any) => {
    setSelectedContest(contest);
    setPayError(null);
    setPaySuccess(false);
    setShowPayModal(true);
  };

  // --- Pay & Register logic ---
  const handlePayAndRegister = async () => {
    if (!walletService || !selectedContest) return;
    setPaying(true);
    setPayError(null);
    setPaySuccess(false);
    // Call atomic backend function
    const result = await walletService.useWalletForContest(selectedContest.entryFee, selectedContest.id);
    if (result) {
      if (result.status === 'SUCCESS') {
        setPaySuccess(true);
        // Optionally, refresh wallet balance
        const profile = await walletService.getProfileWithWallet();
        setWalletBalance(profile?.wallet.balance ?? null);
        setPaying(false);
        setPayError(null);
        setTimeout(() => {
          setShowPayModal(false);
          setPaySuccess(false);
        }, 1800);
      } else {
        setPayError(result.message);
        setPaying(false);
      }
    } else {
      setPayError('Payment failed. Please try again.\n\nभुगतान विफल रहा। कृपया पुनः प्रयास करें।');
      setPaying(false);
    }
  };

  // Auto-expand and scroll to "My Upcoming Contest" if param is set
  useEffect(() => {
    if (params.autoExpandMyContests === 'true') {
      setShowContestHistory(true);
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 300);
    }
  }, [params.autoExpandMyContests]);

  return (
    <View style={styles.container}>
      {/* Use ThemedStatusBar with proper configuration */}
      <ThemedStatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={isDark ? ['#4F46E5', '#3730A3'] : ['#6C63FF', '#3b36ce']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('contests')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Notification Emoji above the button */}
      {/* Removed the big bell emoji and extra margin */}

      {/* Royal Red Gradient Dropdown Button with Bell and Badge */}
      <View style={{ width: '100%', marginTop: 0 }}>
        <TouchableOpacity
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden', width: '100%' }}
          onPress={e => { handleToggleContestHistory(); ringBell(); }}
          activeOpacity={0.92}
        >
          <LinearGradient
            colors={["#4169E1", "#27408B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.royalRedBtn, { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, width: '100%' }]}
          >
            <Text style={styles.royalRedBtnText}>My Upcoming Contest</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
              {/* Bell icon, gold, animatable, no badge */}
              <Animated.View style={{
                transform: [{ rotate: bellAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-25deg', '0deg', '25deg']
                }) }]
              }}>
                <Ionicons name="notifications" size={22} color="#FFD700" />
              </Animated.View>
              <Ionicons
                name={showContestHistory ? 'chevron-up' : 'chevron-down'}
                size={22}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.contentContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[isDark ? '#8B5CF6' : '#6D28D9']}
              tintColor={isDark ? '#8B5CF6' : '#6D28D9'}
            />
          }
        >
          {/* Dropdown Contest History Section */}
          {showContestHistory && (
            <View style={styles.welcomeCardWrapper} ref={contestHistoryRef}>
              <LinearGradient
                colors={["#4e002a", "#8a0037", "#1a0a1a"]}
                style={styles.maroonCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.welcomeCardContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.welcomeText}>
                      Upcoming & History Contests
                    </Text>
                    <Text style={styles.welcomeSubText}>
                      Here you can see all the contests you have joined, upcoming contests, and how much you have paid.
                    </Text>
                    {/* User Contest List */}
                    {userContests.length === 0 ? (
                      <Text style={[styles.welcomeSubText, { marginTop: 12 }]}>No contests found.</Text>
                    ) : (
                      userContests.map((contest: typeof userContests[0]) => (
                        <TouchableOpacity
                          key={contest.id}
                          style={styles.userContestItem}
                          activeOpacity={0.85}
                          onPress={() => Alert.alert(
                            `${contest.name} Details`,
                            `Status: ${contest.status}\nEntry Fee: ₹${contest.entryFee}\nDate: ${contest.date}`
                          )}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.userContestName}>{contest.name}</Text>
                            <Text style={styles.userContestStatus}>
                              {contest.status}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.userContestFee}>₹{contest.entryFee}</Text>
                            <Text style={styles.userContestDate}>{contest.date}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
          
          {/* Mega Gaming Pool Section - HYPE */}
          <View style={styles.megaPoolSection}>
            <Text style={[styles.megaPoolTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>🔥 Mega Gaming Pools 🔥</Text>
            <Text style={[styles.megaPoolSubtitle, { color: isDark ? '#CCCCCC' : '#222222' }]}>Participate in these special pools and win BIG with just a small entry fee!</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8, paddingLeft: 8, paddingRight: 8 }}
            >
              {/* Super Mega Pool */}
              <TouchableOpacity style={[styles.megaPoolCard, { backgroundColor: '#fff', marginLeft: 0 }]} activeOpacity={0.93}>
                <ImageBackground
                  source={{uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}}
                  style={styles.megaPoolImage}
                  imageStyle={{borderRadius: 20, opacity: 0.85}}
                >
                  <LinearGradient
                    colors={["#ff512f", "#dd2476"]}
                    style={styles.megaPoolGradient}
                  >
                    <Text style={styles.megaPoolCardTitle}>🔥 मेगा पूल (Mega Pool) 🏆</Text>
                    <Text style={styles.megaPoolPrize}>💰 कुल राशि / Prize: ₹1,00,000</Text>
                    <Text style={styles.megaPoolEntry}>🎟️ प्रवेश शुल्क / Entry: ₹1</Text>
                    <Text style={styles.megaPoolPlayers}>👥 खिलाड़ी / Players: 1,00,000</Text>
                    <TouchableOpacity style={styles.megaPoolJoinBtn} onPress={() => handleRegisterPool('Mega Pool')}>
                      <Text style={styles.megaPoolJoinText}>🚀 Register Now!</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
              {/* Semi Mega Pool */}
              <TouchableOpacity style={[styles.megaPoolCard, { backgroundColor: '#fff' }]} activeOpacity={0.93}>
                <ImageBackground
                  source={{uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'}}
                  style={styles.megaPoolImage}
                  imageStyle={{borderRadius: 20, opacity: 0.85}}
                >
                  <LinearGradient
                    colors={["#11998e", "#38ef7d"]}
                    style={styles.megaPoolGradient}
                  >
                    <Text style={styles.megaPoolCardTitle}>⚡ सेमी-मेगा पूल (Semi-Mega Pool) 🥈</Text>
                    <Text style={styles.megaPoolPrize}>💰 कुल राशि / Prize: ₹2,50,000</Text>
                    <Text style={styles.megaPoolEntry}>🎟️ प्रवेश शुल्क / Entry: ₹5</Text>
                    <Text style={styles.megaPoolPlayers}>👥 खिलाड़ी / Players: 50,000</Text>
                    <TouchableOpacity style={styles.megaPoolJoinBtn} onPress={() => handleRegisterPool('Semi-Mega Pool')}>
                      <Text style={styles.megaPoolJoinText}>🚀 Register Now!</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
              {/* Small Mega Pool */}
              <TouchableOpacity style={[styles.megaPoolCard, { backgroundColor: '#fff' }]} activeOpacity={0.93}>
                <ImageBackground
                  source={{uri: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80'}}
                  style={styles.megaPoolImage}
                  imageStyle={{borderRadius: 20, opacity: 0.85}}
                >
                  <LinearGradient
                    colors={["#fc4a1a", "#f7b733"]}
                    style={styles.megaPoolGradient}
                  >
                    <Text style={styles.megaPoolCardTitle}>🎯 स्मॉल-मेगा पूल (Small-Mega Pool) 🥉</Text>
                    <Text style={styles.megaPoolPrize}>💰 कुल राशि / Prize: ₹1,00,000</Text>
                    <Text style={styles.megaPoolEntry}>🎟️ प्रवेश शुल्क / Entry: ₹10</Text>
                    <Text style={styles.megaPoolPlayers}>👥 खिलाड़ी / Players: 10,000</Text>
                    <TouchableOpacity style={styles.megaPoolJoinBtn} onPress={() => handleRegisterPool('Small-Mega Pool')}>
                      <Text style={styles.megaPoolJoinText}>🚀 Register Now!</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
              {/* Mini Pool */}
              <TouchableOpacity style={[styles.megaPoolCard, { backgroundColor: '#fff' }]} activeOpacity={0.93}>
                <ImageBackground
                  source={{uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}}
                  style={styles.megaPoolImage}
                  imageStyle={{borderRadius: 20, opacity: 0.85}}
                >
                  <LinearGradient
                    colors={["#43cea2", "#185a9d"]}
                    style={styles.megaPoolGradient}
                  >
                    <Text style={styles.megaPoolCardTitle}>🌟 मिनी पूल (Mini Pool) 🎲</Text>
                    <Text style={styles.megaPoolPrize}>💰 कुल राशि / Prize: ₹1,00,000</Text>
                    <Text style={styles.megaPoolEntry}>🎟️ प्रवेश शुल्क / Entry: ₹20</Text>
                    <Text style={styles.megaPoolPlayers}>👥 खिलाड़ी / Players: 5,000</Text>
                    <TouchableOpacity style={styles.megaPoolJoinBtn} onPress={() => handleRegisterPool('Mini Pool')}>
                      <Text style={styles.megaPoolJoinText}>🚀 Register Now!</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
              {/* Micro Pool (last card) */}
              <TouchableOpacity style={[styles.megaPoolCard, { backgroundColor: '#fff', marginRight: 0, marginLeft: 0 }]} activeOpacity={0.93}>
                <ImageBackground
                  source={{uri: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c91?auto=format&fit=crop&w=800&q=80'}}
                  style={styles.megaPoolImage}
                  imageStyle={{borderRadius: 20, opacity: 0.85}}
                >
                  <LinearGradient
                    colors={["#ff9966", "#ff5e62"]}
                    style={styles.megaPoolGradient}
                  >
                    <Text style={styles.megaPoolCardTitle}>�� माइक्रो पूल (Micro Pool) 🎮</Text>
                    <Text style={styles.megaPoolPrize}>💰 कुल राशि / Prize: ₹1,00,000</Text>
                    <Text style={styles.megaPoolEntry}>🎟️ प्रवेश शुल्क / Entry: ₹50</Text>
                    <Text style={styles.megaPoolPlayers}>👥 खिलाड़ी / Players: 2,000</Text>
                    <TouchableOpacity style={styles.megaPoolJoinBtn} onPress={() => handleRegisterPool('Micro Pool')}>
                      <Text style={styles.megaPoolJoinText}>🚀 Register Now!</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </ScrollView>
          </View>
          {/* End Mega Gaming Pool Section */}
          
          {/* Contest Pools Section */}
          <ContestPoolSection />
          
          {/* Legacy Gaming Pools Component - Keep for backward compatibility */}
          <View style={styles.legacySection}>
            <Text style={[
              styles.legacySectionTitle, 
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}>
              Featured Contests
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredContests.map((contest) => (
                <TouchableOpacity
                  key={contest.id}
                  style={styles.featuredContestCard}
                  activeOpacity={0.85}
                  onPress={() => handleOpenPayModal(contest)}
                >
                  <ImageBackground
                    source={{ uri: contest.image || contestImages.Default }}
                    style={{ width: '100%', height: '100%' }}
                    imageStyle={{ opacity: 0.5, borderRadius: 16 }}
                  >
                    <LinearGradient
                      colors={getCategoryGradient(contest.category)}
                      style={{ flex: 1, justifyContent: 'flex-end', padding: 14, borderRadius: 16 }}
                    >
                      <Text style={styles.featuredContestTitle}>{contest.title}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <View>
                          <Text style={styles.featuredContestStatLabel}>Entry</Text>
                          <Text style={styles.featuredContestStatValue}>₹{contest.entryFee}</Text>
                        </View>
                        <View>
                          <Text style={styles.featuredContestStatLabel}>Prize</Text>
                          <Text style={styles.featuredContestStatValue}>₹{contest.prizePool}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.18)',
                          paddingVertical: 8,
                          borderRadius: 8,
                          alignItems: 'center',
                          marginTop: 4,
                        }}
                        onPress={() => handleOpenPayModal(contest)}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                          🚀 Register Now! 🎉
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
        
        {/* Create Private Contest Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCreateModal}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Create Private Contest
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={textColor}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={[styles.modalSubtitle, { color: textColor }]}>
                  Create a private contest and invite friends with a unique code
                </Text>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: mutedTextColor }]}>
                    Contest Name
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#2A3240' : '#F3F4F6',
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="Enter contest name"
                    placeholderTextColor={mutedTextColor}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: mutedTextColor }]}>
                    Category
                  </Text>
                  <View
                    style={[
                      styles.selectInput,
                      {
                        backgroundColor: isDark ? '#2A3240' : '#F3F4F6',
                        borderColor: borderColor,
                      },
                    ]}
                  >
                    <Text style={{ color: mutedTextColor }}>Select category</Text>
                    <Ionicons name="chevron-down" size={20} color={mutedTextColor} />
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: mutedTextColor }]}>
                    Entry Fee (₹)
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#2A3240' : '#F3F4F6',
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={mutedTextColor}
                    keyboardType="number-pad"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: mutedTextColor }]}>
                    Max Participants
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#2A3240' : '#F3F4F6',
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="10"
                    placeholderTextColor={mutedTextColor}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.createContestBtn}
                onPress={handleCreateContest}
              >
                <Text style={styles.createContestBtnText}>Create Contest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Join Contest Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isJoinModalVisible}
          onRequestClose={() => setIsJoinModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Join Private Contest
                </Text>
                <TouchableOpacity
                  onPress={() => setIsJoinModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={textColor}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={[styles.modalSubtitle, { color: textColor }]}>
                  Enter the contest code to join a private contest
                </Text>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: mutedTextColor }]}>
                    Contest Code
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? '#2A3240' : '#F3F4F6',
                        borderColor: borderColor,
                      },
                    ]}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={mutedTextColor}
                    value={contestPin}
                    onChangeText={setContestPin}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.joinContestBtn}
                onPress={() => {
                  setIsJoinModalVisible(false);
                  Alert.alert("Join Private Contest", "Private contest functionality is currently under review.");
                }}
              >
                <Text style={styles.joinContestBtnText}>Join Contest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Registration Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRegisterModal}
          onRequestClose={() => setShowRegisterModal(false)}
        >
          <View style={styles.modalOverlay}>
            {/* LinearGradient now adapts to theme */}
            <LinearGradient
              colors={isDark ? ['#232526', '#414345', '#6D28D9'] : ['#a18cd1', '#fbc2eb', '#8EC5FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Registration Successful / पंजीकरण सफल</Text>
                <TouchableOpacity onPress={() => setShowRegisterModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={[styles.modalSubtitle, { color: textColor }]}>You have registered for the {registeredPool}.
                {'\n'}आपने {registeredPool} के लिए पंजीकरण कर लिया है।</Text>
                <Text style={[styles.modalSubtitle, { color: textColor, marginTop: 12 }]}>You will receive a notification 12 hours before the contest starts. Please come back at the exact time to join and play!
                {'\n'}प्रतियोगिता शुरू होने से 12 घंटे पहले आपको सूचना मिलेगी। कृपया ठीक समय पर वापस आएं और भाग लें!</Text>
                <Text style={[styles.modalSubtitle, { color: textColor, marginTop: 12 }]}>Waiting Lobby Instructions / प्रतीक्षा लॉबी निर्देश:
                {'\n'}- Contest will start at the scheduled time.
                {'\n'}- You can view your registration status here.
                {'\n'}- No contest or game will start until the scheduled time.
                {'\n'}- प्रतियोगिता निर्धारित समय पर शुरू होगी।
                {'\n'}- आप यहां अपनी पंजीकरण स्थिति देख सकते हैं।
                {'\n'}- निर्धारित समय से पहले कोई प्रतियोगिता या गेम शुरू नहीं होगा।
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Pay Window Modal */}
        <Modal
          visible={showPayModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowPayModal(false)}
        >
          <LinearGradient
            colors={["#2336a3", "#4169e1", "#27408b"]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <StatusBar backgroundColor="#2336a3" barStyle="light-content" translucent={false} />
            <SafeAreaView style={{ flex: 1 }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <TouchableOpacity style={{ position: 'absolute', top: 32, right: 24, zIndex: 2 }} onPress={() => setShowPayModal(false)}>
                  <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
                {selectedContest && (
                  <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>{selectedContest.title}</Text>
                    <Text style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>{selectedContest.category}</Text>
                    <Text style={{ fontSize: 16, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
                      Entry Fee: ₹{selectedContest.entryFee} {'\n'}
                      प्रवेश शुल्क: ₹{selectedContest.entryFee}
                    </Text>
                    <Text style={{ fontSize: 15, color: '#e0e0e0', marginBottom: 16, textAlign: 'center' }}>
                      Prize Pool: ₹{selectedContest.prizePool} {'\n'}
                      इनाम राशि: ₹{selectedContest.prizePool}
                    </Text>
                    <Text style={{ fontSize: 15, color: '#e0e0e0', marginBottom: 24, textAlign: 'center' }}>
                      Instructions: You will be registered for this contest. The entry fee will be deducted from your wallet. Please ensure you have sufficient balance.\n\nनिर्देश: आप इस प्रतियोगिता के लिए पंजीकृत हो जाएंगे। प्रवेश शुल्क आपके वॉलेट से काट लिया जाएगा। कृपया सुनिश्चित करें कि आपके पास पर्याप्त बैलेंस है।
                    </Text>
                    <Text style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>
                      Wallet Balance: ₹{walletBalance !== null ? walletBalance : '...'}
                    </Text>
                    {payError && <Text style={{ color: '#ffbaba', marginBottom: 12, textAlign: 'center' }}>{payError}</Text>}
                    {paySuccess && <Text style={{ color: '#baffc9', marginBottom: 12, textAlign: 'center' }}>Registration Successful!\nपंजीकरण सफल!</Text>}
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#fff',
                        paddingVertical: 14,
                        paddingHorizontal: 40,
                        borderRadius: 10,
                        marginTop: 8,
                        opacity: paying ? 0.7 : 1,
                      }}
                      disabled={paying || paySuccess}
                      onPress={handlePayAndRegister}
                    >
                      <Text style={{ color: '#2336a3', fontWeight: 'bold', fontSize: 18 }}>
                        {paying ? 'Processing...' : 'Pay & Register / भुगतान करें'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </ThemedView>
      
      {/* Filter Modal */}
      <ContestFilters
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeAreaContainer: {
    width: '100%',
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeCardWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  maroonCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  welcomeCardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userContestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  userContestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userContestStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userContestFee: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  userContestDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  legacySection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  legacySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  selectInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createContestBtn: {
    backgroundColor: '#4338CA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createContestBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  joinContestBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinContestBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contestCard: {
    width: width * 0.85,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contestImage: {
    width: '100%',
    height: '100%',
  },
  contestGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contestCardContent: {
    justifyContent: 'flex-end',
  },
  contestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contestInfo: {
    marginTop: 8,
  },
  contestStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
  },
  participantsInfo: {
    marginBottom: 12,
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
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  liveTag: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  startsInText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contestBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180, // Increased height
    elevation: 8,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  contestBannerContent: {
    position: 'relative',
    height: '100%',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 15,
    color: '#E0E0E0',
    maxWidth: '85%',
    lineHeight: 20,
  },
  bannerActionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  joinButton: {
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  joinButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  createContestButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  createContestText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  decorativeElement1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeElement2: {
    position: 'absolute',
    right: 40,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorativeElement3: {
    position: 'absolute',
    left: -30,
    bottom: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  trophyIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    opacity: 0.9,
  },
  quickPlayContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickPlayGradient: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  quickPlayTopButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  flashIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPlayTopText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 12,
  },
  rewardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  rewardText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitleContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleGradient: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sectionTitleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  megaPoolSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  megaPoolTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  megaPoolSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 12,
  },
  megaPoolCard: {
    width: width * 0.88,
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
    marginLeft: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  megaPoolImage: {
    width: '100%',
    height: '100%',
  },
  megaPoolGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  megaPoolCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  megaPoolPrize: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  megaPoolEntry: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: 2,
  },
  megaPoolPlayers: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: 8,
  },
  megaPoolJoinBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  megaPoolJoinText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  royalRedBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#B31217',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  royalRedBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  featuredContestCard: {
    width: width * 0.75, // Medium width
    height: 180, // Medium height
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredContestTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredContestStatLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginBottom: 2,
  },
  featuredContestStatValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
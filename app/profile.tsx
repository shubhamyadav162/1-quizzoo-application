import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  TextInput,
  FlatList,
  RefreshControl,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter, usePathname } from 'expo-router';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import EditProfileModal from '@/components/EditProfileModal';
import TermsAndConditionsModal from '@/components/TermsAndConditions';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserPrivateContests,
  getJoinedContests,
  saveJoinedContest,
  getGameHistory,
  getGameHistoryFromSupabase,
  syncGameHistoryWithSupabase,
  syncProfileStatsWithSupabase,
  PrivateContestInfo,
  JoinedContestInfo,
  UserProfile
} from './lib/LocalStorage';
import { useAuth } from './lib/AuthContext';
import { useContests } from './lib/ContestContext';
import { usePrivateContest } from './lib/PrivateContestContext';
import { supabase, getProfile, updateProfile, getWallet } from '../lib/supabase';
import { ProfileWalletService, ProfileWithWallet } from './lib/ProfileWalletService';
import { useLanguage, LANGUAGE_EN, LANGUAGE_HI } from '@/app/lib/LanguageContext';

// Extended user type to handle user_metadata
interface ExtendedUser {
  id: string;
  email: string | null;
  user_metadata?: {
    name?: string;
    full_name?: string;
    picture?: string;
    profile_image?: string;
  };
  emailVerified?: boolean;
  reload?: () => Promise<void>;
  updateProfile?: (profile: { displayName?: string }) => Promise<void>;
}

// Define ProfileStats interface for clarity
interface ProfileStats {
  gamesPlayed: number;
  totalEarnings: number;
  highestScore: number;
  isLoading: boolean;
  error: string | null;
}

export default function ProfileScreen() {
  const { isDark, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { joinPrivateContest, createPrivateContest } = usePrivateContest();
  const { quizLanguage, setQuizLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateContests, setPrivateContests] = useState<PrivateContestInfo[]>([]);
  const [joinedContests, setJoinedContests] = useState<JoinedContestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [contestCode, setContestCode] = useState('');
  const [joiningContest, setJoiningContest] = useState(false);
  const pathname = usePathname();
  const [supabaseProfile, setSupabaseProfile] = useState<ProfileWithWallet | null>(null);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    gamesPlayed: 0,
    totalEarnings: 0,
    highestScore: 0,
    isLoading: true,
    error: null
  });
  const [profileWalletService, setProfileWalletService] = useState<ProfileWalletService | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newContestName, setNewContestName] = useState('');
  const [newEntryFee, setNewEntryFee] = useState('');
  const [newPlayerCount, setNewPlayerCount] = useState('');
  const [creatingContest, setCreatingContest] = useState(false);
  const [championCount, setChampionCount] = useState(0);
  const [loserCount, setLoserCount] = useState(0);
  
  // Cast the user to our extended type
  const extendedUser = user as unknown as ExtendedUser;
  
  // Check if this screen is being accessed directly or through tab navigation
  const isDirectAccess = pathname === '/profile';
  
  // Load profile and wallet data together
  const loadProfileAndWallet = async () => {
    if (!user?.id) return;
    
    try {
      setProfileStats(prev => ({...prev, isLoading: true}));

      // Get session for ProfileWalletService
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session available');
        setProfileStats(prev => ({...prev, isLoading: false, error: 'Not logged in'}));
        return;
      }
      
      // Create service instance
      const service = new ProfileWalletService(session);
      setProfileWalletService(service);
      
      // Get integrated profile and wallet data
      const profileWithWallet = await service.getProfileWithWallet();
      
      if (!profileWithWallet) {
        console.error('Could not load profile with wallet');
        setProfileStats(prev => ({...prev, isLoading: false, error: 'Failed to load data'}));
        return;
      }
      
      setSupabaseProfile(profileWithWallet);
      
      // Update profile stats with the integrated data
      setProfileStats({
        gamesPlayed: profileWithWallet.total_games_played || 0,
        totalEarnings: profileWithWallet.wallet?.total_earnings || 0,
        highestScore: profileWithWallet.highest_score || 0,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error loading profile and wallet:', error);
      setProfileStats(prev => ({...prev, isLoading: false, error: 'Network error'}));
    }
  };
  
  // Replace the old separate loading functions with the integrated one
  useEffect(() => {
    if (user?.id) {
      loadProfileAndWallet();
    }
  }, [user?.id]);
  
  // Sync profile with Supabase - updated to use ProfileWalletService
  const syncProfileWithSupabase = async () => {
    if (!user?.id || !profileWalletService) return;
    
    try {
      const localProfile = await getUserProfile();
      if (!localProfile) return;
      
      // Update profile using the integrated service
      await profileWalletService.updateProfile({
        username: localProfile.name,
        total_games_played: localProfile.totalGamesPlayed,
        highest_score: localProfile.highestScore
      });
      
      // Reload profile and wallet data
      loadProfileAndWallet();
    } catch (error) {
      console.error('Error syncing profile with Supabase:', error);
    }
  };

  // Load wallet data to ensure earnings are accurate
  const loadWalletData = async () => {
    if (!user?.id) return;
    
    try {
      const walletData = await getWallet(user.id);
      if (walletData) {
        // If wallet has more accurate earnings data, update profile stats
        if (walletData.total_earnings !== undefined && 
            (supabaseProfile?.wallet?.total_earnings === undefined || 
             walletData.total_earnings > supabaseProfile.wallet?.total_earnings)) {
          
          setProfileStats(prev => ({
            ...prev,
            totalEarnings: walletData.total_earnings || 0
          }));
          
          // Update wallet data in Supabase if needed
          if (supabaseProfile && walletData.total_earnings > supabaseProfile.wallet?.total_earnings) {
            await updateProfile(user.id, {
              wallet: {
                total_earnings: walletData.total_earnings
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setProfileStats(prev => ({...prev, isLoading: true}));
      
      // Load user profile data from local storage first for immediate display
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        
        // Set profile stats from local profile immediately to avoid loading state
        setProfileStats({
          gamesPlayed: userProfile.totalGamesPlayed || 0,
          totalEarnings: userProfile.totalEarnings || 0,
          highestScore: userProfile.highestScore || 0,
          isLoading: false, // Set to false immediately for local data
          error: null
        });
      }
      
      // Load Supabase profile data (which will update the UI when it completes)
      if (user?.id) {
        await loadProfileAndWallet();
        await loadWalletData();
        
        // Try to get game history from Supabase if authenticated
        const supabaseHistory = await getGameHistoryFromSupabase(10);
        if (supabaseHistory && supabaseHistory.length > 0) {
          setGameHistory(supabaseHistory);
        } else {
          // Fall back to local storage if no Supabase data
          const localHistory = await getGameHistory();
          setGameHistory(localHistory);
          
          // If we have local history but nothing in Supabase, try to sync
          if (localHistory.length > 0 && user?.id) {
            await syncGameHistoryWithSupabase();
          }
        }
        
        // Sync profile data between local storage and Supabase
        await syncProfileWithSupabase();
      } else {
        // Not authenticated, use local storage only
        const localHistory = await getGameHistory();
        setGameHistory(localHistory);
      }
      
      // Get existing private contests
      const userPrivateContests = await getUserPrivateContests();
      const userJoinedContests = await getJoinedContests();
      
      setPrivateContests(userPrivateContests);
      setJoinedContests(userJoinedContests);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      
      // Make sure we stop loading state even if there's an error
      if (profileStats.isLoading) {
        setProfileStats(prev => ({...prev, isLoading: false, error: 'Failed to load data'}));
      }
    }
  };
  
  // Use a memoized refresh function
  const refreshData = useCallback(async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  }, [user]);
  
  useEffect(() => {
    loadData();
    
    // Set up a refresh interval when the component mounts
    const refreshInterval = setInterval(() => {
      if (user?.id) {
        // Only refresh Supabase data periodically if user is authenticated
        loadProfileAndWallet();
        loadWalletData();
      }
    }, 60000); // Refresh every minute
    
    return () => {
      // Clear interval when component unmounts
      clearInterval(refreshInterval);
    };
  }, [user]); // Add user dependency to reload when user changes
  
  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  // Handle joining a private contest
  const handleJoinContest = async () => {
    if (!contestCode.trim()) {
      Alert.alert('Error / त्रुटि', 'Please enter a contest code.\nकृपया कॉन्टेस्ट कोड डालें।');
      return;
    }
    setJoiningContest(true);
    try {
      // Find contest by code
      const { data, error } = await supabase
        .from('private_contests')
        .select('id, participants')
        .eq('code', contestCode.trim().toUpperCase())
        .single();
      if (error || !data) {
        Alert.alert('Error / त्रुटि', 'Contest not found.\nकॉन्टेस्ट नहीं मिला।');
        setJoiningContest(false);
        return;
      }
      // Check if already joined
      if (data.participants && data.participants.includes(user?.id)) {
        Alert.alert('Info / सूचना', 'You have already joined this contest.\nआप पहले ही इस कॉन्टेस्ट में शामिल हैं।');
        setJoiningContest(false);
        return;
      }
      // Add user to participants
      const updatedParticipants = [...(data.participants || []), user?.id];
      const { error: updateError } = await supabase
        .from('private_contests')
        .update({ participants: updatedParticipants })
        .eq('id', data.id);
      if (updateError) throw updateError;
      Alert.alert('Success / सफल', 'You have joined the contest!\nआप कॉन्टेस्ट में शामिल हो गए हैं!');
      setContestCode('');
    } catch (error) {
      Alert.alert('Error / त्रुटि', 'Something went wrong.\nकुछ गलत हो गया।');
    } finally {
      setJoiningContest(false);
    }
  };
  
  // View contest details
  const handleViewContest = (contest: PrivateContestInfo) => {
    router.push({ pathname: '../my-contests', params: { id: contest.id } });
  };
  
  // View joined contest details
  const handleViewJoinedContest = (contest: JoinedContestInfo) => {
    router.push({ pathname: '../contest/view', params: { code: contest.code } });
  };
  
  // Settings option item component
  const SettingOption = ({ icon, iconColor, title, onPress, rightContent }: { 
    icon: string, 
    iconColor: string, 
    title: string, 
    onPress: () => void,
    rightContent?: React.ReactNode 
  }) => (
    <Animatable.View animation="fadeInUp" duration={400} delay={200}>
      <LinearGradient
        colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.settingOption}
      >
        <TouchableOpacity onPress={onPress} style={styles.settingTouchable}>
          <View style={[styles.settingIconContainer, { backgroundColor: iconColor }]}>
            <Ionicons name={icon as any} size={22} color="#fff" />
          </View>
          <ThemedText style={styles.settingText}>{title}</ThemedText>
          {rightContent || (
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#64748B" : "#94A3B8"} />
          )}
        </TouchableOpacity>
      </LinearGradient>
    </Animatable.View>
  );
  
  // Language selector component
  const LanguageSelector = () => {
    const { quizLanguage, setQuizLanguage } = useLanguage();

    const toggleLanguage = async () => {
      const newLanguage = quizLanguage === LANGUAGE_EN ? LANGUAGE_HI : LANGUAGE_EN;
      try {
        await setQuizLanguage(newLanguage);
      } catch (error) {
        console.error('Error setting quiz language:', error);
      }
    };

    return (
      <SettingOption
        icon="language"
        iconColor="#4CAF50"
        title="Quiz Language"
        onPress={toggleLanguage}
        rightContent={
          <View style={styles.languageToggleContainer}>
            <View style={[styles.languageToggle, { backgroundColor: isDark ? '#334155' : '#e8f5e9' }]}>
              <ThemedText style={[styles.languageToggleText, { color: isDark ? '#f1c40f' : '#2c3e50' }]}>
                {quizLanguage === LANGUAGE_EN ? 'English' : 'हिंदी'}
              </ThemedText>
            </View>
          </View>
        }
      />
    );
  };
  
  // Placeholder functions for settings options
  const handleReferFriends = () => router.push({ pathname: '../refer' });
  const handleFAQ = () => router.push({ pathname: '../faq' });
  const handleContactUs = () => router.push({ pathname: '../contact' });
  const handleTerms = () => setTermsModalVisible(true);
  
  // Toggle theme function
  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  // Handle showing game history
  const handleGameHistory = () => {
    router.push('/game-history' as any);
  };
  
  // Add handleLogout function
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Profile: Initiating logout process');
              
              // Clear any app-specific data before logout
              await AsyncStorage.removeItem('user-profile');
              await AsyncStorage.removeItem('game-history');
              await AsyncStorage.removeItem('private-contests');
              await AsyncStorage.removeItem('joined-contests');
              
              // Call the logout function from AuthContext
              await logout();
              
              console.log('Profile: Logout completed, redirecting to login');
              
              // Force navigation to login page
              router.replace({ pathname: './login' });
            } catch (error) {
              console.error('Profile: Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
              
              // Even if there's an error, try to navigate to login
              router.replace({ pathname: './login' });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Render a private contest item
  const renderPrivateContestItem = ({ item }: { item: PrivateContestInfo }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
    >
      <TouchableOpacity onPress={() => handleViewContest(item)}>
        <ThemedView style={styles.contestItem}>
          <View style={styles.contestHeader}>
            <View style={styles.contestBadge}>
              <Ionicons name="trophy" size={12} color="#fff" />
              <ThemedText style={styles.contestBadgeText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </ThemedText>
            </View>
            <ThemedText style={styles.contestDate}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.contestName}>{item.name}</ThemedText>
          
          <View style={styles.contestDetails}>
            <View style={styles.contestDetail}>
              <Ionicons name="person" size={14} color={isDark ? "#999" : "#666"} style={styles.iconMargin} />
              <ThemedText style={styles.contestDetailText}>
                {item.participants}/{item.maxParticipants}
              </ThemedText>
            </View>
            
            <View style={styles.contestDetail}>
              <Ionicons name="cash-outline" size={14} color={isDark ? "#999" : "#666"} style={styles.iconMargin} />
              <ThemedText style={styles.contestDetailText}>
                ₹{item.entryFee}
              </ThemedText>
            </View>
            
            <View style={styles.contestDetail}>
              <Ionicons name="trophy-outline" size={14} color={isDark ? "#999" : "#666"} style={styles.iconMargin} />
              <ThemedText style={styles.contestDetailText}>
                ₹{item.prizePool}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.contestCode}>
            <ThemedText style={styles.contestCodeLabel}>Code: </ThemedText>
            <ThemedText style={styles.contestCodeValue}>{item.code}</ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    </Animatable.View>
  );
  
  // Render a joined contest item
  const renderJoinedContestItem = ({ item }: { item: JoinedContestInfo }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
    >
      <TouchableOpacity onPress={() => handleViewJoinedContest(item)}>
        <ThemedView style={styles.contestItem}>
          <View style={styles.contestHeader}>
            <View style={styles.joinedBadge}>
              <Ionicons name="people" size={12} color="#fff" />
              <ThemedText style={styles.contestBadgeText}>
                Joined
              </ThemedText>
            </View>
            <ThemedText style={styles.contestDate}>
              {formatDate(item.joinedAt)}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.contestName}>{item.contestName}</ThemedText>
          
          <View style={styles.contestDetails}>
            <View style={styles.contestDetail}>
              <Ionicons name="cash-outline" size={14} color={isDark ? "#999" : "#666"} style={styles.iconMargin} />
              <ThemedText style={styles.contestDetailText}>
                ₹{item.entryFee}
              </ThemedText>
            </View>
            
            <View style={styles.contestDetail}>
              <Ionicons name="trophy-outline" size={14} color={isDark ? "#999" : "#666"} style={styles.iconMargin} />
              <ThemedText style={styles.contestDetailText}>
                ₹{item.prizePool}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.contestStatus}>
            <ThemedText style={[
              styles.contestStatusText, 
              { color: item.status === 'completed' ? '#4CAF50' : 
                      item.status === 'ongoing' ? '#2196F3' : 
                      item.status === 'cancelled' ? '#F44336' : '#FF9800' }
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
        </ThemedView>
      </TouchableOpacity>
    </Animatable.View>
  );
  
  // Handle edit profile button press
  const handleEditProfile = () => {
    setEditProfileModalVisible(true);
  };

  // Handle My Private Contests button press
  const handleMyPrivateContests = () => {
    router.push('../my-private-contests');
  };

  // Create Private Contest in Supabase
  const handleCreatePrivateContest = async () => {
    if (!newContestName.trim() || !newEntryFee.trim() || !newPlayerCount.trim()) {
      Alert.alert('Error / त्रुटि', 'Please fill all fields.\nकृपया सभी फ़ील्ड भरें।');
      return;
    }
    setCreatingContest(true);
    try {
      // Generate a unique code (6 chars)
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase.from('private_contests').insert([
        {
          name: newContestName.trim(),
          code,
          entry_fee: parseInt(newEntryFee, 10),
          max_players: parseInt(newPlayerCount, 10),
          created_by: user?.id,
          created_at: new Date().toISOString(),
          participants: [user?.id],
        },
      ]).select();
      if (error) throw error;
      setCreateModalVisible(false);
      setNewContestName('');
      setNewEntryFee('');
      setNewPlayerCount('');
      Alert.alert('Success / सफल', `Contest created! Code: ${code}\nकॉन्टेस्ट बन गया! कोड: ${code}`);
    } catch (e) {
      Alert.alert('Error / त्रुटि', 'Failed to create contest.\nकॉन्टेस्ट बनाने में विफल।');
    } finally {
      setCreatingContest(false);
    }
  };

  // Render settings section
  const renderSettings = () => (
    <View style={[styles.settingsContainer, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
      <ThemedText style={styles.settingsTitle}>Settings</ThemedText>
      <LanguageSelector />
      <SettingOption
        icon="time"
        iconColor="#00bcd4"
        title="Game History"
        onPress={handleGameHistory}
      />
      <SettingOption
        icon="moon"
        iconColor="#6c5ce7"
        title={isDark ? "Light Mode" : "Dark Mode"}
        onPress={handleToggleTheme}
        rightContent={
          <View style={styles.themeToggle}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={isDark ? "#f1c40f" : "#2c3e50"} />
          </View>
        }
      />
      <SettingOption
        icon="share-social"
        iconColor="#00b894"
        title="Refer Friends"
        onPress={handleReferFriends}
      />
      <SettingOption
        icon="help-circle"
        iconColor="#0984e3"
        title="FAQ"
        onPress={handleFAQ}
      />
      <SettingOption
        icon="mail"
        iconColor="#e17055"
        title="Contact Us"
        onPress={handleContactUs}
      />
      <SettingOption
        icon="document-text"
        iconColor="#a55eea"
        title="Terms & Conditions"
        onPress={handleTerms}
      />
      <SettingOption
        icon="log-out"
        iconColor="#e74c3c"
        title="Logout"
        onPress={handleLogout}
      />
    </View>
  );

  useEffect(() => {
    const n = parseInt(newPlayerCount, 10);
    if (!isNaN(n) && n > 0) {
      const champions = Math.ceil(n / 2);
      setChampionCount(champions);
      setLoserCount(n - champions);
    } else {
      setChampionCount(0);
      setLoserCount(0);
    }
  }, [newPlayerCount]);

  return (
    <ThemedView backgroundType="background" style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refreshData} 
            colors={['#3949AB']} 
            tintColor={isDark ? '#fff' : '#3949AB'}
          />
        }
      >
        <LinearGradient
          colors={isDark ? ['#1A237E', '#303F9F'] : ['#3949AB', '#5C6BC0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={handleEditProfile}
          >
            {profile?.profileImage ? (
              <Image 
                source={{ uri: profile?.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: '#3949AB' }]}>
                <ThemedText style={styles.profileImagePlaceholderText}>
                  {profile?.name ? profile?.name.charAt(0).toUpperCase() : 'U'}
                </ThemedText>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Feather name="edit-2" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <ThemedText style={[styles.profileName, { color: '#FFFFFF' }]}>
            {profile?.name || 'User'}
          </ThemedText>
          
          <ThemedText style={[styles.profileEmail, { color: '#FFFFFF', opacity: 0.8 }]}>
            {user?.email || 'No email'}
          </ThemedText>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {profileStats.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Animatable.Text 
                  animation="fadeIn" 
                  style={[styles.statValue, { color: '#FFFFFF' }]}
                >
                  {profileStats.gamesPlayed}
                </Animatable.Text>
              )}
              <ThemedText style={[styles.statLabel, { color: '#FFFFFF', opacity: 0.8 }]}>Games</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              {profileStats.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Animatable.Text 
                  animation="fadeIn" 
                  style={[styles.statValue, { color: '#FFFFFF' }]}
                >
                  ₹{profileStats.totalEarnings}
                </Animatable.Text>
              )}
              <ThemedText style={[styles.statLabel, { color: '#FFFFFF', opacity: 0.8 }]}>Earnings</ThemedText>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              {profileStats.isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Animatable.Text 
                  animation="fadeIn" 
                  style={[styles.statValue, { color: '#FFFFFF' }]}
                >
                  {profileStats.highestScore}
                </Animatable.Text>
              )}
              <ThemedText style={[styles.statLabel, { color: '#FFFFFF', opacity: 0.8 }]}>High Score</ThemedText>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.joinContestContainer}>
          {/* Removed Create Private Contest Button and Modal */}
          {/* Removed Join Private Contest Card */}
        </View>
        
        {renderSettings()}
      </ScrollView>
      
      {/* EditProfileModal and TermsAndConditionsModal */}
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        onSave={refreshData}
        initialProfile={profile}
      />
      
      <TermsAndConditionsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  profileImagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3949AB',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  joinContestContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  joinContestCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  joinContestTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  joinContestInputContainerColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 14,
  },
  joinContestInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  gradientButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  gradientButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingOption: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  settingTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  contestsList: {
    paddingBottom: 10,
  },
  contestItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contestBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  contestDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  contestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: 5,
  },
  contestDetailText: {
    fontSize: 12,
    opacity: 0.7,
  },
  contestCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contestCodeLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  contestCodeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5E5CE6',
  },
  contestStatus: {
    marginTop: 8,
  },
  contestStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewAllButton: {
    padding: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: '#5E5CE6',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
    marginRight: -8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  activeLanguageButton: {
    backgroundColor: '#4F46E5',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeLanguageText: {
    color: '#FFFFFF',
  },
  themeToggle: {
    marginRight: 4,
  },
  gameHistoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  gameHistoryCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameHistoryItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  gameHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameHistoryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameHistoryDateText: {
    fontSize: 12,
    opacity: 0.7,
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
    marginBottom: 2,
  },
  gameHistoryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  seeAllGamesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  seeAllGamesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
    marginRight: 6,
  },
  emptyGameHistoryContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyGameHistoryText: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  playGameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playGameButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  languageToggleContainer: {
    marginRight: 4,
    minWidth: 65,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageToggle: {
    minWidth: 65,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingHorizontal: 12,
  },
  languageToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'stretch',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  joinButtonGradient: {
    borderRadius: 24,
    marginTop: 10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
  },
  joinButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
}); 
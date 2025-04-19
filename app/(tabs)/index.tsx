import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Text,
  Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../app/lib/ThemeContext';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SimplePlayerList } from '../../components/SimplePlayerList';
import { InstantPlayFab } from '../../components/InstantPlayFab';
import { useLanguage } from '../../app/lib/LanguageContext';
import { SafeAreaWrapper } from '../../components/SafeAreaWrapper';
import { getUserProfile, UserProfile } from '../../app/lib/LocalStorage';
import { useAuth } from '@/app/lib/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { UnifiedStatusBar } from '@/components/UnifiedStatusBar';
import { ThemedStatusBar } from '@/components/ThemedStatusBar';
import { supabase } from '@/lib/supabase';
import { WalletService } from '@/app/lib/WalletService';
import { LANGUAGE_EN, LANGUAGE_HI } from '../../app/lib/constants';

// For backward compatibility with other screens
let GLOBAL_LIVE_USERS = Math.floor(1000 + Math.random() * 1000);

// This function is used by other screens (like contests.tsx)
export const getGlobalLiveUsers = () => GLOBAL_LIVE_USERS;

// Types for our app
interface QuizContest {
  id: string;
  name: string;
  entryFee: string;
  prize: string;
  image: string;
  joinedPlayers: number;
  totalPlayers: number;
  poolId?: number;
}

interface QuizWinner {
  id: string;
  username: string;
  amount: string;
  avatar: string;
}

interface QuizTopPlayer {
  rank: number;
  username: string;
  points: number;
  avatar: string;
}

interface QuickAction {
  title: string;
  icon: string;
  bgColor: string;
  textColor: string;
  onPress: () => void;
  gradient: [string, string];
}

// Extended User type to include user_metadata
interface ExtendedUser {
  user_metadata?: {
    name?: string;
    full_name?: string;
  };
}

// Extended UserProfile type to include walletBalance
interface ExtendedUserProfile extends UserProfile {
  walletBalance?: number;
}

// Featured promo banners
interface PromoBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: [string, string];
  action: string;
}

// Quiz pool data for general knowledge
const quizPools: QuizPool[] = [
  {
    id: 'pool-1',
    title: 'Starter Quiz',
    description: 'Perfect for beginners. 3-minute quiz, low entry.',
    icon: 'star-outline',
    playerCount: 3,
    entryFee: 5,
    prize: 15,
    timeLimit: 3,
  },
  {
    id: 'pool-3',
    title: 'Regular Quiz',
    description: 'Standard 10-minute quiz, medium stakes.',
    icon: 'people',
    playerCount: 10,
    entryFee: 25,
    prize: 200,
    timeLimit: 10,
  },
  {
    id: 'pool-4',
    title: 'Premium Quiz',
    description: 'Premium pool for higher rewards.',
    icon: 'diamond-outline',
    playerCount: 15,
    entryFee: 40,
    prize: 400,
    timeLimit: 12,
  },
  {
    id: 'pool-5',
    title: 'Advanced Quiz',
    description: 'Challenging questions, bigger pool.',
    icon: 'school-outline',
    playerCount: 20,
    entryFee: 50,
    prize: 750,
    timeLimit: 15,
  },
  {
    id: 'pool-6',
    title: 'Expert Quiz',
    description: 'For experts only! 25 players, high prize.',
    icon: 'medal-outline',
    playerCount: 25,
    entryFee: 75,
    prize: 1200,
    timeLimit: 18,
  },
  {
    id: 'pool-7',
    title: 'Master Quiz',
    description: 'Master level, 30 players, big rewards.',
    icon: 'trophy',
    playerCount: 30,
    entryFee: 100,
    prize: 2000,
    timeLimit: 20,
  },
  {
    id: 'pool-8',
    title: 'Pro Starter Quiz',
    description: 'For pro beginners, 8 players, quick fun.',
    icon: 'flash',
    playerCount: 8,
    entryFee: 15,
    prize: 70,
    timeLimit: 6,
  },
  {
    id: 'pool-9',
    title: 'Mega Match',
    description: 'Competitive 15-minute quiz with high stakes',
    icon: 'trophy',
    playerCount: 20,
    entryFee: 50,
    prize: 750,
    timeLimit: 15,
  },
];

// Interface for quiz pools
interface QuizPool {
  id: string;
  title: string;
  description: string;
  icon: string;
  playerCount: number;
  entryFee: number;
  prize: number;
  timeLimit: number;
}

// Mock data for contests
const contests: QuizContest[] = [
  {
    id: '1',
    name: 'Bollywood Special',
    entryFee: '50',
    prize: '1000',
    image: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    joinedPlayers: 45,
    totalPlayers: 100
  },
  {
    id: '2',
    name: 'Cricket Fever',
    entryFee: '100',
    prize: '2500',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    joinedPlayers: 72,
    totalPlayers: 100
  },
  {
    id: '3',
    name: 'Indian Culture Quiz',
    entryFee: '75',
    prize: '1500',
    image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    joinedPlayers: 30,
    totalPlayers: 50
  },
  {
    id: '4',
    name: 'Tech Wizards',
    entryFee: '120',
    prize: '3000',
    image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    joinedPlayers: 25,
    totalPlayers: 60
  }
];

// Mock data for winners
const winners: QuizWinner[] = [
  { id: 'w1', username: 'Priya Sharma', amount: '₹1,000', avatar: '👩🏽' },
  { id: 'w2', username: 'Rahul Verma', amount: '₹750', avatar: '🧑🏽‍🦱' },
  { id: 'w3', username: 'Amit Singh', amount: '₹500', avatar: '👨🏾' },
  { id: 'w4', username: 'Sunita Patel', amount: '₹1,200', avatar: '👵🏽' },
  { id: 'w5', username: 'Deepak Joshi', amount: '₹900', avatar: '🧔🏽' },
  { id: 'w6', username: 'Anjali Mehra', amount: '₹1,500', avatar: '👩🏽‍🦰' },
  { id: 'w7', username: 'Rohit Kumar', amount: '₹2,000', avatar: '👳🏽‍♂️' },
  { id: 'w8', username: 'Sneha Reddy', amount: '₹1,100', avatar: '👩🏽‍🎓' },
  { id: 'w9', username: 'Vikas Gupta', amount: '₹800', avatar: '👨🏽‍💼' },
  { id: 'w10', username: 'Meena Nair', amount: '₹1,300', avatar: '👩🏽‍💼' },
];

// Mock data for top players
const topPlayers: QuizTopPlayer[] = [
  { rank: 1, username: 'Neha Rathi', points: 9820, avatar: '👩🏽' },
  { rank: 2, username: 'Vikram Malhotra', points: 9500, avatar: '🧑🏽‍🦱' },
  { rank: 3, username: 'Ananya Pandey', points: 9300, avatar: '👩🏽‍🦰' },
  { rank: 4, username: 'Rohit Sinha', points: 9100, avatar: '👨🏾' },
  { rank: 5, username: 'Priya Desai', points: 9000, avatar: '👩🏽‍🎓' },
  { rank: 6, username: 'Amitabh Rao', points: 8900, avatar: '🧔🏽' },
  { rank: 7, username: 'Sneha Pillai', points: 8800, avatar: '👩🏽‍💼' },
  { rank: 8, username: 'Deepak Yadav', points: 8700, avatar: '👨🏽‍💼' },
  { rank: 9, username: 'Meena Iyer', points: 8600, avatar: '👵🏽' },
  { rank: 10, username: 'Suresh Patil', points: 8500, avatar: '👳🏽‍♂️' },
];

// Featured promo banners
const promotionBanners: PromoBanner[] = [
  {
    id: 'promo1',
    title: 'Mega Gaming Hole',
    description: 'Dive into the ultimate gaming experience and win mega prizes!',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    gradient: ['#0f2027', '#2c5364'],
    action: 'Play Mega'
  },
  {
    id: 'promo2',
    title: 'Semi Mega Gaming Pool',
    description: 'Join the semi mega pool for big fun and great rewards!',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    gradient: ['#56ab2f', '#a8e063'],
    action: 'Play Semi Mega'
  },
  {
    id: 'promo3',
    title: 'Refer & Earn',
    description: 'Get ₹50 for each friend who joins',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    gradient: ['#834d9b', '#d04ed6'],
    action: 'Invite'
  }
];

// Game stats
const gameStats = {
  totalGamesPlayed: 42,
  totalPointsEarned: 3850,
  winRate: 68,
  averageScore: 78,
  highestStreak: 7,
  rank: 'Expert'
};

// Function to fetch latest contests from Varsal Admin Dashboard
const fetchVarsalContests = async () => {
  try {
    // Try to query the table directly, Supabase will handle the error if table doesn't exist
    const { data, error } = await supabase
      .from('admin_contests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // If there's an error (like table doesn't exist) or no data
    if (error || !data || data.length === 0) {
      // Check if it's specifically a "relation does not exist" error
      if (error && error.code === '42P01') {
        console.log('Admin contests table not available, using mock data instead');
      } else if (error) {
        console.error('Error fetching Varsal contests:', error);
      }
      
      return contests; // Return mock contests instead
    }
    
    // Map admin contest data to our QuizContest interface
    const mappedContests = data.map((contest: any) => ({
      id: contest.id || Math.random().toString(36).substring(7),
      name: contest.title || 'Contest',
      entryFee: contest.entry_fee?.toString() || '0',
      prize: contest.prize_pool?.toString() || '1000',
      image: contest.image_url || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c',
      joinedPlayers: contest.joined_players || Math.floor(Math.random() * 200) + 50,
      totalPlayers: contest.total_slots || 500,
      poolId: contest.pool_id || 1 // Map pool_id to poolId for navigation
    }));
    
    return mappedContests.length > 0 ? mappedContests : contests;
  } catch (err) {
    console.error('Exception fetching Varsal contests:', err);
    return contests; // Return mock contests on any error
  }
};

// Move styles definition above HomeScreen
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  headerContent: {
    width: '100%',
    marginTop: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeContainer: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  livePlayersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5252',
    marginRight: 8,
  },
  playerCountText: {
    fontSize: 14,
  },
  quickActionsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    width: '30%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 100,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
  },
  contestsContainer: {
    marginBottom: 24,
  },
  contestsScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  contestCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contestCardGradient: {
    borderRadius: 16,
  },
  contestImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  contestInfo: {
    padding: 12,
  },
  contestName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  contestStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryFee: {
    fontSize: 14,
  },
  prizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prize: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  playerCount: {
    fontSize: 12,
    width: 50,
    textAlign: 'right',
  },
  joinButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    alignItems: 'center',
    borderRadius: 50,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  winnersContainer: {
    marginBottom: 24,
  },
  winnersScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  winnerCard: {
    width: 130,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  winnerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  winnerName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  winnerAmount: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: 'bold',
  },
  topPlayersContainer: {
    marginBottom: 24,
  },
  playersList: {
    marginTop: 12,
  },
  topPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerScore: {
    fontSize: 12,
    color: Colors.secondary,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  lightCard: {
    backgroundColor: '#ffffff',
  },
  prizeTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prizeTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contestCardBody: {
    padding: 12,
  },
  contestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contestEntryFee: {
    fontSize: 12,
  },
  playerCountBadge: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  darkText: {
    color: '#ffffff',
  },
  lightText: {
    color: '#333333',
  },
  darkSubText: {
    color: '#aaaaaa',
  },
  lightSubText: {
    color: '#666666',
  },
  collectedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
  },
  collectedText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Promo banner styles
  sectionContainer: {
    marginVertical: 8,
  },
  promoBannersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  promoBannerContainer: {
    width: Dimensions.get('window').width - 40,
    marginRight: 12,
  },
  promoBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 140,
  },
  promoBannerContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
  },
  promoTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  promoActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 4,
  },
  promoBannerImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
  },
  
  // Game stats styles
  statsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  
  // Footer styles
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerLogo: {
    width: 80,
    height: 40,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 10,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 24,
  },
  // New styles for Quick Play section
  quickPlaySection: {
    margin: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickPlayGradient: {
    width: '100%',
    borderRadius: 16,
  },
  quickPlayContent: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickPlayTextContainer: {
    flex: 1,
  },
  quickPlayTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickPlaySubtitle: {
    color: '#E9D5FF',
    fontSize: 12,
  },
  quickPlayButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  quickPlayButtonGradient: {
    borderRadius: 8,
  },
  quickPlayButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  quickPlayButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    // paddingTop is set dynamically
  },
  brandHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 48,
    height: 48,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 14,
    letterSpacing: 0.5,
  },
  megaPoolCard: {
    width: Dimensions.get('window').width - 32,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    marginBottom: 12,
  },
  megaPoolImage: {
    width: '100%',
    height: '100%',
  },
  megaPoolGradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    borderRadius: 20,
    justifyContent: 'flex-end',
  },
  megaPoolCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  megaPoolPrize: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 2,
  },
  megaPoolEntry: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 2,
  },
  megaPoolPlayers: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 8,
  },
  megaPoolJoinBtn: {
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  megaPoolJoinText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  instructionSection: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  instructionCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageIconBtn: {
    marginLeft: 12,
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: 40,
  },
  instructionCardsScroll: {
    paddingLeft: 0,
    paddingRight: 12,
    paddingBottom: 8,
  },
  instructionCardWrapper: {
    marginRight: 16,
    width: 260,
    height: 140,
  },
  instructionCard: {
    borderRadius: 18,
    padding: 20,
    minHeight: 140,
    height: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  instructionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionCardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  darkCard: {
    backgroundColor: '#232526',
  },
  lightCard: {
    backgroundColor: '#fff',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#111',
  },
  languageToggleActive: {
    backgroundColor: '#6C63FF',
  },
  languageToggleText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  languageToggleTextActive: {
    color: '#fff',
  },
  instructionCardWhiteText: {
    color: '#fff',
  },
});

export default function HomeScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [livePlayerCount, setLivePlayerCount] = useState(GLOBAL_LIVE_USERS);
  const [showBonusClaimed, setShowBonusClaimed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [varsal, setVarsal] = useState<any[]>([]);
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [varsalContests, setVarsalContests] = useState<QuizContest[]>([]);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registeredPool, setRegisteredPool] = useState<string | null>(null);
  const { quizLanguage, setQuizLanguage } = useLanguage();
  
  // Theme-based gradient colors
  const primaryGradient: [string, string] = isDark 
    ? ['#8B5CF6', '#6D28D9'] // Dark mode purple gradient
    : ['#6C63FF', '#3b36ce']; // Light mode blue gradient
    
  const secondaryGradient: [string, string] = isDark
    ? ['#1F2937', '#111827'] // Dark mode background gradient
    : ['#F9FAFB', '#F3F4F6']; // Light mode background gradient
  
  const cardGradient: [string, string] = isDark
    ? ['#374151', '#1F2937'] // Dark mode card gradient
    : ['#ffffff', '#f5f5f5']; // Light mode card gradient
    
  const accentGradient: [string, string] = isDark
    ? ['#7C3AED', '#5B21B6'] // Dark mode accent gradient
    : ['#8B5CF6', '#6D28D9']; // Light mode accent gradient

  // Helper functions memoized for theme support
  const themeHelpers = useMemo(() => {
    // Helper function to generate random pastel colors for tags
    const getRandomPastelColor = (index: number) => {
      const colors = isDark ? [
        '#4B5563', '#6B7280', '#4B5563', '#6B7280', '#4B5563',
        '#6B7280', '#4B5563', '#6B7280', '#4B5563', '#6B7280'
      ] : [
        '#FFD6E0', '#FFEFCF', '#D1F5FF', '#C5F0D8', '#E0D4FF',
        '#FFD6A5', '#CAFFBF', '#9BF6FF', '#BDB2FF', '#FFC6FF'
      ];
      
      return colors[index % colors.length];
    };

    // Helper function to darken a color
    const darkenColor = (color: string, amount: number) => {
      return color;
    };

    // Helper function to lighten a color
    const lightenColor = (color: string, amount: number) => {
      return color;
    };

    return {
      getRandomPastelColor,
      darkenColor,
      lightenColor
    };
  }, [isDark]);

  // Function to load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);
  
  // Load profile when user changes
  useEffect(() => {
    loadUserProfile();
  }, [user, loadUserProfile]);
  
  // Refresh profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );
  
  // Load Varsal contests when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVarsalContests();
    }, [])
  );
  
  // Moved function outside of useFocusEffect callback
  const loadVarsalContests = useCallback(async () => {
    try {
      // Try to query the table directly, Supabase will handle the error if table doesn't exist
      const { data, error } = await supabase
        .from('admin_contests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      // If there's an error (like table doesn't exist) or no data
      if (error || !data || data.length === 0) {
        // Check if it's specifically a "relation does not exist" error
        if (error && error.code === '42P01') {
          console.log('Admin contests table not available, using mock contests instead');
        } else if (error) {
          console.error('Error fetching Varsal contests:', error);
        }
        
        // Use mock contests data if no contest data available
        setVarsalContests(contests);
        
        // Also update the promotion banner with mock data
        if (contests.length > 0) {
          const firstContest = contests[0];
          // Create a new banner object instead of mutating the original array
          const updatedBanner = {
            id: 'promo1',
            title: firstContest.name,
            description: `Join our ${firstContest.name} - ₹${firstContest.prize} prize pool!`,
            image: firstContest.image,
            gradient: ['#FF4E50', '#F9D423'],
            action: 'Join Now'
          };
          // Update promotionBanners in a React-friendly way
          const updatedBanners = [...promotionBanners];
          updatedBanners[0] = updatedBanner;
        }
        
        return;
      }
      
      // Map admin contest data to our QuizContest interface
      const mappedContests: QuizContest[] = data.map((item: any) => ({
        id: item.id || String(Math.random()),
        name: item.title || 'Contest',
        entryFee: String(item.entry_fee || 0),
        prize: String(item.prize_pool || 1000),
        image: item.image_url || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c',
        joinedPlayers: item.joined_players || Math.floor(Math.random() * 200) + 50,
        totalPlayers: item.total_slots || 500,
        poolId: item.pool_id || 1 // Map pool_id to poolId for navigation
      }));
      
      setVarsalContests(mappedContests);
      
      // Update promotionBanners with first contest if available
      if (mappedContests.length > 0) {
        const firstContest = mappedContests[0];
        // Create a new banner object instead of mutating the original array
        const updatedBanner = {
          id: 'promo1',
          title: firstContest.name,
          description: `Join our ${firstContest.name} - ₹${firstContest.prize} prize pool!`,
          image: firstContest.image,
          gradient: ['#FF4E50', '#F9D423'],
          action: 'Join Now'
        };
        // Update promotionBanners in a React-friendly way
        const updatedBanners = [...promotionBanners];
        updatedBanners[0] = updatedBanner;
      }
    } catch (err) {
      console.error('Exception in loadVarsalContests:', err);
      setVarsalContests(contests);
    }
  }, []);  // Add empty dependency array to only create this function once
  
  // Function to get user's name
  const getUserName = () => {
    let name = '';
    try {
      if (profile?.name && profile.name !== 'Player') {
        name = profile.name;
      } else if ((user as ExtendedUser)?.user_metadata?.name) {
        name = (user as ExtendedUser)?.user_metadata?.name || 'there';
      } else if ((user as ExtendedUser)?.user_metadata?.full_name) {
        name = (user as ExtendedUser)?.user_metadata?.full_name || 'there';
      } else {
        name = 'there';
      }
      
      // Ensure first letter is capitalized
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Friend';
    }
  };
  
  // Fetch wallet balance from WalletService and database
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (user) {
        try {
          // Method 1: Try to get wallet balance from WalletService
          const session = await supabase.auth.getSession();
          if (session.data.session) {
            const walletService = new WalletService(session.data.session);
            const wallet = await walletService.getWallet();
            if (wallet) {
              setWalletBalance(wallet.balance);
              return;
            }
          }
          
          // Method 2: If WalletService fails, query directly
          if (user.id) {
            const { data, error } = await supabase
              .from('wallets')
              .select('balance')
              .eq('user_id', user.id)
              .single();
              
            if (!error && data) {
              setWalletBalance(data.balance);
              return;
            }
          }
          
          // Method 3: Fall back to wallets by ID if user_id fails
          if (user.id) {
            const { data, error } = await supabase
              .from('wallets')
              .select('balance')
              .eq('id', user.id)
              .single();
              
            if (!error && data) {
              setWalletBalance(data.balance);
              return;
            }
          }
          
          console.log('Could not fetch wallet balance from any source');
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      }
    };
    
    fetchWalletBalance();
    
    // Refresh balance every 60 seconds
    const intervalId = setInterval(fetchWalletBalance, 60000);
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Safely render wallet balance
  const getWalletBalance = () => {
    try {
      // If we have a wallet balance from the service, use it
      if (walletBalance !== null) {
        return `₹${walletBalance.toFixed(2)}`;
      }
      
      // Fallback to profile balance if available
      const balance = profile?.walletBalance || 0;
      return `₹${balance.toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting wallet balance:', error);
      return '₹0.00';
    }
  };
  
  // Function to handle bonus collection
  const handleCollectBonus = () => {
    // Simulate adding bonus to wallet
    console.log('Bonus collected and added to wallet');
    setShowBonusClaimed(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setShowBonusClaimed(false);
    }, 3000);
    
    // Navigate to wallet to show the updated balance
    setTimeout(() => {
      router.replace('/(tabs)/wallet');
    }, 1000);
  };
  
  // Create a pulse animation for the live dot
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Set up the pulse animation
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Update GLOBAL_LIVE_USERS when livePlayerCount changes
  useEffect(() => {
    GLOBAL_LIVE_USERS = livePlayerCount;
  }, [livePlayerCount]);
  
  // Quick action buttons with gradient background
  const quickActions: QuickAction[] = [
    {
      title: "All Contests",
      icon: "🏆",
      bgColor: isDark ? "#FF6A00" : "#FFB347",
      textColor: "white",
      onPress: () => router.replace('/(tabs)/contests'),
      gradient: isDark
        ? ["#FF6A00", "#FFB347"] // Vibrant orange to yellow
        : ["#FFB347", "#FF6A00"],
    },
    {
      title: "Withdraw",
      icon: "💳",
      bgColor: isDark ? "#00C6FB" : "#005BEA",
      textColor: "white",
      onPress: () => router.replace('/(tabs)/wallet'),
      gradient: isDark
        ? ["#00C6FB", "#005BEA"] // Bright blue to deep blue
        : ["#005BEA", "#00C6FB"],
    },
    {
      title: "My Contests",
      icon: "🎟️",
      bgColor: isDark ? "#43E97B" : "#38F9D7",
      textColor: "white",
      onPress: () => router.replace({ pathname: './contests', params: { autoExpandMyContests: 'true' } }),
      gradient: isDark
        ? ["#43E97B", "#38F9D7"] // Green to teal
        : ["#38F9D7", "#43E97B"],
    },
    {
      title: "Invite Friends",
      icon: "👥",
      bgColor: isDark ? "#A770EF" : "#F6D365",
      textColor: "white",
      onPress: () => router.push({ pathname: '/refer' }),
      gradient: isDark
        ? ["#A770EF", "#F6D365"] // Purple to yellow
        : ["#F6D365", "#A770EF"],
    },
    {
      title: "Rewards",
      icon: "🎖️",
      bgColor: isDark ? "#F7971E" : "#FFD200",
      textColor: "white",
      onPress: () => router.push({ pathname: '/refer' }),
      gradient: isDark
        ? ["#F7971E", "#FFD200"] // Yellow to orange
        : ["#FFD200", "#F7971E"],
    },
    {
      title: "Demo Play",
      icon: "🕹️",
      bgColor: isDark ? "#FF5858" : "#FBCA1F",
      textColor: "white",
      onPress: () => router.push('../game/instructions-demo'),
      gradient: isDark
        ? ["#FF5858", "#FBCA1F"] // Red to yellow
        : ["#FBCA1F", "#FF5858"],
    },
  ];

  // Active contests
  const activeContests: QuizContest[] = [
    {
      id: '1',
      name: "Animal Kingdom Quiz",
      entryFee: "₹20",
      prize: "₹1000",
      image: "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      joinedPlayers: 243,
      totalPlayers: 500
    },
    {
      id: '2',
      name: "Science Trivia",
      entryFee: "₹50",
      prize: "₹5000",
      image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      joinedPlayers: 412,
      totalPlayers: 1000
    },
    {
      id: '3',
      name: "History Masters",
      entryFee: "₹30", 
      prize: "₹2500",
      image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      joinedPlayers: 156,
      totalPlayers: 300
    },
    {
      id: '4',
      name: "Movie Buffs Quiz",
      entryFee: "₹25",
      prize: "₹1500",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      joinedPlayers: 328,
      totalPlayers: 600
    }
  ];

  // Top players
  const topPlayers: QuizTopPlayer[] = [
    { rank: 1, username: "Amit Kumar", points: 9850, avatar: "🧑🏽‍🦱" },
    { rank: 2, username: "Ananya Desai", points: 9340, avatar: "👩🏽‍🦰" },
    { rank: 3, username: "Suresh Mehta", points: 8970, avatar: "👨🏾" },
  ];
  
  // Create a scale animation for the promotion banners
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Set up the scale animation
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Render promo banner item
  const renderPromoBanner = ({ item, index }: { item: PromoBanner; index: number }) => (
    <Animatable.View 
      animation="fadeInRight" 
      delay={index * 100} 
      style={styles.promoBannerContainer}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push('/instant-match')}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoBannerContent}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>{item.title}</Text>
              <Text style={styles.promoDescription}>{item.description}</Text>
              <View style={styles.promoActionContainer}>
                <Text style={styles.promoActionText}>{item.action}</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.promoBannerImageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.promoBannerImage} 
                resizeMode="cover"
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  // Render quiz pool item
  const renderQuizPool = ({item}: {item: QuizPool}) => {
    return (
      <Animatable.View 
        animation="fadeInRight" 
        duration={500}
        delay={200 * Number(item.id.split('-')[1])}
        style={dynamicStyles.quizPoolCard}
      >
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: '/instant-match',
            params: { poolId: item.id }
          })}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={cardGradient}
            style={dynamicStyles.quizPoolCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={dynamicStyles.quizPoolIconContainer}>
              <Ionicons name={item.icon as any} size={28} color={isDark ? '#8B5CF6' : '#6C63FF'} style={dynamicStyles.quizPoolIcon} />
            </View>
            <View style={dynamicStyles.quizPoolContent}>
              <Text style={dynamicStyles.quizPoolTitle}>{item.title}</Text>
              <Text style={dynamicStyles.quizPoolDescription}>{item.description}</Text>
              
              <View style={dynamicStyles.quizPoolDetailsContainer}>
                <View style={dynamicStyles.quizPoolDetailItem}>
                  <Ionicons name="people" size={16} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  <Text style={dynamicStyles.quizPoolDetailText}>{item.playerCount} Players</Text>
                </View>
                <View style={dynamicStyles.quizPoolDetailItem}>
                  <Ionicons name="time" size={16} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  <Text style={dynamicStyles.quizPoolDetailText}>{item.timeLimit} mins</Text>
                </View>
              </View>
              
              <View style={dynamicStyles.quizPoolDetailsContainer}>
                <View style={dynamicStyles.quizPoolDetailItem}>
                  <Ionicons name="wallet" size={16} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  <Text style={dynamicStyles.quizPoolDetailText}>₹{item.entryFee} Entry</Text>
                </View>
                <View style={dynamicStyles.quizPoolDetailItem}>
                  <Ionicons name="trophy" size={16} color={isDark ? '#E5E7EB' : '#4B5563'} />
                  <Text style={dynamicStyles.quizPoolDetailText}>₹{item.prize} Prize</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  };
  
  // Contest item renderer
  const renderContestItem = ({ item, index }: { item: QuizContest; index: number }) => (
    <Pressable
      style={[styles.contestCard, { backgroundColor: isDark ? '#1F2937' : '#ffffff' }]}
      onPress={() => {
        // Navigate to contest with poolId parameter if available
        router.push({
          pathname: '/game/quiz',
          params: { 
            contestId: item.id,
            mode: 'contest',
            poolId: item.poolId || 1 // Pass poolId if available, defaulting to 1
          }
        });
      }}
    >
      <LinearGradient
        colors={cardGradient}
        style={styles.contestCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Image source={{ uri: item.image }} style={styles.contestImage} />
        <View style={styles.contestInfo}>
          <ThemedText style={styles.contestName}>{item.name}</ThemedText>
          <View style={styles.contestStats}>
            <ThemedText style={styles.entryFee}>Entry: ₹{item.entryFee}</ThemedText>
            <View style={styles.prizeContainer}>
              <MaterialIcons name="emoji-events" size={16} color={isDark ? "#8B5CF6" : "#6C63FF"} />
              <ThemedText style={styles.prize}>₹{item.prize}</ThemedText>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={primaryGradient}
                style={[
                  styles.progressFill,
                  { width: `${(item.joinedPlayers / item.totalPlayers) * 100}%` }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <ThemedText style={styles.playerCount}>
              {item.joinedPlayers}/{item.totalPlayers}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
  
  // Render winner item for FlatList
  const renderWinnerItem = ({ item, index }: { item: QuizWinner; index: number }) => (
    <Animatable.View 
      animation="fadeIn" 
      delay={index * 100} 
      style={[styles.winnerCard, isDark ? styles.darkCard : styles.lightCard]}
    >
      <View style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 36 }}>{item.avatar}</Text>
      </View>
      <ThemedText style={styles.winnerName} numberOfLines={1}>{item.username}</ThemedText>
      <Text style={styles.winnerAmount}>{item.amount}</Text>
    </Animatable.View>
  );

  // Create dynamic styles that depend on theme
  const dynamicStyles = useMemo(() => StyleSheet.create({
    quizPoolHeaderContainer: {
      padding: 16,
      backgroundColor: isDark ? '#374151' : '#f8f9fa',
      borderRadius: 12,
      marginBottom: 16,
    },
    quizPoolHeaderText: {
      fontSize: 14,
      color: isDark ? '#ffffff' : '#333',
      marginBottom: 8,
    },
    quizPoolListContainer: {
      paddingLeft: 16,
      paddingRight: 8,
    },
    quizPoolCard: {
      width: 280,
      marginRight: 16,
      marginBottom: 8,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    quizPoolCardGradient: {
      padding: 16,
      borderRadius: 16,
      height: 200,
    },
    quizPoolIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(108, 99, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    quizPoolIcon: {
      textAlign: 'center',
    },
    quizPoolContent: {
      flex: 1,
    },
    quizPoolTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#111827',
      marginBottom: 4,
    },
    quizPoolDescription: {
      fontSize: 14,
      color: isDark ? '#D1D5DB' : '#4B5563',
      marginBottom: 12,
    },
    quizPoolDetailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    quizPoolDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quizPoolDetailText: {
      fontSize: 14,
      color: isDark ? '#E5E7EB' : '#4B5563',
      marginLeft: 4,
    },
    gameInfoCard: {
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    gameInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    gameInfoNumberCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? '#8B5CF6' : '#6C63FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    gameInfoNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    gameInfoText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? '#ffffff' : '#333',
    },
    gameInfoDivider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      marginVertical: 12,
    }
  }), [isDark]);

  // Handler for registering to a pool (copied from contests.tsx)
  const handleRegisterPool = (poolName: string) => {
    setRegisteredPool(poolName);
    setShowRegisterModal(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.mainContainer}>
        <ThemedStatusBar
          backgroundColor="transparent"
          translucent={true}
          barStyle="light-content"
        />
        <ThemedView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            {/* --- Custom Gradient Header with Logo and App Name (now scrollable) --- */}
            <LinearGradient
              colors={isDark ? ['#4F46E5', '#3730A3'] : ['#6C63FF', '#3b36ce']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.brandHeader,
                { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 32) : 44 }
              ]}
            >
              <View style={styles.brandHeaderContent}>
                <Image
                  source={require('../../assets/images/craiyon_203413_transparent.png')}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                <Text style={styles.brandTitle}>
                  Quizzoo
                </Text>
              </View>
            </LinearGradient>
            {/* --- End Custom Header --- */}

            {/* Instruction Cards Section (English/Hindi toggle) */}
            <View style={styles.instructionSection}>
              <View style={styles.instructionCardsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.instructionCardsScroll}>
                  {/* Card 1: Play Quiz, Win Big! */}
                  <Animatable.View animation="fadeInUp" delay={100} duration={700} style={styles.instructionCardWrapper}>
                    <LinearGradient
                      colors={isDark ? ['#FF5858', '#FBCA1F'] : ['#FF6A00', '#FFB347']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.instructionCard]}
                    >
                      <Text style={[styles.instructionCardTitle, styles.instructionCardWhiteText]}>Play Quiz, Win Big!</Text>
                      <Text style={[styles.instructionCardText, styles.instructionCardWhiteText]}>Pay just ₹10, win up to ₹1000 in 1 minute! Your knowledge = instant cash.</Text>
                    </LinearGradient>
                  </Animatable.View>
                  {/* Card 2: How It Works */}
                  <Animatable.View animation="fadeInUp" delay={200} duration={700} style={styles.instructionCardWrapper}>
                    <LinearGradient
                      colors={isDark ? ['#00C6FB', '#005BEA'] : ['#43E97B', '#38F9D7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.instructionCard]}
                    >
                      <Text style={[styles.instructionCardTitle, styles.instructionCardWhiteText]}>How It Works</Text>
                      <Text style={[styles.instructionCardText, styles.instructionCardWhiteText]}>Join a pool, answer fast, top the leaderboard. The fastest and smartest win the biggest prizes.</Text>
                    </LinearGradient>
                  </Animatable.View>
                  {/* Card 3: Transparent & Fair */}
                  <Animatable.View animation="fadeInUp" delay={300} duration={700} style={styles.instructionCardWrapper}>
                    <LinearGradient
                      colors={isDark ? ['#A770EF', '#F6D365'] : ['#F7971E', '#FFD200']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.instructionCard]}
                    >
                      <Text style={[styles.instructionCardTitle, styles.instructionCardWhiteText]}>
                        Transparent & Fair
                      </Text>
                      <Text style={[styles.instructionCardText, styles.instructionCardWhiteText]}>
                        See entry, prize, time, and your rank live. No hidden rules. Everything is clear.
                      </Text>
                    </LinearGradient>
                  </Animatable.View>
                </ScrollView>
              </View>
            </View>
            {/* Mega Gaming Pools Section (replaces promo banners) */}
            <Animatable.View animation="fadeIn" delay={100} duration={800}>
              <View style={styles.sectionContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, paddingLeft: 8, paddingRight: 8 }}>
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
                        <Text style={styles.megaPoolCardTitle}>🎮 माइक्रो पूल (Micro Pool) 🎮</Text>
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
            </Animatable.View>
            {/* End Mega Gaming Pools Section */}

            {/* Registration Confirmation Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showRegisterModal}
              onRequestClose={() => setShowRegisterModal(false)}
            >
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <LinearGradient
                  colors={isDark ? ['#232526', '#414345', '#6D28D9'] : ['#a18cd1', '#fbc2eb', '#8EC5FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: '90%', borderRadius: 16, padding: 24 }}
                >
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#222', marginBottom: 12 }}>Registration Successful / पंजीकरण सफल</Text>
                  <Text style={{ fontSize: 16, color: isDark ? '#fff' : '#222', marginBottom: 12 }}>You have registered for the {registeredPool}.
आपने {registeredPool} के लिए पंजीकरण कर लिया है।</Text>
                  <Text style={{ fontSize: 15, color: isDark ? '#fff' : '#222', marginBottom: 12 }}>You will receive a notification 12 hours before the contest starts. Please come back at the exact time to join and play!
प्रतियोगिता शुरू होने से 12 घंटे पहले आपको सूचना मिलेगी। कृपया ठीक समय पर वापस आएं और भाग लें!</Text>
                  <TouchableOpacity onPress={() => setShowRegisterModal(false)} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#388e3c', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </Modal>

            {/* Quick Actions Grid */}
            <Animatable.View animation="fadeInUp" delay={200} duration={800}>
              <View style={styles.quickActionsContainer}>
                <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickActionButton}
                      onPress={action.onPress}
                    >
                      <LinearGradient
                        colors={action.gradient}
                        style={styles.quickActionGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.quickActionIcon}>{action.icon}</Text>
                        <Text style={[styles.quickActionText, { color: action.textColor }]}>
                          {action.title}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animatable.View>
            
            {/* Recent Winners */}
            <Animatable.View animation="fadeInUp" delay={450} duration={800}>
              <View style={styles.winnersContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>Recent Winners</ThemedText>
                  <TouchableOpacity onPress={() => setShowWinnersModal(true)}>
                    <ThemedText style={styles.viewAllText}>View All</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={winners.slice(0, 5)}
                  renderItem={renderWinnerItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.winnersScrollContent}
                />
              </View>
            </Animatable.View>
          
            {/* Top Players Section */}
            <Animatable.View animation="fadeInUp" delay={500} duration={800}>
              <View style={styles.topPlayersContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>Top Players</ThemedText>
                  <TouchableOpacity onPress={() => setShowPlayersModal(true)}>
                    <ThemedText style={styles.viewAllText}>View All</ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={styles.playersList}>
                  {topPlayers.slice(0, 5).map((player, index) => (
                    <View key={player.rank} style={styles.topPlayerCard}>
                      <View style={[
                        styles.rankBadge, 
                        { backgroundColor: player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : player.rank === 3 ? '#CD7F32' : Colors.primary }
                      ]}>
                        <Text style={styles.rankText}>{player.rank}</Text>
                      </View>
                      <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 28 }}>{player.avatar}</Text>
                      </View>
                      <View style={styles.playerInfo}>
                        <ThemedText style={styles.playerName}>{player.username}</ThemedText>
                        <Text style={styles.playerScore}>{player.points} points</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </Animatable.View>
            
            {/* Footer with app info */}
            <Animatable.View animation="fadeIn" delay={550} duration={800}>
              <View style={styles.footerContainer}>
                <ThemedText style={styles.footerText}>
                  Quizzoo v1.0.0
                </ThemedText>
                <ThemedText style={styles.footerCopyright}>
                  © 2025 QUICWITS IT TECH LLP. All rights reserved.
                </ThemedText>
                {/* NOTE: Whenever the company name is needed in the app, use 'QUICWITS IT TECH LLP' (English only) */}
              </View>
            </Animatable.View>
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </ThemedView>
        {/* Winners Modal */}
        {showWinnersModal && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', maxHeight: '80%' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>All Recent Winners</Text>
              <ScrollView>
                {winners.map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 32 }}>{item.avatar}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', flex: 1 }}>{item.username}</Text>
                    <Text style={{ fontSize: 16, color: '#388e3c', fontWeight: 'bold' }}>{item.amount}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowWinnersModal(false)} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#388e3c', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Players Modal */}
        {showPlayersModal && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', maxHeight: '80%' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>All Top Players</Text>
              <ScrollView>
                {topPlayers.map((player) => (
                  <View key={player.rank} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={[
                      styles.rankBadge, 
                      { backgroundColor: player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : player.rank === 3 ? '#CD7F32' : Colors.primary, marginRight: 8 }
                    ]}>
                      <Text style={styles.rankText}>{player.rank}</Text>
                    </View>
                    <View style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 32 }}>{player.avatar}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', flex: 1 }}>{player.username}</Text>
                    <Text style={{ fontSize: 16, color: '#1e40af', fontWeight: 'bold' }}>{player.points} pts</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowPlayersModal(false)} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: '#1e40af', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
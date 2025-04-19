import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar as RNStatusBar,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/Header';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';
import ThemedStatusBar from '@/components/ThemedStatusBar';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { ContestRules } from '@/components/ContestRules';
import { GradientHeader } from '@/components/GradientHeader';

const { width } = Dimensions.get('window');

// Update the Contest interface 
interface Contest {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startTime: Date;
  category: string;
  tier: string;
  isPrivate?: boolean;
  shareCode?: string;
  description?: string;
  questionCount?: number;
  duration?: number;
  prizes?: Array<{rank: number, amount: number}>;
  categories: string[];
  rules: string[];
  createdBy?: string;
  date?: string;
  time?: string;
}

// Mock contest data with additional properties
const getContestById = (id: string): Contest | null => {
  // Standard Tier Contests
  if (id.startsWith('S')) {
    const tier = 'Standard';
    const playerCount = 10;
    const entryFees = {
      S1: 10, S2: 25, S3: 50, S4: 100, S5: 250, S6: 500, S7: 1000
    };
    const prizePools = {
      S1: 90, S2: 225, S3: 450, S4: 900, S5: 2250, S6: 4500, S7: 9000
    };
    const stakes = {
      S1: 'Low-Stake', S2: 'Low-Stake', S3: 'Low-Stake', 
      S4: 'Medium-Stake', S5: 'Medium-Stake', 
      S6: 'High-Stake', S7: 'High-Stake'
    };
    
    // Determine fee and pool based on ID
    const fee = entryFees[id as keyof typeof entryFees] || 10;
    const pool = prizePools[id as keyof typeof prizePools] || 90;
    const stake = stakes[id as keyof typeof stakes] || 'Low-Stake';
    
    // Calculate prize distribution
    const firstPrize = pool * 0.5;
    const secondPrize = pool * 0.3;
    const thirdPrize = pool * 0.2;
    
    return {
      id,
      name: `${tier} Quiz ${id}`,
      entryFee: fee,
      prizePool: pool,
      participants: Math.floor(Math.random() * playerCount),
      maxParticipants: playerCount,
      startTime: new Date(Date.now() + 3600000),
      category: 'Quiz',
      tier: stake,
      description: `Standard format quiz with ${playerCount} players. Answer 10 questions correctly to win.`,
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: firstPrize },
        { rank: 2, amount: secondPrize },
        { rank: 3, amount: thirdPrize },
      ],
      categories: ['General Knowledge', 'Current Affairs', 'Science'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Quizzoo',
      date: '2023-12-15',
      time: '20:00',
    };
  }
  
  // Medium Player Count Contests (20 Players)
  else if (id.startsWith('M')) {
    const tier = 'Medium';
    const playerCount = 20;
    const entryFees = {
      M1: 10, M2: 25, M3: 50, M4: 100, M5: 250, M6: 500, M7: 1000
    };
    const prizePools = {
      M1: 180, M2: 450, M3: 900, M4: 1800, M5: 4500, M6: 9000, M7: 18000
    };
    
    // Determine fee and pool based on ID
    const fee = entryFees[id as keyof typeof entryFees] || 10;
    const pool = prizePools[id as keyof typeof prizePools] || 180;
    
    // Calculate prize distribution
    const firstPrize = pool * 0.5;
    const secondPrize = pool * 0.3;
    const thirdPrize = pool * 0.2;
    
    return {
      id,
      name: `${tier} Quiz ${id}`,
      entryFee: fee,
      prizePool: pool,
      participants: Math.floor(Math.random() * playerCount),
      maxParticipants: playerCount,
      startTime: new Date(Date.now() + 7200000),
      category: 'Quiz',
      tier: 'Low-Stake',
      description: `Medium format quiz with ${playerCount} players. More competition, bigger prizes!`,
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: firstPrize },
        { rank: 2, amount: secondPrize },
        { rank: 3, amount: thirdPrize },
      ],
      categories: ['History', 'Sports', 'Entertainment', 'Technology'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Quizzoo',
      date: '2023-12-16',
      time: '19:00',
    };
  }
  
  // Large Player Count Contests (50 Players)
  else if (id.startsWith('L')) {
    const tier = 'Large';
    const playerCount = 50;
    const entryFees = {
      L1: 10, L2: 25, L3: 50, L4: 100, L5: 250, L6: 500, L7: 1000
    };
    const prizePools = {
      L1: 450, L2: 1125, L3: 2250, L4: 4500, L5: 11250, L6: 22500, L7: 45000
    };
    
    // Determine fee and pool based on ID
    const fee = entryFees[id as keyof typeof entryFees] || 10;
    const pool = prizePools[id as keyof typeof prizePools] || 450;
    
    // Calculate prize distribution
    const firstPrize = pool * 0.5;
    const secondPrize = pool * 0.3;
    const thirdPrize = pool * 0.2;
    
    return {
      id,
      name: `${tier} Quiz ${id}`,
      entryFee: fee,
      prizePool: pool,
      participants: Math.floor(Math.random() * playerCount),
      maxParticipants: playerCount,
      startTime: new Date(Date.now() + 10800000),
      category: 'Quiz',
      tier: 'Low-Stake',
      description: `Large format quiz with ${playerCount} players. Massive player pool with huge prizes!`,
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: firstPrize },
        { rank: 2, amount: secondPrize },
        { rank: 3, amount: thirdPrize },
      ],
      categories: ['General Knowledge', 'Science', 'Literature', 'Geography'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Quizzoo',
      date: '2023-12-17',
      time: '18:00',
    };
  }
  
  // Duel Contests (1v1)
  else if (id.startsWith('D')) {
    const tier = 'Duel';
    const playerCount = 2;
    const entryFees = {
      D1: 10, D2: 25, D3: 50, D4: 100, D5: 250, D6: 500, D7: 1000
    };
    const prizePools = {
      D1: 18, D2: 45, D3: 90, D4: 180, D5: 450, D6: 900, D7: 1800
    };
    
    // Determine fee and pool based on ID
    const fee = entryFees[id as keyof typeof entryFees] || 10;
    const pool = prizePools[id as keyof typeof prizePools] || 18;
    
    return {
      id,
      name: `${tier} Quiz ${id}`,
      entryFee: fee,
      prizePool: pool,
      participants: Math.floor(Math.random() * 2),
      maxParticipants: playerCount,
      startTime: new Date(Date.now() + 1800000),
      category: 'Quiz',
      tier: 'Duel',
      description: `One-on-one duel format. Go head to head with another player for the win!`,
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: pool },
      ],
      categories: ['Mixed Topics'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Winner takes all',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Quizzoo',
      date: '2023-12-18',
      time: '20:00',
    };
  }

  // For any other ID, fall back to the original data
  const CONTESTS: Contest[] = [
    {
      id: '1',
      name: 'Daily Quiz Challenge',
      entryFee: 10,
      prizePool: 900,
      participants: 100,
      maxParticipants: 100,
      startTime: new Date(),
      category: 'General Knowledge',
      tier: 'Low-Stake',
      description: 'Test your general knowledge with our daily quiz challenge! Answer 10 questions correctly and win exciting prizes.',
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: 500 },
        { rank: 2, amount: 250 },
        { rank: 3, amount: 150 },
      ],
      categories: ['General Knowledge', 'Current Affairs', 'Science'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Quizzoo Team',
      date: '2 April 2025',
      time: '7:00 PM',
    },
    {
      id: '2',
      name: 'Weekend Trivia',
      entryFee: 50,
      prizePool: 4500,
      participants: 75,
      maxParticipants: 100,
      startTime: new Date(Date.now() + 30 * 60000),
      category: 'Sports',
      tier: 'Medium-Stake',
      description: 'Put your sports knowledge to the test and win exciting prizes!',
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: 2500 },
        { rank: 2, amount: 1250 },
        { rank: 3, amount: 750 },
      ],
      categories: ['Cricket', 'Football', 'Tennis', 'Olympics'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Sports Channel',
      date: '3 April 2025',
      time: '8:00 PM',
    },
    {
      id: '3',
      name: 'Mega Brain Battle',
      entryFee: 100,
      prizePool: 9000,
      participants: 45,
      maxParticipants: 100,
      startTime: new Date(Date.now() + 60 * 60000),
      category: 'Science',
      tier: 'High-Stake',
      description: 'The ultimate science quiz for the brainiacs! Show your knowledge and win big!',
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: 5000 },
        { rank: 2, amount: 2500 },
        { rank: 3, amount: 1500 },
      ],
      categories: ['Physics', 'Chemistry', 'Biology', 'Space'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Science Hub',
      date: '4 April 2025',
      time: '9:00 PM',
    },
    {
      id: '4',
      name: 'Movie Mania Quiz',
      entryFee: 25,
      prizePool: 2250,
      participants: 36,
      maxParticipants: 100,
      startTime: new Date(Date.now() + 120 * 60000),
      category: 'Entertainment',
      tier: 'Low-Stake',
      description: 'Test your movie knowledge and win prizes in this fun quiz!',
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: 1250 },
        { rank: 2, amount: 625 },
        { rank: 3, amount: 375 },
      ],
      categories: ['Bollywood', 'Hollywood', 'TV Shows', 'Celebrities'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Movie Buffs',
      date: '5 April 2025',
      time: '6:00 PM',
    },
    {
      id: '5',
      name: 'Tech Wizard Challenge',
      entryFee: 75,
      prizePool: 6750,
      participants: 28,
      maxParticipants: 100,
      startTime: new Date(Date.now() + 180 * 60000),
      category: 'Technology',
      tier: 'Medium-Stake',
      description: 'For tech enthusiasts! Show your knowledge about the latest technologies.',
      questionCount: 10,
      duration: 60,
      prizes: [
        { rank: 1, amount: 3750 },
        { rank: 2, amount: 1875 },
        { rank: 3, amount: 1125 },
      ],
      categories: ['Gadgets', 'Software', 'Internet', 'Coding'],
      rules: [
        'Each question has 6 seconds time limit',
        'No negative marking for wrong answers',
        'Top 3 players win cash prizes',
        'Get bonus points for answering quickly'
      ],
      createdBy: 'Tech Geeks',
      date: '6 April 2025',
      time: '8:30 PM',
    },
  ];
  
  return CONTESTS.find(contest => contest.id === id) || null;
};

// Add formatTime function directly to this file
const formatTime = (timeStr?: string) => {
  if (!timeStr) return 'Starting Soon';
  
  try {
    const time = new Date(timeStr);
    const now = new Date();
    const diffInHours = Math.floor((time.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Starting Soon';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  } catch (e) {
    return 'Starting Soon';
  }
};

// Update the ContestDetailScreen component
export default function ContestDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const contest = getContestById(id as string);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (!contest) {
    return (
      <SafeAreaWrapper>
        <GradientHeader title="Contest Not Found" />
        <ThemedView style={styles.container}>
          <ThemedText>Contest not found.</ThemedText>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  if (loading) {
    return (
      <SafeAreaWrapper>
        <GradientHeader title="Loading..." />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ThemedStatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle={isDark ? 'light-content' : 'light-content'}
      />
      <GradientHeader 
        title={contest.name}
        rightComponent={
          <TouchableOpacity onPress={() => Alert.alert('Share', 'Share contest functionality coming soon!')}>
            <Ionicons 
              name="share-social" 
              size={24} 
              color={isDark ? Colors.dark.text : '#fff'} 
            />
          </TouchableOpacity>
        }
      />
      <ScrollView style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        {/* Contest Header with Gradient */}
        <LinearGradient
          colors={['#4338CA', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: 0 }]}
        >
          <SafeAreaWrapper style={{ paddingHorizontal: 0 }} withoutBottom>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerInfo}>
                <Text style={styles.contestType}>{contest.tier.toUpperCase()} CONTEST</Text>
                <Text style={styles.contestTitle}>{contest.name}</Text>
                <View style={styles.categoriesRow}>
                  {contest.categories && contest.categories.map((category, index) => (
                    <View key={index} style={styles.categoryPill}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </SafeAreaWrapper>
        </LinearGradient>
        
        {/* Contest Details */}
        <View style={[styles.detailsContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          {/* Prize Pool Info */}
          <View style={styles.prizesContainer}>
            <View style={styles.prizePoolSection}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>Prize Pool</Text>
              <Text style={[styles.prizePoolValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>₹{contest.prizePool}</Text>
          </View>
          
            <View style={styles.prizeDistribution}>
              {contest.prizes && contest.prizes.map((prize, index) => (
                <View key={index} style={styles.prizeItem}>
                  <Text style={[styles.prizeRank, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {index + 1} Place:
                  </Text>
                  <Text style={[styles.prizeValue, { color: isDark ? '#22C55E' : '#16A34A' }]}>₹{prize.amount}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Participants Progress */}
          <View style={styles.participantsSection}>
            <View style={styles.participantsHeader}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>Participants</Text>
              <Text style={[styles.participantsCount, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {contest.participants}/{contest.maxParticipants}
              </Text>
            </View>
            
            <View style={[styles.progressBarContainer, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: '100%' }
                ]}
              />
            </View>
          </View>
          
          {/* Contest Start Info */}
          <View style={styles.startInfoSection}>
            <View style={styles.startTimeContainer}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Starts In
              </Text>
              <Text style={[styles.startTimeValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {formatTime(contest.time)}
              </Text>
        </View>
        
            <View style={styles.entryFeeContainer}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Entry Fee
              </Text>
              <Text style={[styles.entryFeeValue, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                ₹{contest.entryFee}
              </Text>
            </View>
        </View>
        
          {/* Contest Info */}
          <View style={styles.contestInfoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="help-circle" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
                <Text style={[styles.infoText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {contest.questionCount} Questions
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
                <Text style={[styles.infoText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {contest.duration} seconds total
                </Text>
              </View>
            </View>
          </View>
          
          {/* Contest Rules */}
          <ContestRules rules={contest.rules || []} isDark={isDark} />
          
          {/* Join Button */}
          <View style={styles.joinButtonContainer}>
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => {
                const poolId = typeof id === 'string' ? id.toUpperCase() : Array.isArray(id) ? id[0].toUpperCase() : 'S1';
                console.log('Starting quiz for contest pool:', poolId);
                
                try {
                  // Using relative link format
                  router.push({
                    pathname: "../game/[id]", 
                    params: { 
                      id: "quiz",
                      contestId: poolId, 
                      poolId: poolId, 
                      mode: "contest", 
                      difficulty: "medium" 
                    }
                  });
                } catch (error) {
                  console.error("Navigation error:", error);
                  Alert.alert("Navigation Error", "Could not start the quiz. Please try again.");
                }
              }}
            >
              <Text style={styles.joinButtonText}>Join Contest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerGradient: {
    width: '100%',
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginBottom: 10,
  },
  contestType: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  contestTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  prizesContainer: {
    marginBottom: 24,
  },
  prizePoolSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  prizePoolValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  prizeDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prizeItem: {
    alignItems: 'center',
  },
  prizeRank: {
    fontSize: 14,
    marginBottom: 4,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantsSection: {
    marginBottom: 24,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  startInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  startTimeContainer: {
    flex: 1,
  },
  startTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  entryFeeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  entryFeeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contestInfoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  joinButtonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
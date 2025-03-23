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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import { Header } from '@/components/Header';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';

// Update the Contest interface 
interface Contest {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startTime?: string;
  category: string;
  tier: string;
  isPrivate?: boolean;
  shareCode?: string;
  description?: string;
  questionCount?: number;
  duration?: number;
  prizes?: Array<{rank: number, amount: number}>;
  categories?: string[]; // Optional categories array
  rules?: string[]; // Optional rules array
  createdBy?: string; // Optional creator name
  date?: string; // Optional date
  time?: string; // Optional time
}

// Mock contest data with additional properties
const getContestById = (id: string): Contest | null => {
  const CONTESTS: Contest[] = [
    {
      id: '1',
      name: 'Daily Quiz Challenge',
      entryFee: 10,
      prizePool: 900,
      participants: 100,
      maxParticipants: 100,
      startTime: new Date().toISOString(),
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
      startTime: new Date(Date.now() + 30 * 60000).toISOString(),
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
      startTime: new Date(Date.now() + 60 * 60000).toISOString(),
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
      startTime: new Date(Date.now() + 120 * 60000).toISOString(),
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
      startTime: new Date(Date.now() + 180 * 60000).toISOString(),
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

// Update getTierColor to account for dark mode
const getTierColor = (tier: string | undefined | null, isDark = false) => {
  if (!tier) {
    return isDark ? '#333333' : '#777777'; // Default color if tier is undefined/null
  }
  
  if (tier === 'Low-Stake') {
    return isDark ? '#538D22' : '#84CC16';
  } else if (tier === 'Medium-Stake') {
    return isDark ? '#0369A1' : '#06B6D4';
  } else {
    return isDark ? '#A92A67' : '#F63880';
  }
};

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

export default function ContestDetailScreen() {
  const { id } = useLocalSearchParams();
  const [contest, setContest] = useState<Contest | null>(null);
  const [walletBalance, setWalletBalance] = useState(100); // Mock wallet balance
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  
  // Get theme information
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Fetch contest details
    if (id) {
      const contestData = getContestById(id.toString());
      setContest(contestData);
      setLoading(false);
    }
  }, [id]);

  const handleJoinContest = () => {
    if (!contest) return;
    
    if (walletBalance < contest.entryFee) {
      Alert.alert(
        "Insufficient Balance",
        "You don't have enough balance to join this contest. Add money to your wallet?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Money", onPress: () => router.push('/add-money' as any) }
        ]
      );
      return;
    }
    
    // Set joining to true to show loading state
    setJoining(true);
    
    // Navigate immediately - no delay needed
    router.push(`/game/${contest.id}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, isDark && { backgroundColor: '#121212' }]}>
        <Stack.Screen
          options={{
            title: "Contest Details",
            headerStyle: {
              backgroundColor: isDark ? '#1E2A38' : '#FFFFFF',
            },
            headerTintColor: isDark ? '#FFFFFF' : '#000000',
          }}
        />
        <ActivityIndicator size="large" color={isDark ? '#4CAF50' : '#3E7BFA'} />
        <ThemedText style={styles.loadingText}>Loading contest details...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
      <Stack.Screen
        options={{
          title: "Contest Details",
          headerStyle: {
            backgroundColor: isDark ? '#1E2A38' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.header, isDark && { backgroundColor: '#1E2A38' }]} backgroundType="card">
          <View style={styles.tierBadge}>
            <View style={[
              styles.tierBadgeInner, 
              { backgroundColor: getTierColor(contest?.tier, isDark) }
            ]}>
              <ThemedText style={styles.tierText}>{contest?.tier}</ThemedText>
            </View>
          </View>
          
          <ThemedText style={[styles.contestTitle, isDark && { color: '#fff' }]}>{contest?.name}</ThemedText>
          
          <View style={styles.contestCreator}>
            <MaterialIcons name="verified" size={16} color="#4CAF50" style={styles.verifiedIcon} />
            <ThemedText style={[styles.creatorText, isDark && { color: '#ddd' }]}>By {contest?.createdBy}</ThemedText>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="event" size={16} color={isDark ? '#aaa' : '#666'} style={styles.dateTimeIcon} />
              <ThemedText style={[styles.dateTimeText, isDark && { color: '#aaa' }]}>{contest?.date}</ThemedText>
            </View>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="schedule" size={16} color={isDark ? '#aaa' : '#666'} style={styles.dateTimeIcon} />
              <ThemedText style={[styles.dateTimeText, isDark && { color: '#aaa' }]}>{contest?.time}</ThemedText>
            </View>
            <View style={styles.dateTimeItem}>
              <MaterialIcons name="timer" size={16} color={isDark ? '#aaa' : '#666'} style={styles.dateTimeIcon} />
              <ThemedText style={[styles.dateTimeText, isDark && { color: '#aaa' }]}>{contest?.duration} min</ThemedText>
            </View>
          </View>
        </ThemedView>
        
        <ThemedView style={[styles.statsContainer, isDark && { backgroundColor: '#1E2A38' }]} backgroundType="card">
          <View style={styles.statItem}>
            <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
            <ThemedText style={[styles.statValue, isDark && { color: '#fff' }]}>₹{contest?.entryFee}</ThemedText>
            <ThemedText style={[styles.statLabel, isDark && { color: '#aaa' }]}>Entry Fee</ThemedText>
          </View>
          
          <View style={[styles.statDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
            <ThemedText style={[styles.statValue, isDark && { color: '#fff' }]}>₹{contest?.prizePool}</ThemedText>
            <ThemedText style={[styles.statLabel, isDark && { color: '#aaa' }]}>Prize Pool</ThemedText>
          </View>
          
          <View style={[styles.statDivider, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          
          <View style={styles.statItem}>
            <MaterialIcons name="people" size={24} color="#3E7BFA" />
            <ThemedText style={[styles.statValue, isDark && { color: '#fff' }]}>{contest?.participants}/{contest?.maxParticipants}</ThemedText>
            <ThemedText style={[styles.statLabel, isDark && { color: '#aaa' }]}>Participants</ThemedText>
          </View>
        </ThemedView>
        
        <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Description</ThemedText>
        
        <ThemedView style={[styles.descriptionContainer, isDark && { backgroundColor: '#1E2A38' }]} backgroundType="card">
          <ThemedText style={[styles.descriptionText, isDark && { color: '#ddd' }]}>{contest?.description}</ThemedText>
          
          <View style={styles.categoryContainer}>
            {contest?.categories && Array.isArray(contest.categories) ? 
              contest.categories.map((category, index) => (
                <View key={index} style={[styles.categoryBadge, isDark && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <ThemedText style={styles.categoryText}>{category}</ThemedText>
                </View>
              )) : null
            }
          </View>
        </ThemedView>
        
        <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Quiz Details</ThemedText>
        
        <ThemedView style={[styles.detailsContainer, isDark && { backgroundColor: '#1E2A38' }]} backgroundType="card">
          <ThemedText style={[styles.rulesTitle, isDark && { color: '#fff' }]}>Rules:</ThemedText>
          
          {contest?.rules && Array.isArray(contest.rules) ? 
            contest.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.ruleIcon} />
                <ThemedText style={[styles.ruleText, isDark && { color: '#ddd' }]}>{rule}</ThemedText>
              </View>
            )) : (
              <ThemedText style={[styles.ruleText, isDark && { color: '#ddd' }]}>No specific rules for this contest.</ThemedText>
            )
          }
        </ThemedView>
        
        <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Prize Distribution</ThemedText>
        
        <ThemedView style={[styles.prizesContainer, isDark && { backgroundColor: '#1E2A38' }]} backgroundType="card">
          {contest?.prizes && contest.prizes.length > 0 ? (
            contest.prizes.map((prize, index) => (
              <View key={index} style={[styles.prizeRow, isDark && { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.rankBadge, { backgroundColor: getTierColor(contest.tier || '', isDark) }]}>
                  <ThemedText style={styles.rankText}>#{prize.rank}</ThemedText>
                </View>
                <ThemedText style={[styles.prizeAmount, isDark && { color: '#fff' }]}>₹{prize.amount}</ThemedText>
              </View>
            ))
          ) : (
            <ThemedText style={[styles.noPrizesText, isDark && { color: '#ddd' }]}>
              Prize information not available.
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
      
      <View style={[styles.bottomBar, isDark && { backgroundColor: '#1E2A38' }]}>
        <View style={styles.entryFeeContainer}>
          <ThemedText style={[styles.entryFeeLabel, isDark && { color: '#aaa' }]}>Entry Fee</ThemedText>
          <ThemedText style={[styles.entryFeeValue, isDark && { color: '#fff' }]}>₹{contest?.entryFee}</ThemedText>
        </View>
        
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: getTierColor(contest?.tier, isDark) }]}
          onPress={handleJoinContest}
        >
          <ThemedText style={styles.joinButtonText}>Join Contest</ThemedText>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  tierBadge: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  tierBadgeInner: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tierText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  contestTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contestCreator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  verifiedIcon: {
    marginRight: 4,
  },
  creatorText: {
    fontSize: 14,
    color: "#555555",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeIcon: {
    marginRight: 4,
  },
  dateTimeText: {
    fontSize: 13,
    color: "#666666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#EEEEEE",
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  descriptionContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444444",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  categoryBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#444444",
  },
  detailsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ruleIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  ruleText: {
    fontSize: 14,
    flex: 1,
    color: "#444444",
  },
  prizesContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 100, // To ensure scroll view content isn't hidden behind bottom bar
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  prizeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  prizeAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noPrizesText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  entryFeeContainer: {
    flex: 1,
  },
  entryFeeLabel: {
    fontSize: 12,
    color: "#666666",
  },
  entryFeeValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  joinButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "#3E7BFA",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 16,
  },
}); 
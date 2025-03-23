import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
  Alert,
  Modal,
  TextInput,
  Animated,
  ImageBackground,
  Switch,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { Header } from '@/components/Header';
import { MaterialIcons } from '@expo/vector-icons';
import { getGlobalLiveUsers } from './index'; // Import getter function for live users
import { useTheme } from '@/app/lib/ThemeContext';

// Define types
interface Contest {
  id: string;
  name: string;
  image?: string;
  date: string;
  time: string;
  duration: number;
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  tier: string;
  createdBy: string;
  status: 'joinable' | 'ongoing' | 'upcoming' | 'completed';
}

// Mock data for contests
const CONTESTS: Contest[] = [
  {
    id: '1',
    name: 'GK Champions 2023',
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b',
    date: '2023-11-25',
    time: '20:00',
    duration: 10,
    entryFee: 100,
    prizePool: 5000,
    participants: 187,
    maxParticipants: 200,
    tier: 'Medium-Stake',
    createdBy: 'Quiz Masters',
    status: 'joinable',
  },
  {
    id: '2',
    name: 'History Quiz Showdown',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1',
    date: '2023-11-26',
    time: '18:30',
    duration: 15,
    entryFee: 50,
    prizePool: 2500,
    participants: 124,
    maxParticipants: 150,
    tier: 'Low-Stake',
    createdBy: 'History Buffs',
    status: 'joinable',
  },
  {
    id: '3',
    name: 'Science & Tech Elite',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
    date: '2023-11-27',
    time: '21:00',
    duration: 12,
    entryFee: 200,
    prizePool: 10000,
    participants: 95,
    maxParticipants: 100,
    tier: 'High-Stake',
    createdBy: 'Tech Innovators',
    status: 'joinable',
  },
  {
    id: '4',
    name: 'Movies Trivia Night',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
    date: '2023-11-28',
    time: '19:00',
    duration: 8,
    entryFee: 75,
    prizePool: 3000,
    participants: 142,
    maxParticipants: 200,
    tier: 'Low-Stake',
    createdBy: 'Cinema Lovers',
    status: 'joinable',
  },
  {
    id: '5',
    name: 'Sports Knowledge Cup',
    image: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402',
    date: '2023-11-29',
    time: '20:30',
    duration: 10,
    entryFee: 150,
    prizePool: 7500,
    participants: 176,
    maxParticipants: 200,
    tier: 'Medium-Stake',
    createdBy: 'Sports Enthusiasts',
    status: 'joinable',
  },
];

// Filter categories
const FILTER_OPTIONS = ['All', 'Low-Stake', 'Medium-Stake', 'High-Stake'];

// Format the live users count to a more compact form (e.g., "1.5k")
// const formatLiveUsers = (count: number): string => {
//   if (count >= 1000) {
//     return `${(count / 1000).toFixed(1)}k`;
//   }
//   return count.toString();
// };

// Add this helper function before the component
const getFilledStyle = (fillPercentage: number) => {
  if (fillPercentage >= 90) {
    return { backgroundColor: '#F44336' }; // Almost full - red
  } else if (fillPercentage >= 60) {
    return { backgroundColor: '#FF9800' }; // Filling up - orange
  } else {
    return { backgroundColor: '#4CAF50' }; // Lots of space - green
  }
};

export default function ContestsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredContests, setFilteredContests] = useState<Contest[]>(CONTESTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContest, setNewContest] = useState({
    name: '',
    entryFee: 10,
    maxParticipants: 5,
  });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [liveUsers, setLiveUsers] = useState(getGlobalLiveUsers());  // Use the getter function
  
  // Enhanced animation for live pulse effect with opacity
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Get theme information
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  
  useEffect(() => {
    // Set up enhanced pulsating animation for live users count
    const pulsate = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.5,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
    
    const fadeInOut = Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulsate).start();
    Animated.loop(fadeInOut).start();
    
    // Get live users from global state with a proper interval
    const interval = setInterval(() => {
      const currentGlobalUsers = getGlobalLiveUsers();
      if (liveUsers !== currentGlobalUsers) {
        setLiveUsers(currentGlobalUsers);
      }
    }, 500); // Check more frequently to stay in sync, but only update when different
    
    return () => clearInterval(interval);
  }, [liveUsers]);

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredContests(CONTESTS);
    } else {
      setFilteredContests(
        CONTESTS.filter((contest) => contest.tier === activeFilter)
      );
    }
  }, [activeFilter]);

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Starting Soon';
    
    const time = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((time.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Starting Soon';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d`;
    }
  };

  const handleJoinContest = (contestId: string) => {
    // Navigate to contest detail screen
    router.push(`/contest/${contestId}` as any);
  };

  const calculatePrizePool = (fee: number, participants: number) => {
    const totalPool = fee * participants;
    const commission = totalPool * 0.1; // 10% commission
    return totalPool - commission;
  };
  
  const distributePrizes = (prizePool: number, maxParticipants: number): { rank: number; prize: number }[] => {
    // If we have less than 3 participants, adjust the distribution
    if (maxParticipants === 1) {
      // Only one player, they get everything
      return [
        { rank: 1, prize: prizePool },
        { rank: 2, prize: 0 },
        { rank: 3, prize: 0 }
      ];
    } else if (maxParticipants === 2) {
      // Only two players, distribute between 1st and 2nd
      const firstPrize = Math.round(prizePool * 0.7); // 70%
      const secondPrize = prizePool - firstPrize; // 30%
      
      return [
        { rank: 1, prize: firstPrize },
        { rank: 2, prize: secondPrize },
        { rank: 3, prize: 0 }
      ];
    } else {
      // Standard distribution for 3+ players
      // Distribution percentages
      const firstPlacePercent = 0.6; // 60%
      const secondPlacePercent = 0.3; // 30%
      
      // For very small prize pools, ensure minimum values
      if (prizePool < 10) {
        return [
          { rank: 1, prize: prizePool > 0 ? prizePool : 0 },
          { rank: 2, prize: 0 },
          { rank: 3, prize: 0 }
        ];
      }
      
      // Calculate prize amounts
      let firstPrize = Math.floor(prizePool * firstPlacePercent);
      let secondPrize = Math.floor(prizePool * secondPlacePercent);
      let thirdPrize = prizePool - firstPrize - secondPrize;
      
      // Ensure minimum values for better display
      if (thirdPrize < 0) {
        thirdPrize = 0;
        // Recalculate first and second prizes
        const remainingPool = prizePool;
        firstPrize = Math.floor(remainingPool * 0.7);
        secondPrize = remainingPool - firstPrize;
      }
      
      return [
        { rank: 1, prize: firstPrize },
        { rank: 2, prize: secondPrize },
        { rank: 3, prize: thirdPrize }
      ];
    }
  };
  
  const handleCreateContest = () => {
    // Generate unique ID
    const newId = String(CONTESTS.length + 1 + Math.floor(Math.random() * 1000));
    
    // Calculate total prize pool after commission
    const totalPool = newContest.entryFee * newContest.maxParticipants;
    const commission = totalPool * 0.1; // 10% commission
    const finalPrizePool = totalPool - commission;
    
    // Calculate prize distribution automatically based on participants
    const prizeDistribution = distributePrizes(finalPrizePool, newContest.maxParticipants);
    
    // Create new contest
    const createdContest: Contest = {
      id: newId,
      name: newContest.name,
      entryFee: newContest.entryFee,
      prizePool: finalPrizePool,
      participants: 1, // Creator is the first participant
      maxParticipants: newContest.maxParticipants,
      tier: newContest.entryFee < 50 ? 'Low-Stake' : newContest.entryFee < 100 ? 'Medium-Stake' : 'High-Stake',
      isPrivate: true,
      winners: prizeDistribution
    };
    
    // Add to contests
    setFilteredContests([createdContest, ...filteredContests]);
    
    // Reset and close modal
    setNewContest({
      name: '',
      entryFee: 10,
      maxParticipants: 5,
    });
    setShowCreateModal(false);
    
    let successMessage = `Your private contest has been created with the following prize distribution:
    
🥇 1st Place Winner: ₹${prizeDistribution[0].prize}`;

    if (prizeDistribution[1].prize > 0) {
      successMessage += `\n🥈 2nd Place Winner: ₹${prizeDistribution[1].prize}`;
    }
    
    if (prizeDistribution[2].prize > 0) {
      successMessage += `\n🥉 3rd Place Winner: ₹${prizeDistribution[2].prize}`;
    }
    
    successMessage += `\n\nYou'll receive notifications when your friends join.`;
    
    // Show success message with prize distribution details
    Alert.alert(
      "Success! 🎉",
      successMessage,
      [{ text: "OK" }]
    );
  };

  const getTierBackgroundColor = (tier: string, isDark = false) => {
    if (tier === "Low-Stake") {
      return isDark ? "#538D22" : "#84CC16";
    } else if (tier === "Medium-Stake") {
      return isDark ? "#0369A1" : "#06B6D4";
    } else {
      return isDark ? "#A92A67" : "#F63880";
    }
  };

  const getTierStyle = (tier: string) => {
    if (isDark) {
      switch(tier) {
        case 'Low-Stake':
          return { backgroundColor: '#1A3B29' }; // Dark green
        case 'Medium-Stake':
          return { backgroundColor: '#3B2E1A' }; // Dark orange
        case 'High-Stake':
          return { backgroundColor: '#3B1A1A' }; // Dark red
        default:
          return {};
      }
    } else {
      switch(tier) {
        case 'Low-Stake':
          return styles.lowStakeTier;
        case 'Medium-Stake':
          return styles.mediumStakeTier;
        case 'High-Stake':
          return styles.highStakeTier;
        default:
          return {};
      }
    }
  };

  const getTierEmoji = (tier: string): string => {
    switch(tier) {
      case 'Low-Stake':
        return '🟢';
      case 'Medium-Stake':
        return '🟠';
      case 'High-Stake':
        return '🔴';
      default:
        return '';
    }
  };

  // Add this function to render the status badge
  const renderStatusBadge = (contest: Contest) => {
    switch (contest.status) {
      case 'joinable':
        return (
          <View style={[styles.statusBadge, styles.statusJoinable]}>
            <MaterialIcons name="play-arrow" size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>Join Now</Text>
          </View>
        );
      case 'ongoing':
        return (
          <View style={[styles.statusBadge, styles.statusOngoing]}>
            <MaterialIcons name="access-time" size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>Ongoing</Text>
          </View>
        );
      case 'upcoming':
        return (
          <View style={[styles.statusBadge, styles.statusUpcoming]}>
            <MaterialIcons name="event" size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>Upcoming</Text>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.statusBadge, styles.statusCompleted]}>
            <MaterialIcons name="check-circle" size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
      <Stack.Screen
        options={{
          title: "Contests",
          headerStyle: {
            backgroundColor: isDark ? '#1E2A38' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight: () => (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <MaterialIcons
                name="add-circle"
                size={24}
                color={isDark ? "#4CAF50" : "#3E7BFA"}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar backgroundColor={isDark ? '#121212' : '#FFFFFF'} barStyle={isDark ? "light-content" : "dark-content"} />

      <SimpleSwipeView>
        <ThemedView style={[styles.container]}>
          <Header 
            title="Contests"
            subtitle="Join quizzes & win prizes!"
            emoji="🏆"
            right={
              <TouchableOpacity style={[styles.liveUsersButton, isDark && { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Animated.View style={[
                  styles.livePulse,
                  { 
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim
                  }
                ]}>
                  <View style={styles.liveIndicator} />
                </Animated.View>
                <ThemedText style={styles.liveText}>{liveUsers} LIVE</ThemedText>
              </TouchableOpacity>
            }
          />
          
          {/* Private Contest Banner */}
          <ThemedView 
            style={[styles.bannerContainer, isDark && styles.bannerContainerDark]} 
            backgroundType="card"
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconContainer}>
                <MaterialIcons name="groups" size={32} color={isDark ? "#4CAF50" : "#4CAF50"} />
              </View>
              <View style={styles.bannerTextContainer}>
                <ThemedText style={[styles.bannerTitle, isDark && { color: '#fff' }]}>Create Your Private Contest!</ThemedText>
                <ThemedText style={[styles.bannerDescription, isDark && { color: '#aaa' }]}>
                  Challenge your friends and family with custom quizzes
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={[styles.bannerButton, isDark && { backgroundColor: '#2E7031' }]}
                onPress={() => setShowCreateModal(true)}
              >
                <ThemedText style={styles.bannerButtonText}>Create</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 20 }}
            removeClippedSubviews={true}
          >
            {/* Tier filter */}
            <View style={styles.filterContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterButtonsContainer}
              >
                {FILTER_OPTIONS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterOption,
                      activeFilter === filter && styles.activeFilterOption,
                      isDark && styles.filterOptionDark,
                      activeFilter === filter && isDark && styles.activeFilterOptionDark
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <ThemedText 
                      style={[
                        styles.filterText,
                        activeFilter === filter && styles.activeFilterText,
                        isDark && { color: '#ddd' },
                        activeFilter === filter && isDark && { color: '#fff' }
                      ]}
                    >
                      {filter}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Contest list */}
            <View style={styles.listContainer}>
              {filteredContests.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <MaterialIcons name="search-off" size={64} color={isDark ? "#666" : "#DDDDDD"} />
                  <ThemedText style={[styles.emptyStateText, isDark && { color: '#aaa' }]}>No contests found</ThemedText>
                  <ThemedText style={[styles.emptyStateSubtext, isDark && { color: '#888' }]}>Try different filters or check back later</ThemedText>
                </View>
              ) : (
                filteredContests.map(contest => (
                  <View
                    style={[styles.card, { borderColor: isDark ? '#333' : '#e0e0e0' }]}
                    key={contest.id}
                  >
                    <ImageBackground
                      source={{ uri: contest.image }}
                      style={styles.cardImage}
                      imageStyle={styles.cardImageStyle}
                    >
                      <ThemedView style={[styles.cardImageOverlay, isDark && { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                        <View style={styles.tierContainer}>
                          {getTierEmoji(contest.tier)} <ThemedText style={styles.tierText}>{contest.tier}</ThemedText>
                        </View>
                      </ThemedView>
                    </ImageBackground>

                    <ThemedView style={styles.cardContent}>
                      <ThemedView style={styles.cardHeader}>
                        <ThemedView style={styles.cardTitleContainer}>
                          <ThemedText style={styles.cardTitle}>{contest.name}</ThemedText>
                          {renderStatusBadge(contest)}
                        </ThemedView>
                        <ThemedText style={styles.cardCreator}>By {contest.createdBy}</ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.cardDetails}>
                        <ThemedView style={styles.cardDetailsRow}>
                          <ThemedText style={styles.cardDetailsLabel}>Prize Pool</ThemedText>
                          <ThemedText style={styles.cardDetailsValue}>₹{contest.prizePool}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.cardDetailsRow}>
                          <ThemedText style={styles.cardDetailsLabel}>Entry Fee</ThemedText>
                          <ThemedText style={styles.cardDetailsValue}>₹{contest.entryFee}</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.cardDetailsRow}>
                          <ThemedText style={styles.cardDetailsLabel}>Players</ThemedText>
                          <ThemedText style={styles.cardDetailsValue}>{contest.participants}/{contest.maxParticipants}</ThemedText>
                        </ThemedView>
                      </ThemedView>

                      <ThemedView style={styles.cardFooter}>
                        <ThemedView style={styles.progressContainer}>
                          <ThemedView style={styles.progressBar}>
                            <ThemedView 
                              style={[
                                styles.progressFill, 
                                { width: `${(contest.participants / contest.maxParticipants) * 100}%` },
                                getFilledStyle((contest.participants / contest.maxParticipants) * 100)
                              ]} 
                            />
                          </ThemedView>
                          <ThemedView style={styles.progressNumbers}>
                            <ThemedText style={styles.progressText}>
                              {contest.participants}/{contest.maxParticipants}
                            </ThemedText>
                          </ThemedView>
                        </ThemedView>

                        <TouchableOpacity 
                          style={[
                            styles.joinContestButton, 
                            { backgroundColor: contest.status === 'joinable' ? Colors.primary : '#9e9e9e' }
                          ]}
                          onPress={() => handleJoinContest(contest.id)}
                          disabled={contest.status !== 'joinable'}
                        >
                          <ThemedText style={styles.joinButtonText}>
                            {contest.status === 'joinable' ? 'Join Now' : 'View Details'}
                          </ThemedText>
                        </TouchableOpacity>
                      </ThemedView>
                    </ThemedView>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </SimpleSwipeView>

      {/* Create Contest Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
            <ThemedView style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <ThemedText style={[styles.modalHeaderText, isDark && { color: '#fff' }]}>Create Private Contest</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </ThemedView>
            
            <ScrollView style={styles.modalBody}>
              <ThemedText style={[styles.inputLabel, isDark && { color: '#fff' }]}>Contest Name</ThemedText>
              <TextInput
                style={[styles.textInput, isDark && styles.textInputDark]}
                value={newContest.name}
                onChangeText={(text) => setNewContest({...newContest, name: text})}
                placeholder="e.g. Family Quiz Night"
                placeholderTextColor={isDark ? "#777" : "#999"}
                color={isDark ? "#fff" : "#333"}
              />
              
              <ThemedText style={[styles.inputLabel, isDark && { color: '#fff' }]}>Entry Fee (₹)</ThemedText>
              <TextInput
                style={[styles.textInput, isDark && styles.textInputDark]}
                value={String(newContest.entryFee)}
                onChangeText={(text) => {
                  const fee = parseInt(text) || 0;
                  setNewContest({...newContest, entryFee: fee});
                }}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={isDark ? "#777" : "#999"}
                color={isDark ? "#fff" : "#333"}
              />
              
              <ThemedText style={[styles.inputLabel, isDark && { color: '#fff' }]}>Max Players</ThemedText>
              <TextInput
                style={[styles.textInput, isDark && styles.textInputDark]}
                value={String(newContest.maxParticipants)}
                onChangeText={(text) => {
                  const participants = parseInt(text) || 0;
                  setNewContest({...newContest, maxParticipants: participants});
                }}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor={isDark ? "#777" : "#999"}
                color={isDark ? "#fff" : "#333"}
              />

              <ThemedText style={[styles.inputLabel, isDark && { color: '#fff' }]}>Prize Distribution</ThemedText>
              <ThemedView style={[styles.prizeDistributionInfo, isDark && styles.prizeDistributionInfoDark]} backgroundType="card">
                {/* Calculate prize distribution preview */}
                {(() => {
                  const totalPool = newContest.entryFee * newContest.maxParticipants;
                  const finalPool = calculatePrizePool(newContest.entryFee, newContest.maxParticipants);
                  const distribution = distributePrizes(finalPool, newContest.maxParticipants);
                  
                  // Helper function to format prize percentage text
                  const getPrizePercentText = (index: number) => {
                    if (newContest.maxParticipants === 1) {
                      return index === 0 ? '(100%)' : '(0%)';
                    } else if (newContest.maxParticipants === 2) {
                      return index === 0 ? '(70%)' : index === 1 ? '(30%)' : '(0%)';
                    } else {
                      return index === 0 ? '(60%)' : index === 1 ? '(30%)' : '(10%)';
                    }
                  };
                  
                  return (
                    <>
                      <View style={styles.prizeItem}>
                        <View style={styles.rankBadge}>
                          <ThemedText style={styles.rankText}>1</ThemedText>
                        </View>
                        <View style={styles.prizeInfoContainer}>
                          <ThemedText style={[styles.prizeTitle, isDark && { color: '#fff' }]}>🥇 1st Place Winner</ThemedText>
                          <View style={styles.prizeValueContainer}>
                            <ThemedText style={[styles.prizeAmount, isDark && { color: '#fff' }]}>₹{distribution[0].prize}</ThemedText>
                            <ThemedText style={[styles.prizePercent, isDark && { color: '#aaa' }]}>{getPrizePercentText(0)}</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      {(newContest.maxParticipants > 1) && (
                        <View style={styles.prizeItem}>
                          <View style={[styles.rankBadge, styles.secondRank]}>
                            <ThemedText style={styles.rankText}>2</ThemedText>
                          </View>
                          <View style={styles.prizeInfoContainer}>
                            <ThemedText style={[styles.prizeTitle, isDark && { color: '#fff' }]}>🥈 2nd Place Winner</ThemedText>
                            <View style={styles.prizeValueContainer}>
                              <ThemedText style={[styles.prizeAmount, isDark && { color: '#fff' }]}>₹{distribution[1].prize}</ThemedText>
                              <ThemedText style={[styles.prizePercent, isDark && { color: '#aaa' }]}>{getPrizePercentText(1)}</ThemedText>
                            </View>
                          </View>
                        </View>
                      )}
                      
                      {(newContest.maxParticipants > 2) && (
                        <View style={styles.prizeItem}>
                          <View style={[styles.rankBadge, styles.thirdRank]}>
                            <ThemedText style={styles.rankText}>3</ThemedText>
                          </View>
                          <View style={styles.prizeInfoContainer}>
                            <ThemedText style={[styles.prizeTitle, isDark && { color: '#fff' }]}>🥉 3rd Place Winner</ThemedText>
                            <View style={styles.prizeValueContainer}>
                              <ThemedText style={[styles.prizeAmount, isDark && { color: '#fff' }]}>₹{distribution[2].prize}</ThemedText>
                              <ThemedText style={[styles.prizePercent, isDark && { color: '#aaa' }]}>{getPrizePercentText(2)}</ThemedText>
                            </View>
                          </View>
                        </View>
                      )}
                    </>
                  );
                })()}
              </ThemedView>
              
              <ThemedView style={[styles.infoBox, isDark && styles.infoBoxDark]} backgroundType="card">
                <MaterialIcons name="info" size={20} color={isDark ? "#4CAF50" : "#4CAF50"} style={styles.infoIcon} />
                <ThemedText style={[styles.infoText, isDark && { color: '#ddd' }]}>
                  Total Pool: ₹{newContest.entryFee * newContest.maxParticipants}{'\n'}
                  10% Commission: ₹{newContest.entryFee * newContest.maxParticipants * 0.1}{'\n'}
                  Final Prize Pool: ₹{calculatePrizePool(newContest.entryFee, newContest.maxParticipants)}
                </ThemedText>
              </ThemedView>
            </ScrollView>
            
            <ThemedView style={[styles.modalFooter, isDark && styles.modalFooterDark]}>
              <TouchableOpacity 
                style={[styles.createContestButton, isDark && { backgroundColor: '#2E7031' }]}
                onPress={handleCreateContest}
                disabled={!newContest.name || newContest.entryFee <= 0 || newContest.maxParticipants <= 1}
              >
                <ThemedText style={styles.createContestButtonText}>Create Contest</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
      
      {/* Join Private Contest Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showJoinModal}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
            <ThemedView style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <ThemedText style={[styles.modalHeaderText, isDark && { color: '#fff' }]}>Join Private Contest</ThemedText>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </ThemedView>
            
            <View style={styles.modalBody}>
              <ThemedText style={[styles.inputLabel, isDark && { color: '#fff' }]}>Enter Share Code</ThemedText>
              <TextInput
                style={[styles.textInput, isDark && styles.textInputDark]}
                value={shareCode}
                onChangeText={setShareCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDark ? "#777" : "#999"}
                color={isDark ? "#fff" : "#333"}
              />
              
              <TouchableOpacity 
                style={[styles.createContestButton, isDark && { backgroundColor: '#1565C0' }]}
                onPress={() => {
                  // Logic to join with code
                  setShowJoinModal(false);
                  setShareCode('');
                }}
              >
                <ThemedText style={styles.createContestButtonText}>Join Contest</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'column',
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 8,
  },
  createFabButton: {
    backgroundColor: '#4CAF50',
  },
  joinFabButton: {
    backgroundColor: '#2196F3',
  },
  fabText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerContainer: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  bannerContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  bannerIconContainer: {
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerDescription: {
    fontSize: 12,
    color: '#666',
  },
  bannerButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  filterButtonsContainer: {
    paddingHorizontal: 12,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  filterOptionDark: {
    backgroundColor: '#333',
  },
  activeFilterOption: {
    backgroundColor: Colors.primary,
  },
  activeFilterOptionDark: {
    backgroundColor: '#2E7031',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  privateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  privateBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tierAndNameContainer: {
    flex: 1,
  },
  contestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  lowStakeTier: {
    backgroundColor: '#E8F5E9',
  },
  mediumStakeTier: {
    backgroundColor: '#FFF3E0',
  },
  highStakeTier: {
    backgroundColor: '#FFEBEE',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '500',
  },
  middleRow: {
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
  },
  statsContainerDark: {
    backgroundColor: '#333',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  statDividerDark: {
    backgroundColor: '#666',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 15,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  textInputDark: {
    borderColor: '#444',
    color: '#fff',
    backgroundColor: '#222',
  },
  prizeDistributionInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700', // Gold for 1st
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  secondRank: {
    backgroundColor: '#C0C0C0', // Silver for 2nd
  },
  thirdRank: {
    backgroundColor: '#CD7F32', // Bronze for 3rd
  },
  rankText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  prizeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  prizePercent: {
    fontSize: 14,
    color: '#666',
  },
  createContestButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createContestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  prizeInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  liveUsersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  livePulse: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  filterOptionDark: {
    backgroundColor: '#333',
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextDark: {
    color: '#ccc',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  participantsBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  participantsBarDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  participantsFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },
  participantsFillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tierBadgeDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tierTextDark: {
    color: '#fff',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderDark: {
    borderBottomColor: '#333',
  },
  bannerContainerDark: {
    backgroundColor: '#1E2A38',
  },
  filterButtonDark: {
    backgroundColor: '#333',
  },
  filterButtonActiveDark: {
    backgroundColor: Colors.primary,
  },
  filterTextDark: {
    color: '#ccc',
  },
  prizeDistributionInfoDark: {
    backgroundColor: '#222',
  },
  infoBoxDark: {
    backgroundColor: '#1A3B29',
  },
  modalFooterDark: {
    borderTopColor: '#333',
  },
  createButton: {
    marginRight: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusJoinable: {
    backgroundColor: '#4CAF50',
  },
  statusOngoing: {
    backgroundColor: '#FF9800',
  },
  statusUpcoming: {
    backgroundColor: '#2196F3',
  },
  statusCompleted: {
    backgroundColor: '#757575',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  cardImage: {
    height: 120,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  cardImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardImageOverlay: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardCreator: {
    fontSize: 12,
    color: '#757575',
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardDetailsLabel: {
    fontSize: 13,
    color: '#757575',
  },
  cardDetailsValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressNumbers: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
  },
  joinContestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 
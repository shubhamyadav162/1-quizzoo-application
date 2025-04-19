import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Text,
  Share,
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedStatusBar from '@/components/ThemedStatusBar';
import { Colors } from '@/constants/Colors';

// Define a variety of avatar images to use
const AVATARS = {
  user: require('../assets/images/craiyon_203413_transparent.png'),
  player1: require('../assets/images/buffalo-icon.png'),
  player2: require('../assets/images/buffalo-icon.png'),
  player3: require('../assets/images/buffalo-icon.png')
};

// Helper function to get an avatar based on player
const getAvatarForPlayer = (player: PlayerPerformance) => {
  if (player.isUser) {
    return AVATARS.user;
  }
  
  // Create some variety by using player id to select different avatars
  const avatarIndex = (player.id % 3) + 1;
  const avatarKey = `player${avatarIndex}` as keyof typeof AVATARS;
  return AVATARS[avatarKey];
};

// Format time with milliseconds
const formatTimeWithMs = (ms: number): string => {
  if (!ms || isNaN(ms) || ms <= 0) return '0.000s';
  
  // Fix: Ensure we have a valid number and cap at a reasonable maximum to prevent display issues
  const cappedMs = Math.min(Math.round(ms), 999999); // Cap at 999.999 seconds
  
  const seconds = Math.floor(cappedMs / 1000);
  const milliseconds = cappedMs % 1000;
  
  // Format with leading zeros for milliseconds and limit to 3 digits
  return `${seconds}.${milliseconds.toString().padStart(3, '0').substring(0, 3)}s`;
};

// Define interface for performance details for each question
interface QuestionPerformance {
  questionNumber: number;
  timeSpent: number;
  isCorrect: boolean;
  pointsEarned: number;
  responseTimeMs?: number; // Exact response time in milliseconds
}

interface PlayerPerformance {
  id: number;
  name: string;
  score: number;
  correctAnswers: number;
  totalTimeSpent: number;
  avgTime: string;
  isUser?: boolean;
  questionPerformance: QuestionPerformance[];
  earnedAmount?: number;
  avgTimeMs?: number; // Average response time in milliseconds for tie-breaking
  totalResponseTimeMs?: number; // Total response time in milliseconds
}

interface WinningScreenProps {
  totalQuestions?: number;
  players?: PlayerPerformance[];
  onBackToHome?: () => void;
  score: number;
  questionPerformance: QuestionPerformance[];
  contest: any;
  onPlayAgain: () => void;
  onExit: () => void;
}

const WinningScreen = ({ 
  totalQuestions = 10, 
  players = [], 
  onBackToHome,
  score,
  questionPerformance,
  contest,
  onPlayAgain,
  onExit
}: WinningScreenProps) => {
  const { isDark } = useTheme();
  const [showPerformance, setShowPerformance] = useState(false);
  
  // Use either provided players or create a simple one with user performance
  const actualPlayers = players.length > 0 ? players : [{
    id: 1,
    name: "You",
    score: score,
    correctAnswers: questionPerformance.filter(q => q.isCorrect).length,
    totalTimeSpent: questionPerformance.reduce((sum, q) => sum + q.timeSpent, 0),
    avgTime: (questionPerformance.reduce((sum, q) => sum + q.timeSpent, 0) / questionPerformance.length).toFixed(1) + 's',
    avgTimeMs: questionPerformance.reduce((sum, q) => sum + q.timeSpent, 0) / questionPerformance.length,
    totalResponseTimeMs: questionPerformance.reduce((sum, q) => sum + q.timeSpent, 0),
    isUser: true,
    questionPerformance: questionPerformance,
    earnedAmount: (contest?.prizePool || 0) / 10 // Simple calculation for demo
  }];
  
  const userPlayer = actualPlayers.find(player => player.isUser) || actualPlayers[0];
  const userRank = actualPlayers.findIndex(player => player.isUser) + 1;
  
  // Sort players by score (highest first) and then by avgTime (lowest first)
  const sortedPlayers = [...actualPlayers].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    
    // Use millisecond precision if available
    if (a.avgTimeMs !== undefined && b.avgTimeMs !== undefined) {
      return a.avgTimeMs - b.avgTimeMs;
    }
    
    // Fallback to string-based avgTime
    return parseFloat(a.avgTime) - parseFloat(b.avgTime);
  });

  // Calculate user won prize money
  const userWonMoney = userRank <= 3 && userPlayer.earnedAmount && userPlayer.earnedAmount > 0;
  const podiumPlayers = sortedPlayers.slice(0, 3);

  // Process player data to ensure reasonable time values for display
  const processedPlayers = sortedPlayers.map(player => ({
    ...player,
    displayAvgTimeMs: Math.min(player.avgTimeMs || 0, 999999),
    displayTotalTimeMs: Math.min(player.totalTimeSpent || 0, 9999999)
  }));

  const shareGameInvite = async () => {
    try {
      const result = await Share.share({
        message: `Hey, I just scored ${score} points in Quizzoo! Join me and see if you can beat my score! Download the app now: https://quizzoo.app/invite/${userPlayer.id}`,
        title: 'Join me on Quizzoo!'
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#f7f7f7' }
      ]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: 10 }
      ]}
    >
      <ThemedStatusBar 
        backgroundColor={isDark ? Colors.dark.background : Colors.light.background}
        translucent={false}
      />
      
      {/* Animated confetti background for winners */}
      {userWonMoney && (
        <Animatable.View 
          animation="fadeIn" 
          style={styles.confettiBackground}
        >
          <View style={styles.confettiOverlay}>
            <Animatable.View animation="slideInDown" duration={2000} iterationCount="infinite" style={[styles.confetti, {left: '10%', top: '5%'}]}>
              <MaterialIcons name="celebration" size={30} color="#FFD700" />
            </Animatable.View>
            <Animatable.View animation="slideInDown" duration={2400} iterationCount="infinite" style={[styles.confetti, {left: '25%', top: '2%'}]}>
              <MaterialIcons name="celebration" size={20} color="#2196F3" />
            </Animatable.View>
            <Animatable.View animation="slideInDown" duration={2800} iterationCount="infinite" style={[styles.confetti, {left: '40%', top: '7%'}]}>
              <MaterialIcons name="celebration" size={25} color="#4CAF50" />
            </Animatable.View>
            <Animatable.View animation="slideInDown" duration={2200} iterationCount="infinite" style={[styles.confetti, {left: '70%', top: '3%'}]}>
              <MaterialIcons name="celebration" size={22} color="#FF5722" />
            </Animatable.View>
            <Animatable.View animation="slideInDown" duration={2600} iterationCount="infinite" style={[styles.confetti, {left: '85%', top: '6%'}]}>
              <MaterialIcons name="celebration" size={28} color="#E91E63" />
            </Animatable.View>
          </View>
        </Animatable.View>
      )}
      
      <Animatable.View 
        animation="fadeIn" 
        duration={800}
        style={styles.header}
      >
        <LinearGradient
          colors={isDark ? ['#1A56DB', '#3B82F6'] : ['#4A6BFF', '#2196F3']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ThemedText 
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Game Results
          </ThemedText>
          <ThemedText 
            style={styles.subtitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {totalQuestions} Questions • {formatTimeWithMs(userPlayer.totalTimeSpent)} Total Time
          </ThemedText>
        </LinearGradient>
      </Animatable.View>
      
      {/* Prize announcement for winners */}
      {userWonMoney && (
        <Animatable.View 
          animation="bounceIn" 
          duration={1200}
          delay={300}
          style={styles.prizeAnnouncement}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA000']}
            style={styles.prizeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.prizeContent}>
              <FontAwesome5 name="trophy" size={24} color="#fff" />
              <ThemedText style={styles.prizeText}>
                You Won ₹{userPlayer.earnedAmount}!
              </ThemedText>
            </View>
          </LinearGradient>
        </Animatable.View>
      )}
      
      {/* Message for players who didn't win any money */}
      {!userWonMoney && (
        <Animatable.View 
          animation="fadeIn" 
          duration={1000}
          delay={300}
          style={[
            styles.noWinMessage,
            {
              backgroundColor: isDark ? 'rgba(50, 50, 50, 0.5)' : 'rgba(240, 240, 240, 0.7)',
              borderColor: isDark ? 'rgba(80, 80, 80, 0.5)' : 'rgba(200, 200, 200, 0.5)'
            }
          ]}
        >
          <ThemedText style={styles.noWinTitle}>
            Better luck next time!
          </ThemedText>
          <ThemedText style={styles.noWinSubtitle}>
            Keep practicing and you'll improve your score. Try again to win exciting prizes!
          </ThemedText>
        </Animatable.View>
      )}
      
      {/* Podium for top 3 players */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={800}
        delay={500}
        style={styles.podiumContainer}
      >
        {podiumPlayers.length >= 3 && (
          <View style={styles.podium}>
            {/* 2nd Place */}
            <View style={[styles.podiumPillar, styles.secondPlace]}>
              <View style={[
                styles.podiumAvatar,
                { borderColor: isDark ? '#E0E0E0' : '#FFC107' }
              ]}>
                <Image
                  source={getAvatarForPlayer(podiumPlayers[1])}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>
              <LinearGradient
                colors={isDark ? ['#444', '#333'] : ['#E6E6E6', '#D0D0D0']}
                style={styles.nameBadge}
              >
                <ThemedText style={styles.podiumPlayerName} numberOfLines={1}>
                  {podiumPlayers[1].name}
                </ThemedText>
              </LinearGradient>
              <ThemedText style={[styles.podiumScore, { color: isDark ? '#E0E0E0' : '#333' }]}>
                {podiumPlayers[1].score}
              </ThemedText>
              {podiumPlayers[1].earnedAmount && (
                <View style={[
                  styles.podiumPrize,
                  { 
                    backgroundColor: isDark ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.7)',
                    borderColor: isDark ? 'rgba(70,70,70,0.5)' : 'rgba(220,220,220,0.8)'
                  }
                ]}>
                  <MaterialIcons name="attach-money" size={14} color={isDark ? '#C0C0C0' : '#757575'} />
                  <ThemedText style={[styles.podiumPrizeText, { color: isDark ? '#C0C0C0' : '#757575' }]}>
                    {podiumPlayers[1].earnedAmount}
                  </ThemedText>
                </View>
              )}
              <LinearGradient
                colors={isDark ? ['#A0A0A0', '#707070'] : ['#C0C0C0', '#A0A0A0']}
                style={styles.podiumBlock}
              />
            </View>
            
            {/* 1st Place */}
            <View style={[styles.podiumPillar, styles.firstPlace]}>
              <View style={[
                styles.podiumAvatar, 
                styles.firstPlaceAvatar,
                { borderColor: isDark ? '#FFD700' : '#FFD700' }
              ]}>
                <Image
                  source={getAvatarForPlayer(podiumPlayers[0])}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <View style={[
                  styles.crownContainer, 
                  { backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(0,0,0,0.5)' }
                ]}>
                  <FontAwesome5 name="crown" size={15} color="#FFD700" />
                </View>
              </View>
              <LinearGradient
                colors={isDark ? ['#444', '#333'] : ['#E6E6E6', '#D0D0D0']}
                style={styles.nameBadge}
              >
                <ThemedText style={styles.podiumPlayerName} numberOfLines={1}>
                  {podiumPlayers[0].name}
                </ThemedText>
              </LinearGradient>
              <ThemedText style={[
                styles.podiumScore, 
                styles.firstPlaceScore,
                { color: isDark ? '#FFD700' : '#DAA520' }
              ]}>
                {podiumPlayers[0].score}
              </ThemedText>
              {podiumPlayers[0].earnedAmount && (
                <View style={[
                  styles.podiumPrize,
                  { 
                    backgroundColor: isDark ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.7)',
                    borderColor: isDark ? 'rgba(70,70,70,0.5)' : 'rgba(220,220,220,0.8)'
                  }
                ]}>
                  <MaterialIcons name="attach-money" size={14} color={isDark ? '#FFD700' : '#FFD700'} />
                  <ThemedText style={[styles.podiumPrizeText, { color: isDark ? '#FFD700' : '#DAA520' }]}>
                    {podiumPlayers[0].earnedAmount}
                  </ThemedText>
                </View>
              )}
              <LinearGradient
                colors={isDark ? ['#DAA520', '#B8860B'] : ['#FFD700', '#FFC107']}
                style={[styles.podiumBlock, styles.firstPlaceBlock]}
              />
            </View>
            
            {/* 3rd Place */}
            <View style={[styles.podiumPillar, styles.thirdPlace]}>
              <View style={[
                styles.podiumAvatar,
                { borderColor: isDark ? '#CD7F32' : '#CD7F32' }
              ]}>
                <Image
                  source={getAvatarForPlayer(podiumPlayers[2])}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>
              <LinearGradient
                colors={isDark ? ['#444', '#333'] : ['#E6E6E6', '#D0D0D0']}
                style={styles.nameBadge}
              >
                <ThemedText style={styles.podiumPlayerName} numberOfLines={1}>
                  {podiumPlayers[2].name}
                </ThemedText>
              </LinearGradient>
              <ThemedText style={[
                styles.podiumScore,
                { color: isDark ? '#E0E0E0' : '#333' }
              ]}>
                {podiumPlayers[2].score}
              </ThemedText>
              {podiumPlayers[2].earnedAmount && (
                <View style={[
                  styles.podiumPrize,
                  { 
                    backgroundColor: isDark ? 'rgba(40,40,40,0.7)' : 'rgba(255,255,255,0.7)',
                    borderColor: isDark ? 'rgba(70,70,70,0.5)' : 'rgba(220,220,220,0.8)'
                  }
                ]}>
                  <MaterialIcons name="attach-money" size={14} color={isDark ? '#CD7F32' : '#CD7F32'} />
                  <ThemedText style={[styles.podiumPrizeText, { color: isDark ? '#CD7F32' : '#8B4513' }]}>
                    {podiumPlayers[2].earnedAmount}
                  </ThemedText>
                </View>
              )}
              <LinearGradient
                colors={isDark ? ['#8B4513', '#A0522D'] : ['#CD7F32', '#B87333']}
                style={styles.podiumBlock}
              />
            </View>
          </View>
        )}
      </Animatable.View>
      
      {/* User Performance Card */}
      <Animatable.View 
        animation="zoomIn" 
        duration={1000}
        delay={300}
      >
        <ThemedView style={[
          styles.userPerformanceCard,
          isDark ? {
            backgroundColor: '#1a1a1a',
            borderColor: 'rgba(70, 70, 70, 0.5)',
            borderWidth: 1
          } : {
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }
        ]}>
          <View style={styles.userPerformanceHeader}>
            <View style={[
              styles.rankContainer,
              { 
                backgroundColor: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 215, 0, 0.2)',
                borderColor: isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.5)'
              }
            ]}>
              <ThemedText style={[
                styles.rankText,
                { color: isDark ? '#FFD700' : '#CC9900' }
              ]}>
                {userRank <= 3 ? 
                  (userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : '🥉') : 
                  `#${userRank}`
                }
              </ThemedText>
            </View>
            
            <View style={styles.userInfoContainer}>
              <ThemedText style={[
                styles.userName,
                { color: isDark ? '#E0E0E0' : '#333' }
              ]}>
                {userPlayer.name} {userPlayer.isUser && "(You)"}
              </ThemedText>
              {userPlayer.earnedAmount !== undefined && (
                <View style={styles.bonusContainer}>
                  <MaterialIcons 
                    name="attach-money" 
                    size={16} 
                    color={isDark ? "#64D2A0" : "#4CAF50"} 
                  />
                  <ThemedText style={[
                    styles.bonusText,
                    { color: isDark ? '#64D2A0' : '#4CAF50' }
                  ]}>
                    {userRank <= 3 ? `+₹${userPlayer.earnedAmount}` : '₹0'} {userRank <= 3 ? 'Bonus' : 'No Bonus'}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          
          <View style={[
            styles.statsGrid,
            { borderBottomColor: isDark ? 'rgba(150, 150, 150, 0.1)' : 'rgba(150, 150, 150, 0.2)' }
          ]}>
            <StatisticItem 
              value={userPlayer.score} 
              label="Score" 
              icon="stars"
              color={isDark ? "#FFD700" : "#FFD700"}
              isDark={isDark}
            />
            <StatisticItem 
              value={`${userPlayer.correctAnswers}/${totalQuestions}`} 
              label="Correct" 
              icon="check-circle"
              color={isDark ? "#4ade80" : "#4CAF50"}
              isDark={isDark}
            />
            <StatisticItem
              value={userPlayer.avgTime}
              label="Avg. Time"
              icon="timer"
              color={isDark ? "#60a5fa" : "#3b82f6"}
              isDark={isDark}
            />
          </View>
          
          {/* Collapsible Question Performance */}
          <TouchableOpacity 
            style={styles.collapsibleHeader}
            onPress={() => setShowPerformance(!showPerformance)}
          >
            <ThemedText style={styles.sectionTitle}>Question Performance</ThemedText>
            <MaterialIcons 
              name={showPerformance ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={isDark ? "#fff" : "#333"} 
            />
          </TouchableOpacity>
          
          {showPerformance && (
            <View style={styles.compactQuestionsGrid}>
              {userPlayer.questionPerformance.map((qPerf) => (
                <View 
                  key={qPerf.questionNumber} 
                  style={[
                    styles.questionBubble,
                    qPerf.isCorrect 
                      ? (isDark 
                          ? styles.correctBubbleDark 
                          : styles.correctBubbleLight) 
                      : (isDark 
                          ? styles.incorrectBubbleDark 
                          : styles.incorrectBubbleLight)
                  ]}
                >
                  <View style={styles.questionContent}>
                    <ThemedText style={[
                      styles.questionNumber,
                      { color: isDark ? '#fff' : '#333' }
                    ]}>
                      {qPerf.questionNumber}
                    </ThemedText>
                    <ThemedText style={[
                      styles.questionTime,
                      { 
                        color: isDark 
                          ? (qPerf.isCorrect ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)') 
                          : (qPerf.isCorrect ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)')
                      }
                    ]}>
                      {formatTimeWithMs(qPerf.timeSpent)}
                    </ThemedText>
                    {qPerf.isCorrect && (
                      <ThemedText style={[
                        styles.questionPoints,
                        { color: isDark ? '#FFD700' : '#996515' }
                      ]}>
                        +{qPerf.pointsEarned}
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </Animatable.View>
      
      {/* Enhanced Leaderboard */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={800}
        delay={600}
      >
        <ThemedView style={[
          styles.leaderboardContainer,
          isDark ? {
            backgroundColor: '#1a1a1a',
            borderColor: 'rgba(70, 70, 70, 0.5)',
            borderWidth: 1
          } : {
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4
          }
        ]}>
          <ThemedText style={styles.sectionTitle}>Leaderboard</ThemedText>
          
          {processedPlayers.map((player, index) => (
            <ThemedView 
              key={player.id}
              style={[
                styles.leaderboardRow,
                player.isUser && styles.currentUserRow,
                isDark ? {
                  borderBottomColor: 'rgba(80, 80, 80, 0.2)'
                } : {
                  borderBottomColor: 'rgba(200, 200, 200, 0.3)'
                },
                index === processedPlayers.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <View style={[
                styles.leaderboardRank,
                index < 3 ? styles.topThreeRank : {}
              ]}>
                <View style={[
                  styles.profileImageContainer,
                  { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
                ]}>
                  <Image 
                    source={getAvatarForPlayer(player)}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  {index < 3 && (
                    <View style={[
                      styles.medalBadge,
                      { backgroundColor: isDark ? '#1a1a1a' : '#fff' }
                    ]}>
                      <ThemedText style={styles.medalText}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.leaderboardNameContainer}>
                <ThemedText style={[
                  styles.leaderboardName,
                  player.isUser && styles.currentUserText
                ]}>
                  {player.name} {player.isUser && "(You)"}
                </ThemedText>
                <View style={styles.statsPills}>
                  <View style={[
                    styles.statPill,
                    { 
                      backgroundColor: isDark ? 'rgba(80,80,80,0.4)' : 'rgba(230,230,230,0.8)',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(100,100,100,0.3)' : 'rgba(210,210,210,0.8)'
                    }
                  ]}>
                    <MaterialIcons name="check" size={14} color={isDark ? "#4ade80" : "#4CAF50"} />
                    <ThemedText style={[
                      styles.statPillText,
                      { color: isDark ? "#e0e0e0" : "#333" }
                    ]}>
                      {player.correctAnswers}
                    </ThemedText>
                  </View>
                  <View style={[
                    styles.statPill,
                    { 
                      backgroundColor: isDark ? 'rgba(80,80,80,0.4)' : 'rgba(230,230,230,0.8)',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(100,100,100,0.3)' : 'rgba(210,210,210,0.8)'
                    }
                  ]}>
                    <MaterialIcons name="timer" size={14} color={isDark ? "#60a5fa" : "#2196F3"} />
                    <ThemedText style={[
                      styles.statPillText,
                      { color: isDark ? "#e0e0e0" : "#333" }
                    ]}>
                      {player.avgTime}
                    </ThemedText>
                  </View>
                </View>
              </View>
              
              <View style={styles.leaderboardScore}>
                <ThemedText style={[
                  styles.scoreText, 
                  { color: isDark ? (player.isUser ? '#3B82F6' : '#e0e0e0') : (player.isUser ? '#3B82F6' : '#333') }
                ]}>
                  {player.score}
                </ThemedText>
                <View style={styles.miniStats}>
                  <ThemedText style={[
                    styles.miniTimeText,
                    { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }
                  ]}>
                    {formatTimeWithMs(player.displayTotalTimeMs)}
                  </ThemedText>
                  {index < 3 && player.earnedAmount && player.earnedAmount > 0 && (
                    <View style={styles.miniBonus}>
                      <MaterialIcons 
                        name="attach-money" 
                        size={12} 
                        color={isDark ? "#64D2A0" : "#4CAF50"} 
                      />
                      <ThemedText style={[
                        styles.miniBonusText, 
                        { color: isDark ? "#64D2A0" : "#4CAF50" }
                      ]}>
                        {player.earnedAmount}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </ThemedView>
          ))}
        </ThemedView>
      </Animatable.View>
      
      {/* Social sharing section */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={800}
        style={styles.socialSection}
      >
        <View style={styles.socialHeader}>
          <ThemedText style={styles.socialTitle}>Share Your Score</ThemedText>
        </View>
        
        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={[
              styles.socialButton, 
              styles.whatsappButton,
              { opacity: isDark ? 0.9 : 1 }
            ]} 
            onPress={shareGameInvite}
          >
            <FontAwesome5 name="whatsapp" size={18} color="#FFFFFF" />
            <ThemedText style={styles.socialButtonText}>WhatsApp</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.socialButton, 
              styles.inviteButton,
              { opacity: isDark ? 0.9 : 1 }
            ]} 
            onPress={shareGameInvite}
          >
            <Ionicons name="people" size={18} color="#FFFFFF" />
            <ThemedText style={styles.socialButtonText}>Invite Friends</ThemedText>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      
      {/* Action Buttons */}
      <Animatable.View
        animation="fadeIn"
        duration={600}
        delay={1000}
        style={styles.actionButtons}
      >
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.homeButton,
            { opacity: isDark ? 0.85 : 1 }
          ]} 
          onPress={onExit}
        >
          <MaterialIcons name="home" size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Home</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.playAgainButton,
            { opacity: isDark ? 0.9 : 1 }
          ]} 
          onPress={onPlayAgain}
        >
          <MaterialIcons name="replay" size={20} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>Play Again</ThemedText>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
};

// Define StatisticItem props
interface StatisticItemProps { 
  value: string | number, 
  label: string, 
  icon: string, 
  color: string 
}

const StatisticItem = ({ value, label, icon, color, isDark }: StatisticItemProps & { isDark?: boolean }) => {
  return (
    <View style={[
      styles.statItem,
      { 
        backgroundColor: isDark ? 'rgba(50, 50, 50, 0.3)' : 'rgba(240, 240, 240, 0.5)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(80, 80, 80, 0.5)' : 'rgba(220, 220, 220, 0.8)'
      }
    ]}>
      <MaterialIcons name={icon as any} size={24} color={color} />
      <ThemedText style={[
        styles.statValue,
        { fontSize: typeof value === 'string' && value.length > 6 ? 16 : 18 }
      ]}>
        {value}
      </ThemedText>
      <ThemedText style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  confettiBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  confettiOverlay: {
    width: '100%',
    height: '100%',
  },
  confetti: {
    position: 'absolute',
    opacity: 0.8,
  },
  header: {
    marginVertical: 16,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    includeFontPadding: false,
  },
  prizeAnnouncement: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  prizeGradient: {
    padding: 15,
  },
  prizeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noWinMessage: {
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  noWinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  noWinSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingBottom: 16,
    height: 200,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
  },
  podiumPillar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: width / 3 - 20,
    margin: 10,
    position: 'relative',
  },
  firstPlace: {
    height: 170,
    zIndex: 3,
  },
  secondPlace: {
    height: 140,
    zIndex: 2,
  },
  thirdPlace: {
    height: 110,
    zIndex: 1,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  firstPlaceAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  crownContainer: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  nameBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  podiumPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  firstPlaceScore: {
    fontSize: 22,
    color: '#FFD700',
  },
  podiumPrize: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  podiumPrizeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  podiumBlock: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  firstPlaceBlock: {
    height: 60,
  },
  userPerformanceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  userPerformanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1.5,
  },
  rankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    paddingBottom: 15,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    margin: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  compactQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  questionBubble: {
    width: width / 5 - 10,
    height: width / 5 - 10,
    margin: 5,
    marginBottom: 15,
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  questionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 4,
  },
  correctBubbleLight: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.6)',
  },
  incorrectBubbleLight: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 67, 54, 0.6)',
  },
  correctBubbleDark: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.7)',
  },
  incorrectBubbleDark: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 67, 54, 0.7)',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionTime: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  questionPoints: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  leaderboardContainer: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    marginVertical: 2,
  },
  currentUserRow: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    marginVertical: 4,
  },
  leaderboardRank: {
    width: 35,
    alignItems: 'center',
  },
  topThreeRank: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topThreeRankText: {
    fontSize: 18,
  },
  leaderboardNameContainer: {
    flex: 1,
    marginLeft: 10,
  },
  leaderboardName: {
    fontSize: 16,
    marginBottom: 3,
    fontWeight: '500',
  },
  currentUserText: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statsPills: {
    flexDirection: 'row',
    marginTop: 2,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  statPillText: {
    fontSize: 12,
    marginLeft: 3,
    fontWeight: '500',
  },
  leaderboardScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  miniStats: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  miniTimeText: {
    fontSize: 11,
    opacity: 0.8,
  },
  miniBonus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  miniBonusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  socialSection: {
    marginBottom: 20,
  },
  socialHeader: {
    marginBottom: 10,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  inviteButton: {
    backgroundColor: '#2196F3',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  homeButton: {
    backgroundColor: '#6c757d',
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden', 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    backgroundColor: '#FFF',
  },
  
  medalBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 2,
  },
  
  medalText: {
    fontSize: 10,
  },
});

export default WinningScreen; 
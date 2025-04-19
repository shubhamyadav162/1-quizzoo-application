import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
  Image,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/ThemeContext';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { getContestLeaderboard } from '../lib/supabase';

const { width } = Dimensions.get('window');

// Define leaderboard player interface
interface LeaderboardPlayer {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
  score: number;
  rank: number;
  prizeAmount: number;
  correctAnswers: number;
  totalQuestions: number;
  averageResponseTime: number;
  accuracy: number;
  isCurrentUser: boolean;
  totalResponseTime: number;
}

export default function ResultsScreen12() {
  // Get params from URL
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [prizeWon, setPrizeWon] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Animation refs
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  
  // Get theme and language preferences
  const { isDark } = useTheme();
  const { isQuizHindi } = useLanguage();
  let user;
  try {
    user = useAuth().user;
  } catch {
    user = null;
  }
  
  // Get query params
  const { 
    score: scoreParam,
    correctAnswers: correctAnswersParam,
    totalQuestions: totalQuestionsParam,
    totalTimeMs: totalTimeMsParam,
    averageTimeMs: averageTimeMsParam,
    contestId,
    gameId
  } = params;

  // Convert params to numeric values
  const score = scoreParam ? Number(scoreParam) : 0;
  const correctAnswers = correctAnswersParam ? Number(correctAnswersParam) : 0;
  const totalQuestions = totalQuestionsParam ? Number(totalQuestionsParam) : 10;
  const totalTimeMs = totalTimeMsParam ? Number(totalTimeMsParam) : 0;
  const averageTimeMs = averageTimeMsParam ? Number(averageTimeMsParam) : 0;
  const wrongAnswers = totalQuestions - correctAnswers;
  
  // Run the fade/scale animations on mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();

      if (contestId && typeof contestId === 'string' && contestId.length > 10) {
        setLoading(true);
        try {
          const data = await getContestLeaderboard(contestId as string);
          if (data && Array.isArray(data) && data.length > 0) {
            // Map data to LeaderboardPlayer[]
            const formatted = data.map((entry: any, idx: number) => {
              const profile = entry.profiles || {};
              const isCurrentUser = !!(user && entry.user_id === user.id);
              return {
                id: entry.id,
                name: isCurrentUser ? (isQuizHindi ? 'आप' : 'You') : (profile.full_name || profile.username || 'Player'),
                avatarUrl: profile.avatar_url || null,
                score: entry.score || 0,
                rank: entry.rank || idx + 1,
                prizeAmount: entry.prize_amount || 0,
                correctAnswers: entry.correct_answers || 0,
                totalQuestions: entry.total_questions || 10,
                averageResponseTime: entry.average_response_time_ms || 0,
                accuracy: entry.correct_answers && entry.total_questions ? (entry.correct_answers / entry.total_questions) * 100 : 0,
                isCurrentUser,
                totalResponseTime: entry.total_response_time || 0,
              };
            });
            setLeaderboard(formatted);
            const userEntry = formatted.find(p => p.isCurrentUser);
            setUserRank(userEntry ? userEntry.rank : null);
            setPrizeWon(userEntry ? userEntry.prizeAmount : 0);
            setError(null);
          } else {
            setError('No leaderboard data found.');
            generateMockData();
          }
        } catch (err) {
          setError('Failed to load leaderboard.');
          generateMockData();
        } finally {
          setLoading(false);
        }
      } else {
        generateMockData();
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [contestId]);
  
  // Generate mock leaderboard data
  const generateMockData = () => {
    const mockNames = isQuizHindi
      ? ['राहुल', 'प्रिया', 'अमित', 'नेहा', 'संजय', 'अंजू', 'करिश्मा', 'विकास', 'दिव्या']
      : ['Rahul', 'Priya', 'Amit', 'Neha', 'Sanjay', 'Anju', 'Karishma', 'Vikas', 'Divya'];
    
    // Create a list of players with mock data
    const mockLeaderboard: LeaderboardPlayer[] = [];
    
    // Add user first with their actual score
    let avatarUrl: string | null = null;
    if (user && typeof user === 'object' && user !== null) {
      const meta = (user as any).user_metadata;
      if (meta && typeof meta === 'object' && meta !== null && typeof meta.avatar_url === 'string') {
        avatarUrl = meta.avatar_url;
      }
    }
    mockLeaderboard.push({
      id: 'user',
      name: isQuizHindi ? 'आप' : 'You',
      avatarUrl,
      score: score,
      rank: 0, // Will be set after sorting
      prizeAmount: 0, // Will be set based on rank
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      averageResponseTime: averageTimeMs,
      accuracy: (correctAnswers / totalQuestions) * 100,
      isCurrentUser: true,
      totalResponseTime: totalTimeMs
    });
    
    // Add mock players with randomized scores
    for (let i = 0; i < 9; i++) {
      const playerScore = Math.max(0, score + Math.floor((Math.random() - 0.4) * 150));
      const playerCorrect = Math.floor((totalQuestions * playerScore) / (score ? score * 1.5 : 350));
      
      mockLeaderboard.push({
        id: `mock-${i}`,
        name: mockNames[i],
        avatarUrl: null,
        score: playerScore,
        rank: 0, // Will be set after sorting
        prizeAmount: 0, // Will be set based on rank
        correctAnswers: playerCorrect,
        totalQuestions: totalQuestions,
        averageResponseTime: (3 + Math.random() * 2) * 1000, // 3-5 seconds
        accuracy: (playerCorrect / totalQuestions) * 100,
        isCurrentUser: false,
        totalResponseTime: (3 + Math.random() * 2) * 1000 * totalQuestions
      });
    }
    
    // Sort by score (higher is better)
    mockLeaderboard.sort((a, b) => b.score - a.score);
    
    // Set ranks and prize amounts
    mockLeaderboard.forEach((player, index) => {
      player.rank = index + 1;
      
      // Set prize amounts for top 3
      if (index === 0) player.prizeAmount = 450; // 1st place: 50% of 900
      else if (index === 1) player.prizeAmount = 270; // 2nd place: 30% of 900
      else if (index === 2) player.prizeAmount = 180; // 3rd place: 20% of 900
    });
    
    // Set user rank based on position
    const userIndex = mockLeaderboard.findIndex(player => player.isCurrentUser);
    setUserRank(userIndex + 1);
    setPrizeWon(mockLeaderboard[userIndex].prizeAmount);
    
    setLeaderboard(mockLeaderboard);
  };
  
  // Format time display with millisecond precision
  const formatTime = (ms: number) => {
    if (!ms) return "0";
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10); // Display only tens of milliseconds
    
    if (minutes === 0) {
      return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
    } else {
      return `${minutes}m ${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
    }
  };

  // Share results with friends
  const handleShare = async () => {
    try {
      const message = isQuizHindi
        ? `मैंने क्विज़ू ऐप पर ${score} अंक प्राप्त किए और #${userRank} स्थान पर रहा! अभी खेलें: quizzoo.app`
        : `I scored ${score} points on Quizzoo App and ranked #${userRank}! Play now: quizzoo.app`;
      
      await Share.share({
        message,
        title: isQuizHindi ? 'मेरे क्विज़ परिणाम' : 'My Quiz Results'
      });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  // Get feedback based on performance
  const getResultFeedback = () => {
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    if (isQuizHindi) {
      if (percentage >= 90) return 'शानदार! आप एक ज्ञानी हैं!';
      if (percentage >= 70) return 'बहुत अच्छा प्रदर्शन!';
      if (percentage >= 50) return 'अच्छा प्रयास!';
      if (percentage >= 30) return 'ठीक-ठाक प्रदर्शन!';
      return 'अगली बार और प्रयास करें!';
    } else {
      if (percentage >= 90) return 'Outstanding! You are a genius!';
      if (percentage >= 70) return 'Great performance!';
      if (percentage >= 50) return 'Good effort!';
      if (percentage >= 30) return 'Not bad!';
      return 'Keep practicing!';
    }
  };

  // --- THEME COLORS ---
  const getTextColor = (isDark: boolean) => isDark ? '#fff' : '#111827';
  const getSubtleTextColor = (isDark: boolean) => isDark ? '#a1a1aa' : '#6b7280';
  const getCardBg = (isDark: boolean) => isDark ? '#2a2a42' : '#fff';
  const getRowBg = (isDark: boolean, isCurrentUser: boolean) => isCurrentUser ? (isDark ? 'rgba(106,91,247,0.18)' : 'rgba(83,82,237,0.08)') : (isDark ? '#23234b' : '#fff');
  const getHeaderBg = (isDark: boolean) => isDark ? '#23234b' : '#f3f4f6';
  const getBorderColor = (isDark: boolean) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(150,150,150,0.1)';
  const getPodiumNameColor = (isDark: boolean) => isDark ? '#fff' : '#333';
  const getPodiumPrizeColor = (isDark: boolean) => isDark ? '#fbbf24' : '#6a5bf7';
  const getAvatarBg = (isDark: boolean) => isDark ? 'rgba(106,91,247,0.25)' : 'rgba(106,91,247,0.1)';
  const getAvatarText = (isDark: boolean) => isDark ? '#fff' : '#6a5bf7';

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar 
          backgroundColor={isDark ? '#1a1a2e' : '#f0f2f5'}
          barStyle={isDark ? "light-content" : "dark-content"}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#6a5bf7' : '#5352ed'} />
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#333' }]}>
            {isQuizHindi ? 'परिणाम की गणना की जा रही है...' : 'Calculating results...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar 
        backgroundColor={isDark ? '#1a1a2e' : '#f0f2f5'}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingTop: 24, paddingBottom: 32, flexGrow: 1 }]}>
        {/* Header with close button */}
        <View style={[styles.header, { marginTop: 8 }]}>
          <Text style={[styles.title, { color: getTextColor(isDark) }]}>
            {isQuizHindi ? 'खेल परिणाम' : 'Game Results'}
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.replace('../(tabs)')}
          >
            <Ionicons name="close" size={24} color={getTextColor(isDark)} />
          </TouchableOpacity>
        </View>
        
        {/* Podium Section for Top 3 Winners */}
        {leaderboard.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={[styles.podiumBlock, styles.podiumSecond]}> 
              <View style={[styles.podiumCircle, { backgroundColor: '#A6B1E1' }]}> 
                <Text style={styles.podiumRank}>2</Text>
              </View>
              <Text style={[styles.podiumName, { color: getPodiumNameColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{leaderboard[1].name}</Text>
              <Text style={[styles.podiumPrize, { color: getPodiumPrizeColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{isQuizHindi ? 'राशि' : 'Prize'}: ₹{leaderboard[1].prizeAmount}</Text>
            </View>
            {/* 1st Place */}
            <View style={[styles.podiumBlock, styles.podiumFirst]}> 
              <View style={[styles.podiumCircle, { backgroundColor: '#FFD700' }]}> 
                <Text style={styles.podiumRank}>1</Text>
              </View>
              <Text style={[styles.podiumName, { fontWeight: 'bold', fontSize: 18, color: getPodiumNameColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{leaderboard[0].name}</Text>
              <Text style={[styles.podiumPrize, { fontWeight: 'bold', color: getPodiumPrizeColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{isQuizHindi ? 'राशि' : 'Prize'}: ₹{leaderboard[0].prizeAmount}</Text>
            </View>
            {/* 3rd Place */}
            <View style={[styles.podiumBlock, styles.podiumThird]}> 
              <View style={[styles.podiumCircle, { backgroundColor: '#CD7F32' }]}> 
                <Text style={styles.podiumRank}>3</Text>
              </View>
              <Text style={[styles.podiumName, { color: getPodiumNameColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{leaderboard[2].name}</Text>
              <Text style={[styles.podiumPrize, { color: getPodiumPrizeColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{isQuizHindi ? 'राशि' : 'Prize'}: ₹{leaderboard[2].prizeAmount}</Text>
            </View>
          </View>
        )}
        
        {/* Results Card */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          marginBottom: 16
        }}>
          <LinearGradient
            colors={userRank && userRank <= 3 ? ['#8B5CF6', '#6D28D9'] : [getCardBg(isDark), getCardBg(isDark)]}
            style={styles.resultsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.resultsHeader}>
              <Text style={[styles.contestName, { color: getTextColor(isDark) }]}>
                {isQuizHindi ? 'क्विज प्रतियोगिता 12' : 'Quiz Contest 12'}
              </Text>
              {userRank && (
                <View style={[
                  styles.rankBadge,
                  { backgroundColor: userRank <= 3 ? '#fbbf24' : getBorderColor(isDark) }
                ]}>
                  <Text style={[
                    styles.rankText, 
                    { color: userRank <= 3 ? '#7c2d12' : getTextColor(isDark) }
                  ]}>
                    #{userRank}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.resultsSummary}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: getSubtleTextColor(isDark) }]}>
                  {isQuizHindi ? 'स्कोर' : 'Score'}
                </Text>
                <Text style={[styles.summaryValue, { color: getTextColor(isDark) }]}>
                  {score}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: getSubtleTextColor(isDark) }]}>
                  {isQuizHindi ? 'सही' : 'Correct'}
                </Text>
                <Text style={[styles.summaryValue, { color: getTextColor(isDark) }]}>
                  {correctAnswers}/{totalQuestions}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: getSubtleTextColor(isDark) }]}>
                  {isQuizHindi ? 'समय' : 'Time'}
                </Text>
                <Text style={[styles.summaryValue, { color: getTextColor(isDark) }]}>
                  {formatTime(totalTimeMs)}
                </Text>
              </View>
            </View>
            
            {prizeWon > 0 && (
              <View style={styles.prizeContainer}>
                <Text style={styles.prizeLabel}>
                  {isQuizHindi ? 'आपने जीते' : 'You Won'}
                </Text>
                <Text style={styles.prizeAmount}>₹{prizeWon}</Text>
                {userRank === 1 && (
                  <FontAwesome5 
                    name="trophy" 
                    size={32} 
                    color="#FFD700" 
                    style={styles.trophyIcon}
                  />
                )}
              </View>
            )}
          </LinearGradient>
        </Animated.View>
        
        {/* Performance Analysis */}
        <Animated.View 
          style={[
            styles.analysisContainer, 
            { 
              backgroundColor: getCardBg(isDark),
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={[styles.analysisTitle, { color: getTextColor(isDark) }]}>
            {isQuizHindi ? 'प्रदर्शन विश्लेषण' : 'Performance Analysis'}
          </Text>
          
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <View style={[styles.analysisIconContainer, { backgroundColor: getBorderColor(isDark) }]}>
                <MaterialIcons name="timer" size={24} color={getSubtleTextColor(isDark)} />
              </View>
              <Text style={[styles.analysisLabel, { color: getSubtleTextColor(isDark) }]}>
                {isQuizHindi ? 'औसत समय' : 'Avg. Time'}
              </Text>
              <Text style={[styles.analysisValue, { color: getTextColor(isDark) }]}>
                {formatTime(averageTimeMs)}
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <View style={[styles.analysisIconContainer, { backgroundColor: getBorderColor(isDark) }]}>
                <MaterialIcons name="check-circle" size={24} color={getSubtleTextColor(isDark)} />
              </View>
              <Text style={[styles.analysisLabel, { color: getSubtleTextColor(isDark) }]}>
                {isQuizHindi ? 'सटीकता' : 'Accuracy'}
              </Text>
              <Text style={[styles.analysisValue, { color: getTextColor(isDark) }]}>
                {Math.round((correctAnswers / totalQuestions) * 100)}%
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <View style={[styles.analysisIconContainer, { backgroundColor: getBorderColor(isDark) }]}>
                <MaterialIcons name="access-time" size={24} color={getSubtleTextColor(isDark)} />
              </View>
              <Text style={[styles.analysisLabel, { color: getSubtleTextColor(isDark) }]}>
                {isQuizHindi ? 'कुल समय' : 'Total Time'}
              </Text>
              <Text style={[styles.analysisValue, { color: getTextColor(isDark) }]}>
                {formatTime(totalTimeMs)}
              </Text>
            </View>
            
            <View style={styles.analysisItem}>
              <View style={[styles.analysisIconContainer, { backgroundColor: getBorderColor(isDark) }]}>
                <MaterialIcons name="trending-up" size={24} color={getSubtleTextColor(isDark)} />
              </View>
              <Text style={[styles.analysisLabel, { color: getSubtleTextColor(isDark) }]}>
                {isQuizHindi ? 'सही/कुल' : 'Correct/Total'}
              </Text>
              <Text style={[styles.analysisValue, { color: getTextColor(isDark) }]}>
                {correctAnswers}/{totalQuestions}
              </Text>
            </View>
          </View>
          
          <View style={styles.performanceFeedback}>
            <Text style={[styles.feedbackText, { color: getSubtleTextColor(isDark) }]}>
              {getResultFeedback()}
            </Text>
          </View>
        </Animated.View>
        
        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Animated.View 
            style={[styles.leaderboardContainer, {
              backgroundColor: getCardBg(isDark),
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
            }]}
          >
            <Text style={[styles.leaderboardTitle, { color: getTextColor(isDark) }]}> 
              {isQuizHindi ? 'लीडरबोर्ड' : 'Leaderboard'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 600 }}>
                <View style={[styles.leaderboardHeader, { backgroundColor: getHeaderBg(isDark) }]}> 
                  <Text style={[styles.headerRank, { color: getTextColor(isDark) }]}> {isQuizHindi ? 'रैंक' : 'Rank'} </Text>
                  <Text style={[styles.headerPlayer, { color: getTextColor(isDark) }]}> {isQuizHindi ? 'खिलाड़ी' : 'Player'} </Text>
                  <Text style={[styles.headerScore, { color: getTextColor(isDark) }]}> {isQuizHindi ? 'स्कोर' : 'Score'} </Text>
                  <Text style={[styles.headerTime, { color: getTextColor(isDark) }]}> {isQuizHindi ? 'समय' : 'Time'} </Text>
                  <Text style={[styles.headerCorrect, { color: getTextColor(isDark) }]}> {isQuizHindi ? 'सही' : 'Correct'} </Text>
                  <Text style={[styles.headerPrize, { color: getTextColor(isDark) }]}> {isQuizHindi ? 'राशि' : 'Prize'} </Text>
                </View>
                {leaderboard.slice(0, 10).map((player, index) => (
                  <View 
                    key={player.id.toString()}
                    style={[styles.leaderboardRow, {
                      backgroundColor: getRowBg(isDark, player.isCurrentUser),
                      borderBottomColor: getBorderColor(isDark),
                      borderBottomWidth: 1,
                      shadowColor: isDark ? '#000' : undefined,
                      shadowOpacity: isDark ? 0.12 : undefined,
                      shadowRadius: isDark ? 2 : undefined,
                    }]}
                  >
                    <View style={styles.rankCell}>
                      {player.rank <= 3 ? (
                        <View style={styles.topRankCircle}>
                          <Text style={styles.topRankText} numberOfLines={1} ellipsizeMode="tail">{player.rank}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.rankText, { color: getTextColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{player.rank}</Text>
                      )}
                    </View>
                    <View style={styles.playerCell}>
                      <View style={styles.playerInfo}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarBg(isDark) }]}> 
                          <Text style={[styles.avatarText, { color: getAvatarText(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{player.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.playerName, player.isCurrentUser && { fontWeight: 'bold' }, { color: getTextColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{player.name}{player.isCurrentUser && ' (आप)'}</Text>
                      </View>
                    </View>
                    <View style={styles.scoreCell}>
                      <Text style={[styles.scoreText, { color: getTextColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{player.score}</Text>
                    </View>
                    <View style={styles.timeCell}>
                      <Text style={[styles.timeText, { color: getTextColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{formatTime(player.totalResponseTime || player.averageResponseTime)}</Text>
                    </View>
                    <View style={styles.correctCell}>
                      <Text style={[styles.correctText, { color: getTextColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">{player.correctAnswers}</Text>
                    </View>
                    <View style={styles.prizeCell}>
                      <Text style={[styles.prizeText, { color: getPodiumPrizeColor(isDark) }]} numberOfLines={1} ellipsizeMode="tail">₹{player.prizeAmount}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getCardBg(isDark) }]}
            onPress={() => router.push('../(tabs)/contests')}
          >
            <FontAwesome5 name="gamepad" size={20} color={getTextColor(isDark)} />
            <Text style={[styles.actionButtonText, { color: getTextColor(isDark) }]}>
              {isQuizHindi ? 'और खेलें' : 'Play More'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getCardBg(isDark) }]}
            onPress={handleShare}
          >
            <FontAwesome5 name="share-alt" size={20} color={getTextColor(isDark)} />
            <Text style={[styles.actionButtonText, { color: getTextColor(isDark) }]}>
              {isQuizHindi ? 'शेयर करें' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  resultsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contestName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  prizeContainer: {
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  prizeLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  prizeAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  trophyIcon: {
    marginTop: 8,
  },
  analysisContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  analysisItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  analysisIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  performanceFeedback: {
    alignItems: 'center',
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  leaderboardContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerRank: {
    width: '10%',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
  },
  headerPlayer: {
    width: '28%',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    overflow: 'hidden',
  },
  headerScore: {
    width: '12%',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
  },
  headerTime: {
    width: '15%',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
  },
  headerCorrect: {
    width: '12%',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
  },
  headerPrize: {
    width: '13%',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  rankCell: {
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 28,
    maxWidth: 40,
    overflow: 'hidden',
  },
  topRankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerCell: {
    width: '28%',
    justifyContent: 'center',
    minWidth: 60,
    maxWidth: 120,
    overflow: 'hidden',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 91, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6a5bf7',
  },
  playerName: {
    fontSize: 14,
  },
  scoreCell: {
    width: '12%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    maxWidth: 60,
    overflow: 'hidden',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
  },
  timeCell: {
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    maxWidth: 60,
    overflow: 'hidden',
  },
  timeText: {
    fontSize: 14,
  },
  correctCell: {
    width: '12%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    maxWidth: 60,
    overflow: 'hidden',
  },
  correctText: {
    fontSize: 14,
  },
  prizeCell: {
    width: '13%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    maxWidth: 60,
    overflow: 'hidden',
  },
  prizeText: {
    fontSize: 14,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  podiumBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 8,
  },
  podiumFirst: {
    zIndex: 2,
    height: 120,
  },
  podiumSecond: {
    zIndex: 1,
    height: 90,
    marginTop: 30,
  },
  podiumThird: {
    zIndex: 1,
    height: 80,
    marginTop: 40,
  },
  podiumCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  podiumRank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumPrize: {
    fontSize: 13,
    color: '#6a5bf7',
    marginTop: 2,
    textAlign: 'center',
  },
}); 
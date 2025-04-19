import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import { getGameResult, GameHistoryEntry, deleteGameFromHistory } from '@/app/lib/LocalStorage';
import { LinearGradient } from 'expo-linear-gradient';

export default function GameResultScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gameResult, setGameResult] = useState<GameHistoryEntry | null>(null);
  const gameId = params.id as string;

  useEffect(() => {
    loadGameResult();
  }, [gameId]);

  const loadGameResult = async () => {
    try {
      setLoading(true);
      if (!gameId) {
        Alert.alert('Error', 'No game ID provided');
        router.back();
        return;
      }

      const result = await getGameResult(gameId);
      if (!result) {
        Alert.alert('Error', 'Game result not found');
        router.back();
        return;
      }

      setGameResult(result);
    } catch (error) {
      console.error('Error loading game result:', error);
      Alert.alert('Error', 'Failed to load game result');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteGame = () => {
    Alert.alert(
      "Delete Game",
      "Are you sure you want to remove this game from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGameFromHistory(gameId);
              Alert.alert("Success", "Game removed from history");
              router.back();
            } catch (error) {
              console.error('Error deleting game:', error);
              Alert.alert('Error', 'Failed to delete game');
            }
          }
        }
      ]
    );
  };

  // Calculate accuracy and speed ratings based on performance
  const calculateAccuracy = (): number => {
    if (!gameResult) return 0;
    return (gameResult.correctAnswers / gameResult.totalQuestions) * 100;
  };

  const getAccuracyRating = (): string => {
    const accuracy = calculateAccuracy();
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 70) return 'Good';
    if (accuracy >= 50) return 'Average';
    return 'Needs Improvement';
  };

  const getSpeedRating = (): string => {
    if (!gameResult) return 'N/A';
    const avgTimeInSeconds = gameResult.avgResponseTime;
    
    if (avgTimeInSeconds <= 2) return 'Lightning Fast';
    if (avgTimeInSeconds <= 4) return 'Quick';
    if (avgTimeInSeconds <= 7) return 'Average';
    return 'Careful';
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#3949AB"} />
        <ThemedText style={styles.loadingText}>Loading game result...</ThemedText>
      </ThemedView>
    );
  }

  if (!gameResult) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={isDark ? "#ff6b6b" : "#d63031"} />
        <ThemedText style={styles.errorText}>Game result not found</ThemedText>
        <TouchableOpacity 
          style={[styles.backButton, {backgroundColor: isDark ? "#4e54c8" : "#3d5af1"}]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const accuracy = calculateAccuracy();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Game Result</ThemedText>
        
        <TouchableOpacity 
          onPress={handleDeleteGame}
          style={styles.deleteButton}
        >
          <Ionicons 
            name="trash-outline" 
            size={20} 
            color={isDark ? "#ff6b6b" : "#d63031"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Animatable.View 
          animation="fadeIn" 
          duration={500}
          style={styles.gameInfoCard}
        >
          <LinearGradient
            colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gameInfoCardContent}
          >
            <View style={styles.gameInfoHeader}>
              <View style={styles.gameDate}>
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={isDark ? "#999" : "#666"} 
                  style={styles.iconMargin}
                />
                <ThemedText style={styles.gameDateText}>{formatDate(gameResult.date)}</ThemedText>
              </View>
              <View style={styles.gameId}>
                <ThemedText style={styles.gameIdText}>ID: {gameResult.id.substring(0, 8)}</ThemedText>
              </View>
            </View>

            <View style={styles.resultSummary}>
              <Animatable.View 
                animation="bounceIn" 
                duration={800}
                delay={300}
                style={[styles.scoreCircle, {
                  borderColor: accuracy >= 70 ? '#4cd137' : accuracy >= 50 ? '#fbc531' : '#e84118'
                }]}
              >
                <ThemedText style={styles.scoreNumber}>{gameResult.score}</ThemedText>
                <ThemedText style={styles.scoreLabel}>POINTS</ThemedText>
              </Animatable.View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {gameResult.rank <= 3 ? 
                    (gameResult.rank === 1 ? '🥇' : gameResult.rank === 2 ? '🥈' : '🥉') : 
                    `#${gameResult.rank}`
                  }
                </ThemedText>
                <ThemedText style={styles.statLabel}>Rank</ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {gameResult.correctAnswers}/{gameResult.totalQuestions}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Correct</ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {accuracy.toFixed(0)}%
                </ThemedText>
                <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {gameResult.avgResponseTime.toFixed(1)}s
                </ThemedText>
                <ThemedText style={styles.statLabel}>Avg Time</ThemedText>
              </View>
            </View>

            <View style={styles.earningContainer}>
              <View style={styles.earningBox}>
                <Ionicons 
                  name="trophy-outline" 
                  size={24} 
                  color={isDark ? "#ffd700" : "#f39c12"} 
                  style={styles.earningIcon}
                />
                <View style={styles.earningTexts}>
                  <ThemedText style={styles.earningLabel}>Earnings</ThemedText>
                  <ThemedText style={styles.earningValue}>₹{gameResult.earnings}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <View style={styles.ratingItem}>
                <ThemedText style={styles.ratingLabel}>Accuracy Rating</ThemedText>
                <ThemedText style={[
                  styles.ratingValue, 
                  {
                    color: accuracy >= 90 ? '#4cd137' : 
                           accuracy >= 70 ? '#fbc531' : 
                           accuracy >= 50 ? '#e17055' : '#e84118'
                  }
                ]}>
                  {getAccuracyRating()}
                </ThemedText>
              </View>

              <View style={styles.ratingItem}>
                <ThemedText style={styles.ratingLabel}>Speed Rating</ThemedText>
                <ThemedText style={styles.ratingValue}>
                  {getSpeedRating()}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>

        {gameResult.questionPerformance && gameResult.questionPerformance.length > 0 && (
          <Animatable.View 
            animation="fadeInUp" 
            duration={500}
            delay={200}
          >
            <ThemedText style={styles.sectionTitle}>Question Performance</ThemedText>
            
            {gameResult.questionPerformance.map((question, index) => (
              <LinearGradient
                key={`question-${index}`}
                colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F8FAFC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.questionItem, {borderLeftColor: question.isCorrect ? '#4cd137' : '#e84118'}]}
              >
                <View style={styles.questionHeader}>
                  <ThemedText style={styles.questionNumber}>Question {index + 1}</ThemedText>
                  <View style={[
                    styles.statusBadge, 
                    {backgroundColor: question.isCorrect ? '#4cd137' : '#e84118'}
                  ]}>
                    <ThemedText style={styles.statusText}>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.questionDetail}>
                  <View style={styles.detailItem}>
                    <ThemedText style={styles.detailLabel}>Time Taken</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {((question.responseTimeMs ?? 0) / 1000).toFixed(1)}s
                    </ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <ThemedText style={styles.detailLabel}>Your Answer</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      Option {String.fromCharCode(65 + ('selectedAnswerIndex' in question ? (question.selectedAnswerIndex ?? 0) : 0))}
                    </ThemedText>
                  </View>
                </View>
              </LinearGradient>
            ))}
          </Animatable.View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerBackButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  gameInfoCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameInfoCardContent: {
    padding: 16,
  },
  gameInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameDateText: {
    fontSize: 14,
  },
  gameId: {
    opacity: 0.7,
  },
  gameIdText: {
    fontSize: 12,
  },
  iconMargin: {
    marginRight: 6,
  },
  resultSummary: {
    alignItems: 'center',
    marginVertical: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  earningContainer: {
    marginVertical: 16,
  },
  earningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  earningIcon: {
    marginRight: 16,
  },
  earningTexts: {
    flex: 1,
  },
  earningLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  earningValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 4,
  },
  ratingLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  questionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 
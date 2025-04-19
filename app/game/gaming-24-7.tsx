// Import necessary components and utilities
import React, { useState, useEffect, useRef } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Dimensions, 
  SafeAreaView,
  ActivityIndicator,
  Vibration,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../lib/ThemeContext';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { questionManager } from '../../src/questions/QuestionManager';

// Get the window dimensions for responsive layout
const { width, height } = Dimensions.get('window');

// Define question interface
interface Question {
  id: string;
  question: {
    en: string;
    hi: string;
  };
  options: {
    en: string[];
    hi: string[];
  };
  correctAnswer: number;
  category: string;
  difficulty: string;
}

// Game state interface
interface GameState {
  currentQuestionIndex: number;
  timeLeft: number;
  score: number;
  selectedOption: number | null;
  isAnswered: boolean;
  showCorrectAnswer: boolean;
  phase: 'waiting' | 'playing' | 'completed';
  totalCorrect: number;
  totalTime: number;
  answers: Answer[];
}

// Answer interface
interface Answer {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

export default function Gaming247() {
  // Get params from URL
  const params = useLocalSearchParams();
  const contestId = params.contestId as string || 'DEMO';
  const entryFee = params.entryFee ? Number(params.entryFee) : 0;
  const mode = params.mode as string || 'demo';
  
  // Get theme, language, and auth from context
  const { isDark } = useTheme();
  const { quizLanguage, isQuizHindi } = useLanguage();
  const { user } = useAuth();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    timeLeft: 6000, // 6 seconds in milliseconds
    score: 0,
    selectedOption: null,
    isAnswered: false,
    showCorrectAnswer: false,
    phase: 'waiting',
    totalCorrect: 0,
    totalTime: 0,
    answers: []
  });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add a ref to track if the component is mounted
  const isMountedRef = useRef(true);
  
  // Initialize game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        
        // Load questions from QuestionManager
        if (user) {
          // Load real questions with user tracking
          await questionManager.getUserAnsweredQuestions(user.id);
          const loadedQuestions = await questionManager.getUniqueQuestions(10, user.id);
          setQuestions(loadedQuestions);
        } else {
          // Fallback to local loading if no user
          await questionManager.loadAllQuestions();
          const allQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
          setQuestions(allQuestions);
        }
        
        // Start game with countdown
        startCountdown();
      } catch (error) {
        console.error("Game initialization error:", error);
        setError("खेल लोड करने में विफल। कृपया पुनः प्रयास करें।");
        setLoading(false);
      }
    };

    initializeGame();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        console.log('[CLEANUP] Clearing timer on unmount');
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (timerAnimation.current) {
        console.log('[CLEANUP] Stopping timer animation on unmount');
        timerAnimation.current.stop();
      }
    };
  }, [user]);
  
  // Countdown before game starts
  const startCountdown = () => {
    let count = 3;
    
    // Show the countdown UI
    setGameState(prev => ({
      ...prev,
      phase: 'waiting'
    }));
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        // Start the actual game
        setGameState(prev => ({
          ...prev,
          phase: 'playing',
          timeLeft: 6000 // Reset to 6 seconds
        }));
        startQuestionTimer(6000, 0);
        setLoading(false);
      }
    }, 1000);
  };
  
  // Start question timer
  const startQuestionTimer = (duration: number, questionIndex: number) => {
    console.log(`[TIMER] Starting timer for question ${questionIndex+1}`);
    progressAnim.setValue(0);
    timerAnimation.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false
    });
    timerAnimation.current.start(({ finished }) => {
      if (finished) {
        console.log('[TIMER] Timer finished for question', questionIndex+1);
        if (!gameState.isAnswered) {
          handleTimesUp();
        }
      }
    });
    const startTime = Date.now();
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setGameState(prev => ({ ...prev, timeLeft: remaining }));
      if (remaining > 0 && !gameState.isAnswered && isMountedRef.current) {
        timerRef.current = setTimeout(updateTimer, 100);
      }
    };
    if (timerRef.current) {
      console.log('[TIMER] Clearing previous timer before starting new');
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setTimeout(updateTimer, 100);
  };

  // Handle when time runs out
  const handleTimesUp = () => {
    console.log('[TIMER] handleTimesUp called');
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const timeSpent = 6000 - gameState.timeLeft;
    const currentQuestion = questions[gameState.currentQuestionIndex];
    setGameState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: null,
        isCorrect: false,
        timeSpent
      });
      return {
        ...prev,
        isAnswered: true,
        showCorrectAnswer: true,
        totalTime: prev.totalTime + timeSpent,
        answers: newAnswers
      };
    });
    if (Platform.OS !== 'web') {
      console.log('[VIBRATION] Vibrating for times up');
      Vibration.vibrate(300);
    }
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  // Handle option selection
  const handleOptionSelection = (index: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }
    const currentQuestion = questions[gameState.currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswer;
    const timeSpent = 6000 - gameState.timeLeft;
    const timeBonus = Math.floor(gameState.timeLeft / 1000) * 10;
    const pointsEarned = isCorrect ? 100 + timeBonus : 0;
    if (Platform.OS !== 'web') {
      console.log('[VIBRATION] Vibrating for answer', isCorrect ? 'correct' : 'incorrect');
      Vibration.vibrate(isCorrect ? [0, 100, 50, 100] : 300);
    }
    setGameState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: index,
        isCorrect,
        timeSpent
      });
      return {
        ...prev,
        score: prev.score + pointsEarned,
        selectedOption: index,
        isAnswered: true,
        showCorrectAnswer: true,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        totalTime: prev.totalTime + timeSpent,
        answers: newAnswers
      };
    });
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  // Record question for user in database
  const recordQuestionForUser = async (
    questionId: string, 
    userId: string, 
    isCorrect: boolean, 
    timeSpent: number,
    contestId: string
  ) => {
    try {
      // Record in user_question_history
      await supabase.from('user_question_history').insert({
        user_id: userId,
        question_id: questionId,
        contest_id: contestId !== 'DEMO' ? contestId : null,
        context: 'gaming-24-7'
      });
      
      // Record response in user_responses
      await supabase.from('user_responses').insert({
        user_id: userId,
        question_id: questionId,
        selected_option: gameState.selectedOption,
        is_correct: isCorrect,
        response_time_ms: timeSpent,
        contest_id: contestId !== 'DEMO' ? contestId : null
      });
    } catch (error) {
      console.error("Error recording question:", error);
    }
  };

  // Move to next question or end game
  const moveToNextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1;
    console.log('[QUESTION] Moving to next question', nextIndex+1);
    if (nextIndex < questions.length) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        timeLeft: 6000,
        selectedOption: null,
        isAnswered: false,
        showCorrectAnswer: false
      }));
      startQuestionTimer(6000, nextIndex);
    } else {
      setGameState(prev => ({
        ...prev,
        phase: 'completed'
      }));
      setTimeout(() => {
        handleGameEnd();
      }, 1000);
    }
  };

  // Handle game completion
  const handleGameEnd = () => {
    // Navigate to results page with all relevant data
    router.push({
      pathname: '../game/results',
      params: {
        score: gameState.score.toString(),
        correctAnswers: gameState.totalCorrect.toString(),
        totalQuestions: questions.length.toString(),
        totalTimeMs: gameState.totalTime.toString(),
        averageTimeMs: (gameState.totalTime / questions.length).toString(),
        contestId: contestId,
        gameId: 'gaming-24-7-' + Date.now().toString()
      }
    });
  };

  // Format time display
  const formatTimeLeft = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}`;
  };
  
  // Handle exit game
  const handleExitGame = () => {
    console.log('[EXIT] handleExitGame called');
    if (timerRef.current) {
      console.log('[EXIT] Clearing timer on exit');
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (timerAnimation.current) {
      console.log('[EXIT] Stopping timer animation on exit');
      timerAnimation.current.stop();
    }
    Alert.alert(
      'खेल छोड़ें',
      'क्या आप वाकई निकलना चाहते हैं? आपकी प्रगति खो जाएगी।',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { 
          text: 'निकलें', 
          style: 'destructive',
          onPress: () => {
            console.log('[EXIT] Navigating away from game');
            router.replace('../(tabs)');
          }
        }
      ]
    );
  };

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#6a5bf7' : '#5352ed'} />
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#333' }]}>
            प्रश्न लोड हो रहे हैं...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Error screen
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={isDark ? '#f43f5e' : '#ef4444'} />
          <Text style={[styles.errorText, { color: isDark ? '#fff' : '#333' }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isDark ? '#6a5bf7' : '#5352ed' }]}
            onPress={() => router.replace('../(tabs)')}
          >
            <Text style={styles.buttonText}>वापस जाएं</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Waiting/Countdown screen
  if (gameState.phase === 'waiting') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#0f3460'] : ['#5352ed', '#6a5bf7']}
          style={styles.countdownContainer}
        >
          <Text style={styles.countdownTitle}>तैयार हो जाइए!</Text>
          <Animated.View style={styles.countdownCircle}>
            <Text style={styles.countdownNumber}>3</Text>
          </Animated.View>
          <Text style={styles.countdownText}>प्रतियोगिता शुरू होने वाली है...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Game screen (playing phase)
  const currentQuestion = questions[gameState.currentQuestionIndex];
  const questionText = isQuizHindi ? currentQuestion.question.hi : currentQuestion.question.en;
  const options = isQuizHindi ? currentQuestion.options.hi : currentQuestion.options.en;
  const isLastQuestion = gameState.currentQuestionIndex === questions.length - 1;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitGame} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressIndicator}>
            {Array.from({ length: questions.length }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index < gameState.currentQuestionIndex 
                      ? '#10b981' 
                      : index === gameState.currentQuestionIndex 
                        ? '#6a5bf7'
                        : isDark ? '#374151' : '#e5e7eb'
                  }
                ]}
              />
            ))}
          </View>
          <Text style={[styles.questionProgress, { color: isDark ? '#fff' : '#333' }]}>
            {gameState.currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: isDark ? '#fff' : '#333' }]}>
            {gameState.score}
          </Text>
        </View>
      </View>
      
      {/* Timer Circle */}
      <View style={styles.timerCircleContainer}>
        <Animated.View style={[
          styles.timerCircle,
          {
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
          }
        ]}>
          <Text style={[styles.timerText, { color: isDark ? '#fff' : '#333' }]}>
            {formatTimeLeft(gameState.timeLeft)}
          </Text>
        </Animated.View>
        
        {/* Circular Timer Animation */}
        <Animated.View
          style={[
            styles.timerProgress,
            {
              transform: [
                {
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.timerDot} />
        </Animated.View>
      </View>
      
      {/* Question */}
      <View style={[styles.questionContainer, { backgroundColor: isDark ? '#2a2a42' : '#fff' }]}>
        <Text style={[styles.questionCategory, { color: isDark ? '#a5b4fc' : '#6366f1' }]}>
          {currentQuestion.category}
        </Text>
        <Text style={[styles.questionText, { color: isDark ? '#fff' : '#111827' }]}>
          {questionText}
        </Text>
      </View>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = gameState.selectedOption === index;
          const isCorrect = currentQuestion.correctAnswer === index;
          const shouldHighlightCorrect = gameState.showCorrectAnswer && isCorrect;
          const isIncorrectSelection = gameState.showCorrectAnswer && isSelected && !isCorrect;
          
          let backgroundColor = isDark ? '#2a2a42' : '#fff';
          let borderColor = isDark ? '#374151' : '#e5e7eb';
          
          if (shouldHighlightCorrect) {
            backgroundColor = '#10b981';
            borderColor = '#10b981';
          }
          if (isIncorrectSelection) {
            backgroundColor = '#ef4444';
            borderColor = '#ef4444';
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor,
                  opacity: gameState.isAnswered && !isSelected && !shouldHighlightCorrect ? 0.7 : 1
                }
              ]}
              onPress={() => !gameState.isAnswered && handleOptionSelection(index)}
              disabled={gameState.isAnswered}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIndicator, 
                  { 
                    backgroundColor: isDark ? '#374151' : '#e5e7eb',
                    borderColor: isDark ? '#4b5563' : '#d1d5db' 
                  }
                ]}>
                  <Text style={styles.optionIndicatorText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                
                <Text style={[
                  styles.optionText,
                  { 
                    color: shouldHighlightCorrect || isIncorrectSelection ? '#fff' : isDark ? '#fff' : '#111827'
                  }
                ]}>
                  {option}
                </Text>
              </View>
              
              {shouldHighlightCorrect && (
                <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.optionIcon} />
              )}
              
              {isIncorrectSelection && (
                <Ionicons name="close-circle" size={24} color="#fff" style={styles.optionIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Gaming 24-7 Label */}
      <View style={styles.brandingContainer}>
        <Text style={[styles.brandingText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
          Gaming 24-7
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  exitButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  questionProgress: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  timerCircleContainer: {
    alignItems: 'center',
    marginTop: 16,
    height: 80,
    position: 'relative',
  },
  timerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerProgress: {
    width: 70,
    height: 70,
    position: 'absolute',
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#6a5bf7',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerDot: {
    width: 10,
    height: 10,
    backgroundColor: '#6a5bf7',
    borderRadius: 5,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  questionContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionCategory: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  optionsContainer: {
    padding: 16,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  optionIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a5bf7',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    margin: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6a5bf7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  countdownTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  countdownCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  countdownText: {
    fontSize: 18,
    color: '#ffffff',
  },
  brandingContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
});
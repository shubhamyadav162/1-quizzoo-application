import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../app/lib/ThemeContext';
import { useLanguage } from '../../app/lib/LanguageContext';
import CalculatingResultsScreen from './CalculatingResultsScreen';

// Get the window dimensions for responsive layout
const { width, height } = Dimensions.get('window');

// Define question interface
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  language: 'en' | 'hi' | 'en-hi';
}

// Game state interface
interface GameState {
  currentQuestionIndex: number;
  timeLeft: number;
  score: number;
  selectedOption: number | null;
  isAnswered: boolean;
  showCorrectAnswer: boolean;
  phase: 'waiting' | 'playing' | 'review' | 'completed' | 'calculating';
}

// Add a type for user responses
interface UserResponse {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  responseTime: number; // ms
}

// HARDCODED LOCAL QUESTIONS (No Supabase connection needed)
const LOCAL_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Rome"],
    correctAnswer: 1,
    explanation: "Paris is the capital and most populous city of France.",
    difficulty: "easy",
    category: "General Knowledge",
    language: "en"
  },
  {
    id: "q2",
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctAnswer: 2,
    explanation: "Mars is called the Red Planet because of its reddish appearance.",
    difficulty: "easy",
    category: "General Knowledge",
    language: "en"
  },
  {
    id: "q3",
    text: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
    correctAnswer: 1,
    explanation: "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.",
    difficulty: "easy",
    category: "General Knowledge",
    language: "en"
  },
  {
    id: "q4",
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean"],
    correctAnswer: 3,
    explanation: "The Pacific Ocean is the largest and deepest ocean on Earth.",
    difficulty: "medium",
    category: "Geography",
    language: "en"
  },
  {
    id: "q5",
    text: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    explanation: "The chemical symbol for gold is Au, from the Latin word 'aurum'.",
    difficulty: "medium",
    category: "Science",
    language: "en"
  },
  {
    id: "q6",
    text: "In which year did World War II end?",
    options: ["1943", "1945", "1947", "1950"],
    correctAnswer: 1,
    explanation: "World War II ended in 1945 with the surrender of Germany and Japan.",
    difficulty: "medium",
    category: "History",
    language: "en"
  },
  {
    id: "q7",
    text: "Which country is known as the Land of the Rising Sun?",
    options: ["China", "Japan", "Thailand", "South Korea"],
    correctAnswer: 1,
    explanation: "Japan is known as the Land of the Rising Sun (Nihon or Nippon).",
    difficulty: "easy",
    category: "Geography",
    language: "en"
  },
  {
    id: "q8",
    text: "What is the capital of Japan?",
    options: ["Beijing", "Tokyo", "Seoul", "Bangkok"],
    correctAnswer: 1,
    explanation: "Tokyo is the capital and largest city of Japan.",
    difficulty: "easy",
    category: "Geography",
    language: "en"
  },
  {
    id: "q9",
    text: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Olivine"],
    correctAnswer: 1,
    explanation: "Oxygen has the chemical symbol 'O' on the periodic table.",
    difficulty: "easy",
    category: "Science",
    language: "en"
  },
  {
    id: "q10",
    text: "What is the hardest natural substance on Earth?",
    options: ["Steel", "Titanium", "Diamond", "Platinum"],
    correctAnswer: 2,
    explanation: "Diamond is the hardest known natural material on Earth.",
    difficulty: "medium",
    category: "Science",
    language: "en"
  }
];

export default function QuizGameScreen() {
  // Get params from URL
  const params = useLocalSearchParams();
  const contestId = params.contestId as string || 'DEMO';
  const entryFee = params.entryFee ? Number(params.entryFee) : 0;
  const poolId = params.poolId as string;
  const mode = params.mode as string || 'demo';
  const difficulty = params.difficulty as string || 'medium';
  
  // Get theme and language from context
  const { isDark } = useTheme();
  const { quizLanguage, isQuizHindi } = useLanguage();

  // Log params for debugging
  useEffect(() => {
    console.log("Quiz screen params:", JSON.stringify(params, null, 2));
  }, [params]);

  // State variables
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    timeLeft: 10000, // 10 seconds in milliseconds
    score: 0,
    selectedOption: null,
    isAnswered: false,
    showCorrectAnswer: false,
    phase: 'waiting'
  });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add responses and navigation flag to state
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [hasNavigated, setHasNavigated] = useState(false);
  
  // Track when the question was shown
  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.log("Initializing game with LOCAL questions");
        // Get questionCount from params (default to 10 if not provided)
        const questionCount = params.questionCount ? Number(params.questionCount) : 10;
        // Set the questions from our local array, sliced to questionCount
        setQuestions(LOCAL_QUESTIONS.slice(0, questionCount));
        // Short delay to simulate loading
        setTimeout(() => {
          setLoading(false);
          setGameState(prev => ({
            ...prev,
            phase: 'playing',
            timeLeft: 10000 // Reset to 10 seconds
          }));
          startQuestionTimer(10000, 0);
        }, 1000);
      } catch (error) {
        console.error("Game initialization error:", error);
        setError("Failed to load the quiz. Please try again.");
        setLoading(false);
      }
    };
    initializeGame();
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (timerAnimation.current) {
        timerAnimation.current.stop();
      }
    };
  }, []);
    
  // Start question timer
  const startQuestionTimer = (duration: number, questionIndex: number) => {
    // Reset animation values
    progressAnim.setValue(0);
    
    // Animate the progress bar
    timerAnimation.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false
    });
    
    timerAnimation.current.start(({ finished }) => {
      if (finished) {
        // Time's up - handle unanswered question
        if (!gameState.isAnswered) {
          handleTimesUp();
        }
      }
    });
    
    // Set up the timer to update timeLeft
    const startTime = Date.now();
    
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      setGameState(prev => ({
        ...prev,
        timeLeft: remaining
      }));
      
      if (remaining > 0 && !gameState.isAnswered) {
        timerRef.current = setTimeout(updateTimer, 100);
      }
    };
    
    // Start the timer
    timerRef.current = setTimeout(updateTimer, 100);
  };

  // Update questionStartTimeRef when moving to a new question
  useEffect(() => {
    if (gameState.phase === 'playing') {
      questionStartTimeRef.current = Date.now();
    }
  }, [gameState.currentQuestionIndex, gameState.phase]);

  // Handle option selection
  const handleOptionSelection = (index: number) => {
    // Stop the timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }
    // Get current question
    const currentQuestion = questions[gameState.currentQuestionIndex];
    // Check if answer is correct
    const isCorrect = index === currentQuestion.correctAnswer;
    // Calculate score based on time left (faster = more points)
    const timeBonus = Math.floor(gameState.timeLeft / 1000) * 10; // 10 points per second left
    const pointsEarned = isCorrect ? 100 + timeBonus : 0;
    // Calculate response time
    const responseTime = Date.now() - questionStartTimeRef.current;
    // Vibrate differently based on correctness
    if (Platform.OS !== 'web') {
      Vibration.vibrate(isCorrect ? [0, 100, 50, 100] : 300);
    }
    // Update responses
    setResponses(prev => ([
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: index,
        isCorrect,
        responseTime,
      }
    ]));
    // Update game state
    setGameState(prev => ({
      ...prev,
      score: prev.score + pointsEarned,
      selectedOption: index,
      isAnswered: true,
      showCorrectAnswer: true
    }));
    // Wait and then move to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  // Handle when time runs out
  const handleTimesUp = () => {
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Get current question
    const currentQuestion = questions[gameState.currentQuestionIndex];
    // Calculate response time
    const responseTime = Date.now() - questionStartTimeRef.current;
    // Update responses (no selection)
    setResponses(prev => ([
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: null,
        isCorrect: false,
        responseTime,
      }
    ]));
    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      showCorrectAnswer: true
    }));
    if (Platform.OS !== 'web') {
      Vibration.vibrate(300);
    }
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  // Move to next question or end game
  const moveToNextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      // Go to next question
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        timeLeft: 10000, // Reset to 10 seconds
        selectedOption: null,
        isAnswered: false,
        showCorrectAnswer: false
      }));
      
      // Start timer for new question
      startQuestionTimer(10000, nextIndex);
    } else {
      // End of game
      setGameState(prev => ({
        ...prev,
        phase: 'calculating'
      }));
    }
  };

  // Format time display
  const formatTimeLeft = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };
  
  // Handle exit game
  const handleExitGame = () => {
    // Clean up timers before navigating
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }
    
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => router.replace('../(tabs)')
        }
      ]
    );
  };
  
  // Play again handler
  const handlePlayAgain = () => {
    setGameState({
      currentQuestionIndex: 0,
      timeLeft: 10000,
      score: 0,
      selectedOption: null,
      isAnswered: false,
      showCorrectAnswer: false,
      phase: 'playing'
    });
    
    // Start the timer for the first question
    startQuestionTimer(10000, 0);
  };

  // Get theme-based colors
  const getThemeColors = () => {
    return {
      background: isDark ? '#111827' : '#f5f7fa',
      card: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#ffffff' : '#111827',
      subtext: isDark ? '#9ca3af' : '#6b7280',
      accent: '#6C63FF',
      correct: '#22c55e',
      incorrect: '#ef4444',
      border: isDark ? '#374151' : '#e5e7eb',
      progressBackground: isDark ? '#374151' : '#e5e7eb',
      progressFill: '#6C63FF'
    };
  };
  
  const colors = getThemeColors();

  // Loading screen
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading quiz...
        </Text>
      </View>
    );
  }
  
  // Error screen
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.incorrect} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
          <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('../(tabs)')}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Completed screen
  if (gameState.phase === 'completed') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.resultsContainer}>
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            Quiz Completed!
            </Text>
          
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreLabel, { color: colors.subtext }]}>Your Score</Text>
            <Text style={[styles.scoreValue, { color: colors.text }]}>{gameState.score}</Text>
            <Text style={[styles.scoreInfo, { color: colors.subtext }]}>
              {gameState.score > 500 ? "Great job! 🎉" : "Keep practicing! 💪"}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handlePlayAgain}
            >
              <Ionicons name="refresh" size={24} color={colors.accent} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Play Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.replace('../(tabs)')}
            >
              <Ionicons name="home" size={24} color={colors.accent} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Home</Text>
          </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Calculating screen: navigate to /game/calculating with params (robust)
  useEffect(() => {
    if (gameState.phase === 'calculating' && !hasNavigated) {
      setHasNavigated(true);
      // Calculate correct answers
      const correctAnswers = responses.filter(r => r.isCorrect).length;
      // Calculate total and average response time
      const totalTimeMs = responses.reduce((sum, r) => sum + r.responseTime, 0);
      const averageTimeMs = responses.length > 0 ? Math.round(totalTimeMs / responses.length) : 0;
      // Prepare params to pass
      const paramsToPass = {
        score: gameState.score.toString(),
        correctAnswers: correctAnswers.toString(),
        totalQuestions: questions.length.toString(),
        totalTimeMs: totalTimeMs.toString(),
        averageTimeMs: averageTimeMs.toString(),
        contestId: contestId,
        gameId: 'demo',
        isQuizHindi: isQuizHindi ? 'true' : 'false',
      };
      // Helper to serialize params
      const toQueryString = (params: Record<string, string>) =>
        Object.entries(params)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
      const queryString = toQueryString(paramsToPass);
      router.replace(`./calculating?${queryString}`);
    }
  }, [gameState.phase, hasNavigated, responses, gameState.score, questions.length, contestId, isQuizHindi]);

  // Game screen (playing phase)
  const currentQuestion = questions[gameState.currentQuestionIndex];
  const isLastQuestion = gameState.currentQuestionIndex === questions.length - 1;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitGame} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.questionProgress, { color: colors.text }]}>
            {gameState.currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
          
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: colors.text }]}>
            Score: {gameState.score}
            </Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.progressBackground }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            {
              backgroundColor: colors.progressFill,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '0%']
              })
            }
          ]} 
        />
      </View>
      
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, { color: colors.text }]}>
          {formatTimeLeft(gameState.timeLeft)}
          </Text>
        </View>
      
      {/* Question */}
      <View style={[styles.questionContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.text}
        </Text>
      </View>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = gameState.selectedOption === index;
          const isCorrect = currentQuestion.correctAnswer === index;
          const shouldHighlightCorrect = gameState.showCorrectAnswer && isCorrect;
          const isIncorrectSelection = gameState.showCorrectAnswer && isSelected && !isCorrect;
          
          let backgroundColor = colors.card;
          if (shouldHighlightCorrect) backgroundColor = colors.correct;
          if (isIncorrectSelection) backgroundColor = colors.incorrect;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  opacity: gameState.isAnswered && !isSelected && !shouldHighlightCorrect ? 0.7 : 1
                }
              ]}
              onPress={() => !gameState.isAnswered && handleOptionSelection(index)}
              disabled={gameState.isAnswered}
            >
                <Text style={[
                  styles.optionText,
                { 
                  color: shouldHighlightCorrect || isIncorrectSelection ? '#ffffff' : colors.text,
                  fontWeight: isSelected || shouldHighlightCorrect ? 'bold' : 'normal'
                }
              ]}>
                {option}
                </Text>
              
              {shouldHighlightCorrect && (
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" style={styles.optionIcon} />
              )}
              
              {isIncorrectSelection && (
                <Ionicons name="close-circle" size={24} color="#ffffff" style={styles.optionIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Explanation (shown after answering) */}
      {gameState.showCorrectAnswer && currentQuestion.explanation && (
        <View style={[styles.explanationContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.explanationText, { color: colors.text }]}>
            {currentQuestion.explanation}
        </Text>
      </View>
      )}
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
  questionProgress: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    padding: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#6C63FF',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 8,
  },
  explanationContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  explanationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
  },
  errorText: {
    margin: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6C63FF',
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
  resultsContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  scoreCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  scoreInfo: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
}); 
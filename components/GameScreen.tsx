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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { GameAnimation } from '@/app/lib/GameTypes';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { getPoolById } from '@/app/lib/ContestPoolDefinitions';
import { useAuth } from '@/app/lib/AuthContext';

// Define Question type directly to avoid import issues
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number;
  category?: string;
  difficulty?: string; // Changed to string to avoid literals
  language?: string;   // Changed to string to avoid literals
}

// Define GamePlayer type directly
interface GamePlayer {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  isUser?: boolean;
  rank?: number;
  prize?: number;
}

// Define GameConfig type directly
interface GameConfig {
  timePerQuestion: number;
  questions: Question[];
  players: GamePlayer[];
  maxPlayers?: number;
  allowSkip?: boolean;
  showExplanations?: boolean;
}

// Define our own GameState to avoid import conflicts
interface CustomGameState {
  currentQuestionIndex: number;
  timeLeft: number;
  phase: 'waiting' | 'playing' | 'completed';
  score: number;
  selectedOption?: number | null;
  questionAnswered?: boolean;
  showCorrectAnswer?: boolean;
  nextQuestionCountdown?: number | null;
  showFeedback?: boolean;
  feedbackText?: string;
  showEmoji?: boolean;
  emojiType?: 'correct' | 'wrong';
  totalScore?: number;
  totalTimeSpent?: number;
  answers?: any[];
  questionPerformance?: any[];
}

// Get the window dimensions for responsive layout
const { width, height } = Dimensions.get('window');

interface ContestDetails {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  category: string;
  questionCount: number;
  timePerQuestionSec: number;
}

const GameScreen: React.FC = () => {
  // Get params from URL using the hook inside the component
  const params = useLocalSearchParams();
  const contestId = (params.contestId as string) || 'DEMO';
  const entryFee = params.entryFee ? Number(params.entryFee) : 0;
  const poolId = params.poolId as string;
  const mode = (params.mode as string) || 'demo';
  const difficulty = (params.difficulty as string) || 'medium';

  // Move all state declarations inside the component
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<CustomGameState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [contestDetails, setContestDetails] = useState<ContestDetails | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<string>("Initializing game...");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Emergency questions for fallback
  const getEmergencyQuestions = (): Question[] => {
    return [
      {
        id: "e1",
        text: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Rome"],
        correctAnswer: 1,
        explanation: "Paris is the capital of France.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e2",
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correctAnswer: 2,
        explanation: "Mars is known as the Red Planet due to its reddish appearance.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e3",
        text: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: 1,
        explanation: "Leonardo da Vinci painted the Mona Lisa in the early 16th century.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e4",
        text: "What is the largest mammal on Earth?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correctAnswer: 1,
        explanation: "The Blue Whale is the largest mammal on Earth.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e5",
        text: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Osmium", "Calcium"],
        correctAnswer: 1,
        explanation: "Oxygen has the chemical symbol 'O'.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e6",
        text: "Which famous scientist developed the theory of relativity?",
        options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Stephen Hawking"],
        correctAnswer: 1,
        explanation: "Albert Einstein developed the theory of relativity.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e7",
        text: "What is the capital of Japan?",
        options: ["Beijing", "Tokyo", "Seoul", "Bangkok"],
        correctAnswer: 1,
        explanation: "Tokyo is the capital of Japan.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e8",
        text: "Which country is known as the Land of the Rising Sun?",
        options: ["China", "Japan", "Thailand", "South Korea"],
        correctAnswer: 1,
        explanation: "Japan is known as the Land of the Rising Sun.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e9",
        text: "Which is the largest ocean in the world?",
        options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
        correctAnswer: 0,
        explanation: "The Pacific Ocean is the largest ocean in the world.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      },
      {
        id: "e10",
        text: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Platinum"],
        correctAnswer: 2,
        explanation: "Diamond is the hardest natural substance on Earth.",
        difficulty: "easy",
        category: "General Knowledge",
        language: "en"
      }
    ];
  };

  // Load questions from JSON files or use emergency questions
  const loadQuestions = async (): Promise<Question[]> => {
    try {
      let questionBatches = [];
      
      try {
        const batch1 = require('../questions/data/gk-questions-batch1.json');
        if (batch1) questionBatches.push(batch1);
      } catch (e) {
        console.log("Failed to load batch 1");
      }
      
      try {
        const batch2 = require('../questions/data/gk-questions-batch2.json');
        if (batch2) questionBatches.push(batch2);
      } catch (e) {
        console.log("Failed to load batch 2");
      }
      
      try {
        const batch3 = require('../questions/data/gk-questions-batch3.json');
        if (batch3) questionBatches.push(batch3);
      } catch (e) {
        console.log("Failed to load batch 3");
      }

      // Combine all questions from all batches
      let allQuestions: any[] = [];
      questionBatches.forEach((batch, idx) => {
        if (batch && Array.isArray(batch.questions)) {
          allQuestions = allQuestions.concat(batch.questions);
        }
      });
      
      // Use emergency questions if none were loaded
      if (allQuestions.length === 0) {
        console.log("No questions loaded, using emergency questions");
        return getEmergencyQuestions();
      }
      
      // Map to expected format
      const mapped = allQuestions.map(q => ({
        id: q.question_id || String(Math.random()),
        text: q.question_text || q.text || "Question",
        options: q.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: typeof q.correct_answer_index !== 'undefined' ? q.correct_answer_index : 0,
        explanation: q.explanation || "",
        difficulty: q.difficulty_level || q.difficulty || "medium",
        category: q.category_id?.toString() || q.category || "General Knowledge",
        language: q.language || "en"
      }));
      
      // Shuffle and take 10
      return mapped
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    } catch (error) {
      console.error("Error loading questions:", error);
      return getEmergencyQuestions();
    }
  };

  // Start a timer for questions
  const startTimer = (duration: number, questionIndex: number) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    let timeLeft = duration;
    
    timerRef.current = setInterval(() => {
      timeLeft -= 100;
      
      setGameState(prevState => {
        if (!prevState) return null;
        
        if (timeLeft <= 0) {
          clearInterval(timerRef.current!);
          
          // Go to next question after 2 second delay
          setTimeout(() => {
            const nextIndex = (prevState.currentQuestionIndex || 0) + 1;
            
            if (nextIndex >= questions.length) {
              // End game if no more questions
              handleGameEnd();
            } else {
              // Move to next question
              setGameState(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  currentQuestionIndex: nextIndex,
                  timeLeft: duration,
                  questionAnswered: false,
                  selectedOption: null
                };
              });
              
              // Start timer for next question
              startTimer(duration, nextIndex);
            }
          }, 2000);
          
          return {
            ...prevState,
            timeLeft: 0,
            questionAnswered: true
          };
        }
        
        return {
          ...prevState,
          timeLeft
        };
      });
    }, 100);
  };

  // Handle game completion
  const handleGameEnd = () => {
    // Clear any timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Get final state for scoring
    const finalState = gameState;
    if (!finalState) return;
    
    console.log("Game completed!");
    
    // Calculate results
    const correctCount = questions.filter((_, idx) => {
      const answer = finalState.answers?.[idx];
      return answer && answer.selectedOption === questions[idx].correctAnswer;
    }).length;
    
    // Navigate to results page
    setTimeout(() => {
      router.push({
        pathname: '/game/results',
        params: {
          gameId: contestId,
          score: (finalState.totalScore || 0).toString(),
          correctAnswers: correctCount.toString(),
          totalQuestions: questions.length.toString(),
          contestName: contestDetails?.name || 'Quiz',
          timeSpent: (finalState.totalTimeSpent || 0).toString(),
          rank: "1",
          prize: "0"
        }
      });
    }, 1000);
  };

  // Handle option selection
  const selectOption = (index: number) => {
    if (!gameState || gameState.questionAnswered) return;
    
    const question = questions[gameState.currentQuestionIndex];
    const isCorrect = index === question.correctAnswer;
    
    // Update game state with selected answer
    setGameState(prev => {
      if (!prev) return null;
      
      // Calculate total score
      const newScore = prev.score + (isCorrect ? 10 : 0);
      
      // Save answer data
      const answers = [...(prev.answers || [])];
      answers[prev.currentQuestionIndex] = {
        questionIndex: prev.currentQuestionIndex,
        selectedOption: index,
        correct: isCorrect,
        timeSpent: 15000 - prev.timeLeft,
        responseTimeMs: 15000 - prev.timeLeft
      };
      
      // Update performance tracking
      const performances = [...(prev.questionPerformance || [])];
      performances[prev.currentQuestionIndex] = {
        questionId: question.id,
        isCorrect,
        timeSpent: 15000 - prev.timeLeft
      };
      
      return {
        ...prev,
        score: newScore,
        totalScore: newScore,
        selectedOption: index,
        questionAnswered: true,
        showCorrectAnswer: true,
        emojiType: isCorrect ? 'correct' : 'wrong',
        showEmoji: true,
        answers,
        questionPerformance: performances
      };
    });
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(isCorrect ? 100 : 300);
    }
    
    // Proceed to next question after delay
    setTimeout(() => {
      const nextIndex = gameState.currentQuestionIndex + 1;
      
      if (nextIndex >= questions.length) {
        // End game if no more questions
        handleGameEnd();
      } else {
        // Move to next question
        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            currentQuestionIndex: nextIndex,
            timeLeft: 15000,
            questionAnswered: false,
            selectedOption: null,
            showEmoji: false
          };
        });
        
        // Start timer for next question
        startTimer(15000, nextIndex);
      }
    }, 2000);
  };

  // Initialize the game
  const initializeGame = async () => {
    if (!user || initialLoadComplete) return;
    
    try {
      setLoadingStage('Loading questions...');
      const loadedQuestions = await loadQuestions();
      setQuestions(loadedQuestions);
      
      setLoadingStage('Setting up game...');
      
      // Create initial game state
      const initialState: CustomGameState = {
        currentQuestionIndex: 0,
        timeLeft: 15000,
        phase: 'playing',
        score: 0,
        totalScore: 0,
        questionAnswered: false,
        selectedOption: null,
        showCorrectAnswer: false,
        nextQuestionCountdown: null,
        answers: [],
        questionPerformance: []
      };
      
      setGameState(initialState);
      
      // Start timer for first question
      startTimer(15000, 0);
      
      setLoadingStage('Game ready!');
      setLoading(false);
      setInitialLoadComplete(true);
    } catch (error) {
      console.error("Error initializing game:", error);
      setError("Failed to initialize game. Please try again.");
    }
  };

  // Start initialization when component mounts
  useEffect(() => {
    initializeGame();
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, initialLoadComplete]);

  // Format time left display
  const formatTimeLeft = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds.toString();
  };
  
  // Return to contests screen
  const handleExitGame = () => {
    Alert.alert(
      'Exit Game',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => {
            router.back();
          }
        }
      ]
    );
  };
  
  // Show loading screen
  if (loading || !gameState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? "white" : "black"} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: isDark ? "white" : "black"}]}>
            {contestDetails?.name || 'Quiz Game'}
          </Text>
          <View style={{width: 24}} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
          <Text style={[styles.loadingText, {color: isDark ? "white" : "black"}]}>
            {loadingStage}
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => router.back()}
              >
                <Text style={styles.retryButtonText}>Back to Contests</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
  
  // Get current question
  const currentQuestion = questions[gameState.currentQuestionIndex];
  
  // Render game UI
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitGame}>
          <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.questionCounter, { color: isDark ? '#fff' : '#333' }]}>
            {gameState.currentQuestionIndex + 1}/{questions.length}
          </Text>
          <View style={[styles.progressBarContainer, { backgroundColor: isDark ? '#2a2a42' : '#e0e0e0' }]}>
            <Animated.View 
              style={[
                styles.progressBar,
                { 
                  width: `${(gameState.timeLeft / 15000) * 100}%`,
                  backgroundColor: isDark ? '#6a5bf7' : '#5352ed'
                }
              ]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={18} color={isDark ? '#fff' : '#333'} />
            <Text style={[styles.timeText, { color: isDark ? '#fff' : '#333' }]}>
              {formatTimeLeft(gameState.timeLeft)}s
            </Text>
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreLabel, { color: isDark ? '#ccc' : '#666' }]}>Score</Text>
          <Text style={[styles.scoreValue, { color: isDark ? '#fff' : '#333' }]}>
            {gameState.score || 0}
          </Text>
        </View>
      </View>
      
      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: isDark ? '#fff' : '#333' }]}>
          {currentQuestion?.text || 'Loading question...'}
        </Text>
      </View>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion?.options?.map((option, index) => {
          const isSelected = gameState.selectedOption === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          const showCorrectAnswer = gameState.questionAnswered;
          
          let backgroundColor = isDark ? '#2a2a42' : '#fff';
          let borderColor = isDark ? '#3d3d5c' : '#e0e0e0';
          let textColor = isDark ? '#fff' : '#333';
          
          if (gameState.questionAnswered) {
            if (isSelected && isCorrect) {
              backgroundColor = isDark ? '#4caf50' : '#81c784';
              borderColor = '#4caf50';
              textColor = '#fff';
            } else if (isSelected && !isCorrect) {
              backgroundColor = isDark ? '#f44336' : '#e57373';
              borderColor = '#f44336';
              textColor = '#fff';
            } else if (!isSelected && isCorrect && showCorrectAnswer) {
              backgroundColor = isDark ? '#4caf50' : '#81c784';
              borderColor = '#4caf50';
              textColor = '#fff';
            }
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor,
                }
              ]}
              onPress={() => selectOption(index)}
              disabled={gameState.questionAnswered}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: textColor }
                ]}
                numberOfLines={3}
              >
                {option}
              </Text>
              
              {gameState.questionAnswered && (
                isSelected ? (
                  <View style={styles.resultIconContainer}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={isCorrect ? '#4caf50' : '#f44336'}
                    />
                  </View>
                ) : (isCorrect && showCorrectAnswer) ? (
                  <View style={styles.resultIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                  </View>
                ) : null
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Emoji feedback */}
      {gameState.showEmoji && (
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>
            {gameState.emojiType === 'correct' ? '🎉' : '😢'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#f44336',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#5352ed',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  questionCounter: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 12,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 16,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  resultIconContainer: {
    marginLeft: 16,
  },
  emojiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  emoji: {
    fontSize: 100,
  },
});

export default GameScreen; 
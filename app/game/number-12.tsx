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
import { questionManager } from '../../src/questions/QuestionManager';
import { supabase } from '../../lib/supabase';
import CalculatingResultsScreen from './CalculatingResultsScreen';
const mascotImg = require('../../assets/images/craiyon_203413_transparent.png');

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

// Header component props interface
interface HeaderComponentProps {
  onExit: () => void;
  isDark: boolean;
  score: number;
  currentIndex: number;
  totalQuestions: number;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ onExit, isDark, score, currentIndex, totalQuestions }) => (
  <View style={styles.headerComponent}>
    <TouchableOpacity onPress={onExit} style={styles.exitButton}>
      <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
    </TouchableOpacity>
    
    <View style={styles.progressContainer}>
      <View style={styles.progressIndicator}>
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < currentIndex 
                  ? '#10b981' 
                  : index === currentIndex 
                    ? '#6a5bf7'
                    : isDark ? '#374151' : '#e5e7eb'
              }
            ]}
          />
        ))}
      </View>
      <Text style={[styles.questionProgress, { color: isDark ? '#fff' : '#333' }]}>
        {currentIndex + 1}/{totalQuestions}
      </Text>
    </View>
    
    <View style={styles.scoreContainer}>
      <Text style={[styles.scoreText, { color: isDark ? '#fff' : '#333' }]}>
        {score}
      </Text>
    </View>
  </View>
);

// Update ModernHeader to use Animated.Text children as a function for animated score
const ModernHeader: React.FC<{
  isDark: boolean;
  displayScore: number;
  appName?: string;
}> = ({ isDark, displayScore, appName = 'Quizzoo' }) => (
  <LinearGradient
    colors={isDark ? ['#23234b', '#3b3b7a', '#6a5bf7'] : ['#6a5bf7', '#7f53ac', '#43cea2']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.modernHeaderGradient}
  >
    <View style={styles.headerLeft}>
      <Image source={mascotImg} style={styles.headerMascot} resizeMode="contain" />
      <Text style={styles.headerAppName}>{appName}</Text>
    </View>
    <View style={styles.headerRight}>
      <Text style={styles.headerScoreLabel}>Score</Text>
      <Text style={styles.headerScore}>{displayScore}</Text>
    </View>
  </LinearGradient>
);

// Fixed set of demo questions (10, repeating)
const DEMO_QUESTIONS: Question[] = [
  {
    id: 'demo-1',
    question: {
      en: 'What is the capital of India?',
      hi: 'भारत की राजधानी क्या है?'
    },
    options: {
      en: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
      hi: ['मुंबई', 'दिल्ली', 'कोलकाता', 'चेन्नई']
    },
    correctAnswer: 1,
    category: 'General Knowledge',
    difficulty: 'Easy',
  },
  {
    id: 'demo-2',
    question: {
      en: 'Who wrote the national anthem of India?',
      hi: 'भारत का राष्ट्रगान किसने लिखा?'
    },
    options: {
      en: ['Rabindranath Tagore', 'Bankim Chandra', 'Mahatma Gandhi', 'Jawaharlal Nehru'],
      hi: ['रवींद्रनाथ टैगोर', 'बंकिम चंद्र', 'महात्मा गांधी', 'जवाहरलाल नेहरू']
    },
    correctAnswer: 0,
    category: 'General Knowledge',
    difficulty: 'Easy',
  },
  {
    id: 'demo-3',
    question: {
      en: 'Which planet is known as the Red Planet?',
      hi: 'कौन सा ग्रह लाल ग्रह के नाम से जाना जाता है?'
    },
    options: {
      en: ['Earth', 'Mars', 'Jupiter', 'Venus'],
      hi: ['पृथ्वी', 'मंगल', 'बृहस्पति', 'शुक्र']
    },
    correctAnswer: 1,
    category: 'Science',
    difficulty: 'Easy',
  },
  {
    id: 'demo-4',
    question: {
      en: 'What is the largest mammal?',
      hi: 'सबसे बड़ा स्तनपायी कौन सा है?'
    },
    options: {
      en: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
      hi: ['हाथी', 'नीली व्हेल', 'जिराफ', 'दरियाई घोड़ा']
    },
    correctAnswer: 1,
    category: 'Biology',
    difficulty: 'Easy',
  },
  {
    id: 'demo-5',
    question: {
      en: 'Who is known as the Father of the Nation in India?',
      hi: 'भारत में राष्ट्रपिता किसे कहा जाता है?'
    },
    options: {
      en: ['Jawaharlal Nehru', 'Sardar Patel', 'Mahatma Gandhi', 'Subhas Chandra Bose'],
      hi: ['जवाहरलाल नेहरू', 'सरदार पटेल', 'महात्मा गांधी', 'सुभाष चंद्र बोस']
    },
    correctAnswer: 2,
    category: 'History',
    difficulty: 'Easy',
  },
  {
    id: 'demo-6',
    question: {
      en: 'Which is the longest river in India?',
      hi: 'भारत की सबसे लंबी नदी कौन सी है?'
    },
    options: {
      en: ['Yamuna', 'Ganga', 'Godavari', 'Brahmaputra'],
      hi: ['यमुना', 'गंगा', 'गोदावरी', 'ब्रह्मपुत्र']
    },
    correctAnswer: 1,
    category: 'Geography',
    difficulty: 'Easy',
  },
  {
    id: 'demo-7',
    question: {
      en: 'What is H2O commonly known as?',
      hi: 'H2O को आमतौर पर क्या कहा जाता है?'
    },
    options: {
      en: ['Salt', 'Oxygen', 'Water', 'Hydrogen'],
      hi: ['नमक', 'ऑक्सीजन', 'पानी', 'हाइड्रोजन']
    },
    correctAnswer: 2,
    category: 'Science',
    difficulty: 'Easy',
  },
  {
    id: 'demo-8',
    question: {
      en: 'Who invented the telephone?',
      hi: 'टेलीफोन का आविष्कार किसने किया?'
    },
    options: {
      en: ['Thomas Edison', 'Alexander Graham Bell', 'Isaac Newton', 'Albert Einstein'],
      hi: ['थॉमस एडिसन', 'अलेक्जेंडर ग्राहम बेल', 'आइजैक न्यूटन', 'अल्बर्ट आइंस्टीन']
    },
    correctAnswer: 1,
    category: 'Inventions',
    difficulty: 'Easy',
  },
  {
    id: 'demo-9',
    question: {
      en: 'Which festival is known as the festival of lights?',
      hi: 'कौन सा त्योहार रोशनी का त्योहार कहलाता है?'
    },
    options: {
      en: ['Holi', 'Diwali', 'Eid', 'Christmas'],
      hi: ['होली', 'दीवाली', 'ईद', 'क्रिसमस']
    },
    correctAnswer: 1,
    category: 'Culture',
    difficulty: 'Easy',
  },
  {
    id: 'demo-10',
    question: {
      en: 'What is the national animal of India?',
      hi: 'भारत का राष्ट्रीय पशु कौन सा है?'
    },
    options: {
      en: ['Lion', 'Tiger', 'Elephant', 'Leopard'],
      hi: ['शेर', 'बाघ', 'हाथी', 'तेंदुआ']
    },
    correctAnswer: 1,
    category: 'General Knowledge',
    difficulty: 'Easy',
  },
];

export default function GameScreenNumber12() {
  // Get params from URL
  const params = useLocalSearchParams();
  const contestId = params.contestId as string || 'DEMO';
  const entryFee = params.entryFee ? Number(params.entryFee) : 0;
  const mode = params.mode as string || 'demo';
  // Fix param parsing for demoOnly and fromLobby
  const demoOnly = typeof params.demoOnly === 'string' ? (params.demoOnly === '1' || params.demoOnly === 'true') : false;
  const fromLobby = typeof params.fromLobby === 'string' ? (params.fromLobby === '1' || params.fromLobby === 'true') : false;
  
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
  // Add a ref to store the animation frame id for the timer
  const rafIdRef = useRef<number | null>(null);
  
  // Use a ref to store questions to avoid losing them due to state updates
  const questionsRef = useRef<Question[]>([]);

  // Add displayScore state for animated score
  const [displayScore, setDisplayScore] = useState(0);
  const animatedScore = useRef(new Animated.Value(0)).current;

  // Move showCalculating state here to fix hooks order error
  const [showCalculating, setShowCalculating] = useState(false);

  // Animate score when it changes
  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: gameState.score,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [gameState.score]);

  // Listen to animatedScore and update displayScore
  useEffect(() => {
    const id = animatedScore.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    return () => {
      animatedScore.removeListener(id);
    };
  }, [animatedScore]);

  // Add a ref to track if the current question is completed
  const questionCompletedRef = useRef(false);

  // Refactor timer logic for professional quiz flow
  const startQuestionTimerDirectly = (questionsList: Question[], questionIndex: number): void => {
    console.log(`Starting timer for question ${questionIndex+1}/${questionsList.length}`);

    if (!questionsList || questionsList.length === 0 || questionIndex >= questionsList.length) {
      setError("खेल लोड करने में विफल। कृपया पुनः प्रयास करें।");
      return;
    }

    // Reset completion flag
    questionCompletedRef.current = false;

    const duration = 6000; // 6 seconds
    progressAnim.setValue(0); // Always reset to 0 for smoothness
    setGameState(prev => ({ ...prev, timeLeft: duration, isAnswered: false, showCorrectAnswer: false, selectedOption: null }));

    // Clean up previous timer
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      progressAnim.setValue(progress); // Animate from 0 to 1 smoothly
      const remaining = Math.max(0, duration - elapsed);
      setGameState(prev => ({ ...prev, timeLeft: remaining }));
      if (progress < 1 && !questionCompletedRef.current) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        // Timer ended
        handleQuestionTimeout(questionsList);
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  };

  // Handle timer end for a question
  const handleQuestionTimeout = (questionsList: Question[]): void => {
    if (questionCompletedRef.current) return; // Prevent double transition
    questionCompletedRef.current = true;

    // If not answered, mark as unanswered (no vibration)
    if (!gameState.isAnswered) {
      // Add unanswered answer
      const questionsToUse = questionsList || questionsRef.current || questions;
      const currentQuestion = questionsToUse[gameState.currentQuestionIndex];
      const timeSpent = 6000;
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
    }

    // Move to next question after a short feedback delay
    setTimeout(() => {
      moveToNextQuestionDirectly(questionsList);
    }, 1000);
  };

  // Update handleOptionSelection to only show feedback and vibrate, do not move to next question
  const handleOptionSelection = (index: number): void => {
    if (questionCompletedRef.current) return; // Prevent double answer
    // Use our ref or state for questions
    const questionsToUse = questionsRef.current.length > 0 ? questionsRef.current : questions;
    if (!questionsToUse || questionsToUse.length === 0 || gameState.currentQuestionIndex >= questionsToUse.length) {
      setError("खेल लोड करने में विफल। कृपया पुनः प्रयास करें।");
      return;
    }
    const currentQuestion = questionsToUse[gameState.currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswer;
    const timeSpent = 6000 - gameState.timeLeft;
    const timeBonus = Math.floor(gameState.timeLeft / 1000) * 10;
    const pointsEarned = isCorrect ? 100 + timeBonus : 0;
    // No vibration for answer
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
    // Record question for user if authenticated
    if (user && user.id) {
      recordQuestionForUser(currentQuestion.id, user.id, isCorrect, timeSpent, contestId);
    }
    // Do NOT move to next question here; timer will handle it
  };

  // In moveToNextQuestionDirectly, clean up timer and reset completion flag
  const moveToNextQuestionDirectly = (questionsList: Question[]): void => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (timerAnimation.current) {
      timerAnimation.current.stop();
    }
    questionCompletedRef.current = false;
    const nextIndex = gameState.currentQuestionIndex + 1;
    const questionsToUse = questionsList || questionsRef.current || questions;
    if (!questionsToUse || questionsToUse.length === 0) {
      setError("खेल लोड करने में विफल। कृपया पुनः प्रयास करें।");
      return;
    }
    if (nextIndex < questionsToUse.length) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        timeLeft: 6000,
        selectedOption: null,
        isAnswered: false,
        showCorrectAnswer: false
      }));
      // Timer will be started by useEffect below
    } else {
      setGameState(prev => ({ ...prev, phase: 'completed' }));
      setTimeout(() => { handleGameEnd(); }, 1000);
    }
  };

  // Add useEffect to start timer for each new question in playing phase
  useEffect(() => {
    if (gameState.phase === 'playing' && questions.length > 0) {
      startQuestionTimerDirectly(questions, gameState.currentQuestionIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentQuestionIndex, gameState.phase]);

  // Handle game completion
  const handleGameEnd = () => {
    // Make sure all game data is available before navigating
    if (!questions || questions.length === 0) {
      console.error("Questions not loaded properly when ending game");
      router.replace('../(tabs)');
      return;
    }
    try {
      setShowCalculating(true);
      setTimeout(() => {
        setShowCalculating(false);
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
            gameId: 'game-12-' + Date.now().toString()
          }
        });
      }, 5000);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation if there's an error
      router.replace('../(tabs)');
    }
  };

  // Format time display
  const formatTimeLeft = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}`;
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
      'खेल छोड़ें',
      'क्या आप वाकई निकलना चाहते हैं? आपकी प्रगति खो जाएगी।',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { 
          text: 'निकलें', 
          style: 'destructive',
          onPress: () => router.replace('../(tabs)')
        }
      ]
    );
  };

  // Record question for user in database
  const recordQuestionForUser = async (
    questionId: string, 
    userId: string, 
    isCorrect: boolean, 
    timeSpent: number,
    contestId: string
  ): Promise<void> => {
    try {
      // Record in user_question_history
      await supabase.from('user_question_history').insert({
        user_id: userId,
        question_id: questionId,
        contest_id: contestId !== 'DEMO' ? contestId : null,
        context: 'game-screen-12'
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

  // Initialize game with a completely different approach
  useEffect(() => {
    let isMounted = true;
    const loadQuestionsDirectly = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("=== STARTING FRESH LOAD ===");
        let loadedQuestions = [];
        if (demoOnly) {
          loadedQuestions = DEMO_QUESTIONS;
        } else if (mode === 'demo') {
          // If demoOnly is not set but mode is demo, use mixed/real questions
          if (user && user.id) {
            try {
              console.log("Loading questions for user:", user.id);
              await questionManager.getUserAnsweredQuestions(user.id);
              loadedQuestions = await questionManager.getUniqueQuestions(10, user.id);
            } catch (e) {
              console.error("Error loading user questions, falling back to anonymous", e);
              await questionManager.loadAllQuestions();
              loadedQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
            }
          } else {
            console.log("Loading anonymous questions");
            await questionManager.loadAllQuestions();
            loadedQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
          }
        } else if (user && user.id) {
          try {
            console.log("Loading questions for user:", user.id);
            await questionManager.getUserAnsweredQuestions(user.id);
            loadedQuestions = await questionManager.getUniqueQuestions(10, user.id);
          } catch (e) {
            console.error("Error loading user questions, falling back to anonymous", e);
            await questionManager.loadAllQuestions();
            loadedQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
          }
        } else {
          console.log("Loading anonymous questions");
          await questionManager.loadAllQuestions();
          loadedQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
        }
        if (!loadedQuestions || loadedQuestions.length === 0) {
          throw new Error("Failed to load any questions");
        }
        if (!isMounted) return;
        questionsRef.current = [...loadedQuestions];
        setQuestions(loadedQuestions);
        setTimeout(() => {
          if (!isMounted) return;
          if (!questionsRef.current || questionsRef.current.length === 0) {
            throw new Error("Questions lost during initialization");
          }
          if (fromLobby) {
            setGameState(prev => ({ ...prev, phase: 'playing', timeLeft: 6000 }));
            setLoading(false);
          } else {
            const startGameProcess = () => {
              setGameState(prev => ({ ...prev, phase: 'waiting' }));
              let count = 3;
              const countdownInterval = setInterval(() => {
                count -= 1;
                if (count <= 0) {
                  clearInterval(countdownInterval);
                  setGameState(prev => ({ ...prev, phase: 'playing', timeLeft: 6000 }));
                  setLoading(false);
                }
              }, 1000);
            };
            startGameProcess();
          }
        }, 500);
      } catch (error) {
        console.error("Game initialization error:", error);
        if (isMounted) {
          setError("खेल लोड करने में विफल। कृपया पुनः प्रयास करें।");
          setLoading(false);
        }
      }
    };
    loadQuestionsDirectly();
    return () => {
      isMounted = false;
      questionsRef.current = [];
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (timerAnimation.current) {
        timerAnimation.current.stop();
      }
    };
  }, [user, mode, demoOnly, fromLobby]);

  // In the main component, add a color interpolation for the timer bar
  const timerColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#10b981', '#facc15', '#ef4444']
  });

  // Loading screen
  if (loading) {
    return (
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#0f3460'] : ['#5352ed', '#6a5bf7']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent', flex: 1 }]}> 
          <Stack.Screen options={{ 
            headerShown: true, 
            headerTitle: "क्विज़ू प्रतियोगिता",
            headerTransparent: true,
            headerTintColor: '#fff',
            headerShadowVisible: false,
            headerLeft: () => null,
          }} />
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={[styles.loadingText, { color: '#fff' }]}> 
              प्रश्न लोड हो रहे हैं...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }
  
  // Error screen
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ 
          headerShown: true, 
          headerTitle: "त्रुटि",
          headerStyle: { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' },
          headerTintColor: isDark ? '#fff' : '#333',
          headerShadowVisible: false
        }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a1a2e' : '#f0f2f5'} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={isDark ? '#f43f5e' : '#ef4444'} />
          <Text style={[styles.errorText, { color: isDark ? '#fff' : '#333' }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isDark ? '#6a5bf7' : '#5352ed' }]}
            onPress={() => {
              // Reset game state
              setError(null);
              setLoading(true);
              setQuestions([]);
              setGameState({
                currentQuestionIndex: 0,
                timeLeft: 6000,
                score: 0,
                selectedOption: null,
                isAnswered: false,
                showCorrectAnswer: false,
                phase: 'waiting',
                totalCorrect: 0,
                totalTime: 0,
                answers: []
              });
              
              // Try loading the game again after a short delay
              setTimeout(() => {
                // Initialize game data again
                const initializeGame = async () => {
                  try {
                    // Load questions from QuestionManager
                    let loadedQuestions = [];
                    
                    if (user && user.id) {
                      await questionManager.getUserAnsweredQuestions(user.id);
                      loadedQuestions = await questionManager.getUniqueQuestions(10, user.id);
                    } else {
                      await questionManager.loadAllQuestions();
                      loadedQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
                    }
                    
                    if (loadedQuestions && loadedQuestions.length > 0) {
                      questionsRef.current = [...loadedQuestions];
                      setQuestions(loadedQuestions);
                      
                      // Create a new game start sequence directly
                      // Set to waiting phase
                      setGameState(prev => ({
                        ...prev,
                        phase: 'waiting'
                      }));
                      
                      // Start countdown
                      let count = 3;
                      const countdownInterval = setInterval(() => {
                        count -= 1;
                        
                        if (count <= 0) {
                          clearInterval(countdownInterval);
                          setGameState(prev => ({
                            ...prev,
                            phase: 'playing',
                            timeLeft: 6000
                          }));
                          
                          setLoading(false);
                        }
                      }, 1000);
                    } else {
                      throw new Error("Failed to load questions");
                    }
                  } catch (retryError) {
                    console.error("Retry failed:", retryError);
                    setError("पुनः प्रयास विफल। कृपया बाद में प्रयास करें।");
                    setLoading(false);
                  }
                };
                
                initializeGame();
              }, 1000);
            }}
          >
            <Text style={styles.buttonText}>पुनः प्रयास करें</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.buttonSecondary, { borderColor: isDark ? '#6a5bf7' : '#5352ed' }]}
            onPress={() => router.replace('../(tabs)')}
          >
            <Text style={[styles.buttonSecondaryText, { color: isDark ? '#6a5bf7' : '#5352ed' }]}>
              वापस जाएं
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Waiting/Countdown screen
  if (gameState.phase === 'waiting') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ 
          headerShown: true, 
          headerTitle: "तैयारी",
          headerStyle: { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' },
          headerTintColor: isDark ? '#fff' : '#333',
          headerShadowVisible: false
        }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a1a2e' : '#f0f2f5'} />
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
  // Make sure questions are loaded before accessing
  if (!questions || questions.length === 0 || gameState.currentQuestionIndex >= questions.length) {
    console.log("Questions not available for rendering: ", 
      questions ? `Length: ${questions.length}, Index: ${gameState.currentQuestionIndex}` : "Questions is null");
    
    // If we're not in loading state, show error
    if (!loading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
          <Stack.Screen options={{ 
            headerShown: true, 
            headerTitle: "क्विज़ू प्रतियोगिता",
            headerStyle: { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' },
            headerTintColor: isDark ? '#fff' : '#333',
            headerShadowVisible: false
          }} />
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a1a2e' : '#f0f2f5'} />
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: isDark ? '#fff' : '#333' }]}>
              प्रश्न लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।
            </Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: isDark ? '#6a5bf7' : '#5352ed' }]}
              onPress={() => {
                setLoading(true);
                setQuestions([]);
                
                // Try loading questions again
                setTimeout(() => {
                  const loadQuestionsAgain = async () => {
                    try {
                      let loadedQuestions = [];
                      if (user && user.id) {
                        await questionManager.getUserAnsweredQuestions(user.id);
                        loadedQuestions = await questionManager.getUniqueQuestions(10, user.id);
                      } else {
                        await questionManager.loadAllQuestions();
                        loadedQuestions = await questionManager.getUniqueQuestions(10, 'anonymous');
                      }
                      
                      if (loadedQuestions && loadedQuestions.length > 0) {
                        questionsRef.current = [...loadedQuestions];
                        setQuestions(loadedQuestions);
                        setGameState(prev => ({
                          ...prev,
                          currentQuestionIndex: 0,
                          phase: 'playing',
                          timeLeft: 6000
                        }));
                        setLoading(false);
                      } else {
                        throw new Error("Failed to load questions on retry");
                      }
                    } catch (retryError) {
                      console.error("Question reload failed:", retryError);
                      setError("प्रश्न लोड करने में विफल। कृपया पुनः प्रयास करें।");
                      setLoading(false);
                    }
                  };
                  
                  loadQuestionsAgain();
                }, 1000);
              }}
            >
              <Text style={styles.buttonText}>पुनः प्रयास करें</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buttonSecondary, { borderColor: isDark ? '#6a5bf7' : '#5352ed', marginTop: 12 }]}
              onPress={() => router.replace('../(tabs)')}
            >
              <Text style={[styles.buttonSecondaryText, { color: isDark ? '#6a5bf7' : '#5352ed' }]}>
                वापस जाएं
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    
    // Otherwise show loading state
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' }]}>
        <Stack.Screen options={{ 
          headerShown: true, 
          headerTitle: "क्विज़ू प्रतियोगिता",
          headerStyle: { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5' },
          headerTintColor: isDark ? '#fff' : '#333',
          headerShadowVisible: false
        }} />
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a1a2e' : '#f0f2f5'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#6a5bf7' : '#5352ed'} />
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#333' }]}>
            प्रश्न लोड हो रहे हैं...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentQuestion = questions[gameState.currentQuestionIndex];
  const questionText = isQuizHindi ? currentQuestion.question.hi : currentQuestion.question.en;
  const options = isQuizHindi ? currentQuestion.options.hi : currentQuestion.options.en;
  const isLastQuestion = gameState.currentQuestionIndex === questions.length - 1;
  
  if (showCalculating) {
    return <CalculatingResultsScreen isHindi={isQuizHindi} onDone={() => {}} />;
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0f2f5', paddingTop: 0 }]}>  
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#23234b' : '#6a5bf7'} />
      {/* Modern Header */}
      <ModernHeader 
        isDark={isDark}
        displayScore={displayScore}
      />
      {/* Linear Timer Bar */}
      <View style={styles.linearTimerBarContainer}>
        <Animated.View
          style={[
            styles.linearTimerBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '0%']
              }),
              backgroundColor: timerColor,
            }
          ]}
        />
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarIndicator}>
          {Array.from({ length: questions.length }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBarDot,
                {
                  backgroundColor: index < gameState.currentQuestionIndex 
                    ? '#10b981' 
                    : index === gameState.currentQuestionIndex 
                      ? '#fff'
                      : isDark ? '#374151' : '#e5e7eb'
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.progressBarText, { color: isDark ? '#fff' : '#333' }]}>  
          {gameState.currentQuestionIndex + 1}/{questions.length}
        </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
  },
  headerComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12, 
    paddingBottom: 8,
    marginTop: 4,
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
  buttonSecondary: {
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  buttonSecondaryText: {
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
  modernHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 4,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 10,
  },
  headerMascot: {
    width: 38,
    height: 38,
    marginRight: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAppName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerScoreLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
    fontWeight: '500',
  },
  headerScore: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    marginBottom: 8,
  },
  progressBarIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  progressBarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  progressBarText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  linearTimerBarContainer: {
    height: 10,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  linearTimerBar: {
    height: '100%',
    borderRadius: 8,
  },
}); 
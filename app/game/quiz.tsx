import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { questionService, Question } from '../lib/questionService';
import { useAuth } from '../lib/AuthContext';

const APP_COLOR = '#006400';

export default function QuizScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('general');
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (loading || quizCompleted) return;
    
    if (timeLeft === 0) {
      handleTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, loading, quizCompleted]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const fetchedQuestions = await questionService.getQuestionsByCategory(category);
      if (fetchedQuestions.length === 0) {
        // If no questions in the category, fetch random questions
        const randomQuestions = await questionService.getRandomQuestions();
        setQuestions(randomQuestions);
      } else {
        setQuestions(fetchedQuestions);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
      
      // Record incorrect answer due to timeout
      if (user) {
        const currentQuestion = questions[currentQuestionIndex];
        questionService.recordUserAnswer(
          user.id,
          currentQuestion.id,
          'timeout',
          false,
          0
        ).catch(error => console.error('Error recording answer:', error));
      }
    } else {
      // End of quiz
      endQuiz();
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return; // Prevent multiple selections
    
    setSelectedOption(option);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correct_answer;
    
    if (isCorrect) {
      // Add points to score
      const pointsEarned = currentQuestion.points;
      setScore(prev => prev + pointsEarned);
      
      // Record correct answer
      if (user) {
        questionService.recordUserAnswer(
          user.id,
          currentQuestion.id,
          option,
          true,
          pointsEarned
        ).catch(error => console.error('Error recording answer:', error));
        
        // Update user points
        questionService.updateUserPoints(
          user.id,
          pointsEarned
        ).catch(error => console.error('Error updating points:', error));
      }
    } else {
      // Record incorrect answer
      if (user) {
        questionService.recordUserAnswer(
          user.id,
          currentQuestion.id,
          option,
          false,
          0
        ).catch(error => console.error('Error recording answer:', error));
      }
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setTimeLeft(15);
      } else {
        endQuiz();
      }
    }, 1500);
  };

  const endQuiz = () => {
    setQuizCompleted(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setTimeLeft(15);
    setQuizCompleted(false);
    loadQuestions();
  };

  const renderOption = (option: string, index: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isSelected = selectedOption === option;
    const isCorrect = option === currentQuestion.correct_answer;
    
    let backgroundColor = '#F8F8F8';
    if (selectedOption) {
      if (isSelected) {
        backgroundColor = isCorrect ? '#E6FFE6' : '#FFE6E6';
      } else if (isCorrect) {
        backgroundColor = '#E6FFE6';
      }
    }
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.optionContainer, { backgroundColor }]}
        onPress={() => handleOptionSelect(option)}
        disabled={!!selectedOption}
      >
        <ThemedText style={styles.optionText}>{option}</ThemedText>
        {selectedOption && isCorrect && (
          <AntDesign name="checkcircle" size={20} color="green" style={styles.icon} />
        )}
        {selectedOption && isSelected && !isCorrect && (
          <AntDesign name="closecircle" size={20} color="red" style={styles.icon} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'क्विज', headerShown: true }} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={APP_COLOR} />
          <ThemedText style={styles.loadingText}>Loading questions...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'क्विज समाप्त', headerShown: true }} />
        <ThemedView style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>क्विज समाप्त!</ThemedText>
          <ThemedText style={styles.scoreText}>आपका स्कोर: {score}</ThemedText>
          
          <TouchableOpacity style={styles.buttonPrimary} onPress={restartQuiz}>
            <ThemedText style={styles.buttonText}>फिर से खेलें</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => router.replace('/(tabs)')}
          >
            <ThemedText style={styles.buttonTextSecondary}>होम पेज पर जाएं</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = currentQuestion?.options ? JSON.parse(currentQuestion.options as string) : [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'क्विज', headerShown: true }} />
      
      <ThemedView style={styles.progress}>
        <ThemedText style={styles.progressText}>
          प्रश्न {currentQuestionIndex + 1}/{questions.length}
        </ThemedText>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
      </ThemedView>
      
      <ThemedView style={styles.timerContainer}>
        <ThemedText style={[
          styles.timer, 
          timeLeft <= 5 ? { color: 'red' } : {}
        ]}>
          {timeLeft}s
        </ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.content}>
        <ThemedView style={styles.questionContainer}>
          <ThemedText style={styles.questionCategory}>
            {currentQuestion.category.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.questionText}>
            {currentQuestion.question}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.optionsContainer}>
          {options.map((option: string, index: number) => renderOption(option, index))}
        </ThemedView>
      </ScrollView>
      
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.score}>अंक: {score}</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progress: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: APP_COLOR,
    borderRadius: 3,
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionCategory: {
    fontSize: 14,
    color: APP_COLOR,
    marginBottom: 8,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  icon: {
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_COLOR,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_COLOR,
    marginBottom: 32,
  },
  buttonPrimary: {
    backgroundColor: APP_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLOR,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: APP_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
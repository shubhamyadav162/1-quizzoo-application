import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const GamingWaitingLobby = ({ contestId, mode, onFinish }) => {
  const [dots, setDots] = useState('.');

  // Game rules
  const gameRules = [
    "Welcome to the Quiz Arena!",
    "Compete against other players in real-time.",
    "Answer 10 random questions.",
    "Each question is displayed for 6 seconds.",
    "Answer quickly and accurately for a higher score.",
    "Top 3 players win prizes!",
    "Fair play is strictly enforced.",
    "Questions shown are unique to you.",
    "Get ready to test your knowledge!"
  ];

  useEffect(() => {
    console.log(`Lobby screen mounted for contest: ${contestId}, mode: ${mode || 'standard'}`);
    
    // Animate dots for loading indication
    const intervalId = setInterval(() => {
      setDots(prevDots => (prevDots.length >= 3 ? '.' : prevDots + '.'));
    }, 500);

    // Call onFinish after 8 seconds
    const timerId = setTimeout(() => {
      clearInterval(intervalId);
      if (onFinish) {
        onFinish();
      }
    }, 8000); // 8-second delay

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [contestId, mode, onFinish]);

  return (
    <LinearGradient
      colors={['#6C63FF', '#3b36ce']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <Animatable.View 
          animation="fadeIn" 
          duration={600}
          style={styles.content}
        >
          <Text style={styles.title}>Preparing Your Game</Text>

          <View style={styles.rulesContainer}>
            {gameRules.map((rule, index) => (
              <Animatable.Text 
                key={index} 
                style={styles.ruleText}
                animation="fadeInLeft"
                delay={300 + (index * 100)}
              >
                • {rule}
              </Animatable.Text>
            ))}
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Joining Contest{dots}</Text>
          </View>
        </Animatable.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  rulesContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ruleText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default GamingWaitingLobby; 
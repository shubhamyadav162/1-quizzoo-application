import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/app/lib/ThemeContext';
import { useLanguage } from '@/app/lib/LanguageContext';

// Helper to get gradient colors by category
const getGradientColors = (category: string): [string, string] => {
  switch (category?.toLowerCase()) {
    case 'standard': return ['#3B82F6', '#60A5FA'];
    case 'medium': return ['#8B5CF6', '#A78BFA'];
    case 'large': return ['#10B981', '#34D399'];
    case 'duel': return ['#F43F5E', '#FB7185'];
    case 'special': return ['#F59E0B', '#FBBF24'];
    default: return ['#00b4db', '#0083b0'];
  }
};

const GamingWaitingLobby = (props: any) => {
  const {
    id,
    name,
    entryFee,
    playerCount,
    totalPool,
    platformFee,
    netPrizePool,
    firstPlaceReward,
    secondPlaceReward,
    thirdPlaceReward,
    category,
    description,
    questionCount,
    timePerQuestionSec,
    isInstant,
    image,
  } = props;

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dots, setDots] = useState('.');
  const { isQuizHindi } = useLanguage();

  // English and Hindi instructions (no timer info)
  const gameRulesEn = [
    'Welcome to the Quiz Arena!',
    `You will play in the "${name}" pool.`,
    `Entry Fee: ₹${entryFee} | Players: ${playerCount}`,
    `Total Prize Pool: ₹${netPrizePool}`,
    `1st Prize: ₹${firstPlaceReward} | 2nd: ₹${secondPlaceReward} | 3rd: ₹${thirdPlaceReward}`,
    `You will answer ${questionCount} questions.`,
    'Answer quickly and accurately for a higher score!',
    'Top 3 players win prizes!',
    'Fair play is strictly enforced.',
    'Get ready to test your knowledge!',
    'You will receive a notification 12 hours before the contest starts if the pool is full.'
  ];
  const gameRulesHi = [
    'क्विज़ एरीना में आपका स्वागत है!',
    `आप "${name}" पूल में खेलेंगे।`,
    `प्रवेश शुल्क: ₹${entryFee} | खिलाड़ी: ${playerCount}`,
    `कुल इनाम राशि: ₹${netPrizePool}`,
    `प्रथम इनाम: ₹${firstPlaceReward} | द्वितीय: ₹${secondPlaceReward} | तृतीय: ₹${thirdPlaceReward}`,
    `आपको ${questionCount} सवालों के जवाब देने होंगे।`,
    'जल्दी और सही जवाब दें, ज्यादा अंक पाएं!',
    'शीर्ष 3 खिलाड़ी इनाम जीतेंगे!',
    'निष्पक्ष खेल अनिवार्य है।',
    'अपने ज्ञान की परीक्षा के लिए तैयार हो जाएं!',
    'यदि पूल भर जाता है, तो प्रतियोगिता शुरू होने से 12 घंटे पहले आपको सूचना मिलेगी।'
  ];
  const gameRules = isQuizHindi ? gameRulesHi : gameRulesEn;

  useEffect(() => {
    // Animate dots for loading indication
    const intervalId = setInterval(() => {
      setDots(prevDots => (prevDots.length >= 3 ? '.' : prevDots + '.'));
    }, 500);

    // Navigate to the game screen after 12 seconds
    const timerId = setTimeout(() => {
      clearInterval(intervalId);
      // Pass all pool data to the quiz screen if needed
      router.push({
        pathname: '/game/quiz',
        params: { poolId: id, name, entryFee, playerCount, category, questionCount },
      } as any);
    }, 12000);

    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [id, name, entryFee, playerCount, category, questionCount]);

  // Royal blue gradient
  const gradientColors = ['#283EFA', '#1B1464'];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>{name || (isQuizHindi ? 'आपका गेम तैयार हो रहा है' : 'Preparing Your Game')}</Text>
          {image && (
            <Image source={{ uri: image }} style={styles.poolImage} resizeMode="cover" />
          )}
          <Text style={styles.poolDescription}>{description}</Text>
          <View style={styles.rulesContainer}>
            {gameRules.map((rule, index) => (
              <Text key={index} style={styles.ruleText}>
                • {rule}
              </Text>
            ))}
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>{isQuizHindi ? 'पूल में शामिल हो रहे हैं' : 'Joining Pool'}{dots}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '95%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 32,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 32 : 48,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    color: '#FFFFFF',
  },
  poolImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  poolDescription: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  rulesContainer: {
    marginBottom: 28,
    padding: 22,
    borderRadius: 18,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
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
    marginTop: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GamingWaitingLobby; 
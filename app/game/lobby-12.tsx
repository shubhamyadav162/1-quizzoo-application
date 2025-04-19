import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  StatusBar, 
  TouchableOpacity,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../lib/ThemeContext';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const GameLobby12 = () => {
  // Get parameters from the URL
  const params = useLocalSearchParams();
  const contestId = params.contestId as string;
  const mode = params.mode as string;
  
  // Get theme and language preferences
  const { isDark } = useTheme();
  const { isQuizHindi } = useLanguage();
  const { user } = useAuth();
  
  // State for the loading animation
  const [dots, setDots] = useState('.');
  const [countdown, setCountdown] = useState(5);
  const [playersJoined, setPlayersJoined] = useState(1);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Game rules in Hindi and English
  const gameRules = {
    en: [
      "Welcome to Quiz Contest Number 12!",
      "Compete against 9 other players in real-time",
      "Answer 10 challenging questions",
      "Each question displays for 6 seconds",
      "Answer quickly for higher scores",
      "Top 3 players win prizes!",
      "Fair play is strictly enforced",
      "Remember: Accuracy and speed both matter"
    ],
    hi: [
      "क्विज प्रतियोगिता नंबर 12 में आपका स्वागत है!",
      "रीयल-टाइम में 9 अन्य खिलाड़ियों के साथ प्रतिस्पर्धा करें",
      "10 चुनौतीपूर्ण प्रश्नों के उत्तर दें",
      "प्रत्येक प्रश्न 6 सेकंड तक दिखाई देगा",
      "उच्च स्कोर के लिए जल्दी उत्तर दें",
      "शीर्ष 3 खिलाड़ी पुरस्कार जीतते हैं!",
      "निष्पक्ष खेल सख्ती से लागू है",
      "याद रखें: सटीकता और गति दोनों मायने रखते हैं"
    ]
  };

  // Start the pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
    
    // Scale animation for the container
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Animate dots for loading indication and start countdown
  useEffect(() => {
    console.log(`Lobby screen mounted for contest: ${contestId}, mode: ${mode}`);
    
    // Animate dots for loading indication
    const dotsInterval = setInterval(() => {
      setDots(prevDots => (prevDots.length >= 3 ? '.' : prevDots + '.'));
    }, 500);
    
    // Simulate people joining
    const playersInterval = setInterval(() => {
      setPlayersJoined(prev => Math.min(prev + 1, 10));
    }, 800);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          clearInterval(dotsInterval);
          clearInterval(playersInterval);
          
          // Navigate to the game screen after countdown reaches zero
          setTimeout(() => {
            if (mode === 'demo') {
              router.push(`../game/number-12?mode=demo&difficulty=medium`);
            } else if (contestId) {
              router.push(`../game/number-12?contestId=${contestId}`);
            } else {
              router.replace('../(tabs)');
            }
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(countdownInterval);
      clearInterval(playersInterval);
    };
  }, [contestId, mode]);

  return (
    <LinearGradient
      colors={isDark ? 
        ['#1a1a2e', '#0f3460'] : 
        ['#5352ed', '#6a5bf7']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.tinyTimerContainer}>
          <Ionicons name="time-outline" size={16} color="#fff" style={{marginRight: 4}} />
          <Text style={styles.tinyTimerText}>{countdown}s</Text>
        </View>
        <View style={{flex:1, position:'relative'}}>
          <Animated.View style={[
            styles.content,
            { 
              transform: [
                { scale: scaleAnim }
              ] 
            }
          ]}>
            <View style={styles.headerNoClose}>
              <Text style={styles.title}>
                {isQuizHindi ? 'प्रतियोगिता लॉबी' : 'Contest Lobby'}
              </Text>
            </View>

            <View style={styles.playerStatusContainer}>
              <Text style={styles.playersText}>
                {isQuizHindi 
                  ? `खिलाड़ी: ${playersJoined}/10 जुड़े`
                  : `Players: ${playersJoined}/10 joined`}
              </Text>
              <View style={styles.playerAvatars}>
                {Array.from({ length: Math.min(5, playersJoined) }).map((_, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.avatarContainer,
                      index === 0 && { 
                        transform: [{ scale: pulseAnim }],
                        zIndex: 5
                      }
                    ]}
                  >
                    <View 
                      style={[
                        styles.avatar,
                        index === 0 && styles.userAvatar
                      ]}
                    >
                      {index === 0 ? (
                        <Text style={styles.avatarText}>You</Text>
                      ) : (
                        <Text style={styles.avatarText}>P{index + 1}</Text>
                      )}
                    </View>
                  </Animated.View>
                ))}
                {playersJoined > 5 && (
                  <View style={styles.morePlayersCircle}>
                    <Text style={styles.morePlayersText}>+{playersJoined - 5}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.rulesContainer}>
              <View style={styles.rulesHeader}>
                <Ionicons name="information-circle" size={20} color="#fff" />
                <Text style={styles.rulesTitle}>
                  {isQuizHindi ? 'प्रतियोगिता नियम' : 'Contest Rules'}
                </Text>
              </View>
              
              {(isQuizHindi ? gameRules.hi : gameRules.en).map((rule, index) => (
                <Text key={index} style={styles.ruleText}>
                  • {rule}
                </Text>
              ))}
            </View>
          </Animated.View>
          <View style={styles.waitingTextContainer}>
            <Text style={styles.waitingText}>
              {isQuizHindi 
                ? `अन्य खिलाड़ियों की प्रतीक्षा की जा रही है${dots}`
                : `Waiting for other players${dots}`}
            </Text>
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
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: '94%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 24,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  headerNoClose: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  playerStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playersText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
    fontWeight: '600',
  },
  playerAvatars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginHorizontal: -5,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 25,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  morePlayersCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  morePlayersText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rulesContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 20,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  ruleText: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  tinyTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 12,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tinyTimerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  waitingTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 0,
  },
  waitingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
  },
});

export default GameLobby12; 
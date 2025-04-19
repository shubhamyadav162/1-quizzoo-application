import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, FlatList, Image, Platform, Switch, Linking, Text } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Feather, AntDesign } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useTheme } from './lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for referred friends
type ReferralStatus = 'pending' | 'registered' | 'deposited';

type ReferredFriend = {
  id: string;
  name: string;
  phone: string;
  status: ReferralStatus;
  date: string;
};

type FreeGame = {
  id: string;
  entryFee: number;
  name: string;
  used: boolean;
  expiryDate: string;
};

export default function ReferScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [isHindi, setIsHindi] = useState(false);
  const [referralCode, setReferralCode] = useState('QUIZ12345');
  const [referralLink, setReferralLink] = useState('https://quizzoo.in/join?ref=QUIZ12345');
  const [referredFriends, setReferredFriends] = useState<ReferredFriend[]>([]);
  const [freeGames, setFreeGames] = useState<FreeGame[]>([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Mock data for demo purposes
  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    const mockFriends: ReferredFriend[] = [
      {
        id: '1',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        status: 'deposited',
        date: '2023-10-15',
      },
      {
        id: '2',
        name: 'Priya Patel',
        phone: '+91 87654 32109',
        status: 'registered',
        date: '2023-10-18',
      },
      {
        id: '3',
        name: 'Amit Kumar',
        phone: '+91 76543 21098',
        status: 'pending',
        date: '2023-10-20',
      },
    ];
    
    const mockGames: FreeGame[] = [
      {
        id: '1',
        entryFee: 25,
        name: 'Standard Quiz Contest',
        used: false,
        expiryDate: '2023-12-31',
      },
      {
        id: '2',
        entryFee: 10,
        name: '1v1 Duel',
        used: true,
        expiryDate: '2023-11-30',
      },
    ];
    
    setReferredFriends(mockFriends);
    setFreeGames(mockGames);
  }, []);
  
  // Calculate statistics
  const totalReferred = referredFriends.length;
  const totalDeposited = referredFriends.filter(f => f.status === 'deposited').length;
  const totalRegistered = referredFriends.filter(f => f.status === 'registered').length;
  const freeGamesEarned = Math.floor(totalDeposited / 3);
  const freeGamesAvailable = freeGames.filter(g => !g.used).length;
  const friendsNeededForNextReward = 3 - (totalDeposited % 3);
  
  // Share referral link
  const shareReferral = async () => {
    try {
      await Share.share({
        message: isHindi 
          ? `मुझे Quizzoo पर ज्वाइन करें और मुफ्त में क्विज खेलें! मेरा रेफरल कोड है: ${referralCode}. यहां डाउनलोड करें: ${referralLink}`
          : `Join me on Quizzoo and play quizzes for free! My referral code is: ${referralCode}. Download here: ${referralLink}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    // Show toast or notification that code was copied
    alert(isHindi ? 'कोड कॉपी किया गया!' : 'Code copied!');
  };
  
  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    // Show toast or notification that link was copied
    alert(isHindi ? 'लिंक कॉपी किया गया!' : 'Link copied!');
  };
  
  // Toggle language
  const toggleLanguage = () => {
    setIsHindi(prev => !prev);
  };
  
  // Render a referred friend item
  const renderFriendItem = ({ item }: { item: ReferredFriend }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={styles.friendItem}
    >
      <View style={styles.friendInfo}>
        <View style={styles.friendIcon}>
          <ThemedText style={styles.friendIconText}>
            {item.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.friendDetails}>
          <ThemedText style={styles.friendName}>{item.name}</ThemedText>
          <ThemedText style={styles.friendPhone}>{item.phone}</ThemedText>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        {item.status === 'deposited' ? (
          <View style={[styles.statusBadge, styles.depositedBadge]}>
            <ThemedText style={styles.statusText}>
              {isHindi ? 'जमा किया' : 'Deposited'}
            </ThemedText>
          </View>
        ) : item.status === 'registered' ? (
          <View style={[styles.statusBadge, styles.registeredBadge]}>
            <ThemedText style={styles.statusText}>
              {isHindi ? 'रजिस्टर्ड' : 'Registered'}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <ThemedText style={styles.statusText}>
              {isHindi ? 'अपूर्ण' : 'Pending'}
            </ThemedText>
          </View>
        )}
      </View>
    </Animatable.View>
  );
  
  // Render a free game item
  const renderGameItem = ({ item }: { item: FreeGame }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={[
        styles.gameItem,
        { opacity: item.used ? 0.6 : 1 }
      ]}
    >
      <View style={styles.gameInfo}>
        <View style={[
          styles.gameIcon,
          { backgroundColor: item.used ? '#999' : '#5E5CE6' }
        ]}>
          <FontAwesome5 name="trophy" size={20} color="#fff" />
        </View>
        <View style={styles.gameDetails}>
          <ThemedText style={styles.gameName}>{item.name}</ThemedText>
          <ThemedText style={styles.gameValue}>
            {isHindi ? `मूल्य: ₹${item.entryFee}` : `Value: ₹${item.entryFee}`}
          </ThemedText>
        </View>
      </View>
      
      {item.used ? (
        <View style={styles.usedBadge}>
          <ThemedText style={styles.usedText}>
            {isHindi ? 'उपयोग किया गया' : 'USED'}
          </ThemedText>
        </View>
      ) : (
        <TouchableOpacity style={styles.useButton} onPress={() => router.push('/game/quiz')}>
          <ThemedText style={styles.useButtonText}>
            {isHindi ? 'अभी खेलें' : 'Play Now'}
          </ThemedText>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
  
  // Render the How It Works section
  const renderHowItWorks = () => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={styles.howItWorksContainer}
    >
      <TouchableOpacity 
        style={styles.howItWorksHeader}
        onPress={() => setShowHowItWorks(!showHowItWorks)}
      >
        <ThemedText style={styles.howItWorksTitle}>
          {isHindi ? 'यह कैसे काम करता है?' : 'How It Works?'}
        </ThemedText>
        <Ionicons 
          name={showHowItWorks ? 'chevron-up' : 'chevron-down'} 
          size={22} 
          color={isDark ? '#aaa' : '#666'}
        />
      </TouchableOpacity>
      
      {showHowItWorks && (
        <View style={styles.howItWorksContent}>
          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              {isHindi 
                ? 'अपने दोस्तों को Quizzoo ऐप डाउनलोड करने के लिए आमंत्रित करें और अपना रेफरल कोड साझा करें।' 
                : 'Invite your friends to download the Quizzoo app and share your referral code.'}
            </ThemedText>
          </View>
          
          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              {isHindi 
                ? 'जब आपके दोस्त साइन अप करते हैं और न्यूनतम राशि जमा करते हैं, तो उन्हें "Deposited" स्थिति मिलती है।' 
                : 'When your friends sign up and make a minimum deposit, they get the "Deposited" status.'}
            </ThemedText>
          </View>
          
          <View style={styles.howItWorksStep}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              {isHindi 
                ? 'हर 3 नए दोस्तों के जमा करने पर, आप ₹50 से कम एंट्री फीस वाले 3 फ्री गेम्स कमाते हैं।' 
                : 'For every 3 friends who make a deposit, you earn 3 free games with entry fees less than ₹50.'}
            </ThemedText>
          </View>
          
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={18} color="#5E5CE6" />
            <ThemedText style={styles.noteText}>
              {isHindi 
                ? 'फ्री गेम्स की वैधता 60 दिनों तक है। आप केवल अपने द्वारा भेजे गए और डाउनलोड किए गए अनूठे रेफरल के लिए पुरस्कार प्राप्त करेंगे।' 
                : 'Free games are valid for 60 days. You will receive rewards only for unique referrals sent by you and downloaded.'}
            </ThemedText>
          </View>
        </View>
      )}
    </Animatable.View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isHindi ? "दोस्तों को आमंत्रित करें" : "Refer Friends",
          headerStyle: {
            backgroundColor: isDark ? '#121212' : '#f8f9fa',
          },
          headerTitleStyle: {
            color: isDark ? '#ffffff' : '#000000',
          },
          headerBackVisible: true,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.languageToggleContainer}>
          <ThemedText style={styles.languageLabel}>
            {isHindi ? "English" : "हिंदी"}
          </ThemedText>
          <Switch
            value={isHindi}
            onValueChange={toggleLanguage}
            trackColor={{ false: '#767577', true: '#5E5CE6' }}
            thumbColor={isHindi ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
        
        <Animatable.View 
          animation="fadeIn" 
          duration={500} 
          style={styles.heroSection}
        >
          <Image 
            source={require('../assets/images/craiyon_203413_transparent.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
          <ThemedText style={[styles.heroTitle, isHindi && styles.hindiHeroTitle]}>
            {isHindi ? 'मित्रों को आमंत्रित करें,\nमुफ्त गेम्स कमाएं!' : 'Invite Friends, Earn Free Games!'}
          </ThemedText>
          <ThemedText style={[styles.heroSubtitle, isHindi && styles.hindiHeroSubtitle]}>
            {isHindi 
              ? 'हर 3 मित्र जो जमा करते हैं, आपको 3 मुफ्त गेम्स मिलते हैं!' 
              : 'For every 3 friends who deposit, you get 3 free games!'}
          </ThemedText>
          
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            duration={2000}
            style={styles.progressContainer}
          >
            <View style={styles.progressTextContainer}>
              <ThemedText style={styles.progressTitle}>
                {isHindi 
                  ? 'अगले पुरस्कार के लिए:' 
                  : 'For your next reward:'}
              </ThemedText>
              <ThemedText style={styles.progressText}>
                {isHindi 
                  ? `${totalDeposited % 3}/3 मित्र` 
                  : `${totalDeposited % 3}/3 friends`}
              </ThemedText>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  {
                    width: `${((totalDeposited % 3) / 3) * 100}%`,
                    backgroundColor: '#5E5CE6'
                  }
                ]}
              />
            </View>
            <ThemedText style={styles.progressHint}>
              {isHindi 
                ? `अगले पुरस्कार के लिए ${friendsNeededForNextReward} और मित्र चाहिए` 
                : `${friendsNeededForNextReward} more friend${friendsNeededForNextReward !== 1 ? 's' : ''} needed for next reward`}
            </ThemedText>
          </Animatable.View>
        </Animatable.View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{totalReferred}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {isHindi ? 'कुल भेजे गए' : 'Total Invited'}
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{totalDeposited}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {isHindi ? 'जमा किए' : 'Deposited'}
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{freeGamesEarned}</ThemedText>
            <ThemedText style={styles.statLabel}>
              {isHindi ? 'फ्री गेम्स कमाए' : 'Free Games Earned'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.referralCardContainer}>
          <ThemedView style={styles.referralCard}>
            <ThemedText style={styles.referralCardTitle}>
              {isHindi ? 'अपना रेफरल कोड शेयर करें' : 'Share Your Referral Code'}
            </ThemedText>
            
            <View style={styles.codeContainer}>
              <ThemedText style={styles.codeText}>{referralCode}</ThemedText>
              <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
                <Ionicons name="copy-outline" size={20} color="#5E5CE6" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.referralActions}>
              <TouchableOpacity style={styles.shareButton} onPress={shareReferral}>
                <Ionicons name="share-social" size={18} color="white" />
                <ThemedText style={styles.shareButtonText}>
                  {isHindi ? 'शेयर करें' : 'Share'}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.copyLinkButton} onPress={copyReferralLink}>
                <Ionicons name="link" size={18} color="#5E5CE6" />
                <ThemedText style={styles.copyLinkText}>
                  {isHindi ? 'लिंक कॉपी करें' : 'Copy Link'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
        
        {renderHowItWorks()}
        
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            {isHindi ? 'आपके फ्री गेम्स' : 'Your Free Games'}
          </ThemedText>
          
          {freeGames.length > 0 ? (
            freeGames.map(game => (
              <React.Fragment key={game.id}>
                {renderGameItem({ item: game })}
              </React.Fragment>
            ))
          ) : (
            <ThemedView style={styles.emptyStateContainer}>
              <Ionicons name="game-controller-outline" size={40} color={isDark ? '#555' : '#ddd'} />
              <ThemedText style={styles.emptyStateText}>
                {isHindi 
                  ? 'अभी तक कोई फ्री गेम नहीं। अपने दोस्तों को आमंत्रित करें और मुफ्त गेम्स कमाएं!' 
                  : 'No free games yet. Invite your friends and earn free games!'}
              </ThemedText>
            </ThemedView>
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            {isHindi ? 'आपके आमंत्रित मित्र' : 'Your Invited Friends'}
          </ThemedText>
          
          {referredFriends.length > 0 ? (
            referredFriends.map(friend => (
              <React.Fragment key={friend.id}>
                {renderFriendItem({ item: friend })}
              </React.Fragment>
            ))
          ) : (
            <ThemedView style={styles.emptyStateContainer}>
              <Ionicons name="people-outline" size={40} color={isDark ? '#555' : '#ddd'} />
              <ThemedText style={styles.emptyStateText}>
                {isHindi 
                  ? 'अभी तक कोई मित्र आमंत्रित नहीं किया गया है। अपने दोस्तों को आमंत्रित करना शुरू करें!' 
                  : 'No friends invited yet. Start inviting your friends!'}
              </ThemedText>
            </ThemedView>
          )}
        </View>
        
        <Animatable.View 
          animation="fadeIn" 
          duration={500} 
          style={styles.bonusTip}
        >
          <Ionicons name="bulb-outline" size={24} color={isDark ? '#FFD700' : '#FFA500'} />
          <ThemedText style={styles.bonusTipText}>
            {isHindi 
              ? 'टिप: अपने सोशल मीडिया पर अपना रेफरल कोड शेयर करें और अधिक लोगों को आकर्षित करें!' 
              : 'Tip: Share your referral code on your social media to attract more people!'}
          </ThemedText>
        </Animatable.View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={shareReferral}
      >
        <Ionicons name="share-social" size={24} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  languageToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  languageLabel: {
    marginRight: 10,
    fontSize: 14,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  heroImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 30,
  },
  hindiHeroTitle: {
    fontSize: 20,
    lineHeight: 28,
    marginHorizontal: 15,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
    paddingHorizontal: 10,
  },
  hindiHeroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5E5CE6',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressHint: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5E5CE6',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  referralCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  referralCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  referralCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#5E5CE6',
  },
  copyButton: {
    padding: 5,
  },
  referralActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  shareButton: {
    backgroundColor: '#5E5CE6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  copyLinkButton: {
    borderColor: '#5E5CE6',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  copyLinkText: {
    color: '#5E5CE6',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  howItWorksContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(94, 92, 230, 0.05)',
    overflow: 'hidden',
  },
  howItWorksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  howItWorksContent: {
    padding: 15,
    paddingTop: 0,
  },
  howItWorksStep: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#5E5CE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.8,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 12,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 15,
    opacity: 0.7,
    fontSize: 14,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(94, 92, 230, 0.05)',
    borderRadius: 12,
    marginBottom: 10,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5E5CE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  useButton: {
    backgroundColor: '#5E5CE6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  usedBadge: {
    backgroundColor: '#999',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  usedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(94, 92, 230, 0.05)',
    borderRadius: 12,
    marginBottom: 10,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5E5CE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  friendIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendPhone: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusContainer: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  depositedBadge: {
    backgroundColor: '#4CAF50',
  },
  registeredBadge: {
    backgroundColor: '#2196F3',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bonusTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  bonusTipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#5E5CE6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
}); 
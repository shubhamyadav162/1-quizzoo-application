import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Text,
  FlatList,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { Header } from '@/components/Header';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';

// Types
interface Contest {
  id: string;
  name: string;
  description: string;
  image: string;
  prize: string;
  entryFee: string;
  participants: number;
  maxParticipants: number;
  startTime: Date;
  categories: string[];
  tier: string;
  status: string;
}

// Recent Winners type
interface Winner {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  contestName: string;
  date: string;
}

// Top Players type
interface TopPlayer {
  id: string;
  name: string;
  avatar: string;
  winnings: number;
  totalWins: number;
  rank: number;
}

// Mock featured contests
const FEATURED_CONTESTS: Contest[] = [
  {
    id: '1',
    name: 'Mega Brain Battle',
    description: 'Test your knowledge across multiple categories in this ultimate brain challenge!',
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c',
    prize: '₹5,000',
    entryFee: '₹99',
    participants: 45,
    maxParticipants: 100,
    startTime: new Date(), // Changed to current date so it's joinable now
    categories: ['General Knowledge', 'Science', 'History'],
    tier: 'High-Stake',
    status: 'joinable',
  },
  {
    id: '2',
    name: 'Daily Quiz Challenge',
    description: 'Join the daily quiz challenge and compete with players from around the country!',
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b',
    prize: '₹1,000',
    entryFee: '₹49',
    participants: 78,
    maxParticipants: 100,
    startTime: new Date(), // Changed to current date so it's joinable now
    categories: ['Current Affairs', 'Politics', 'Sports'],
    tier: 'Medium-Stake',
    status: 'joinable',
  },
  {
    id: '3',
    name: 'Sports Trivia Master',
    description: 'Are you the ultimate sports fan? Prove your knowledge in this sports-only contest!',
    image: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402',
    prize: '₹2,500',
    entryFee: '₹79',
    participants: 32,
    maxParticipants: 100,
    startTime: new Date(), // Changed to current date so it's joinable now
    categories: ['Cricket', 'Football', 'Tennis', 'Olympics'],
    tier: 'Medium-Stake',
    status: 'joinable',
  },
];

// Add this large list of diverse Indian names and contest types
const INDIAN_NAMES = [
  // Hindu names
  {name: 'Aarav Sharma', avatar: '👨', gender: 'male'},
  {name: 'Aditi Patel', avatar: '👩', gender: 'female'},
  {name: 'Arjun Gupta', avatar: '👨', gender: 'male'},
  {name: 'Ananya Singh', avatar: '👩', gender: 'female'},
  {name: 'Rohan Verma', avatar: '👨', gender: 'male'},
  {name: 'Diya Mishra', avatar: '👩', gender: 'female'},
  {name: 'Kabir Joshi', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Ishita Reddy', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Vivaan Agarwal', avatar: '👨', gender: 'male'},
  {name: 'Anika Desai', avatar: '👩', gender: 'female'},
  {name: 'Vihaan Malhotra', avatar: '👦', gender: 'male'},
  {name: 'Avni Iyer', avatar: '👧', gender: 'female'},
  {name: 'Reyansh Kumar', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Myra Nair', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Arnav Mehra', avatar: '👨', gender: 'male'},
  {name: 'Prisha Rao', avatar: '👩', gender: 'female'},
  {name: 'Dhruv Chauhan', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Saanvi Kapoor', avatar: '👧', gender: 'female'},
  {name: 'Ayush Bansal', avatar: '👨', gender: 'male'},
  {name: 'Amaira Trivedi', avatar: '👩', gender: 'female'},
  {name: 'Rudra Thakur', avatar: '👦', gender: 'male'},
  {name: 'Pihu Tiwari', avatar: '👧', gender: 'female'},
  {name: 'Madhav Srinivasan', avatar: '👨', gender: 'male'},
  {name: 'Lavanya Das', avatar: '👩‍🦱', gender: 'female'},
  {name: 'Atharv Saxena', avatar: '👨', gender: 'male'},
  
  // Muslim names
  {name: 'Adil Khan', avatar: '👨', gender: 'male'},
  {name: 'Zara Ahmed', avatar: '👩', gender: 'female'},
  {name: 'Rehan Pathan', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Aisha Shaikh', avatar: '👩', gender: 'female'},
  {name: 'Zain Siddiqui', avatar: '👨', gender: 'male'},
  {name: 'Inaya Mirza', avatar: '👧', gender: 'female'},
  {name: 'Faiz Mohammad', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Aliya Qureshi', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Ayaan Malik', avatar: '👦', gender: 'male'},
  {name: 'Zoya Rizvi', avatar: '👩', gender: 'female'},
  {name: 'Hamza Ansari', avatar: '👨', gender: 'male'},
  {name: 'Samaira Javed', avatar: '👧', gender: 'female'},
  {name: 'Ibrahim Hussain', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Amara Azmi', avatar: '👩', gender: 'female'},
  {name: 'Rayyan Ali', avatar: '👨', gender: 'male'},
  
  // Sikh names
  {name: 'Gurpreet Singh', avatar: '👨', gender: 'male'},
  {name: 'Simran Kaur', avatar: '👩', gender: 'female'},
  {name: 'Harjot Brar', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Navdeep Dhillon', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Jasjit Sandhu', avatar: '👨', gender: 'male'},
  {name: 'Manpreet Gill', avatar: '👩', gender: 'female'},
  {name: 'Arjun Grewal', avatar: '👦', gender: 'male'},
  {name: 'Prabhleen Bajwa', avatar: '👧', gender: 'female'},
  {name: 'Sukhwinder Dhaliwal', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Kiranpreet Sidhu', avatar: '👩', gender: 'female'},
  {name: 'Gurmeet Virk', avatar: '👨', gender: 'male'},
  {name: 'Jasleen Chawla', avatar: '👩‍🦱', gender: 'female'},
  {name: 'Inderpal Gujral', avatar: '👨', gender: 'male'},
  
  // Christian names
  {name: 'Aiden Thomas', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Sophia D\'Souza', avatar: '👩', gender: 'female'},
  {name: 'Ryan Fernandes', avatar: '👨', gender: 'male'},
  {name: 'Ava Monteiro', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Ethan Lobo', avatar: '👦', gender: 'male'},
  {name: 'Olivia Sequeira', avatar: '👧', gender: 'female'},
  {name: 'Joel Vincent', avatar: '👨', gender: 'male'},
  {name: 'Emma Pereira', avatar: '👩', gender: 'female'},
  {name: 'Nathan David', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Isabella George', avatar: '👩‍🦰', gender: 'female'},
  
  // Other names representing India's diversity
  {name: 'Tenzin Dorje', avatar: '👨', gender: 'male'},
  {name: 'Lakshmi Thampi', avatar: '👩', gender: 'female'},
  {name: 'Karma Sherpa', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Nandita Bora', avatar: '👩', gender: 'female'},
  {name: 'Dorjee Lama', avatar: '👨', gender: 'male'},
  {name: 'Padma Lepcha', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Nikhil Mizo', avatar: '👨', gender: 'male'},
  {name: 'Lovi Nadar', avatar: '👩', gender: 'female'},
  {name: 'Ajit Thapa', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Rekha Ao', avatar: '👩', gender: 'female'},
  {name: 'Prashant Basu', avatar: '👨', gender: 'male'},
  {name: 'Maya Khatoon', avatar: '👩‍🦱', gender: 'female'},
  {name: 'Mrinal Gogoi', avatar: '👨', gender: 'male'},
  {name: 'Rita Chakma', avatar: '👩', gender: 'female'},
  {name: 'Kumar Dixit', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Jaya Tamang', avatar: '👩‍🦰', gender: 'female'},
  {name: 'Bijoy Deka', avatar: '👨', gender: 'male'},
  {name: 'Leela Chettri', avatar: '👩', gender: 'female'},
  {name: 'Ramesh Bordoloi', avatar: '👨', gender: 'male'},
  {name: 'Sunita Roy', avatar: '👩‍🦱', gender: 'female'},
  {name: 'Prakash Sen', avatar: '👨‍🦱', gender: 'male'},
  {name: 'Meena Devi', avatar: '👩', gender: 'female'},
  {name: 'Rajiv Bhatt', avatar: '👨', gender: 'male'},
  {name: 'Geeta Rathore', avatar: '👩‍🦰', gender: 'female'}
];

const CONTEST_TYPES = [
  'Daily Quiz', 'Tech Trivia', 'Science Battle', 'Sports Quiz',
  'Music Mania', 'Movie Buffs', 'General Knowledge', 'History Master',
  'Math Challenge', 'Geography Genius', 'Wildlife Quiz', 'Food Quiz',
  'Literature Test', 'Current Affairs', 'Business Quiz', 'Coding Challenge',
  'Art & Culture', 'Politics Quiz', 'Economy Test', 'Cricket Match',
  'Bollywood Quiz', 'Nature & Space', 'Health Quiz', 'Agriculture Quiz'
];

// Mock recent winners
const RECENT_WINNERS: Winner[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    avatar: '👨',
    amount: 2500,
    contestName: 'Science Quiz',
    date: '5 mins ago',
  },
  {
    id: '2',
    name: 'Anjali Singh',
    avatar: '👩',
    amount: 1200,
    contestName: 'Movie Trivia',
    date: '15 mins ago',
  },
  {
    id: '3',
    name: 'Vikram Patel',
    avatar: '👨',
    amount: 1800,
    contestName: 'Sports Quiz',
    date: '30 mins ago',
  },
];

// Mock top players
const TOP_PLAYERS: TopPlayer[] = [
  {
    id: '1',
    name: 'Aditya Verma',
    avatar: '👨',
    winnings: 15000,
    totalWins: 25,
    rank: 1,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    avatar: '👩',
    winnings: 12000,
    totalWins: 22,
    rank: 2,
  },
  {
    id: '3',
    name: 'Raj Kumar',
    avatar: '👨',
    winnings: 10000,
    totalWins: 18,
    rank: 3,
  },
];

// Quick action types
interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

// Mock quick actions
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'all-contests',
    title: 'All Contests',
    icon: <MaterialIcons name="emoji-events" size={24} color="#fff" />,
    color: '#4CAF50',
    route: '/contests',
  },
  {
    id: 'add-money',
    title: 'Add Money',
    icon: <MaterialIcons name="account-balance-wallet" size={22} color="#fff" />,
    color: '#FF9800',
    route: '/add-money',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    icon: <FontAwesome5 name="money-bill-wave" size={20} color="#fff" />,
    color: '#2196F3',
    route: '/withdraw',
  },
  {
    id: 'invite',
    title: 'Invite Friends',
    icon: <MaterialIcons name="group-add" size={24} color="#fff" />,
    color: '#F44336',
    route: '/invite',
  },
  {
    id: 'my-contests',
    title: 'My Contests',
    icon: <MaterialIcons name="history" size={24} color="#fff" />,
    color: '#9C27B0',
    route: '/my-contests',
  },
  {
    id: 'rewards',
    title: 'Rewards',
    icon: <MaterialIcons name="card-giftcard" size={24} color="#fff" />,
    color: '#FF5722',
    route: '/rewards',
  },
];

const { width } = Dimensions.get('window');

// Add celebration emojis
const CELEBRATION_EMOJIS = ['🎉', '💰', '🔥', '💸', '🤑', '🏆', '💎', '🎊', '💵', '🙌', '✨', '💯', '🐦', '📈', '👑'];

// Function to get a random emoji for celebration
const getRandomCelebrationEmoji = (): string => {
  // Make Twitter bird emoji (🐦) appear less frequently (10% chance)
  if (Math.random() < 0.1) {
    return '🐦';
  }
  // Return other celebration emojis for remaining 90% cases
  const otherEmojis = CELEBRATION_EMOJIS.filter(emoji => emoji !== '🐦');
  return otherEmojis[Math.floor(Math.random() * otherEmojis.length)];
};

// Create a global variable to share live user count between screens
export let globalLiveUsers = 1532;

// Function to ensure consistent live user count across screens
export function getGlobalLiveUsers(): number {
  return globalLiveUsers;
}

// Function to update global live user count
export function updateGlobalLiveUsers(newCount: number): void {
  globalLiveUsers = newCount;
}

export default function HomeScreen() {
  const [user, setUser] = useState({
    name: 'Rahul',
    balance: 1200,
  });
  const [featuredContests, setFeaturedContests] = useState(FEATURED_CONTESTS);
  const [recentWinners, setRecentWinners] = useState<Winner[]>(RECENT_WINNERS);
  const [topPlayers, setTopPlayers] = useState(TOP_PLAYERS);
  const [liveUsers, setLiveUsers] = useState(globalLiveUsers);
  const [allTopPlayers, setAllTopPlayers] = useState<TopPlayer[]>([]);
  const [showAllTopPlayers, setShowAllTopPlayers] = useState(false);
  const [showAllWinners, setShowAllWinners] = useState(false);
  const [celebrationEmojis, setCelebrationEmojis] = useState<{[key: string]: string}>({});
  const [dailyBonusModalVisible, setDailyBonusModalVisible] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  
  // Enhanced animation for live pulse effect with opacity
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  
  // Get theme information
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  
  // Function to generate a realistic winning amount
  const generateWinningAmount = (): number => {
    // Generate different ranges of winning amounts with different probabilities
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% chance for small amounts (₹10-₹100)
      return Math.floor(Math.random() * 91) + 10;
    } else if (random < 0.7) {
      // 30% chance for medium amounts (₹101-₹500)
      return Math.floor(Math.random() * 400) + 101;
    } else if (random < 0.9) {
      // 20% chance for large amounts (₹501-₹2000)
      return Math.floor(Math.random() * 1500) + 501;
    } else {
      // 10% chance for very large amounts (₹2001-₹7000)
      return Math.floor(Math.random() * 5000) + 2001;
    }
  };
  
  // Function to generate a recent time
  const generateRecentTime = (): string => {
    const units = ['sec', 'min'];
    const unit = units[Math.floor(Math.random() * units.length)];
    const value = Math.floor(Math.random() * 59) + 1;
    return `${value} ${unit} ago`;
  };
  
  // Function to generate a new winner with celebration emoji
  const generateNewWinner = (): Winner => {
    // Get a random name from the list
    const randomPerson = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
    const randomContest = CONTEST_TYPES[Math.floor(Math.random() * CONTEST_TYPES.length)];
    const winnerId = Date.now().toString();
    
    // Add a celebration emoji for this winner
    setCelebrationEmojis(prev => ({
      ...prev,
      [winnerId]: getRandomCelebrationEmoji()
    }));
    
    return {
      id: winnerId,
      name: randomPerson.name,
      avatar: randomPerson.avatar,
      amount: generateWinningAmount(),
      contestName: randomContest,
      date: generateRecentTime()
    };
  };
  
  // Generate lots of random top players for the full leaderboard
  const generateAllTopPlayers = () => {
    const players: TopPlayer[] = [];
    
    // Create 50 random top players
    for (let i = 0; i < 50; i++) {
      const randomPerson = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
      const totalWins = Math.floor(Math.random() * 50) + 1;
      const winningsBase = Math.floor(Math.random() * 10000) + 5000;
      
      players.push({
        id: (i+4).toString(),
        name: randomPerson.name,
        avatar: randomPerson.avatar,
        winnings: winningsBase,
        totalWins: totalWins,
        rank: i+4 // Start at rank 4 (after the initial top 3)
      });
    }
    
    // Sort by winnings descending
    players.sort((a, b) => b.winnings - a.winnings);
    
    // Update ranks after sorting
    players.forEach((player, index) => {
      player.rank = index + 4; // Start at rank 4
    });
    
    return players;
  };
  
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Generate all top players for leaderboard
    setAllTopPlayers(generateAllTopPlayers());
  }, []);

  const formatTime = (time: Date) => {
    if (time <= new Date()) {
      return 'Available Now';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    return time.toLocaleTimeString(undefined, options);
  };

  const handleJoinContest = useCallback((contestId: string) => {
    console.log(`Joining contest ${contestId}`);
    router.push(`/contest/${contestId}` as any);
  }, []);

  const handleQuickAction = useCallback((actionRoute: string) => {
    if (actionRoute === '/contests') {
      router.push('/(tabs)/contests');
    } else if (actionRoute === '/add-money') {
      router.push('/add-money');
    } else {
      console.log(`Navigating to ${actionRoute}`);
    }
  }, []);

  // Add function to get color based on tier and theme
  const getTierBackgroundColor = (tier: string, isDark: boolean) => {
    switch (tier) {
      case 'High-Stake':
        return isDark ? '#4a148c' : '#8e24aa';
      case 'Medium-Stake':
        return isDark ? '#01579b' : '#0277bd';
      case 'Low-Stake':
        return isDark ? '#004d40' : '#00796b';
      default:
        return isDark ? '#212121' : '#424242';
    }
  };

  const getTierTextColor = (tier: string, isDark: boolean) => {
    // For both dark and light mode, we'll use white text 
    // as the backgrounds are dark enough
    return '#fff';
  };

  // Get rank style function
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: '#FFD700' }; // Gold
      case 2:
        return { color: '#C0C0C0' }; // Silver
      case 3:
        return { color: '#CD7F32' }; // Bronze
      default:
        return { color: isDark ? '#bbb' : '#666' };
    }
  };

  // Custom header right component
  const headerRight = (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity style={styles.liveUsersButton}>
        <Animated.View style={[
          styles.livePulse,
          { 
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim
          }
        ]}>
          <View style={styles.liveIndicator} />
        </Animated.View>
        <Text style={styles.liveText}>{liveUsers} LIVE</Text>
      </TouchableOpacity>
    </View>
  );

  // Render featured contest
  const renderFeaturedContest = (item: Contest) => {
    const tierTextColor = getTierTextColor(item.tier, isDark);
    
    return (
      <Pressable
        key={item.id}
        style={[
          styles.featuredCard,
          { backgroundColor: getTierBackgroundColor(item.tier, isDark) }
        ]}
        onPress={() => handleJoinContest(item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.featuredImage}
        />
        <View style={styles.featuredContent}>
          <ThemedText
            style={[styles.featuredTitle, { color: tierTextColor }]}
            numberOfLines={1}
          >
            {item.name}
          </ThemedText>
          <View style={styles.featuredDetails}>
            <View style={styles.featuredDetail}>
              <MaterialIcons
                name="attach-money"
                size={16}
                color={tierTextColor}
              />
              <ThemedText
                style={[
                  styles.featuredDetailText,
                  { color: tierTextColor }
                ]}
              >
                {item.prize}
              </ThemedText>
            </View>
            <View style={styles.featuredDetail}>
              <MaterialIcons
                name="people"
                size={16}
                color={tierTextColor}
              />
              <ThemedText
                style={[
                  styles.featuredDetailText,
                  { color: tierTextColor }
                ]}
              >
                {item.participants}/{item.maxParticipants}
              </ThemedText>
            </View>
            <View style={styles.featuredDetail}>
              <MaterialIcons
                name="alarm"
                size={16}
                color={tierTextColor}
              />
              <ThemedText
                style={[
                  styles.featuredDetailText,
                  { color: tierTextColor }
                ]}
              >
                {formatTime(item.startTime)}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.featuredJoinButton,
              {
                backgroundColor:
                  item.status === 'joinable'
                    ? '#4CAF50'
                    : 'rgba(255,255,255,0.2)',
              },
            ]}
            onPress={() => handleJoinContest(item.id)}
            disabled={item.status !== 'joinable'}
          >
            <ThemedText style={styles.featuredJoinText}>
              {item.status === 'joinable' ? 'Join Now' : 'View'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  // Render winner item
  const renderWinnerItem = ({ item }: { item: Winner }) => (
    <ThemedView style={[styles.winnerCard, isDark && styles.winnerCardDark]}>
      <ThemedView style={[styles.winnerIconContainer, isDark && styles.winnerIconContainerDark]}>
        <ThemedText style={styles.winnerEmoji}>{item.avatar}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.winnerInfo}>
        <ThemedView style={styles.winnerNameContainer}>
          <ThemedText style={[styles.winnerName, isDark && { color: '#fff' }]}>{item.name}</ThemedText>
        </ThemedView>
        <ThemedText style={[styles.winnerTime, isDark && { color: '#aaa' }]}>{item.date}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.winnerAmount}>
        <ThemedText style={styles.winnerAmountText}>₹{item.amount}</ThemedText>
        <MaterialIcons name="arrow-upward" size={16} color="#4CAF50" />
      </ThemedView>
    </ThemedView>
  );

  // Render top player item
  const renderTopPlayerItem = ({ item }: { item: TopPlayer }) => (
    <ThemedView style={[styles.topPlayerCard, isDark && styles.topPlayerCardDark]}>
      <ThemedView style={styles.rankContainer}>
        <ThemedText style={[styles.rankText, getRankStyle(item.rank)]}>#{item.rank}</ThemedText>
      </ThemedView>
      <ThemedView style={[styles.playerIconContainer, isDark && styles.playerIconContainerDark]}>
        <ThemedText style={styles.playerEmoji}>{item.avatar}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.playerInfoContainer}>
        <ThemedText style={[styles.playerName, isDark && { color: '#fff' }]}>{item.name}</ThemedText>
        <ThemedView style={styles.playerStats}>
          <ThemedView style={[styles.statBadge, isDark && styles.statBadgeDark]}>
            <MaterialIcons name="emoji-events" size={12} color={isDark ? "#FFD700" : "#FFC107"} />
            <ThemedText style={[styles.statText, isDark && { color: '#ddd' }]}>{item.totalWins} wins</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.playerWinnings}>
        <ThemedText style={styles.playerWinningsText}>₹{item.winnings}</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SimpleSwipeView>
        <ThemedView style={styles.container}>
          <Header 
            title={`Hi, ${user.name}`}
            subtitle="Welcome back to Quizzoo"
            right={headerRight}
          />
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Daily bonus banner */}
            <TouchableOpacity 
              style={[styles.dailyBonusContainer, isDark && styles.dailyBonusContainerDark]} 
              onPress={() => setDailyBonusModalVisible(true)}
            >
              <ThemedView style={styles.dailyBonusContent}>
                <MaterialIcons name="card-giftcard" size={24} color={isDark ? "#FFD700" : "#FFC107"} />
                <ThemedView style={styles.dailyBonusTextContainer}>
                  <ThemedText style={[styles.dailyBonusTitle, isDark && { color: '#fff' }]}>Daily Bonus</ThemedText>
                  <ThemedText style={[styles.dailyBonusDescription, isDark && { color: '#bbb' }]}>
                    Tap to claim your free daily bonus
                  </ThemedText>
                </ThemedView>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? "#aaa" : "#666"} />
              </ThemedView>
            </TouchableOpacity>
          
            <ThemedView style={styles.quickActionsContainer}>
              <ThemedView style={styles.quickActionsList}>
                {QUICK_ACTIONS.map(item => (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.quickActionItem}
                    onPress={() => handleQuickAction(item.route)}
                  >
                    <ThemedView style={[styles.actionIconContainer, { backgroundColor: item.color }]}>
                      {item.icon}
                    </ThemedView>
                    <ThemedText style={[styles.actionTitle, isDark && { color: '#ddd' }]} numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.featuredContainer}>
              <ThemedView style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
                <ThemedView style={styles.sectionTitleContainer}>
                  <MaterialIcons name="star" size={20} color="#FFC107" style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Featured Contests</ThemedText>
                </ThemedView>
                <TouchableOpacity onPress={() => router.push('/(tabs)/contests')}>
                  <ThemedText style={[styles.viewAllText, isDark && { color: '#64B5F6' }]}>View All</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contestListContainer}
              >
                {FEATURED_CONTESTS.map(item => renderFeaturedContest(item))}
              </ScrollView>
            </ThemedView>
            
            <ThemedView style={styles.recentWinnersContainer}>
              <ThemedView style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
                <ThemedView style={styles.sectionTitleContainer}>
                  <MaterialIcons name="emoji-events" size={20} color="#FFC107" style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Recent Winners</ThemedText>
                </ThemedView>
                <TouchableOpacity onPress={() => setShowAllWinners(true)}>
                  <ThemedText style={[styles.viewAllText, isDark && { color: '#64B5F6' }]}>View All</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              
              <FlatList
                data={recentWinners}
                renderItem={renderWinnerItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.winnersListContainer}
              />
            </ThemedView>
            
            <ThemedView style={styles.topPlayersContainer}>
              <ThemedView style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
                <ThemedView style={styles.sectionTitleContainer}>
                  <MaterialIcons name="leaderboard" size={20} color="#FFC107" style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Top Players</ThemedText>
                </ThemedView>
                <TouchableOpacity onPress={() => setShowAllTopPlayers(true)}>
                  <ThemedText style={[styles.viewAllText, isDark && { color: '#64B5F6' }]}>View All</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              
              <ThemedView style={[styles.topPlayersList, isDark && styles.topPlayersListDark]}>
                {topPlayers.map(player => (
                  <ThemedView key={player.id} style={[styles.topPlayerItem, isDark && styles.topPlayerItemDark]}>
                    {renderTopPlayerItem({ item: player })}
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </SimpleSwipeView>
      
      {/* Modal for viewing all recent winners */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAllWinners}
        onRequestClose={() => setShowAllWinners(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
            <ThemedView style={[styles.modalHeader, isDark && { borderBottomColor: '#333' }]}>
              <ThemedText style={[styles.modalTitle, isDark && { color: '#fff' }]}>Recent Winners</ThemedText>
              <TouchableOpacity onPress={() => setShowAllWinners(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </ThemedView>
            
            <FlatList
              data={recentWinners}
              renderItem={renderWinnerItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.allWinnersListContainer}
            />
          </ThemedView>
        </ThemedView>
      </Modal>
      
      {/* Modal for viewing all top players */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAllTopPlayers}
        onRequestClose={() => setShowAllTopPlayers(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
            <ThemedView style={[styles.modalHeader, isDark && { borderBottomColor: '#333' }]}>
              <ThemedText style={[styles.modalTitle, isDark && { color: '#fff' }]}>Top Players</ThemedText>
              <TouchableOpacity onPress={() => setShowAllTopPlayers(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </ThemedView>
            
            <FlatList
              data={allTopPlayers}
              renderItem={renderTopPlayerItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.allTopPlayersListContainer}
            />
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Daily Bonus Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={dailyBonusModalVisible}
        onRequestClose={() => setDailyBonusModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
            <ThemedView style={[styles.modalHeader, isDark && { borderBottomColor: '#333' }]}>
              <ThemedText style={[styles.modalTitle, isDark && { color: '#fff' }]}>Daily Bonus</ThemedText>
              <TouchableOpacity onPress={() => setDailyBonusModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedView style={styles.bonusContentContainer}>
              <ThemedView style={[styles.bonusImageContainer, isDark && { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                <MaterialIcons name="card-giftcard" size={80} color={isDark ? "#FFD700" : "#FFC107"} />
              </ThemedView>
              
              <ThemedText style={[styles.bonusTitle, isDark && { color: '#fff' }]}>
                Congratulations!
              </ThemedText>
              
              <ThemedText style={[styles.bonusDescription, isDark && { color: '#ddd' }]}>
                You have unlocked your daily bonus reward
              </ThemedText>
              
              <ThemedView style={[styles.bonusAmountContainer, isDark && styles.bonusAmountContainerDark]}>
                <ThemedText style={styles.bonusAmount}>+₹10</ThemedText>
              </ThemedView>
              
              <TouchableOpacity
                style={[styles.claimButton, isDark && styles.claimButtonDark]}
                onPress={() => {
                  // Add logic to claim bonus
                  setDailyBonusModalVisible(false);
                }}
              >
                <ThemedText style={styles.claimButtonText}>Claim Now</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Coupon Apply Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={couponModalVisible}
        onRequestClose={() => setCouponModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
            <ThemedView style={[styles.modalHeader, isDark && { borderBottomColor: '#333' }]}>
              <ThemedText style={[styles.modalTitle, isDark && { color: '#fff' }]}>Apply Coupon</ThemedText>
              <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </ThemedView>
            
            {/* Coupon modal content */}
            
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveUsersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  livePulse: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Daily Bonus
  dailyBonusContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dailyBonusContainerDark: {
    backgroundColor: '#1E3A2B',
  },
  dailyBonusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyBonusTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  dailyBonusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dailyBonusDescription: {
    fontSize: 12,
    color: '#666',
  },

  // Quick Actions
  quickActionsContainer: {
    padding: 15,
    paddingTop: 10,
  },
  quickActionsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionItem: {
    width: Dimensions.get('window').width / 3 - 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Sections
  featuredContainer: {
    marginTop: 5,
    paddingHorizontal: 15,
  },
  recentWinnersContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  topPlayersContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeaderDark: {
    borderBottomColor: '#333',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '500',
  },

  // Featured Contests
  contestListContainer: {
    paddingRight: 5,
    paddingBottom: 10,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredContent: {
    flex: 1,
    padding: 15,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  featuredDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  featuredDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredDetailText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  featuredJoinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  joinButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  featuredJoinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Winners
  winnersListContainer: {
    paddingRight: 5,
    paddingBottom: 10,
  },
  winnerCard: {
    width: Dimensions.get('window').width * 0.7,
    marginRight: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  winnerCardDark: {
    backgroundColor: '#1E2A38',
    shadowOpacity: 0.3,
  },
  winnerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  winnerIconContainerDark: {
    backgroundColor: '#333',
  },
  winnerEmoji: {
    fontSize: 20,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  winnerTime: {
    fontSize: 11,
    color: '#999',
  },
  winnerAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 2,
  },
  
  // Top Players
  topPlayersList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topPlayersListDark: {
    backgroundColor: '#1E2A38',
    shadowOpacity: 0.3,
  },
  topPlayerItem: {
    marginBottom: 10,
  },
  topPlayerItemDark: {
    borderBottomColor: '#333',
  },
  topPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topPlayerCardDark: {
    borderBottomColor: '#333',
  },
  playerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerIconContainerDark: {
    backgroundColor: '#333',
  },
  playerEmoji: {
    fontSize: 18,
  },
  playerInfoContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerStats: {
    flexDirection: 'row',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statBadgeDark: {
    backgroundColor: 'rgba(255, 248, 225, 0.2)',
  },
  statText: {
    fontSize: 10,
    color: '#555',
    marginLeft: 2,
  },
  playerWinnings: {
    alignItems: 'flex-end',
  },
  playerWinningsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    maxHeight: '80%',
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  allWinnersListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  allTopPlayersListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  
  // Bonus Modal
  bonusContentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
  },
  bonusImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 20,
  },
  bonusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bonusDescription: {
    fontSize: 14,
    color: 'rgba(51, 51, 51, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  bonusAmountContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  bonusAmountContainerDark: {
    backgroundColor: '#1E3A2B',
  },
  bonusAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  claimButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  claimButtonDark: {
    backgroundColor: '#1976D2',
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Share,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import * as Animatable from 'react-native-animatable';

export type PrivateContest = {
  id: string;
  name: string;
  code: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  participants: number;
  status: 'waiting' | 'ongoing' | 'scheduled';
  scheduledTime?: Date;
  createdBy: string;
  type?: string;
};

type MyContestsProps = {
  contests: PrivateContest[];
  onStartContest: (contestId: string) => void;
  onEditContest: (contestId: string) => void;
  onCancelContest: (contestId: string) => void;
};

// Get the screen width to calculate card width
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px padding on each side

export const MyContests = ({
  contests,
  onStartContest,
  onEditContest,
  onCancelContest,
}: MyContestsProps) => {
  const { isDark } = useTheme();

  // Background patterns for different contest statuses
  const backgroundPatterns: Record<string, string> = {
    waiting: 'https://i.imgur.com/DuWrZ7o.png',
    ongoing: 'https://i.imgur.com/hENRRAy.png',
    scheduled: 'https://i.imgur.com/g8N0Smt.png'
  };

  // Background patterns for different contest types
  const contestTypePatterns: Record<string, string> = {
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    movies: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    knowledge: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    travel: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    history: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    art: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    technology: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bollywood: 'https://images.unsplash.com/photo-1618641986557-1ecd230959aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    politics: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    geography: 'https://images.unsplash.com/photo-1589519160732-576f165b9aad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    literature: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  };

  // Get a random emoji for contest cards
  const getRandomEmoji = () => {
    const emojis = ['🎮', '🎯', '🎪', '🎨', '🚀', '🎭', '🧩', '🎪', '🎡', '🧠'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const handleShareContest = async (contest: PrivateContest) => {
    try {
      await Share.share({
        message: `Join my Quizzoo private contest! Use code: ${contest.code} to join a ₹${contest.entryFee} contest with a prize pool of ₹${contest.prizePool}.`,
        title: 'Join My Quizzoo Contest',
      });
    } catch (error) {
      console.error('Error sharing contest:', error);
    }
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return 'Not scheduled';
    
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Starting soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return '#4CAF50';
      case 'scheduled':
        return '#2196F3';
      default:
        return '#FF9800';
    }
  };

  // Get readable status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      default:
        return 'Waiting';
    }
  };

  // Get contest background image based on type and status
  const getContestBackground = (contest: PrivateContest) => {
    // If contest has a type, use its specific image
    if (contest.type && contestTypePatterns[contest.type]) {
      return contestTypePatterns[contest.type];
    }
    
    // If no type or type not found, fallback to status-based background
    return backgroundPatterns[contest.status] || backgroundPatterns.waiting;
  }

  const renderItem = ({ item, index }: { item: PrivateContest; index: number }) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 100}
      duration={600}
      style={styles.animatedCard}
    >
      <ImageBackground
        source={{ uri: getContestBackground(item) }}
        style={[
          styles.contestCard,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
        ]}
        imageStyle={styles.cardBackgroundPattern}
      >
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Ionicons 
            name={
              item.status === 'ongoing' 
                ? 'play-circle' 
                : item.status === 'scheduled' 
                  ? 'calendar' 
                  : 'hourglass'
            } 
            size={14} 
            color="#fff" 
          />
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>

        {/* Random Emoji Decoration */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emojiText}>{getRandomEmoji()}</Text>
        </View>

        {/* Contest Name */}
        <Text style={[
          styles.contestName,
          { color: isDark ? '#FFFFFF' : '#333333' }
        ]}>
          {item.name}
        </Text>

        {/* Contest Code Display */}
        <View style={styles.codeContainer}>
          <Text style={[
            styles.codeLabel,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            Contest Code:
          </Text>
          <View style={styles.codeValueContainer}>
            <Text style={[
              styles.codeValue,
              { color: isDark ? Colors.dark.tint : Colors.light.tint }
            ]}>
              {item.code}
            </Text>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="currency-inr" 
              size={16} 
              color={isDark ? '#CCCCCC' : '#666666'} 
            />
            <Text style={[
              styles.detailLabel,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              Entry
            </Text>
            <Text style={[
              styles.detailValue,
              { color: isDark ? '#FFFFFF' : '#333333' }
            ]}>
              ₹{item.entryFee}
            </Text>
          </View>

          <View style={styles.detailSeparator} />

          <View style={styles.detailItem}>
            <Ionicons 
              name="trophy" 
              size={16} 
              color={isDark ? '#CCCCCC' : '#666666'} 
            />
            <Text style={[
              styles.detailLabel,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              Prize
            </Text>
            <Text style={[
              styles.detailValue,
              { color: isDark ? '#FFFFFF' : '#333333' }
            ]}>
              ₹{item.prizePool}
            </Text>
          </View>

          <View style={styles.detailSeparator} />

          <View style={styles.detailItem}>
            <Ionicons 
              name="people" 
              size={16} 
              color={isDark ? '#CCCCCC' : '#666666'} 
            />
            <Text style={[
              styles.detailLabel,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              Players
            </Text>
            <Text style={[
              styles.detailValue,
              { color: isDark ? '#FFFFFF' : '#333333' }
            ]}>
              {item.participants}/{item.maxParticipants}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${(item.participants / item.maxParticipants) * 100}%`,
                  backgroundColor: getStatusColor(item.status) 
                }
              ]} 
            />
          </View>
        </View>

        {/* Schedule Info if available */}
        {item.scheduledTime && (
          <View style={styles.scheduleInfo}>
            <Ionicons name="time-outline" size={16} color={isDark ? '#CCCCCC' : '#666666'} />
            <Text style={[
              styles.scheduleText,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              {formatDateTime(item.scheduledTime)} ({getTimeRemaining(item.scheduledTime)})
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {item.status !== 'ongoing' && (
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: '#4CAF50' }
              ]}
              onPress={() => onStartContest(item.id)}
            >
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={styles.actionText}>Start</Text>
            </TouchableOpacity>
          )}

          {item.status !== 'ongoing' && (
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: '#2196F3' }
              ]}
              onPress={() => onEditContest(item.id)}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[
              styles.actionButton,
              { backgroundColor: '#9C27B0' }
            ]}
            onPress={() => handleShareContest(item)}
          >
            <Ionicons name="share-social-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          {item.status !== 'ongoing' && (
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: '#F44336' }
              ]}
              onPress={() => onCancelContest(item.id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#fff" />
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Animatable.Text 
          animation="fadeIn" 
          style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}
        >
          My Private Contests
        </Animatable.Text>
        
        <Animatable.Text
          animation="fadeIn"
          delay={200}
          style={[
            styles.subtitle,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}
        >
          {contests.length === 0 
            ? "You haven't created any contests yet"
            : `You have ${contests.length} private contest${contests.length !== 1 ? 's' : ''}`}
        </Animatable.Text>
      </View>

      {contests.length === 0 ? (
        <Animatable.View 
          animation="fadeIn" 
          delay={300}
          style={styles.emptyContainer}
        >
          <Image 
            source={{ uri: 'https://i.imgur.com/Jy2T5g9.png' }} 
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={[
            styles.emptyText,
            { color: isDark ? '#FFFFFF' : '#333333' }
          ]}>
            Create your first contest now!
          </Text>
        </Animatable.View>
      ) : (
        <FlatList
          data={contests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  animatedCard: {
    marginBottom: 20,
  },
  contestCard: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardBackgroundPattern: {
    opacity: 0.05,
  },
  contestName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingRight: 40, // Space for emoji
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emojiContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emojiText: {
    fontSize: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  codeValueContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailLabel: {
    fontSize: 12,
    marginVertical: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 10,
    borderRadius: 12,
  },
  scheduleText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 50,
    flex: 1,
    marginHorizontal: 4,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 
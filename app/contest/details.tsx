import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';

export default function ContestDetails() {
  const { isDark } = useTheme();
  
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const accentColor = '#4338CA';
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Contest Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.contestTitle, { color: textColor }]}>Standard Quiz S3</Text>
          <Text style={[styles.contestCategory, { color: mutedColor }]}>General Knowledge</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textColor }]}>₹50</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Entry Fee</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textColor }]}>10</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Players</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textColor }]}>₹450</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Prize Pool</Text>
            </View>
          </View>
          
          <View style={styles.playerCountContainer}>
            <Text style={[styles.playerCountLabel, { color: mutedColor }]}>
              Players Joined: 7/10
            </Text>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: isDark ? '#334155' : '#E2E8F0' }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { width: '70%', backgroundColor: accentColor }
                  ]}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.startTimeContainer}>
            <Ionicons name="time-outline" size={20} color={mutedColor} />
            <Text style={[styles.startTimeText, { color: mutedColor }]}>
              Starting in 5 minutes
            </Text>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Prize Breakdown</Text>
          
          <View style={styles.prizeItem}>
            <View style={styles.prizeRank}>
              <Text style={styles.prizeRankText}>1st</Text>
            </View>
            <View style={styles.prizeInfo}>
              <Text style={[styles.prizeAmount, { color: textColor }]}>₹225</Text>
              <Text style={[styles.prizePercent, { color: mutedColor }]}>50% of prize pool</Text>
            </View>
          </View>
          
          <View style={styles.prizeItem}>
            <View style={[styles.prizeRank, { backgroundColor: '#94A3B8' }]}>
              <Text style={styles.prizeRankText}>2nd</Text>
            </View>
            <View style={styles.prizeInfo}>
              <Text style={[styles.prizeAmount, { color: textColor }]}>₹135</Text>
              <Text style={[styles.prizePercent, { color: mutedColor }]}>30% of prize pool</Text>
            </View>
          </View>
          
          <View style={styles.prizeItem}>
            <View style={[styles.prizeRank, { backgroundColor: '#CBD5E1' }]}>
              <Text style={styles.prizeRankText}>3rd</Text>
            </View>
            <View style={styles.prizeInfo}>
              <Text style={[styles.prizeAmount, { color: textColor }]}>₹90</Text>
              <Text style={[styles.prizePercent, { color: mutedColor }]}>20% of prize pool</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Game Format</Text>
          
          <View style={styles.formatItem}>
            <Ionicons name="help-circle-outline" size={20} color={accentColor} />
            <Text style={[styles.formatText, { color: textColor }]}>10 questions</Text>
          </View>
          
          <View style={styles.formatItem}>
            <Ionicons name="timer-outline" size={20} color={accentColor} />
            <Text style={[styles.formatText, { color: textColor }]}>6 seconds per question</Text>
          </View>
          
          <View style={styles.formatItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={accentColor} />
            <Text style={[styles.formatText, { color: textColor }]}>Multiple choice answers</Text>
          </View>
          
          <View style={styles.formatItem}>
            <Ionicons name="flash-outline" size={20} color={accentColor} />
            <Text style={[styles.formatText, { color: textColor }]}>Points based on speed + accuracy</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.winChanceContainer}>
            <Text style={[styles.winChanceText, { color: mutedColor }]}>
              30% chance to win a prize
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => {
              try {
                // Using relative link format
                router.push({
                  pathname: "../game/[id]", 
                  params: { 
                    id: "quiz",
                    contestId: "S3", 
                    poolId: "S3", 
                    mode: "contest", 
                    difficulty: "medium" 
                  }
                });
              } catch (error) {
                console.error("Navigation error:", error);
                Alert.alert("Navigation Error", "Could not start the quiz. Please try again.");
              }
            }}
          >
            <Text style={styles.joinButtonText}>Join Contest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contestCategory: {
    fontSize: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  divider: {
    width: 1,
    backgroundColor: '#CBD5E1',
  },
  playerCountContainer: {
    marginBottom: 16,
  },
  playerCountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  startTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTimeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prizeRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prizeRankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  prizeInfo: {
    flex: 1,
  },
  prizeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prizePercent: {
    fontSize: 14,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formatText: {
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    marginTop: 8,
    marginBottom: 32,
  },
  winChanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  winChanceText: {
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#4338CA',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 
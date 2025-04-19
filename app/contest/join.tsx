import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';

export default function JoinContest() {
  const { isDark } = useTheme();
  const [contestCode, setContestCode] = useState('');
  
  const handleJoin = () => {
    console.log('Joining contest with code:', contestCode);
    // Navigate directly to the game/quiz screen to avoid any redirect issues
    if (contestCode.length === 6) {
      try {
        // Using relative link format
        router.push({
          pathname: "../game/[id]", 
          params: { 
            id: "quiz",
            contestId: contestCode, 
            poolId: "S3", // Default pool ID 
            mode: "contest", 
            difficulty: "medium" 
          }
        });
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert("Navigation Error", "Could not start the quiz. Please try again.");
      }
    }
  };
  
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const inputBg = isDark ? '#334155' : '#F1F5F9';
  const mutedColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Join Contest</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: textColor }]}>Enter Contest Code</Text>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Enter the 6-digit code to join a private contest
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: textColor,
                  borderColor: borderColor,
                }
              ]}
              placeholder="Enter 6-digit code"
              placeholderTextColor={mutedColor}
              keyboardType="number-pad"
              maxLength={6}
              value={contestCode}
              onChangeText={setContestCode}
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.joinButton,
              { opacity: contestCode.length === 6 ? 1 : 0.7 }
            ]}
            onPress={handleJoin}
            disabled={contestCode.length !== 6}
          >
            <Text style={styles.joinButtonText}>Join Contest</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.infoTitle, { color: textColor }]}>How to Join a Contest</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={[styles.infoText, { color: mutedColor }]}>
              Ask your friend for their contest's 6-digit code
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={[styles.infoText, { color: mutedColor }]}>
              Enter the code in the field above
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <Text style={[styles.infoText, { color: mutedColor }]}>
              Tap "Join Contest" and wait for other players
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('./create')}
        >
          <Text style={styles.createButtonText}>Create Your Own Contest</Text>
        </TouchableOpacity>
      </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  joinButton: {
    backgroundColor: '#4338CA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
  },
  createButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
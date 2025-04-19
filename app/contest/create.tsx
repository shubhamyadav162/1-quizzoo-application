import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/app/lib/ThemeContext';

export default function CreateContest() {
  const { isDark } = useTheme();
  const [contestName, setContestName] = useState('');
  const [entryFee, setEntryFee] = useState('50');
  const [playerCount, setPlayerCount] = useState('10');
  const [isPrivate, setIsPrivate] = useState(true);
  
  const handleCreate = () => {
    try {
      // Assume creation is successful for now
      // TODO: Implement actual contest creation logic
      
      // Redirect to home screen instead of waiting room
      router.replace('/(tabs)');
      Alert.alert("Success", "Contest created (placeholder)! Game screens disabled.");

      // router.push('/contest/waiting-room'); // Old navigation
    } catch (error) {
      console.error("Error creating contest:", error);
      Alert.alert("Error", "Failed to create contest. Please try again later.");
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Create Contest</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formCard, { backgroundColor: cardBg }]}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Contest Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: textColor,
                  borderColor: borderColor,
                }
              ]}
              placeholder="Enter contest name"
              placeholderTextColor={mutedColor}
              value={contestName}
              onChangeText={setContestName}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Entry Fee (₹)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  color: textColor,
                  borderColor: borderColor,
                }
              ]}
              placeholder="50"
              placeholderTextColor={mutedColor}
              keyboardType="number-pad"
              value={entryFee}
              onChangeText={setEntryFee}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Number of Players</Text>
            <View style={styles.segmentedControl}>
              {['2', '10', '20', '50'].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.segmentButton,
                    playerCount === count && { backgroundColor: '#4338CA' },
                    {
                      borderColor: borderColor,
                    }
                  ]}
                  onPress={() => setPlayerCount(count)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: playerCount === count ? '#FFFFFF' : textColor,
                      }
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Category</Text>
            <View style={[
              styles.selectBox,
              {
                backgroundColor: inputBg,
                borderColor: borderColor,
              }
            ]}>
              <Text style={{ color: textColor }}>General Knowledge</Text>
              <Ionicons name="chevron-down" size={20} color={textColor} />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: textColor }]}>Private Contest</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: mutedColor, true: '#4338CA' }}
                thumbColor={'#FFFFFF'}
              />
            </View>
            <Text style={[styles.switchHelpText, { color: mutedColor }]}>
              Private contests are only visible to people with the contest code
            </Text>
          </View>
        </View>
        
        <View style={[styles.previewCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.previewTitle, { color: textColor }]}>Contest Preview</Text>
          
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { color: mutedColor }]}>Entry Fee:</Text>
            <Text style={[styles.previewValue, { color: textColor }]}>₹{entryFee || '0'}</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { color: mutedColor }]}>Players:</Text>
            <Text style={[styles.previewValue, { color: textColor }]}>{playerCount}</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { color: mutedColor }]}>Total Pool:</Text>
            <Text style={[styles.previewValue, { color: textColor }]}>
              ₹{(parseInt(entryFee || '0') * parseInt(playerCount || '0')) || '0'}
            </Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { color: mutedColor }]}>Platform Fee (10%):</Text>
            <Text style={[styles.previewValue, { color: textColor }]}>
              ₹{Math.round((parseInt(entryFee || '0') * parseInt(playerCount || '0')) * 0.1) || '0'}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { color: mutedColor }]}>Net Prize Pool:</Text>
            <Text style={[styles.previewValue, { color: '#4338CA', fontWeight: 'bold' }]}>
              ₹{Math.round((parseInt(entryFee || '0') * parseInt(playerCount || '0')) * 0.9) || '0'}
            </Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={[styles.previewLabel, { color: mutedColor }]}>1st Place (50%):</Text>
            <Text style={[styles.previewValue, { color: textColor }]}>
              ₹{Math.round((parseInt(entryFee || '0') * parseInt(playerCount || '0')) * 0.9 * 0.5) || '0'}
            </Text>
          </View>
          
          {playerCount !== '2' && (
            <>
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: mutedColor }]}>2nd Place (30%):</Text>
                <Text style={[styles.previewValue, { color: textColor }]}>
                  ₹{Math.round((parseInt(entryFee || '0') * parseInt(playerCount || '0')) * 0.9 * 0.3) || '0'}
                </Text>
              </View>
              
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: mutedColor }]}>3rd Place (20%):</Text>
                <Text style={[styles.previewValue, { color: textColor }]}>
                  ₹{Math.round((parseInt(entryFee || '0') * parseInt(playerCount || '0')) * 0.9 * 0.2) || '0'}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>Create Contest</Text>
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
  formCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  segmentText: {
    fontWeight: 'bold',
  },
  selectBox: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchHelpText: {
    fontSize: 14,
  },
  previewCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 15,
  },
  previewValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 12,
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
  },
  createButton: {
    backgroundColor: '#4338CA',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
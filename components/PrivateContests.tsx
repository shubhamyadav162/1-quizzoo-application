import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

type CreateContestParams = {
  entryFee: number;
  playerCount: number;
  contestName: string;
};

type PrivateContestsProps = {
  onCreateContest: (params: CreateContestParams) => void;
  onJoinContest: (code: string) => void;
};

export const PrivateContests = ({
  onCreateContest,
  onJoinContest,
}: PrivateContestsProps) => {
  const { isDark } = useTheme();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [entryFee, setEntryFee] = useState('');
  const [playerCount, setPlayerCount] = useState('10');
  const [contestName, setContestName] = useState('');
  const [contestCode, setContestCode] = useState('');

  const validateEntryFee = () => {
    const fee = parseInt(entryFee, 10);
    if (isNaN(fee) || fee < 10 || fee > 500) {
      Alert.alert('Invalid Entry Fee', 'Entry fee must be between ₹10 and ₹500');
      return false;
    }
    return true;
  };

  const validatePlayerCount = () => {
    const count = parseInt(playerCount, 10);
    if (isNaN(count) || count < 2 || count > 50) {
      Alert.alert('Invalid Player Count', 'Player count must be between 2 and 50');
      return false;
    }
    return true;
  };

  const validateContestName = () => {
    if (!contestName.trim()) {
      Alert.alert('Invalid Contest Name', 'Please enter a valid contest name');
      return false;
    }
    return true;
  };

  const validateContestCode = () => {
    if (!contestCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a valid contest code');
      return false;
    }
    return true;
  };

  const handleCreateContest = () => {
    if (validateEntryFee() && validatePlayerCount() && validateContestName()) {
      onCreateContest({
        entryFee: parseInt(entryFee, 10),
        playerCount: parseInt(playerCount, 10),
        contestName: contestName.trim()
      });
      setEntryFee('');
      setPlayerCount('10');
      setContestName('');
      setCreateModalVisible(false);
    }
  };

  const handleJoinContest = () => {
    if (validateContestCode()) {
      onJoinContest(contestCode);
      setContestCode('');
      setJoinModalVisible(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
          ]}
          onPress={() => setCreateModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDark ? '#444' : '#f0f0f0' }
          ]}
          onPress={() => setJoinModalVisible(true)}
        >
          <Ionicons name="enter-outline" size={24} color={isDark ? '#fff' : '#333'} />
          <Text style={[
            styles.buttonText,
            { color: isDark ? '#fff' : '#333' }
          ]}>Join</Text>
        </TouchableOpacity>
      </View>

      {/* Create Contest Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#222' : '#fff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#fff' : '#333' }
              ]}>
                Create Private Contest
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={[
                styles.label,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                Contest Name
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  backgroundColor: isDark ? '#333' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#ddd'
                }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { color: isDark ? '#fff' : '#333' }
                  ]}
                  placeholder="Enter contest name"
                  placeholderTextColor={isDark ? '#888' : '#aaa'}
                  value={contestName}
                  onChangeText={setContestName}
                  maxLength={30}
                />
              </View>

              <Text style={[
                styles.label,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                Entry Fee (₹10-₹500)
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  backgroundColor: isDark ? '#333' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#ddd'
                }
              ]}>
                <Text style={[
                  styles.currencySymbol,
                  { color: isDark ? '#fff' : '#333' }
                ]}>₹</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: isDark ? '#fff' : '#333' }
                  ]}
                  placeholder="Enter amount"
                  placeholderTextColor={isDark ? '#888' : '#aaa'}
                  keyboardType="number-pad"
                  value={entryFee}
                  onChangeText={setEntryFee}
                />
              </View>

              <Text style={[
                styles.label,
                { color: isDark ? '#ccc' : '#666' }
              ]}>
                Player Count (2-50)
              </Text>
              <View style={styles.playerCountOptions}>
                {[2, 10, 20, 50].map((count) => (
                  <TouchableOpacity 
                    key={count}
                    style={[
                      styles.playerCountOption,
                      {
                        backgroundColor: parseInt(playerCount, 10) === count
                          ? isDark ? Colors.dark.tint : Colors.light.tint
                          : isDark ? '#333' : '#f5f5f5',
                        borderColor: isDark ? '#444' : '#ddd'
                      }
                    ]}
                    onPress={() => setPlayerCount(count.toString())}
                  >
                    <Text style={[
                      styles.playerCountText,
                      {
                        color: parseInt(playerCount, 10) === count
                          ? '#fff'
                          : isDark ? '#fff' : '#333'
                      }
                    ]}>
                      {count === 2 ? '1v1' : `${count}-Players`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  backgroundColor: isDark ? '#333' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#ddd',
                  marginTop: 8
                }
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { color: isDark ? '#fff' : '#333' }
                  ]}
                  placeholder="Custom player count"
                  placeholderTextColor={isDark ? '#888' : '#aaa'}
                  keyboardType="number-pad"
                  value={playerCount}
                  onChangeText={setPlayerCount}
                />
              </View>

              <View style={styles.summaryContainer}>
                <Text style={[
                  styles.summaryTitle,
                  { color: isDark ? '#fff' : '#333' }
                ]}>
                  Contest Summary
                </Text>
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: isDark ? '#ccc' : '#666' }]}>
                    Entry Fee
                  </Text>
                  <Text style={[styles.summaryValue, { color: isDark ? '#fff' : '#333' }]}>
                    {entryFee ? `₹${entryFee}` : '--'}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: isDark ? '#ccc' : '#666' }]}>
                    Player Count
                  </Text>
                  <Text style={[styles.summaryValue, { color: isDark ? '#fff' : '#333' }]}>
                    {playerCount || '--'}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: isDark ? '#ccc' : '#666' }]}>
                    Total Prize Pool
                  </Text>
                  <Text style={[styles.summaryValue, { color: isDark ? '#fff' : '#333' }]}>
                    {entryFee && playerCount 
                      ? `₹${parseInt(entryFee, 10) * parseInt(playerCount, 10) * 0.9}` 
                      : '--'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
              ]}
              onPress={handleCreateContest}
            >
              <Text style={styles.actionButtonText}>Create Contest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Contest Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#222' : '#fff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#fff' : '#333' }
              ]}>
                Join Private Contest
              </Text>
              <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
              </TouchableOpacity>
            </View>

            <Text style={[
              styles.label,
              { color: isDark ? '#ccc' : '#666' }
            ]}>
              Contest Code
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: isDark ? '#333' : '#f5f5f5',
                borderColor: isDark ? '#444' : '#ddd'
              }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  { color: isDark ? '#fff' : '#333' }
                ]}
                placeholder="Enter contest code"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={contestCode}
                onChangeText={setContestCode}
                autoCapitalize="characters"
              />
            </View>

            <Text style={[
              styles.helpText,
              { color: isDark ? '#aaa' : '#777' }
            ]}>
              Enter the 6-character code provided by the contest creator
            </Text>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint }
              ]}
              onPress={handleJoinContest}
            >
              <Text style={styles.actionButtonText}>Join Contest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    flex: 1,
    marginHorizontal: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: '80%',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  playerCountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  playerCountOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  playerCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 20,
    textAlign: 'center',
  },
}); 
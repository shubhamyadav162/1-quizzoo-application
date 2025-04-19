import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useTheme } from '@/app/lib/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import contestApi, { Contest } from '@/app/lib/api';

type CreateContestModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (contestId: string) => void;
};

export const CreateContestModal = ({ visible, onClose, onSuccess }: CreateContestModalProps) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState('10');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [contestType, setContestType] = useState('standard');
  const [isInstant, setIsInstant] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 30 * 60 * 1000)); // 30 mins from now
  
  // Simple date picker modal states
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(Date.now() + 30 * 60 * 1000));
  const [datePickerView, setDatePickerView] = useState<'date' | 'time'>('date');
  
  // Calculate prize pool based on entry fee and max participants
  const calculatePrizePool = () => {
    const fee = parseFloat(entryFee) || 0;
    const participants = parseInt(maxParticipants) || 0;
    return fee * participants;
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const dateStr = date.toDateString();
    
    if (dateStr === today.toDateString()) {
      return `Today at ${formattedHours}:${formattedMinutes} ${ampm}`;
    } else if (dateStr === tomorrow.toDateString()) {
      return `Tomorrow at ${formattedHours}:${formattedMinutes} ${ampm}`;
    } else {
      return `${date.toLocaleDateString()} at ${formattedHours}:${formattedMinutes} ${ampm}`;
    }
  };
  
  // Toggle datetime picker modal
  const toggleDatePicker = () => {
    setTempDate(startDate);
    setDatePickerView('date');
    setShowDatePickerModal(true);
  };
  
  // Handle date confirmation
  const handleConfirmDate = () => {
    setStartDate(tempDate);
    setShowDatePickerModal(false);
  };
  
  // Reset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setEntryFee('10');
    setMaxParticipants('10');
    setContestType('standard');
    setIsInstant(false);
    setStartDate(new Date(Date.now() + 30 * 60 * 1000));
  };
  
  // Create contest
  const handleCreateContest = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a contest name');
      return;
    }
    
    if (parseFloat(entryFee) <= 0) {
      Alert.alert('Error', 'Entry fee must be greater than 0');
      return;
    }
    
    if (parseInt(maxParticipants) <= 1) {
      Alert.alert('Error', 'Maximum participants must be at least 2');
      return;
    }
    
    if (!isInstant && startDate.getTime() <= Date.now()) {
      Alert.alert('Error', 'Start time must be in the future');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create contest data
      const contestData: Partial<Contest> = {
        name,
        description: description.trim() || undefined,
        entry_fee: parseFloat(entryFee),
        max_participants: parseInt(maxParticipants),
        total_prize_pool: calculatePrizePool(),
        platform_fee_percentage: 10, // Default 10%
        status: 'upcoming',
        is_instant: isInstant,
        contest_type: contestType
      };
      
      // Add start time for scheduled contests
      if (!isInstant) {
        contestData.start_time = startDate.toISOString();
      }
      
      // Call API to create contest
      const contestId = await contestApi.createContest(contestData);
      
      if (contestId) {
        Alert.alert(
          'Success',
          `Contest "${name}" has been created successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
                if (onSuccess) {
                  onSuccess(contestId);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create contest. Please try again.');
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update date in the custom date picker
  const updateDate = (type: 'year' | 'month' | 'day' | 'hour' | 'minute', value: number) => {
    const newDate = new Date(tempDate);
    
    switch (type) {
      case 'year':
        newDate.setFullYear(value);
        break;
      case 'month':
        newDate.setMonth(value);
        break;
      case 'day':
        newDate.setDate(value);
        break;
      case 'hour':
        newDate.setHours(value);
        break;
      case 'minute':
        newDate.setMinutes(value);
        break;
    }
    
    setTempDate(newDate);
  };
  
  // Generate options for pickers
  const generateOptions = (start: number, end: number) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i);
    }
    return options;
  };
  
  // Custom date picker modal
  const renderDatePickerModal = () => {
    const currentDate = new Date();
    const years = generateOptions(currentDate.getFullYear(), currentDate.getFullYear() + 1);
    const months = generateOptions(0, 11);
    const days = generateOptions(1, 31); // Simplified, doesn't account for month variations
    const hours = generateOptions(0, 23);
    const minutes = generateOptions(0, 59);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return (
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.datePickerModalContainer}>
          <View style={[
            styles.datePickerModalContent,
            { backgroundColor: isDark ? '#262626' : '#FFFFFF' }
          ]}>
            <View style={styles.datePickerHeader}>
              <Text style={[
                styles.datePickerTitle,
                { color: isDark ? '#FFFFFF' : '#111827' }
              ]}>
                {datePickerView === 'date' ? 'Select Date' : 'Select Time'}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
            </View>
            
            {datePickerView === 'date' ? (
              <View style={styles.dateSelectionContainer}>
                <View style={styles.datePickerRow}>
                  <Text style={[styles.datePickerLabel, { color: isDark ? '#D4D4D8' : '#4B5563' }]}>Year</Text>
                  <ScrollView 
                    style={styles.datePickerScrollView}
                    contentContainerStyle={styles.datePickerScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {years.map(year => (
                      <TouchableOpacity
                        key={`year-${year}`}
                        style={[
                          styles.dateOption,
                          { backgroundColor: tempDate.getFullYear() === year ? 
                            (isDark ? '#3B82F6' : '#6366F1') : 'transparent' }
                        ]}
                        onPress={() => updateDate('year', year)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          { 
                            color: tempDate.getFullYear() === year ? '#FFFFFF' : (isDark ? '#D4D4D8' : '#4B5563'),
                            fontWeight: tempDate.getFullYear() === year ? 'bold' : 'normal'
                          }
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.datePickerRow}>
                  <Text style={[styles.datePickerLabel, { color: isDark ? '#D4D4D8' : '#4B5563' }]}>Month</Text>
                  <ScrollView 
                    style={styles.datePickerScrollView}
                    contentContainerStyle={styles.datePickerScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {months.map(month => (
                      <TouchableOpacity
                        key={`month-${month}`}
                        style={[
                          styles.dateOption,
                          { backgroundColor: tempDate.getMonth() === month ? 
                            (isDark ? '#3B82F6' : '#6366F1') : 'transparent' }
                        ]}
                        onPress={() => updateDate('month', month)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          { 
                            color: tempDate.getMonth() === month ? '#FFFFFF' : (isDark ? '#D4D4D8' : '#4B5563'),
                            fontWeight: tempDate.getMonth() === month ? 'bold' : 'normal'
                          }
                        ]}>
                          {monthNames[month]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.datePickerRow}>
                  <Text style={[styles.datePickerLabel, { color: isDark ? '#D4D4D8' : '#4B5563' }]}>Day</Text>
                  <ScrollView 
                    style={styles.datePickerScrollView}
                    contentContainerStyle={styles.datePickerScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {days.map(day => (
                      <TouchableOpacity
                        key={`day-${day}`}
                        style={[
                          styles.dateOption,
                          { backgroundColor: tempDate.getDate() === day ? 
                            (isDark ? '#3B82F6' : '#6366F1') : 'transparent' }
                        ]}
                        onPress={() => updateDate('day', day)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          { 
                            color: tempDate.getDate() === day ? '#FFFFFF' : (isDark ? '#D4D4D8' : '#4B5563'),
                            fontWeight: tempDate.getDate() === day ? 'bold' : 'normal'
                          }
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={styles.dateSelectionContainer}>
                <View style={styles.datePickerRow}>
                  <Text style={[styles.datePickerLabel, { color: isDark ? '#D4D4D8' : '#4B5563' }]}>Hour</Text>
                  <ScrollView 
                    style={styles.datePickerScrollView}
                    contentContainerStyle={styles.datePickerScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {hours.map(hour => (
                      <TouchableOpacity
                        key={`hour-${hour}`}
                        style={[
                          styles.dateOption,
                          { backgroundColor: tempDate.getHours() === hour ? 
                            (isDark ? '#3B82F6' : '#6366F1') : 'transparent' }
                        ]}
                        onPress={() => updateDate('hour', hour)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          { 
                            color: tempDate.getHours() === hour ? '#FFFFFF' : (isDark ? '#D4D4D8' : '#4B5563'),
                            fontWeight: tempDate.getHours() === hour ? 'bold' : 'normal'
                          }
                        ]}>
                          {hour < 10 ? `0${hour}` : hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.datePickerRow}>
                  <Text style={[styles.datePickerLabel, { color: isDark ? '#D4D4D8' : '#4B5563' }]}>Minute</Text>
                  <ScrollView 
                    style={styles.datePickerScrollView}
                    contentContainerStyle={styles.datePickerScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {minutes.map(minute => (
                      <TouchableOpacity
                        key={`minute-${minute}`}
                        style={[
                          styles.dateOption,
                          { backgroundColor: tempDate.getMinutes() === minute ? 
                            (isDark ? '#3B82F6' : '#6366F1') : 'transparent' }
                        ]}
                        onPress={() => updateDate('minute', minute)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          { 
                            color: tempDate.getMinutes() === minute ? '#FFFFFF' : (isDark ? '#D4D4D8' : '#4B5563'),
                            fontWeight: tempDate.getMinutes() === minute ? 'bold' : 'normal'
                          }
                        ]}>
                          {minute < 10 ? `0${minute}` : minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
            
            <View style={styles.datePickerButtons}>
              {datePickerView === 'date' ? (
                <TouchableOpacity
                  style={[styles.datePickerActionButton, { backgroundColor: isDark ? '#3B82F6' : '#6366F1' }]}
                  onPress={() => setDatePickerView('time')}
                >
                  <Text style={styles.datePickerButtonText}>Next: Set Time</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.datePickerButtonRow}>
                  <TouchableOpacity
                    style={[styles.datePickerButtonSmall, { backgroundColor: isDark ? '#4B5563' : '#E5E7EB' }]}
                    onPress={() => setDatePickerView('date')}
                  >
                    <Text style={[styles.datePickerButtonText, { color: isDark ? '#FFFFFF' : '#111827' }]}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.datePickerButtonSmall, { backgroundColor: isDark ? '#3B82F6' : '#6366F1' }]}
                    onPress={handleConfirmDate}
                  >
                    <Text style={styles.datePickerButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <View style={[
          styles.modalContent,
          { backgroundColor: isDark ? '#262626' : '#FFFFFF' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              Create New Contest
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            {/* Contest Name */}
            <View style={styles.formGroup}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D4D4D8' : '#4B5563' }
              ]}>
                Contest Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#3F3F46' : '#F9FAFB',
                    color: isDark ? '#FFFFFF' : '#111827',
                    borderColor: isDark ? '#52525B' : '#E5E7EB'
                  }
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter contest name"
                placeholderTextColor={isDark ? '#A1A1AA' : '#9CA3AF'}
              />
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D4D4D8' : '#4B5563' }
              ]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { 
                    backgroundColor: isDark ? '#3F3F46' : '#F9FAFB',
                    color: isDark ? '#FFFFFF' : '#111827',
                    borderColor: isDark ? '#52525B' : '#E5E7EB'
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter contest description"
                placeholderTextColor={isDark ? '#A1A1AA' : '#9CA3AF'}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            {/* Entry Fee */}
            <View style={styles.formGroup}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D4D4D8' : '#4B5563' }
              ]}>
                Entry Fee (₹)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#3F3F46' : '#F9FAFB',
                    color: isDark ? '#FFFFFF' : '#111827',
                    borderColor: isDark ? '#52525B' : '#E5E7EB'
                  }
                ]}
                value={entryFee}
                onChangeText={setEntryFee}
                placeholder="Enter entry fee"
                placeholderTextColor={isDark ? '#A1A1AA' : '#9CA3AF'}
                keyboardType="numeric"
              />
            </View>
            
            {/* Max Participants */}
            <View style={styles.formGroup}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D4D4D8' : '#4B5563' }
              ]}>
                Maximum Participants
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#3F3F46' : '#F9FAFB',
                    color: isDark ? '#FFFFFF' : '#111827',
                    borderColor: isDark ? '#52525B' : '#E5E7EB'
                  }
                ]}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder="Enter max participants"
                placeholderTextColor={isDark ? '#A1A1AA' : '#9CA3AF'}
                keyboardType="numeric"
              />
            </View>
            
            {/* Contest Type */}
            <View style={styles.formGroup}>
              <Text style={[
                styles.label,
                { color: isDark ? '#D4D4D8' : '#4B5563' }
              ]}>
                Contest Type
              </Text>
              <View style={styles.contestTypeButtons}>
                {['standard', 'medium', 'large', 'duel', 'special'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      contestType === type ? styles.typeButtonActive as any : undefined,
                      { 
                        backgroundColor: isDark 
                          ? contestType === type ? '#3B82F6' : '#3F3F46'
                          : contestType === type ? '#2563EB' : '#F3F4F6',
                      }
                    ]}
                    onPress={() => setContestType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      contestType === type ? styles.typeButtonTextActive as any : undefined,
                      { 
                        color: contestType === type 
                          ? '#FFFFFF' 
                          : isDark ? '#D4D4D8' : '#4B5563'
                      }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Instant or Scheduled */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={[
                  styles.label,
                  { color: isDark ? '#D4D4D8' : '#4B5563' }
                ]}>
                  Instant Match
                </Text>
                <Switch
                  value={isInstant}
                  onValueChange={(value) => setIsInstant(value)}
                  trackColor={{ false: isDark ? '#3F3F46' : '#E5E7EB', true: '#22C55E' }}
                  thumbColor={isInstant ? '#FFFFFF' : isDark ? '#D4D4D8' : '#FFFFFF'}
                />
              </View>
              <Text style={[
                styles.helperText,
                { color: isDark ? '#A1A1AA' : '#6B7280' }
              ]}>
                {isInstant 
                  ? 'Players can join and play immediately.' 
                  : 'Players register and play at the scheduled time.'}
              </Text>
            </View>
            
            {/* Start Time (for scheduled contests) - Custom Implementation */}
            {!isInstant && (
              <View style={styles.formGroup}>
                <Text style={[
                  styles.label,
                  { color: isDark ? '#D4D4D8' : '#4B5563' }
                ]}>
                  Start Time
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    { 
                      backgroundColor: isDark ? '#3F3F46' : '#F9FAFB',
                      borderColor: isDark ? '#52525B' : '#E5E7EB'
                    }
                  ]}
                  onPress={toggleDatePicker}
                >
                  <Text style={[
                    styles.datePickerText,
                    { color: isDark ? '#FFFFFF' : '#111827' }
                  ]}>
                    {formatDate(startDate)}
                  </Text>
                  <Ionicons 
                    name="calendar-outline" 
                    size={20} 
                    color={isDark ? '#D4D4D8' : '#6B7280'} 
                  />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Prize Pool Info */}
            <View style={[
              styles.prizePoolInfo,
              { backgroundColor: isDark ? '#3F3F46' : '#F3F4F6' }
            ]}>
              <Text style={[
                styles.prizePoolLabel,
                { color: isDark ? '#D4D4D8' : '#4B5563' }
              ]}>
                Total Prize Pool
              </Text>
              <Text style={[
                styles.prizePoolValue,
                { color: isDark ? '#FFFFFF' : '#111827' }
              ]}>
                ₹{calculatePrizePool()}
              </Text>
              <Text style={[
                styles.prizePoolSubtext,
                { color: isDark ? '#A1A1AA' : '#6B7280' }
              ]}>
                Platform fee: 10% (₹{calculatePrizePool() * 0.1})
              </Text>
              <Text style={[
                styles.prizePoolSubtext,
                { color: isDark ? '#A1A1AA' : '#6B7280' }
              ]}>
                Net prize pool: ₹{calculatePrizePool() * 0.9}
              </Text>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { opacity: loading ? 0.7 : 1 }
              ]}
              onPress={handleCreateContest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Create Contest
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      
      {/* Custom Date Picker Modal */}
      {renderDatePickerModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  contestTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    // Remove fontWeight here, it goes in text style
  },
  typeButtonText: {
    fontSize: 14,
  },
  typeButtonTextActive: {
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  datePickerButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
  },
  prizePoolInfo: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  prizePoolLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  prizePoolValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  prizePoolSubtext: {
    fontSize: 12,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#22C55E',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Custom Date Picker Modal Styles
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  datePickerModalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateSelectionContainer: {
    marginBottom: 20,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  datePickerLabel: {
    width: 60,
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerScrollView: {
    flex: 1,
    height: 120,
  },
  datePickerScrollContent: {
    paddingVertical: 8,
  },
  dateOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDateOption: {
    // Empty style - used only as a marker
  },
  dateOptionText: {
    fontSize: 16,
  },
  datePickerButtons: {
    marginTop: 16,
  },
  // Change the name of this style to avoid duplication with the one above
  datePickerActionButton: {
    backgroundColor: '#3B82F6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButtonSmall: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
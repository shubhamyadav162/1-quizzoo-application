import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Popular UPI apps
const UPI_APPS = [
  { id: 'googlepay', name: 'Google Pay', iconName: 'google-pay' },
  { id: 'phonepe', name: 'PhonePe', iconName: 'cellphone' },
  { id: 'paytm', name: 'Paytm', iconName: 'wallet' },
  { id: 'amazonpay', name: 'Amazon Pay', iconName: 'amazon' },
  { id: 'bhim', name: 'BHIM', iconName: 'currency-inr' },
];

export default function UpiWithdrawalScreen() {
  const { amount } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [upiId, setUpiId] = useState('');
  const [confirmUpiId, setConfirmUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveUpi, setSaveUpi] = useState(false);
  const [savedUpiIds, setSavedUpiIds] = useState<any[]>([]);
  const [processingFee, setProcessingFee] = useState(10);
  const [gstPercentage, setGstPercentage] = useState(18);
  
  useEffect(() => {
    fetchSavedUpiIds();
    fetchWithdrawalSettings();
  }, []);
  
  const fetchSavedUpiIds = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('upi_ids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSavedUpiIds(data);
        // Pre-fill with the most recent UPI ID
        const recentUpi = data[0];
        setUpiId(recentUpi.upi_id);
        setConfirmUpiId(recentUpi.upi_id);
        if (recentUpi.app_name) {
          setSelectedApp(recentUpi.app_name);
        }
      }
    } catch (error) {
      console.error('Error fetching saved UPI IDs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWithdrawalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('withdrawal_processing_fee, gst_percentage')
        .eq('id', '1')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProcessingFee(data.withdrawal_processing_fee || 10);
        setGstPercentage(data.gst_percentage || 18);
      }
    } catch (error) {
      console.error('Error fetching withdrawal settings:', error);
    }
  };
  
  const handleUpiIdChange = (text: string) => {
    setUpiId(text.toLowerCase());
  };
  
  const handleConfirmUpiIdChange = (text: string) => {
    setConfirmUpiId(text.toLowerCase());
  };
  
  const selectUpiApp = (appId: string) => {
    setSelectedApp(appId);
  };
  
  const isFormValid = () => {
    // Basic UPI ID validation - must contain @ symbol
    const isValidUpiId = upiId.includes('@') && upiId.length > 3;
    return isValidUpiId && upiId === confirmUpiId;
  };
  
  const calculateAmountAfterFees = () => {
    const withdrawalAmount = parseFloat(amount as string) || 0;
    const fee = processingFee;
    const gst = (fee * gstPercentage) / 100;
    const totalFee = fee + gst;
    
    return {
      originalAmount: withdrawalAmount,
      fee,
      gst,
      totalFee,
      finalAmount: Math.max(0, withdrawalAmount - totalFee),
    };
  };
  
  const handleSubmit = async () => {
    if (!isFormValid() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (!user?.id) {
        Alert.alert('Error', 'You need to be logged in to withdraw money');
        setIsLoading(false);
        return;
      }
      
      // Ensure we have valid numbers
      const withdrawalAmount = parseFloat(originalAmount.toFixed(2));
      
      const withdrawalData = {
        amount: withdrawalAmount,
        payment_method: 'UPI', // Exactly match what's in the database constraint
        description: `Withdrawal to UPI: ${upiId}`,
      };
      
      console.log('Attempting withdrawal with data:', JSON.stringify(withdrawalData));
      
      // First try to use the RPC function
      const { data, error } = await supabase.rpc('withdraw_money_from_wallet', {
        p_amount: withdrawalData.amount,
        p_payment_method: withdrawalData.payment_method,
        p_description: withdrawalData.description
      });
      
      if (error) {
        console.error('Error withdrawing money from wallet:', error);
        
        // If there was an error, show it to the user
        if (error.message && error.message.includes('insufficient balance')) {
          Alert.alert('Insufficient Balance', 'You do not have enough balance to complete this withdrawal.');
        } else {
          Alert.alert('Withdrawal Failed', 'There was an issue processing your withdrawal. Please try again later.');
        }
        
        setIsLoading(false);
        return;
      }
      
      console.log('Withdrawal successful:', data);
      
      // If the user wants to save this UPI ID for future use
      if (saveUpi && upiId) {
        try {
          await supabase
            .from('user_payment_methods')
            .upsert({
              user_id: user.id,
              method_type: 'upi',
              details: { upi_id: upiId, app: selectedApp || 'other' },
              is_default: savedUpiIds.length === 0, // Make default if it's the first one
              last_used: new Date().toISOString()
            });
        } catch (saveError) {
          // Just log this error but continue with the withdrawal
          console.error('Error saving UPI ID:', saveError);
        }
      }
      
      // Navigate to success screen
      router.push({
        pathname: '/wallet/withdraw/success',
        params: {
          amount: originalAmount.toString(),
          finalAmount: finalAmount.toString(),
          method: 'UPI',
          upiId: upiId
        }
      });
    } catch (e) {
      console.error('Withdrawal failed:', e);
      Alert.alert(
        'Withdrawal Failed',
        'There was an issue processing your withdrawal. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const { originalAmount, fee, gst, totalFee, finalAmount } = calculateAmountAfterFees();
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'UPI Withdrawal',
          headerShown: true,
        }} 
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Withdrawal Amount */}
          <Animatable.View animation="fadeInDown" duration={500} style={styles.amountContainer}>
            <ThemedText style={styles.amountLabel}>Withdrawal Amount</ThemedText>
            <ThemedText style={styles.amountValue}>
              ₹{originalAmount.toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.amountAfterFees}>
              You will receive: ₹{finalAmount.toFixed(2)}
              <ThemedText style={styles.feesText}> (after fees)</ThemedText>
            </ThemedText>
          </Animatable.View>
          
          {/* UPI Apps Selection */}
          <Animatable.View animation="fadeIn" duration={500} delay={100} style={styles.upiAppsSection}>
            <ThemedText style={styles.sectionTitle}>Select UPI App (Optional)</ThemedText>
            <View style={styles.upiAppsContainer}>
              {UPI_APPS.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={[
                    styles.upiAppButton,
                    selectedApp === app.id && { 
                      backgroundColor: isDark ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)',
                      borderColor: isDark ? 'rgba(76,175,80,0.4)' : 'rgba(76,175,80,0.3)',
                    }
                  ]}
                  onPress={() => selectUpiApp(app.id)}
                >
                  <MaterialCommunityIcons
                    name={app.iconName as any}
                    size={24}
                    color={
                      selectedApp === app.id
                        ? (isDark ? Colors.dark.tint : Colors.primary)
                        : (isDark ? Colors.dark.icon : Colors.light.icon)
                    }
                    style={styles.upiAppIcon}
                  />
                  <ThemedText style={[
                    styles.upiAppName,
                    selectedApp === app.id && { 
                      color: isDark ? Colors.dark.tint : Colors.primary,
                      fontWeight: '600',
                    }
                  ]}>
                    {app.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
          
          {/* UPI ID Form */}
          <Animatable.View animation="fadeIn" duration={500} delay={200} style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Enter UPI ID</ThemedText>
            
            <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
              <View style={[styles.formContainer, { 
                backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
              }]}>
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }]}
                  placeholder="UPI ID (e.g. name@upi)"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={upiId}
                  onChangeText={handleUpiIdChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }]}
                  placeholder="Confirm UPI ID"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={confirmUpiId}
                  onChangeText={handleConfirmUpiIdChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                
                {upiId && confirmUpiId && upiId !== confirmUpiId && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={Colors.error} style={styles.errorIcon} />
                    <ThemedText style={styles.errorText}>UPI IDs do not match</ThemedText>
                  </View>
                )}
                
                <TextInput
                  style={[styles.input, styles.noteInput, { 
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }]}
                  placeholder="Note (Optional)"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={withdrawalNote}
                  onChangeText={setWithdrawalNote}
                  multiline
                  numberOfLines={3}
                />
                
                <TouchableOpacity
                  style={styles.saveUpiContainer}
                  onPress={() => setSaveUpi(!saveUpi)}
                >
                  <View style={[styles.checkboxContainer, { 
                    backgroundColor: saveUpi ? Colors.primary : 'transparent',
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  }]}>
                    {saveUpi && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <ThemedText style={styles.saveUpiText}>
                    Save this UPI ID for future withdrawals
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Shadow>
          </Animatable.View>
          
          {/* Fee Breakdown */}
          <Animatable.View animation="fadeIn" duration={500} delay={300} style={styles.feesBreakdownSection}>
            <ThemedText style={styles.sectionTitle}>Fee Breakdown</ThemedText>
            
            <View style={[styles.feesBreakdownCard, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
            }]}>
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>Processing Fee</ThemedText>
                <ThemedText style={styles.feeValue}>₹{fee.toFixed(2)}</ThemedText>
              </View>
              
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>GST ({gstPercentage}%)</ThemedText>
                <ThemedText style={styles.feeValue}>₹{gst.toFixed(2)}</ThemedText>
              </View>
              
              <View style={[styles.feeRow, styles.totalRow]}>
                <ThemedText style={styles.totalFeeLabel}>Total Fees</ThemedText>
                <ThemedText style={styles.totalFeeValue}>₹{totalFee.toFixed(2)}</ThemedText>
              </View>
            </View>
          </Animatable.View>
          
          {/* Submit Button */}
          <Animatable.View animation="fadeInUp" duration={500} delay={400} style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, !isFormValid() && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!isFormValid() || isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={[styles.submitButtonGradient, !isFormValid() && { opacity: 0.6 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>
                    Request Withdrawal
                  </ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          
          {/* Information Note */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? Colors.dark.tint : Colors.primary} style={styles.infoIcon} />
            <ThemedText style={styles.infoText}>
              UPI withdrawals are typically processed within 24 hours after approval. Ensure your UPI ID is active and correctly entered.
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  amountAfterFees: {
    fontSize: 14,
    fontWeight: '600',
  },
  feesText: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  upiAppsSection: {
    marginBottom: 24,
  },
  upiAppsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  upiAppButton: {
    width: '30%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  upiAppIcon: {
    marginBottom: 8,
  },
  upiAppName: {
    fontSize: 12,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
  },
  saveUpiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  saveUpiText: {
    fontSize: 14,
  },
  feesBreakdownSection: {
    marginBottom: 24,
  },
  feesBreakdownCard: {
    borderRadius: 12,
    padding: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
    marginTop: 8,
    paddingTop: 12,
  },
  totalFeeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalFeeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  submitButtonContainer: {
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(33,150,243,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
}); 
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
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function BankWithdrawalScreen() {
  const { amount } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAccount, setSaveAccount] = useState(false);
  const [savedBankAccounts, setSavedBankAccounts] = useState<any[]>([]);
  const [processingFee, setProcessingFee] = useState(10);
  const [gstPercentage, setGstPercentage] = useState(18);
  
  useEffect(() => {
    fetchSavedBankAccounts();
    fetchWithdrawalSettings();
  }, []);
  
  const fetchSavedBankAccounts = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSavedBankAccounts(data);
        // Pre-fill with the most recent bank account
        const recentAccount = data[0];
        setAccountName(recentAccount.account_name);
        setAccountNumber(recentAccount.account_number);
        setConfirmAccountNumber(recentAccount.account_number);
        setIfscCode(recentAccount.ifsc_code);
        setBankName(recentAccount.bank_name || '');
        setBranch(recentAccount.branch || '');
      }
    } catch (error) {
      console.error('Error fetching saved bank accounts:', error);
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
  
  const handleIfscCodeChange = async (text: string) => {
    // Convert to uppercase
    const uppercase = text.toUpperCase();
    setIfscCode(uppercase);
    
    // Auto-fetch bank details if IFSC code is valid
    if (uppercase.length === 11) {
      try {
        setIsSaving(true);
        
        // In a real app, you would call an IFSC API to get bank details
        // For demo, we'll simulate it with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock response - in a real app, this would come from an API
        if (uppercase.startsWith('SBIN')) {
          setBankName('State Bank of India');
          setBranch('Main Branch');
        } else if (uppercase.startsWith('HDFC')) {
          setBankName('HDFC Bank');
          setBranch('City Branch');
        } else if (uppercase.startsWith('ICIC')) {
          setBankName('ICICI Bank');
          setBranch('Central Branch');
        } else {
          // For other codes, simulate a lookup
          setBankName('Example Bank');
          setBranch('Example Branch');
        }
      } catch (error) {
        console.error('Error fetching bank details:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Clear bank details if IFSC code is invalid
      setBankName('');
      setBranch('');
    }
  };
  
  const isFormValid = () => {
    return (
      accountName.length > 3 &&
      accountNumber.length >= 9 &&
      accountNumber === confirmAccountNumber &&
      ifscCode.length === 11 &&
      bankName.length > 0
    );
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
        payment_method: 'Bank Transfer', // Exactly match what's in the database constraint
        description: `Withdrawal to Bank Account: ${accountNumber.slice(-4)}`,
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
      
      // If the user wants to save this bank account for future use
      if (saveAccount) {
        try {
          await supabase
            .from('user_payment_methods')
            .upsert({
              user_id: user.id,
              method_type: 'bank',
              details: { 
                account_number: accountNumber,
                ifsc_code: ifscCode,
                account_holder_name: accountName,
                bank_name: bankName,
                branch_name: branch
              },
              is_default: savedBankAccounts.length === 0, // Make default if it's the first one
              last_used: new Date().toISOString()
            });
        } catch (saveError) {
          // Just log this error but continue with the withdrawal
          console.error('Error saving bank account:', saveError);
        }
      }
      
      // Navigate to success screen
      router.push({
        pathname: '/wallet/withdraw/success',
        params: {
          amount: originalAmount.toString(),
          finalAmount: finalAmount.toString(),
          method: 'Bank Transfer',
          accountNumber: accountNumber.replace(/\d(?=\d{4})/g, '*') // Mask account number
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
          title: 'Bank Withdrawal',
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
          
          {/* Account Details Form */}
          <Animatable.View animation="fadeIn" duration={500} delay={200} style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Bank Account Details</ThemedText>
            
            <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
              <View style={[styles.formContainer, { 
                backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
              }]}>
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }]}
                  placeholder="Account Holder Name"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={accountName}
                  onChangeText={setAccountName}
                />
                
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }]}
                  placeholder="Account Number"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }]}
                  placeholder="Confirm Account Number"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={confirmAccountNumber}
                  onChangeText={setConfirmAccountNumber}
                  keyboardType="numeric"
                />
                
                <View style={styles.ifscContainer}>
                  <TextInput
                    style={[styles.input, styles.ifscInput, { 
                      color: isDark ? Colors.dark.text : Colors.light.text,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                    }]}
                    placeholder="IFSC Code"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                    value={ifscCode}
                    onChangeText={handleIfscCodeChange}
                    maxLength={11}
                    autoCapitalize="characters"
                  />
                  
                  {isSaving && (
                    <ActivityIndicator
                      size="small"
                      color={Colors.primary}
                      style={styles.ifscLoader}
                    />
                  )}
                </View>
                
                {bankName && (
                  <View style={styles.bankDetailsContainer}>
                    <ThemedText style={styles.bankName}>{bankName}</ThemedText>
                    {branch && <ThemedText style={styles.bankBranch}>{branch}</ThemedText>}
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
                  style={styles.saveAccountContainer}
                  onPress={() => setSaveAccount(!saveAccount)}
                >
                  <View style={[styles.checkboxContainer, { 
                    backgroundColor: saveAccount ? Colors.primary : 'transparent',
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  }]}>
                    {saveAccount && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <ThemedText style={styles.saveAccountText}>
                    Save this account for future withdrawals
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
              Bank withdrawals typically take 2-3 business days to be credited to your account after approval.
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
  ifscContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  ifscInput: {
    flex: 1,
  },
  ifscLoader: {
    position: 'absolute',
    right: 12,
  },
  bankDetailsContainer: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bankBranch: {
    fontSize: 14,
    opacity: 0.8,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveAccountContainer: {
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
  saveAccountText: {
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
    backgroundColor: 'rgba(76,175,80,0.1)',
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
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

// Withdrawal method options
const WITHDRAWAL_METHODS = [
  {
    id: 'bank',
    name: 'Bank Account',
    icon: 'account-balance',
    iconSet: MaterialIcons,
    description: 'Withdraw directly to your bank account (2-3 business days)',
    colors: ['#4CAF50', '#2E7D32'],
    route: '/wallet/withdraw/bank',
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: 'smartphone',
    iconSet: MaterialIcons,
    description: 'Instant withdrawal to UPI (within 24 hours)',
    colors: ['#2196F3', '#1976D2'],
    route: '/wallet/withdraw/upi',
  },
];

// Predefined amount options
const AMOUNT_OPTIONS = [100, 200, 500, 1000, 2000, 5000];

export default function WithdrawScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [actualBalance, setActualBalance] = useState(0);
  const [taxCreditBalance, setTaxCreditBalance] = useState(0);
  const [withdrawSettings, setWithdrawSettings] = useState({
    minimum_withdrawal_amount: 200,
    maximum_withdrawal_amount: 10000,
    bank_enabled: true,
    upi_enabled: true,
    processing_fee: 10,
    gst_percentage: 18,
    tds_percentage: 0, // TDS only applies to winnings
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchWalletBalance();
    fetchWithdrawSettings();
  }, []);
  
  const fetchWalletBalance = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, actual_balance, tax_credit_balance')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setWalletBalance(data.balance || 0);
        setActualBalance(data.actual_balance || data.balance || 0);
        setTaxCreditBalance(data.tax_credit_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Set default values for demo purposes
      setWalletBalance(1200);
      setActualBalance(864);
      setTaxCreditBalance(336);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWithdrawSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('minimum_withdrawal_amount, maximum_withdrawal_amount, bank_withdrawal_enabled, upi_withdrawal_enabled, withdrawal_processing_fee, gst_percentage, tds_percentage')
        .eq('id', '1')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setWithdrawSettings({
          minimum_withdrawal_amount: data.minimum_withdrawal_amount || 200,
          maximum_withdrawal_amount: data.maximum_withdrawal_amount || 10000,
          bank_enabled: data.bank_withdrawal_enabled !== false,
          upi_enabled: data.upi_withdrawal_enabled !== false,
          processing_fee: data.withdrawal_processing_fee || 10,
          gst_percentage: data.gst_percentage || 18,
          tds_percentage: data.tds_percentage || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching withdrawal settings:', error);
    }
  };
  
  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };
  
  const handleCustomAmountChange = (text: string) => {
    // Allow only numbers
    const filtered = text.replace(/[^0-9]/g, '');
    setCustomAmount(filtered);
    setSelectedAmount(null);
  };
  
  const getAmount = (): number => {
    if (customAmount) {
      return parseInt(customAmount, 10);
    }
    return selectedAmount || 0;
  };
  
  // Calculate total amount after fees
  const calculateFees = () => {
    const amount = getAmount();
    const processingFee = withdrawSettings.processing_fee;
    const gstOnFee = (processingFee * withdrawSettings.gst_percentage) / 100;
    const totalFee = processingFee + gstOnFee;
    
    return {
      amount,
      processingFee,
      gstOnFee,
      totalFee,
      amountAfterFees: Math.max(0, amount - totalFee),
    };
  };
  
  const isAmountValid = (): boolean => {
    const amount = getAmount();
    return (
      amount >= withdrawSettings.minimum_withdrawal_amount &&
      amount <= withdrawSettings.maximum_withdrawal_amount &&
      amount <= actualBalance
    );
  };
  
  const handleWithdrawalMethodSelect = (method: typeof WITHDRAWAL_METHODS[0]) => {
    const amount = getAmount();
    
    if (!isAmountValid()) {
      if (amount < withdrawSettings.minimum_withdrawal_amount) {
        Alert.alert('Amount Too Low', `Minimum withdrawal amount is ₹${withdrawSettings.minimum_withdrawal_amount}`);
      } else if (amount > withdrawSettings.maximum_withdrawal_amount) {
        Alert.alert('Amount Too High', `Maximum withdrawal amount is ₹${withdrawSettings.maximum_withdrawal_amount}`);
      } else if (amount > actualBalance) {
        Alert.alert('Insufficient Balance', 'You do not have enough balance to withdraw this amount.');
      } else {
        Alert.alert('Invalid Amount', 'Please enter a valid amount to continue');
      }
      return;
    }
    
    // Prevent NaN errors
    const validAmount = isNaN(amount) ? 0 : amount;
    
    router.push({
      pathname: method.route,
      params: { 
        amount: validAmount.toString(),
        processingFee: processingFee.toString(),
        amountAfterFees: amountAfterFees.toString()
      }
    });
  };
  
  // Filter available withdrawal methods based on settings
  const availableWithdrawalMethods = WITHDRAWAL_METHODS.filter(method => {
    if (method.id === 'bank') return withdrawSettings.bank_enabled;
    if (method.id === 'upi') return withdrawSettings.upi_enabled;
    return true;
  });
  
  const { amount, processingFee, gstOnFee, totalFee, amountAfterFees } = calculateFees();
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Withdraw Money',
          headerShown: true,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={500} 
          style={styles.balanceCardContainer}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.balanceLabel}>Your Withdrawable Balance</ThemedText>
            <ThemedText style={styles.balanceValue}>
              ₹{actualBalance.toFixed(2)}
            </ThemedText>
            <View style={styles.balanceInfoContainer}>
              <ThemedText style={styles.balanceInfoText}>
                Total Balance: ₹{walletBalance.toFixed(2)}
              </ThemedText>
              <ThemedText style={styles.balanceInfoText}>
                Tax Credits: ₹{taxCreditBalance.toFixed(2)}
              </ThemedText>
            </View>
          </LinearGradient>
        </Animatable.View>
        
        {/* Amount Selection Section */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={200}
          duration={500} 
          style={styles.amountSection}
        >
          <ThemedText style={styles.sectionTitle}>
            Enter Amount to Withdraw
          </ThemedText>
          
          <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
            <View style={[styles.amountInputContainer, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
            }]}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={[styles.amountInput, { 
                  color: isDark ? Colors.dark.text : Colors.light.text,
                }]}
                placeholder="0"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={handleCustomAmountChange}
              />
            </View>
          </Shadow>
          
          <View style={styles.amountOptionsContainer}>
            {AMOUNT_OPTIONS.filter(amt => amt <= actualBalance).map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountOption,
                  selectedAmount === amount && { 
                    backgroundColor: isDark ? Colors.primary + '30' : Colors.primary + '15',
                    borderColor: isDark ? Colors.primary + '60' : Colors.primary + '40',
                  }
                ]}
                onPress={() => handleSelectAmount(amount)}
              >
                <ThemedText
                  style={[
                    styles.amountOptionText,
                    selectedAmount === amount && { 
                      color: isDark ? Colors.dark.tint : Colors.primary,
                      fontWeight: '600',
                    }
                  ]}
                >
                  ₹{amount}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          
          <ThemedText style={styles.amountLimitText}>
            Min: ₹{withdrawSettings.minimum_withdrawal_amount} | Max: ₹{withdrawSettings.maximum_withdrawal_amount}
          </ThemedText>
        </Animatable.View>
        
        {/* Fee Breakdown */}
        {amount > 0 && (
          <Animatable.View 
            animation="fadeIn" 
            duration={500} 
            style={styles.feesContainer}
          >
            <ThemedText style={styles.feesTitle}>Withdrawal Breakdown</ThemedText>
            <View style={[styles.feesCard, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
            }]}>
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>Withdrawal Amount</ThemedText>
                <ThemedText style={styles.feeValue}>₹{amount.toFixed(2)}</ThemedText>
              </View>
              
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>Processing Fee</ThemedText>
                <ThemedText style={styles.feeValue}>₹{processingFee.toFixed(2)}</ThemedText>
              </View>
              
              <View style={styles.feeRow}>
                <ThemedText style={styles.feeLabel}>GST on Fee ({withdrawSettings.gst_percentage}%)</ThemedText>
                <ThemedText style={styles.feeValue}>₹{gstOnFee.toFixed(2)}</ThemedText>
              </View>
              
              <View style={[styles.feeRow, styles.totalRow]}>
                <ThemedText style={styles.totalLabel}>You'll Receive</ThemedText>
                <ThemedText style={styles.totalValue}>₹{amountAfterFees.toFixed(2)}</ThemedText>
              </View>
            </View>
          </Animatable.View>
        )}
        
        {/* Withdrawal Methods */}
        <View style={styles.withdrawalMethodsSection}>
          <ThemedText style={styles.sectionTitle}>
            Select Withdrawal Method
          </ThemedText>
          
          {availableWithdrawalMethods.length === 0 ? (
            <View style={styles.noMethodsContainer}>
              <MaterialIcons 
                name="block" 
                size={48} 
                color={isDark ? Colors.dark.tint : Colors.primary} 
              />
              <ThemedText style={styles.noMethodsText}>
                Withdrawal methods are currently unavailable. Please try again later.
              </ThemedText>
            </View>
          ) : (
            availableWithdrawalMethods.map((method, index) => {
              const Icon = method.iconSet;
              
              return (
                <Animatable.View 
                  key={method.id}
                  animation="fadeInUp"
                  delay={index * 100 + 400}
                  duration={500}
                >
                  <TouchableOpacity
                    style={styles.methodButton}
                    onPress={() => handleWithdrawalMethodSelect(method)}
                    disabled={!isAmountValid()}
                  >
                    <Shadow distance={5} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
                      <View style={[styles.methodCard, { 
                        backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
                        opacity: isAmountValid() ? 1 : 0.6,
                      }]}>
                        <LinearGradient
                          colors={method.colors}
                          style={styles.methodIconContainer}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Icon name={method.icon} size={24} color="#FFFFFF" />
                        </LinearGradient>
                        
                        <View style={styles.methodInfo}>
                          <ThemedText style={styles.methodName}>
                            {method.name}
                          </ThemedText>
                          <ThemedText style={styles.methodDescription}>
                            {method.description}
                          </ThemedText>
                        </View>
                        
                        <MaterialIcons 
                          name="arrow-forward-ios" 
                          size={16} 
                          color={isDark ? Colors.dark.icon : Colors.light.icon} 
                        />
                      </View>
                    </Shadow>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })
          )}
        </View>
        
        {/* Info Message */}
        <View style={styles.infoMessageContainer}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color={Colors.info} />
          </View>
          <ThemedText style={styles.infoMessageText}>
            Withdrawals are processed within 24-48 hours. Bank transfers may take 2-3 business days to reflect in your account.
          </ThemedText>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  balanceCardContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  balanceGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  balanceInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  amountSection: {
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    padding: 0,
  },
  amountOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountOption: {
    width: (width - 48) / 3,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountLimitText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  feesContainer: {
    marginBottom: 24,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feesCard: {
    borderRadius: 12,
    padding: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
    marginTop: 8,
    paddingTop: 12,
  },
  feeLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  withdrawalMethodsSection: {
    marginBottom: 24,
  },
  methodButton: {
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  noMethodsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noMethodsText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  },
  infoMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '10',
    borderRadius: 12,
    padding: 16,
  },
  infoIconContainer: {
    marginRight: 16,
  },
  infoMessageText: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
    lineHeight: 18,
  },
}); 
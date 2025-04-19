import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadow } from 'react-native-shadow-2';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// Payment method options
const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI Payment',
    icon: 'account-balance',
    iconSet: MaterialIcons,
    description: 'Pay using UPI apps like PhonePe, GPay, etc.',
    colors: ['#4CAF50', '#2E7D32'],
    route: '/wallet/deposit/upi',
  },
  {
    id: 'gateway',
    name: 'Payment Gateway',
    icon: 'credit-card',
    iconSet: MaterialIcons,
    description: 'Pay using Debit, Credit Card, or Net Banking',
    colors: ['#2196F3', '#1976D2'],
    route: '/wallet/deposit/gateway',
  },
];

// Predefined amount options
const AMOUNT_OPTIONS = [100, 200, 500, 1000, 2000, 5000];

export default function DepositScreen() {
  const { isDark } = useTheme();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({
    minimum_deposit_amount: 10,
    maximum_deposit_amount: 10000,
    upi_enabled: true,
    gateway_enabled: true,
  });
  
  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('minimum_deposit_amount, maximum_deposit_amount, upi_enabled, gateway_enabled')
        .eq('id', '1')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setPaymentSettings({
          minimum_deposit_amount: data.minimum_deposit_amount || 10,
          maximum_deposit_amount: data.maximum_deposit_amount || 10000,
          upi_enabled: data.upi_enabled !== false, // Default to true if not set
          gateway_enabled: data.gateway_enabled !== false, // Default to true if not set
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
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

  const isAmountValid = (): boolean => {
    const amount = getAmount();
    return (
      amount >= paymentSettings.minimum_deposit_amount &&
      amount <= paymentSettings.maximum_deposit_amount
    );
  };

  const handlePaymentMethodSelect = (paymentMethod: typeof PAYMENT_METHODS[0]) => {
    // Navigate to the payment method screen with amount
    const amount = getAmount();
    
    if (!isAmountValid()) {
      // Show error message using native alert
      alert(`Please enter an amount between ₹${paymentSettings.minimum_deposit_amount} and ₹${paymentSettings.maximum_deposit_amount}`);
      return;
    }
    
    router.push({
      pathname: paymentMethod.route,
      params: { amount }
    });
  };

  // Filter available payment methods based on settings
  const availablePaymentMethods = PAYMENT_METHODS.filter(method => {
    if (method.id === 'upi') return paymentSettings.upi_enabled;
    if (method.id === 'gateway') return paymentSettings.gateway_enabled;
    return true;
  });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Add Money',
          headerShown: true,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Selection Section */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={500} 
          style={styles.amountSection}
        >
          <ThemedText style={styles.sectionTitle}>
            Enter Amount
          </ThemedText>
          
          <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
            <View style={[styles.amountInputContainer, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
            }]}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <ThemedText 
                style={[styles.amountInput, customAmount ? styles.amountInputActive : null]}
              >
                {customAmount || '0'}
              </ThemedText>
            </View>
          </Shadow>
          
          <View style={styles.amountOptionsContainer}>
            {AMOUNT_OPTIONS.map((amount) => (
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
            Min: ₹{paymentSettings.minimum_deposit_amount} | Max: ₹{paymentSettings.maximum_deposit_amount}
          </ThemedText>
        </Animatable.View>
        
        {/* Payment Methods Section */}
        <View style={styles.paymentMethodsSection}>
          <ThemedText style={styles.sectionTitle}>
            Select Payment Method
          </ThemedText>
          
          {availablePaymentMethods.length === 0 ? (
            <View style={styles.noPaymentMethodsContainer}>
              <MaterialIcons 
                name="payment-off" 
                size={48} 
                color={isDark ? Colors.dark.tint : Colors.primary} 
              />
              <ThemedText style={styles.noPaymentMethodsText}>
                Payment methods are currently unavailable. Please try again later.
              </ThemedText>
            </View>
          ) : (
            availablePaymentMethods.map((method, index) => {
              const Icon = method.iconSet;
              
              return (
                <Animatable.View 
                  key={method.id}
                  animation="fadeInUp"
                  delay={index * 100}
                  duration={500}
                >
                  <TouchableOpacity
                    style={styles.paymentMethodButton}
                    onPress={() => handlePaymentMethodSelect(method)}
                    disabled={!isAmountValid()}
                  >
                    <Shadow distance={5} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
                      <View style={[styles.paymentMethodCard, { 
                        backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
                        opacity: isAmountValid() ? 1 : 0.6,
                      }]}>
                        <LinearGradient
                          colors={method.colors}
                          style={styles.paymentMethodIconContainer}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Icon name={method.icon} size={24} color="#FFFFFF" />
                        </LinearGradient>
                        
                        <View style={styles.paymentMethodInfo}>
                          <ThemedText style={styles.paymentMethodName}>
                            {method.name}
                          </ThemedText>
                          <ThemedText style={styles.paymentMethodDescription}>
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
        
        {/* Safety Message */}
        <View style={styles.safetyMessageContainer}>
          <View style={styles.safetyMessageIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
          </View>
          <ThemedText style={styles.safetyMessageText}>
            All transactions are secure and protected with 128-bit SSL encryption.
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
  amountSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  amountInputActive: {
    color: Colors.primary,
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
  paymentMethodsSection: {
    marginBottom: 24,
  },
  paymentMethodButton: {
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  paymentMethodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  noPaymentMethodsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noPaymentMethodsText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  },
  safetyMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  safetyMessageIconContainer: {
    marginRight: 16,
  },
  safetyMessageText: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
  },
}); 
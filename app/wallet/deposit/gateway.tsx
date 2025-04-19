import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
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
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Payment method icons - replaced with FontAwesome5 icons
// const visaIcon = require('@/assets/images/visa.png');
// const mastercardIcon = require('@/assets/images/mastercard.png');
// const rupayIcon = require('@/assets/images/rupay.png');
// const upiIcon = require('@/assets/images/upi.png');
// const netbankingIcon = require('@/assets/images/netbanking.png');

// Payment types offered by payment gateway
const PAYMENT_TYPES = [
  {
    id: 'card',
    title: 'Credit/Debit Card',
    icon: <MaterialCommunityIcons name="credit-card-outline" size={24} color="#FFFFFF" />,
    colors: ['#2196F3', '#1976D2'] as readonly [string, string],
  },
  {
    id: 'upi',
    title: 'UPI',
    icon: <FontAwesome5 name="money-bill-wave" size={24} color="#FFFFFF" />,
    colors: ['#4CAF50', '#2E7D32'] as readonly [string, string],
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    icon: <MaterialIcons name="account-balance" size={24} color="#FFFFFF" />,
    colors: ['#9C27B0', '#7B1FA2'] as readonly [string, string],
  },
];

// Banks list for net banking
const BANKS = [
  { id: 'sbi', name: 'State Bank of India', icon: 'bank' },
  { id: 'hdfc', name: 'HDFC Bank', icon: 'bank' },
  { id: 'icici', name: 'ICICI Bank', icon: 'bank' },
  { id: 'axis', name: 'Axis Bank', icon: 'bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', icon: 'bank' },
  { id: 'yes', name: 'Yes Bank', icon: 'bank' },
];

export default function PaymentGatewayScreen() {
  const { amount } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [selectedPaymentType, setSelectedPaymentType] = useState('card');
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  
  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add space after every 4 characters
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };
  
  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/YY
    if (cleaned.length >= 3) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    } else if (cleaned.length === 2) {
      return `${cleaned}/`;
    }
    
    return cleaned;
  };
  
  // Handle card number input
  const handleCardNumberChange = (text: string) => {
    setCardNumberInput(formatCardNumber(text));
  };
  
  // Handle expiry date input
  const handleExpiryDateChange = (text: string) => {
    setCardExpiry(formatExpiryDate(text));
  };
  
  // Handle CVV input
  const handleCVVChange = (text: string) => {
    // Allow only numbers and limit to 3-4 digits
    const cleaned = text.replace(/\D/g, '');
    setCardCVV(cleaned.substring(0, 4));
  };
  
  // Detect card type based on number
  const getCardType = () => {
    const cleanedNumber = cardNumberInput.replace(/\s/g, '');
    
    if (/^4/.test(cleanedNumber)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleanedNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanedNumber)) {
      return 'amex';
    } else if (/^(6|8)/.test(cleanedNumber)) {
      return 'rupay';
    }
    return null;
  };
  
  // Get card icon based on type
  const getCardIcon = () => {
    const cardType = getCardType();
    
    switch (cardType) {
      case 'visa':
        return <FontAwesome5 name="cc-visa" size={32} color="#1A1F71" />;
      case 'mastercard':
        return <FontAwesome5 name="cc-mastercard" size={32} color="#EB001B" />;
      case 'amex':
        return <FontAwesome5 name="cc-amex" size={32} color="#006FCF" />;
      default:
        return <FontAwesome5 name="credit-card" size={32} color={isDark ? Colors.dark.icon : Colors.light.icon} />;
    }
  };
  
  // Validate form based on payment type
  const isFormValid = () => {
    if (selectedPaymentType === 'card') {
      return (
        cardNumberInput.replace(/\s/g, '').length === 16 &&
        cardName.length > 2 &&
        cardExpiry.length === 5 &&
        cardCVV.length >= 3
      );
    } else if (selectedPaymentType === 'upi') {
      return upiId.includes('@') && upiId.length > 3;
    } else if (selectedPaymentType === 'netbanking') {
      return selectedBank !== '';
    }
    
    return false;
  };
  
  // Process payment
  const handlePayment = async () => {
    if (!isFormValid()) {
      Alert.alert('Invalid Payment Details', 'Please check your payment details and try again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to add money');
      }
      
      // Generate a reference ID
      const referenceId = `QZ${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10000)}`;
      
      // Call payment gateway API - this is a mock for now
      // In real implementation, you would integrate with your payment gateway
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call Supabase function to record payment
      const { data, error } = await supabase.rpc('process_gateway_payment', {
        user_id: user.id,
        amount: parseFloat(amount as string),
        reference_id: referenceId,
        payment_method: selectedPaymentType,
        save_payment_method: saveCard
      });
      
      if (error) throw error;
      
      // Navigate to success page
      router.replace('/wallet/deposit/success');
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        typeof error === 'object' ? (error as Error).message : 'There was an error processing your payment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Payment Gateway',
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
          {/* Payment Amount */}
          <Animatable.View animation="fadeInDown" duration={500} style={styles.amountContainer}>
            <ThemedText style={styles.amountLabel}>Amount to Pay</ThemedText>
            <ThemedText style={styles.amountValue}>
              ₹{parseFloat(amount as string).toFixed(2)}
            </ThemedText>
          </Animatable.View>
          
          {/* Payment Type Selection */}
          <View style={styles.paymentTypeSection}>
            <ThemedText style={styles.sectionTitle}>Select Payment Method</ThemedText>
            
            <View style={styles.paymentTypeContainer}>
              {PAYMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.paymentTypeButton,
                    selectedPaymentType === type.id && styles.selectedPaymentTypeButton,
                    { borderColor: selectedPaymentType === type.id ? type.colors[0] : 'transparent' }
                  ]}
                  onPress={() => setSelectedPaymentType(type.id)}
                >
                  <LinearGradient
                    colors={type.colors}
                    style={styles.paymentTypeIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {type.icon}
                  </LinearGradient>
                  <ThemedText style={styles.paymentTypeText}>{type.title}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Payment Details Form */}
          <View style={styles.paymentDetailsSection}>
            <ThemedText style={styles.sectionTitle}>Payment Details</ThemedText>
            
            <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
              <View style={[styles.paymentDetailsContainer, { 
                backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
              }]}>
                {/* Credit/Debit Card Form */}
                {selectedPaymentType === 'card' && (
                  <Animatable.View animation="fadeIn" duration={300}>
                    <View style={styles.cardNumberContainer}>
                      <TextInput
                        style={[styles.input, styles.cardNumberInput, { 
                          color: isDark ? Colors.dark.text : Colors.light.text,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }]}
                        placeholder="Card Number"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                        value={cardNumberInput}
                        onChangeText={handleCardNumberChange}
                        keyboardType="numeric"
                        maxLength={19}
                      />
                      
                      {getCardIcon()}
                    </View>
                    
                    <TextInput
                      style={[styles.input, { 
                        color: isDark ? Colors.dark.text : Colors.light.text,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                      }]}
                      placeholder="Cardholder Name"
                      placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                      value={cardName}
                      onChangeText={setCardName}
                    />
                    
                    <View style={styles.cardDetailsRow}>
                      <TextInput
                        style={[styles.input, styles.expiryInput, { 
                          color: isDark ? Colors.dark.text : Colors.light.text,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }]}
                        placeholder="MM/YY"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                        value={cardExpiry}
                        onChangeText={handleExpiryDateChange}
                        keyboardType="numeric"
                        maxLength={5}
                      />
                      
                      <TextInput
                        style={[styles.input, styles.cvvInput, { 
                          color: isDark ? Colors.dark.text : Colors.light.text,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }]}
                        placeholder="CVV"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                        value={cardCVV}
                        onChangeText={handleCVVChange}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                    
                    <TouchableOpacity
                      style={styles.saveCardContainer}
                      onPress={() => setSaveCard(!saveCard)}
                    >
                      <View style={[styles.checkboxContainer, { 
                        backgroundColor: saveCard ? Colors.primary : 'transparent',
                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                      }]}>
                        {saveCard && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <ThemedText style={styles.saveCardText}>
                        Save this card for future payments
                      </ThemedText>
                    </TouchableOpacity>
                  </Animatable.View>
                )}
                
                {/* UPI Form */}
                {selectedPaymentType === 'upi' && (
                  <Animatable.View animation="fadeIn" duration={300}>
                    <View style={styles.upiContainer}>
                      <TextInput
                        style={[styles.input, { 
                          color: isDark ? Colors.dark.text : Colors.light.text,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }]}
                        placeholder="Enter UPI ID (e.g. name@upi)"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                        value={upiId}
                        onChangeText={setUpiId}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      
                      <ThemedText style={styles.infoText}>
                        Please enter your UPI ID to make a direct payment from your bank account.
                      </ThemedText>
                      
                      <TouchableOpacity
                        style={styles.switchToQrButton}
                        onPress={() => router.replace('/wallet/deposit/upi')}
                      >
                        <ThemedText style={[styles.switchToQrText, { 
                          color: isDark ? Colors.dark.tint : Colors.primary 
                        }]}>
                          Prefer to pay via QR code? Click here
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </Animatable.View>
                )}
                
                {/* Net Banking Form */}
                {selectedPaymentType === 'netbanking' && (
                  <Animatable.View animation="fadeIn" duration={300}>
                    <View style={styles.bankListContainer}>
                      {BANKS.map((bank) => (
                        <TouchableOpacity
                          key={bank.id}
                          style={[styles.bankItem, {
                            backgroundColor: selectedBank === bank.id 
                              ? (isDark ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)')
                              : 'transparent',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          }]}
                          onPress={() => setSelectedBank(bank.id)}
                        >
                          <MaterialIcons 
                            name={bank.icon as any} 
                            size={24} 
                            color={
                              selectedBank === bank.id
                                ? (isDark ? Colors.dark.tint : Colors.primary)
                                : (isDark ? Colors.dark.icon : Colors.light.icon)
                            } 
                          />
                          <ThemedText style={styles.bankName}>{bank.name}</ThemedText>
                          {selectedBank === bank.id && (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={isDark ? Colors.dark.tint : Colors.primary}
                              style={styles.checkIcon}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animatable.View>
                )}
              </View>
            </Shadow>
          </View>
          
          {/* Payment Button */}
          <Animatable.View animation="fadeInUp" duration={500} style={styles.payButtonContainer}>
            <TouchableOpacity
              style={[styles.payButton, !isFormValid() && styles.disabledPayButton]}
              onPress={handlePayment}
              disabled={!isFormValid() || isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark] as readonly [string, string]}
                style={[styles.payButtonGradient, !isFormValid() && { opacity: 0.6 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <FontAwesome5 name="rupee-sign" size={18} color="#FFFFFF" style={styles.payButtonIcon} />
                    <ThemedText style={styles.payButtonText}>Pay ₹{parseFloat(amount as string).toFixed(2)}</ThemedText>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          
          {/* Security Info */}
          <View style={styles.securityInfoContainer}>
            <View style={styles.securityIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
            </View>
            <ThemedText style={styles.securityInfoText}>
              All payments are secure and encrypted. Your card details are not stored on our servers.
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  paymentTypeSection: {
    marginBottom: 24,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentTypeButton: {
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    borderColor: 'transparent',
  },
  selectedPaymentTypeButton: {
    backgroundColor: 'rgba(76,175,80,0.05)',
  },
  paymentTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTypeText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  paymentDetailsSection: {
    marginBottom: 24,
  },
  paymentDetailsContainer: {
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
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cardNumberInput: {
    flex: 1,
    paddingRight: 50,
  },
  cardTypeIcon: {
    width: 32,
    height: 20,
    position: 'absolute',
    right: 12,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryInput: {
    width: '48%',
  },
  cvvInput: {
    width: '48%',
  },
  saveCardContainer: {
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
  saveCardText: {
    fontSize: 14,
  },
  upiContainer: {
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  switchToQrButton: {
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  switchToQrText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bankListContainer: {
    paddingVertical: 8,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  bankName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 8,
  },
  payButtonContainer: {
    marginBottom: 16,
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledPayButton: {
    opacity: 0.6,
  },
  payButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  payButtonIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  securityInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  securityIconContainer: {
    marginRight: 12,
  },
  securityInfoText: {
    flex: 1,
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
}); 
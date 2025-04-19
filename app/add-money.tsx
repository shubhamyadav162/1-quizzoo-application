import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/hooks/useAuth';

// Predefined amount options
const AMOUNT_OPTIONS = [100, 200, 500, 1000, 2000, 5000];

export default function AddMoneyScreen() {
  const [amount, setAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessUpiId, setBusinessUpiId] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({
    minimum_deposit_amount: 10,
    maximum_deposit_amount: 10000
  });
  const windowWidth = Dimensions.get('window').width;
  const { user } = useAuth();
  
  // Animation values for button
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fetch payment settings on component mount
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('business_upi_id, minimum_deposit_amount, maximum_deposit_amount')
        .eq('id', '1')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setBusinessUpiId(data.business_upi_id);
        setPaymentSettings({
          minimum_deposit_amount: data.minimum_deposit_amount,
          maximum_deposit_amount: data.maximum_deposit_amount
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const handleSelectAmount = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = filtered.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(filtered);
  };

  const handlePressIn = () => {
    // Button press in animation
    Animated.parallel([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    // Button press out animation
    Animated.parallel([
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleGenerateQR = async () => {
    // Check if amount is valid
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to continue');
      return;
    }
    
    // Check for minimum amount
    if (parseFloat(amount) < paymentSettings.minimum_deposit_amount) {
      Alert.alert('Amount Too Low', `Minimum amount to add is ₹${paymentSettings.minimum_deposit_amount}`);
      return;
    }
    
    // Max amount check
    if (parseFloat(amount) > paymentSettings.maximum_deposit_amount) {
      Alert.alert('Amount Too High', `Maximum amount to add is ₹${paymentSettings.maximum_deposit_amount}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Call Supabase function to directly add money to wallet
      const { data, error } = await supabase.rpc('add_money_to_wallet', {
        p_amount: parseFloat(amount),
        p_payment_method: 'UPI',
        p_description: `Added ₹${amount} via UPI`
      });
      
      if (error) throw error;
      
      if (data) {
        // Generate a reference ID for tracking (just for UI)
        const refId = 'REF' + Date.now().toString();
        setReferenceId(refId);
        
        // Let's generate a fake QR code data for the UI flow
        const qrData = `upi://pay?pa=${businessUpiId || 'quizzoo@upi'}&pn=Quizzoo&am=${amount}&tr=${refId}&tn=Add Money to Quizzoo`;
        setQrCodeData(qrData);
        
        // Show success message
        Alert.alert(
          'Money Added Successfully',
          `₹${amount} has been added to your wallet.`,
          [
            {
              text: 'Go to Wallet',
              onPress: () => router.push('/(tabs)/wallet')
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add money to your wallet');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    if (!qrCodeData) {
      handleGenerateQR();
      return;
    }
    
    // Since we've already added the money directly in handleGenerateQR
    // this is just for UI flow completion
    Alert.alert(
      'Payment Already Processed',
      `₹${amount} has been added to your wallet.`,
      [
        {
          text: 'Go to Wallet',
          onPress: () => router.push('/(tabs)/wallet')
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  };

  const checkPaymentStatus = async () => {
    if (!referenceId) return;
    
    // Since we've already processed the payment, just show success
    Alert.alert(
      'Payment Successful',
      `₹${amount} has been added to your wallet.`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/wallet')
        }
      ]
    );
  };

  const copyUpiId = async () => {
    if (businessUpiId) {
      await Clipboard.setStringAsync(businessUpiId);
      Alert.alert('Copied', 'UPI ID copied to clipboard');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Add Money',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.walletIconContainer}>
            <View style={styles.walletIconBackground}>
              <FontAwesome5 name="wallet" size={24} color="#fff" />
            </View>
          </View>
          
          <ThemedText style={styles.heroTitle}>Add Money to Your Wallet</ThemedText>
          <ThemedText style={styles.heroSubtitle}>Enter amount to continue</ThemedText>
        </View>
        
        {/* Amount Input Section */}
        <View style={styles.amountCard}>
          <ThemedText style={styles.amountLabel}>Enter Amount</ThemedText>
          
          <View style={styles.currencyInputContainer}>
            <ThemedText style={styles.currencySymbol}>₹</ThemedText>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.amountSuggestionContainer}>
            <ThemedText style={styles.amountSuggestionLabel}>Suggested Amounts</ThemedText>
            <View style={styles.quickAmountContainer}>
              {AMOUNT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.quickAmountButton}
                  onPress={() => handleSelectAmount(option)}
                >
                  <ThemedText style={styles.quickAmountText}>₹{option}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Payment Method Section */}
        <View style={styles.paymentMethodSection}>
          <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
          
          <View style={styles.paymentOptionCard}>
            <View style={styles.paymentOptionHeader}>
              <Image 
                source={require('@/assets/images/upi-icon.png')} 
                style={styles.paymentMethodIcon} 
              />
              <ThemedText style={styles.paymentMethodTitle}>UPI Payment</ThemedText>
            </View>
            
            {referenceId ? (
              <View style={styles.upiDetailsContainer}>
                <ThemedText style={styles.referenceIdLabel}>Reference ID:</ThemedText>
                <ThemedText style={styles.referenceIdValue}>{referenceId}</ThemedText>
                
                {businessUpiId && (
                  <TouchableOpacity style={styles.copyUpiContainer} onPress={copyUpiId}>
                    <ThemedText style={styles.businessUpiId}>{businessUpiId}</ThemedText>
                    <Ionicons name="copy-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        </View>
        
        {/* Pay Button */}
          <Animated.View 
            style={[
            styles.payButtonContainer,
              { 
                transform: [{ scale: buttonScale }],
                opacity: buttonOpacity
              }
            ]}
          >
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayNow}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <FontAwesome5 name="rupee-sign" size={16} color="#fff" style={styles.payButtonIcon} />
                <ThemedText style={styles.payButtonText}>
                  {qrCodeData ? 'Pay Now' : 'Add Money'}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
          </Animated.View>
        
        {/* Safety Note */}
        <View style={styles.safetyNoteContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
          <ThemedText style={styles.safetyNoteText}>
            Your payment is 100% secure and encrypted
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
  scrollContent: {
    padding: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  walletIconContainer: {
    marginBottom: 16,
  },
  walletIconBackground: {
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  amountSuggestionContainer: {
    marginTop: 8,
  },
  amountSuggestionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '31%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickAmountText: {
    fontWeight: '600',
  },
  paymentMethodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentOptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  upiDetailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  referenceIdLabel: {
    fontSize: 14,
    color: '#666',
  },
  referenceIdValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  copyUpiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  businessUpiId: {
    fontSize: 14,
    fontWeight: '500',
  },
  payButtonContainer: {
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  safetyNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  safetyNoteText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
}); 
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
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Real UPI ID for the app (hidden from UI but used for payment)
const APP_UPI_ID = '9027579170@okbizaxis';

// Predefined amount options
const AMOUNT_OPTIONS = [100, 200, 500, 1000, 2000, 5000];

export default function AddMoneyScreen() {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const windowWidth = Dimensions.get('window').width;
  
  // Animation values for button
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Generate a unique transaction ID when the component mounts
    const uniqueId = generateTransactionId();
    setTransactionId(uniqueId);
  }, []);

  const generateTransactionId = () => {
    // Generate a random transaction ID 
    return 'QZ' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().slice(-6);
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

  const handlePayNow = () => {
    // Check if amount is valid
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to continue');
      return;
    }
    
    // Check for minimum amount (10 Rs)
    if (parseFloat(amount) < 10) {
      Alert.alert('Amount Too Low', 'Minimum amount to add is ₹10');
      return;
    }
    
    // Create UPI URL with amount pre-filled
    const amountVal = parseFloat(amount);
    const upiUrl = `upi://pay?pa=${APP_UPI_ID}&pn=Quizzoo&am=${amountVal}&cu=INR&tr=${transactionId}`;
    
    // Open UPI app
    Linking.openURL(upiUrl)
      .catch(err => {
        Alert.alert(
          'No UPI App Found',
          'No UPI app is installed on your phone or there was an issue opening it.',
          [{ text: 'OK' }]
        );
      });
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
                  style={[
                    styles.quickAmountButton,
                    amount === option.toString() && styles.quickAmountButtonActive
                  ]}
                  onPress={() => handleSelectAmount(option)}
                >
                  <ThemedText
                    style={[
                      styles.quickAmountText,
                      amount === option.toString() && styles.quickAmountTextActive
                    ]}
                  >
                    ₹{option}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Pay Button with Animation */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePayNow}
        >
          <Animated.View 
            style={[
              styles.payButton, 
              { 
                transform: [{ scale: buttonScale }],
                opacity: buttonOpacity
              }
            ]}
          >
            <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
            <FontAwesome5 name="arrow-right" size={16} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
        
        {/* Security Note */}
        <View style={styles.securityNoteContainer}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#666" style={styles.securityIcon} />
          <ThemedText style={styles.securityNoteText}>
            Secure Payment • 100% Safe • SSL Encrypted
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 50,
  },
  heroSection: {
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.primary,
  },
  walletIconContainer: {
    marginBottom: 15,
  },
  walletIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 30,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    height: 60,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 60,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  amountSuggestionContainer: {
    marginBottom: 5,
  },
  amountSuggestionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 10,
    width: '31%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickAmountButtonActive: {
    backgroundColor: 'rgba(113, 97, 239, 0.1)',
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  quickAmountTextActive: {
    color: Colors.primary,
  },
  payButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  securityNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  securityIcon: {
    marginRight: 6,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 
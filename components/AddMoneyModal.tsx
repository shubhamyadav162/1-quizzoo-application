import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';
import { TAX_RATE } from '@/app/lib/WalletService';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/app/lib/LanguageContext';

// Helper function to safely get translated text
const safeTranslate = (t: (key: string) => any, key: string, fallback: string): string => {
  const translated = t(key);
  return typeof translated === 'string' ? translated : fallback;
};

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMoney: (amount: number) => void;
}

export function AddMoneyModal({ visible, onClose, onAddMoney }: AddMoneyModalProps) {
  const { isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const { t } = useLanguage();
  
  // Calculate tax amount (will be given as credit)
  const depositAmount = parseFloat(amount) || 0;
  const taxAmount = depositAmount * TAX_RATE;
  const actualAmount = depositAmount - taxAmount;
  
  // Check if amount is valid - update minimum to 10 rupees
  const isValidAmount = depositAmount >= 10 && depositAmount <= 10000;
  
  const handleAddMoney = () => {
    if (isValidAmount) {
      // Call the onAddMoney prop to process the payment on the parent component
      onAddMoney(depositAmount);
      setAmount('');
      
      // Display a success indicator
      Alert.alert(
        'Transaction Successful',
        'Amount added to your wallet successfully!'
      );
    } else {
      // Show error for invalid amount
      if (depositAmount < 10) {
        Alert.alert(
          'Invalid Amount',
          'Minimum amount is ₹10'
        );
      } else if (depositAmount > 10000) {
        Alert.alert(
          'Invalid Amount',
          'Maximum amount is ₹10,000'
        );
      } else {
        Alert.alert(
          'Something went wrong',
          'Please try again'
        );
      }
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.overlay}>
          <ThemedView style={styles.modalContainer}>
            <LinearGradient
              colors={isDark ? ['#1A237E', '#283593'] : ['#3949AB', '#5C6BC0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.header, {
                paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16
              }]}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <ThemedText 
                style={[styles.headerTitle, { color: '#ffffff' }]}
                skipTranslation={true}
              >
                Add Money
              </ThemedText>
              <View style={{ width: 24 }} />
            </LinearGradient>
            
            <ScrollView style={styles.scrollContent}>
              <View style={styles.inputContainer}>
                <View style={styles.rupeeContainer}>
                  <ThemedText style={styles.rupeeSymbol}>
                    ₹
                  </ThemedText>
                </View>
                <TextInput
                  style={[
                    styles.amountInput,
                    { color: isDark ? Colors.dark.text : Colors.light.text }
                  ]}
                  placeholder="0"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                  keyboardType="number-pad"
                  value={amount}
                  onChangeText={setAmount}
                  maxLength={7}
                />
              </View>
              
              {/* Quick amount buttons */}
              <View style={styles.quickAmountContainer}>
                {[100, 500, 1000].map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    ]}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <ThemedText style={styles.quickAmountText}>
                      ₹{quickAmount}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Special Tax Credit Information */}
              {depositAmount >= 100 && (
                <View style={[
                  styles.taxCreditContainer,
                  { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.05)' }
                ]}>
                  <View style={styles.taxCreditHeader}>
                    <MaterialIcons name="credit-card" size={18} color={isDark ? '#4ade80' : Colors.primary} />
                    <ThemedText style={[styles.taxCreditTitle, { color: isDark ? '#4ade80' : Colors.primary }]}>
                      Tax Credit Bonus
                    </ThemedText>
                  </View>
                  
                  <View style={styles.taxCalculation}>
                    <View style={styles.taxRow}>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>Deposit Amount:</ThemedText>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>₹{depositAmount.toFixed(2)}</ThemedText>
                    </View>
                    <View style={styles.taxRow}>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>Tax Amount ({(TAX_RATE * 100).toFixed(0)}%):</ThemedText>
                      <ThemedText style={[styles.taxAmount, isDark ? styles.darkModeHighlight : {}]}>₹{taxAmount.toFixed(2)}</ThemedText>
                    </View>
                    <View style={styles.taxRow}>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>Actual Money:</ThemedText>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>₹{actualAmount.toFixed(2)}</ThemedText>
                    </View>
                    <View style={[styles.taxRow, styles.bonusRow]}>
                      <ThemedText style={[styles.bonusLabel, isDark ? styles.darkModeHighlight : {}]}>Credit Bonus:</ThemedText>
                      <ThemedText style={[styles.bonusAmount, isDark ? styles.darkModeHighlight : {}]}>+₹{taxAmount.toFixed(2)}</ThemedText>
                    </View>
                    
                    <View style={styles.dashedBorder} />
                    
                    <View style={styles.totalRow}>
                      <ThemedText style={[styles.totalLabel, isDark ? styles.darkModeText : {}]}>Total in Wallet:</ThemedText>
                      <ThemedText style={[styles.totalAmount, isDark ? styles.darkModeTotalAmount : {}]}>₹{depositAmount.toFixed(2)}</ThemedText>
                    </View>
                  </View>
                  
                  <ThemedText style={[styles.taxCreditInfo, isDark ? styles.darkModeText : {}]}>
                    We provide a credit bonus equal to the 28% tax amount, so you can enjoy playing with your full deposit amount!
                  </ThemedText>
                </View>
              )}
              
              {/* Payment methods */}
              <View style={styles.paymentMethodsContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Payment Methods
                </ThemedText>
                
                <TouchableOpacity style={styles.paymentMethodButton}>
                  <View style={styles.paymentMethodIcon}>
                    <MaterialIcons name="account-balance" size={20} color="#fff" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <ThemedText style={styles.paymentMethodTitle}>
                      UPI Payment
                    </ThemedText>
                    <ThemedText style={styles.paymentMethodSubtitle}>
                      Pay using any UPI app
                    </ThemedText>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={isDark ? Colors.dark.icon : Colors.light.icon} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.paymentMethodButton}>
                  <View style={[styles.paymentMethodIcon, { backgroundColor: '#E11D48' }]}>
                    <MaterialIcons name="credit-card" size={20} color="#fff" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <ThemedText style={styles.paymentMethodTitle}>
                      Cards
                    </ThemedText>
                    <ThemedText style={styles.paymentMethodSubtitle}>
                      Credit & Debit Cards
                    </ThemedText>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={isDark ? Colors.dark.icon : Colors.light.icon} />
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.addMoneyButton,
                  !isValidAmount && styles.disabledButton
                ]}
                disabled={!isValidAmount}
                onPress={handleAddMoney}
              >
                <ThemedText style={styles.addMoneyButtonText}>
                  {!amount ? 'Enter Amount' : 
                   parseFloat(amount) < 10 ? 'Minimum Amount ₹10' :
                   parseFloat(amount) > 10000 ? 'Maximum Amount ₹10,000' :
                   `Add Money ₹${amount}`}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rupeeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 18,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAmountButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  quickAmountText: {
    fontWeight: '600',
  },
  taxCreditContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  taxCreditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taxCreditTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  taxCalculation: {
    borderTopWidth: 0,
    paddingTop: 8,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taxAmount: {
    color: '#E11D48',
  },
  bonusRow: {
    paddingTop: 8,
  },
  bonusLabel: {
    fontWeight: '600',
    color: Colors.primary,
  },
  bonusAmount: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dashedBorder: {
    height: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  totalAmount: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  taxCreditInfo: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginTop: 16,
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentMethodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  addMoneyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  addMoneyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  darkModeText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  darkModeHighlight: {
    color: '#4ade80',
  },
  darkModeTotalAmount: {
    color: '#4ade80',
    fontWeight: '700',
  }
}); 
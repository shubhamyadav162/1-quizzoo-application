import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';
import { TAX_RATE } from '@/app/lib/WalletService';
import { useLanguage } from '@/app/lib/LanguageContext';

// Helper function to safely get translated text
const safeTranslate = (t: (key: string) => any, key: string, fallback: string): string => {
  const translated = t(key);
  return typeof translated === 'string' ? translated : fallback;
};

interface WithdrawModalProps {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

export function WithdrawModal({ visible, balance, onClose, onWithdraw }: WithdrawModalProps) {
  const { isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const { t } = useLanguage();
  
  // Calculate tax and processing fees
  const withdrawAmount = parseFloat(amount) || 0;
  const taxAmount = withdrawAmount * TAX_RATE;
  const totalDeductions = taxAmount;
  const amountAfterDeductions = withdrawAmount > 0 ? withdrawAmount - totalDeductions : 0;
  
  // Check if amount is valid - changed minimum from 100 to 100
  const isValidAmount = withdrawAmount >= 100 && withdrawAmount <= balance && amountAfterDeductions > 0;
  
  const handleWithdraw = () => {
    if (isValidAmount) {
      onWithdraw(withdrawAmount);
      setAmount('');
      
      // Add success message
      Alert.alert(
        'Withdraw',
        `Withdraw ₹${withdrawAmount} was successful. Actual amount: ₹${amountAfterDeductions.toFixed(2)}`,
        [{ text: 'OK' }]
      );
    } else {
      // Show error for invalid amount
      if (withdrawAmount < 100) {
        Alert.alert(
          'Invalid Amount',
          `Minimum amount is ₹100`,
          [{ text: 'OK' }]
        );
      } else if (withdrawAmount > balance) {
        Alert.alert(
          'Insufficient Balance',
          'You don\'t have enough balance for this withdrawal',
          [{ text: 'OK' }]
        );
      } else if (amountAfterDeductions <= 0) {
        Alert.alert(
          'Amount Too Low',
          `Deductions exceed withdrawal amount. Please enter a higher amount.`,
          [{ text: 'OK' }]
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
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>
                Withdraw
              </ThemedText>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons 
                  name="close" 
                  size={24} 
                  color={isDark ? Colors.dark.text : Colors.light.text} 
                />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollContent}>
              <View style={styles.balanceInfo}>
                <ThemedText style={styles.balanceLabel}>
                  Available Balance
                </ThemedText>
                <ThemedText 
                  style={styles.balanceValue}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                >
                  ₹{Math.round(balance)}
                </ThemedText>
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.rupeeContainer}>
                  <ThemedText style={styles.rupeeSymbol}>₹</ThemedText>
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
                    <ThemedText style={styles.quickAmountText}>₹{quickAmount}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Important tax and fees information */}
              <View style={[
                styles.taxInfoContainer,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)' }
              ]}>
                <View style={styles.taxInfoHeader}>
                  <MaterialIcons 
                    name="info-outline" 
                    size={18} 
                    color={isDark ? '#4ade80' : Colors.primary} 
                  />
                  <ThemedText style={[
                    styles.taxInfoTitle,
                    { color: isDark ? '#4ade80' : Colors.primary }
                  ]}>
                    Deduction Information
                  </ThemedText>
                </View>
                
                <ThemedText style={[
                  styles.taxInfoText,
                  isDark ? styles.darkModeText : {}
                ]}>
                  As per government regulations, a {(TAX_RATE * 100).toFixed(0)}% tax is applied on all withdrawals.
                </ThemedText>
                
                {withdrawAmount > 0 && (
                  <View style={styles.taxCalculation}>
                    <View style={styles.taxRow}>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>
                        Withdrawal Amount:
                      </ThemedText>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>₹{withdrawAmount.toFixed(2)}</ThemedText>
                    </View>
                    <View style={styles.taxRow}>
                      <ThemedText style={isDark ? styles.darkModeText : {}}>
                        Tax ({(TAX_RATE * 100).toFixed(0)}%):
                      </ThemedText>
                      <ThemedText style={[
                        styles.taxAmount,
                        isDark ? styles.darkModeHighlight : {}
                      ]}>- ₹{taxAmount.toFixed(2)}</ThemedText>
                    </View>
                    <View style={[styles.taxRow, styles.totalDeductionsRow]}>
                      <ThemedText style={[
                        styles.totalDeductionsLabel,
                        isDark ? styles.darkModeText : {}
                      ]}>
                        Total Deductions:
                      </ThemedText>
                      <ThemedText style={[
                        styles.totalDeductions,
                        isDark ? styles.darkModeHighlight : {}
                      ]}>- ₹{totalDeductions.toFixed(2)}</ThemedText>
                    </View>
                    <View style={[styles.taxRow, styles.amountAfterTaxRow]}>
                      <ThemedText style={[
                        styles.amountAfterTaxLabel,
                        isDark ? styles.darkModeText : {}
                      ]}>
                        You'll Receive:
                      </ThemedText>
                      <ThemedText style={[
                        styles.amountAfterTax,
                        isDark ? styles.darkModeTotalAmount : {}
                      ]}>₹{amountAfterDeductions.toFixed(2)}</ThemedText>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Bank account selection would go here */}
              <View style={styles.bankAccountContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Payment Method
                </ThemedText>
                {/* Bank account selection UI would go here */}
                <TouchableOpacity style={styles.addAccountButton}>
                  <MaterialIcons 
                    name="add" 
                    size={18} 
                    color={isDark ? '#4ade80' : Colors.primary} 
                  />
                  <ThemedText style={[
                    styles.addAccountText,
                    { color: isDark ? '#4ade80' : Colors.primary }
                  ]}>
                    Add Bank Account
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.withdrawButton,
                  !isValidAmount && styles.disabledButton
                ]}
                disabled={!isValidAmount}
                onPress={handleWithdraw}
              >
                <ThemedText style={styles.withdrawButtonText}>
                  {!amount ? 'Enter Amount' : 
                   parseFloat(amount) < 100 ? 'Minimum Amount ₹100' :
                   parseFloat(amount) > balance ? 'Insufficient Balance' :
                   amountAfterDeductions <= 0 ? 'Amount Too Low' :
                   `Withdraw ₹${amount}`}
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
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  balanceInfo: {
    marginTop: 0,
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 6,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  taxInfoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  taxInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taxInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  taxInfoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 16,
  },
  taxCalculation: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
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
  totalDeductionsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8,
    marginTop: 4,
  },
  totalDeductionsLabel: {
    fontWeight: '600',
  },
  totalDeductions: {
    color: '#E11D48',
    fontWeight: '600',
  },
  amountAfterTaxRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 8,
    marginTop: 4,
  },
  amountAfterTaxLabel: {
    fontWeight: '600',
  },
  amountAfterTax: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bankAccountContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
  },
  addAccountText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  withdrawButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  withdrawButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  darkModeText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  darkModeHighlight: {
    color: '#ff6b6b',
  },
  darkModeTotalAmount: {
    color: '#4ade80',
    fontWeight: '700',
  }
}); 
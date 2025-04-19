import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';
import { TAX_RATE } from '@/app/lib/WalletService';

interface TaxCreditInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TaxCreditInfoModal({ visible, onClose }: TaxCreditInfoModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialIcons 
                name="info-outline" 
                size={24} 
                color={Colors.primary} 
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.headerTitle}>
                Tax Credit System
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons 
                name="close" 
                size={24} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>How Tax Credits Work</ThemedText>
              <ThemedText style={styles.paragraph}>
                According to government regulations, a {(TAX_RATE * 100).toFixed(0)}% tax is deducted on all gaming transactions. 
                We understand this can reduce your playable amount, so we've created a system to help you enjoy the full value of your deposit.
              </ThemedText>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>When You Deposit</ThemedText>
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <ThemedText>You deposit:</ThemedText>
                  <ThemedText style={styles.infoHighlight}>₹1000</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText>Tax amount ({(TAX_RATE * 100).toFixed(0)}%):</ThemedText>
                  <ThemedText style={styles.taxAmount}>₹{(1000 * TAX_RATE).toFixed(0)}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText>Actual money in wallet:</ThemedText>
                  <ThemedText>₹{(1000 * (1 - TAX_RATE)).toFixed(0)}</ThemedText>
                </View>
                <View style={[styles.infoRow, styles.creditRow]}>
                  <ThemedText style={styles.creditLabel}>Tax Credit bonus:</ThemedText>
                  <ThemedText style={styles.creditAmount}>+₹{(1000 * TAX_RATE).toFixed(0)}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.totalLabel}>Your total balance:</ThemedText>
                  <ThemedText style={styles.totalAmount}>₹1000</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.paragraph}>
                You'll see the full ₹1000, even though technically ₹{(1000 * (1 - TAX_RATE)).toFixed(0)} is your actual money and 
                ₹{(1000 * TAX_RATE).toFixed(0)} is tax credit. This credit can be used for contest entries just like real money.
              </ThemedText>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>When You Enter Contests</ThemedText>
              <ThemedText style={styles.paragraph}>
                When you join contests, your tax credits are used first before your actual balance. 
                This maximizes your playing power while preserving your actual money.
              </ThemedText>
              <View style={styles.exampleBox}>
                <ThemedText style={styles.exampleTitle}>Example:</ThemedText>
                <ThemedText style={styles.exampleText}>
                  If you have ₹720 actual money and ₹280 tax credit, and you enter a ₹100 contest, 
                  the entire ₹100 will be deducted from your tax credit balance first.
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>When You Withdraw</ThemedText>
              <ThemedText style={styles.paragraph}>
                When you withdraw money, the {(TAX_RATE * 100).toFixed(0)}% tax is applied as required by law. 
                This means if you withdraw ₹1000, you'll receive ₹{(1000 * (1 - TAX_RATE)).toFixed(0)} in your account.
              </ThemedText>
              <View style={styles.noteBox}>
                <MaterialIcons 
                  name="lightbulb-outline" 
                  size={20} 
                  color={Colors.primary} 
                  style={{ marginRight: 8 }}
                />
                <ThemedText style={styles.noteText}>
                  Tax credits cannot be withdrawn – they can only be used for playing contests.
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Why We Created This System</ThemedText>
              <ThemedText style={styles.paragraph}>
                We want to ensure you get the most value from your deposits while staying compliant with tax regulations. 
                This system allows you to play with your full deposit amount, making your gaming experience more enjoyable.
              </ThemedText>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeButtonText}>I Understand</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.primary,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoHighlight: {
    fontWeight: '700',
  },
  taxAmount: {
    color: '#E11D48',
  },
  creditRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 12,
    marginTop: 4,
  },
  creditLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  creditAmount: {
    color: Colors.primary,
    fontWeight: '700',
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalAmount: {
    fontWeight: '700',
    fontSize: 16,
  },
  exampleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  exampleTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 
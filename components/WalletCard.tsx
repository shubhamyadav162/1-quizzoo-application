import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { TAX_RATE, HOURLY_PROCESSING_FEE, PROCESSING_HOURS } from '@/app/lib/WalletService';
import { LinearGradient } from 'expo-linear-gradient';

interface WalletCardProps {
  balance: number;
  actualBalance?: number;
  taxCreditBalance?: number;
  onAddMoney: () => void;
  onWithdraw: () => void;
  pulseAnim?: Animated.Value;
  showDetails?: boolean;
}

export function WalletCard({
  balance,
  actualBalance,
  taxCreditBalance,
  onAddMoney,
  onWithdraw,
  pulseAnim,
  showDetails = false,
}: WalletCardProps) {
  const { isDark } = useTheme();
  
  // Calculate scale animation if pulseAnim is provided
  const scale = pulseAnim
    ? pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02],
      })
    : 1;

  // Calculate processing fee
  const processingFee = HOURLY_PROCESSING_FEE * PROCESSING_HOURS;

  // Gradient colors based on theme with 'as const' to satisfy type requirements
  const gradientColors = isDark 
    ? ['#1A237E', '#283593', '#3949AB'] as const
    : ['#3949AB', '#5C6BC0', '#7986CB'] as const;

  return (
    <ThemedView 
      backgroundType="card"
      style={styles.container}
    >
      <Animated.View style={[
        styles.balanceCard, 
        { 
          transform: pulseAnim ? [{ scale }] : [],
        }
      ]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.balanceContainer}>
            <ThemedText style={[
              styles.balanceLabel, 
              { color: '#ffffff', opacity: 0.9 }
            ]}>
              Total Balance
            </ThemedText>
            <ThemedText style={[
              styles.balanceAmount, 
              { color: '#ffffff' }
            ]}>
              ₹{balance}
            </ThemedText>
            
            {/* Tax Credit Information (only shown when showDetails is true) */}
            {showDetails && actualBalance !== undefined && taxCreditBalance !== undefined && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <ThemedText style={[styles.detailLabel, { color: '#ffffff' }]}>Actual Balance:</ThemedText>
                  <ThemedText style={[styles.detailValue, { color: '#ffffff' }]}>₹{actualBalance.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.taxCreditLabelContainer}>
                    <ThemedText style={[styles.detailLabel, { color: '#ffffff' }]}>Tax Credit:</ThemedText>
                    <TouchableOpacity style={styles.infoButton}>
                      <MaterialIcons name="info-outline" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={[styles.detailValue, styles.taxCreditValue, { color: '#ffffff' }]}>
                    ₹{taxCreditBalance.toFixed(2)}
                  </ThemedText>
                </View>
                
                {/* Tax Information Note */}
                <View style={styles.taxNoteContainer}>
                  <MaterialIcons 
                    name="lightbulb-outline" 
                    size={14} 
                    color="#ffffff" 
                  />
                  <ThemedText style={[styles.taxNoteText, { color: '#ffffff' }]}>
                    {`${(TAX_RATE * 100).toFixed(0)}% tax and ₹${processingFee} processing fee is applied on withdrawals.`}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
        
        <View style={[
          styles.actionButtonsContainer,
          { 
            borderTopColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)' 
          }
        ]}>
          <Animatable.View
            animation="fadeInUp"
            delay={200}
            duration={400}
            style={styles.actionButtonWrapper}
          >
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.addButton
              ]}
              onPress={onAddMoney}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>
                Add Money
              </ThemedText>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View
            animation="fadeInUp"
            delay={400}
            duration={400}
            style={styles.actionButtonWrapper}
          >
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.withdrawButton
              ]}
              onPress={onWithdraw}
            >
              <MaterialIcons name="arrow-downward" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>
                Withdraw
              </ThemedText>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    marginVertical: 12,
    overflow: 'hidden',
  },
  balanceCard: {
    width: '100%',
  },
  gradientBackground: {
    width: '100%',
  },
  balanceContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
    paddingRight: 15,
    lineHeight: 36,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  actionButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    elevation: Platform.OS === 'android' ? 1 : 0,
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
  withdrawButton: {
    backgroundColor: '#E11D48',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  // Tax credit details
  detailsContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  taxCreditValue: {
    color: Colors.primary,
  },
  taxCreditLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    marginLeft: 6,
    padding: 2,
  },
  taxNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 8,
  },
  taxNoteText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
}); 
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

// Animation for success
const successAnimation = require('@/assets/animations/payment-success.json');

export default function SuccessScreen() {
  const { isDark } = useTheme();
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Payment Success',
          headerShown: true,
        }} 
      />
      
      <View style={styles.contentContainer}>
        {/* Success Animation */}
        <Animatable.View 
          animation="zoomIn" 
          duration={800} 
          style={styles.animationContainer}
        >
          <View style={styles.animationWrapper}>
            <LottieView
              source={successAnimation}
              autoPlay
              loop={false}
              style={styles.successAnimation}
            />
          </View>
        </Animatable.View>
        
        {/* Success Message */}
        <Animatable.View animation="fadeInUp" delay={400} duration={800}>
          <ThemedText style={styles.successTitle}>Payment Successful!</ThemedText>
          <ThemedText style={styles.successMessage}>
            Your payment has been processed successfully. The amount has been added to your wallet.
          </ThemedText>
        </Animatable.View>
        
        {/* Transaction Details */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={600} 
          duration={800} 
          style={styles.transactionDetailsContainer}
        >
          <View style={[styles.transactionDetails, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          }]}>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Transaction ID</ThemedText>
              <ThemedText style={styles.detailValue}>
                QZ{Date.now().toString().slice(-10)}
              </ThemedText>
            </View>
            
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Date & Time</ThemedText>
              <ThemedText style={styles.detailValue}>
                {new Date().toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ThemedText>
            </View>
            
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Payment Method</ThemedText>
              <ThemedText style={styles.detailValue}>UPI / Payment Gateway</ThemedText>
            </View>
            
            <View style={[styles.detailRow, styles.amountRow]}>
              <ThemedText style={styles.detailLabel}>Amount</ThemedText>
              <ThemedText style={[styles.detailValue, styles.amountValue]}>
                ₹{Math.floor(Math.random() * 5000) + 100}
              </ThemedText>
            </View>
          </View>
        </Animatable.View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Animatable.View animation="fadeInUp" delay={800} duration={500} style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/wallet')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="account-balance-wallet" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <ThemedText style={styles.buttonText}>Go to Wallet</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={900} duration={500} style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)')}
            >
              <View style={[styles.plainButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <FontAwesome5 name="gamepad" size={16} color={isDark ? Colors.dark.tint : Colors.primary} style={styles.buttonIcon} />
                <ThemedText style={[styles.secondaryButtonText, { color: isDark ? Colors.dark.tint : Colors.primary }]}>
                  Play Now
                </ThemedText>
              </View>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  animationContainer: {
    marginBottom: 24,
  },
  animationWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successAnimation: {
    width: 200,
    height: 200,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  transactionDetailsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  transactionDetails: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  amountRow: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionButtonsContainer: {
    width: '100%',
  },
  buttonWrapper: {
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  plainButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 
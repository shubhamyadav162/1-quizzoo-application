import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Temporary QR logo (replace with your app logo)
const logoFromFile = require('@/assets/images/icon.png');

export default function UpiPaymentScreen() {
  const { amount } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [businessUpiId, setBusinessUpiId] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentDetails, setPaymentDetails] = useState({
    amount: parseFloat(amount as string) || 0,
    upi_id: '',
    merchant_name: 'Quizzoo Games',
    transaction_note: '',
  });
  
  // For status check interval
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    fetchUpiSettings();
    generatePaymentRequest();
    
    return () => {
      // Clear the interval when component unmounts
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);
  
  const fetchUpiSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('business_upi_id, business_name')
        .eq('id', '1')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setBusinessUpiId(data.business_upi_id || 'example@upi');
        setPaymentDetails(prev => ({
          ...prev,
          upi_id: data.business_upi_id || 'example@upi',
          merchant_name: data.business_name || 'Quizzoo Games',
        }));
      }
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
      
      // Fallback values if API fails
      setBusinessUpiId('example@upi');
      setPaymentDetails(prev => ({
        ...prev,
        upi_id: 'example@upi',
        merchant_name: 'Quizzoo Games',
      }));
    }
  };
  
  const generatePaymentRequest = async () => {
    if (!amount) {
      Alert.alert('Error', 'Invalid amount');
      router.back();
      return;
    }
    
    setQrGenerating(true);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to add money');
      }
      
      const transactionNote = `Quizzoo wallet topup - ${Date.now().toString().slice(-6)}`;
      
      // Generate a unique reference ID
      const refId = `QZ${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10000)}`;
      setReferenceId(refId);
      
      setPaymentDetails(prev => ({
        ...prev,
        transaction_note: transactionNote,
      }));
      
      // Call Supabase function to generate UPI payment - replace with your actual implementation
      const { data, error } = await supabase.rpc('generate_upi_payment_request', {
        user_id: user.id,
        amount: parseFloat(amount as string),
        reference_id: refId,
        purpose: transactionNote
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        // Use the QR data from the response if available
        if (data.qr_code_data) {
          setQrCodeData(data.qr_code_data);
        } else {
          // Otherwise generate our own QR data
          generateQrData();
        }
        
        // Start checking payment status every 5 seconds
        startStatusCheck();
      } else {
        throw new Error('Failed to generate payment request');
      }
    } catch (error) {
      console.error('Payment generation error:', error);
      Alert.alert('Error', typeof error === 'object' ? (error as Error).message : 'Failed to generate payment request');
      
      // Fall back to client-side QR generation for demo
      generateQrData();
    } finally {
      setQrGenerating(false);
    }
  };
  
  const generateQrData = () => {
    // Generate UPI URL for QR code
    const upiUrl = buildUpiUrl();
    setQrCodeData(upiUrl);
  };
  
  const buildUpiUrl = () => {
    const { amount, upi_id, merchant_name, transaction_note } = paymentDetails;
    
    // Build UPI deep link URL
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upi_id)}&pn=${encodeURIComponent(merchant_name)}&am=${amount}&tn=${encodeURIComponent(transaction_note || 'Quizzoo wallet topup')}&tr=${encodeURIComponent(referenceId)}&cu=INR`;
    
    return upiUrl;
  };
  
  const startStatusCheck = () => {
    // Check immediately first
    checkPaymentStatus();
    
    // Then set interval for checking
    statusCheckInterval.current = setInterval(() => {
      checkPaymentStatus();
    }, 5000); // Check every 5 seconds
  };
  
  const checkPaymentStatus = async () => {
    if (!referenceId || paymentStatus === 'completed') return;
    
    try {
      // Call Supabase function to check payment status
      const { data, error } = await supabase.rpc('check_payment_status', {
        reference_id: referenceId
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        setPaymentStatus(data.status);
        
        if (data.status === 'completed') {
          // Payment successful, stop checking and navigate to success screen
          if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current);
          }
          
          // Navigate to success screen after a short delay
          setTimeout(() => {
            router.replace('/wallet/deposit/success');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };
  
  const copyUpiId = async () => {
    if (businessUpiId) {
      await Clipboard.setStringAsync(businessUpiId);
      Alert.alert('Copied', 'UPI ID copied to clipboard');
    }
  };
  
  const handlePayNow = () => {
    if (!qrCodeData) return;
    
    // Open UPI app with deep link
    Linking.openURL(qrCodeData)
      .catch(err => {
        console.error('UPI app open error:', err);
        Alert.alert(
          'No UPI App Found',
          'No UPI app is installed on your phone or there was an issue opening it. You can scan the QR code with your UPI app instead.',
          [{ text: 'OK' }]
        );
      });
  };
  
  const manuallyCheckStatus = () => {
    setLoading(true);
    checkPaymentStatus();
    setTimeout(() => setLoading(false), 1500);
  };
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'UPI Payment',
          headerShown: true,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Amount Card */}
        <Animatable.View animation="fadeInDown" duration={500} style={styles.amountCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.amountGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.amountLabel}>Amount to Pay</ThemedText>
            <ThemedText style={styles.amountValue}>
              ₹{parseFloat(amount as string).toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.referenceIdText}>
              Ref ID: {referenceId || 'Generating...'}
            </ThemedText>
          </LinearGradient>
        </Animatable.View>

        {/* QR Code Section */}
        <Animatable.View animation="fadeIn" duration={800} delay={200} style={styles.qrCodeSection}>
          <ThemedText style={styles.sectionTitle}>Scan & Pay</ThemedText>
          
          <Shadow distance={8} startColor={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}>
            <View style={[styles.qrCodeContainer, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : '#FFFFFF',
            }]}>
              {qrGenerating ? (
                <View style={styles.qrLoadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <ThemedText style={styles.qrLoadingText}>Generating QR Code...</ThemedText>
                </View>
              ) : qrCodeData ? (
                <QRCode
                  value={qrCodeData}
                  size={200}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logo={logoFromFile}
                  logoSize={40}
                  logoBackgroundColor="#FFFFFF"
                  logoMargin={2}
                  logoBorderRadius={10}
                />
              ) : (
                <View style={styles.qrErrorContainer}>
                  <MaterialIcons name="error-outline" size={40} color={Colors.error} />
                  <ThemedText style={styles.qrErrorText}>Failed to generate QR code</ThemedText>
                </View>
              )}
            </View>
          </Shadow>
          
          <View style={styles.qrInfoContainer}>
            <ThemedText style={styles.qrInfoText}>
              Open any UPI app, scan this QR code and make payment
            </ThemedText>
          </View>
        </Animatable.View>
        
        {/* UPI ID Section */}
        <Animatable.View animation="fadeIn" duration={800} delay={300} style={styles.upiIdSection}>
          <ThemedText style={styles.sectionTitle}>UPI ID</ThemedText>
          
          <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
            <View style={[styles.upiIdContainer, {
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
            }]}>
              <View style={styles.upiIdTextContainer}>
                <ThemedText style={styles.upiIdText}>{businessUpiId}</ThemedText>
              </View>
              
              <TouchableOpacity style={styles.copyButton} onPress={copyUpiId}>
                <MaterialIcons 
                  name="content-copy" 
                  size={20} 
                  color={isDark ? Colors.dark.tint : Colors.primary} 
                />
                <ThemedText style={[styles.copyButtonText, {
                  color: isDark ? Colors.dark.tint : Colors.primary,
                }]}>
                  Copy
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Shadow>
        </Animatable.View>
        
        {/* Payment Status */}
        <Animatable.View animation="fadeIn" duration={800} delay={400} style={styles.statusSection}>
          <ThemedText style={styles.sectionTitle}>Payment Status</ThemedText>
          
          <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
            <View style={[styles.statusContainer, {
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
            }]}>
              <View style={styles.statusIconContainer}>
                {paymentStatus === 'completed' ? (
                  <View style={[styles.statusIcon, styles.successIcon]}>
                    <Ionicons name="checkmark-sharp" size={24} color="#FFFFFF" />
                  </View>
                ) : paymentStatus === 'failed' ? (
                  <View style={[styles.statusIcon, styles.failedIcon]}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={[styles.statusIcon, styles.pendingIcon]}>
                    <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
                      <MaterialIcons name="access-time" size={24} color="#FFFFFF" />
                    </Animatable.View>
                  </View>
                )}
              </View>
              
              <View style={styles.statusTextContainer}>
                <ThemedText style={styles.statusText}>
                  {paymentStatus === 'completed'
                    ? 'Payment Successful'
                    : paymentStatus === 'failed'
                    ? 'Payment Failed'
                    : 'Waiting for Payment'}
                </ThemedText>
                
                <ThemedText style={styles.statusDescription}>
                  {paymentStatus === 'completed'
                    ? 'Your payment has been processed successfully. Amount has been added to your wallet.'
                    : paymentStatus === 'failed'
                    ? 'There was an issue processing your payment. Please try again.'
                    : 'Please complete the payment in your UPI app. Status will update automatically.'}
                </ThemedText>
              </View>
            </View>
          </Shadow>
        </Animatable.View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Animatable.View animation="fadeInUp" delay={500} duration={500} style={styles.actionButtonWrapper}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.payNowButton]}
              onPress={handlePayNow}
              disabled={!qrCodeData || paymentStatus === 'completed'}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={[styles.actionButtonGradient, 
                  (!qrCodeData || paymentStatus === 'completed') && { opacity: 0.6 }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="rupee-sign" size={18} color="#FFFFFF" style={styles.actionButtonIcon} />
                <ThemedText style={styles.actionButtonText}>Pay Now</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
          
          {paymentStatus !== 'completed' && (
            <Animatable.View animation="fadeInUp" delay={600} duration={500} style={styles.actionButtonWrapper}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.checkStatusButton]}
                onPress={manuallyCheckStatus}
                disabled={loading}
              >
                <View style={[styles.plainActionButton, { 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                }]}>
                  {loading ? (
                    <ActivityIndicator size="small" color={isDark ? Colors.dark.tint : Colors.primary} />
                  ) : (
                    <>
                      <MaterialIcons name="refresh" size={18} color={isDark ? Colors.dark.tint : Colors.primary} style={styles.actionButtonIcon} />
                      <ThemedText style={[styles.plainActionButtonText, { 
                        color: isDark ? Colors.dark.tint : Colors.primary 
                      }]}>
                        Check Status
                      </ThemedText>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>
        
        {/* Support Message */}
        <View style={styles.supportContainer}>
          <ThemedText style={styles.supportText}>
            Having trouble with your payment? Please contact our support team.
          </ThemedText>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/contact')}
          >
            <ThemedText style={styles.supportButtonText}>
              Contact Support
            </ThemedText>
          </TouchableOpacity>
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
  amountCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  amountGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  referenceIdText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  qrCodeSection: {
    marginBottom: 24,
  },
  qrCodeContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  qrLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLoadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  qrErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrErrorText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.error,
  },
  qrInfoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  qrInfoText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  upiIdSection: {
    marginBottom: 24,
  },
  upiIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
  },
  upiIdTextContainer: {
    flex: 1,
  },
  upiIdText: {
    fontSize: 16,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  copyButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  statusSection: {
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
  },
  statusIconContainer: {
    marginRight: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    backgroundColor: Colors.success,
  },
  failedIcon: {
    backgroundColor: Colors.error,
  },
  pendingIcon: {
    backgroundColor: Colors.warning,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButtonWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  payNowButton: {
    marginRight: 6,
  },
  checkStatusButton: {
    marginLeft: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  plainActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  plainActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  supportContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  supportText: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  supportButton: {
    padding: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
}); 
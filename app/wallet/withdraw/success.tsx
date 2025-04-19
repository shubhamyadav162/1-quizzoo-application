import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useTheme } from '@/app/lib/ThemeContext';
import { Shadow } from 'react-native-shadow-2';

export default function WithdrawalSuccessScreen() {
  const { isDark } = useTheme();
  let animationRef: LottieView | null = null;

  useEffect(() => {
    // Play the animation when the component mounts
    if (animationRef) {
      animationRef.play();
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Withdrawal Request',
          headerShown: true,
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <Animatable.View animation="zoomIn" duration={800} style={styles.animationContainer}>
          <LottieView
            ref={animation => {
              animationRef = animation;
            }}
            source={require('@/assets/animations/payment-success.json')}
            style={styles.animation}
            loop={false}
            autoPlay
          />
        </Animatable.View>
        
        {/* Success Message */}
        <Animatable.View animation="fadeInUp" delay={300} duration={800} style={styles.messageContainer}>
          <ThemedText style={styles.successTitle}>
            Withdrawal Request Submitted!
          </ThemedText>
          <ThemedText style={styles.successDescription}>
            Your withdrawal request has been successfully submitted and is now awaiting approval.
          </ThemedText>
        </Animatable.View>
        
        {/* Info Cards */}
        <Animatable.View animation="fadeInUp" delay={500} duration={800} style={styles.cardsContainer}>
          <Shadow distance={5} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
            <View style={[styles.infoCard, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
            }]}>
              <View style={styles.infoRow}>
                <MaterialIcons 
                  name="schedule" 
                  size={20} 
                  color={isDark ? Colors.dark.tint : Colors.primary} 
                  style={styles.infoIcon} 
                />
                <ThemedText style={styles.infoTitle}>Processing Time</ThemedText>
              </View>
              <ThemedText style={styles.infoDescription}>
                Withdrawals are typically processed within 24-48 hours after approval. Bank transfers may take 1-3 business days to reflect in your account.
              </ThemedText>
            </View>
          </Shadow>
          
          <Shadow distance={5} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'} style={styles.secondCardShadow}>
            <View style={[styles.infoCard, { 
              backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
            }]}>
              <View style={styles.infoRow}>
                <MaterialIcons 
                  name="notifications" 
                  size={20} 
                  color={isDark ? Colors.dark.tint : Colors.primary} 
                  style={styles.infoIcon} 
                />
                <ThemedText style={styles.infoTitle}>Status Updates</ThemedText>
              </View>
              <ThemedText style={styles.infoDescription}>
                You will receive notifications at each stage of the withdrawal process. You can also check the status in your transaction history.
              </ThemedText>
            </View>
          </Shadow>
        </Animatable.View>
        
        {/* Buttons */}
        <Animatable.View animation="fadeInUp" delay={700} duration={800} style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => router.push('/wallet/transactions')}
          >
            <LinearGradient
              colors={['rgba(33,150,243,0.1)', 'rgba(33,150,243,0.2)']}
              style={styles.viewHistoryGradient}
            >
              <ThemedText style={styles.viewHistoryText}>
                View Transaction History
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.homeButtonGradient}
            >
              <ThemedText style={styles.homeButtonText}>
                Back to Home
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
        
        {/* Support Note */}
        <Animatable.View animation="fadeIn" delay={900} duration={1000} style={styles.supportContainer}>
          <ThemedText style={styles.supportTitle}>Need Help?</ThemedText>
          <ThemedText style={styles.supportText}>
            If you have any questions or concerns about your withdrawal, please contact our support team.
          </ThemedText>
          <Link href="/support" asChild>
            <TouchableOpacity style={styles.supportButton}>
              <ThemedText style={styles.supportButtonText}>
                Contact Support
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </Animatable.View>
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
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    maxWidth: '90%',
  },
  cardsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  secondCardShadow: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  viewHistoryButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  viewHistoryGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewHistoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  supportContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  supportButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
}); 
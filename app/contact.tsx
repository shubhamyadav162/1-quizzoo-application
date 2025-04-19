import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking, Platform, Alert, Share, Clipboard, ScrollView, Image } from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Stack, useRouter } from 'expo-router';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';

type ContactInfo = {
  email: string;
  phone: string;
  address: string;
};

export default function ContactScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  
  const contactInfo: ContactInfo = {
    email: 'contactus@quizzoo.com',
    phone: '7738297334',
    address: 'Office No.71, East Point Mall, Kurla Station, Mumbai - 400024'
  };
  
  const handleCall = () => {
    Linking.openURL(`tel:${contactInfo.phone}`);
  };
  
  const handleEmail = () => {
    Linking.openURL(`mailto:${contactInfo.email}`);
  };
  
  const handleMap = () => {
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${contactInfo.address}`,
      android: `geo:0,0?q=${contactInfo.address}`
    });
    
    Linking.openURL(mapUrl as string);
  };
  
  const copyToClipboard = (text: string, what: string) => {
    Clipboard.setString(text);
    Alert.alert(`Copied to clipboard`, `${what} has been copied to your clipboard.`);
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Contact Quizzoo!\n\nEmail: ${contactInfo.email}\nPhone: ${contactInfo.phone}\nAddress: ${contactInfo.address}`
      });
    } catch (error) {
      console.error('Error sharing contact info:', error);
    }
  };
  
  return (
    <SafeAreaWrapper>
      <Stack.Screen
        options={{
          title: "Contact Us",
          headerStyle: {
            backgroundColor: isDark ? '#121212' : '#f8f9fa',
          },
          headerTitleStyle: {
            color: isDark ? '#ffffff' : '#000000',
          },
          headerBackVisible: true,
        }}
      />
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Animatable.View animation="pulse" iterationCount="infinite" iterationDelay={2000} duration={1500}>
            <View style={[styles.logoCircle, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
              <Image 
                source={require('../assets/images/craiyon_203413_transparent.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animatable.View>
          <ThemedText style={styles.tagline}>
            We're here to help you with any questions or concerns
          </ThemedText>
        </View>
        
        <View style={styles.contactOptions}>
          <Animatable.View animation="fadeInUp" delay={100} duration={500}>
            <TouchableOpacity 
              style={[styles.contactItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
              onPress={handleCall}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#30D158' }]}>
                <Ionicons name="call" size={24} color="#fff" />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText style={styles.contactType}>Call Us</ThemedText>
                <ThemedText style={styles.contactValue}>{contactInfo.phone}</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(contactInfo.phone, 'Phone number')}
              >
                <Feather name="copy" size={18} color={isDark ? "#aaa" : "#888"} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={200} duration={500}>
            <TouchableOpacity 
              style={[styles.contactItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
              onPress={handleEmail}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#5E5CE6' }]}>
                <Ionicons name="mail" size={24} color="#fff" />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText style={styles.contactType}>Email Us</ThemedText>
                <ThemedText style={styles.contactValue}>{contactInfo.email}</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(contactInfo.email, 'Email address')}
              >
                <Feather name="copy" size={18} color={isDark ? "#aaa" : "#888"} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={300} duration={500}>
            <TouchableOpacity 
              style={[styles.contactItem, { backgroundColor: isDark ? '#333' : '#f5f5f5' }]}
              onPress={handleMap}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="location" size={24} color="#fff" />
              </View>
              <View style={styles.contactTextContainer}>
                <ThemedText style={styles.contactType}>Visit Us</ThemedText>
                <ThemedText style={styles.contactValue} numberOfLines={2}>
                  QUICWITS IT TECH LLP
                </ThemedText>
                <ThemedText style={styles.contactValue} numberOfLines={2}>
                  {contactInfo.address}
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(contactInfo.address, 'Address')}
              >
                <Feather name="copy" size={18} color={isDark ? "#aaa" : "#888"} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animatable.View>
        </View>
        
        <Animatable.View animation="fadeInUp" delay={400} duration={500}>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color={isDark ? "#fff" : "#000"} />
            <ThemedText style={styles.shareText}>Share Contact Info</ThemedText>
          </TouchableOpacity>
        </Animatable.View>
        
        <View style={styles.businessHours}>
          <ThemedText style={styles.businessHoursTitle}>Business Hours</ThemedText>
          <ThemedText style={styles.businessHoursText}>Monday - Friday: 9:00 AM - 7:00 PM</ThemedText>
          <ThemedText style={styles.businessHoursText}>Saturday: 10:00 AM - 5:00 PM</ThemedText>
          <ThemedText style={styles.businessHoursText}>Sunday: Closed</ThemedText>
        </View>
        
        <View style={styles.supportNote}>
          <ThemedText style={styles.supportNoteTitle}>Customer Support</ThemedText>
          <ThemedText style={styles.supportNoteText}>
            Our customer support team is available during business hours to assist you with any questions, 
            concerns, or issues you may have regarding the Quizzoo application.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 10,
    opacity: 0.8,
    lineHeight: 24,
  },
  contactOptions: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactValue: {
    fontSize: 17,
    opacity: 0.7,
    marginTop: 4,
  },
  copyButton: {
    padding: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  businessHours: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  businessHoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  businessHoursText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 6,
  },
  supportNote: {
    marginTop: 24,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
  },
  supportNoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportNoteText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    textAlign: 'center',
  },
}); 
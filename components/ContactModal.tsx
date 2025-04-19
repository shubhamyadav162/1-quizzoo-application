import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Linking, Platform, Alert, Share, Clipboard, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';

type ContactInfo = {
  email: string;
  phone: string;
  address: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ContactModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { isDark } = useTheme();
  
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
  
  if (!isVisible) return null;
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animatable.View 
          animation="slideInUp"
          duration={300}
          style={[
            styles.contentContainer,
            { backgroundColor: isDark ? '#1e1e1e' : '#fff' }
          ]}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>Contact Us</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
              <FontAwesome5 name="headset" size={40} color="#5E5CE6" />
            </View>
            <ThemedText style={styles.tagline}>
              We're here to help you with any questions or concerns
            </ThemedText>
          </View>
          
          <View style={styles.contactOptions}>
            <Animatable.View animation="fadeIn" delay={100} duration={500}>
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
            
            <Animatable.View animation="fadeIn" delay={200} duration={500}>
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
            
            <Animatable.View animation="fadeIn" delay={300} duration={500}>
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
          
          <Animatable.View animation="fadeIn" delay={400} duration={500}>
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
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 16,
    opacity: 0.8,
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactValue: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 2,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  shareText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  businessHours: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  businessHoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  businessHoursText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
});

export default ContactModal; 
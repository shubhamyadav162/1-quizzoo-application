import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Modal, Dimensions, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

type Page = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const TermsAndConditionsModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { isDark } = useTheme();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const pages: Page[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: (
        <>
          <ThemedText style={styles.paragraph}>
            Welcome to Quizzoo, a real-time quiz gaming platform where users can participate in synchronous contests and compete for cash prizes.
          </ThemedText>
          
          <ThemedText style={styles.paragraph}>
            These Terms and Conditions ("Terms") constitute a legally binding agreement between you and Quizzoo regarding your use of the Quizzoo application and all related services (collectively, the "Service").
          </ThemedText>
          
          <ThemedText style={styles.paragraph}>
            BY USING OUR SERVICE, YOU AGREE TO THESE TERMS. PLEASE READ THEM CAREFULLY. If you do not agree to these Terms, you must not use our Service.
          </ThemedText>
          
          <ThemedText style={styles.paragraph}>
            These Terms include our Privacy Policy, which is incorporated by reference.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Service Description</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo is a skill-based competitive quiz platform that allows users to participate in real-time contests for cash prizes. The platform charges a 10% commission fee, and 90% of the entry fees go to the prize pool.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Eligibility</ThemedText>
          <ThemedText style={styles.paragraph}>
            To use Quizzoo, you must:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Be at least 18 years of age</ThemedText>
          <ThemedText style={styles.bullet}>• Be a resident of India (excluding states where prohibited)</ThemedText>
          <ThemedText style={styles.bullet}>• Provide accurate and complete information during registration</ThemedText>
          <ThemedText style={styles.bullet}>• Not be prohibited from receiving cash prizes under applicable laws</ThemedText>
          <ThemedText style={styles.bullet}>• Not be on any gambling self-exclusion lists</ThemedText>
          
          <ThemedText style={styles.important}>
            QUIZZOO SERVICES ARE NOT AVAILABLE TO PERSONS UNDER THE AGE OF 18 YEARS. IF YOU ARE UNDER 18 YEARS OF AGE, PLEASE DO NOT USE OUR SERVICE.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'account',
      title: 'Account Registration & KYC',
      content: (
        <>
          <ThemedText style={styles.heading}>Account Registration</ThemedText>
          <ThemedText style={styles.paragraph}>
            To participate in contests with cash prizes, you must create an account and complete our verification process. You agree to:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Provide accurate, current, and complete information</ThemedText>
          <ThemedText style={styles.bullet}>• Maintain and promptly update your account information</ThemedText>
          <ThemedText style={styles.bullet}>• Keep your account credentials secure</ThemedText>
          <ThemedText style={styles.bullet}>• Not share your account with any other person</ThemedText>
          <ThemedText style={styles.bullet}>• Notify us immediately of any unauthorized use of your account</ThemedText>
          
          <ThemedText style={styles.heading}>KYC Verification</ThemedText>
          <ThemedText style={styles.paragraph}>
            For your safety and to comply with regulatory requirements, we implement a Know Your Customer (KYC) process that requires:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Age verification (proof you are 18+)</ThemedText>
          <ThemedText style={styles.bullet}>• Address verification (to ensure you reside in a state where our service is permitted)</ThemedText>
          <ThemedText style={styles.bullet}>• PAN Card details (for tax compliance)</ThemedText>
          
          <ThemedText style={styles.paragraph}>
            You agree to provide the necessary documentation for KYC verification before:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Your first withdrawal</ThemedText>
          <ThemedText style={styles.bullet}>• When cumulative transactions exceed ₹10,000</ThemedText>
          <ThemedText style={styles.bullet}>• When requested by Quizzoo for compliance purposes</ThemedText>
          
          <ThemedText style={styles.important}>
            FAILURE TO COMPLETE KYC VERIFICATION MAY RESULT IN LIMITATIONS TO YOUR ACCOUNT, INCLUDING THE INABILITY TO WITHDRAW FUNDS.
          </ThemedText>
          
          <ThemedText style={styles.paragraph}>
            We reserve the right to request additional documentation or information to verify your identity at any time.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'contest',
      title: 'Contest Mechanics',
      content: (
        <>
          <ThemedText style={styles.heading}>Contest Structure</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo offers various contest types with different entry fees, player counts, and prize structures. Each contest follows these general rules:
          </ThemedText>
          <ThemedText style={styles.bullet}>• 10 questions per contest</ThemedText>
          <ThemedText style={styles.bullet}>• 6-second timer for each question</ThemedText>
          <ThemedText style={styles.bullet}>• Real-time scoring with timing factors</ThemedText>
          <ThemedText style={styles.bullet}>• Questions drawn randomly from our moderated question bank</ThemedText>
          
          <ThemedText style={styles.heading}>Scoring System</ThemedText>
          <ThemedText style={styles.paragraph}>
            Points are awarded based on:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Correctness of answers</ThemedText>
          <ThemedText style={styles.bullet}>• Speed of responses (faster answers earn more points)</ThemedText>
          
          <ThemedText style={styles.heading}>Prize Distribution</ThemedText>
          <ThemedText style={styles.paragraph}>
            Unless otherwise specified for specialty contests, prizes are distributed as follows:
          </ThemedText>
          <ThemedText style={styles.bullet}>• 1st Place: 55.55% of prize pool</ThemedText>
          <ThemedText style={styles.bullet}>• 2nd Place: 27.77% of prize pool</ThemedText>
          <ThemedText style={styles.bullet}>• 3rd Place: 16.66% of prize pool</ThemedText>
          
          <ThemedText style={styles.heading}>Contest Entry</ThemedText>
          <ThemedText style={styles.paragraph}>
            By entering a contest, you agree to:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Pay the specified entry fee</ThemedText>
          <ThemedText style={styles.bullet}>• Abide by all contest rules</ThemedText>
          <ThemedText style={styles.bullet}>• Accept the outcome of the contest as final</ThemedText>
          <ThemedText style={styles.bullet}>• Not use any unauthorized methods to gain advantage</ThemedText>
          
          <ThemedText style={styles.important}>
            QUIZZOO RESERVES THE RIGHT TO DISQUALIFY USERS WHO VIOLATE RULES OR ENGAGE IN SUSPICIOUS ACTIVITY.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'payment',
      title: 'Payment Terms',
      content: (
        <>
          <ThemedText style={styles.heading}>Deposits</ThemedText>
          <ThemedText style={styles.paragraph}>
            You may add funds to your Quizzoo wallet through:
          </ThemedText>
          <ThemedText style={styles.bullet}>• UPI payments</ThemedText>
          <ThemedText style={styles.bullet}>• Approved payment gateways</ThemedText>
          <ThemedText style={styles.bullet}>• Other methods made available by Quizzoo</ThemedText>
          
          <ThemedText style={styles.paragraph}>
            By making a deposit, you confirm:
          </ThemedText>
          <ThemedText style={styles.bullet}>• You are the authorized holder of the payment method used</ThemedText>
          <ThemedText style={styles.bullet}>• You are using legally obtained funds</ThemedText>
          <ThemedText style={styles.bullet}>• You understand that deposits are for participation in skill-based contests</ThemedText>
          
          <ThemedText style={styles.heading}>Withdrawals</ThemedText>
          <ThemedText style={styles.paragraph}>
            Withdrawal requests are subject to:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Completion of KYC verification</ThemedText>
          <ThemedText style={styles.bullet}>• Minimum withdrawal amount of ₹50</ThemedText>
          <ThemedText style={styles.bullet}>• Processing time of 1-3 business days</ThemedText>
          <ThemedText style={styles.bullet}>• Withdrawal to verified accounts/UPI IDs only</ThemedText>
          
          <ThemedText style={styles.heading}>Taxes</ThemedText>
          <ThemedText style={styles.paragraph}>
            You are responsible for all taxes applicable to your winnings:
          </ThemedText>
          <ThemedText style={styles.bullet}>• TDS will be deducted as per Indian tax laws on winnings exceeding thresholds defined by law</ThemedText>
          <ThemedText style={styles.bullet}>• A valid PAN card is required for tax purposes</ThemedText>
          <ThemedText style={styles.bullet}>• You must report winnings in your income tax filings as required by law</ThemedText>
          
          <ThemedText style={styles.important}>
            QUIZZOO IS LEGALLY REQUIRED TO REPORT WINNINGS TO TAX AUTHORITIES AND DEDUCT TDS WHERE APPLICABLE.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'fair-play',
      title: 'Fair Play & Anti-Cheating',
      content: (
        <>
          <ThemedText style={styles.heading}>Fair Play Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo is committed to maintaining a fair and competitive environment. Users must not:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Use multiple accounts to enter the same contest</ThemedText>
          <ThemedText style={styles.bullet}>• Use automated tools or bots to answer questions</ThemedText>
          <ThemedText style={styles.bullet}>• Exploit technical glitches or vulnerabilities</ThemedText>
          <ThemedText style={styles.bullet}>• Collude with other players</ThemedText>
          <ThemedText style={styles.bullet}>• Manipulate contest outcomes through any means</ThemedText>
          <ThemedText style={styles.bullet}>• Use VPNs or location spoofing to participate from restricted areas</ThemedText>
          
          <ThemedText style={styles.heading}>Anti-Cheating Measures</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo implements various security measures, including:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Device fingerprinting</ThemedText>
          <ThemedText style={styles.bullet}>• IP monitoring</ThemedText>
          <ThemedText style={styles.bullet}>• Response pattern analysis</ThemedText>
          <ThemedText style={styles.bullet}>• Time-synchronized questions</ThemedText>
          <ThemedText style={styles.bullet}>• Account activity auditing</ThemedText>
          
          <ThemedText style={styles.heading}>Violations and Penalties</ThemedText>
          <ThemedText style={styles.paragraph}>
            If we detect suspicious activity or rule violations, we may:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Disqualify you from specific contests</ThemedText>
          <ThemedText style={styles.bullet}>• Forfeit your winnings</ThemedText>
          <ThemedText style={styles.bullet}>• Suspend or terminate your account</ThemedText>
          <ThemedText style={styles.bullet}>• Ban you permanently from using our Service</ThemedText>
          <ThemedText style={styles.bullet}>• Take legal action if necessary</ThemedText>
          
          <ThemedText style={styles.important}>
            QUIZZOO HAS ZERO TOLERANCE FOR CHEATING OR FRAUDULENT ACTIVITY. VIOLATIONS MAY RESULT IN PERMANENT ACCOUNT TERMINATION AND FORFEITURE OF FUNDS.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      content: (
        <>
          <ThemedText style={styles.heading}>Ownership of Content</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo and its licensors own all intellectual property rights in the Service, including:
          </ThemedText>
          <ThemedText style={styles.bullet}>• App design and interface</ThemedText>
          <ThemedText style={styles.bullet}>• Question databases</ThemedText>
          <ThemedText style={styles.bullet}>• Logos, trademarks, and brand assets</ThemedText>
          <ThemedText style={styles.bullet}>• Text, graphics, and other content</ThemedText>
          
          <ThemedText style={styles.heading}>Limited License</ThemedText>
          <ThemedText style={styles.paragraph}>
            We grant you a limited, non-exclusive, non-transferable, and revocable license to use the Service for personal, non-commercial purposes in accordance with these Terms.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Restrictions</ThemedText>
          <ThemedText style={styles.paragraph}>
            You may not:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Copy, modify, or create derivative works of the Service</ThemedText>
          <ThemedText style={styles.bullet}>• Reverse engineer, decompile, or disassemble the Service</ThemedText>
          <ThemedText style={styles.bullet}>• Remove copyright or trademark notices</ThemedText>
          <ThemedText style={styles.bullet}>• Use the Service for commercial purposes</ThemedText>
          <ThemedText style={styles.bullet}>• Scrape or extract question databases</ThemedText>
          <ThemedText style={styles.bullet}>• Use the Service to develop competing products</ThemedText>
          
          <ThemedText style={styles.heading}>User Content</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you provide feedback, suggestions, or other content to Quizzoo, you grant us a perpetual, irrevocable, non-exclusive, royalty-free right to use such content for any purpose without compensation to you.
          </ThemedText>
          
          <ThemedText style={styles.important}>
            UNAUTHORIZED USE OF QUIZZOO'S INTELLECTUAL PROPERTY MAY RESULT IN LEGAL ACTION.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      content: (
        <>
          <ThemedText style={styles.heading}>Data Collection and Usage</ThemedText>
          <ThemedText style={styles.paragraph}>
            We collect and process your personal information in accordance with our Privacy Policy. By using Quizzoo, you consent to our data practices as described in the Privacy Policy.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Types of Data Collected</ThemedText>
          <ThemedText style={styles.paragraph}>
            The information we collect includes:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Personal identifiers (name, email, phone number)</ThemedText>
          <ThemedText style={styles.bullet}>• KYC documents (ID proof, address proof, PAN card)</ThemedText>
          <ThemedText style={styles.bullet}>• Payment information</ThemedText>
          <ThemedText style={styles.bullet}>• Device information and IP address</ThemedText>
          <ThemedText style={styles.bullet}>• Usage data and contest performance</ThemedText>
          <ThemedText style={styles.bullet}>• Communication records with our support team</ThemedText>
          
          <ThemedText style={styles.heading}>Data Security</ThemedText>
          <ThemedText style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Encryption of sensitive data</ThemedText>
          <ThemedText style={styles.bullet}>• Secure payment processing</ThemedText>
          <ThemedText style={styles.bullet}>• Regular security audits</ThemedText>
          <ThemedText style={styles.bullet}>• Access controls for our personnel</ThemedText>
          
          <ThemedText style={styles.heading}>Third-Party Services</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may use third-party services to:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Process payments</ThemedText>
          <ThemedText style={styles.bullet}>• Verify identity</ThemedText>
          <ThemedText style={styles.bullet}>• Analyze app performance</ThemedText>
          <ThemedText style={styles.bullet}>• Improve our Service</ThemedText>
          
          <ThemedText style={styles.paragraph}>
            These third parties have their own privacy policies, and we recommend reviewing them.
          </ThemedText>
          
          <ThemedText style={styles.important}>
            YOU HAVE RIGHTS REGARDING YOUR PERSONAL DATA, INCLUDING ACCESS, CORRECTION, AND DELETION, SUBJECT TO LEGAL REQUIREMENTS.
          </ThemedText>
        </>
      ),
    },
    {
      id: 'legal',
      title: 'Legal & Compliance',
      content: (
        <>
          <ThemedText style={styles.heading}>Legal Compliance</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo operates as a skill-based gaming platform in compliance with Indian laws. Our contests are designed to test knowledge, speed, and skill rather than being games of chance.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Governing Law</ThemedText>
          <ThemedText style={styles.paragraph}>
            These Terms are governed by the laws of India. Any disputes arising out of or related to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in [City Name], India.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Regulatory Compliance</ThemedText>
          <ThemedText style={styles.paragraph}>
            Quizzoo complies with all applicable regulations, including:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Anti-money laundering (AML) laws</ThemedText>
          <ThemedText style={styles.bullet}>• Know Your Customer (KYC) regulations</ThemedText>
          <ThemedText style={styles.bullet}>• Tax reporting requirements</ThemedText>
          <ThemedText style={styles.bullet}>• Consumer protection laws</ThemedText>
          
          <ThemedText style={styles.heading}>Limitation of Liability</ThemedText>
          <ThemedText style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUIZZOO AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE SERVICE.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Changes to Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may modify these Terms at any time by posting the revised Terms on our Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </ThemedText>
          <ThemedText style={styles.bullet}>• Email: contactus@quizzoo.com</ThemedText>
          <ThemedText style={styles.bullet}>• Phone: 7738297334</ThemedText>
          <ThemedText style={styles.bullet}>• Address: Office No.71, East Point Mall, Kurla Station, Mumbai - 400024</ThemedText>
          
          <ThemedText style={styles.important}>
            BY USING QUIZZOO, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
          </ThemedText>
        </>
      ),
    },
  ];
  
  const navigateToPage = (index: number) => {
    setCurrentPageIndex(index);
  };
  
  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };
  
  const currentPage = pages[currentPageIndex];
  
  // Define gradient colors with 'as const' to satisfy type requirements
  const headerGradientColors = isDark 
    ? ['#1A237E', '#283593'] as const
    : ['#3949AB', '#5C6BC0'] as const;
    
  const buttonGradientColors = ['#3949AB', '#5C6BC0'] as const;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ThemedView style={[
          styles.contentContainer,
          { backgroundColor: isDark ? '#121212' : '#fff' }
        ]}>
          <LinearGradient
            colors={headerGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.header,
              { 
                paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 76,
              }
            ]}
          >
            <StatusBar
              backgroundColor={isDark ? '#1A237E' : '#3949AB'}
              barStyle="light-content"
            />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <ThemedText style={[styles.headerTitle, { color: '#ffffff' }]}>
              Terms & Conditions
            </ThemedText>
            
            <View style={styles.headerPlaceholder} />
          </LinearGradient>
          
          <View style={[
            styles.tabsContainer,
            { borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
          ]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tabsContent}
            >
              {pages.map((page, index) => (
                <TouchableOpacity
                  key={page.id}
                  style={[
                    styles.tab,
                    { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    currentPageIndex === index && {
                      backgroundColor: isDark ? '#3949AB' : '#5C6BC0', 
                      borderColor: isDark ? '#3949AB' : '#5C6BC0',
                    }
                  ]}
                  onPress={() => navigateToPage(index)}
                >
                  <ThemedText 
                    style={[
                      styles.tabText,
                      { fontWeight: currentPageIndex === index ? 'bold' : 'normal' },
                      currentPageIndex === index && { color: '#fff' }
                    ]}
                  >
                    {page.title}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <ScrollView 
            style={styles.contentScroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 100 } // Extra padding to ensure content doesn't get cut off
            ]}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.pageTitle}>
              {currentPage.title}
            </ThemedText>
            
            {currentPage.content}
            
            <View style={styles.pageNavigation}>
              {currentPageIndex > 0 && (
                <TouchableOpacity 
                  style={[
                    styles.navButton, 
                    styles.prevButton,
                    { 
                      backgroundColor: isDark ? '#1E293B' : '#fff',
                      borderColor: isDark ? '#334155' : '#ccc'
                    }
                  ]} 
                  onPress={prevPage}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={20} 
                    color={isDark ? '#cbd5e1' : '#333'} 
                  />
                  <ThemedText style={styles.navButtonText}>Previous</ThemedText>
                </TouchableOpacity>
              )}
              
              {currentPageIndex < pages.length - 1 && (
                <TouchableOpacity 
                  style={[
                    styles.navButton, 
                    styles.nextButton,
                    { 
                      backgroundColor: isDark ? '#1E293B' : '#fff',
                      borderColor: isDark ? '#334155' : '#ccc'
                    }
                  ]} 
                  onPress={nextPage}
                >
                  <ThemedText style={styles.navButtonText}>Next</ThemedText>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isDark ? '#cbd5e1' : '#333'} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 40,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 76,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  prevButton: {
    paddingHorizontal: 12,
  },
  nextButton: {
    paddingHorizontal: 12,
  },
  navButtonText: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  acceptButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Content styles for the Terms & Conditions text
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 5,
  },
  important: {
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    lineHeight: 22,
  }
});

export default TermsAndConditionsModal; 
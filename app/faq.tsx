import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, Switch, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { ProfessionalHeader } from '@/components/ProfessionalHeader';

type FAQCategory = {
  id: string;
  title: string;
  titleHindi: string;
  icon: string;
  faqs: FAQ[];
};

type FAQ = {
  id: string;
  question: string;
  questionHindi: string;
  answer: string;
  answerHindi: string;
};

export default function FAQScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>("deposits");
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});
  const [isHindi, setIsHindi] = useState(false);
  
  const faqCategories: FAQCategory[] = [
    {
      id: "deposits",
      title: "Deposits & Wallet",
      titleHindi: "जमा और वॉलेट",
      icon: "wallet-outline",
      faqs: [
        {
          id: "deposit-methods",
          question: "What payment methods can I use to add money to my wallet?",
          questionHindi: "अपने वॉलेट में पैसा जोड़ने के लिए मैं कौन से भुगतान विधियों का उपयोग कर सकता हूँ?",
          answer: "Quizzoo supports multiple secure payment methods including UPI, Net Banking, Credit Cards, Debit Cards, and popular mobile wallets. All transactions are processed through secure payment gateways that comply with industry standards.",
          answerHindi: "Quizzoo कई सुरक्षित भुगतान विधियों का समर्थन करता है, जिनमें UPI, नेट बैंकिंग, क्रेडिट कार्ड, डेबिट कार्ड और लोकप्रिय मोबाइल वॉलेट शामिल हैं। सभी लेनदेन उद्योग मानकों के अनुरूप सुरक्षित भुगतान गेटवे के माध्यम से संसाधित किए जाते हैं।"
        },
        {
          id: "deposit-time",
          question: "How long does it take for deposited money to reflect in my wallet?",
          questionHindi: "जमा किए गए पैसे को मेरे वॉलेट में दिखने में कितना समय लगता है?",
          answer: "In most cases, deposits are instant. However, during peak times or due to banking/network delays, it might take up to 30 minutes. If your payment is debited but not credited to your wallet after 30 minutes, please contact our customer support with your transaction ID.",
          answerHindi: "अधिकांश मामलों में, जमा तुरंत होता है। हालांकि, पीक टाइम के दौरान या बैंकिंग/नेटवर्क देरी के कारण, इसमें 30 मिनट तक का समय लग सकता है। यदि आपका भुगतान डेबिट हो गया है लेकिन 30 मिनट के बाद भी आपके वॉलेट में क्रेडिट नहीं हुआ है, तो कृपया अपने लेनदेन आईडी के साथ हमारे ग्राहक सहायता से संपर्क करें।"
        },
        {
          id: "deposit-limit",
          question: "Is there a minimum or maximum deposit limit?",
          questionHindi: "क्या जमा की न्यूनतम या अधिकतम सीमा है?",
          answer: "The minimum deposit amount is ₹10. The maximum deposit limit is ₹10,000 per transaction and ₹50,000 per day. These limits are in place to promote responsible gaming and comply with regulatory requirements.",
          answerHindi: "न्यूनतम जमा राशि ₹10 है। अधिकतम जमा सीमा प्रति लेन-देन ₹10,000 और प्रति दिन ₹50,000 है। ये सीमाएँ जिम्मेदार गेमिंग को बढ़ावा देने और नियामक आवश्यकताओं का पालन करने के लिए हैं।"
        },
        {
          id: "transaction-failure",
          question: "What should I do if my transaction failed but money was deducted?",
          questionHindi: "अगर मेरा लेनदेन विफल हो गया लेकिन पैसा कट गया तो मुझे क्या करना चाहिए?",
          answer: "If your money was deducted but not credited to your wallet, don't worry. Failed transactions are automatically refunded within 5-7 working days by your payment provider. You can also raise a ticket through our 'Contact Us' section with your transaction details for faster resolution.",
          answerHindi: "यदि आपका पैसा कट गया है लेकिन आपके वॉलेट में जमा नहीं हुआ है, तो चिंता न करें। विफल लेनदेन आपके भुगतान प्रदाता द्वारा 5-7 कार्य दिवसों के भीतर स्वचालित रूप से वापस कर दिए जाते हैं। आप तेज़ समाधान के लिए अपने लेनदेन विवरण के साथ हमारे 'हमसे संपर्क करें' अनुभाग के माध्यम से एक टिकट भी उठा सकते हैं।"
        },
        {
          id: "wallet-security",
          question: "How secure is my wallet and payment information?",
          questionHindi: "मेरा वॉलेट और भुगतान जानकारी कितनी सुरक्षित है?",
          answer: "Your wallet and payment information are protected with industry-standard encryption. We do not store your complete card details. All payments are processed through PCI-DSS compliant payment gateways, ensuring the highest level of security for your transactions.",
          answerHindi: "आपका वॉलेट और भुगतान जानकारी उद्योग-मानक एन्क्रिप्शन के साथ सुरक्षित है। हम आपके संपूर्ण कार्ड विवरण संग्रहीत नहीं करते हैं। सभी भुगतान PCI-DSS अनुपालन भुगतान गेटवे के माध्यम से संसाधित किए जाते हैं, जो आपके लेनदेन के लिए सुरक्षा का उच्चतम स्तर सुनिश्चित करता है।"
        }
      ]
    },
    {
      id: "withdrawals",
      title: "Withdrawals",
      titleHindi: "पैसे निकालना",
      icon: "cash-outline",
      faqs: [
        {
          id: "withdrawal-process",
          question: "How do I withdraw my winnings?",
          questionHindi: "मैं अपनी जीती हुई राशि कैसे निकालूं?",
          answer: "To withdraw your winnings, go to the Wallet section, select 'Withdraw', enter the amount you wish to withdraw, and choose your preferred withdrawal method. You'll need to complete KYC verification before your first withdrawal.",
          answerHindi: "अपनी जीती हुई राशि निकालने के लिए, वॉलेट अनुभाग पर जाएं, 'निकासी' का चयन करें, वह राशि दर्ज करें जिसे आप निकालना चाहते हैं, और अपनी पसंदीदा निकासी विधि चुनें। आपको अपनी पहली निकासी से पहले KYC सत्यापन पूरा करना होगा।"
        },
        {
          id: "withdrawal-time",
          question: "How long does it take to process withdrawal requests?",
          questionHindi: "निकासी अनुरोधों को संसाधित करने में कितना समय लगता है?",
          answer: "Withdrawal requests are typically processed within 24-48 hours. Once processed, the funds will be credited to your account based on your bank's processing time, which is usually 1-3 banking days.",
          answerHindi: "निकासी अनुरोधों को आमतौर पर 24-48 घंटों के भीतर संसाधित किया जाता है। एक बार संसाधित होने के बाद, आपके बैंक के प्रोसेसिंग समय के आधार पर धनराशि आपके खाते में जमा कर दी जाएगी, जो आमतौर पर 1-3 बैंकिंग दिन होती है।"
        },
        {
          id: "withdrawal-limit",
          question: "Is there a minimum or maximum withdrawal limit?",
          questionHindi: "क्या निकासी की न्यूनतम या अधिकतम सीमा है?",
          answer: "The minimum withdrawal amount is ₹50. The maximum withdrawal limit is ₹10,000 per transaction and ₹50,000 per day, subject to your KYC verification status and account activity.",
          answerHindi: "न्यूनतम निकासी राशि ₹50 है। अधिकतम निकासी सीमा प्रति लेनदेन ₹10,000 और प्रति दिन ₹50,000 है, जो आपके KYC सत्यापन स्थिति और खाता गतिविधि के अधीन है।"
        },
        {
          id: "kyc-withdrawal",
          question: "Why do I need to complete KYC for withdrawals?",
          questionHindi: "मुझे निकासी के लिए KYC पूरा करने की आवश्यकता क्यों है?",
          answer: "KYC (Know Your Customer) verification is a regulatory requirement to prevent fraud, ensure the security of transactions, and comply with anti-money laundering regulations. It's a one-time process that enables smooth withdrawals in the future.",
          answerHindi: "KYC (अपने ग्राहक को जानें) सत्यापन धोखाधड़ी को रोकने, लेनदेन की सुरक्षा सुनिश्चित करने और मनी लॉन्ड्रिंग विरोधी नियमों का पालन करने के लिए एक नियामक आवश्यकता है। यह एक बार की प्रक्रिया है जो भविष्य में सुचारू निकासी को सक्षम बनाती है।"
        },
        {
          id: "withdrawal-tax",
          question: "Is tax deducted on my winnings?",
          questionHindi: "क्या मेरी जीत पर टैक्स कटौती होती है?",
          answer: "Yes, as per Indian tax regulations, TDS (Tax Deducted at Source) is applicable on game winnings. For winnings above the threshold defined by law, the applicable TDS will be deducted before processing your withdrawal. A valid PAN card is required for tax purposes.",
          answerHindi: "हां, भारतीय कर नियमों के अनुसार, खेल की जीत पर TDS (स्रोत पर कर कटौती) लागू होता है। कानून द्वारा परिभाषित सीमा से अधिक जीत के लिए, आपकी निकासी को संसाधित करने से पहले लागू TDS काट लिया जाएगा। कर उद्देश्यों के लिए एक वैध पैन कार्ड आवश्यक है।"
        }
      ]
    },
    {
      id: "contests",
      title: "Contests & Prizes",
      titleHindi: "प्रतियोगिताएं और इनाम",
      icon: "trophy-outline",
      faqs: [
        {
          id: "contest-types",
          question: "What types of contests are available on Quizzoo?",
          questionHindi: "Quizzoo पर किस प्रकार की प्रतियोगिताएं उपलब्ध हैं?",
          answer: "Quizzoo offers various contest formats including 1v1 duels, 10-player standard contests, 20-player pro contests, and 50-player royal contests. Entry fees range from ₹10 to ₹1000, catering to both casual players and serious competitors.",
          answerHindi: "Quizzoo विभिन्न प्रतियोगिता प्रारूप प्रदान करता है, जिसमें 1v1 द्वंद्व, 10-खिलाड़ी मानक प्रतियोगिताएं, 20-खिलाड़ी प्रो प्रतियोगिताएं और 50-खिलाड़ी रॉयल प्रतियोगिताएं शामिल हैं। प्रवेश शुल्क ₹10 से ₹1000 तक है, जो आकस्मिक खिलाड़ियों और गंभीर प्रतिस्पर्धियों दोनों के लिए है।"
        },
        {
          id: "prize-distribution",
          question: "How are prizes distributed in contests?",
          questionHindi: "प्रतियोगिताओं में पुरस्कार कैसे वितरित किए जाते हैं?",
          answer: "In standard contests, prizes are distributed as follows: 1st Place: 50% of prize pool, 2nd Place: 30% of prize pool, 3rd Place: 20% of prize pool. For 1v1 duels, the winner receives 90% of the prize pool. The platform charges a 10% service fee on all contests.",
          answerHindi: "मानक प्रतियोगिताओं में, पुरस्कार इस प्रकार वितरित किए जाते हैं: 1st स्थान: पुरस्कार पूल का 50%, 2nd स्थान: पुरस्कार पूल का 30%, 3rd स्थान: पुरस्कार पूल का 20%। 1v1 द्वंद्व के लिए, विजेता को पुरस्कार पूल का 90% प्राप्त होता है। प्लेटफॉर्म सभी प्रतियोगिताओं पर 10% सेवा शुल्क लेता है।"
        },
        {
          id: "contest-fairness",
          question: "How does Quizzoo ensure fair play in contests?",
          questionHindi: "Quizzoo प्रतियोगिताओं में फेयर प्ले कैसे सुनिश्चित करता है?",
          answer: "We use several anti-cheating measures including time synchronization, response validation, device fingerprinting, IP monitoring, and pattern analysis. Any suspicious activity is flagged and reviewed. We maintain a zero-tolerance policy towards unfair play.",
          answerHindi: "हम समय सिंक्रनाइज़ेशन, प्रतिक्रिया सत्यापन, डिवाइस फिंगरप्रिंटिंग, IP मॉनिटरिंग और पैटर्न विश्लेषण सहित कई एंटी-चीटिंग उपायों का उपयोग करते हैं। किसी भी संदिग्ध गतिविधि को फ्लैग किया जाता है और समीक्षा की जाती है। हम अनुचित खेल के प्रति शून्य-सहनशीलता नीति बनाए रखते हैं।"
        },
        {
          id: "winnings-wallet",
          question: "When are my winnings credited to my wallet?",
          questionHindi: "मेरी जीत मेरे वॉलेट में कब क्रेडिट की जाती है?",
          answer: "Contest winnings are automatically credited to your wallet immediately after the contest concludes and results are finalized, typically within 2 minutes of contest completion.",
          answerHindi: "प्रतियोगिता जीत प्रतियोगिता समाप्त होने और परिणाम अंतिम होने के तुरंत बाद आपके वॉलेट में स्वचालित रूप से क्रेडिट कर दी जाती है, आमतौर पर प्रतियोगिता पूरा होने के 2 मिनट के भीतर।"
        },
        {
          id: "contest-cancellation",
          question: "What happens if a contest is cancelled?",
          questionHindi: "अगर कोई प्रतियोगिता रद्द हो जाती है तो क्या होता है?",
          answer: "If a contest is cancelled for any reason, your entry fee will be refunded to your wallet immediately. In case of technical issues during a contest, we may void the contest and refund all entry fees or restart it at a later time.",
          answerHindi: "यदि किसी भी कारण से कोई प्रतियोगिता रद्द कर दी जाती है, तो आपका प्रवेश शुल्क तुरंत आपके वॉलेट में वापस कर दिया जाएगा। प्रतियोगिता के दौरान तकनीकी समस्याओं के मामले में, हम प्रतियोगिता को रद्द कर सकते हैं और सभी प्रवेश शुल्क वापस कर सकते हैं या इसे बाद में फिर से शुरू कर सकते हैं।"
        }
      ]
    },
    {
      id: "account",
      title: "Account & Security",
      titleHindi: "खाता और सुरक्षा",
      icon: "shield-checkmark-outline",
      faqs: [
        {
          id: "account-security",
          question: "How does Quizzoo protect my account?",
          questionHindi: "Quizzoo मेरे खाते की सुरक्षा कैसे करता है?",
          answer: "We implement multiple security measures including secure password storage, two-factor authentication options, session management, device verification, and regular security audits to protect your account and personal information.",
          answerHindi: "हम आपके खाते और व्यक्तिगत जानकारी की सुरक्षा के लिए सुरक्षित पासवर्ड स्टोरेज, टू-फैक्टर ऑथेंटिकेशन विकल्प, सेशन प्रबंधन, डिवाइस सत्यापन और नियमित सुरक्षा ऑडिट सहित कई सुरक्षा उपाय लागू करते हैं।"
        },
        {
          id: "data-privacy",
          question: "What data does Quizzoo collect and how is it used?",
          questionHindi: "Quizzoo कौन सा डेटा एकत्र करता है और इसका उपयोग कैसे किया जाता है?",
          answer: "We collect necessary information for account creation, KYC verification, and service improvement. Your data is used solely for providing our services, improving user experience, and regulatory compliance. We never sell your personal data to third parties. For complete details, please refer to our Privacy Policy.",
          answerHindi: "हम खाता बनाने, KYC सत्यापन और सेवा सुधार के लिए आवश्यक जानकारी एकत्र करते हैं। आपका डेटा केवल हमारी सेवाएं प्रदान करने, उपयोगकर्ता अनुभव में सुधार और नियामक अनुपालन के लिए उपयोग किया जाता है। हम कभी भी आपका व्यक्तिगत डेटा तीसरे पक्ष को नहीं बेचते हैं। पूर्ण विवरण के लिए, कृपया हमारी गोपनीयता नीति देखें।"
        },
        {
          id: "account-deletion",
          question: "How can I delete my account?",
          questionHindi: "मैं अपना खाता कैसे डिलीट करूं?",
          answer: "To delete your account, please contact our customer support through the 'Contact Us' section. Note that account deletion will be processed after any pending withdrawals are completed and will result in the loss of any remaining balance, game history, and achievements.",
          answerHindi: "अपना खाता हटाने के लिए, कृपया 'हमसे संपर्क करें' अनुभाग के माध्यम से हमारे ग्राहक सहायता से संपर्क करें। ध्यान दें कि खाता हटाने की प्रक्रिया किसी भी लंबित निकासी के पूरा होने के बाद की जाएगी और इसके परिणामस्वरूप किसी भी शेष राशि, गेम इतिहास और उपलब्धियों का नुकसान होगा।"
        },
        {
          id: "kyc-documents",
          question: "What documents are required for KYC verification?",
          questionHindi: "KYC सत्यापन के लिए किन दस्तावेजों की आवश्यकता है?",
          answer: "For KYC verification, you need to provide: 1) Proof of Identity (Aadhaar Card, PAN Card, Voter ID, or Passport), 2) Proof of Address (if different from ID proof), and 3) A selfie for verification purposes. All documents must be clearly legible and not expired.",
          answerHindi: "KYC सत्यापन के लिए, आपको प्रदान करने की आवश्यकता है: 1) पहचान का प्रमाण (आधार कार्ड, पैन कार्ड, वोटर आईडी, या पासपोर्ट), 2) पते का प्रमाण (यदि आईडी प्रूफ से अलग है), और 3) सत्यापन उद्देश्यों के लिए एक सेल्फी। सभी दस्तावेज स्पष्ट रूप से पठनीय और समाप्त नहीं होने चाहिए।"
        },
        {
          id: "age-verification",
          question: "How does Quizzoo verify my age?",
          questionHindi: "Quizzoo मेरी उम्र कैसे सत्यापित करता है?",
          answer: "Quizzoo verifies age through the KYC process, which requires government-issued identity documents. Users must be at least 18 years old to participate in contests with cash prizes, as required by law. We implement strict age verification to prevent underage gaming.",
          answerHindi: "Quizzoo KYC प्रक्रिया के माध्यम से आयु सत्यापित करता है, जिसके लिए सरकार द्वारा जारी पहचान दस्तावेजों की आवश्यकता होती है। कानून द्वारा आवश्यक नकद पुरस्कार वाली प्रतियोगिताओं में भाग लेने के लिए उपयोगकर्ताओं की आयु कम से कम 18 वर्ष होनी चाहिए। हम नाबालिग गेमिंग को रोकने के लिए सख्त आयु सत्यापन लागू करते हैं।"
        }
      ]
    }
  ];
  
  const toggleFAQ = (faqId: string) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };
  
  const toggleLanguage = () => {
    setIsHindi(prev => !prev);
  };
  
  const renderFAQItem = ({ item }: { item: FAQ }) => (
    <Animatable.View 
      animation={expandedFaqs[item.id] ? "fadeIn" : ""}
      duration={300}
      style={styles.faqContainer}
    >
      <TouchableOpacity 
        style={[
          styles.faqQuestion,
          { backgroundColor: isDark ? '#333' : '#f5f5f5' }
        ]}
        onPress={() => toggleFAQ(item.id)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.questionText}>
          {isHindi ? item.questionHindi : item.question}
        </ThemedText>
        
        <Ionicons 
          name={expandedFaqs[item.id] ? 'chevron-up' : 'chevron-down'} 
          size={22} 
          color={isDark ? '#aaa' : '#666'}
        />
      </TouchableOpacity>
      
      {expandedFaqs[item.id] && (
        <Animatable.View
          animation="fadeIn"
          duration={300}
          style={[
            styles.faqAnswer,
            { backgroundColor: isDark ? '#2a2a2a' : '#fff' }
          ]}
        >
          <ThemedText style={styles.answerText}>
            {isHindi ? item.answerHindi : item.answer}
          </ThemedText>
        </Animatable.View>
      )}
    </Animatable.View>
  );
  
  const renderCategory = ({ item }: { item: FAQCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        activeCategory === item.id && styles.activeCategory,
        { 
          backgroundColor: isDark 
            ? (activeCategory === item.id ? '#5E5CE6' : '#333') 
            : (activeCategory === item.id ? '#5E5CE6' : '#f0f0f0')
        }
      ]}
      onPress={() => setActiveCategory(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={activeCategory === item.id ? '#fff' : (isDark ? '#bbb' : '#555')}
        style={styles.categoryIcon}
      />
      <ThemedText 
        style={[
          styles.categoryText,
          { color: activeCategory === item.id ? '#fff' : (isDark ? '#bbb' : '#555') }
        ]}
      >
        {isHindi ? item.titleHindi : item.title}
      </ThemedText>
    </TouchableOpacity>
  );
  
  const activeFaqs = faqCategories.find(cat => cat.id === activeCategory)?.faqs || [];
  
  const LanguageToggle = () => (
    <View style={styles.languageToggleContainer}>
      <ThemedText style={styles.languageLabel}>
        {isHindi ? "English" : "हिंदी"}
      </ThemedText>
      <Switch
        value={isHindi}
        onValueChange={toggleLanguage}
        trackColor={{ false: '#767577', true: '#5E5CE6' }}
        thumbColor={isHindi ? '#f4f3f4' : '#f4f3f4'}
      />
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <ProfessionalHeader
        title={isHindi ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
        subtitle={isHindi ? "Quizzoo के बारे में सामान्य प्रश्नों के उत्तर पाएं" : "Find answers to common questions about Quizzoo"}
        leftIcon={{
          name: "question-answer",
          type: "MaterialIcons",
          color: "#5E5CE6"
        }}
        showBackButton={true}
        rightContent={<LanguageToggle />}
      />
      
      <View style={styles.categoryContainer}>
        <FlatList
          data={faqCategories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      <ScrollView 
        style={styles.faqListContainer}
        contentContainerStyle={styles.faqListContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.sectionTitle}>
          {isHindi 
            ? faqCategories.find(cat => cat.id === activeCategory)?.titleHindi 
            : faqCategories.find(cat => cat.id === activeCategory)?.title}
        </ThemedText>
        
        {activeFaqs.map(faq => (
          <React.Fragment key={faq.id}>
            {renderFAQItem({ item: faq })}
          </React.Fragment>
        ))}
        
        <View style={styles.contactSection}>
          <ThemedText style={styles.contactText}>
            {isHindi 
              ? "क्या आपको वह नहीं मिला जिसकी आप तलाश कर रहे थे?" 
              : "Didn't find what you were looking for?"}
          </ThemedText>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/contact')}
          >
            <ThemedText style={styles.contactButtonText}>
              {isHindi ? "सहायता से संपर्क करें" : "Contact Support"}
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
  languageToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageLabel: {
    marginRight: 10,
    fontSize: 14,
  },
  categoryContainer: {
    paddingVertical: 15,
  },
  categoryList: {
    paddingHorizontal: 15,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    marginRight: 10,
  },
  activeCategory: {
    backgroundColor: '#5E5CE6',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  faqListContainer: {
    flex: 1,
  },
  faqListContent: {
    padding: 15,
    paddingTop: 5,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 5,
  },
  faqContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  contactSection: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
  },
  contactText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#5E5CE6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 
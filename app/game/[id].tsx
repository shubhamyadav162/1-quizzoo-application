import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Easing,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

interface Player {
  id: number;
  name: string;
  score: number;
  correctAnswers: number;
  avgTime: string;
  isUser?: boolean;
}

// Dummy question bank
const QUESTIONS = [
  {
    id: 1,
    text: 'किस वर्ष में भारत स्वतंत्र हुआ था?',
    options: ['1945', '1947', '1950', '1942'],
    correctAnswer: 1, // Index of correct answer (0-based)
    category: 'History',
  },
  {
    id: 2,
    text: 'भारत की राजधानी क्या है?',
    options: ['मुंबई', 'कोलकाता', 'चेन्नई', 'नई दिल्ली'],
    correctAnswer: 3,
    category: 'Geography',
  },
  {
    id: 3,
    text: 'एक किलोग्राम में कितने ग्राम होते हैं?',
    options: ['10', '100', '1000', '10000'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 4,
    text: 'विश्व का सबसे ऊंचा पर्वत कौन सा है?',
    options: ['माउंट एवरेस्ट', 'के2', 'कंचनजंगा', 'माउंट किलिमंजारो'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 5,
    text: 'शेक्सपियर के प्रसिद्ध नाटक "हैमलेट" का मुख्य चरित्र कौन है?',
    options: ['ओथेलो', 'मैकबेथ', 'हैमलेट', 'रोमियो'],
    correctAnswer: 2,
    category: 'Literature',
  },
  {
    id: 6,
    text: 'भारत का राष्ट्रीय खेल क्या है?',
    options: ['क्रिकेट', 'हॉकी', 'फुटबॉल', 'कबड्डी'],
    correctAnswer: 1,
    category: 'Sports',
  },
  {
    id: 7,
    text: 'सौरमंडल में कितने ग्रह हैं?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 8,
    text: 'निम्न में से कौन सा देश दक्षिण अमेरिका में नहीं है?',
    options: ['मेक्सिको', 'ब्राज़ील', 'अर्जेंटीना', 'चिली'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 9,
    text: 'H2O किसका रासायनिक सूत्र है?',
    options: ['ऑक्सीजन', 'हाइड्रोजन', 'पानी', 'नमक'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 10,
    text: 'महात्मा गांधी का जन्म कब हुआ था?',
    options: ['2 अक्टूबर 1869', '15 अगस्त 1872', '26 जनवरी 1870', '14 नवंबर 1868'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 11,
    text: 'पृथ्वी सूर्य की परिक्रमा कितने दिनों में पूरी करती है?',
    options: ['365.25 दिन', '364 दिन', '366 दिन', '360 दिन'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 12,
    text: 'भारत के प्रथम प्रधानमंत्री कौन थे?',
    options: ['सरदार पटेल', 'जवाहरलाल नेहरू', 'महात्मा गांधी', 'डॉ. राजेंद्र प्रसाद'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 13,
    text: 'कंप्यूटर की मुख्य प्रोसेसिंग यूनिट को क्या कहते हैं?',
    options: ['माउस', 'RAM', 'CPU', 'मॉनिटर'],
    correctAnswer: 2,
    category: 'Technology',
  },
  {
    id: 14,
    text: 'विटामिन C का रासायनिक नाम क्या है?',
    options: ['एस्कॉर्बिक एसिड', 'साइट्रिक एसिड', 'रेटिनॉल', 'टोकोफेरॉल'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 15,
    text: 'शरीर में रक्त का थक्का बनाने में कौन सा विटामिन मदद करता है?',
    options: ['विटामिन A', 'विटामिन B', 'विटामिन K', 'विटामिन D'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 16,
    text: 'विश्व का सबसे बड़ा महासागर कौन सा है?',
    options: ['अटलांटिक', 'हिंद', 'आर्कटिक', 'प्रशांत'],
    correctAnswer: 3,
    category: 'Geography',
  },
  {
    id: 17,
    text: 'किस देश को "उगते सूरज का देश" कहा जाता है?',
    options: ['चीन', 'जापान', 'कोरिया', 'थाईलैंड'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 18,
    text: 'कौन सा ग्रह सूर्य के सबसे नजदीक है?',
    options: ['शुक्र', 'बुध', 'पृथ्वी', 'मंगल'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 19,
    text: '"हेमलेट" किसकी रचना है?',
    options: ['चार्ल्स डिकेंस', 'विलियम शेक्सपियर', 'जेन ऑस्टिन', 'टॉलस्टॉय'],
    correctAnswer: 1,
    category: 'Literature',
  },
  {
    id: 20,
    text: 'डीएनए का पूरा नाम क्या है?',
    options: ['डाइनेमिक नेचुरल एसिड', 'डिऑक्सीराइबोन्यूक्लिक एसिड', 'डिजिटल नेचुरल एक्सिस', 'डिस्ट्रीब्यूटेड न्यूरल एक्टिविटी'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 21,
    text: 'इंसान के शरीर में कितनी हड्डियां होती हैं?',
    options: ['206', '205', '208', '210'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 22,
    text: 'महाभारत के लेखक कौन थे?',
    options: ['तुलसीदास', 'वाल्मीकि', 'कालिदास', 'वेद व्यास'],
    correctAnswer: 3,
    category: 'Literature',
  },
  {
    id: 23,
    text: 'भारत के राष्ट्रीय पक्षी का नाम क्या है?',
    options: ['कोयल', 'मोर', 'गौरैया', 'बाज'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 24,
    text: 'ताजमहल किसने बनवाया था?',
    options: ['अकबर', 'शाहजहाँ', 'औरंगजेब', 'हुमायूँ'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 25,
    text: 'रसायन विज्ञान में \'Au\' किस तत्व का प्रतीक है?',
    options: ['चांदी', 'सोना', 'तांबा', 'एल्युमिनियम'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 26,
    text: 'ब्लू व्हेल क्या है?',
    options: ['सबसे बड़ा स्तनधारी', 'अंटार्कटिका में पाई जाने वाली मछली', 'एक मोबाइल गेम', 'एक कंप्यूटर वायरस'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 27,
    text: 'चारमीनार कहाँ स्थित है?',
    options: ['दिल्ली', 'जयपुर', 'हैदराबाद', 'लखनऊ'],
    correctAnswer: 2,
    category: 'Geography',
  },
  {
    id: 28,
    text: 'प्रकाश किसकी गति से चलता है?',
    options: ['300,000 किमी/सेकंड', '350,000 किमी/सेकंड', '250,000 किमी/सेकंड', '299,792 किमी/सेकंड'],
    correctAnswer: 3,
    category: 'Science',
  },
  {
    id: 29,
    text: 'पानी का अणुसूत्र क्या है?',
    options: ['H2O2', 'HO2', 'H2O', 'H3O'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 30,
    text: 'भारत के राष्ट्रीय फल का नाम क्या है?',
    options: ['केला', 'आम', 'अनार', 'सेब'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 31,
    text: 'ओलंपिक ध्वज में कितने रिंग हैं?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    category: 'Sports',
  },
  {
    id: 32,
    text: 'प्रथम विश्व युद्ध कब शुरू हुआ था?',
    options: ['1914', '1916', '1918', '1939'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 33,
    text: 'हिंदी दिवस कब मनाया जाता है?',
    options: ['14 सितंबर', '26 जनवरी', '15 अगस्त', '2 अक्टूबर'],
    correctAnswer: 0,
    category: 'General Knowledge',
  },
  {
    id: 34,
    text: 'पिरामिड किस देश में स्थित हैं?',
    options: ['मेक्सिको', 'ग्रीस', 'इटली', 'मिस्र'],
    correctAnswer: 3,
    category: 'Geography',
  },
  {
    id: 35,
    text: 'कंप्यूटर में 1 किलोबाइट कितने बाइट्स के बराबर होता है?',
    options: ['1000', '100', '1024', '10000'],
    correctAnswer: 2,
    category: 'Technology',
  },
  {
    id: 36,
    text: 'किस वैज्ञानिक ने गुरुत्वाकर्षण के नियम की खोज की थी?',
    options: ['आइंस्टाइन', 'न्यूटन', 'गैलीलियो', 'फैराडे'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 37,
    text: 'मंगल ग्रह को अन्य किस नाम से जाना जाता है?',
    options: ['नीला ग्रह', 'लाल ग्रह', 'पीला ग्रह', 'हरा ग्रह'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 38,
    text: 'यूनेस्को का मुख्यालय कहाँ है?',
    options: ['जिनेवा', 'न्यूयॉर्क', 'पेरिस', 'लंदन'],
    correctAnswer: 2,
    category: 'General Knowledge',
  },
  {
    id: 39,
    text: 'मिसाइल मैन ऑफ इंडिया किसे कहा जाता है?',
    options: ['डॉ. होमी भाभा', 'डॉ. ए.पी.जे. अब्दुल कलाम', 'डॉ. सी.वी. रमन', 'डॉ. विक्रम साराभाई'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 40,
    text: 'भारत का राष्ट्रीय पशु कौन सा है?',
    options: ['शेर', 'बाघ', 'हाथी', 'घोड़ा'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 41,
    text: 'विश्व का सबसे छोटा महाद्वीप कौन सा है?',
    options: ['एशिया', 'अफ्रीका', 'ऑस्ट्रेलिया', 'यूरोप'],
    correctAnswer: 2,
    category: 'Geography',
  },
  {
    id: 42,
    text: 'वायुमंडल में सबसे अधिक किस गैस की मात्रा है?',
    options: ['ऑक्सीजन', 'नाइट्रोजन', 'कार्बन डाइऑक्साइड', 'हाइड्रोजन'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 43,
    text: 'अंतरराष्ट्रीय महिला दिवस कब मनाया जाता है?',
    options: ['8 मार्च', '5 जून', '21 अप्रैल', '10 दिसंबर'],
    correctAnswer: 0,
    category: 'General Knowledge',
  },
  {
    id: 44,
    text: 'HTML का पूरा नाम क्या है?',
    options: ['हाइपर टेक्स्ट मार्किंग लैंग्वेज', 'हाइपर टेक्स्ट मार्कअप लैंग्वेज', 'हाइपर टेक्स्ट मैनेजमेंट लैंग्वेज', 'हाइपर टाइम मल्टीपल लैंग्वेज'],
    correctAnswer: 1,
    category: 'Technology',
  },
  {
    id: 45,
    text: 'भारत के पहले अंतरिक्ष यात्री कौन थे?',
    options: ['राकेश शर्मा', 'कल्पना चावला', 'सुनीता विलियम्स', 'रविश मल्होत्रा'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 46,
    text: 'दक्षिण भारत का सबसे ऊंचा पर्वत शिखर कौन सा है?',
    options: ['अनाई मुदी', 'महेंद्रगिरि', 'नीलगिरि', 'दोदाबेटा'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 47,
    text: 'विश्व में अंग्रेजी भाषा बोलने वाले सबसे अधिक लोग किस देश में हैं?',
    options: ['अमेरिका', 'ब्रिटेन', 'कनाडा', 'भारत'],
    correctAnswer: 0,
    category: 'General Knowledge',
  },
  {
    id: 48,
    text: 'खालसा पंथ की स्थापना किसने की थी?',
    options: ['गुरु नानक देव', 'गुरु गोबिंद सिंह', 'गुरु तेग बहादुर', 'गुरु अर्जुन देव'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 49,
    text: 'विश्व का सबसे बड़ा रेगिस्तान कौन सा है?',
    options: ['थार', 'सहारा', 'गोबी', 'अटाकामा'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 50,
    text: 'भारत में सबसे लंबी नदी कौन सी है?',
    options: ['गंगा', 'यमुना', 'ब्रह्मपुत्र', 'गोदावरी'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 51,
    text: 'अंतर्राष्ट्रीय योग दिवस कब मनाया जाता है?',
    options: ['21 मार्च', '21 जून', '21 सितंबर', '21 दिसंबर'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 52,
    text: 'संयुक्त राष्ट्र संघ की स्थापना कब हुई थी?',
    options: ['1945', '1947', '1950', '1960'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 53,
    text: 'किस वैज्ञानिक ने सापेक्षता का सिद्धांत प्रतिपादित किया था?',
    options: ['न्यूटन', 'आइंस्टाइन', 'गैलीलियो', 'स्टीफन हॉकिंग'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 54,
    text: 'भारत का सबसे बड़ा राज्य कौन सा है?',
    options: ['मध्य प्रदेश', 'महाराष्ट्र', 'राजस्थान', 'उत्तर प्रदेश'],
    correctAnswer: 2,
    category: 'Geography',
  },
  {
    id: 55,
    text: 'विश्व का सबसे बड़ा द्वीप कौन सा है?',
    options: ['ग्रीनलैंड', 'आइसलैंड', 'बोर्नियो', 'मेडागास्कर'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 56,
    text: 'विटामिन D का मुख्य स्रोत क्या है?',
    options: ['सूर्य की रोशनी', 'फल', 'सब्जियां', 'मांस'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 57,
    text: 'विंबलडन टेनिस टूर्नामेंट कहां आयोजित किया जाता है?',
    options: ['न्यूयॉर्क', 'पेरिस', 'मेलबर्न', 'लंदन'],
    correctAnswer: 3,
    category: 'Sports',
  },
  {
    id: 58,
    text: 'पुस्तक "द जंगल बुक" के लेखक कौन हैं?',
    options: ['रुडयार्ड किपलिंग', 'चार्ल्स डिकेंस', 'लुईस कैरल', 'मार्क ट्वेन'],
    correctAnswer: 0,
    category: 'Literature',
  },
  {
    id: 59,
    text: 'किस भारतीय वैज्ञानिक को नोबेल पुरस्कार मिला था?',
    options: ['जगदीश चंद्र बोस', 'होमी भाभा', 'सी.वी. रमन', 'विक्रम साराभाई'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 60,
    text: 'लिनक्स का सिंबल क्या है?',
    options: ['भालू', 'पेंगुइन', 'चीता', 'भेड़िया'],
    correctAnswer: 1,
    category: 'Technology',
  },
  {
    id: 61,
    text: 'किस ग्रह को शाम का तारा कहा जाता है?',
    options: ['मंगल', 'बृहस्पति', 'शुक्र', 'शनि'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 62,
    text: 'ब्रिटिश संसद का नाम क्या है?',
    options: ['कांग्रेस', 'पार्लियामेंट', 'राइक्स्टैग', 'डूमा'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 63,
    text: 'मोनालिसा की पेंटिंग किसने बनाई थी?',
    options: ['विन्सेंट वैन गॉग', 'लियोनार्डो दा विंची', 'पाब्लो पिकासो', 'माइकल एंजेलो'],
    correctAnswer: 1,
    category: 'Art',
  },
  {
    id: 64,
    text: 'खून का थक्का बनने के लिए किस विटामिन की आवश्यकता होती है?',
    options: ['विटामिन A', 'विटामिन C', 'विटामिन D', 'विटामिन K'],
    correctAnswer: 3,
    category: 'Science',
  },
  {
    id: 65,
    text: 'भारतीय संविधान के निर्माण में कितना समय लगा था?',
    options: ['1 वर्ष', '2 वर्ष 11 महीने 18 दिन', '3 वर्ष', '7 वर्ष'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 66,
    text: 'करेंसी की क्रिप्टोग्राफी पर आधारित डिजिटल करेंसी क्या कहलाती है?',
    options: ['डिजिटल मनी', 'ई-कैश', 'क्रिप्टोकरेंसी', 'वर्चुअल करेंसी'],
    correctAnswer: 2,
    category: 'Technology',
  },
  {
    id: 67,
    text: 'भारत का सबसे बड़ा बांध कौन सा है?',
    options: ['भाखड़ा नांगल बांध', 'सरदार सरोवर बांध', 'हीराकुंड बांध', 'तेहरी बांध'],
    correctAnswer: 3,
    category: 'Geography',
  },
  {
    id: 68,
    text: 'फीफा विश्व कप 2022 कहां आयोजित किया गया था?',
    options: ['ब्राज़ील', 'रूस', 'कतर', 'जर्मनी'],
    correctAnswer: 2,
    category: 'Sports',
  },
  {
    id: 69,
    text: 'डेटाबेस से जानकारी प्राप्त करने के लिए किस भाषा का उपयोग किया जाता है?',
    options: ['HTML', 'JavaScript', 'SQL', 'Python'],
    correctAnswer: 2,
    category: 'Technology',
  },
  {
    id: 70,
    text: 'कौन सा देश यूरोप में नहीं है?',
    options: ['स्पेन', 'नॉर्वे', 'जापान', 'पोलैंड'],
    correctAnswer: 2,
    category: 'Geography',
  },
  {
    id: 71,
    text: 'गणित के पिता किसे माना जाता है?',
    options: ['आर्यभट्ट', 'पाइथागोरस', 'यूक्लिड', 'आर्किमिडीज'],
    correctAnswer: 1,
    category: 'Mathematics',
  },
  {
    id: 72,
    text: 'पेरियोडिक टेबल में कितने तत्व हैं?',
    options: ['108', '118', '120', '112'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 73,
    text: 'नोबेल शांति पुरस्कार किस शहर में दिया जाता है?',
    options: ['स्टॉकहोम', 'ओस्लो', 'न्यूयॉर्क', 'जिनेवा'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 74,
    text: 'भारतीय रिज़र्व बैंक की स्थापना कब हुई थी?',
    options: ['1935', '1947', '1950', '1969'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 75,
    text: 'मानव शरीर की सबसे बड़ी ग्रंथि कौन सी है?',
    options: ['यकृत (लिवर)', 'पित्ताशय', 'अग्न्याशय', 'थायरॉयड'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 76,
    text: 'जालियांवाला बाग हत्याकांड कब हुआ था?',
    options: ['1919', '1920', '1925', '1942'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 77,
    text: 'भारत के किस राज्य में चाय का सबसे अधिक उत्पादन होता है?',
    options: ['केरल', 'असम', 'पश्चिम बंगाल', 'तमिलनाडु'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 78,
    text: 'मानव शरीर में कितना प्रतिशत पानी होता है?',
    options: ['50-60%', '60-70%', '70-80%', '40-50%'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 79,
    text: 'ऑस्कर पुरस्कार के लिए सही नाम क्या है?',
    options: ['अकादमी अवार्ड्स', 'नेशनल फिल्म अवार्ड्स', 'गोल्डन ग्लोब अवार्ड्स', 'बाफ्टा अवार्ड्स'],
    correctAnswer: 0,
    category: 'Entertainment',
  },
  {
    id: 80,
    text: 'भारत का पहला अंतरिक्ष यान कौन सा था?',
    options: ['आर्यभट्ट', 'इनसैट', 'चंद्रयान-1', 'मंगलयान'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 81,
    text: 'भारतीय संविधान की प्रस्तावना में कितने शब्द हैं?',
    options: ['75', '85', '93', '63'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 82,
    text: 'विश्व एड्स दिवस कब मनाया जाता है?',
    options: ['1 दिसंबर', '1 जनवरी', '1 अगस्त', '1 जुलाई'],
    correctAnswer: 0,
    category: 'General Knowledge',
  },
  {
    id: 83,
    text: 'सबसे छोटा महासागर कौन सा है?',
    options: ['हिंद महासागर', 'आर्कटिक महासागर', 'दक्षिणी महासागर', 'अटलांटिक महासागर'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 84,
    text: 'भारत में राष्ट्रीय विज्ञान दिवस कब मनाया जाता है?',
    options: ['28 फरवरी', '14 नवंबर', '2 अक्टूबर', '15 अगस्त'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 85,
    text: 'पृथ्वी के चारों ओर चंद्रमा एक चक्कर कितने दिनों में पूरा करता है?',
    options: ['21 दिन', '30 दिन', '27.3 दिन', '365 दिन'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 86,
    text: 'भारत में कितने राज्य और केंद्र शासित प्रदेश हैं?',
    options: ['28 राज्य, 8 केंद्र शासित प्रदेश', '29 राज्य, 7 केंद्र शासित प्रदेश', '28 राज्य, 9 केंद्र शासित प्रदेश', '30 राज्य, 7 केंद्र शासित प्रदेश'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 87,
    text: 'इंसान के शरीर का सबसे बड़ा अंग कौन सा है?',
    options: ['लिवर', 'मस्तिष्क', 'त्वचा', 'आंत'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 88,
    text: 'भारत में हड़प्पा सभ्यता के अवशेष किस राज्य में मिले थे?',
    options: ['बिहार', 'पंजाब', 'उत्तर प्रदेश', 'राजस्थान'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 89,
    text: 'जाकिर हुसैन किस वाद्य यंत्र के लिए प्रसिद्ध हैं?',
    options: ['तबला', 'सितार', 'बांसुरी', 'वायलिन'],
    correctAnswer: 0,
    category: 'Music',
  },
  {
    id: 90,
    text: 'एसिड वर्षा का मुख्य कारण क्या है?',
    options: ['वायु प्रदूषण', 'जल प्रदूषण', 'मृदा प्रदूषण', 'ध्वनि प्रदूषण'],
    correctAnswer: 0,
    category: 'Environment',
  },
  {
    id: 91,
    text: 'सेल फोन का आविष्कार किसने किया था?',
    options: ['अलेक्जेंडर ग्राहम बेल', 'मार्टिन कूपर', 'थॉमस एडिसन', 'निकोला टेस्ला'],
    correctAnswer: 1,
    category: 'Technology',
  },
  {
    id: 92,
    text: 'संयुक्त राष्ट्र सुरक्षा परिषद में कितने स्थायी सदस्य हैं?',
    options: ['3', '5', '7', '10'],
    correctAnswer: 1,
    category: 'General Knowledge',
  },
  {
    id: 93,
    text: 'विश्व का सबसे लंबा रेलवे प्लेटफॉर्म कहां है?',
    options: ['गोरखपुर', 'खड़गपुर', 'जयपुर', 'सियालदह'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 94,
    text: 'GUI का पूरा नाम क्या है?',
    options: ['ग्राफिकल यूजर इंटरफेस', 'ग्रैंड यूनिफाइड इंटरफेस', 'ग्राफिकल यूनिफाइड इंटरफेस', 'ग्रैंड यूजर इंटरफेस'],
    correctAnswer: 0,
    category: 'Technology',
  },
  {
    id: 95,
    text: 'ब्लू व्हेल का हृदय कितना बड़ा होता है?',
    options: ['मानव के सिर के आकार का', 'छोटी कार के आकार का', 'फुटबॉल के आकार का', 'टेनिस बॉल के आकार का'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 96,
    text: 'भारत के पहले गवर्नर जनरल कौन थे?',
    options: ['लॉर्ड माउंटबेटन', 'सी. राजगोपालाचारी', 'डॉ. राजेंद्र प्रसाद', 'जवाहरलाल नेहरू'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 97,
    text: 'विश्व का सबसे बड़ा जीवित स्तनधारी कौन सा है?',
    options: ['अफ्रीकी हाथी', 'हिप्पोपोटैमस', 'व्हेल शार्क', 'नीली व्हेल'],
    correctAnswer: 3,
    category: 'Science',
  },
  {
    id: 98,
    text: 'बिटकॉइन किस वर्ष में लॉन्च हुआ था?',
    options: ['2007', '2008', '2009', '2010'],
    correctAnswer: 2,
    category: 'Technology',
  },
  {
    id: 99,
    text: 'शतरंज की उत्पत्ति किस देश में हुई थी?',
    options: ['ग्रीस', 'चीन', 'भारत', 'पर्शिया'],
    correctAnswer: 2,
    category: 'History',
  },
  {
    id: 100,
    text: 'इंटरनेट का आविष्कार किसने किया था?',
    options: ['टिम बर्नर्स-ली', 'विंटन सर्फ और बॉब कान', 'स्टीव जॉब्स', 'बिल गेट्स'],
    correctAnswer: 1,
    category: 'Technology',
  },
  {
    id: 101,
    text: 'निम्न में से कौन सी फसल खरीफ फसल है?',
    options: ['गेहूं', 'धान', 'चना', 'मटर'],
    correctAnswer: 1,
    category: 'Agriculture',
  },
  {
    id: 102,
    text: 'भारत में किस नदी को गंगा की सहायक नदी नहीं माना जाता है?',
    options: ['यमुना', 'गोमती', 'नर्मदा', 'सोन'],
    correctAnswer: 2,
    category: 'Geography',
  },
  {
    id: 103,
    text: 'निम्न में से कौन सा एक वायरस जनित रोग है?',
    options: ['मलेरिया', 'टायफाइड', 'डेंगू', 'टीबी'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 104,
    text: 'राष्ट्रीय गणित दिवस कब मनाया जाता है?',
    options: ['22 दिसंबर', '23 दिसंबर', '24 दिसंबर', '25 दिसंबर'],
    correctAnswer: 0,
    category: 'Mathematics',
  },
  {
    id: 105,
    text: 'चित्तौड़गढ़ का किला किस राज्य में स्थित है?',
    options: ['राजस्थान', 'मध्य प्रदेश', 'गुजरात', 'महाराष्ट्र'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 106,
    text: 'भारत में सबसे अधिक बारिश वाला स्थान कौन सा है?',
    options: ['शिलांग', 'मावसिनराम', 'चेरापूंजी', 'दार्जिलिंग'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 107,
    text: 'बंगाल का विभाजन किस वर्ष हुआ था?',
    options: ['1905', '1947', '1950', '1911'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 108,
    text: 'एलाटॉसीन (Allatocin) किस में पाया जाता है?',
    options: ['स्तनधारी', 'कीट', 'सरीसृप', 'मछली'],
    correctAnswer: 1,
    category: 'Science',
  },
  {
    id: 109,
    text: 'किस नेता को बिहार केसरी के नाम से जाना जाता है?',
    options: ['डॉ. राजेंद्र प्रसाद', 'श्रीकृष्ण सिंह', 'जयप्रकाश नारायण', 'अनुग्रह नारायण सिंह'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 110,
    text: 'ओलंपिक खेलों का आयोजन कितने वर्षों में एक बार होता है?',
    options: ['2 वर्ष', '3 वर्ष', '4 वर्ष', '5 वर्ष'],
    correctAnswer: 2,
    category: 'Sports',
  },
  {
    id: 111,
    text: 'भारत की पहली महिला IPS अधिकारी कौन थीं?',
    options: ['किरण बेदी', 'प्रतिभा पाटिल', 'इंदिरा गांधी', 'सरोजिनी नायडू'],
    correctAnswer: 0,
    category: 'History',
  },
  {
    id: 112,
    text: 'मानव शरीर में रक्त का pH मान क्या होता है?',
    options: ['6.4', '7.0', '7.4', '8.0'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 113,
    text: 'विश्व का सबसे बड़ा प्रायद्वीप कौन सा है?',
    options: ['अरब प्रायद्वीप', 'बाल्कन प्रायद्वीप', 'इंडोचाइना प्रायद्वीप', 'अरब प्रायद्वीप'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 114,
    text: 'अमेरिका के कितने राज्य हैं?',
    options: ['48', '50', '52', '46'],
    correctAnswer: 1,
    category: 'Geography',
  },
  {
    id: 115,
    text: 'भारत का राष्ट्रीय पेड़ कौन सा है?',
    options: ['पीपल', 'नीम', 'बरगद', 'आम'],
    correctAnswer: 2,
    category: 'General Knowledge',
  },
  {
    id: 116,
    text: 'राष्ट्रीय विज्ञान दिवस किसकी याद में मनाया जाता है?',
    options: ['सी.वी. रमन', 'होमी भाभा', 'विक्रम साराभाई', 'जगदीश चंद्र बोस'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 117,
    text: 'प्रसिद्ध इमारत "बुर्ज खलीफा" कहां स्थित है?',
    options: ['दुबई', 'अबू धाबी', 'दोहा', 'रियाद'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 118,
    text: 'लिपिड क्या है?',
    options: ['प्रोटीन', 'कार्बोहाइड्रेट', 'वसा', 'विटामिन'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 119,
    text: 'भारत का पहला परमाणु परीक्षण कब हुआ था?',
    options: ['1971', '1974', '1989', '1998'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 120,
    text: 'सपनों का अध्ययन क्या कहलाता है?',
    options: ['ऑनिरोलॉजी', 'सोमनोलॉजी', 'नीरोलॉजी', 'साइकोलॉजी'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 121,
    text: 'भारत में कौन सी नदी सबसे लंबी है?',
    options: ['गंगा', 'ब्रह्मपुत्र', 'गोदावरी', 'यमुना'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 122,
    text: 'विश्व व्यापार संगठन (WTO) की स्थापना किस वर्ष हुई थी?',
    options: ['1991', '1993', '1995', '1997'],
    correctAnswer: 2,
    category: 'General Knowledge',
  },
  {
    id: 123,
    text: 'जैव विविधता का सबसे बड़ा भंडार किसे माना जाता है?',
    options: ['अमेज़न रेनफॉरेस्ट', 'ग्रेट बैरियर रीफ', 'कांगो बेसिन', 'वेस्टर्न घाट्स'],
    correctAnswer: 0,
    category: 'Environment',
  },
  {
    id: 124,
    text: 'हड़प्पा और मोहनजोदड़ो किस नदी के किनारे स्थित थे?',
    options: ['गंगा', 'सिंधु', 'सरस्वती', 'ब्रह्मपुत्र'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 125,
    text: 'RAM का पूरा नाम क्या है?',
    options: ['Random Available Memory', 'Readily Available Memory', 'Random Access Memory', 'Read Access Memory'],
    correctAnswer: 2,
    category: 'Technology',
  },
  {
    id: 126,
    text: 'चोला साम्राज्य का सबसे प्रसिद्ध शासक कौन था?',
    options: ['राजेंद्र चोल', 'राजराज चोल', 'कृष्णदेव राय', 'पुलकेशिन द्वितीय'],
    correctAnswer: 1,
    category: 'History',
  },
  {
    id: 127,
    text: 'शतरंज में किस प्यादे को "रानी" कहा जाता है?',
    options: ['किंग', 'क्वीन', 'नाइट', 'बिशप'],
    correctAnswer: 1,
    category: 'Sports',
  },
  {
    id: 128,
    text: 'ऊर्जा का SI मात्रक क्या है?',
    options: ['वाट', 'न्यूटन', 'जूल', 'पास्कल'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 129,
    text: 'ब्रह्मांड के विस्तार के सिद्धांत को क्या कहा जाता है?',
    options: ['बिग बैंग थ्योरी', 'रिलेटिविटी थ्योरी', 'न्यूट्रिनो थ्योरी', 'क्वांटम थ्योरी'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 130,
    text: 'भारत के किस राज्य का तटीय क्षेत्र सबसे लंबा है?',
    options: ['गुजरात', 'तमिलनाडु', 'आंध्र प्रदेश', 'केरल'],
    correctAnswer: 0,
    category: 'Geography',
  },
  {
    id: 131,
    text: 'रामायण की रचना किसने की थी?',
    options: ['कालिदास', 'तुलसीदास', 'वाल्मीकि', 'व्यास'],
    correctAnswer: 2,
    category: 'Literature',
  },
  {
    id: 132,
    text: 'विश्व का सबसे गर्म स्थान कौन सा है?',
    options: ['डैथ वैली', 'सहारा रेगिस्तान', 'दक्षिणी ईरान (लूत रेगिस्तान)', 'दशत-ए-लूत'],
    correctAnswer: 3,
    category: 'Geography',
  },
  {
    id: 133,
    text: 'भारत में सबसे पहले किस क्रिकेट टूर्नामेंट की शुरुआत हुई थी?',
    options: ['रणजी ट्रॉफी', 'दलीप ट्रॉफी', 'ईरानी ट्रॉफी', 'विजय हजारे ट्रॉफी'],
    correctAnswer: 0,
    category: 'Sports',
  },
  {
    id: 134,
    text: 'सर्वाधिक ऑस्कर जीतने वाली फिल्म कौन सी है?',
    options: ['टाइटैनिक', 'बेन-हर', 'द लॉर्ड ऑफ द रिंग्स: द रिटर्न ऑफ द किंग', 'वेस्ट साइड स्टोरी'],
    correctAnswer: 0,
    category: 'Entertainment',
  },
  {
    id: 135,
    text: 'निम्न में से कौन सा एक रसायन नहीं है?',
    options: ['रेडियम', 'थोरियम', 'यूरेनियम', 'प्लूटो'],
    correctAnswer: 3,
    category: 'Science',
  },
  {
    id: 136,
    text: 'पृथ्वी का वायुमंडल कितने परतों से बना है?',
    options: ['3', '4', '5', '7'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 137,
    text: 'साहित्य में नोबेल पुरस्कार जीतने वाले पहले भारतीय कौन थे?',
    options: ['रबींद्रनाथ टैगोर', 'अमर्त्य सेन', 'मदर टेरेसा', 'सी.वी. रमन'],
    correctAnswer: 0,
    category: 'Literature',
  },
  {
    id: 138,
    text: 'निम्न में से कौन एक सिंथेटिक फाइबर है?',
    options: ['कपास', 'जूट', 'नायलॉन', 'रेशम'],
    correctAnswer: 2,
    category: 'Science',
  },
  {
    id: 139,
    text: 'ट्रांजिस्टर का आविष्कार किसने किया था?',
    options: ['जे.बी. बार्डीन, डब्ल्यू. ब्रैटन और डब्ल्यू. शॉकले', 'थॉमस एडिसन', 'अलेक्जेंडर ग्राहम बेल', 'निकोला टेस्ला'],
    correctAnswer: 0,
    category: 'Science',
  },
  {
    id: 140,
    text: 'शांति निकेतन विश्वविद्यालय की स्थापना किसने की थी?',
    options: ['स्वामी विवेकानंद', 'रबींद्रनाथ टैगोर', 'जवाहरलाल नेहरू', 'महात्मा गांधी'],
    correctAnswer: 1,
    category: 'History',
  }
];

// Contest data
const getContestById = (id: string) => {
  const CONTESTS = [
    {
      id: '1',
      name: 'Daily Quiz Challenge',
      entryFee: 10,
      prizePool: 900,
      participants: 100,
      maxParticipants: 100,
      category: 'General Knowledge',
      tier: 'Low-Stake',
    },
    {
      id: '2',
      name: 'Weekend Trivia',
      entryFee: 50,
      prizePool: 4500,
      participants: 75,
      maxParticipants: 100,
      category: 'Sports',
      tier: 'Medium-Stake',
    },
    {
      id: '3',
      name: 'Mega Brain Battle',
      entryFee: 100,
      prizePool: 9000,
      participants: 45,
      maxParticipants: 100,
      category: 'Science',
      tier: 'High-Stake',
    },
    {
      id: '4',
      name: 'Movie Mania Quiz',
      entryFee: 25,
      prizePool: 2250,
      participants: 36,
      maxParticipants: 100,
      category: 'Entertainment',
      tier: 'Low-Stake',
    },
    {
      id: '5',
      name: 'Tech Wizard Challenge',
      entryFee: 75,
      prizePool: 6750,
      participants: 28,
      maxParticipants: 100,
      category: 'Technology',
      tier: 'Medium-Stake',
    },
  ];
  
  return CONTESTS.find(contest => contest.id === id);
};

// Shuffle questions
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Add getTierColor function at top of file to match contest screen
const getTierColor = (tier: string | undefined | null, isDark = false) => {
  if (!tier) {
    return isDark ? '#333333' : '#777777'; // Default color if tier is undefined/null
  }
  
  if (tier === 'Low-Stake') {
    return isDark ? '#538D22' : '#84CC16';
  } else if (tier === 'Medium-Stake') {
    return isDark ? '#0369A1' : '#06B6D4';
  } else {
    return isDark ? '#A92A67' : '#F63880';
  }
};

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const [contest, setContest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6); // 6 seconds per question
  const [milliseconds, setMilliseconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number, selectedOption: number, correct: boolean, timeSpent: number }[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [prize, setPrize] = useState<number | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiType, setEmojiType] = useState<'correct' | 'incorrect' | null>(null);
  
  // Start with loading as false to skip loading screen
  const [isLoading, setIsLoading] = useState(false);
  
  // Get theme information
  const theme = useTheme();
  const isDark = theme.dark;
  
  const progressWidth = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number | null>(null);
  const emojiAnimation = useRef(new Animated.Value(0)).current;
  
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    // Fetch contest details and prepare questions - with timeout to ensure it always completes
    const loadGame = async () => {
      if (id) {
        try {
          // Get contest details
          const contestData = getContestById(id as string);
          setContest(contestData);
          
          // Get 10 random questions from the question bank
          const shuffledQuestions = Array.isArray(QUESTIONS) ? shuffleArray(QUESTIONS).slice(0, 10) : [];
          setQuestions(shuffledQuestions);
          
          // Explicitly set loading to false and start game
          setIsLoading(false);
          setGameStarted(true);
        } catch (error) {
          console.error("Error loading game:", error);
          // Even on error, stop showing loading screen
          setIsLoading(false);
        }
      }
    };
    
    // Call loadGame and also set a quick timeout to ensure loading ends
    loadGame();
    
    // Force loading to complete immediately (as a failsafe)
    setTimeout(() => {
      setIsLoading(false);
      setGameStarted(true);
    }, 500);
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [id]);
  
  useEffect(() => {
    if (gameStarted && !gameOver) {
      startTimer();
    }
  }, [gameStarted, currentQuestionIndex, gameOver]);
  
  useEffect(() => {
    if (showEmoji) {
      Animated.timing(emojiAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(emojiAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setShowEmoji(false);
          });
        }, 500);
      });
    }
  }, [showEmoji]);
  
  const startTimer = () => {
    resetProgressAnimation();
    
    // Animate progress bar
    Animated.timing(progressWidth, {
      toValue: Dimensions.get('window').width,
      duration: 6000, // 6 seconds
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
    
    // Set up timer interval
    timerInterval.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 0.1) {
          // Time's up for this question
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
          }
          handleTimeUp();
          return 0;
        }
        
        // Update milliseconds for more granular display
        setMilliseconds((prevMs) => {
          if (prevMs <= 0) {
            return 9;
          }
          return prevMs - 1;
        });
        
        // Only decrement seconds when milliseconds roll over
        if (milliseconds === 0) {
          return parseFloat((prevTime - 0.1).toFixed(1));
        }
        return prevTime;
      });
    }, 100); // Check every 100ms for smoother countdown
  };
  
  const resetProgressAnimation = () => {
    progressWidth.setValue(0);
  };
  
  const handleTimeUp = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // If no option selected, record as incorrect
    if (selectedOption === null) {
      recordAnswer(-1); // -1 indicates no selection
    }
    
    // Wait a moment before moving to next question
    setTimeout(() => {
      goToNextQuestion();
    }, 1000);
  };
  
  const handleOptionSelect = (optionIndex: number) => {
    // Don't allow selection if already selected or time is up
    if (selectedOption !== null || timeLeft <= 0) {
      return;
    }
  
    setSelectedOption(optionIndex);
  
    // Check if we have valid questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return;
    }
    
    // No animation needed since we removed Animated.View
    
    // Record the answer
    recordAnswer(optionIndex);
    
    // Show emoji feedback
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && optionIndex === currentQuestion.correctAnswer) {
      setEmojiType('correct');
    } else {
      setEmojiType('incorrect');
    }
    setShowEmoji(true);
  };
  
  const recordAnswer = (optionIndex: number) => {
    // Ensure question exists
    if (!questions || !Array.isArray(questions) || !questions[currentQuestionIndex]) {
      return;
    }
    
    const question = questions[currentQuestionIndex];
    const isCorrect = optionIndex === question.correctAnswer;
    const timeSpent = 6 - timeLeft;
    
    // Record this answer
    setAnswers(prev => [
      ...prev,
      {
        questionId: question.id,
        selectedOption: optionIndex,
        correct: isCorrect,
        timeSpent
      }
    ]);
    
    // Update score: 10 points for correct + up to 5 bonus points for speed
    if (isCorrect) {
      const speedBonus = Math.round(5 * (1 - timeSpent / 6));
      setScore(prev => prev + 10 + speedBonus);
    }
  };
  
  const goToNextQuestion = () => {
    // Check if we have valid questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(6);
      setMilliseconds(0);
      // Timer and animation will be handled by the useEffect
    } else {
      // Last question done
      endGame();
    }
  };
  
  const endGame = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    setGameOver(true);
    
    // Calculate rank and prize (would be determined by server in real app)
    // For demo, just randomly assign rank 1-5
    const playerRank = Math.floor(Math.random() * 5) + 1;
    setRank(playerRank);
    
    // Assign prize based on rank
    if (playerRank === 1) {
      setPrize(contest?.prizes?.[0]?.amount || 500);
    } else if (playerRank === 2) {
      setPrize(contest?.prizes?.[1]?.amount || 300);
    } else if (playerRank === 3) {
      setPrize(contest?.prizes?.[2]?.amount || 200);
    } else {
      setPrize(0);
    }
  };
  
  const handlePlayAgain = () => {
    router.back();
  };

  // Helper function to return color based on time remaining
  const getProgressColor = (time: number): string => {
    if (time <= 2) {
      return '#FF5252'; // Red
    } else if (time <= 4) {
      return '#FFD740'; // Yellow
    } else {
      return '#4CAF50'; // Green
    }
  };

  // Use contest tier color for styling
  const getThemeColor = () => {
    if (contest && contest.tier) {
      return getTierColor(contest.tier, isDark);
    }
    return isDark ? '#0F3460' : '#2E8B57'; // Default colors
  };

  if (gameOver) {
    // Game over screen with position and winnings
    return (
      <View style={[
        styles.fullContainer,
        { backgroundColor: getThemeColor() }
      ]}>
        <Stack.Screen options={{ 
          headerShown: false,
          statusBarStyle: isDark ? 'light' : 'dark',
          statusBarTranslucent: true,
        }} />
        <StatusBar 
          translucent={true}
          backgroundColor="transparent" 
          style={isDark ? "light" : "dark"} 
        />
        
        <SafeAreaView style={{ flex: 1 }}>
          <ThemedView style={[
            styles.gameContainer,
            // Make the background consistent with the header color
            { backgroundColor: getThemeColor() }
          ]} backgroundType="card">
            <View style={styles.statusBarPadding} />
            
            {/* Results header */}
            <ThemedView style={[
              styles.kbcHeader,
              { backgroundColor: getThemeColor() }
            ]}>
              <View style={styles.kbcHeaderLeft}>
                <MaterialIcons 
                  name="emoji-events" 
                  size={24} 
                  color="#FFD700" 
                  style={{ marginRight: 8 }} 
                />
                <ThemedText style={styles.kbcTitle}>RESULTS</ThemedText>
              </View>
            </ThemedView>
            
            {/* Results content */}
            <ScrollView contentContainerStyle={[
              styles.resultsContainer,
              isDark ? { backgroundColor: '#1A1A2E' } : { backgroundColor: '#ffffff' }
            ]}>
              {/* Rank badge */}
              <View style={[
                styles.rankBadge,
                { backgroundColor: getThemeColor() }
              ]}>
                <Text style={styles.rankNumber}>#{rank}</Text>
              </View>
              
              <ThemedText style={styles.rankLabel}>
                {rank === 1 ? 'Champion!' : 
                 rank === 2 ? 'Runner Up!' :
                 rank === 3 ? 'Great Job!' :
                 'Better luck next time!'}
              </ThemedText>
              
              {/* Performance stats */}
              <View style={[
                styles.statsContainer, 
                isDark ? { backgroundColor: '#0C2D48' } : { backgroundColor: '#f0f8f0' }
              ]}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Questions</ThemedText>
                  <ThemedText style={[
                    styles.statValue,
                    isDark ? { color: '#fff' } : { color: '#2E8B57' }
                  ]}>{answers.length}</ThemedText>
                </View>
                
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Correct</ThemedText>
                  <ThemedText style={[
                    styles.statValue,
                    isDark ? { color: '#fff' } : { color: '#2E8B57' }
                  ]}>
                    {answers.filter(a => a.correct).length}
                  </ThemedText>
                </View>
                
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Score</ThemedText>
                  <ThemedText style={[
                    styles.statValue,
                    isDark ? { color: '#fff' } : { color: '#2E8B57' }
                  ]}>{score}</ThemedText>
                </View>
              </View>
              
              {/* Winnings */}
              <View style={[
                styles.winningsContainer,
                isDark ? { backgroundColor: '#0C2D48' } : { backgroundColor: '#f0f8f0' }
              ]}>
                <ThemedText style={styles.winningsLabel}>
                  {prize && prize > 0 ? 'You won' : 'Better luck next time'}
                </ThemedText>
                
                {prize && prize > 0 ? (
                  <ThemedText style={[
                    styles.winningsAmount,
                    isDark ? { color: '#4CAF50' } : { color: '#2E8B57' }
                  ]}>
                    ₹{prize}
                  </ThemedText>
                ) : (
                  <ThemedText style={styles.betterLuckText}>
                    No winnings this time
                  </ThemedText>
                )}
              </View>
              
              {/* Home button */}
              <TouchableOpacity 
                style={[
                  styles.homeButton,
                  { backgroundColor: getThemeColor() }
                ]}
                onPress={() => {
                  router.back();
                }}
              >
                <Text style={styles.homeButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </ScrollView>
          </ThemedView>
        </SafeAreaView>
      </View>
    );
  }

  if (!gameStarted) {
    return (
      <SafeAreaView style={[
        styles.countdownContainer, 
        isDark ? { backgroundColor: '#1E2A38' } : { backgroundColor: '#4CAF50' }
      ]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        
        <ThemedView 
          style={styles.countdownContent} 
          backgroundType={isDark ? "navigation" : undefined}
        >
          <View style={styles.countdownIconContainer}>
            <MaterialIcons 
              name="quiz" 
              size={40} 
              color="#ffffff" 
            />
          </View>
          
          <ThemedText style={styles.contestName}>
            {contest?.name || "Daily Quiz Challenge"}
          </ThemedText>
          
          <ThemedText style={styles.getReadyText}>Get Ready!</ThemedText>
          
          <View style={[
            styles.countdownNumberContainer, 
            isDark ? undefined : { borderColor: '#ffffff', borderWidth: 3 }
          ]}>
            <ThemedText style={styles.countdownNumber}>3</ThemedText>
          </View>
          
          <ThemedView 
            style={[
              styles.countdownInfoCard, 
              isDark ? { backgroundColor: 'rgba(255,255,255,0.1)' } : { backgroundColor: 'rgba(255,255,255,0.2)' }
            ]} 
            backgroundType={isDark ? "card" : undefined}
          >
            <View style={styles.countdownInfoItem}>
              <MaterialIcons name="help" size={20} color="#fff" />
              <ThemedText style={styles.countdownInfoText}>10 Questions</ThemedText>
            </View>
            
            <View style={[
              styles.countdownDivider, 
              isDark ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: 'rgba(255,255,255,0.3)' }
            ]} />
            
            <View style={styles.countdownInfoItem}>
              <MaterialIcons name="timer" size={20} color="#fff" />
              <ThemedText style={styles.countdownInfoText}>6 Seconds per Question</ThemedText>
            </View>
          </ThemedView>
          
          <ThemedView 
            style={[
              styles.countdownTipsContainer, 
              isDark ? { backgroundColor: 'rgba(0,0,0,0.2)' } : { backgroundColor: 'rgba(0,0,0,0.1)' }
            ]} 
            backgroundType={isDark ? "card" : undefined}
          >
            <ThemedText style={styles.countdownTipsTitle}>Tips:</ThemedText>
            
            <View style={styles.countdownTipItem}>
              <MaterialIcons name="lightbulb" size={16} color="#FFD700" style={{ marginRight: 8 }} />
              <ThemedText style={styles.countdownTipText}>
                Answer quickly for bonus points
              </ThemedText>
            </View>
            
            <View style={styles.countdownTipItem}>
              <MaterialIcons name="lightbulb" size={16} color="#FFD700" style={{ marginRight: 8 }} />
              <ThemedText style={styles.countdownTipText}>
                Pay attention to category hints
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Simple loading screen - skip this to directly show the game
  /*if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Loading Quiz...</ThemedText>
      </View>
    );
  }*/

  return (
    <View style={[
      styles.fullContainer, 
      isDark ? { backgroundColor: '#0F3460' } : { backgroundColor: '#2E8B57' }
    ]}>
      <Stack.Screen options={{ 
        headerShown: false,
        statusBarStyle: isDark ? 'light' : 'dark',
        statusBarTranslucent: true,
      }} />
      <StatusBar 
        translucent={true}
        backgroundColor="transparent" 
        style={isDark ? "light" : "dark"} 
      />
      
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ThemedView style={[
          styles.gameContainer,
          isDark ? { backgroundColor: '#1A1A2E' } : { backgroundColor: '#ffffff' }
        ]} backgroundType="card">
          {/* Game header - extend the color to cover the top section completely */}
          <View style={[
            styles.kbcHeader, 
            { 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 180, // Make it even taller to push content down
              zIndex: 1,
              paddingTop: 50, // Increase padding to push content further down
            },
            { backgroundColor: getThemeColor() }
          ]} />
          
          {/* Keep this here to maintain exact position of title but move it down */}
          <ThemedView style={[
            styles.kbcHeader,
            {
              marginTop: 80, // Push down the header content
              zIndex: 2, // Place above the extended background
              backgroundColor: 'transparent'
            }
          ]}>
            <View style={styles.kbcHeaderLeft}>
              <MaterialIcons 
                name="lightbulb" 
                size={24} 
                color="#FFD700" 
                style={{ marginRight: 8 }} 
              />
              <ThemedText style={styles.kbcTitle}>QUIZO</ThemedText>
            </View>
            <ThemedText style={styles.kbcPoints}>{score} pts</ThemedText>
          </ThemedView>
          
          {/* Show emoji feedback animation */}
          {showEmoji && (
            <Animated.View style={[
              styles.emojiContainer,
              { 
                opacity: emojiAnimation,
                transform: [
                  { scale: emojiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5]
                    })
                  }
                ]
              }
            ]}>
              <Text style={styles.emojiText}>
                {emojiType === 'correct' ? '✅' : '❌'}
              </Text>
            </Animated.View>
          )}
          
          {/* Progress bar */}
          <View style={[
            styles.progressBarContainer,
            { marginTop: 20 } // Add extra margin to move timer down
          ]}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                  backgroundColor: getProgressColor(timeLeft)
                }
              ]}
            />
          </View>
          
          {/* Timer display - making it more professional with MS */}
          <View style={[
            styles.timerWrapper,
            { marginTop: 5, marginBottom: 15 }
          ]}>
            <ThemedView style={[
              styles.timerContainer,
              isDark ? { backgroundColor: 'rgba(0,0,0,0.3)' } : { backgroundColor: 'rgba(0,0,0,0.1)' }
            ]}>
              <ThemedText style={[
                styles.timerText,
                timeLeft <= 3 ? 
                  isDark ? { color: '#FF6B6B' } : { color: '#FF5252' }
                : isDark ? { color: '#fff' } : { color: '#333' }
              ]}>
                {Math.floor(timeLeft)}<ThemedText style={styles.timerUnit}>.</ThemedText>
                <ThemedText style={styles.milliseconds}>{Math.floor((timeLeft % 1) * 10)}0</ThemedText>
                <ThemedText style={styles.timerUnit}> sec</ThemedText>
              </ThemedText>
            </ThemedView>
          </View>
          
          {/* Question container - fix the background issue */}
          <ThemedView style={[
            styles.questionContainer,
            { backgroundColor: getThemeColor() }
          ]}>
            <ThemedText style={styles.questionText}>
              {questions[currentQuestionIndex]?.text || "Loading question..."}
            </ThemedText>
          </ThemedView>
          
          {/* Options container */}
          <ThemedView style={styles.optionsContainer}>
            {/* Render options with alphabetical labels */}
            {questions[currentQuestionIndex]?.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectAnswer = selectedOption !== null && 
                questions[currentQuestionIndex]?.correctAnswer === index;
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              
              return (
                <View key={index} style={{width: '100%'}}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      isDark ? styles.optionButtonDark : styles.optionButton,
                      isSelected && (
                        isDark ? styles.selectedOptionDark : styles.selectedOption
                      ),
                      isCorrectAnswer && (
                        isDark ? styles.correctOptionDark : styles.correctOption
                      ),
                      { minHeight: 60 } // Ensure minimum height
                    ]}
                    onPress={() => handleOptionSelect(index)}
                    disabled={selectedOption !== null}
                  >
                    <View style={[
                      styles.optionLabelContainer,
                      { backgroundColor: getThemeColor() },
                      isSelected ? styles.selectedLabelContainer : null,
                      isCorrectAnswer ? styles.correctLabelContainer : null
                    ]}>
                      <Text style={[
                        styles.optionLabel,
                        isSelected ? styles.selectedOptionLabel : null,
                        isCorrectAnswer ? styles.correctOptionLabel : null
                      ]}>
                        {optionLabel}
                      </Text>
                    </View>
                    
                    <ThemedText style={[
                      styles.optionText,
                      isSelected && (
                        isDark ? styles.selectedOptionTextDark : styles.selectedOptionText
                      ),
                      isCorrectAnswer && (
                        isDark ? styles.correctOptionTextDark : styles.correctOptionText
                      ),
                      (!isSelected && !isCorrectAnswer) && (
                        isDark ? { color: '#FFFFFF' } : { color: '#333333' }
                      ),
                      { opacity: 1 } // Ensure text is always visible
                    ]}>
                      {option}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#2E8B57', // Default color for the status bar area
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  startAnywayButton: {
    marginTop: 20,
    backgroundColor: '#2E8B57',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startAnywayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownContainer: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  countdownContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  countdownIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  contestName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  getReadyText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
  },
  countdownNumberContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 30,
    width: '100%',
  },
  countdownInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  countdownInfoText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  countdownDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  countdownTipsContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  countdownTipsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  countdownTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countdownTipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  timerHeader: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  timerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  questionCounter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  questionCounterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  scoreIndicatorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionContainer: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  questionText: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 28,
  },
  questionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  optionsContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  optionButtonDark: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1E2A38',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  selectedOptionDark: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  selectedLabelContainer: {
    backgroundColor: '#4CAF50',
    borderWidth: 0,
  },
  optionText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedOptionText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  selectedOptionTextDark: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emojiContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 3,
  },
  emojiText: {
    fontSize: 80,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsContent: {
    padding: 20,
  },
  resultContent: {
    padding: 20,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  newScoreSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabelLarge: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  rankContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  rankBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  rankText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  prizeInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  prizeInfoText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  prizeNote: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  rankSuffix2: {
    fontSize: 14,
    color: '#FF9800',
  },
  scoreCard2: {
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: '#4CAF50',
  },
  scoreContent: {
    padding: 20,
    alignItems: 'center',
  },
  scoreLabel2: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  scoreValue2: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 5,
  },
  prizeContainer2: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  prizeText2: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardContainer2: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  leaderboardHeader2: {
    padding: 15,
    backgroundColor: '#4CAF50',
  },
  leaderboardTitle2: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableHeader2: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell2: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: 'bold',
  },
  tableRow2: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cell2: {
    fontSize: 13,
    color: '#333',
  },
  userRow2: {
    backgroundColor: '#E8F5E9',
  },
  topThreeRow2: {
    backgroundColor: '#F1F8E9',
  },
  evenRow2: {
    backgroundColor: '#fafafa',
  },
  returnButton2: {
    margin: 15,
    marginTop: 5,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#4CAF50',
  },
  buttonContent: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText2: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fallbackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Dark mode specific styles
  scoreCardDark: {
    backgroundColor: '#1E2A38',
    borderColor: '#333',
  },
  statBoxDark: {
    backgroundColor: '#222',
  },
  rankBadgeDark: {
    backgroundColor: '#1E2A38',
  },
  prizeInfoDark: {
    backgroundColor: '#1E2A38',
  },
  answerSummaryDark: {
    backgroundColor: '#1E2A38',
  },
  leaderboardDark: {
    backgroundColor: '#1E2A38',
  },
  kbcOptionButtonDark: {
    backgroundColor: '#1E2A38',
    borderColor: '#333',
  },
  // Result screen styles
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#4CAF50',
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultContent: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  scoreCardDark: {
    backgroundColor: '#1E2A38',
    borderColor: '#333',
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  answerSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 10,
    elevation: 2,
  },
  answerSummaryDark: {
    backgroundColor: '#1E2A38',
  },
  answerRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  answerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  answerStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  correctAnswer: {
    backgroundColor: '#E8F5E9',
  },
  wrongAnswer: {
    backgroundColor: '#FFEBEE',
  },
  answerStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  answerQuestion: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerTimeSpent: {
    fontSize: 12,
    color: '#666',
  },
  correctAnswerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  leaderboard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  leaderboardDark: {
    backgroundColor: '#1E2A38',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  leaderboardRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userRow: {
    backgroundColor: '#E8F5E9',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  cell2: {
    fontSize: 14,
    color: '#333',
  },
  kbcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2E8B57',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  kbcHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kbcTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerWrapper: {
    alignItems: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionLetterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  kbcHeader: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#2E8B57',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  kbcHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kbcTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  timerWrapper: {
    alignItems: 'center',
    marginTop: -30, // Overlap with the question container
    marginBottom: -30, // Negative margin for overlap
    zIndex: 1, // Ensure it's above other elements
  },
  timerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  questionCounter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  questionCounterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionContainer: {
    padding: 24,
    paddingTop: 48, // Extra top padding for timer
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0,
  },
  questionText: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 28,
    textAlign: 'center',
  },
  questionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'center',
  },
  categoryText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  optionsContainer: {
    padding: 16,
    paddingTop: 8,
    flex: 1,
  },
  optionButton: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginRight: 12,
  },
  optionLetterText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    paddingRight: 12,
  },
  resultScrollView: {
    flex: 1,
  },
  confettiContainer: {
    backgroundColor: '#2E8B57',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  completeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: -20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRowDark: {
    backgroundColor: '#1E2A3E',
  },
  evenRowDark: {
    backgroundColor: '#16213E',
  },
  userRow: {
    backgroundColor: '#E8F5E9',
  },
  userRowDark: {
    backgroundColor: '#053219',
  },
  rankColumn: {
    width: 40,
    alignItems: 'center',
  },
  miniRankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniRankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  scoreColumn: {
    width: 80,
    textAlign: 'right',
  },
  timeColumn: {
    width: 50,
    textAlign: 'right',
  },
  userText: {
    fontWeight: 'bold',
  },
  buttonsContainer: {
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewProfileButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#333',
    fontSize: 16,
  },
  // Add status bar padding to move header content down
  statusBarPadding: {
    height: 40, // Adjust as needed
  },
  // Add missing rank styles to fix linter errors
  rankBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  firstPlace: {
    backgroundColor: '#FFD700', // Gold
  },
  secondPlace: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdPlace: {
    backgroundColor: '#CD7F32', // Bronze
  },
  otherPlace: {
    backgroundColor: '#A0A0A0', // Gray for other places
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  winningsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  winningsLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  winningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  betterLuckText: {
    fontSize: 16,
  },
  miniRankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  miniRankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Add styles for improved countdown screen
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E8B57',
  },
  countdownAnimation: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  countdownCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    // Add shadow for better visibility in light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  countdownText: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tipsContainer: {
    marginTop: 40,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tipText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryInfoContainer: {
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
  },
  categoryInfoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
  },
  kbcPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  // Results container styles
  resultsContainer: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  
  // Stats container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginVertical: 16,
  },
  
  // Home button styles
  homeButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  // Timer container
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 25,
    alignSelf: 'center',
    minWidth: 70,
  },
  
  // Timer text
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerUnit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  milliseconds: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Question container styles
  questionContainer: {
    backgroundColor: '#2E8B57', // Default - will be overridden by theming
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Question text style
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  
  // Timer wrapper
  timerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  
  // Timer styles
  timerContainer: {
    minWidth: 120,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  timerUnit: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  
  milliseconds: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionLabelContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedOptionLabel: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  selectedOptionTextDark: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  optionTextDark: {
    color: '#333',
  },
  correctOption: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  correctOptionDark: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  correctOptionLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  correctOptionTextDark: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  correctLabelContainer: {
    backgroundColor: '#4CAF50',
    borderWidth: 0,
  },
}); 
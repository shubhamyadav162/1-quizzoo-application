/**
 * Emergency questions to use when all other loading methods fail
 * This ensures the app always has something to display
 */

export interface EmergencyQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  language: 'en' | 'hi';
  explanation?: string;
}

export const getEmergencyQuestions = (language: 'en' | 'hi' = 'en'): EmergencyQuestion[] => {
  if (language === 'en') {
    return [
      {
        id: "e1",
        text: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Rome"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "Paris is the capital city of France."
      },
      {
        id: "e2",
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correctAnswer: 2,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "Mars is called the Red Planet due to its reddish appearance."
      },
      {
        id: "e3",
        text: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: 1,
        difficulty: "easy", 
        category: "General Knowledge",
        language: "en",
        explanation: "Leonardo da Vinci painted the Mona Lisa around 1503-1519."
      },
      {
        id: "e4",
        text: "What is the largest organ in the human body?",
        options: ["Heart", "Brain", "Liver", "Skin"],
        correctAnswer: 3,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "The skin is the largest organ of the human body."
      },
      {
        id: "e5",
        text: "Which country is known as the Land of the Rising Sun?",
        options: ["China", "Japan", "Thailand", "Korea"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "Japan is known as the Land of the Rising Sun."
      },
      {
        id: "e6",
        text: "What is the chemical symbol for gold?",
        options: ["Au", "Ag", "Fe", "Gd"],
        correctAnswer: 0,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "The chemical symbol for gold is Au, from the Latin word 'aurum'."
      },
      {
        id: "e7",
        text: "Which of these is NOT a primary color?",
        options: ["Red", "Blue", "Green", "Yellow"],
        correctAnswer: 3,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "Yellow is not a primary color in the RGB color model, which uses Red, Green, and Blue."
      },
      {
        id: "e8",
        text: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America."
      },
      {
        id: "e9",
        text: "What is the tallest mountain in the world?",
        options: ["K2", "Mount Everest", "Kangchenjunga", "Makalu"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "Mount Everest is the tallest mountain in the world."
      },
      {
        id: "e10",
        text: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "en",
        explanation: "William Shakespeare wrote 'Romeo and Juliet' in the late 16th century."
      }
    ];
  } else {
    // Hindi questions
    return [
      {
        id: "e1",
        text: "फ्रांस की राजधानी क्या है?",
        options: ["लंदन", "पेरिस", "बर्लिन", "रोम"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "पेरिस फ्रांस की राजधानी है।"
      },
      {
        id: "e2",
        text: "किस ग्रह को लाल ग्रह के नाम से जाना जाता है?",
        options: ["शुक्र", "बृहस्पति", "मंगल", "शनि"],
        correctAnswer: 2,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "मंगल ग्रह को इसके लाल रंग के कारण लाल ग्रह कहा जाता है।"
      },
      {
        id: "e3",
        text: "मोना लिसा किसने चित्रित की थी?",
        options: ["विन्सेंट वैन गोघ", "लियोनार्दो दा विंची", "पाब्लो पिकासो", "माइकलएंजेलो"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "लियोनार्दो दा विंची ने 1503-1519 के आसपास मोना लिसा चित्रित की थी।"
      },
      {
        id: "e4",
        text: "मानव शरीर का सबसे बड़ा अंग कौन सा है?",
        options: ["हृदय", "मस्तिष्क", "यकृत", "त्वचा"],
        correctAnswer: 3,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "त्वचा मानव शरीर का सबसे बड़ा अंग है।"
      },
      {
        id: "e5",
        text: "किस देश को उगते सूरज की भूमि के रूप में जाना जाता है?",
        options: ["चीन", "जापान", "थाईलैंड", "कोरिया"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "जापान को उगते सूरज की भूमि के रूप में जाना जाता है।"
      },
      {
        id: "e6",
        text: "सोने का रासायनिक प्रतीक क्या है?",
        options: ["Au", "Ag", "Fe", "Gd"],
        correctAnswer: 0,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "सोने का रासायनिक प्रतीक Au है, जो लैटिन शब्द 'aurum' से लिया गया है।"
      },
      {
        id: "e7",
        text: "इनमें से कौन प्राथमिक रंग नहीं है?",
        options: ["लाल", "नीला", "हरा", "पीला"],
        correctAnswer: 3,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "RGB कलर मॉडल में पीला प्राथमिक रंग नहीं है, जिसमें लाल, हरा और नीला उपयोग किया जाता है।"
      },
      {
        id: "e8",
        text: "दुनिया में कितने महाद्वीप हैं?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "दुनिया में 7 महाद्वीप हैं: अफ्रीका, अंटार्कटिका, एशिया, ऑस्ट्रेलिया, यूरोप, उत्तरी अमेरिका और दक्षिणी अमेरिका।"
      },
      {
        id: "e9",
        text: "दुनिया का सबसे ऊंचा पर्वत कौन सा है?",
        options: ["K2", "माउंट एवरेस्ट", "कंचनजंगा", "मकालू"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "माउंट एवरेस्ट दुनिया का सबसे ऊंचा पर्वत है।"
      },
      {
        id: "e10",
        text: "'रोमियो और जूलियट' किसने लिखी थी?",
        options: ["चार्ल्स डिकेंस", "विलियम शेक्सपियर", "जेन ऑस्टिन", "मार्क ट्वेन"],
        correctAnswer: 1,
        difficulty: "easy",
        category: "General Knowledge",
        language: "hi",
        explanation: "विलियम शेक्सपियर ने 16वीं शताब्दी के अंत में 'रोमियो और जूलियट' लिखी थी।"
      }
    ];
  }
}; 
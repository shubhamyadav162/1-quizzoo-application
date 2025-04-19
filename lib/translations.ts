interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Contest Rules
  contestRulesTitle: {
    en: 'Contest Rules',
    hi: 'प्रतियोगिता के नियम',
  },
  readCarefully: {
    en: 'Please read carefully',
    hi: 'कृपया ध्यान से पढ़ें',
  },
  timeLimit: {
    en: 'Time limit for each question',
    hi: 'प्रत्येक प्रश्न के लिए समय सीमा',
  },
  correctAnswers: {
    en: 'Points for correct answers',
    hi: 'सही उत्तरों के लिए अंक',
  },
  incorrectAnswers: {
    en: 'No negative marking',
    hi: 'कोई नकारात्मक अंकन नहीं',
  },
  totalQuestions: {
    en: 'Total questions',
    hi: 'कुल प्रश्न',
  },
  waitingLobbyTitle: {
    en: 'Waiting for other players',
    hi: 'अन्य खिलाड़ियों की प्रतीक्षा',
  },
  playersJoined: {
    en: 'Players joined',
    hi: 'खिलाड़ी शामिल हुए',
  },
  startingSoon: {
    en: 'Contest starting soon',
    hi: 'प्रतियोगिता जल्द शुरू होगी',
  },
  getReady: {
    en: 'Get ready!',
    hi: 'तैयार हो जाइए!',
  },
  // Contest Details
  entryFee: {
    en: 'Entry Fee',
    hi: 'प्रवेश शुल्क',
  },
  prizePool: {
    en: 'Prize Pool',
    hi: 'इनाम राशि',
  },
  players: {
    en: 'Players',
    hi: 'खिलाड़ी',
  },
  register: {
    en: 'Register',
    hi: 'पंजीकरण करें',
  },
  joinNow: {
    en: 'Join Now',
    hi: 'अभी शामिल हों',
  },
  // Quiz Interface
  questionNumber: {
    en: 'Question',
    hi: 'प्रश्न',
  },
  timeRemaining: {
    en: 'Time Remaining',
    hi: 'शेष समय',
  },
  submit: {
    en: 'Submit',
    hi: 'जमा करें',
  },
  next: {
    en: 'Next',
    hi: 'अगला',
  },
  // Results
  correctAnswer: {
    en: 'Correct Answer',
    hi: 'सही उत्तर',
  },
  yourAnswer: {
    en: 'Your Answer',
    hi: 'आपका उत्तर',
  },
  pointsEarned: {
    en: 'Points Earned',
    hi: 'अर्जित अंक',
  },
  // General
  loading: {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  },
  error: {
    en: 'Something went wrong',
    hi: 'कुछ गलत हो गया',
  },
  retry: {
    en: 'Retry',
    hi: 'पुनः प्रयास करें',
  },
};

export const getTranslation = (key: string, language: 'en' | 'hi'): string => {
  if (!translations[key]) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  return translations[key][language];
}; 
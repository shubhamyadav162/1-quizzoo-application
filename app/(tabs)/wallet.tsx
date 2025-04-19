import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  FlatList,
  Animated,
  Alert,
  Text,
  ActivityIndicator,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { Header } from '@/components/Header';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { WalletCard } from '@/components/WalletCard';
import { AddMoneyModal } from '@/components/AddMoneyModal';
import { WithdrawModal } from '@/components/WithdrawModal';
import { WalletService, TAX_RATE, HOURLY_PROCESSING_FEE, PROCESSING_HOURS } from '@/app/lib/WalletService';
import { ProfileWalletService } from '@/app/lib/ProfileWalletService';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Define types
interface Transaction {
  id: string;
  type: string;
  amount: number;
  title: string;
  date: string;
}

// Mock data for transactions
const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    title: 'Added money via UPI',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '2',
    type: 'debit',
    amount: 100,
    title: 'Contest entry fee',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    type: 'credit',
    amount: 250,
    title: 'Contest winnings',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: '4',
    type: 'debit',
    amount: 50,
    title: 'Contest entry fee',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '5',
    type: 'debit',
    amount: 200,
    title: 'Withdrawal to bank account',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

// Helper functions for transaction styling
const getTransactionIcon = (type: string): React.ComponentProps<typeof MaterialIcons>['name'] => {
  switch (type) {
    case 'credit':
      return 'arrow-upward';
    case 'debit':
      return 'arrow-downward';
    default:
      return 'swap-horiz';
  }
};

const getTransactionColor = (type: string, isDark: boolean): string => {
  switch (type) {
    case 'credit':
      return isDark ? '#1A5D2C' : '#4CAF50';
    case 'debit':
      return isDark ? '#8C2F39' : '#F44336';
    default:
      return isDark ? '#0D47A1' : '#2196F3';
  }
};

const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Transaction filter options
const transactionFilters = [
  { label: 'All', value: 'all' },
  { label: 'Added', value: 'credit' },
  { label: 'Withdrawn', value: 'debit' },
];

// Add a demo mode flag at the top of the component
const DEMO_MODE = true; // Set to true for demo/mock mode, false for real backend

export default function WalletScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [balance, setBalance] = useState(1200); // Display balance
  const [actualBalance, setActualBalance] = useState(864); // Actual balance after tax
  const [taxCreditBalance, setTaxCreditBalance] = useState(336); // Tax credit balance
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [walletService, setWalletService] = useState<WalletService | null>(null);
  const [profileWalletService, setProfileWalletService] = useState<ProfileWalletService | null>(null);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Set status bar color based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(isDark ? '#4F46E5' : '#6C63FF');
      StatusBar.setBarStyle('light-content');
    }
  }, [isDark]);

  // Get session and initialize services
  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Initialize both services
        const walletService = new WalletService(session);
        const profileWalletService = new ProfileWalletService(session);
        
        setWalletService(walletService);
        setProfileWalletService(profileWalletService);
        
        // Use the integrated service to fetch data
        fetchProfileWithWallet(profileWalletService);
      } else {
        // If no session, use mock data
        loadMockData();
      }
      setIsLoading(false);
    }).catch(error => {
      console.error("Auth session error:", error);
      loadMockData();
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Initialize both services on auth change
        const walletService = new WalletService(session);
        const profileWalletService = new ProfileWalletService(session);
        
        setWalletService(walletService);
        setProfileWalletService(profileWalletService);
        
        // Use the integrated service to fetch data
        fetchProfileWithWallet(profileWalletService);
      } else {
        loadMockData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch integrated profile and wallet data
  const fetchProfileWithWallet = async (service: ProfileWalletService) => {
    try {
      const profileWithWallet = await service.getProfileWithWallet();
      
      if (profileWithWallet) {
        setProfileData(profileWithWallet);
        
        // Set wallet data
        setBalance(profileWithWallet.wallet.balance);
        setActualBalance(profileWithWallet.wallet.actual_balance);
        setTaxCreditBalance(profileWithWallet.wallet.tax_credit_balance);
        
        // Fetch transactions
        fetchTransactions(service);
      } else {
        console.log("No profile with wallet data found, loading mock data");
        loadMockData();
      }
    } catch (error) {
      console.error("Error fetching profile with wallet:", error);
      loadMockData();
    }
  };

  // Fetch wallet transactions
  const fetchTransactions = async (service: ProfileWalletService) => {
    try {
      const transactionData = await service.getTransactions(20, 0);
      if (transactionData && transactionData.length > 0) {
        // Format transactions for display
        const formattedTransactions = transactionData.map(t => ({
          id: t.id,
          type: t.type === 'deposit' || t.type === 'prize_won' ? 'credit' : 'debit',
          amount: t.amount,
          title: getTransactionTitle(t.type, t.payment_method),
          date: t.created_at || new Date().toISOString(),
          status: t.status,
          payment_method: t.payment_method
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Helper function to get transaction title
  const getTransactionTitle = (type: string, paymentMethod?: string): string => {
    switch (type) {
      case 'deposit':
        return `Added money via ${paymentMethod || 'UPI'}`;
      case 'withdrawal':
        return 'Withdrawal to bank account';
      case 'contest_entry':
        return 'Contest entry fee';
      case 'prize_won':
        return 'Contest winnings';
      case 'refund':
        return 'Refund';
      default:
        return 'Transaction';
    }
  };

  // Load mock data function
  const loadMockData = () => {
    // Set default wallet values
    setBalance(1200);
    setActualBalance(864);
    setTaxCreditBalance(336);
    
    // Set mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'credit',
        amount: 500,
        title: 'Added money via UPI',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'debit',
        amount: 100,
        title: 'Contest entry fee',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'credit',
        amount: 250,
        title: 'Contest winnings',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'debit',
        amount: 50,
        title: 'Contest entry fee',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'debit',
        amount: 200,
        title: 'Withdrawal to bank account',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setTransactions(mockTransactions);
  };

  // Start pulse animation to create a subtle "breathing" effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in the content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  const filteredTransactions = transactions.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  // Update handleAddMoney for demo mode
  const handleAddMoney = async (amount: number) => {
    if (DEMO_MODE) {
      setAddMoneyModalVisible(false);
      // Update balances and add a transaction locally
      setBalance(prev => prev + amount);
      setActualBalance(prev => prev + amount);
      setTransactions(prev => [
        {
          id: (Date.now() + Math.random()).toString(),
          type: 'credit',
          amount,
          title: 'Added money via UPI',
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
      Alert.alert(
        'Payment Initiated',
        `Demo: ₹${amount} added to your wallet.`,
        [{ text: 'OK' }]
      );
      return;
    }
    if (!profileWalletService) {
      Alert.alert('Error', 'Wallet service is not initialized');
      return;
    }
    try {
      setAddMoneyModalVisible(false);
      const paymentMethod = 'upi'; // Default to UPI for simplicity
      const transaction = await profileWalletService.addMoney(amount, paymentMethod);
      if (transaction) {
        // Refresh wallet data
        fetchProfileWithWallet(profileWalletService);
        Alert.alert(
          'Payment Initiated',
          `Please complete your payment of ₹${amount} using the generated QR code or UPI ID. Transaction will be updated automatically once payment is confirmed.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Could not process your transaction');
      }
    } catch (error: any) {
      console.error('Error adding money:', error);
      Alert.alert('Error', error.message || 'Could not process your transaction');
    }
  };

  // Update handleWithdraw for demo mode
  const handleWithdraw = async (amount: number) => {
    if (DEMO_MODE) {
      setWithdrawModalVisible(false);
      // Only allow withdraw if enough balance
      if (actualBalance < amount) {
        Alert.alert('Error', 'Insufficient balance');
        return;
      }
      setBalance(prev => prev - amount);
      setActualBalance(prev => prev - amount);
      setTransactions(prev => [
        {
          id: (Date.now() + Math.random()).toString(),
          type: 'debit',
          amount,
          title: 'Withdrawal to bank account',
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
      Alert.alert(
        'Withdrawal Requested',
        `Demo: Withdrawal of ₹${amount} requested.`,
        [{ text: 'OK' }]
      );
      return;
    }
    if (!profileWalletService) {
      Alert.alert('Error', 'Wallet service is not initialized');
      return;
    }
    try {
      setWithdrawModalVisible(false);
      const paymentMethod = 'bank_transfer'; // Default to bank transfer
      const transaction = await profileWalletService.withdrawMoney(amount, paymentMethod);
      if (transaction) {
        // Refresh wallet data
        fetchProfileWithWallet(profileWalletService);
        Alert.alert(
          'Withdrawal Requested',
          `Your withdrawal request for ₹${amount} has been submitted. Please allow 24-48 hours for processing. You will receive the funds in your linked bank account.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Could not process your withdrawal request');
      }
    } catch (error: any) {
      console.error('Error withdrawing money:', error);
      Alert.alert('Error', error.message || 'Could not process your withdrawal request');
    }
  };

  const toggleBalanceDetails = () => {
    setShowBalanceDetails(prev => !prev);
  };

  // Render a single transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const transactionIconName = getTransactionIcon(item.type);
    const transactionColor = getTransactionColor(item.type, isDark);
    
    // Gradient colors based on transaction type and theme with 'as const' to satisfy type requirements
    const transactionGradientColors = item.type === 'credit'
      ? isDark ? ['#1A5D2C', '#2E7D32'] as const : ['#4CAF50', '#81C784'] as const // Green gradient for credit
      : isDark ? ['#8C2F39', '#C62828'] as const : ['#F44336', '#E57373'] as const; // Red gradient for debit
    
    // Card background gradient colors
    const cardGradientColors = [isDark ? '#212946' : '#f8f9fa', isDark ? '#1a2035' : '#ffffff'] as const;
    
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={400}
        delay={200}
        style={styles.transactionItemContainer}
      >
        <LinearGradient
          colors={cardGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.transactionItem}
        >
          <View style={[styles.transactionIconContainer, { backgroundColor: transactionColor }]}>
            <MaterialIcons name={transactionIconName} size={20} color="#fff" />
          </View>
          
          <View style={styles.transactionDetails}>
            <ThemedText style={styles.transactionTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.transactionDate}>{formatTransactionDate(item.date)}</ThemedText>
          </View>
          
          <View style={styles.transactionAmountContainer}>
            <LinearGradient
              colors={transactionGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.transactionAmountBadge}
            >
              <ThemedText style={styles.transactionAmount}>
                {item.type === 'credit' ? '+' : '-'}₹{item.amount}
              </ThemedText>
            </LinearGradient>
          </View>
        </LinearGradient>
      </Animatable.View>
    );
  };

  // Handle custom payment method selection
  const handleCustomPaymentMethod = (method: string) => {
    console.log("Selected payment method:", method);
    // Set the currently selected payment method
    // This would be used when adding money
  };

  // Refresh wallet data - used for pull-to-refresh
  const refreshWalletData = async () => {
    if (profileWalletService) {
      try {
        await fetchProfileWithWallet(profileWalletService);
      } catch (error) {
        console.error("Error refreshing wallet data:", error);
      }
    }
  };

  // Handle add money button click
  const handleAddMoneyButton = () => {
    setAddMoneyModalVisible(true);
  };

  const handleWithdrawButton = () => {
    setWithdrawModalVisible(true);
  };

  return (
    <View style={styles.mainContainer}>
      <ExpoStatusBar style="light" />
      
      <ThemedView style={styles.container}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={isDark ? ['#4F46E5', '#3730A3'] : ['#6C63FF', '#3b36ce']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <ThemedText style={[styles.headerTitle, { color: '#FFFFFF' }]}>
              My Wallet
            </ThemedText>
            <MaterialIcons 
              name="account-balance-wallet" 
              size={24} 
              color="#FFFFFF" 
              style={{ marginLeft: 8 }}
            />
            
            <Animated.View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  opacity: fadeAnim,
                }
              ]}
            >
              <MaterialIcons 
                name="security" 
                size={16} 
                color="#FFFFFF" 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusBadgeText, { color: '#FFFFFF' }]}>
                Protected
              </Text>
            </Animated.View>
          </View>
          
          {/* Wallet Card Component */}
          <WalletCard
            balance={balance}
            actualBalance={actualBalance}
            taxCreditBalance={taxCreditBalance}
            onAddMoney={handleAddMoneyButton}
            onWithdraw={handleWithdrawButton}
            pulseAnim={pulseAnim}
            showDetails={showBalanceDetails}
          />
        </LinearGradient>
          
        {/* Transaction History - Full screen below the header */}
        <View 
          style={[
            styles.transactionContainer,
            { 
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.5)',
              borderColor: isDark ? Colors.dark.border : Colors.light.border,
            }
          ]}
        >
          <LinearGradient
            colors={isDark ? ['#1f2937', '#111827'] : ['#f1f5f9', '#e2e8f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.transactionHeader, 
              {
                borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
              }
            ]}
          >
            <View style={styles.transactionHeaderLeft}>
              <MaterialIcons 
                name="history" 
                size={20} 
                color={isDark ? '#FFFFFF' : '#1e293b'} 
                style={{ marginRight: 8 }}
              />
              <Text style={[
                styles.transactionTitle,
                { color: isDark ? '#FFFFFF' : '#1e293b' }
              ]}>
                Wallet History
              </Text>
            </View>
            
            {transactions.length > 0 && (
              <View style={styles.transactionHeaderRight}>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={toggleFilterModal}
                >
                  <MaterialIcons 
                    name="filter-list" 
                    size={20} 
                    color={isDark ? '#FFFFFF' : '#1e293b'} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
            
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#6C63FF'} />
              <ThemedText style={styles.emptyText}>
                Loading wallet...
              </ThemedText>
            </View>
          ) : transactions.length > 0 ? (
            <FlatList
              data={filteredTransactions}
              keyExtractor={item => item.id}
              renderItem={renderTransactionItem}
              contentContainerStyle={styles.transactionList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons 
                name="account-balance-wallet" 
                size={48} 
                color={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'} 
              />
              <ThemedText style={styles.emptyText}>
                No transactions yet
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Add money to get started with contests
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
      
      {/* Add Money Modal */}
      <AddMoneyModal
        visible={addMoneyModalVisible}
        onClose={() => setAddMoneyModalVisible(false)}
        onAddMoney={handleAddMoney}
      />
      
      {/* Withdraw Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        onWithdraw={handleWithdraw}
        balance={actualBalance}
      />
      
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleFilterModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleFilterModal}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={[
              styles.filterModalContainer,
              { backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.background }
            ]}
          >
            <ThemedText style={styles.filterModalTitle}>Filter Transactions</ThemedText>
            
            <View style={styles.filterOptions}>
              {transactionFilters.map(filter => (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter.value && {
                      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
                      borderColor: Colors.primary,
                    }
                  ]}
                  onPress={() => {
                    setSelectedFilter(filter.value);
                    toggleFilterModal();
                  }}
                >
                  <ThemedText style={[
                    styles.filterOptionText,
                    selectedFilter === filter.value && { color: Colors.primary }
                  ]}>
                    {filter.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  statusBadgeText: {
    fontSize: 12, 
    fontWeight: '600',
  },
  transactionContainer: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    overflow: 'hidden',
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  transactionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16, 
    fontWeight: '700',
  },
  filterButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  transactionList: {
    paddingBottom: 24,
    paddingTop: 4,
    paddingHorizontal: 12,
  },
  transactionItemContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  transactionAmountContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionAmountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: '80%'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  filterOptionText: {
    fontWeight: '500',
    fontSize: 14
  },
}); 
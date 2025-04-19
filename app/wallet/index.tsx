import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import * as Animatable from 'react-native-animatable';
import { Shadow } from 'react-native-shadow-2';
import { WalletCard } from '@/components/WalletCard';
import { LinearGradient } from 'expo-linear-gradient';
import { WalletService } from '@/app/lib/WalletService';
import { supabase } from '@/lib/supabase';

// Define types
interface Transaction {
  id: string;
  type: string;
  amount: number;
  title: string;
  date: string;
  status?: string;
}

// Transaction filter options
const transactionFilters = [
  { label: 'All', value: 'all' },
  { label: 'Added', value: 'credit' },
  { label: 'Withdrawn', value: 'debit' },
];

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const { isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [balance, setBalance] = useState(0);
  const [actualBalance, setActualBalance] = useState(0);
  const [taxCreditBalance, setTaxCreditBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation for the wallet card
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch wallet data
  useEffect(() => {
    fetchWalletData();
    
    // Set up a refresh interval (every 15 seconds)
    const refreshInterval = setInterval(() => {
      fetchWalletData();
    }, 15000);
    
    // Clean up on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // First sync the wallet balance to ensure it's accurate
        try {
          const { error: syncError } = await supabase
            .rpc('sync_wallet_balance', { p_user_id: session.user.id });
            
          if (syncError) {
            console.error('Error syncing wallet balance:', syncError);
          }
        } catch (syncException) {
          console.error('Exception syncing wallet balance:', syncException);
        }
        
        // Fetch wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (walletError) {
          console.error('Error fetching wallet:', walletError);
          // Create a wallet if it doesn't exist
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .upsert({
              id: session.user.id,
              user_id: session.user.id,
              balance: 0,
              total_earnings: 0,
              total_spent: 0
            })
            .select()
            .single();
            
          if (!createError && newWallet) {
            setBalance(0);
            setActualBalance(0);
            setTaxCreditBalance(0);
          } else {
            console.error('Error creating wallet:', createError);
            setBalance(0);
            setActualBalance(0);
            setTaxCreditBalance(0);
          }
        } else if (walletData) {
          // Process the wallet data
          const balanceValue = typeof walletData.balance === 'number' 
            ? walletData.balance 
            : parseFloat(walletData.balance || '0');
            
          setBalance(balanceValue);
          setActualBalance(balanceValue * 0.72);
          setTaxCreditBalance(balanceValue * 0.28);
        }

        // Fetch transactions
        const { data: transactionData, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        if (transactionData) {
          const formattedTransactions: Transaction[] = transactionData.map((item: any) => ({
            id: item.id,
            type: item.type,
            amount: item.amount,
            title: item.reference_id || getTransactionTitle(item.type),
            date: item.created_at,
            status: item.status || 'completed',
          }));
          setTransactions(formattedTransactions);
        }
      } else {
        // Use mock data if not logged in
        loadMockData();
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      loadMockData();
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Load mock data for preview or when API fails
  const loadMockData = () => {
    setBalance(1200);
    setActualBalance(864);
    setTaxCreditBalance(336);
    
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'credit',
        amount: 500,
        title: 'Added money via UPI',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '2',
        type: 'debit',
        amount: 100,
        title: 'Contest entry fee',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '3',
        type: 'credit',
        amount: 250,
        title: 'Contest winnings',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '4',
        type: 'debit',
        amount: 50,
        title: 'Contest entry fee',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '5',
        type: 'debit',
        amount: 200,
        title: 'Withdrawal to bank account',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'processing',
      },
    ];
    setTransactions(mockTransactions);
  };

  // Helper function for transaction title
  const getTransactionTitle = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'Added money to wallet';
      case 'withdrawal':
        return 'Withdrawal requested';
      case 'contest_entry':
        return 'Contest entry fee';
      case 'contest_prize':
        return 'Contest winnings';
      case 'referral':
        return 'Referral bonus';
      case 'bonus':
        return 'Bonus credit';
      default:
        return 'Wallet transaction';
    }
  };

  // Filter transactions
  const filteredTransactions = selectedFilter === 'all'
    ? transactions
    : transactions.filter(item => item.type === selectedFilter);

  // Format transaction date
  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string): React.ComponentProps<typeof MaterialIcons>['name'] => {
    switch (type) {
      case 'credit':
      case 'deposit':
      case 'contest_prize':
      case 'referral':
      case 'bonus':
        return 'arrow-upward';
      case 'debit':
      case 'withdrawal':
      case 'contest_entry':
        return 'arrow-downward';
      default:
        return 'swap-horiz';
    }
  };

  // Get transaction color
  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'credit':
      case 'deposit':
      case 'contest_prize':
      case 'referral':
      case 'bonus':
        return isDark ? '#1A5D2C' : '#4CAF50';
      case 'debit':
      case 'withdrawal':
      case 'contest_entry':
        return isDark ? '#8C2F39' : '#F44336';
      default:
        return isDark ? '#0D47A1' : '#2196F3';
    }
  };

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const iconName = getTransactionIcon(item.type);
    const iconColor = getTransactionColor(item.type);
    const isCredit = item.type === 'credit' || 
                     item.type === 'deposit' || 
                     item.type === 'contest_prize' || 
                     item.type === 'referral' || 
                     item.type === 'bonus';

    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={300} 
        style={styles.transactionItem}
      >
        <Shadow distance={3} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}>
          <View style={[styles.transactionCard, { backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground }]}>
            <View style={styles.transactionIconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
                <MaterialIcons name={iconName} size={20} color={iconColor} />
              </View>
            </View>
            <View style={styles.transactionDetails}>
              <View style={styles.transactionHeader}>
                <ThemedText style={styles.transactionTitle}>{item.title}</ThemedText>
                <ThemedText style={[styles.transactionAmount, { color: iconColor }]}>
                  {isCredit ? '+' : '-'} ₹{item.amount}
                </ThemedText>
              </View>
              <View style={styles.transactionMeta}>
                <ThemedText style={styles.transactionDate}>
                  {formatTransactionDate(item.date)}
                </ThemedText>
                {item.status && item.status !== 'completed' && (
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { 
                      backgroundColor: item.status === 'processing' ? Colors.warning : Colors.info 
                    }]} />
                    <ThemedText style={styles.statusText}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Shadow>
      </Animatable.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Wallet', 
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/wallet/settings')}
            >
              <Ionicons 
                name="settings-outline" 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Wallet Balance Card */}
        <View style={styles.balanceCardContainer}>
          <WalletCard 
            balance={balance} 
            actualBalance={actualBalance}
            taxCreditBalance={taxCreditBalance}
            onAddMoney={() => router.push('/wallet/deposit')}
            onWithdraw={() => router.push('/wallet/withdraw')}
          />
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Animatable.View animation="fadeInUp" delay={200} duration={500}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.primary + '15' }]}
              onPress={() => router.push('/wallet/deposit')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.actionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="add" size={24} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={styles.actionButtonText}>Add Money</ThemedText>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={300} duration={500}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.secondary + '15' }]}
              onPress={() => router.push('/wallet/withdraw')}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="account-balance-wallet" size={20} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={styles.actionButtonText}>Withdraw</ThemedText>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={400} duration={500}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.info + '15' }]}
              onPress={() => router.push('/(tabs)')}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="gamepad" size={18} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={styles.actionButtonText}>Play Game</ThemedText>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {/* Transaction Filters */}
        <View style={styles.transactionFiltersContainer}>
          <ThemedText style={styles.sectionTitle}>Transaction History</ThemedText>
          <View style={styles.filters}>
            {transactionFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.value && [
                    styles.activeFilterButton,
                    { backgroundColor: isDark ? Colors.primary + '30' : Colors.primary + '15' }
                  ]
                ]}
                onPress={() => setSelectedFilter(filter.value)}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.value && [
                      styles.activeFilterButtonText,
                      { color: isDark ? Colors.dark.tint : Colors.primary }
                    ]
                  ]}
                >
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
              <MaterialIcons 
                name="account-balance-wallet" 
                size={24} 
                color={isDark ? Colors.dark.tint : Colors.primary} 
              />
            </Animatable.View>
            <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Animatable.View animation="bounceIn" duration={1000}>
              <MaterialIcons 
                name="receipt-long" 
                size={64} 
                color={isDark ? Colors.dark.tint : Colors.primary} 
                style={styles.emptyStateIcon}
              />
            </Animatable.View>
            <ThemedText style={styles.emptyStateTitle}>No transactions yet</ThemedText>
            <ThemedText style={styles.emptyStateDescription}>
              Your transaction history will appear here when you add money or play contests.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.transactionsList}
            />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  balanceCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    width: (width - 48) / 3,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary + '15',
  },
  filterButtonText: {
    fontSize: 14,
  },
  activeFilterButtonText: {
    fontWeight: '600',
  },
  transactionsContainer: {
    paddingHorizontal: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 13,
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
}); 
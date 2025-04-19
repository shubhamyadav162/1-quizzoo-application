import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Shadow } from 'react-native-shadow-2';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import * as Animatable from 'react-native-animatable';
import { format } from 'date-fns';

// Fake transaction data for preview/testing
const SAMPLE_TRANSACTIONS = [
  {
    id: 1,
    type: 'deposit' as const,
    amount: 500,
    status: 'completed' as const,
    created_at: '2023-06-15T10:30:00Z',
    description: 'Added money via UPI',
    payment_method: 'upi',
    reference_id: 'DEP123456789',
  },
  {
    id: 2,
    type: 'withdrawal' as const,
    amount: 200,
    status: 'completed' as const,
    created_at: '2023-06-10T14:45:00Z',
    description: 'Withdrawal to bank account',
    payment_method: 'bank',
    reference_id: 'WD987654321',
  },
  {
    id: 3,
    type: 'withdrawal' as const,
    amount: 150,
    status: 'pending' as const,
    created_at: '2023-06-05T09:15:00Z',
    description: 'Withdrawal to UPI',
    payment_method: 'upi',
    reference_id: 'WD123987456',
  },
  {
    id: 4,
    type: 'winning' as const,
    amount: 250,
    status: 'completed' as const,
    created_at: '2023-06-01T16:20:00Z',
    description: 'Quiz winning',
    payment_method: null,
    reference_id: 'WIN2468135',
  },
  {
    id: 5,
    type: 'deposit' as const,
    amount: 1000,
    status: 'failed' as const,
    created_at: '2023-05-28T11:10:00Z',
    description: 'Payment failed',
    payment_method: 'card',
    reference_id: 'DEP789456123',
  },
];

type Transaction = {
  id: number;
  type: 'deposit' | 'withdrawal' | 'winning' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  created_at: string;
  description: string;
  payment_method: string | null;
  reference_id: string;
};

// Filter options
type FilterOption = 'all' | 'deposits' | 'withdrawals' | 'winnings';

export default function TransactionsScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  
  useEffect(() => {
    fetchTransactions();
  }, [activeFilter]);
  
  const fetchTransactions = async () => {
    try {
      if (!user) {
        // Use sample data for preview
        setTransactions(SAMPLE_TRANSACTIONS);
        return;
      }
      
      setIsLoading(true);
      
      // Define the query based on the active filter
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Apply type filter if not 'all'
      if (activeFilter === 'deposits') {
        query = query.eq('type', 'deposit');
      } else if (activeFilter === 'withdrawals') {
        query = query.eq('type', 'withdrawal');
      } else if (activeFilter === 'winnings') {
        query = query.eq('type', 'winning');
      }
      
      // Limit to recent 50 transactions
      query = query.limit(50);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setTransactions(data as Transaction[]);
      } else {
        // Use sample data if no real data available
        setTransactions(SAMPLE_TRANSACTIONS);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Use sample data on error
      setTransactions(SAMPLE_TRANSACTIONS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };
  
  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return <MaterialIcons name="add-circle" size={24} color="#4CAF50" />;
      case 'withdrawal':
        return <MaterialIcons name="remove-circle" size={24} color="#F44336" />;
      case 'winning':
        return <FontAwesome5 name="trophy" size={20} color="#FFD700" />;
      case 'refund':
        return <MaterialIcons name="replay" size={24} color="#2196F3" />;
      default:
        return <MaterialIcons name="swap-horiz" size={24} color="#9E9E9E" />;
    }
  };
  
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'failed':
        return Colors.error;
      case 'cancelled':
        return Colors.warning;
      default:
        return 'rgba(128,128,128,0.6)';
    }
  };
  
  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };
  
  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return `Added money via ${transaction.payment_method || 'wallet'}`;
      case 'withdrawal':
        return `Withdrawal to ${transaction.payment_method || 'bank'}`;
      case 'winning':
        return 'Quiz Winnings';
      case 'refund':
        return 'Refund';
      default:
        return transaction.description || 'Transaction';
    }
  };
  
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <Animatable.View animation="fadeIn" duration={500}>
        <Shadow distance={4} startColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'} style={styles.transactionItemShadow}>
          <View style={[styles.transactionItem, { 
            backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground
          }]}>
            <View style={styles.transactionIconContainer}>
              {getTransactionIcon(item)}
            </View>
            
            <View style={styles.transactionInfo}>
              <ThemedText style={styles.transactionTitle}>
                {getTransactionTitle(item)}
              </ThemedText>
              <ThemedText style={styles.transactionDate}>
                {formatDate(item.created_at)}
              </ThemedText>
              <View style={styles.transactionDetailRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.referenceText}>
                  Ref: {item.reference_id}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={[styles.transactionAmount, { 
              color: item.type === 'withdrawal' ? Colors.error : 
                    (item.type === 'winning' || item.type === 'deposit') ? Colors.success : 
                    Colors.primary
            }]}>
              {item.type === 'withdrawal' ? '-' : '+'}₹{item.amount.toFixed(2)}
            </ThemedText>
          </View>
        </Shadow>
      </Animatable.View>
    );
  };
  
  const renderFilterOption = (option: FilterOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        activeFilter === option && { 
          backgroundColor: isDark ? Colors.primary + '30' : Colors.primary + '15',
          borderColor: isDark ? Colors.primary + '60' : Colors.primary + '40',
        }
      ]}
      onPress={() => setActiveFilter(option)}
    >
      <ThemedText
        style={[
          styles.filterOptionText,
          activeFilter === option && { 
            color: isDark ? Colors.dark.tint : Colors.primary,
            fontWeight: '600',
          }
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Transaction History',
          headerShown: true,
        }} 
      />
      
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {renderFilterOption('all', 'All')}
        {renderFilterOption('deposits', 'Deposits')}
        {renderFilterOption('withdrawals', 'Withdrawals')}
        {renderFilterOption('winnings', 'Winnings')}
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.primary} />
          <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="receipt-long" 
            size={64} 
            color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 
          />
          <ThemedText style={styles.emptyText}>
            No transactions found
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Your transaction history will appear here
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={isDark ? Colors.dark.tint : Colors.primary}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filterOptionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  transactionsList: {
    padding: 16,
  },
  transactionItemShadow: {
    marginBottom: 12,
    width: '100%',
  },
  transactionItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
  },
  transactionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  referenceText: {
    fontSize: 10,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
}); 
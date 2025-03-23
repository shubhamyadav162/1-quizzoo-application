import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { Header } from '@/components/Header';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/lib/ThemeContext';

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

export default function WalletScreen() {
  const [balance, setBalance] = useState(1200); // Mock balance
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const router = useRouter();
  
  // Get theme information
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  const filteredTransactions = transactions.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const handleAddMoney = () => {
    if (!amount || parseInt(amount) < 10) return;
    
    // Add new transaction
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: 'credit',
      amount: parseInt(amount),
      title: 'Added money via UPI',
      date: new Date().toISOString(),
    };
    
    // Update balance
    setBalance(balance + parseInt(amount));
    
    // Add to transactions
    setTransactions([newTransaction, ...transactions]);
    
    // Close modal and reset amount
    setAddMoneyModalVisible(false);
    setAmount('');
  };

  const handleWithdraw = () => {
    if (!amount || parseInt(amount) < 10 || parseInt(amount) > balance) return;
    
    // Add new transaction
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: 'debit',
      amount: parseInt(amount),
      title: 'Withdrawal to bank account',
      date: new Date().toISOString(),
    };
    
    // Update balance
    setBalance(balance - parseInt(amount));
    
    // Add to transactions
    setTransactions([newTransaction, ...transactions]);
    
    // Close modal and reset amount
    setWithdrawModalVisible(false);
    setAmount('');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SimpleSwipeView>
        <ThemedView style={styles.container}>
          <Header 
            title="My Wallet"
            subtitle="Manage your funds"
          />
          
          {/* Balance Card */}
          <ThemedView style={[styles.balanceCard, isDark && styles.balanceCardDark]}>
            <ThemedView style={styles.balanceContainer}>
              <ThemedText style={[styles.balanceLabel, isDark && { color: '#aaa' }]}>Total Balance</ThemedText>
              <ThemedText style={[styles.balanceAmount, isDark && { color: '#fff' }]}>₹{balance}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton, isDark && styles.actionButtonDark]}
                onPress={() => setAddMoneyModalVisible(true)}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <ThemedText style={styles.actionButtonText}>Add</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.withdrawButton, isDark && styles.actionButtonDark]}
                onPress={() => setWithdrawModalVisible(true)}
              >
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#fff" />
                <ThemedText style={styles.actionButtonText}>Withdraw</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
          
          {/* Transaction History */}
          <ThemedView style={styles.transactionContainer}>
            <ThemedView style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
              <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Transaction History</ThemedText>
              {transactions.length > 0 && (
                <TouchableOpacity onPress={toggleFilterModal}>
                  <MaterialIcons name="filter-list" size={24} color={isDark ? "#fff" : "#333"} />
                </TouchableOpacity>
              )}
            </ThemedView>
            
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ThemedView style={[styles.transactionItem, isDark && styles.transactionItemDark]}>
                  <ThemedView style={[
                    styles.transactionIconContainer, 
                    { backgroundColor: getTransactionColor(item.type, isDark) }
                  ]}>
                    <MaterialIcons name={getTransactionIcon(item.type)} size={20} color="#fff" />
                  </ThemedView>
                  
                  <ThemedView style={styles.transactionInfo}>
                    <ThemedText style={[styles.transactionTitle, isDark && { color: '#fff' }]}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={[styles.transactionDate, isDark && { color: '#aaa' }]}>
                      {formatTransactionDate(item.date)}
                    </ThemedText>
                  </ThemedView>
                  
                  <ThemedText style={[
                    styles.transactionAmount,
                    item.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {item.type === 'credit' ? '+' : '-'}₹{item.amount}
                  </ThemedText>
                </ThemedView>
              )}
              ListEmptyComponent={
                <ThemedView style={styles.emptyContainer}>
                  <MaterialIcons name="history" size={50} color={isDark ? "#555" : "#ccc"} />
                  <ThemedText style={[styles.emptyText, isDark && { color: '#aaa' }]}>
                    No transactions yet
                  </ThemedText>
                </ThemedView>
              }
            />
          </ThemedView>
          
          {/* Filter Modal */}
          <Modal
            transparent={true}
            visible={filterModalVisible}
            animationType="fade"
            onRequestClose={toggleFilterModal}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={toggleFilterModal}
            >
              <ThemedView 
                style={[styles.filterModal, isDark && styles.filterModalDark]} 
                backgroundType="card"
              >
                <ThemedText style={[styles.filterTitle, isDark && { color: '#fff' }]}>
                  Filter Transactions
                </ThemedText>
                
                <ThemedView style={styles.filterOptions}>
                  {transactionFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={[
                        styles.filterOption,
                        isDark && styles.filterOptionDark,
                        selectedFilter === filter.value && styles.filterOptionActive
                      ]}
                      onPress={() => {
                        setSelectedFilter(filter.value);
                        toggleFilterModal();
                      }}
                    >
                      <ThemedText style={[
                        styles.filterOptionText,
                        isDark && styles.filterOptionTextDark,
                        selectedFilter === filter.value && styles.filterOptionTextActive
                      ]}>
                        {filter.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          </Modal>
          
          {/* Add Money Modal */}
          <Modal
            transparent={true}
            visible={addMoneyModalVisible}
            animationType="slide"
            onRequestClose={() => setAddMoneyModalVisible(false)}
          >
            <ThemedView style={styles.modalContainer}>
              <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
                <ThemedView style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
                  <ThemedText style={[styles.modalTitle, isDark && { color: '#fff' }]}>
                    Add Money
                  </ThemedText>
                  <TouchableOpacity onPress={() => setAddMoneyModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />
                  </TouchableOpacity>
                </ThemedView>
                
                <ThemedView style={styles.modalBody}>
                  <ThemedText style={[styles.inputLabel, isDark && { color: '#ddd' }]}>
                    Enter Amount
                  </ThemedText>
                  <ThemedView style={[styles.amountInputContainer, isDark && styles.amountInputContainerDark]}>
                    <ThemedText style={[styles.currencySymbol, isDark && { color: '#fff' }]}>₹</ThemedText>
                    <TextInput
                      style={[styles.amountInput, isDark && { color: '#fff' }]}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={isDark ? "#777" : "#999"}
                    />
                  </ThemedView>
                  
                  <ThemedView style={styles.quickAmountContainer}>
                    {[100, 200, 500, 1000].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[styles.quickAmount, isDark && styles.quickAmountDark]}
                        onPress={() => setAmount(value.toString())}
                      >
                        <ThemedText style={[styles.quickAmountText, isDark && { color: '#fff' }]}>
                          ₹{value}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButtonLarge,
                      styles.addButtonLarge,
                      isDark && styles.actionButtonDarkLarge,
                      !amount || isNaN(Number(amount)) ? styles.disabledButton : null
                    ]}
                    onPress={handleAddMoney}
                    disabled={!amount || isNaN(Number(amount))}
                  >
                    <ThemedText style={styles.actionButtonTextLarge}>Add Money</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </Modal>
          
          {/* Withdraw Money Modal */}
          <Modal
            transparent={true}
            visible={withdrawModalVisible}
            animationType="slide"
            onRequestClose={() => setWithdrawModalVisible(false)}
          >
            <ThemedView style={styles.modalContainer}>
              <ThemedView style={[styles.modalContent, isDark && styles.modalContentDark]} backgroundType="card">
                <ThemedView style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
                  <ThemedText style={[styles.modalTitle, isDark && { color: '#fff' }]}>
                    Withdraw Money
                  </ThemedText>
                  <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />
                  </TouchableOpacity>
                </ThemedView>
                
                <ThemedView style={styles.modalBody}>
                  <ThemedText style={[styles.inputLabel, isDark && { color: '#ddd' }]}>
                    Enter Amount
                  </ThemedText>
                  <ThemedView style={[styles.amountInputContainer, isDark && styles.amountInputContainerDark]}>
                    <ThemedText style={[styles.currencySymbol, isDark && { color: '#fff' }]}>₹</ThemedText>
                    <TextInput
                      style={[styles.amountInput, isDark && { color: '#fff' }]}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={isDark ? "#777" : "#999"}
                    />
                  </ThemedView>
                  
                  <ThemedView style={styles.quickAmountContainer}>
                    {[100, 200, 500, 1000].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[styles.quickAmount, isDark && styles.quickAmountDark]}
                        onPress={() => setAmount(value.toString())}
                      >
                        <ThemedText style={[styles.quickAmountText, isDark && { color: '#fff' }]}>
                          ₹{value}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButtonLarge,
                      styles.withdrawButtonLarge,
                      isDark && styles.actionButtonDarkLarge,
                      !amount || isNaN(Number(amount)) || Number(amount) > balance ? styles.disabledButton : null
                    ]}
                    onPress={handleWithdraw}
                    disabled={!amount || isNaN(Number(amount)) || Number(amount) > balance}
                  >
                    <ThemedText style={styles.actionButtonTextLarge}>Withdraw</ThemedText>
                  </TouchableOpacity>
                  
                  {Number(amount) > balance && (
                    <ThemedText style={styles.errorText}>Insufficient balance</ThemedText>
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </Modal>
        </ThemedView>
      </SimpleSwipeView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceCardDark: {
    backgroundColor: '#1E2A38',
    shadowOpacity: 0.3,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '45%',
  },
  actionButtonDark: {
    opacity: 0.9,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  withdrawButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
  // Transaction section
  transactionContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeaderDark: {
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionItemDark: {
    borderBottomColor: '#333',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
  
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  filterModalDark: {
    backgroundColor: '#222',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  filterOptionDark: {
    backgroundColor: '#333',
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    color: '#666',
  },
  filterOptionTextDark: {
    color: '#ccc',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  
  // Main Modals (Add & Withdraw)
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderDark: {
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  amountInputContainerDark: {
    borderColor: '#444',
    backgroundColor: '#333',
  },
  currencySymbol: {
    fontSize: 20,
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#333',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAmount: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  quickAmountDark: {
    backgroundColor: '#333',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtonLarge: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonLarge: {
    backgroundColor: '#4CAF50',
  },
  withdrawButtonLarge: {
    backgroundColor: '#F44336',
  },
  actionButtonDarkLarge: {
    opacity: 0.9,
  },
  actionButtonTextLarge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: '#F44336',
    marginTop: 10,
    textAlign: 'center',
  },
}); 
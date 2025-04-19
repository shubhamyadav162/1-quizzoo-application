import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
  SafeAreaView,
  Image,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';
import { FilterType, useFilters } from '@/app/lib/FilterContext';

// For backward compatibility
export type FilterOptions = FilterType;

type ContestFiltersProps = {
  isVisible?: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: FilterType) => void;
  initialFilters?: FilterType;
  isDark?: boolean;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define styles first to avoid reference errors
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: SCREEN_WIDTH,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    position: 'relative',
    zIndex: 1, // Keep this as a relatively low value
  },
  patternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0, // Make it completely transparent
    overflow: 'hidden',
    zIndex: -10, // Ensure background stays far behind content with very negative zIndex
    // Remove any pattern or grid styling completely
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: '70%',
    zIndex: 2,  // Above the background
    position: 'relative', // Ensure content stays on top
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
    zIndex: 999, // Much higher z-index to ensure touchability
    position: 'relative', // Ensure proper stacking context
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emojiPrefix: {
    textAlign: 'center',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  quickAmountButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 999, // Much higher z-index to ensure touchability
    position: 'relative', // Ensure proper stacking context
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 20,
    marginRight: 8,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    paddingBottom: 30, // Extra padding at bottom for better touch area
    zIndex: 2,  // Above the background
  },
  resetButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 999, // Much higher z-index for button
  },
  resetButtonText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    flexDirection: 'row',
    zIndex: 999, // Much higher z-index for button
    elevation: 3, // Android elevation for shadow effect 
  },
  applyButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  filterButtonSelected: {
    transform: [{ scale: 1.05 }],
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export const ContestFilters = ({
  isVisible,
  onClose,
  onApplyFilters,
  initialFilters,
  isDark: propIsDark,
}: ContestFiltersProps) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark; // Use prop if provided, otherwise use theme
  const { filters: globalFilters, updateFilters: setGlobalFilters, resetFilters: resetGlobalFilters } = useFilters();
  
  // Use initialFilters if provided, otherwise fallback to global filters
  const [localFilters, setLocalFilters] = useState<FilterType>(initialFilters || globalFilters);
  const [customAmountInput, setCustomAmountInput] = useState('');

  // Sync with global filters when they change
  useEffect(() => {
    if (!initialFilters) {
      setLocalFilters(globalFilters);
    }
  }, [globalFilters, initialFilters]);

  // Update custom amount input when filters change
  useEffect(() => {
    if (localFilters.entryFeeRange.custom !== null) {
      setCustomAmountInput(localFilters.entryFeeRange.custom.toString());
    } else {
      setCustomAmountInput('');
    }
  }, [localFilters.entryFeeRange.custom]);

  const updateStakeTier = (tier: keyof FilterType['stakeTiers']) => {
    setLocalFilters(prev => ({
      ...prev,
      stakeTiers: {
        ...prev.stakeTiers,
        [tier]: !prev.stakeTiers[tier]
      }
    }));
  };

  const updatePlayerCount = (index: number) => {
    setLocalFilters(prev => {
      const newPlayerCounts = [...prev.playerCounts];
      newPlayerCounts[index] = {
        ...newPlayerCounts[index],
        selected: !newPlayerCounts[index].selected
      };
      return {
        ...prev,
        playerCounts: newPlayerCounts
      };
    });
  };
  
  const updateContestType = (type: keyof FilterType['contestTypes']) => {
    setLocalFilters(prev => ({
      ...prev,
      contestTypes: {
        ...prev.contestTypes,
        [type]: !prev.contestTypes[type]
      }
    }));
  };

  const handleCustomAmountChange = (text: string) => {
    // Only allow numeric input
    if (text === '' || /^\d+$/.test(text)) {
      setCustomAmountInput(text);
      
      const numAmount = text === '' ? null : parseInt(text, 10);
      setLocalFilters(prev => ({
        ...prev,
        entryFeeRange: {
          ...prev.entryFeeRange,
          custom: numAmount,
          enabled: numAmount !== null
        }
      }));
    }
  };

  const resetFilters = () => {
    setLocalFilters({
      entryFeeRange: {
        enabled: false,
        min: 10,
        max: 1000,
        custom: null,
      },
      stakeTiers: { 
        micro: false, 
        mid: false, 
        high: false 
      },
      playerCounts: [
        { count: 2, selected: false, label: 'Duel (1v1)' },
        { count: 10, selected: false, label: 'Standard (10)' },
        { count: 20, selected: false, label: 'Pro (20)' },
        { count: 50, selected: false, label: 'Royal (50)' },
      ],
      contestTypes: { 
        standard: false, 
        medium: false, 
        large: false, 
        duel: false, 
        special: false 
      }
    });
    
    setCustomAmountInput('');
    
    // Also reset global filters if not using initialFilters
    if (!initialFilters) {
      resetGlobalFilters();
    }
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', JSON.stringify(localFilters));
    
    // Create a fresh copy to avoid mutation issues
    const updatedFilters: FilterType = {
      entryFeeRange: { 
        ...localFilters.entryFeeRange,
        custom: localFilters.entryFeeRange.custom ?? null
      },
      stakeTiers: { ...localFilters.stakeTiers },
      playerCounts: [...localFilters.playerCounts],
      contestTypes: { ...localFilters.contestTypes }
    };
    
    // Update global filters in the context
    setGlobalFilters(updatedFilters);
    
    // Call the callback if provided
    if (onApplyFilters) {
      onApplyFilters(updatedFilters);
    }
    
    // Close the modal with a slight delay to ensure state updates
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const getFilterBtnStyle = (isActive: boolean) => ({
    ...styles.filterButton,
    backgroundColor: isActive
      ? isDark
        ? Colors.dark.tint + '30'
        : Colors.light.tint + '20'
      : isDark
      ? '#333'
      : '#f0f0f0',
    borderColor: isActive
      ? isDark
        ? Colors.dark.tint
        : Colors.light.tint
      : 'transparent',
    ...(isActive && styles.filterButtonSelected),
    zIndex: 3, // Ensure buttons have higher z-index than background
  });

  const getFilterTextStyle = (isActive: boolean) => ({
    ...styles.filterButtonText,
    color: isActive
      ? isDark
        ? Colors.dark.tint
        : Colors.light.tint
      : isDark
      ? '#ddd'
      : '#555',
    fontWeight: isActive ? 'bold' as const : '500' as const,
  });

  const getTierEmoji = (tier: keyof FilterType['stakeTiers']) => {
    const emojis: Record<keyof FilterType['stakeTiers'], string> = {
      micro: '💰',
      mid: '🏆',
      high: '👑',
    };
    return emojis[tier];
  };

  // Helper function to get emoji for player count
  const getPlayerCountEmoji = (index: number) => {
    const emojis = ['⚔️', '👥', '👨‍👩‍👧‍👦', '👨‍👩‍👧‍👦'];
    return emojis[index] || '👥';
  };
  
  const getContestTypeEmoji = (type: keyof FilterType['contestTypes']) => {
    const emojis: Record<keyof FilterType['contestTypes'], string> = {
      standard: '⚡',
      medium: '🏃',
      large: '📅',
      duel: '⚔️',
      special: '🌟',
    };
    return emojis[type];
  };

  const getActiveFilterCount = () => {
    let count = 0;
    
    // Count active stake tiers
    Object.values(localFilters.stakeTiers).forEach(value => {
      if (value) count++;
    });
    
    // Count active player counts
    localFilters.playerCounts.forEach(pc => {
      if (pc.selected) count++;
    });
    
    // Count active contest types
    Object.values(localFilters.contestTypes).forEach(value => {
      if (value) count++;
    });
    
    // Add 1 if custom amount is set
    if (localFilters.entryFeeRange.custom !== null) count++;
    
    return count;
  };

  const PatternBackground = () => {
    // Simplified, non-interactive background
    return (
      <View 
        style={[
          styles.patternBackground,
          { opacity: 0 } // Set opacity to 0 to make it completely transparent
        ]}
        pointerEvents="none" // Ensure this view doesn't capture touch events
      />
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
          styles.container,
            { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
          ]}
        >
          <PatternBackground />
          
          <View
            style={[
            styles.header,
              { borderBottomColor: isDark ? '#333' : '#e0e0e0' },
            ]}
          >
            <Text
              style={[styles.headerText, { color: isDark ? '#FFF' : '#333' }]}
            >
              Filter Contests
            </Text>
            
            {getActiveFilterCount() > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFF' : '#333'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Stake Tier Selection */}
            <Text
              style={[
              styles.sectionTitle,
                { color: isDark ? '#FFF' : '#333' },
              ]}
            >
              Entry Fee Range
            </Text>
            <View style={styles.filterRow}>
              {(Object.keys(localFilters.stakeTiers) as Array<
                keyof FilterType['stakeTiers']
              >).map(tier => (
              <TouchableOpacity
                  key={tier}
                  style={getFilterBtnStyle(localFilters.stakeTiers[tier])}
                  onPress={() => updateStakeTier(tier)}
                >
                  <Text style={styles.emojiPrefix}>{getTierEmoji(tier)}</Text>
                  <Text style={getFilterTextStyle(localFilters.stakeTiers[tier])}>
                    {tier === 'micro'
                      ? 'Micro (₹5-₹20)'
                      : tier === 'mid'
                      ? 'Mid (₹51-₹200)'
                      : 'High (₹201+)'}
                </Text>
              </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Amount Input */}
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? '#FFF' : '#333' },
              ]}
            >
              Custom Amount
                </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: isDark ? '#555' : '#e0e0e0',
                  backgroundColor: isDark ? '#333' : '#f9f9f9',
                },
              ]}
            >
              <Text
                style={[
                  styles.currencySymbol,
                  { color: isDark ? '#FFF' : '#333' },
                ]}
              >
                ₹
                </Text>
              <TextInput
                style={[styles.input, { color: isDark ? '#FFF' : '#333' }]}
                keyboardType="number-pad"
                placeholder="Enter exact amount"
                placeholderTextColor={isDark ? '#999' : '#AAA'}
                value={customAmountInput}
                onChangeText={handleCustomAmountChange}
              />
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsContainer}>
              {[10, 25, 50, 100, 250, 500].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    { 
                      backgroundColor:
                        localFilters.entryFeeRange.custom === amount
                          ? isDark
                            ? Colors.dark.tint + '30'
                            : Colors.light.tint + '20'
                          : isDark
                          ? '#333'
                          : '#f0f0f0',
                      borderColor:
                        localFilters.entryFeeRange.custom === amount
                          ? isDark
                            ? Colors.dark.tint
                            : Colors.light.tint
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    if (localFilters.entryFeeRange.custom === amount) {
                      handleCustomAmountChange('');
                    } else {
                      handleCustomAmountChange(amount.toString());
                    }
                  }}
                >
                  <Text
                    style={[
                    styles.quickAmountText,
                    { 
                        color:
                          localFilters.entryFeeRange.custom === amount
                            ? isDark
                              ? Colors.dark.tint
                              : Colors.light.tint
                            : isDark
                            ? '#ddd'
                            : '#555',
                      },
                    ]}
                  >
                    ₹{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Player Count Selection */}
            <Text
              style={[
              styles.sectionTitle,
                { color: isDark ? '#FFF' : '#333' },
              ]}
            >
              Player Count
            </Text>
            <View style={styles.filterRow}>
              {(Object.keys(localFilters.playerCounts) as Array<
                keyof FilterType['playerCounts']
              >).map((_, index) => (
              <TouchableOpacity
                  key={index}
                  style={getFilterBtnStyle(localFilters.playerCounts[index].selected)}
                  onPress={() => updatePlayerCount(index)}
              >
                  <Text style={styles.emojiPrefix}>
                    {getPlayerCountEmoji(index)}
                </Text>
                  <Text
                    style={getFilterTextStyle(localFilters.playerCounts[index].selected)}
                  >
                    {localFilters.playerCounts[index].label}
                </Text>
              </TouchableOpacity>
              ))}
            </View>
            
            {/* Contest Type Selection */}
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? '#FFF' : '#333' },
              ]}
            >
              Contest Type
            </Text>
            <View style={styles.filterRow}>
              {(Object.keys(localFilters.contestTypes) as Array<
                keyof FilterType['contestTypes']
              >).map(type => (
              <TouchableOpacity
                  key={type}
                  style={getFilterBtnStyle(localFilters.contestTypes[type])}
                  onPress={() => updateContestType(type)}
              >
                  <Text style={styles.emojiPrefix}>
                    {getContestTypeEmoji(type)}
                </Text>
                  <Text
                    style={getFilterTextStyle(localFilters.contestTypes[type])}
                  >
                    {type === 'standard'
                      ? 'Standard'
                      : type === 'medium'
                      ? 'Quick'
                      : 'Scheduled'}
                </Text>
              </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View
            style={[
            styles.footer,
              { borderTopColor: isDark ? '#333' : '#e0e0e0' },
            ]}
          >
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetFilters}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={isDark ? '#AAA' : '#888'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.resetButtonText,
                  { color: isDark ? '#AAA' : '#888' },
                ]}
              >
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.applyButton,
                {
                  backgroundColor: isDark
                    ? Colors.dark.tint
                    : Colors.light.tint,
                  // Add shadow and elevation to make it stand out
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 5,
                },
              ]} 
              onPress={handleApplyFilters}
              activeOpacity={0.7} // Make it more responsive to touch
            >
              <Text style={styles.applyButtonText}>
                Apply Filters {getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ''}
              </Text>
              <Ionicons
                name="checkmark"
                size={20}
                color="#FFF"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}; 
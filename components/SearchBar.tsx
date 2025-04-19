import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Keyboard,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/lib/ThemeContext';
import { Colors } from '@/constants/Colors';

type SearchBarProps = {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  value: string;
  recentSearches?: string[];
};

export const SearchBar = ({
  isVisible,
  onClose,
  onSearch,
  value,
  recentSearches = ['trivia contest', 'sports quiz', 'daily challenge'],
}: SearchBarProps) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState(value);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Reset the query when modal closes
      setQuery('');
    }
  }, [isVisible]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setShowRecentSearches(false);
      Keyboard.dismiss();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setShowRecentSearches(true);
    inputRef.current?.focus();
  };

  const handleSelectRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm);
    setShowRecentSearches(false);
  };

  const translateY = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });

  const opacity = animatedHeight.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }
      ]}>
        <Animated.View style={[
          styles.searchContainer,
          { 
            backgroundColor: isDark ? '#222' : '#fff',
            transform: [{ translateY }],
            opacity
          }
        ]}>
          <View style={styles.header}>
            <View style={[
              styles.inputContainer,
              { backgroundColor: isDark ? '#333' : '#f0f0f0' }
            ]}>
              <Ionicons name="search" size={20} color={isDark ? '#aaa' : '#777'} />
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  { color: isDark ? '#fff' : '#000' }
                ]}
                placeholder="Search contests..."
                placeholderTextColor={isDark ? '#aaa' : '#777'}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                  <Ionicons name="close-circle" size={18} color={isDark ? '#aaa' : '#777'} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={[
                styles.cancelText,
                { color: isDark ? Colors.dark.tint : Colors.light.tint }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {query.length === 0 && showRecentSearches && (
              <View style={styles.recentSearchesContainer}>
                <View style={styles.recentHeader}>
                  <Text style={[
                    styles.recentTitle,
                    { color: isDark ? '#fff' : '#000' }
                  ]}>
                    Recent Searches
                  </Text>
                  <TouchableOpacity>
                    <Text style={[
                      styles.clearText,
                      { color: isDark ? Colors.dark.tint : Colors.light.tint }
                    ]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={recentSearches}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.recentItem}
                      onPress={() => handleSelectRecentSearch(item)}
                    >
                      <View style={styles.recentIconContainer}>
                        <Ionicons name="time-outline" size={18} color={isDark ? '#aaa' : '#777'} />
                      </View>
                      <Text style={[
                        styles.recentText,
                        { color: isDark ? '#ddd' : '#333' }
                      ]}>
                        {item}
                      </Text>
                      <TouchableOpacity>
                        <Ionicons name="arrow-up" size={18} color={isDark ? '#aaa' : '#777'} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {query.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: isDark ? '#333' : '#eee' }
                  ]}
                  onPress={handleSearch}
                >
                  <Ionicons name="search" size={18} color={isDark ? '#aaa' : '#777'} />
                  <Text style={[
                    styles.suggestionText,
                    { color: isDark ? '#ddd' : '#333' }
                  ]}>
                    Search for "{query}"
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  searchContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60, // Extra padding for status bar
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 40,
  },
  cancelButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    minHeight: 300,
    paddingBottom: 20,
  },
  recentSearchesContainer: {
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: 14,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  recentIconContainer: {
    marginRight: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 
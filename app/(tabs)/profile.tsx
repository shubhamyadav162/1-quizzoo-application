import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  Switch,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { SimpleSwipeView } from '@/components/SimpleSwipeView';
import { Header } from '@/components/Header';
import { useTheme } from '@/app/lib/ThemeContext';

// Define user profile type
interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string | null;
  totalContests: number;
  contestsWon: number;
  totalEarnings: number;
}

// Mock user data
const USER: UserProfile = {
  name: 'Rahul Kumar',
  username: 'rahulk',
  avatarUrl: null, // We'll use initials instead of avatar for now
  totalContests: 32,
  contestsWon: 12,
  totalEarnings: 2500,
};

// Settings type
interface Setting {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'action';
  enabled?: boolean;
}

// Mock settings
const SETTINGS: Setting[] = [
  {
    id: 'notifications',
    title: 'Push Notifications',
    description: 'Receive notifications for contests and results',
    type: 'toggle',
    enabled: true,
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    description: 'Enable dark mode for the app',
    type: 'toggle',
    enabled: false,
  },
  {
    id: 'change-password',
    title: 'Change Password',
    description: 'Update your account password',
    type: 'action',
  },
  {
    id: 'payment-methods',
    title: 'Payment Methods',
    description: 'Manage your payment methods',
    type: 'action',
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Get help with the app',
    type: 'action',
  },
];

export default function ProfileScreen() {
  const [settings, setSettings] = useState(SETTINGS);
  const [user, setUser] = useState(USER);
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Update dark mode setting to match the current theme
  React.useEffect(() => {
    const updatedSettings = settings.map(setting => {
      if (setting.id === 'dark-mode') {
        return { ...setting, enabled: isDark };
      }
      return setting;
    });
    setSettings(updatedSettings);
  }, [colorScheme]);

  const getInitials = (name: string): string => {
    const names = name.split(' ');
    return names.map(name => name.charAt(0)).join('').toUpperCase();
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // router.push('/edit-profile');
    alert('Edit Profile feature coming soon!');
  };

  const handleToggleSetting = (id: string) => {
    if (id === 'dark-mode') {
      // Toggle the theme through the context
      toggleColorScheme();
    } else {
      // Handle other settings as normal
      const newSettings = settings.map(setting => {
        if (setting.id === id && setting.type === 'toggle') {
          return { ...setting, enabled: !setting.enabled };
        }
        return setting;
      });
      setSettings(newSettings);
    }
  };

  const handleSettingAction = (id: string) => {
    // Handle setting action
    alert(`${id} feature coming soon!`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SimpleSwipeView>
        <ThemedView style={[styles.container]}>
          <Header 
            title="Profile" 
            subtitle="Manage your account"
          />
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* User Profile Card */}
            <ThemedView style={[styles.profileCard, isDark && styles.profileCardDark]} backgroundType="card">
              <View style={styles.profileHeader}>
                <View style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
                  <ThemedText style={styles.avatarText}>{getInitials(user.name)}</ThemedText>
                </View>
                
                <View style={styles.profileInfo}>
                  <ThemedText style={[styles.userName, isDark && { color: '#fff' }]}>{user.name}</ThemedText>
                  <ThemedText style={[styles.userHandle, isDark && { color: '#bbb' }]}>@{user.username}</ThemedText>
                </View>
                
                <TouchableOpacity 
                  style={[styles.editButton, isDark && styles.editButtonDark]} 
                  onPress={handleEditProfile}
                >
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, isDark && { color: '#fff' }]}>{user.totalContests}</ThemedText>
                  <ThemedText style={[styles.statLabel, isDark && { color: '#bbb' }]}>Contests</ThemedText>
                </View>
                
                <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
                
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, isDark && { color: '#fff' }]}>{user.contestsWon}</ThemedText>
                  <ThemedText style={[styles.statLabel, isDark && { color: '#bbb' }]}>Won</ThemedText>
                </View>
                
                <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
                
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, isDark && { color: '#fff' }]}>₹{user.totalEarnings}</ThemedText>
                  <ThemedText style={[styles.statLabel, isDark && { color: '#bbb' }]}>Earnings</ThemedText>
                </View>
              </View>
            </ThemedView>
            
            {/* Settings Section */}
            <ThemedView style={[styles.sectionContainer, isDark && styles.sectionContainerDark]}>
              <ThemedText style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Settings</ThemedText>
              
              {settings.map((setting) => (
                <ThemedView 
                  key={setting.id} 
                  style={[styles.settingItem, isDark && styles.settingItemDark]}
                  backgroundType="card"
                >
                  <View style={styles.settingInfo}>
                    <ThemedText style={[styles.settingTitle, isDark && { color: '#fff' }]}>{setting.title}</ThemedText>
                    <ThemedText style={[styles.settingDescription, isDark && { color: '#bbb' }]}>{setting.description}</ThemedText>
                  </View>
                  
                  {setting.type === 'toggle' ? (
                    <Switch
                      value={setting.enabled}
                      onValueChange={() => handleToggleSetting(setting.id)}
                      trackColor={{ false: isDark ? '#444' : '#D1D1D1', true: Colors.primary }}
                      thumbColor={isDark ? '#f0f0f0' : '#fff'}
                      ios_backgroundColor={isDark ? '#444' : '#D1D1D1'}
                    />
                  ) : (
                    <TouchableOpacity onPress={() => handleSettingAction(setting.id)}>
                      <ThemedText style={[styles.actionText, isDark && { color: '#64B5F6' }]}>
                        {setting.id === 'change-password' ? 'Change' : 
                        setting.id === 'help' ? 'Contact' : 'View'}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </ThemedView>
              ))}
            </ThemedView>
            
            {/* Logout Button */}
            <TouchableOpacity 
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={() => router.push('/login' as any)}
            >
              <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </SimpleSwipeView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: '#1E2A38',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainerDark: {
    backgroundColor: '#1976D2',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  editButtonDark: {
    backgroundColor: '#1976D2',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  statsContainerDark: {
    backgroundColor: '#293445',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
  statDividerDark: {
    backgroundColor: '#444',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionContainerDark: {
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItemDark: {
    backgroundColor: '#1E2A38',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  actionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonDark: {
    backgroundColor: '#C62828',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
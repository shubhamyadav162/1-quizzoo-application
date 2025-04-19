import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase, getCurrentUser } from './lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/lib/ThemeContext';

export default function MyPrivateContestsScreen() {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setContests([]);
        setLoading(false);
        return;
      }
      // Fetch contests where user is creator or participant
      const { data, error } = await supabase
        .from('private_contests')
        .select('*')
        .or(`created_by.eq.${user.id},participants.cs.{${user.id}}`);
      if (error) {
        setContests([]);
      } else {
        setContests(data || []);
      }
      setLoading(false);
    };
    fetchContests();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <LinearGradient
      colors={isDark ? ['#232526', '#414345'] : ['#e0eafc', '#cfdef3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.contestItem}
    >
      <ThemedText style={styles.contestName}>{item.name}</ThemedText>
      <ThemedText style={styles.contestDetail}>Code: {item.code}</ThemedText>
      <ThemedText style={styles.contestDetail}>Entry Fee: ₹{item.entry_fee}</ThemedText>
      <ThemedText style={styles.contestDetail}>Max Players: {item.max_players}</ThemedText>
      <ThemedText style={styles.contestDetail}>Created At: {new Date(item.created_at).toLocaleString()}</ThemedText>
    </LinearGradient>
  );

  return (
    <ThemedView backgroundType="background" style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#232526', '#414345'] : ['#43cea2', '#185a9d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#3949AB'} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Private Contests</ThemedText>
      </LinearGradient>
      {loading ? (
        <ActivityIndicator size="large" color="#3949AB" style={{ marginTop: 32 }} />
      ) : contests.length === 0 ? (
        <ThemedText style={styles.emptyText}>No private contests found.</ThemedText>
      ) : (
        <FlatList
          data={contests}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  contestItem: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  contestName: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
  },
  contestDetail: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    color: '#888',
  },
}); 
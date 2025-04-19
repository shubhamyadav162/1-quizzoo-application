import GamingWaitingLobby from '@/components/GamingWaitingLobby';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function LobbyScreen() {
  // Extract all params (pool data) from the URL
  const params = useLocalSearchParams();
  return <GamingWaitingLobby {...params} />;
} 
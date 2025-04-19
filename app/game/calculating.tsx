import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CalculatingResultsScreen from './CalculatingResultsScreen';

export default function CalculatingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Callback when calculation is done
  const handleDone = () => {
    // Pass along all params to results screen
    router.replace({
      pathname: '/game/results',
      params,
    });
  };

  // You can get isHindi from params or context if needed
  return (
    <CalculatingResultsScreen onDone={handleDone} isHindi={params.isQuizHindi === 'true'} />
  );
} 
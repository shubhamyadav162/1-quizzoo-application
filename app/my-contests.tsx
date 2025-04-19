import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTheme } from './lib/ThemeContext';
import { usePrivateContests } from './lib/PrivateContestContext';
import { MyContests } from '@/components/MyContests';
import { Colors } from '@/constants/Colors';

export default function MyContestsScreen() {
  const { isDark } = useTheme();
  const { privateContests, startContest, editContest, cancelContest } = usePrivateContests();

  const handleStartContest = (contestId: string) => {
    Alert.alert(
      'Start Contest',
      'Are you sure you want to start this contest now?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start',
          onPress: () => {
            startContest(contestId);
            Alert.alert('Contest Started', 'Your contest has started successfully!');
          },
        },
      ]
    );
  };

  const handleEditContest = (contestId: string) => {
    // In a real app, you might navigate to an edit screen
    // For now we'll just show an alert
    Alert.alert(
      'Edit Contest',
      'This feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleCancelContest = (contestId: string) => {
    Alert.alert(
      'Cancel Contest',
      'Are you sure you want to cancel this contest? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelContest(contestId);
            Alert.alert('Contest Cancelled', 'Your contest has been cancelled.');
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
      ]}
    >
      <MyContests
        contests={privateContests}
        onStartContest={handleStartContest}
        onEditContest={handleEditContest}
        onCancelContest={handleCancelContest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 
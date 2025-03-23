import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface SimpleSwipeViewProps {
  children: ReactNode;
  nextScreenPath?: string;
  prevScreenPath?: string;
}

export const SimpleSwipeView: React.FC<SimpleSwipeViewProps> = ({
  children,
}) => {
  // Simple container with no swipe functionality
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 
import { TouchableOpacity } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  // Skip rendering any help tab or tabs with index ≥ 4
  if (
    props.accessibilityLabel?.toLowerCase().includes('help') || 
    props.to?.toString().toLowerCase().includes('help')
  ) {
    return null;
  }

  return (
    <TouchableOpacity
      {...props}
      onPress={e => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPress && props.onPress(e);
      }}
      activeOpacity={0.7}
    />
  );
}

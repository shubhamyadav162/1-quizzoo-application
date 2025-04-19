import GameScreen from './components/GameScreen';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const [fontsLoaded] = useFonts({
  'Poppins-Regular': Poppins_400Regular,
  'Poppins-Bold': Poppins_700Bold,
});

if (!fontsLoaded) {
  return <ActivityIndicator />;
}

<Stack.Screen 
  name="GameScreen" 
  component={GameScreen}
  options={{ 
    headerShown: false,
    animation: 'slide_from_bottom'
  }}
/> 
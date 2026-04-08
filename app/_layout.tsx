import { useEffect } from 'react';
import { View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../src/constants/theme';

// Disable native screens to avoid boolean/string type error
enableScreens(false);

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />
      <Slot />
    </View>
  );
}

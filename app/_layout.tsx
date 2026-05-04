import '@/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export default function RootLayout() {
  // These hooks hydrate the global store once the app starts.
  useAuth();
  useSubscription();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz" />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

import '@/global.css';

import { Component, ReactNode, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  reset = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-paper px-6">
          <Text className="text-center text-2xl font-black text-slate-950">
            Une erreur est survenue
          </Text>
          <Text className="text-center text-base leading-6 text-slate-600">
            Ferme puis relance l’application, ou réessaie dans quelques instants.
          </Text>
          <Pressable
            accessibilityLabel="Réessayer après l'erreur"
            accessibilityRole="button"
            className="rounded-lg bg-emerald-600 px-5 py-4"
            onPress={this.reset}
          >
            <Text className="text-base font-black text-white">Réessayer</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  // These hooks hydrate the global store once the app starts.
  const { isLoading } = useAuth();
  useSubscription();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootErrorBoundary>
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
      </RootErrorBoundary>
    </SafeAreaProvider>
  );
}

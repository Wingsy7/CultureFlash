import { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { errorMessage, isLoading, signInWithProvider, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  return (
    <SafeAreaView className="flex-1 justify-center bg-paper px-6">
      <View className="gap-8">
        <View className="gap-3">
          <Text className="text-5xl font-black text-slate-950">CultureFlash</Text>
          <Text className="text-lg leading-7 text-slate-600">
            Connecte-toi pour sauvegarder ton streak et retrouver tes stats sur tous
            tes appareils.
          </Text>
        </View>

        <View className="gap-3">
          <Pressable
            accessibilityLabel="Connexion avec Google"
            accessibilityRole="button"
            className="rounded-lg bg-slate-950 px-5 py-4"
            disabled={isLoading}
            onPress={() => void signInWithProvider('google')}
          >
            <Text className="text-center text-base font-black text-white">
              Continuer avec Google
            </Text>
          </Pressable>

          {Platform.OS === 'ios' ? (
            <Pressable
              accessibilityLabel="Connexion avec Apple"
              accessibilityRole="button"
              className="rounded-lg border border-slate-300 bg-white px-5 py-4"
              disabled={isLoading}
              onPress={() => void signInWithProvider('apple')}
            >
              <Text className="text-center text-base font-black text-slate-950">
                Continuer avec Apple
              </Text>
            </Pressable>
          ) : null}
        </View>

        {errorMessage ? (
          <Text className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

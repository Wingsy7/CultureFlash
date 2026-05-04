import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/hooks/useStreak';
import { useSubscription } from '@/hooks/useSubscription';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { streak } = useStreak();
  const { isPro } = useSubscription();
  const accuracy =
    streak.totalPlayed === 0
      ? 0
      : Math.round((streak.totalCorrect / streak.totalPlayed) * 100);

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-4">
        <View className="gap-1">
          <Text className="text-sm font-bold uppercase text-emerald-700">
            Profil
          </Text>
          <Text className="text-3xl font-black text-slate-950">
            {user?.username ?? 'Joueur'}
          </Text>
        </View>

        <View className="gap-3 rounded-lg bg-white p-5 shadow-sm shadow-slate-200">
          <Text className="text-base font-black text-slate-950">
            Statistiques
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[46%] flex-1 rounded-lg bg-slate-50 p-4">
              <Text className="text-xs font-bold uppercase text-slate-500">
                Record
              </Text>
              <Text className="mt-1 text-2xl font-black text-slate-950">
                {streak.longestStreak}
              </Text>
            </View>
            <View className="min-w-[46%] flex-1 rounded-lg bg-slate-50 p-4">
              <Text className="text-xs font-bold uppercase text-slate-500">
                Precision
              </Text>
              <Text className="mt-1 text-2xl font-black text-slate-950">
                {accuracy}%
              </Text>
            </View>
            <View className="min-w-[46%] flex-1 rounded-lg bg-slate-50 p-4">
              <Text className="text-xs font-bold uppercase text-slate-500">
                Jouees
              </Text>
              <Text className="mt-1 text-2xl font-black text-slate-950">
                {streak.totalPlayed}
              </Text>
            </View>
            <View className="min-w-[46%] flex-1 rounded-lg bg-slate-50 p-4">
              <Text className="text-xs font-bold uppercase text-slate-500">
                Statut
              </Text>
              <Text className="mt-1 text-2xl font-black text-slate-950">
                {isPro ? 'Pro' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {!isPro ? (
          <Pressable
            accessibilityLabel="Passer a Pro"
            accessibilityRole="button"
            className="rounded-lg bg-slate-950 px-5 py-4"
            onPress={() => router.push('/paywall')}
          >
            <Text className="text-center text-base font-black text-white">
              Passer a Pro
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityLabel="Se deconnecter"
          accessibilityRole="button"
          className="rounded-lg border border-slate-200 bg-white px-5 py-4"
          onPress={() => void signOut()}
        >
          <Text className="text-center text-base font-black text-slate-700">
            Se deconnecter
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

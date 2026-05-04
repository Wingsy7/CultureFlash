import { useEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationPrompt } from '@/components/NotificationPrompt';
import { StreakCard } from '@/components/StreakCard';
import { useStreak } from '@/hooks/useStreak';
import { useUserStore } from '@/store/userStore';

export default function HomeScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const authIsLoading = useUserStore((state) => state.authIsLoading);
  const {
    errorMessage,
    hasPlayedToday,
    isLoading,
    refreshStreak,
    streak,
    todayAnswer,
    weeklyStats,
  } = useStreak();

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/onboarding');
    }
  }, [authIsLoading, router, user]);

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-4"
        refreshControl={
          <RefreshControl onRefresh={refreshStreak} refreshing={isLoading} />
        }
      >
        <View className="gap-1">
          <Text className="text-sm font-bold uppercase text-emerald-700">
            Question quotidienne
          </Text>
          <Text className="text-3xl font-black text-slate-950">
            Bonjour{user?.username ? `, ${user.username}` : ''}
          </Text>
        </View>

        <StreakCard streak={streak} weeklyStats={weeklyStats} />

        {todayAnswer ? (
          <View className="gap-2 rounded-lg bg-white p-4 shadow-sm shadow-slate-200">
            <Text className="text-base font-black text-slate-950">
              Réponse du jour
            </Text>
            <Text className="text-sm leading-6 text-slate-600">
              {todayAnswer.isCorrect ? 'Bonne réponse.' : 'Bonne réponse attendue :'}{' '}
              {todayAnswer.correctAnswer}
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <Text className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          accessibilityLabel={hasPlayedToday ? 'Revenir demain' : 'Jouer au quiz'}
          accessibilityRole="button"
          className={`rounded-lg px-5 py-4 ${
            hasPlayedToday ? 'bg-slate-300' : 'bg-emerald-600'
          }`}
          disabled={hasPlayedToday}
          onPress={() => router.push('/quiz/question')}
        >
          <Text
            className={`text-center text-base font-black ${
              hasPlayedToday ? 'text-slate-600' : 'text-white'
            }`}
          >
            {hasPlayedToday ? 'Revenez demain !' : 'Jouer'}
          </Text>
        </Pressable>

        <NotificationPrompt
          currentStreak={streak.currentStreak}
          hasPlayedToday={hasPlayedToday}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types';

type LeaderboardRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_correct: number;
  total_played: number;
  accuracy: number | null;
};

const mapLeaderboardRow = (row: LeaderboardRow): LeaderboardEntry => ({
  id: row.id,
  username: row.username,
  avatarUrl: row.avatar_url,
  currentStreak: row.current_streak,
  longestStreak: row.longest_streak,
  totalCorrect: row.total_correct,
  totalPlayed: row.total_played,
  accuracy: row.accuracy,
});

export default function LeaderboardScreen() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async (): Promise<void> => {
    if (!isPro) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(
          'id,username,avatar_url,current_streak,longest_streak,total_correct,total_played,accuracy',
        )
        .limit(50);

      if (error) {
        throw error;
      }

      setEntries(((data ?? []) as LeaderboardRow[]).map(mapLeaderboardRow));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de charger le classement.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isPro]);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  if (!isPro) {
    return (
      <SafeAreaView className="flex-1 justify-center gap-5 bg-paper px-5">
        <View className="gap-3">
          <Text className="text-center text-3xl font-black text-slate-950">
            Classement Pro
          </Text>
          <Text className="text-center text-base leading-6 text-slate-600">
            Compare ton streak avec les meilleurs joueurs et suis ta progression en
            temps reel.
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Debloquer le classement Pro"
          accessibilityRole="button"
          className="rounded-lg bg-emerald-600 px-5 py-4"
          onPress={() => router.push('/paywall')}
        >
          <Text className="text-center text-base font-black text-white">
            Debloquer avec Pro
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="gap-4 px-5 pb-8 pt-4">
        <View className="gap-1">
          <Text className="text-sm font-bold uppercase text-emerald-700">
            Classement
          </Text>
          <Text className="text-3xl font-black text-slate-950">
            Meilleurs streaks
          </Text>
        </View>

        {isLoading ? <ActivityIndicator color="#059669" /> : null}

        {errorMessage ? (
          <Text className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </Text>
        ) : null}

        <View className="gap-3">
          {entries.map((entry, index) => (
            <View
              className="flex-row items-center gap-3 rounded-lg bg-white p-4 shadow-sm shadow-slate-200"
              key={entry.id}
            >
              <Text className="w-8 text-xl font-black text-emerald-700">
                {index + 1}
              </Text>
              <View className="flex-1">
                <Text className="text-base font-black text-slate-950">
                  {entry.username ?? 'Joueur'}
                </Text>
                <Text className="text-sm font-semibold text-slate-500">
                  {entry.totalCorrect}/{entry.totalPlayed} bonnes reponses
                </Text>
              </View>
              <Text className="text-lg font-black text-slate-950">
                {entry.currentStreak} j
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import type { Streak, WeeklyStats } from '@/types';

type StreakCardProps = {
  streak: Streak;
  weeklyStats: WeeklyStats;
};

const getMotivationMessage = (currentStreak: number): string => {
  if (currentStreak >= 30) {
    return 'Legende !';
  }

  if (currentStreak >= 7) {
    return 'Tu es en feu !';
  }

  if (currentStreak > 0) {
    return 'Continue sur ta lancee !';
  }

  return 'Commence ton aventure !';
};

export const StreakCard = memo(function StreakCard({
  streak,
  weeklyStats,
}: StreakCardProps) {
  const flameScale = useRef(new Animated.Value(1)).current;
  const pulseDuration = useMemo(
    () => Math.max(520, 1500 - Math.min(streak.currentStreak, 30) * 28),
    [streak.currentStreak],
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, {
          toValue: 1.12,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
        Animated.timing(flameScale, {
          toValue: 1,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [flameScale, pulseDuration]);

  const accuracy =
    streak.totalPlayed === 0
      ? 0
      : Math.round((streak.totalCorrect / streak.totalPlayed) * 100);

  return (
    <View className="gap-6 rounded-lg bg-white p-5 shadow-sm shadow-slate-200">
      <View className="items-center gap-2">
        <Animated.Text
          className="text-5xl"
          style={{ transform: [{ scale: flameScale }] }}
        >
          🔥
        </Animated.Text>
        <Text className="text-4xl font-black text-slate-950">
          {streak.currentStreak}
        </Text>
        <Text className="text-base font-semibold text-slate-600">
          jours de streak
        </Text>
        <Text className="text-lg font-bold text-emerald-700">
          {getMotivationMessage(streak.currentStreak)}
        </Text>
      </View>

      <ProgressBar weeklyStats={weeklyStats} />

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-lg bg-slate-50 p-3">
          <Text className="text-xs font-semibold uppercase text-slate-500">
            Parties
          </Text>
          <Text className="mt-1 text-2xl font-black text-slate-950">
            {streak.totalPlayed}
          </Text>
        </View>
        <View className="flex-1 rounded-lg bg-slate-50 p-3">
          <Text className="text-xs font-semibold uppercase text-slate-500">
            Precision
          </Text>
          <Text className="mt-1 text-2xl font-black text-slate-950">
            {accuracy}%
          </Text>
        </View>
      </View>
    </View>
  );
});

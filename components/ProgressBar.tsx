import { memo } from 'react';
import { Text, View } from 'react-native';

import type { WeeklyStats } from '@/types';

type ProgressBarProps = {
  weeklyStats: WeeklyStats;
};

const statusClasses = {
  correct: 'bg-emerald-500',
  wrong: 'bg-rose-500',
  empty: 'bg-slate-200',
};

const formatDay = (dateKey: string): string => {
  const [, month, day] = dateKey.split('-');

  return `${day}/${month}`;
};

export const ProgressBar = memo(function ProgressBar({ weeklyStats }: ProgressBarProps) {
  return (
    <View className="gap-3">
      <View className="flex-row justify-between gap-2">
        {weeklyStats.map((stat) => {
          const status =
            stat.isCorrect === null ? 'empty' : stat.isCorrect ? 'correct' : 'wrong';

          return (
            <View className="items-center gap-2" key={stat.date}>
              <View
                accessibilityLabel={`Jour ${formatDay(stat.date)}`}
                className={`h-8 w-8 rounded-full ${statusClasses[status]}`}
              />
              <Text className="text-xs font-medium text-slate-500">
                {formatDay(stat.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

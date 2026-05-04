import { memo, useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { scheduleDailyQuestionReminder } from '@/lib/notifications';

type NotificationPromptProps = {
  currentStreak: number;
  hasPlayedToday: boolean;
  compact?: boolean;
};

const NOTIFICATION_TIME_KEY = 'cultureflash-notification-time';
const notificationTimes = [
  { label: '08:00', hour: 8, minute: 0 },
  { label: '12:30', hour: 12, minute: 30 },
  { label: '19:00', hour: 19, minute: 0 },
];

export const NotificationPrompt = memo(function NotificationPrompt({
  currentStreak,
  hasPlayedToday,
  compact = false,
}: NotificationPromptProps) {
  const [selectedLabel, setSelectedLabel] = useState('08:00');
  const [message, setMessage] = useState<string | null>(null);

  const scheduleReminder = useCallback(
    async (time: (typeof notificationTimes)[number]): Promise<void> => {
      setSelectedLabel(time.label);
      setMessage(null);

      try {
        await SecureStore.setItemAsync(NOTIFICATION_TIME_KEY, time.label);
        await scheduleDailyQuestionReminder({
          hour: time.hour,
          minute: time.minute,
          currentStreak,
          hasPlayedToday,
        });
        setMessage('Rappel configure.');
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Impossible de programmer le rappel.',
        );
      }
    },
    [currentStreak, hasPlayedToday],
  );

  return (
    <View className={`gap-3 rounded-lg bg-white p-4 ${compact ? '' : 'shadow-sm'}`}>
      <View>
        <Text className="text-base font-black text-slate-950">
          Choisis ton heure
        </Text>
        <Text className="mt-1 text-sm text-slate-500">
          Un rappel quotidien pour proteger ton streak.
        </Text>
      </View>

      <View className="flex-row gap-2">
        {notificationTimes.map((time) => {
          const isSelected = selectedLabel === time.label;

          return (
            <Pressable
              accessibilityLabel={`Programmer le rappel a ${time.label}`}
              accessibilityRole="button"
              className={`flex-1 rounded-lg border px-3 py-3 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
              key={time.label}
              onPress={() => void scheduleReminder(time)}
            >
              <Text
                className={`text-center text-sm font-black ${
                  isSelected ? 'text-emerald-700' : 'text-slate-600'
                }`}
              >
                {time.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {message ? <Text className="text-sm font-semibold text-slate-500">{message}</Text> : null}
    </View>
  );
});

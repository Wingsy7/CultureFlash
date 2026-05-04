import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

type DailyReminderOptions = {
  hour: number;
  minute: number;
  currentStreak: number;
  hasPlayedToday: boolean;
};

const reminderBodies = (currentStreak: number): string[] => [
  `Ne perds pas ton streak de ${currentStreak} jours !`,
  'Une nouvelle question t’attend. Tu vas trouver ?',
  `${currentStreak} jours de streak ! Continue sur ta lancée.`,
];

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.granted) {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  return requestedPermissions.granted;
};

export const scheduleDailyQuestionReminder = async ({
  hour,
  minute,
  currentStreak,
  hasPlayedToday,
}: DailyReminderOptions): Promise<string | null> => {
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission || hasPlayedToday) {
    return null;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const bodies = reminderBodies(currentStreak);
  const body = bodies[Math.floor(Math.random() * bodies.length)];

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Ta question du jour t’attend !',
      body,
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

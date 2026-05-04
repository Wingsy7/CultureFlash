import { create } from 'zustand';

import type {
  DailyAnswer,
  Streak,
  SubscriptionStatus,
  User,
  WeeklyStats,
} from '@/types';

type UserStoreState = {
  user: User | null;
  streak: Streak | null;
  weeklyStats: WeeklyStats;
  todayAnswer: DailyAnswer | null;
  subscriptionStatus: SubscriptionStatus;
  setUser: (user: User | null) => void;
  setStreak: (streak: Streak | null) => void;
  setWeeklyStats: (weeklyStats: WeeklyStats) => void;
  setTodayAnswer: (answer: DailyAnswer | null) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  resetUserState: () => void;
};

export const initialStreak: Streak = {
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedAt: null,
  totalPlayed: 0,
  totalCorrect: 0,
};

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  streak: null,
  weeklyStats: [],
  todayAnswer: null,
  subscriptionStatus: 'free',
  setUser: (user) => set({ user }),
  setStreak: (streak) => set({ streak }),
  setWeeklyStats: (weeklyStats) => set({ weeklyStats }),
  setTodayAnswer: (todayAnswer) => set({ todayAnswer }),
  setSubscriptionStatus: (subscriptionStatus) => set({ subscriptionStatus }),
  resetUserState: () =>
    set({
      user: null,
      streak: null,
      weeklyStats: [],
      todayAnswer: null,
      subscriptionStatus: 'free',
    }),
}));

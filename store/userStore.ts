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
  authIsLoading: boolean;
  streak: Streak | null;
  weeklyStats: WeeklyStats;
  todayAnswer: DailyAnswer | null;
  subscriptionStatus: SubscriptionStatus;
  setUser: (user: User | null) => void;
  setAuthIsLoading: (isLoading: boolean) => void;
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
  authIsLoading: true,
  streak: null,
  weeklyStats: [],
  todayAnswer: null,
  subscriptionStatus: 'free',
  setUser: (user) => set({ user }),
  setAuthIsLoading: (authIsLoading) => set({ authIsLoading }),
  setStreak: (streak) => set({ streak }),
  setWeeklyStats: (weeklyStats) => set({ weeklyStats }),
  setTodayAnswer: (todayAnswer) => set({ todayAnswer }),
  setSubscriptionStatus: (subscriptionStatus) => set({ subscriptionStatus }),
  resetUserState: () =>
    set({
      user: null,
      authIsLoading: false,
      streak: null,
      weeklyStats: [],
      todayAnswer: null,
      subscriptionStatus: 'free',
    }),
}));

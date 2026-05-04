import { useCallback, useEffect, useMemo, useState } from 'react';

import { getLocalDateKey, shiftLocalDateKey } from '@/lib/trivia';
import { supabase } from '@/lib/supabase';
import { initialStreak, useUserStore } from '@/store/userStore';
import type { DailyAnswer, Streak, TriviaQuestion, WeeklyStats } from '@/types';

type StreakRow = {
  current_streak: number;
  longest_streak: number;
  last_played_at: string | null;
  total_played: number;
  total_correct: number;
};

type DailyAnswerRow = {
  question_id: string;
  question_text: string;
  chosen_answer: string;
  correct_answer: string;
  is_correct: boolean;
  category: string | null;
  played_at: string;
};

type WeeklyAnswerRow = {
  played_at: string;
  is_correct: boolean;
};

type RecordAnswerInput = {
  question: TriviaQuestion;
  chosenAnswer: string;
};

type UseStreakResult = {
  streak: Streak;
  weeklyStats: WeeklyStats;
  todayAnswer: DailyAnswer | null;
  hasPlayedToday: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  refreshStreak: () => Promise<void>;
  recordAnswer: (input: RecordAnswerInput) => Promise<DailyAnswer>;
};

const mapStreakRow = (row: StreakRow): Streak => ({
  currentStreak: row.current_streak,
  longestStreak: row.longest_streak,
  lastPlayedAt: row.last_played_at,
  totalPlayed: row.total_played,
  totalCorrect: row.total_correct,
});

const mapDailyAnswerRow = (row: DailyAnswerRow): DailyAnswer => ({
  questionId: row.question_id,
  questionText: row.question_text,
  chosenAnswer: row.chosen_answer,
  correctAnswer: row.correct_answer,
  isCorrect: row.is_correct,
  category: row.category ?? 'Culture generale',
  playedAt: row.played_at,
});

const normalizeStreakForToday = (streak: Streak, today: string): Streak => {
  if (!streak.lastPlayedAt) {
    return streak;
  }

  const yesterday = shiftLocalDateKey(today, -1);

  if (streak.lastPlayedAt === today || streak.lastPlayedAt === yesterday) {
    return streak;
  }

  return {
    ...streak,
    currentStreak: 0,
  };
};

const buildWeeklyStats = (
  today: string,
  rows: readonly WeeklyAnswerRow[],
): WeeklyStats => {
  const answerByDate = new Map(rows.map((row) => [row.played_at, row.is_correct]));

  return Array.from({ length: 7 }, (_item, index) => {
    const date = shiftLocalDateKey(today, index - 6);

    return {
      date,
      isCorrect: answerByDate.get(date) ?? null,
    };
  });
};

export const useStreak = (): UseStreakResult => {
  const user = useUserStore((state) => state.user);
  const storeStreak = useUserStore((state) => state.streak);
  const weeklyStats = useUserStore((state) => state.weeklyStats);
  const todayAnswer = useUserStore((state) => state.todayAnswer);
  const setStreak = useUserStore((state) => state.setStreak);
  const setWeeklyStats = useUserStore((state) => state.setWeeklyStats);
  const setTodayAnswer = useUserStore((state) => state.setTodayAnswer);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const streak = useMemo(() => storeStreak ?? initialStreak, [storeStreak]);
  const today = getLocalDateKey();
  const hasPlayedToday = Boolean(todayAnswer) || streak.lastPlayedAt === today;

  const loadStreakRow = useCallback(async (userId: string): Promise<StreakRow> => {
    const { data, error } = await supabase
      .from('streaks')
      .select(
        'current_streak,longest_streak,last_played_at,total_played,total_correct',
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as StreakRow;
    }

    const { error: insertError } = await supabase.from('streaks').upsert(
      {
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        total_played: 0,
        total_correct: 0,
      },
      { ignoreDuplicates: true, onConflict: 'user_id' },
    );

    if (insertError) {
      throw insertError;
    }

    const { data: insertedRow, error: readAfterInsertError } = await supabase
      .from('streaks')
      .select(
        'current_streak,longest_streak,last_played_at,total_played,total_correct',
      )
      .eq('user_id', userId)
      .single();

    if (readAfterInsertError) {
      throw readAfterInsertError;
    }

    return insertedRow as StreakRow;
  }, []);

  const refreshStreak = useCallback(async (): Promise<void> => {
    if (!user) {
      setStreak(null);
      setWeeklyStats([]);
      setTodayAnswer(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const localToday = getLocalDateKey();
      const weekStart = shiftLocalDateKey(localToday, -6);
      const streakRow = await loadStreakRow(user.id);
      const normalizedStreak = normalizeStreakForToday(
        mapStreakRow(streakRow),
        localToday,
      );

      setStreak(normalizedStreak);

      if (normalizedStreak.currentStreak !== streakRow.current_streak) {
        await supabase
          .from('streaks')
          .update({ current_streak: normalizedStreak.currentStreak })
          .eq('user_id', user.id);
      }

      const { data: answerRow, error: answerError } = await supabase
        .from('daily_answers')
        .select(
          'question_id,question_text,chosen_answer,correct_answer,is_correct,category,played_at',
        )
        .eq('user_id', user.id)
        .eq('played_at', localToday)
        .maybeSingle();

      if (answerError) {
        throw answerError;
      }

      setTodayAnswer(answerRow ? mapDailyAnswerRow(answerRow as DailyAnswerRow) : null);

      const { data: weekRows, error: weekError } = await supabase
        .from('daily_answers')
        .select('played_at,is_correct')
        .eq('user_id', user.id)
        .gte('played_at', weekStart)
        .lte('played_at', localToday);

      if (weekError) {
        throw weekError;
      }

      setWeeklyStats(buildWeeklyStats(localToday, (weekRows ?? []) as WeeklyAnswerRow[]));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Impossible de charger le streak.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadStreakRow, setStreak, setTodayAnswer, setWeeklyStats, user]);

  const recordAnswer = useCallback(
    async ({ question, chosenAnswer }: RecordAnswerInput): Promise<DailyAnswer> => {
      if (!user) {
        throw new Error('Tu dois etre connecte pour jouer.');
      }

      const localToday = getLocalDateKey();

      if (todayAnswer?.playedAt === localToday) {
        return todayAnswer;
      }

      const isCorrect = chosenAnswer === question.correctAnswer;
      const yesterday = shiftLocalDateKey(localToday, -1);
      const baseStreak = normalizeStreakForToday(streak, localToday);
      const nextCurrentStreak =
        baseStreak.lastPlayedAt === localToday
          ? baseStreak.currentStreak
          : baseStreak.lastPlayedAt === yesterday
            ? baseStreak.currentStreak + 1
            : 1;
      const nextStreak: Streak = {
        currentStreak: nextCurrentStreak,
        longestStreak: Math.max(baseStreak.longestStreak, nextCurrentStreak),
        lastPlayedAt: localToday,
        totalPlayed: baseStreak.totalPlayed + 1,
        totalCorrect: baseStreak.totalCorrect + (isCorrect ? 1 : 0),
      };
      const answer: DailyAnswer = {
        questionId: question.id,
        questionText: question.question,
        chosenAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        category: question.category,
        playedAt: localToday,
      };

      setStreak(nextStreak);
      setTodayAnswer(answer);
      setWeeklyStats(buildWeeklyStats(localToday, [
        ...weeklyStats
          .filter((stat) => stat.isCorrect !== null)
          .map((stat) => ({
            played_at: stat.date,
            is_correct: Boolean(stat.isCorrect),
          })),
        { played_at: localToday, is_correct: isCorrect },
      ]));

      try {
        await loadStreakRow(user.id);

        const { error: answerError } = await supabase.from('daily_answers').insert({
          user_id: user.id,
          question_id: answer.questionId,
          question_text: answer.questionText,
          chosen_answer: answer.chosenAnswer,
          correct_answer: answer.correctAnswer,
          is_correct: answer.isCorrect,
          category: answer.category,
          played_at: answer.playedAt,
        });

        if (answerError) {
          throw answerError;
        }

        const { error: streakError } = await supabase
          .from('streaks')
          .update({
            current_streak: nextStreak.currentStreak,
            longest_streak: nextStreak.longestStreak,
            last_played_at: localToday,
            total_played: nextStreak.totalPlayed,
            total_correct: nextStreak.totalCorrect,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (streakError) {
          throw streakError;
        }
      } catch (error) {
        void refreshStreak();
        throw error instanceof Error
          ? error
          : new Error('Impossible d’enregistrer ta reponse.');
      }

      return answer;
    },
    [
      loadStreakRow,
      refreshStreak,
      setStreak,
      setTodayAnswer,
      setWeeklyStats,
      streak,
      todayAnswer,
      user,
      weeklyStats,
    ],
  );

  useEffect(() => {
    void refreshStreak();
  }, [refreshStreak]);

  return {
    streak,
    weeklyStats,
    todayAnswer,
    hasPlayedToday,
    isLoading,
    errorMessage,
    refreshStreak,
    recordAnswer,
  };
};

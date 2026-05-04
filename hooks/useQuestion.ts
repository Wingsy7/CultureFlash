import { useCallback, useEffect, useState } from 'react';

import { getDailyQuestion } from '@/lib/trivia';
import type { TriviaQuestion } from '@/types';

type UseQuestionResult = {
  question: TriviaQuestion | null;
  isLoading: boolean;
  errorMessage: string | null;
  refreshQuestion: () => Promise<void>;
};

export const useQuestion = (): UseQuestionResult => {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshQuestion = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const dailyQuestion = await getDailyQuestion();
      setQuestion(dailyQuestion);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Impossible de charger la question du jour.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshQuestion();
  }, [refreshQuestion]);

  return {
    question,
    isLoading,
    errorMessage,
    refreshQuestion,
  };
};

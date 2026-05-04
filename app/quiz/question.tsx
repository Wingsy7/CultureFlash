import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestionCard } from '@/components/QuestionCard';
import { useQuestion } from '@/hooks/useQuestion';
import { useStreak } from '@/hooks/useStreak';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserStore } from '@/store/userStore';

const PRO_TIMER_SECONDS = 30;

export default function QuestionScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { question, isLoading, errorMessage, refreshQuestion } = useQuestion();
  const { hasPlayedToday, recordAnswer } = useStreak();
  const { isPro } = useSubscription();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PRO_TIMER_SECONDS);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [router, user]);

  useEffect(() => {
    if (!isPro || selectedAnswer || hasPlayedToday || hasTimedOut) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [hasPlayedToday, hasTimedOut, isPro, selectedAnswer]);

  useEffect(() => {
    if (isPro && !selectedAnswer && timeLeft === 0) {
      setHasTimedOut(true);
      setSubmitError('Temps écoulé ! Reviens demain pour une nouvelle question.');
    }
  }, [isPro, selectedAnswer, timeLeft]);

  const handleSelectAnswer = useCallback(
    async (answer: string): Promise<void> => {
      if (!question || selectedAnswer || hasPlayedToday || hasTimedOut) {
        return;
      }

      setSelectedAnswer(answer);
      setSubmitError(null);

      try {
        const savedAnswer = await recordAnswer({ question, chosenAnswer: answer });

        setTimeout(() => {
          router.replace({
            pathname: '/quiz/resultat',
            params: {
              questionId: savedAnswer.questionId,
              questionText: savedAnswer.questionText,
              chosenAnswer: savedAnswer.chosenAnswer,
              correctAnswer: savedAnswer.correctAnswer,
              isCorrect: String(savedAnswer.isCorrect),
              category: savedAnswer.category,
            },
          });
        }, 1500);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Impossible d’enregistrer ta réponse.',
        );
      }
    },
    [
      hasPlayedToday,
      hasTimedOut,
      question,
      recordAnswer,
      router,
      selectedAnswer,
    ],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator color="#059669" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper px-5 py-4">
      <View className="flex-1 gap-5">
        {isPro ? (
          <View className="h-3 overflow-hidden rounded-full bg-slate-200">
            <View
              className="h-full bg-emerald-500"
              style={{ width: `${(timeLeft / PRO_TIMER_SECONDS) * 100}%` }}
            />
          </View>
        ) : null}

        {question ? (
          <QuestionCard
            disabled={Boolean(selectedAnswer) || hasPlayedToday || hasTimedOut}
            onSelectAnswer={(answer) => void handleSelectAnswer(answer)}
            question={question}
            selectedAnswer={selectedAnswer}
          />
        ) : (
          <View className="gap-3 rounded-lg bg-white p-5">
            <Text className="text-lg font-black text-slate-950">
              Question indisponible
            </Text>
            <Text className="text-sm text-slate-600">
              {errorMessage ?? 'Réessaie dans quelques instants.'}
            </Text>
            <Pressable
              accessibilityLabel="Recharger la question"
              accessibilityRole="button"
              className="rounded-lg bg-emerald-600 px-4 py-3"
              onPress={() => void refreshQuestion()}
            >
              <Text className="text-center font-black text-white">Recharger</Text>
            </Pressable>
          </View>
        )}

        {submitError ? (
          <Text className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {submitError}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

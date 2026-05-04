import { memo, useCallback } from 'react';
import { Text, View } from 'react-native';

import { AnswerButton } from '@/components/AnswerButton';
import type { AnswerState, TriviaQuestion } from '@/types';

type QuestionCardProps = {
  question: TriviaQuestion;
  selectedAnswer: string | null;
  disabled: boolean;
  onSelectAnswer: (answer: string) => void;
};

const difficultyClasses: Record<TriviaQuestion['difficulty'], string> = {
  easy: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-rose-100 text-rose-800',
};

const getAnswerState = (
  answer: string,
  selectedAnswer: string | null,
  correctAnswer: string,
): AnswerState => {
  if (!selectedAnswer) {
    return 'idle';
  }

  if (answer === correctAnswer) {
    return answer === selectedAnswer ? 'correct' : 'missed';
  }

  return answer === selectedAnswer ? 'wrong' : 'idle';
};

export const QuestionCard = memo(function QuestionCard({
  question,
  selectedAnswer,
  disabled,
  onSelectAnswer,
}: QuestionCardProps) {
  const renderAnswer = useCallback(
    (answer: string) => (
      <AnswerButton
        disabled={disabled}
        key={answer}
        onPress={() => onSelectAnswer(answer)}
        state={getAnswerState(answer, selectedAnswer, question.correctAnswer)}
        text={answer}
      />
    ),
    [disabled, onSelectAnswer, question.correctAnswer, selectedAnswer],
  );

  return (
    <View className="gap-6 rounded-lg bg-white p-5 shadow-sm shadow-slate-200">
      <View className="flex-row flex-wrap gap-2">
        <Text className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {question.category}
        </Text>
        <Text
          className={`rounded-full px-3 py-1 text-xs font-bold ${difficultyClasses[question.difficulty]}`}
        >
          {question.difficulty.toUpperCase()}
        </Text>
      </View>

      <Text className="text-center text-2xl font-black leading-8 text-slate-950">
        {question.question}
      </Text>

      <View className="gap-3">{question.allAnswers.map(renderAnswer)}</View>
    </View>
  );
});

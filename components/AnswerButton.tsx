import { memo } from 'react';
import { Pressable, Text } from 'react-native';

import type { AnswerState } from '@/types';

export type AnswerButtonProps = {
  text: string;
  state: AnswerState;
  onPress: () => void;
  disabled: boolean;
};

const containerClasses: Record<AnswerState, string> = {
  idle: 'border-slate-200 bg-white',
  correct: 'border-emerald-500 bg-emerald-50',
  wrong: 'border-rose-500 bg-rose-50',
  missed: 'border-emerald-400 bg-emerald-50 opacity-80',
};

const textClasses: Record<AnswerState, string> = {
  idle: 'text-slate-900',
  correct: 'text-emerald-800',
  wrong: 'text-rose-800',
  missed: 'text-emerald-700',
};

export const AnswerButton = memo(function AnswerButton({
  text,
  state,
  onPress,
  disabled,
}: AnswerButtonProps) {
  return (
    <Pressable
      accessibilityLabel={`Reponse: ${text}`}
      accessibilityRole="button"
      className={`min-h-14 justify-center rounded-lg border px-4 py-3 ${containerClasses[state]} ${
        disabled ? 'opacity-90' : 'active:scale-[0.99]'
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={`text-base font-semibold ${textClasses[state]}`}>{text}</Text>
    </Pressable>
  );
});

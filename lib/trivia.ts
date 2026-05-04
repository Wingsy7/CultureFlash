import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'he';

import type { TriviaQuestion } from '@/types';

const DAILY_QUESTION_CACHE_KEY = '@cultureflash/daily-question';
const OPEN_TRIVIA_URL = 'https://opentdb.com/api.php?amount=1&type=multiple';

type OpenTriviaQuestion = {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type OpenTriviaResponse = {
  response_code: number;
  results: OpenTriviaQuestion[];
};

type CachedDailyQuestion = {
  date: string;
  question: TriviaQuestion;
};

export const getLocalDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const shiftLocalDateKey = (dateKey: string, days: number): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  localDate.setDate(localDate.getDate() + days);

  return getLocalDateKey(localDate);
};

const createQuestionId = (question: string, dateKey: string): string => {
  let hash = 0;

  for (let index = 0; index < question.length; index += 1) {
    hash = (hash * 31 + question.charCodeAt(index)) | 0;
  }

  return `${dateKey}-${Math.abs(hash).toString(36)}`;
};

const shuffle = <T>(items: readonly T[]): T[] => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
};

const isTriviaQuestion = (value: unknown): value is TriviaQuestion => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<TriviaQuestion>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.question === 'string' &&
    typeof candidate.correctAnswer === 'string' &&
    Array.isArray(candidate.incorrectAnswers) &&
    Array.isArray(candidate.allAnswers)
  );
};

const isCachedDailyQuestion = (value: unknown): value is CachedDailyQuestion => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CachedDailyQuestion>;

  return typeof candidate.date === 'string' && isTriviaQuestion(candidate.question);
};

const readCachedQuestion = async (): Promise<CachedDailyQuestion | null> => {
  const rawCache = await AsyncStorage.getItem(DAILY_QUESTION_CACHE_KEY);

  if (!rawCache) {
    return null;
  }

  const parsed: unknown = JSON.parse(rawCache);

  return isCachedDailyQuestion(parsed) ? parsed : null;
};

const writeCachedQuestion = async (cache: CachedDailyQuestion): Promise<void> => {
  await AsyncStorage.setItem(DAILY_QUESTION_CACHE_KEY, JSON.stringify(cache));
};

const mapOpenTriviaQuestion = (
  rawQuestion: OpenTriviaQuestion,
  dateKey: string,
): TriviaQuestion => {
  const question = decode(rawQuestion.question);
  const correctAnswer = decode(rawQuestion.correct_answer);
  const incorrectAnswers = rawQuestion.incorrect_answers.map((answer) => decode(answer));
  const allAnswers = shuffle([correctAnswer, ...incorrectAnswers]);

  return {
    id: createQuestionId(question, dateKey),
    category: decode(rawQuestion.category),
    type: rawQuestion.type,
    difficulty: rawQuestion.difficulty,
    question,
    correctAnswer,
    incorrectAnswers,
    allAnswers,
  };
};

export const getDailyQuestion = async (): Promise<TriviaQuestion> => {
  const today = getLocalDateKey();
  const cachedQuestion = await readCachedQuestion();

  if (cachedQuestion?.date === today) {
    return cachedQuestion.question;
  }

  try {
    const response = await fetch(OPEN_TRIVIA_URL);

    if (!response.ok) {
      throw new Error('Impossible de récupérer la question du jour.');
    }

    const payload = (await response.json()) as OpenTriviaResponse;
    const [rawQuestion] = payload.results;

    if (payload.response_code !== 0 || !rawQuestion) {
      throw new Error('Open Trivia DB n’a pas retourné de question valide.');
    }

    const question = mapOpenTriviaQuestion(rawQuestion, today);
    await writeCachedQuestion({ date: today, question });

    return question;
  } catch (error) {
    if (cachedQuestion) {
      return cachedQuestion.question;
    }

    throw error instanceof Error
      ? error
      : new Error('Une erreur inconnue est survenue avec Open Trivia DB.');
  }
};

export type User = {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
};

export type Streak = {
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: string | null;
  totalPlayed: number;
  totalCorrect: number;
};

export type TriviaQuestion = {
  id: string;
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  allAnswers: string[];
};

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'missed';

export type DailyAnswer = {
  questionId: string;
  questionText: string;
  chosenAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: string;
  playedAt: string;
};

export type SubscriptionStatus = 'free' | 'pro';

export type LeaderboardEntry = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  currentStreak: number;
  longestStreak: number;
  totalCorrect: number;
  totalPlayed: number;
  accuracy: number | null;
};

export type QuizResult = {
  questionId: string;
  questionText: string;
  chosenAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: string;
  currentStreak: number;
};

// A null value means the user did not play on that date.
export type WeeklyStats = {
  date: string;
  isCorrect: boolean | null;
}[];

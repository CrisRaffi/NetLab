import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizResult {
  quizId: string;
  bestScore: number;
  total: number;
  attempts: number;
  lastScore: number;
  completedAt: string;
}

interface QuizState {
  results: Record<string, QuizResult>;
  recordResult: (quizId: string, score: number, total: number) => void;
  getResult: (quizId: string) => QuizResult | undefined;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      results: {},

      recordResult: (quizId, score, total) =>
        set((state) => {
          const prev = state.results[quizId];
          return {
            results: {
              ...state.results,
              [quizId]: {
                quizId,
                bestScore: prev ? Math.max(prev.bestScore, score) : score,
                total,
                attempts: (prev?.attempts ?? 0) + 1,
                lastScore: score,
                completedAt: new Date().toISOString(),
              },
            },
          };
        }),

      getResult: (quizId) => get().results[quizId],
    }),
    { name: 'netlab-quizzes' },
  ),
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StudyCategory =
  | 'subnetting'
  | 'roteamento'
  | 'ipv6'
  | 'switching'
  | 'seguranca'
  | 'outro'
  | 'matematica'
  | 'programacao';

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  goalSeconds?: number;
  completed: boolean;
  note?: string;
  category?: StudyCategory;
}

export interface StudyAreaState {
  isRunning: boolean;
  elapsedSeconds: number;
  goalSeconds: number;
  weeklyGoalSeconds: number;
  sessions: StudySession[];
  currentCategory?: StudyCategory;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setGoal: (minutes: number) => void;
  setWeeklyGoal: (minutes: number) => void;
  setCategory: (category?: StudyCategory) => void;
  completeSession: (durationSeconds: number, note?: string, category?: StudyCategory) => void;
  updateSession: (sessionId: string, updates: Partial<StudySession>) => void;
  clearSessions: () => void;
}

const SESSION_KEY = 'netlab:study-area';
const DEFAULT_GOAL_SECONDS = 50 * 60;
const DEFAULT_WEEKLY_GOAL_SECONDS = 5 * 60 * 60;

const CATEGORY_LABELS: Record<StudyCategory, string> = {
  subnetting: 'Subnetting',
  roteamento: 'Roteamento',
  ipv6: 'IPv6',
  switching: 'Switching',
  seguranca: 'Segurança',
  outro: 'Outro',
  matematica: 'Matemática',
  programacao: 'Programação',
};

const CATEGORY_COLORS: Record<StudyCategory, string> = {
  subnetting: '#6366F1',
  roteamento: '#10B981',
  ipv6: '#3B82F6',
  switching: '#8B5CF6',
  seguranca: '#EF4444',
  outro: '#94A3B8',
  matematica: '#F59E0B',
  programacao: '#EC4899',
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useStudyAreaStore = create<StudyAreaState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      elapsedSeconds: 0,
      goalSeconds: DEFAULT_GOAL_SECONDS,
      weeklyGoalSeconds: DEFAULT_WEEKLY_GOAL_SECONDS,
      sessions: [],
      currentCategory: undefined,

      startTimer: () => {
        set({ isRunning: true });
      },

      pauseTimer: () => {
        set({ isRunning: false });
      },

      resetTimer: () => {
        set({ isRunning: false, elapsedSeconds: 0 });
      },

      tick: () => {
        set({ elapsedSeconds: get().elapsedSeconds + 1 });
      },

      setGoal: (minutes: number) => {
        set({ goalSeconds: Math.max(1, minutes) * 60 });
      },

      setWeeklyGoal: (minutes: number) => {
        set({ weeklyGoalSeconds: Math.max(1, minutes) * 60 });
      },

      setCategory: (category?: StudyCategory) => {
        set({ currentCategory: category });
      },

      completeSession: (durationSeconds: number, note?: string, category?: StudyCategory) => {
        const state = get();
        const session: StudySession = {
          id: newId(),
          startedAt: nowIso(),
          endedAt: nowIso(),
          durationSeconds: Math.max(0, durationSeconds),
          goalSeconds: state.goalSeconds,
          completed: state.goalSeconds > 0 && durationSeconds >= state.goalSeconds,
          ...(note ? { note } : {}),
          ...(category ? { category } : {}),
        };
        set({
          sessions: [session, ...state.sessions].slice(0, 200),
          isRunning: false,
          elapsedSeconds: 0,
          currentCategory: undefined,
        });
      },

      updateSession: (sessionId: string, updates: Partial<StudySession>) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
          ),
        }));
      },

      clearSessions: () => {
        set({ sessions: [] });
      },
    }),
    {
      name: SESSION_KEY,
      partialize: (state) => ({
        sessions: state.sessions,
        goalSeconds: state.goalSeconds,
        weeklyGoalSeconds: state.weeklyGoalSeconds,
        isRunning: state.isRunning,
        elapsedSeconds: state.elapsedSeconds,
      }),
    },
  ),
);

export { CATEGORY_LABELS };

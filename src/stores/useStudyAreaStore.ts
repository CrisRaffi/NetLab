import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  goalSeconds?: number;
  completed: boolean;
  note?: string;
}

export interface StudyAreaState {
  isRunning: boolean;
  elapsedSeconds: number;
  goalSeconds: number;
  sessions: StudySession[];

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setGoal: (minutes: number) => void;
  completeSession: (note?: string) => void;
  clearSessions: () => void;
}

const SESSION_KEY = 'netlab:study-area';
const DEFAULT_GOAL_SECONDS = 50 * 60;

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
      sessions: [],

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

      completeSession: (note?: string) => {
        const state = get();
        const duration = state.elapsedSeconds;
        const session: StudySession = {
          id: newId(),
          startedAt: nowIso(),
          endedAt: nowIso(),
          durationSeconds: Math.max(0, duration),
          goalSeconds: state.goalSeconds,
          completed: state.goalSeconds > 0 && duration >= state.goalSeconds,
          ...(note ? { note } : {}),
        };
        set({
          sessions: [session, ...state.sessions].slice(0, 200),
          isRunning: false,
          elapsedSeconds: 0,
        });
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
        isRunning: state.isRunning,
        elapsedSeconds: state.elapsedSeconds,
      }),
    },
  ),
);

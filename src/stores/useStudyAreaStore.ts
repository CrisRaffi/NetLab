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
  startedAt?: number;
  sessions: StudySession[];
  intervalRef: ReturnType<typeof setInterval> | null;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
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
      startedAt: undefined,
      sessions: [],
      intervalRef: null,

      startTimer: () => {
        const state = get();
        const now = Date.now();
        if (state.intervalRef) clearInterval(state.intervalRef);
        const ref = setInterval(() => {
          const s = get();
          if (!s.isRunning) return;
          set({ elapsedSeconds: s.elapsedSeconds + 1 });
        }, 1000);
        set({
          isRunning: true,
          startedAt: now,
          intervalRef: ref,
        });
      },

      pauseTimer: () => {
        const state = get();
        if (!state.isRunning) return;
        const now = Date.now();
        const running = state.startedAt ? Math.floor((now - state.startedAt) / 1000) : 0;
        if (state.intervalRef) clearInterval(state.intervalRef);
        set({
          isRunning: false,
          elapsedSeconds: state.elapsedSeconds + running,
          startedAt: undefined,
          intervalRef: null,
        });
      },

      resetTimer: () => {
        const state = get();
        if (state.intervalRef) clearInterval(state.intervalRef);
        set({
          isRunning: false,
          elapsedSeconds: 0,
          startedAt: undefined,
          intervalRef: null,
        });
      },

      setGoal: (minutes: number) => {
        set({ goalSeconds: Math.max(1, minutes) * 60 });
      },

      completeSession: (note?: string) => {
        const state = get();
        const now = Date.now();
        const running = state.startedAt ? Math.floor((now - state.startedAt) / 1000) : 0;
        const duration = state.elapsedSeconds + running;
        if (state.intervalRef) clearInterval(state.intervalRef);
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
          startedAt: undefined,
          intervalRef: null,
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
        startedAt: state.startedAt,
      }),
    },
  ),
);

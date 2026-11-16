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
  lastTick: number;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: (now: number) => void;
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
      lastTick: Date.now(),

      startTimer: () => {
        const state = get();
        if (state.isRunning) return;
        set({ isRunning: true, lastTick: Date.now() });
      },

      pauseTimer: () => {
        const state = get();
        if (!state.isRunning) return;
        const now = Date.now();
        const elapsed = state.elapsedSeconds + Math.floor((now - state.lastTick) / 1000);
        set({ isRunning: false, elapsedSeconds: elapsed, lastTick: now });
      },

      resetTimer: () => {
        set({ isRunning: false, elapsedSeconds: 0, lastTick: Date.now() });
      },

      tick: (now: number) => {
        const state = get();
        if (!state.isRunning) return;
        const elapsed = state.elapsedSeconds + Math.floor((now - state.lastTick) / 1000);
        set({ elapsedSeconds: elapsed, lastTick: now });
      },

      setGoal: (minutes: number) => {
        set({ goalSeconds: Math.max(1, minutes) * 60 });
      },

      completeSession: (note?: string) => {
        const state = get();
        const now = Date.now();
        const elapsed = state.isRunning
          ? state.elapsedSeconds + Math.floor((now - state.lastTick) / 1000)
          : state.elapsedSeconds;
        const session: StudySession = {
          id: newId(),
          startedAt: nowIso(),
          endedAt: nowIso(),
          durationSeconds: Math.max(0, elapsed),
          goalSeconds: state.goalSeconds,
          completed: state.goalSeconds > 0 && elapsed >= state.goalSeconds,
          ...(note ? { note } : {}),
        };
        set({
          sessions: [session, ...state.sessions].slice(0, 200),
          isRunning: false,
          elapsedSeconds: 0,
          lastTick: now,
        });
      },

      clearSessions: () => {
        set({ sessions: [] });
      },
    }),
    {
      name: SESSION_KEY,
      partialize: (state) => ({ sessions: state.sessions, goalSeconds: state.goalSeconds }),
    },
  ),
);

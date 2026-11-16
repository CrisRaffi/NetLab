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
  goalSeconds: number;
  sessions: StudySession[];

  setGoal: (minutes: number) => void;
  completeSession: (durationSeconds: number, note?: string) => void;
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
      goalSeconds: DEFAULT_GOAL_SECONDS,
      sessions: [],

      setGoal: (minutes: number) => {
        set({ goalSeconds: Math.max(1, minutes) * 60 });
      },

      completeSession: (durationSeconds: number, note?: string) => {
        const state = get();
        const session: StudySession = {
          id: newId(),
          startedAt: nowIso(),
          endedAt: nowIso(),
          durationSeconds: Math.max(0, durationSeconds),
          goalSeconds: state.goalSeconds,
          completed: state.goalSeconds > 0 && durationSeconds >= state.goalSeconds,
          ...(note ? { note } : {}),
        };
        set({
          sessions: [session, ...state.sessions].slice(0, 200),
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
      }),
    },
  ),
);

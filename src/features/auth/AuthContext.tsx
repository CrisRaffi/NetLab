import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, db, firebaseConfigured } from '../../lib/firebase';
import { loadQuizScores, saveQuizScore } from './firestoreQuiz';
import { loadBoards, saveBoardsToCloud } from './firestoreBoard';
import { loadProgress, saveProgressToCloud } from './firestoreProgress';
import { useQuizStore, type QuizResult } from '../../stores/useQuizStore';
import {
  useSavedBoardsStore,
  type SavedBoard,
} from '../../stores/useSavedBoardsStore';
import {
  useProgressStore,
  getLevelFromXp,
} from '../../stores/useProgressStore';
import type {
  UserProgress,
  ConceptProgress,
  Achievement,
} from '../../types';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveQuiz: (quizId: string, score: number, total: number) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

function mergeQuizResults(
  local: Record<string, QuizResult>,
  cloud: Record<string, QuizResult> | undefined,
): Record<string, QuizResult> {
  const merged: Record<string, QuizResult> = { ...local };
  if (!cloud) return merged;
  for (const [id, remote] of Object.entries(cloud)) {
    const prev = merged[id];
    merged[id] = {
      quizId: id,
      bestScore: Math.max(prev?.bestScore ?? 0, remote.bestScore),
      total: remote.total || prev?.total || 0,
      attempts: (prev?.attempts ?? 0) + (remote.attempts ?? 0),
      lastScore: remote.lastScore ?? prev?.lastScore ?? 0,
      completedAt:
        prev?.completedAt ?? remote.completedAt ?? new Date().toISOString(),
    };
  }
  return merged;
}

function mergeBoards(
  local: SavedBoard[],
  cloud: SavedBoard[],
): SavedBoard[] {
  const byId = new Map<string, SavedBoard>();
  for (const b of [...cloud, ...local]) {
    const prev = byId.get(b.id);
    byId.set(b.id, !prev || b.savedAt >= prev.savedAt ? b : prev);
  }
  return [...byId.values()]
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 20);
}

function maxDate(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) >= new Date(b) ? a : b;
}

function mergeProgress(
  local: UserProgress,
  cloud: UserProgress | undefined,
): UserProgress {
  if (!cloud) return local;

  const xp = Math.max(local.xp, cloud.xp);

  const completedLocal = new Set(local.completedExercises);
  const completedExercises = [
    ...local.completedExercises,
    ...cloud.completedExercises.filter((id) => !completedLocal.has(id)),
  ];

  const conceptsById = new Map<string, ConceptProgress>();
  for (const c of [...cloud.concepts, ...local.concepts]) {
    const prev = conceptsById.get(c.conceptId);
    if (!prev) {
      conceptsById.set(c.conceptId, c);
      continue;
    }
    conceptsById.set(c.conceptId, {
      conceptId: c.conceptId,
      mastery: Math.max(prev.mastery, c.mastery),
      attempts: Math.max(prev.attempts, c.attempts),
      lastPracticed: maxDate(prev.lastPracticed, c.lastPracticed),
      nextReview: maxDate(prev.nextReview, c.nextReview),
    });
  }

  const achievementsById = new Map<string, Achievement>();
  for (const a of [...cloud.achievements, ...local.achievements]) {
    const prev = achievementsById.get(a.id);
    if (!prev) {
      achievementsById.set(a.id, a);
      continue;
    }
    achievementsById.set(a.id, prev.unlockedAt >= a.unlockedAt ? prev : a);
  }

  const attempts = Math.max(
    local.stats.exercisesAttempted,
    cloud.stats.exercisesAttempted,
  );

  return {
    xp,
    level: getLevelFromXp(xp),
    concepts: [...conceptsById.values()],
    completedExercises,
    achievements: [...achievementsById.values()],
    stats: {
      totalTime: Math.max(local.stats.totalTime, cloud.stats.totalTime),
      exercisesAttempted: attempts,
      exercisesCompleted: Math.max(
        local.stats.exercisesCompleted,
        cloud.stats.exercisesCompleted,
      ),
      averageScore:
        attempts > 0
          ? Math.max(local.stats.averageScore, cloud.stats.averageScore)
          : 0,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setInitializing(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const [cloud, cloudBoards, cloudProgress] = await Promise.all([
          loadQuizScores(fbUser.uid),
          loadBoards(fbUser.uid),
          loadProgress(fbUser.uid),
        ]);
        const store = useQuizStore.getState();
        useQuizStore.setState({ results: mergeQuizResults(store.results, cloud) });
        const boardsStore = useSavedBoardsStore.getState();
        useSavedBoardsStore.setState({
          boards: mergeBoards(boardsStore.boards, cloudBoards),
        });
        const progressStore = useProgressStore.getState();
        useProgressStore.setState({
          progress: mergeProgress(progressStore.progress, cloudProgress),
        });
        setUser(toAuthUser(fbUser));
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid || !db) return;
    const unsub = useSavedBoardsStore.subscribe((state, prev) => {
      if (state.boards === prev.boards) return;
      void saveBoardsToCloud(user.uid, state.boards);
    });
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !db) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useProgressStore.subscribe((state, prev) => {
      if (state.progress === prev.progress) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void saveProgressToCloud(user.uid, state.progress);
      }, 600);
    });
    return () => {
      if (timer) {
        clearTimeout(timer);
        const latest = useProgressStore.getState().progress;
        void saveProgressToCloud(user.uid, latest);
      }
      unsub();
    };
  }, [user?.uid]);

  async function signIn(email: string, password: string) {
    if (!auth) throw new Error('auth/unavailable');
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, name: string) {
    if (!auth) throw new Error('auth/unavailable');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
  }

  async function signOut() {
    if (!auth) return;
    await fbSignOut(auth);
  }

  async function resetPassword(email: string) {
    if (!auth) throw new Error('auth/unavailable');
    await sendPasswordResetEmail(auth, email);
  }

  function saveQuiz(quizId: string, score: number, total: number) {
    useQuizStore.getState().recordResult(quizId, score, total);
    if (!user?.uid) return;
    const result = useQuizStore.getState().results[quizId];
    if (result) void saveQuizScore(user.uid, quizId, result);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        configured: firebaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        saveQuiz,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
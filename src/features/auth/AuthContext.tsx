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
import { useQuizStore, type QuizResult } from '../../stores/useQuizStore';
import {
  useSavedBoardsStore,
  type SavedBoard,
} from '../../stores/useSavedBoardsStore';

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
        const [cloud, cloudBoards] = await Promise.all([
          loadQuizScores(fbUser.uid),
          loadBoards(fbUser.uid),
        ]);
        const store = useQuizStore.getState();
        useQuizStore.setState({ results: mergeQuizResults(store.results, cloud) });
        const boardsStore = useSavedBoardsStore.getState();
        useSavedBoardsStore.setState({
          boards: mergeBoards(boardsStore.boards, cloudBoards),
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
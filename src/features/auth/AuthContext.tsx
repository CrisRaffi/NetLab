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
import { auth, firebaseConfigured } from '../../lib/firebase';
import { loadQuizScores, saveQuizScore } from './firestoreQuiz';
import { useQuizStore, type QuizResult } from '../../stores/useQuizStore';

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
        const cloud = await loadQuizScores(fbUser.uid);
        const store = useQuizStore.getState();
        useQuizStore.setState({ results: mergeQuizResults(store.results, cloud) });
        setUser(toAuthUser(fbUser));
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return () => unsub();
  }, []);

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
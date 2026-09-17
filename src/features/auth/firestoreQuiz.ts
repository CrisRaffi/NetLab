import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { QuizResult } from '../../stores/useQuizStore';

export async function loadQuizScores(
  uid: string,
): Promise<Record<string, QuizResult>> {
  if (!db) return {};
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const data = snap.data()?.quizScores as
      | Record<string, QuizResult>
      | undefined;
    return data ?? {};
  } catch {
    return {};
  }
}

export async function saveQuizScore(
  uid: string,
  quizId: string,
  result: QuizResult,
): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, 'users', uid),
      { [`quizScores.${quizId}`]: result },
      { merge: true },
    );
  } catch {
    // falha silenciosa: o progresso continua salvo localmente
  }
}
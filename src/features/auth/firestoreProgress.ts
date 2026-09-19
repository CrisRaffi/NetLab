import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { UserProgress } from '../../types';

export async function loadProgress(
  uid: string,
): Promise<UserProgress | undefined> {
  if (!db) return undefined;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.data()?.progress as UserProgress | undefined;
  } catch {
    return undefined;
  }
}

export async function saveProgressToCloud(
  uid: string,
  progress: UserProgress,
): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, 'users', uid),
      { progress },
      { merge: true },
    );
  } catch {
    // falha silenciosa: o progresso continua salvo localmente
  }
}
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { UserProgress } from '../../types';

export interface PublicStats {
  level: number;
  xp: number;
  mastered: number;
  achievements: number;
  labsDone: number;
  updatedAt: number;
}

export function computePublicStats(progress: UserProgress): PublicStats {
  return {
    level: progress.level,
    xp: progress.xp,
    mastered: progress.concepts.filter((c) => c.mastery >= 80).length,
    achievements: progress.achievements.length,
    labsDone: progress.completedExercises.length,
    updatedAt: Date.now(),
  };
}

export async function loadPublicStats(
  uid: string,
): Promise<PublicStats | null> {
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'public-stats', uid));
    return (snap.data() as PublicStats | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function savePublicStats(
  uid: string,
  stats: PublicStats,
): Promise<void> {
  if (!db || !uid) return;
  try {
    await setDoc(doc(db, 'public-stats', uid), stats);
  } catch {
    // falha silenciosa: as estatísticas continuam atualizadas na próxima tentativa
  }
}
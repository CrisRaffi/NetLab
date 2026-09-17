import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { SavedBoard } from '../../stores/useSavedBoardsStore';

export async function loadBoards(uid: string): Promise<SavedBoard[]> {
  if (!db) return [];
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const boards = snap.data()?.boards as SavedBoard[] | undefined;
    return Array.isArray(boards) ? boards : [];
  } catch {
    return [];
  }
}

export async function saveBoardsToCloud(
  uid: string,
  boards: SavedBoard[],
): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', uid), { boards }, { merge: true });
  } catch {
    // falha silenciosa: os quadros continuam salvos localmente
  }
}
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface UserProfile {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  bannerUrl?: string;
}

const LOCAL_KEY = 'netlab:meu-perfil';

export async function loadProfile(uid: string): Promise<UserProfile | null> {
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'user-profiles', uid));
    return (snap.data() as UserProfile | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function saveProfile(
  uid: string,
  profile: UserProfile,
): Promise<void> {
  if (!db || !uid) return;
  await setDoc(doc(db, 'user-profiles', uid), profile, { merge: true });
}

export function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  } catch {
    // ignora
  }
}

export const AVATAR_EMOJIS = [
  '🖥️',
  '🌐',
  '📡',
  '🔐',
  '⚡',
  '💻',
  '📶',
  '🛜',
];
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface ChatMessage {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorUid?: string;
  text: string;
  createdAt: number;
}

export interface DoubtReply {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorUid?: string;
  text: string;
  createdAt: number;
}

export interface Doubt {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorUid?: string;
  topic: string;
  title: string;
  body: string;
  createdAt: number;
  replies: DoubtReply[];
}

export function subscribeChat(
  onData: (messages: ChatMessage[]) => void,
): Unsubscribe | undefined {
  if (!db) return undefined;
  const q = query(
    collection(db, 'community-chat'),
    orderBy('createdAt', 'desc'),
    limit(200),
  );
  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, 'id'>),
      }));
      onData(messages.reverse());
    },
    () => {
      onData([]);
    },
  );
}

export async function sendChatMessage(
  message: Omit<ChatMessage, 'id'>,
): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'community-chat'), message);
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'community-chat', messageId));
}

export function subscribeDoubts(
  onData: (doubts: Doubt[]) => void,
): Unsubscribe | undefined {
  if (!db) return undefined;
  const q = query(
    collection(db, 'community-doubts'),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  return onSnapshot(
    q,
    (snap) => {
      const doubts = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Doubt, 'id'>),
      }));
      onData(doubts);
    },
    () => {
      onData([]);
    },
  );
}

export async function sendDoubt(doubt: Omit<Doubt, 'id' | 'replies'>): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'community-doubts'), {
    ...doubt,
    topic: doubt.topic ?? 'Geral',
    replies: [],
  });
}

export async function sendDoubtReply(
  doubtId: string,
  reply: Omit<DoubtReply, 'id'>,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'community-doubts', doubtId), {
    replies: arrayUnion({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...reply }),
  });
}

export async function deleteDoubt(doubtId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'community-doubts', doubtId));
}
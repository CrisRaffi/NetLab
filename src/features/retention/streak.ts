const KEY = 'netlab:streak';
const EVENT = 'netlab:streak-updated';

export interface StreakData {
  lastActive: string;
  current: number;
  best: number;
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad);
  const db = new Date(by, bm - 1, bd);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

const EMPTY: StreakData = { lastActive: '', current: 0, best: 0 };

export function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as StreakData;
      if (typeof data.current === 'number' && typeof data.best === 'number') {
        return data;
      }
    }
  } catch {
    // ignora
  }
  return EMPTY;
}

export function markActivity(): StreakData {
  const today = todayKey();
  const prev = getStreak();
  let next: StreakData;
  if (prev.lastActive === today) {
    next = prev;
  } else if (prev.lastActive && daysBetween(prev.lastActive, today) === 1) {
    next = {
      lastActive: today,
      current: prev.current + 1,
      best: Math.max(prev.best, prev.current + 1),
    };
  } else {
    next = { lastActive: today, current: 1, best: Math.max(prev.best, 1) };
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignora
  }
  window.dispatchEvent(new Event(EVENT));
  return next;
}

export function subscribeStreak(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
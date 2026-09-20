const KEY = 'netlab:resumo-semanal';

export interface WeekSnapshot {
  xp: number;
  labsDone: number;
  mastered: number;
  achievements: number;
  minutes: number;
}

export interface WeeklyDeltas {
  xp: number;
  labsDone: number;
  mastered: number;
  achievements: number;
  minutes: number;
  hasActivity: boolean;
}

function read(): { week: string; end: WeekSnapshot } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { week: string; end: WeekSnapshot };
    if (typeof data.week === 'string' && data.end && typeof data.end.xp === 'number') {
      return data;
    }
  } catch {
    // ignora
  }
  return null;
}

function write(week: string, end: WeekSnapshot): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ week, end }));
  } catch {
    // ignora
  }
}

export function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week =
    1 +
    Math.round(
      ((d.getTime() - first.getTime()) / 86400000 -
        3 +
        ((first.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function maybeGenerateSummary(
  current: WeekSnapshot,
): WeeklyDeltas | null {
  const wk = weekKey();
  const stored = read();
  if (!stored) {
    write(wk, current);
    return null;
  }
  if (stored.week === wk) {
    write(wk, current);
    return null;
  }
  const deltas: WeeklyDeltas = {
    xp: Math.max(0, current.xp - stored.end.xp),
    labsDone: Math.max(0, current.labsDone - stored.end.labsDone),
    mastered: Math.max(0, current.mastered - stored.end.mastered),
    achievements: Math.max(0, current.achievements - stored.end.achievements),
    minutes: Math.max(0, current.minutes - stored.end.minutes),
    hasActivity: false,
  };
  deltas.hasActivity =
    deltas.xp > 0 ||
    deltas.labsDone > 0 ||
    deltas.mastered > 0 ||
    deltas.achievements > 0 ||
    deltas.minutes > 0;
  write(wk, current);
  return deltas;
}
import { todayKey } from './streak';

const KEY = 'netlab:meta-dia';
export const DEFAULT_GOAL = 50;
export const GOAL_PRESETS = [20, 50, 100];

export interface DailyGoalData {
  date: string;
  baseline: number;
  goal: number;
}

function read(): DailyGoalData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as DailyGoalData;
    if (typeof data.baseline === 'number' && typeof data.goal === 'number') {
      return data;
    }
  } catch {
    // ignora
  }
  return null;
}

export function getDailyGoalState(totalXp: number): DailyGoalData {
  const today = todayKey();
  const stored = read();
  if (!stored || stored.date !== today) {
    const data: DailyGoalData = {
      date: today,
      baseline: totalXp,
      goal: stored && stored.goal > 0 ? stored.goal : DEFAULT_GOAL,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // ignora
    }
    return data;
  }
  return stored;
}

export function updateDailyGoal(goal: number, totalXp: number): DailyGoalData {
  const today = todayKey();
  const prev = getDailyGoalState(totalXp);
  const data: DailyGoalData = {
    date: today,
    baseline: prev.baseline,
    goal: Math.max(10, goal),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignora
  }
  return data;
}
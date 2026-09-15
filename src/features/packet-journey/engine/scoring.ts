export interface ExerciseResult {
  xp: number;
  tries: number;
  hints: number;
  solvedByHint: boolean;
}

export function xpFor(tries: number, hints: number): number {
  return Math.max(30, 100 - (tries - 1) * 15 - hints * 15);
}

export function accuracyOf(results: ExerciseResult[]): number {
  if (results.length === 0) return 0;
  const firstTry = results.filter(r => r.tries === 1 && !r.solvedByHint).length;
  return Math.round((firstTry / results.length) * 100);
}

export function totalXp(results: ExerciseResult[]): number {
  return results.reduce((sum, r) => sum + r.xp, 0);
}
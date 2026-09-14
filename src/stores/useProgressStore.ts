import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress, ConceptProgress, Achievement } from '../types';

const XP_PER_LEVEL = 100;

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function isUnlocked(prerequisites: string[], concepts: ConceptProgress[]): boolean {
  if (prerequisites.length === 0) return true;
  return prerequisites.every(prereq => {
    const concept = concepts.find(c => c.conceptId === prereq);
    return concept && concept.mastery >= 100;
  });
}

function makeInitialConcepts(): ConceptProgress[] {
  return [
    { conceptId: 'networking-basics', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'lan-wan', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'network-devices', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'topologies', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'ethernet-basics', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'client-server', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'osi-model', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'tcp-ip-model', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'encapsulation', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'mac-address', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'switch-operations', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'arp', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'frames', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'ipv4-basics', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'subnet-mask', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'gateway', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'broadcast', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'subnetting', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'cidr', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'host-calculation', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'dhcp', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'dns', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
    { conceptId: 'routing-basics', mastery: 0, attempts: 0, lastPracticed: '', nextReview: '' },
  ];
}

interface ProgressState {
  progress: UserProgress;
  addXp: (amount: number) => void;
  completeExercise: (exerciseId: string, concepts: string[], xp: number) => void;
  registerPractice: (conceptId: string, success: boolean) => void;
  unlockAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => void;
  getConceptMastery: (conceptId: string) => number;
  isConceptUnlocked: (conceptId: string, prerequisites: string[]) => boolean;
  getOverallProgress: () => number;
  resetProgress: () => void;
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  concepts: makeInitialConcepts(),
  completedExercises: [],
  achievements: [],
  stats: {
    totalTime: 0,
    exercisesAttempted: 0,
    exercisesCompleted: 0,
    averageScore: 0,
  },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: defaultProgress,

      addXp: (amount) =>
        set(state => ({
          progress: {
            ...state.progress,
            xp: state.progress.xp + amount,
            level: getLevelFromXp(state.progress.xp + amount),
          },
        })),

      completeExercise: (exerciseId, concepts, xp) =>
        set(state => {
          const alreadyCompleted = state.progress.completedExercises.includes(exerciseId);
          const updatedConcepts = state.progress.concepts.map(c =>
            concepts.includes(c.conceptId)
              ? { ...c, mastery: Math.min(100, c.mastery + (alreadyCompleted ? 5 : 25)), attempts: c.attempts + 1, lastPracticed: new Date().toISOString() }
              : c
          );

          return {
            progress: {
              ...state.progress,
              xp: state.progress.xp + (alreadyCompleted ? Math.floor(xp / 2) : xp),
              level: getLevelFromXp(state.progress.xp + (alreadyCompleted ? Math.floor(xp / 2) : xp)),
              completedExercises: alreadyCompleted
                ? state.progress.completedExercises
                : [...state.progress.completedExercises, exerciseId],
              concepts: updatedConcepts,
              stats: {
                ...state.progress.stats,
                exercisesCompleted: state.progress.stats.exercisesCompleted + (alreadyCompleted ? 0 : 1),
              },
            },
          };
        }),

      registerPractice: (conceptId, success) =>
        set(state => ({
          progress: {
            ...state.progress,
            concepts: state.progress.concepts.map(c =>
              c.conceptId === conceptId
                ? {
                    ...c,
                    attempts: c.attempts + 1,
                    mastery: Math.max(0, Math.min(100, c.mastery + (success ? 10 : -5))),
                    lastPracticed: new Date().toISOString(),
                  }
                : c
            ),
          },
        })),

      unlockAchievement: (achievement) =>
        set(state => {
          if (state.progress.achievements.some(a => a.id === achievement.id)) return state;
          return {
            progress: {
              ...state.progress,
              xp: state.progress.xp + achievement.xpReward,
              level: getLevelFromXp(state.progress.xp + achievement.xpReward),
              achievements: [...state.progress.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
            },
          };
        }),

      getConceptMastery: (conceptId) => {
        const concept = get().progress.concepts.find(c => c.conceptId === conceptId);
        return concept?.mastery ?? 0;
      },

      isConceptUnlocked: (_conceptId, prerequisites) => {
        if (prerequisites.length === 0) return true;
        return isUnlocked(prerequisites, get().progress.concepts);
      },

      getOverallProgress: () => {
        const { concepts } = get().progress;
        if (concepts.length === 0) return 0;
        const total = concepts.reduce((sum, c) => sum + c.mastery, 0);
        return Math.round(total / concepts.length);
      },

      resetProgress: () => set({ progress: defaultProgress }),
    }),
    { name: 'netlab-progress' }
  )
);
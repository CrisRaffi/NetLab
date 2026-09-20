import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Flame, GraduationCap, Trophy } from 'lucide-react';
import { Card } from '../common/Card';
import { useProgressStore } from '../../stores/useProgressStore';
import { INITIAL_EXERCISES } from '../../data/exercises';
import {
  maybeGenerateSummary,
  type WeeklyDeltas,
} from '../../features/retention/weeklySummary';

export function WeeklySummaryCard() {
  const progress = useProgressStore((s) => s.progress);
  const generated = useRef(false);
  const [deltas, setDeltas] = useState<WeeklyDeltas | null>(null);

  useEffect(() => {
    if (generated.current) return;
    generated.current = true;
    const labsDone = progress.completedExercises.filter((id) =>
      INITIAL_EXERCISES.some((ex) => ex.id === id),
    ).length;
    const mastered = progress.concepts.filter((c) => c.mastery >= 80).length;
    const res = maybeGenerateSummary({
      xp: progress.xp,
      labsDone,
      mastered,
      achievements: progress.achievements.length,
      minutes: progress.stats.totalTime,
    });
    if (res && res.hasActivity) setDeltas(res);
  }, [progress]);

  if (!deltas) return null;

  const h = Math.floor(deltas.minutes / 60);
  const m = deltas.minutes % 60;

  return (
    <Card
      title="Sua semana anterior"
      subtitle="Resumo do que você conquistou"
      icon={<TrendingUp size={16} />}
      className="packet-flow-green"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[--color-accent-blue]">
            <Flame size={14} />
          </div>
          <div className="mt-1 text-xl font-bold text-[--color-text-primary]">
            +{deltas.xp} XP
          </div>
          <div className="text-[11px] text-[--color-text-muted]">ganhos</div>
        </div>
        <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[--color-accent-green]">
            <GraduationCap size={14} />
          </div>
          <div className="mt-1 text-xl font-bold text-[--color-text-primary]">
            {deltas.labsDone}
          </div>
          <div className="text-[11px] text-[--color-text-muted]">labs concluídos</div>
        </div>
        <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[--color-accent-purple]">
            <TrendingUp size={14} />
          </div>
          <div className="mt-1 text-xl font-bold text-[--color-text-primary]">
            {deltas.mastered}
          </div>
          <div className="text-[11px] text-[--color-text-muted]">conceitos dominados</div>
        </div>
        <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
          <div className="flex items-center gap-1.5 text-[--color-accent-yellow]">
            <Trophy size={14} />
          </div>
          <div className="mt-1 text-xl font-bold text-[--color-text-primary]">
            {h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`}
          </div>
          <div className="text-[11px] text-[--color-text-muted]">estudados</div>
        </div>
      </div>
      <p className="text-xs text-[--color-text-secondary] leading-relaxed mt-3">
        Boa volta! Continue no ritmo para manter a sequência e bater a meta de hoje.
      </p>
    </Card>
  );
}
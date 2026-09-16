import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  Zap,
  FlaskConical,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { useProgressStore } from '../stores/useProgressStore';
import { INITIAL_EXERCISES } from '../data/exercises';

const DIFFICULTY_TONE = {
  1: 'green',
  2: 'blue',
  3: 'yellow',
  4: 'red',
  5: 'purple',
} as const;

const CATEGORY_LABEL: Record<string, string> = {
  troubleshooting: 'Troubleshooting',
  configuration: 'Configuração',
  design: 'Projeto',
  theory: 'Conceito',
  subnetting: 'Subnetting',
};

export function LabsPage() {
  const progress = useProgressStore((s) => s.progress);
  const completedIds = progress.completedExercises;

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Laboratórios"
        subtitle="Complete na ordem para liberar desafios mais complexos."
        accent="green"
        icon={<FlaskConical size={19} />}
        badge={
          <Badge tone="blue">
            {
              completedIds.filter((id) =>
                INITIAL_EXERCISES.some((ex) => ex.id === id),
              ).length
            }{' '}
            / {INITIAL_EXERCISES.length} concluídos
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INITIAL_EXERCISES.map((ex) => {
          const done = completedIds.includes(ex.id);
          const index = INITIAL_EXERCISES.indexOf(ex);
          const prevDone =
            index === 0
              ? true
              : completedIds.includes(INITIAL_EXERCISES[index - 1].id);
          const unlocked = prevDone;
          const conceptUnlocked = ex.prerequisites.length === 0 || true;

          return (
            <Card
              key={ex.id}
              className={`transition-all duration-200 ${
                unlocked && conceptUnlocked
                  ? 'hover:border-[--color-accent-blue]/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6366F1]/5'
                  : 'opacity-60'
              } !p-4`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--color-bg-tertiary] font-mono text-[11px] font-bold text-[--color-text-secondary]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {done && (
                    <CheckCircle
                      size={16}
                      className="text-[--color-accent-green]"
                    />
                  )}
                </div>
                <Badge tone={DIFFICULTY_TONE[ex.difficulty]}>
                  Dificuldade {ex.difficulty}/5
                </Badge>
              </div>

              <h3 className="text-sm font-semibold text-[--color-text-primary] mb-1">
                {ex.title}
              </h3>
              <p className="text-xs text-[--color-text-muted] line-clamp-2 mb-2">
                {ex.description}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-[--color-text-muted] mb-2.5">
                <Badge tone="default">{CATEGORY_LABEL[ex.category]}</Badge>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {ex.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={11} className="text-[--color-accent-blue]" />{' '}
                  {ex.xpReward} XP
                </span>
              </div>

              <div className="flex items-center justify-between">
                {unlocked && conceptUnlocked ? (
                  <Link to={`/labs/${ex.id}`} className="flex-1">
                    <Button
                      variant={done ? 'outline' : 'primary'}
                      size="sm"
                      className="w-full"
                    >
                      {done ? 'Revisar' : 'Iniciar'} <ArrowRight size={13} />
                    </Button>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 w-full justify-center rounded-lg bg-[--color-bg-tertiary] border border-[--color-border-primary]/50 text-[--color-text-muted] text-xs font-medium px-3 py-2 cursor-not-allowed">
                    <Lock size={13} /> Bloqueado
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

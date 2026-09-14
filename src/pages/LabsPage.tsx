import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Lock, Zap } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
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
  const progress = useProgressStore(s => s.progress);
  const completedIds = progress.completedExercises;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Laboratórios</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Complete na ordem para liberar desafios mais complexos.
          </p>
        </div>
        <Badge tone="blue">
          {completedIds.filter(id => INITIAL_EXERCISES.some(ex => ex.id === id)).length} / {INITIAL_EXERCISES.length} concluídos
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INITIAL_EXERCISES.map(ex => {
          const done = completedIds.includes(ex.id);
          const index = INITIAL_EXERCISES.indexOf(ex);
          const prevDone = index === 0 ? true : completedIds.includes(INITIAL_EXERCISES[index - 1].id);
          const unlocked = prevDone;
          const conceptUnlocked = ex.prerequisites.length === 0 || true;

          return (
            <Card
              key={ex.id}
              className={`transition-colors ${unlocked && conceptUnlocked ? 'hover:border-blue-500/40' : 'opacity-60'} !p-5`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono text-slate-500">#{String(index + 1).padStart(2, '0')}</span>
                  {done && <CheckCircle size={16} className="text-emerald-500" />}
                </div>
                <Badge tone={DIFFICULTY_TONE[ex.difficulty]}>Dificuldade {ex.difficulty}/5</Badge>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 mb-1">{ex.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{ex.description}</p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
                <Badge tone="default">{CATEGORY_LABEL[ex.category]}</Badge>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {ex.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={11} className="text-blue-400" /> {ex.xpReward} XP
                </span>
              </div>

              <div className="flex items-center justify-between">
                {unlocked && conceptUnlocked ? (
                  <Link to={`/labs/${ex.id}`} className="flex-1">
                    <span className="inline-flex items-center justify-center gap-1.5 w-full rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 transition-colors cursor-pointer">
                      {done ? 'Revisar' : 'Iniciar'} <ArrowRight size={13} />
                    </span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 w-full justify-center rounded-md bg-slate-800 text-slate-500 text-xs font-medium px-3 py-2 cursor-not-allowed">
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
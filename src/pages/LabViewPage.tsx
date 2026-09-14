import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Network,
  GraduationCap,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SimulatorWorkspace } from '../components/simulator/SimulatorWorkspace';
import { INITIAL_EXERCISES } from '../data/exercises';
import { useProgressStore } from '../stores/useProgressStore';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { normalizeTopology, runValidation } from '../engine/lab';
import type { LabValidation } from '../engine/lab';
import type { Exercise, Topology } from '../types';
import { clsx } from 'clsx';

const DIFFICULTY_TONE = {
  1: 'green',
  2: 'blue',
  3: 'yellow',
  4: 'red',
  5: 'purple',
} as const;

const ACHIEVEMENTS_BY_LAB: Record<string, { id: string; name: string; description: string; icon: string; xpReward: number }> = {
  'lab-01-first-network': { id: 'first-ping', name: 'Primeiro Ping', description: 'Complete seu primeiro lab com sucesso', icon: '🏆', xpReward: 25 },
  'lab-03-gateway': { id: 'gateway-hero', name: 'Gateway Hero', description: 'Resolva o problema de gateway', icon: '🚀', xpReward: 25 },
  'lab-04-subnetting': { id: 'subnet-master', name: 'Subnet Master', description: 'Complete o laboratório de sub-redes', icon: '🌐', xpReward: 25 },
  'lab-08-duplicate-ip': { id: 'detective', name: 'Detective', description: 'Encontre seu primeiro bug em um laboratório', icon: '🔍', xpReward: 25 },
};

export function LabViewPage() {
  const { id } = useParams<{ id: string }>();
  const exercise = INITIAL_EXERCISES.find(e => e.id === id);
  return exercise ? <LabWorkspace key={exercise.id} exercise={exercise} /> : <MissingLab />;
}

function MissingLab() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20">
      <p className="text-slate-400">Laboratório não encontrado.</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/labs')}>
        <ArrowRight size={16} /> Voltar
      </Button>
    </div>
  );
}

function LabWorkspace({ exercise }: { exercise: Exercise }) {
  const navigate = useNavigate();

  const loadTopology = useSimulatorStore(s => s.loadTopology);
  const arpTables = useSimulatorStore(s => s.arpTables);
  const progress = useProgressStore(s => s.progress);
  const completeExercise = useProgressStore(s => s.completeExercise);
  const unlockAchievement = useProgressStore(s => s.unlockAchievement);

  const [validation, setValidation] = useState<LabValidation | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    loadTopology(normalizeTopology(exercise.initialTopology));
  }, [exercise, loadTopology]);

  const alreadyComplete = progress.completedExercises.includes(exercise.id);

  const nextExercise = useMemo(() => {
    const idx = INITIAL_EXERCISES.indexOf(exercise);
    return idx >= 0 && idx < INITIAL_EXERCISES.length - 1 ? INITIAL_EXERCISES[idx + 1] : null;
  }, [exercise]);

  const handleValidate = (topology: Topology) => {
    const result = runValidation(topology, exercise.validation, { arpTables });
    setValidation(result);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 800);

    if (result.passed && !alreadyComplete) {
      completeExercise(exercise.id, exercise.concepts, exercise.xpReward);
      const award = ACHIEVEMENTS_BY_LAB[exercise.id];
      if (award) unlockAchievement(award);
    }
  };

  const summary =
    validation && validation.total > 0 ? { passed: validation.passedCount, total: validation.total } : null;

  const evaluation = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[--color-border-primary] shrink-0">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Avaliação automática</span>
        <span
          className={clsx(
            'text-[11px] font-mono px-2 py-0.5 rounded-full border',
            validation?.passed
              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
              : validation
              ? 'text-red-400 border-red-500/40 bg-red-500/10'
              : 'text-slate-500 border-[--color-border-primary] bg-[--color-bg-tertiary]'
          )}
        >
          {validation ? `${validation.passedCount}/${validation.total} ✓` : 'aguardando validação'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {validation === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <GraduationCap size={24} className="text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">Configure a rede acima e clique em</p>
            <p className="text-xs text-blue-400 font-medium mt-1">Validar laboratório</p>
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-[--color-border-primary]">
              {validation.passed ? (
                <div className="flex items-start gap-2 text-emerald-400">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Laboratório aprovado!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      +{exercise.xpReward} XP{ACHIEVEMENTS_BY_LAB[exercise.id] ? ` · +${ACHIEVEMENTS_BY_LAB[exercise.id].xpReward} XP de conquista` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-red-400">
                  <XCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Ainda não está correto.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Verifique os itens abaixo e tente novamente.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 space-y-1.5">
              {validation.results.map((result, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary]/50 px-2.5 py-1.5">
                  {result.passed ? (
                    <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className={clsx('text-[11px]', result.passed ? 'text-slate-300' : 'text-slate-400')}>{result.description}</p>
                    {!result.passed && result.details && (
                      <p className="text-[10px] text-red-400/90 mt-0.5">{result.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-[--color-border-primary]">
          <button
            onClick={() => setHintsRevealed(h => (h >= 3 ? 0 : h + 1))}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[--color-bg-hover] cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
              <Lightbulb size={13} /> Dicas ({Math.min(hintsRevealed, 3)}/3)
            </span>
            {hintsRevealed >= 3 ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {hintsRevealed > 0 && (
            <div className="px-3 pb-3 space-y-2">
              {exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
                <p key={hint.level} className="text-[11px] text-slate-400 leading-relaxed pl-4 border-l-2 border-amber-500/40">
                  <span className="text-amber-400 font-semibold mr-1">Dica {i + 1}:</span>
                  {hint.text}
                </p>
              ))}
            </div>
          )}

          <div className="border-t border-[--color-border-primary]">
            <button
              onClick={() => setShowSolution(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[--color-bg-hover] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400">
                <BookOpen size={13} /> Solução
              </span>
              {showSolution ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
            </button>
            {showSolution && (
              <div className="px-3 pb-3">
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{exercise.solution.explanation}</p>
                <ol className="space-y-1 mb-2">
                  {exercise.solution.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-[11px] text-slate-500">
                      <span className="text-blue-400 w-4 shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {exercise.solution.commands && (
                  <div className="rounded-md bg-black/50 p-2 font-mono text-[10px] space-y-0.5">
                    {exercise.solution.commands.map(cmd => (
                      <p key={cmd} className="text-emerald-400">$ {cmd}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {alreadyComplete && (
            <div className="border-t border-[--color-border-primary] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle size={13} /> Concluído
                </span>
                {nextExercise && (
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/labs/${nextExercise.id}`)}>
                    Próximo: {nextExercise.title} <ArrowRight size={12} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b border-[--color-border-primary] bg-[--color-bg-secondary]">
        <button
          onClick={() => setInstructionsOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[--color-bg-hover] cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center gap-2 flex-shrink-0">
              <Network size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-slate-200">{exercise.title}</span>
            </span>
            <div className="hidden md:flex items-center gap-2">
              <Badge tone={DIFFICULTY_TONE[exercise.difficulty]}>Dificuldade {exercise.difficulty}/5</Badge>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Zap size={11} className="text-blue-400" /> {exercise.xpReward} XP
              </span>
              {alreadyComplete && <Badge tone="green">Concluído</Badge>}
            </div>
          </div>
          {instructionsOpen ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </button>

        {instructionsOpen && (
          <div className="px-4 pb-3">
            <p className="text-xs text-slate-300 leading-relaxed max-w-5xl">{exercise.objective}</p>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <SimulatorWorkspace
          title={exercise.title}
          subtitle={`${exercise.estimatedTime} min · ${exercise.xpReward} XP`}
          onValidate={handleValidate}
          validationSummary={summary}
          resetTopologyTo={normalizeTopology(exercise.initialTopology)}
          evaluationTab={{ label: 'Avaliação', content: evaluation }}
          flashHint={flash}
        />
      </div>
    </div>
  );
}
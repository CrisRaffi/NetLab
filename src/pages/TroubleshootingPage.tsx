import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bug,
  Wrench,
  Shuffle,
  Stethoscope,
  CheckCircle,
  XCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  Activity,
  ArrowRight,
  Network,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SimulatorWorkspace } from '../components/simulator/SimulatorWorkspace';
import { BREAK_SCENARIOS } from '../data/scenarios';
import {
  buildBrokenTopology,
  challengeKey,
  chooseChallenge,
  diagnose,
} from '../engine/faults';
import type {
  BreakScenario,
  FaultVariant,
  DiagnosisFinding,
} from '../engine/faults';
import { runValidation } from '../engine/lab';
import type { LabValidation } from '../engine/lab';
import { useProgressStore } from '../stores/useProgressStore';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import type { Topology } from '../types';
import { clsx } from 'clsx';

const DIFFICULTY_TONE = {
  1: 'green',
  2: 'blue',
  3: 'yellow',
  4: 'red',
  5: 'purple',
} as const;

const ACHIEVEMENTS = {
  troubleshooter: {
    id: 'troubleshooter',
    name: 'Quebra-Redes',
    description: 'Resolva seu primeiro desafio de troubleshooting',
    icon: '🔧',
    xpReward: 25,
  },
  firefighter: {
    id: 'firefighter',
    name: 'Bombeiro de Redes',
    description: 'Resolva 5 desafios de troubleshooting',
    icon: '🚒',
    xpReward: 50,
  },
} as const;

function findChallenge(
  key: string | null,
): { scenario: BreakScenario; variant: FaultVariant } | null {
  if (!key) return null;
  for (const scenario of BREAK_SCENARIOS) {
    for (const variant of scenario.variants) {
      if (challengeKey(scenario, variant) === key) return { scenario, variant };
    }
  }
  return null;
}

export function TroubleshootingPage() {
  const [searchParams] = useSearchParams();
  const [challenge, setChallenge] = useState<{
    scenario: BreakScenario;
    variant: FaultVariant;
  } | null>(() => findChallenge(searchParams.get('challenge')));

  if (!challenge) {
    return (
      <Intro onStart={() => setChallenge(chooseChallenge(BREAK_SCENARIOS))} />
    );
  }

  return (
    <BreakSession
      key={challengeKey(challenge.scenario, challenge.variant)}
      scenario={challenge.scenario}
      variant={challenge.variant}
      onNewChallenge={() =>
        setChallenge(
          chooseChallenge(
            BREAK_SCENARIOS,
            challengeKey(challenge.scenario, challenge.variant),
          ),
        )
      }
    />
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const progress = useProgressStore((s) => s.progress);
  const breaksDone = progress.completedExercises.filter((id) =>
    id.startsWith('brk-'),
  ).length;

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col items-start rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bug size={20} className="text-[--color-accent-red]" />
          <h1 className="text-lg font-bold text-[--color-text-primary]">
            Quebrei a Rede!
          </h1>
        </div>
        <p className="text-sm text-[--color-text-muted] max-w-2xl mb-4">
          Uma rede foi sabotada: algum IP, máscara, gateway ou rota está errado
          (ou uma interface caiu). Use o console, o diagnóstico e o painel de
          propriedades para descobrir a falha e consertar a rede. A cada desafio
          você começa sempre da mesma rede "quebrada".
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Badge tone="red">{breaksDone} desafios resolvidos</Badge>
          <Badge tone="blue">
            {BREAK_SCENARIOS.reduce((n, s) => n + s.variants.length, 0)}{' '}
            problemas possíveis
          </Badge>
        </div>
        <Button onClick={onStart}>
          <Shuffle size={15} /> Começar desafio aleatório
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {BREAK_SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={14} className="text-[--color-accent-blue]" />
                <span className="text-sm font-semibold text-[--color-text-primary]">
                  {sc.title}
                </span>
              </div>
              <Badge tone={DIFFICULTY_TONE[sc.difficulty]}>
                Nível {sc.difficulty}/5
              </Badge>
            </div>
            <p className="text-xs text-[--color-text-muted] leading-relaxed">
              {sc.description}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-[--color-text-muted]">
              <span className="flex items-center gap-1">
                <Activity size={11} className="text-[--color-accent-cyan]" />{' '}
                {sc.variants.length} falhas possíveis
              </span>
              <span className="flex items-center gap-1">
                <Zap size={11} className="text-[--color-accent-blue]" />{' '}
                {sc.xpReward} XP
              </span>
              <span>{sc.estimatedTime} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakSession({
  scenario,
  variant,
  onNewChallenge,
}: {
  scenario: BreakScenario;
  variant: FaultVariant;
  onNewChallenge: () => void;
}) {
  const loadTopology = useSimulatorStore((s) => s.loadTopology);
  const arpTables = useSimulatorStore((s) => s.arpTables);
  const progress = useProgressStore((s) => s.progress);
  const completeExercise = useProgressStore((s) => s.completeExercise);
  const unlockAchievement = useProgressStore((s) => s.unlockAchievement);

  const [validation, setValidation] = useState<LabValidation | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisFinding[] | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const brokenTopology = useMemo(
    () => buildBrokenTopology(scenario, variant),
    [scenario, variant],
  );

  useEffect(() => {
    loadTopology(brokenTopology);
  }, [brokenTopology, loadTopology]);

  const challengeId = `brk-${challengeKey(scenario, variant)}`;
  const alreadyComplete = progress.completedExercises.includes(challengeId);

  const handleValidate = (topology: Topology) => {
    const result = runValidation(topology, scenario.validation, { arpTables });
    setValidation(result);

    if (result.passed && !alreadyComplete) {
      completeExercise(challengeId, scenario.concepts, scenario.xpReward);
      const breaksDone =
        progress.completedExercises.filter((id) => id.startsWith('brk-'))
          .length + 1;
      if (breaksDone === 1) unlockAchievement(ACHIEVEMENTS.troubleshooter);
      if (breaksDone === 5) unlockAchievement(ACHIEVEMENTS.firefighter);
    }
  };

  const handleDiagnose = () => {
    setDiagnosis(diagnose(useSimulatorStore.getState().topology));
  };

  const summary =
    validation && validation.total > 0
      ? { passed: validation.passedCount, total: validation.total }
      : null;

  const evaluation = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[--color-border-primary] shrink-0">
        <span className="text-[10px] uppercase tracking-wide text-[--color-text-muted]">
          Diagnóstico
        </span>
        <span
          className={clsx(
            'text-[11px] font-mono px-2 py-0.5 rounded-full border',
            validation?.passed
              ? 'text-[--color-accent-green] border-[--color-accent-green]/40 bg-[--color-accent-green]/10'
              : validation
                ? 'text-[--color-accent-red] border-[--color-accent-red]/40 bg-[--color-accent-red]/10'
                : 'text-[--color-text-muted] border-[--color-border-primary] bg-[--color-bg-tertiary]',
          )}
        >
          {validation
            ? `${validation.passedCount}/${validation.total} ✓`
            : 'aguardando validação'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 border-b border-[--color-border-primary]">
          <p className="flex items-start gap-2 text-xs text-[--color-text-secondary] leading-relaxed">
            <Wrench
              size={14}
              className="text-[--color-accent-red] shrink-0 mt-0.5"
            />
            <span>
              <strong className="text-[--color-accent-red]">Problema:</strong>{' '}
              {variant.symptom}
            </span>
          </p>
        </div>

        <div className="border-b border-[--color-border-primary]">
          <button
            onClick={handleDiagnose}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[--color-bg-hover] cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[--color-accent-cyan]">
              <Stethoscope size={13} /> Rodar diagnóstico
            </span>
            <span className="text-[10px] text-[--color-text-muted]/70">
              analisa a topologia atual
            </span>
          </button>
          {diagnosis && (
            <div className="px-3 pb-3 space-y-1.5">
              {diagnosis.length === 0 && (
                <p className="text-[11px] text-[--color-accent-green]">
                  Nenhum problema estrutural óbvio na configuração.
                </p>
              )}
              {diagnosis.map((f, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex items-start gap-1.5 text-[11px] leading-relaxed rounded-md border px-2 py-1',
                    f.severity === 'error'
                      ? 'text-[--color-accent-red] border-[--color-accent-red]/30 bg-[--color-accent-red]/5'
                      : f.severity === 'warning'
                        ? 'text-[--color-accent-yellow] border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/5'
                        : 'text-[--color-text-muted] border-[--color-border-primary] bg-[--color-bg-tertiary]/50',
                  )}
                >
                  <span className="shrink-0">
                    {f.severity === 'error'
                      ? '✖'
                      : f.severity === 'warning'
                        ? '⚠'
                        : 'ℹ'}
                  </span>
                  <span>{f.text}</span>
                </div>
              ))}
              <p className="text-[10px] text-[--color-text-muted]/70">
                Dica: use ipconfig, ping, tracert e route print no console para
                confirmar.
              </p>
            </div>
          )}
        </div>

        {validation === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <Bug size={24} className="text-[--color-text-muted]/70 mb-2" />
            <p className="text-xs text-[--color-text-muted]">
              Conserte a rede acima e clique em
            </p>
            <p className="text-xs text-[--color-accent-blue] font-medium mt-1">
              Validar laboratório
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-[--color-border-primary]">
              {validation.passed ? (
                <div className="flex items-start gap-2 text-[--color-accent-green]">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Rede consertada!</p>
                    <p className="text-[11px] text-[--color-text-muted] mt-0.5">
                      +{scenario.xpReward} XP · {scenario.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-[--color-accent-red]">
                  <XCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Ainda quebrada.</p>
                    <p className="text-[11px] text-[--color-text-muted] mt-0.5">
                      Verifique os itens abaixo e tente novamente.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 space-y-1.5">
              {validation.results.map((result, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary]/50 px-2.5 py-1.5"
                >
                  {result.passed ? (
                    <CheckCircle
                      size={13}
                      className="text-[--color-accent-green] shrink-0 mt-0.5"
                    />
                  ) : (
                    <XCircle
                      size={13}
                      className="text-[--color-accent-red] shrink-0 mt-0.5"
                    />
                  )}
                  <div className="min-w-0">
                    <p
                      className={clsx(
                        'text-[11px]',
                        result.passed
                          ? 'text-[--color-text-secondary]'
                          : 'text-[--color-text-muted]',
                      )}
                    >
                      {result.description}
                    </p>
                    {!result.passed && result.details && (
                      <p className="text-[10px] text-[--color-accent-red]/90 mt-0.5">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-[--color-border-primary]">
          <button
            onClick={() => setHintsRevealed((h) => (h >= 3 ? 0 : h + 1))}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[--color-bg-hover] cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[--color-accent-yellow]">
              <Lightbulb size={13} /> Dicas ({Math.min(hintsRevealed, 3)}/3)
            </span>
            {hintsRevealed >= 3 ? (
              <ChevronUp size={14} className="text-[--color-text-muted]" />
            ) : (
              <ChevronDown size={14} className="text-[--color-text-muted]" />
            )}
          </button>
          {hintsRevealed > 0 && (
            <div className="px-3 pb-3 space-y-2">
              {scenario.generalHints.slice(0, hintsRevealed).map((hint, i) => (
                <p
                  key={i}
                  className="text-[11px] text-[--color-text-muted] leading-relaxed pl-4 border-l-2 border-[--color-accent-yellow]/40"
                >
                  <span className="text-[--color-accent-yellow] font-semibold mr-1">
                    Dica {i + 1}:
                  </span>
                  {hint}
                </p>
              ))}
            </div>
          )}

          <div className="border-t border-[--color-border-primary]">
            <button
              onClick={() => setShowSolution((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[--color-bg-hover] cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[--color-accent-blue]">
                <BookOpen size={13} /> Solução
              </span>
              {showSolution ? (
                <ChevronUp size={14} className="text-[--color-text-muted]" />
              ) : (
                <ChevronDown size={14} className="text-[--color-text-muted]" />
              )}
            </button>
            {showSolution && (
              <p className="px-3 pb-3 text-[11px] text-[--color-text-muted] leading-relaxed">
                {variant.fix}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b border-[--color-border-primary] bg-[--color-bg-secondary]">
        <button
          onClick={() => setShowSolution((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[--color-bg-hover] cursor-pointer"
          title="Mostrar/esconder solução"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center gap-2 flex-shrink-0">
              <Bug size={15} className="text-[--color-accent-red]" />
              <span className="text-sm font-semibold text-[--color-text-primary]">
                {scenario.title}
              </span>
            </span>
            <Badge tone="red">Quebrada</Badge>
            <Badge tone={DIFFICULTY_TONE[scenario.difficulty]}>
              Nível {scenario.difficulty}/5
            </Badge>
            <span className="hidden md:flex items-center gap-1 text-[11px] text-[--color-text-muted]">
              <Zap size={11} className="text-[--color-accent-blue]" />{' '}
              {scenario.xpReward} XP
            </span>
          </div>
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <SimulatorWorkspace
          onValidate={handleValidate}
          validationSummary={summary}
          evaluationTab={{ label: 'Avaliação', content: evaluation }}
          defaultBottomTab="evaluation"
        />
      </div>

      {alreadyComplete && (
        <div className="shrink-0 border-t border-[--color-border-primary] bg-[--color-bg-secondary] px-4 py-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-[--color-accent-green]">
            <CheckCircle size={13} /> Desafio já concluído
          </span>
          <Button size="sm" variant="secondary" onClick={onNewChallenge}>
            Próximo desafio <ArrowRight size={12} />
          </Button>
        </div>
      )}
    </div>
  );
}

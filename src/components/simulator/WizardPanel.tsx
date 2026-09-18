import { useState } from 'react';
import { X, Check, ChevronRight, Play, MapPin, Sparkles, Zap } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { WIZARD_SCENARIOS } from '../../data/wizards';
import { evaluateStep } from '../../engine/wizard';
import { clsx } from 'clsx';

export function WizardPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topology = useSimulatorStore((s) => s.topology);
  const loadTopology = useSimulatorStore((s) => s.loadTopology);

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  if (!open) return null;

  const scenario = WIZARD_SCENARIOS[scenarioIndex] ?? WIZARD_SCENARIOS[0];
  const results = scenario.steps.map((s) => evaluateStep(topology, s));
  const current = scenario.steps[stepIndex];
  const currentResult = results[stepIndex];
  const doneCount = results.filter((r) => r.passed).length;
  const completed = results.every((r) => r.passed);

  const start = () => {
    loadTopology(scenario.base());
    setStarted(true);
    setStepIndex(0);
  };

  const next = () => {
    if (!results[stepIndex]?.passed) return;
    const idle = Math.min(stepIndex + 1, scenario.steps.length - 1);
    setStepIndex(idle);
  };

  const goStep = (i: number) => {
    const reachable = i <= 0 || results[i - 1]?.passed;
    if (reachable) setStepIndex(i);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[--color-border-primary]/60 bg-[#0D1424] shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border-primary]/50 sticky top-0 bg-[#0D1424] z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[--color-accent-cyan]/10 border border-[--color-accent-cyan]/30">
              <MapPin size={15} className="text-[--color-accent-cyan]" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[--color-text-primary]">
                Passo a passo (wizard)
              </h2>
              <p className="text-[10px] text-[--color-text-muted]">
                Monte redes seguindo um roteiro guiado com validação em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer"
            title="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Scenario picker */}
          {!started && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-muted]">
                Escolha um cenário
              </p>
              <div className="grid gap-2">
                {WIZARD_SCENARIOS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setScenarioIndex(i)}
                    className={clsx(
                      'text-left rounded-xl border px-3.5 py-3 cursor-pointer transition-colors',
                      i === scenarioIndex
                        ? 'border-[--color-accent-cyan]/50 bg-[--color-accent-cyan]/10'
                        : 'border-[--color-border-primary]/50 bg-[#111A2C]/40 hover:bg-[#1C2538]/60',
                    )}
                  >
                    <p className="text-xs font-semibold text-[--color-text-primary]">
                      {i + 1}. {s.title}
                    </p>
                    <p className="text-[10px] text-[--color-text-muted] leading-relaxed mt-0.5">
                      {s.description}
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={start}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[--color-accent-cyan] text-[#06121f] hover:bg-[--color-accent-cyan]/85 text-xs font-bold px-4 py-2.5 cursor-pointer transition-colors"
              >
                <Play size={13} /> Iniciar passo a passo
              </button>
              <p className="text-[10px] text-[--color-text-muted]/70">
                Ao iniciar, este cenário substitui o quadro atual.
              </p>
            </div>
          )}

          {/* Running */}
          {started && (
            <>
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[--color-bg-hover]/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[--color-accent-cyan] transition-all duration-300"
                    style={{ width: `${(doneCount / scenario.steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[--color-text-muted]">
                  {doneCount}/{scenario.steps.length}
                </span>
              </div>

              {/* Step list */}
              <div className="space-y-1.5">
                {scenario.steps.map((s, i) => {
                  const r = results[i];
                  const isCurrent = i === stepIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => goStep(i)}
                      className={clsx(
                        'w-full text-left flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                        isCurrent
                          ? 'border-[--color-accent-cyan]/40 bg-[--color-accent-cyan]/5'
                          : r.passed
                            ? 'border-[--color-status-connected]/25 bg-[--color-status-connected]/5'
                            : 'border-[--color-border-primary]/40 bg-[#111A2C]/30',
                      )}
                    >
                      <span
                        className={clsx(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                          r.passed
                            ? 'bg-[--color-status-connected]/15 text-[--color-status-connected]'
                            : isCurrent
                              ? 'bg-[--color-accent-cyan]/15 text-[--color-accent-cyan]'
                              : 'bg-[--color-bg-hover]/50 text-[--color-text-muted]',
                        )}
                      >
                        {r.passed ? <Check size={10} /> : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[--color-text-primary] truncate">
                          {s.title}
                        </p>
                        <p className="text-[9px] text-[--color-text-muted] truncate">
                          {r.passed ? (r.detail ?? 'Concluído') : (r.detail ?? 'Aguardando')}
                        </p>
                      </div>
                      {isCurrent && <Zap size={11} className="text-[--color-accent-cyan] ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Current step detail */}
              {current && (
                <div className="rounded-xl border border-[--color-border-primary]/50 bg-[#111A2C]/50 p-4 space-y-2">
                  <p className="text-xs font-bold text-[--color-accent-cyan]">
                    Passo {stepIndex + 1}: {current.title}
                  </p>
                  <p className="text-[10px] text-[--color-text-secondary] leading-relaxed">
                    {current.description}
                  </p>
                  {current.hint && (
                    <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
                      <span className="font-semibold text-[--color-accent-yellow]">Dica:</span>{' '}
                      {current.hint}
                    </p>
                  )}
                  {!currentResult?.passed && currentResult?.detail && (
                    <p className="text-[10px] text-[--color-accent-red] leading-relaxed">
                      Faltou: {currentResult.detail}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <button
                    onClick={() => setStepIndex((v) => Math.max(0, v - 1))}
                    className="rounded-lg border border-[--color-border-primary]/50 px-3 py-2 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer"
                  >
                    Voltar
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={!currentResult?.passed || completed}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition-colors',
                    currentResult?.passed && !completed
                      ? 'bg-[--color-accent-cyan] text-[#06121f] hover:bg-[--color-accent-cyan]/85 cursor-pointer'
                      : 'bg-[--color-bg-hover]/40 text-[--color-text-muted]/60 cursor-not-allowed',
                  )}
                >
                  {completed ? (
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} /> Cenário concluído!
                    </span>
                  ) : (
                    <>
                      Próximo passo <ChevronRight size={12} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setStarted(false); setStepIndex(0); }}
                  className="rounded-lg border border-[--color-border-primary]/50 px-3 py-2 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer"
                >
                  Trocar cenário
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
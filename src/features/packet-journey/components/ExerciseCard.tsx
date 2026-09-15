import { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, ChevronDown, GraduationCap, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useProgressStore } from '../../../stores/useProgressStore';
import { xpFor } from '../engine/scoring';
import type { ExerciseResult } from '../engine/scoring';
import type { JourneyExercise } from '../data/exercises';

interface Props {
  exercise: JourneyExercise;
  index: number;
  total: number;
  onDone: (r: ExerciseResult) => void;
}

export function ExerciseCard({ exercise, index, total, onDone }: Props) {
  const completeExercise = useProgressStore(s => s.completeExercise);
  const registerPractice = useProgressStore(s => s.registerPractice);

  const [selected, setSelected] = useState<string | null>(null);
  const [tries, setTries] = useState(1);
  const [hintLevel, setHintLevel] = useState(0);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [openDeep, setOpenDeep] = useState(false);

  const solved = selected === exercise.correct;
  const submitted = solved;
  const hints = exercise.hints.slice(0, hintLevel);
  const eliminated = hintLevel >= 4 ? exercise.options.find(o => o !== exercise.correct) : undefined;
  const xp = solved ? xpFor(tries, hintLevel) : 0;

  const pick = (opt: string) => {
    if (solved) return;
    setSelected(opt);
    setWrongPick(null);
    if (opt === exercise.correct) {
      completeExercise(exercise.id, [exercise.conceptId], xpFor(tries, hintLevel));
      registerPractice(exercise.conceptId, tries === 1 && hintLevel === 0);
    } else {
      setWrongPick(opt);
      setTries(t => t + 1);
      if (hintLevel === 0) setHintLevel(1);
    }
  };

  const useHint = () => {
    if (hintLevel >= exercise.hints.length) return;
    const next = hintLevel + 1;
    setHintLevel(next);
    if (next >= exercise.hints.length) {
      // Dica 5: revela a resposta com explicação
      completeExercise(exercise.id, [exercise.conceptId], 30);
      registerPractice(exercise.conceptId, false);
      setSelected(exercise.correct);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">
          Exercício {Math.min(index + 1, total)} de {total}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-[--color-text-muted]">
          <span>tentativas: <b className="text-[--color-text-secondary]">{tries}</b></span>
          <span>dicas: <b className="text-[--color-text-secondary]">{hintLevel}/5</b></span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[--color-text-primary]">{exercise.title}</h4>
        <p className="text-xs text-[--color-text-secondary] mt-1 leading-relaxed">{exercise.scenario}</p>
      </div>

      <div className={clsx('grid gap-1.5', exercise.options.length === 4 ? 'sm:grid-cols-2' : '')}>
        {exercise.options.map(opt => {
          const isCorrect = solved && opt === exercise.correct;
          const isWrong = wrongPick === opt;
          const isEliminated = eliminated === opt && !solved;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={solved || isEliminated}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all',
                isCorrect
                  ? 'border-[--color-accent-green]/50 bg-[--color-accent-green]/10 text-[--color-accent-green]'
                  : isWrong
                    ? 'border-[--color-accent-red]/50 bg-[--color-accent-red]/10 text-[--color-accent-red]'
                    : isEliminated
                      ? 'border-[--color-border-primary]/40 text-[--color-text-muted]/40 line-through cursor-not-allowed'
                      : 'border-[--color-border-primary] text-[--color-text-secondary] hover:border-[--color-accent-blue]/50 hover:bg-[#111A2C]'
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Dicas progressivas */}
      {!solved && (
        <div className="flex flex-col gap-1.5">
          {hints.map((hint, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-[--color-accent-yellow]/25 bg-[--color-accent-yellow]/5 px-3 py-2">
              <Lightbulb size={12} className="text-[--color-accent-yellow] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[--color-text-muted]">
                <span className="font-semibold text-[--color-accent-yellow]">Dica {i + 1}:</span> {hint}
              </p>
            </div>
          ))}
          {hintLevel < exercise.hints.length && (
            <button
              onClick={useHint}
              className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-accent-yellow] hover:border-[--color-accent-yellow]/40 cursor-pointer"
            >
              <Lightbulb size={12} /> Usar dica ({hintLevel}/5)
            </button>
          )}
          {wrongPick && !solved && (
            <div className="flex items-center gap-2 text-[11px] text-[--color-accent-red]">
              <XCircle size={12} /> Ainda não — tente de novo. O erro faz parte do aprendizado.
            </div>
          )}
        </div>
      )}

      {/* Resultado */}
      {solved && (
        <div className="rounded-lg border border-[--color-accent-green]/30 bg-[--color-accent-green]/8 px-3 py-2.5 flex items-start gap-2 animate-fade-in">
          <CheckCircle2 size={14} className="text-[--color-accent-green] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[--color-accent-green]">Correto! +{xp} XP</p>
            <p className="text-[11px] text-[--color-text-muted] mt-1 leading-relaxed">{exercise.quick}</p>
            <button
              onClick={() => setOpenDeep(v => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[--color-accent-blue] cursor-pointer hover:underline"
            >
              <GraduationCap size={11} /> Quero entender melhor <ChevronDown size={11} className={clsx('transition-transform', openDeep && 'rotate-180')} />
            </button>
            {openDeep && <p className="text-[11px] text-[--color-text-muted] mt-1.5 leading-relaxed animate-fade-in">{exercise.deep}</p>}
            <button
              onClick={() => onDone({ xp, tries, hints: hintLevel, solvedByHint: hintLevel >= exercise.hints.length })}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-gradient-to-b from-[--color-accent-blue] to-[#0071D6] shadow-md shadow-[#6366F1]/30 cursor-pointer hover:-translate-y-px transition-all"
            >
              Próximo exercício <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type { Quiz, QuizQuestion } from '../../data/quizzes';
import { clsx } from 'clsx';

interface QuizPlayerProps {
  quiz: Quiz;
  onExit: () => void;
  onFinish: (score: number, total: number) => void;
}

type AnswerState = 'idle' | 'answered';

function shuffleList<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function QuizPlayer({ quiz, onExit, onFinish }: QuizPlayerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    shuffleList(quiz.questions),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [showResult, setShowResult] = useState(false);

  const question = questions[currentIndex];
  const isCorrect = selectedIndex === question.correctIndex;
  const total = questions.length;

  function handleSelect(index: number) {
    if (answerState === 'answered') return;

    setSelectedIndex(index);
    setAnswerState('answered');

    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setWrongQuestions((w) => [...w, question]);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= total) {
      setShowResult(true);
      onFinish(score, total);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setAnswerState('idle');
    }
  }

  function handleRestart() {
    setQuestions(shuffleList(quiz.questions));
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswerState('idle');
    setScore(0);
    setWrongQuestions([]);
    setShowResult(false);
  }

  if (showResult) {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span
              className={clsx(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border',
                passed
                  ? 'bg-[--color-accent-green]/10 border-[--color-accent-green]/30 text-[--color-accent-green]'
                  : 'bg-[--color-accent-yellow]/10 border-[--color-accent-yellow]/30 text-[--color-accent-yellow]',
              )}
            >
              {passed ? <CheckCircle2 size={30} /> : <GraduationCap size={30} />}
            </span>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-[--color-text-primary] font-mono">
                {pct}%
              </p>
              <p className="text-xs text-[--color-text-muted] mt-1">
                {score} de {total} questões corretas
              </p>
            </div>
          </div>

          <div className="mt-5 mb-5 h-2 rounded-full bg-[--color-bg-tertiary] overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-150',
                passed ? 'bg-[--color-accent-green]' : 'bg-[--color-accent-yellow]',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p
            className={clsx(
              'mt-0 text-xs text-center leading-relaxed mb-5',
              passed
                ? 'text-[--color-accent-green]'
                : 'text-[--color-text-secondary]',
            )}
          >
            {passed
              ? 'Mandou bem! Você entendeu o conteúdo.'
              : 'Continue praticando. Leia as explicações abaixo e tente de novo.'}
          </p>

          {wrongQuestions.length > 0 && (
            <div className="text-left mb-5">
              <p className="text-xs font-semibold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
                Revisão — questões erradas
              </p>
              <div className="space-y-3">
                {wrongQuestions.map((q, i) => (
                  <div
                    key={q.id}
                    className="rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-[--color-text-primary] leading-relaxed line-clamp-2">
                        {i + 1}. {q.statement.split('\n')[0]}
                      </p>
                    </div>
                    <div className="mt-3 rounded-lg bg-[--color-accent-blue]/10 border border-[--color-accent-blue]/20 p-4">
                      <p className="text-[10px] font-semibold text-[--color-accent-cyan] uppercase tracking-wider mb-2">
                        Resposta certa: {q.alternatives[q.correctIndex].letter}) {q.alternatives[q.correctIndex].text}
                      </p>
                      <p className="text-xs text-[--color-text-secondary] leading-relaxed space-y-1">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold bg-[--color-bg-tertiary] text-[--color-text-secondary] border border-[--color-border-primary]/70 transition-colors hover:text-[--color-text-primary] cursor-pointer"
            >
              <RotateCcw size={12} /> Refazer
            </button>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 transition-colors hover:bg-[--color-accent-blue]/20 cursor-pointer"
            >
              <ArrowLeft size={12} /> Voltar à lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold text-[--color-text-secondary] truncate">
            {quiz.name}
          </span>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[--color-text-muted] border border-[--color-border-primary]/70 transition-colors hover:text-[--color-text-primary] cursor-pointer shrink-0"
          >
            <ArrowLeft size={12} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[--color-text-muted] font-medium whitespace-nowrap">
            Questão {currentIndex + 1} de {total}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-[--color-bg-tertiary] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[--color-accent-blue] to-[--color-accent-cyan]"
              style={{
                width: `${((currentIndex + (answerState === 'answered' ? 1 : 0)) / total) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-[--color-accent-green] font-mono whitespace-nowrap">
            {score} certa{score === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-6">
        {/* Statement */}
        <p className="text-sm text-[--color-text-primary] leading-relaxed whitespace-pre-line mb-5">
          {question.statement}
        </p>

        {/* Alternatives */}
        <div className="space-y-2">
          {question.alternatives.map((alt, index) => {
            const isSelected = selectedIndex === index;
            const isTheCorrect = index === question.correctIndex;
            const wasWrongPick = isSelected && !isTheCorrect;

            return (
              <button
                key={alt.letter}
                onClick={() => handleSelect(index)}
                disabled={answerState === 'answered'}
                className={clsx(
                  'w-full flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-[13px] transition-colors',
                  answerState === 'answered'
                    ? isTheCorrect
                      ? 'border-[--color-accent-green]/40 bg-[--color-accent-green]/10 text-[--color-accent-green]'
                      : wasWrongPick
                        ? 'border-[--color-accent-red]/40 bg-[--color-accent-red]/10 text-[--color-accent-red]'
                        : 'border-[--color-border-primary]/70 text-[--color-text-muted] opacity-60'
                    : 'cursor-pointer border-[--color-border-primary]/70 text-[--color-text-secondary] hover:border-[--color-accent-blue]/40 hover:text-[--color-text-primary]',
                  isSelected && answerState === 'idle' &&
                    'border-[--color-accent-blue]/40 bg-[--color-accent-blue]/10',
                )}
              >
                <span
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                    answerState === 'answered'
                      ? isTheCorrect
                        ? 'border-[--color-accent-green] text-[--color-accent-green] bg-[--color-accent-green]/20'
                        : wasWrongPick
                          ? 'border-[--color-accent-red] text-[--color-accent-red] bg-[--color-accent-red]/20'
                          : 'border-[--color-border-primary] text-[--color-text-muted]'
                      : 'border-[--color-border-primary]/70 text-[--color-text-muted]',
                  )}
                >
                  {alt.letter}
                </span>
                <span className="flex-1">{alt.text}</span>
                {answerState === 'answered' && isTheCorrect && (
                  <CheckCircle2 size={15} className="shrink-0 text-[--color-accent-green] mt-1" />
                )}
                {answerState === 'answered' && wasWrongPick && (
                  <XCircle size={15} className="shrink-0 text-[--color-accent-red] mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answerState === 'answered' && (
          <div
            className={clsx(
              'mt-6 rounded-lg border p-5',
              isCorrect
                ? 'border-[--color-accent-green]/40 bg-[--color-accent-green]/5'
                : 'border-[--color-accent-red]/40 bg-[--color-accent-red]/5',
            )}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 size={18} className="shrink-0 text-[--color-accent-green]" />
              ) : (
                <XCircle size={18} className="shrink-0 text-[--color-accent-red]" />
              )}
              <p
                className={clsx(
                  'text-sm font-semibold',
                  isCorrect ? 'text-[--color-accent-green]' : 'text-[--color-accent-red]',
                )}
              >
                {isCorrect ? 'Correto!' : 'Resposta errada'}
              </p>
            </div>

            {!isCorrect && (
              <>
                <p className="mt-3 text-xs text-[--color-text-secondary] leading-relaxed">
                  A resposta correta é a alternativa{' '}
                  <span className="font-semibold text-[--color-text-primary]">
                    {question.alternatives[question.correctIndex].letter}) {question.alternatives[question.correctIndex].text}
                  </span>
                  .
                </p>

                <div className="mt-4 rounded-lg border border-[--color-accent-blue]/20 bg-[--color-accent-blue]/10 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <GraduationCap size={14} className="shrink-0 text-[--color-accent-cyan]" />
                    <span className="text-[10px] font-semibold text-[--color-accent-cyan] uppercase tracking-wider">
                      Aprenda com esta questão
                    </span>
                  </div>
                  <p className="text-xs text-[--color-text-primary] leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </>
            )}

            <button
              onClick={handleNext}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 cursor-pointer"
            >
              {currentIndex + 1 >= total ? 'Ver resultado' : 'Próxima questão'}
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
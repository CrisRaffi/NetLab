import { Play, Clock, ListChecks } from 'lucide-react';
import type { Quiz } from '../../data/quizzes';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
  bestScore?: { score: number; total: number } | null;
}

export function QuizCard({ quiz, onStart, bestScore }: QuizCardProps) {
  return (
    <div className="rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-5 flex flex-col gap-3 transition-colors hover:border-[--color-accent-blue]/40">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[--color-accent-purple]/10 text-[--color-accent-purple] border border-[--color-accent-purple]/30 px-2.5 py-0.5 text-[10px] font-medium">
          {quiz.topic}
        </span>
        {bestScore !== null && bestScore !== undefined && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[--color-text-muted] font-mono">
            Melhor: {bestScore.score}/{bestScore.total}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-[--color-text-primary] leading-snug">
        {quiz.name}
      </h3>

      <p className="text-xs text-[--color-text-muted] leading-relaxed flex-1">
        {quiz.description}
      </p>

      <div className="flex items-center gap-4 text-[10px] text-[--color-text-muted]">
        <span className="inline-flex items-center gap-1">
          <ListChecks size={11} /> {quiz.questions.length} perguntas
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={11} /> {'~' +
            Math.ceil(quiz.questions.length * 1.5)} min
        </span>
      </div>

      <button
        onClick={() => onStart(quiz.id)}
        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-3 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 cursor-pointer"
      >
        <Play size={12} /> Iniciar Questionário
      </button>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, BookOpen, Lightbulb } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';
import { QuizCard } from '../components/quiz/QuizCard';
import { QuizPlayer } from '../components/quiz/QuizPlayer';
import { QUIZZES, getQuizById } from '../data/quizzes';
import { useQuizStore } from '../stores/useQuizStore';

export function QuizzesPage() {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const results = useQuizStore((s) => s.results);
  const recordResult = useQuizStore((s) => s.recordResult);

  const activeQuiz = activeQuizId ? getQuizById(activeQuizId) : undefined;

  if (activeQuiz) {
    return (
      <div className="page-container space-y-6">
        <QuizPlayer
          quiz={activeQuiz}
          onExit={() => setActiveQuizId(null)}
          onFinish={(score, total) => recordResult(activeQuiz.id, score, total)}
        />
      </div>
    );
  }

  const completedCount = Object.keys(results).length;

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Questionários"
        subtitle="Responda às perguntas e aprenda o assunto de cada questão que errar."
        accent="purple"
        icon={<ClipboardList size={19} />}
        badge={
          completedCount > 0 ? (
            <Badge tone="green">
              {completedCount} concluído{completedCount === 1 ? '' : 's'}
            </Badge>
          ) : undefined
        }
      />

      <div className="rounded-lg border border-[--color-accent-blue]/20 bg-[--color-accent-blue]/5 p-4 flex items-start gap-3">
        <Lightbulb size={15} className="text-[--color-accent-cyan] shrink-0 mt-0.5" />
        <p className="text-xs text-[--color-text-secondary] leading-relaxed">
          Cada questionário tem um nome e um tema. Ao responder errado, o sistema
          exibe uma explicação para que você estude e aprenda o assunto antes de
          avançar. Ao final, as questões erradas são revisadas com o gabarito.
        </p>
        <Link
          to="/aprender/transporte-pdu"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 shrink-0"
        >
          <BookOpen size={12} /> Estudar o conteúdo
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {QUIZZES.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onStart={setActiveQuizId}
            bestScore={
              results[quiz.id]
                ? {
                    score: results[quiz.id].bestScore,
                    total: results[quiz.id].total,
                  }
                : null
            }
          />
        ))}

        {QUIZZES.length === 0 && (
          <div className="rounded-xl border border-dashed border-[--color-border-primary] bg-[--color-bg-card] p-8 flex flex-col items-center justify-center text-center gap-2">
            <BookOpen size={26} className="text-[--color-text-muted]" />
            <p className="text-sm text-[--color-text-secondary]">
              Nenhum questionário disponível.
            </p>
            <p className="text-xs text-[--color-text-muted]">
              Novos questionários serão adicionados em breve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
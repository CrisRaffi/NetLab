import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Timer,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { clsx } from 'clsx';
import { useStudyAreaStore } from '../stores/useStudyAreaStore';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StudyAreaPage() {
  const navigate = useNavigate();
  const {
    isRunning,
    elapsedSeconds,
    goalSeconds,
    sessions,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setGoal,
    completeSession,
    clearSessions,
  } = useStudyAreaStore();

  const rafRef = useRef<number | null>(null);
  const [goalMinutes, setGoalMinutes] = useState(Math.round(goalSeconds / 60));
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [sessionNote, setSessionNote] = useState('');

  useEffect(() => {
    if (!isRunning) return;
    rafRef.current = requestAnimationFrame((now) => tick(now));
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, tick]);

  const progress = goalSeconds > 0 ? (elapsedSeconds / goalSeconds) * 100 : 0;

  const handleStartPause = () => {
    if (isRunning) pauseTimer();
    else startTimer();
  };

  const handleSaveGoal = () => {
    const minutes = Math.max(1, Math.round(goalMinutes));
    setGoal(minutes);
  };

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card
          title="Cronômetro de estudo"
          subtitle="Acompanhe o tempo da sua sessão livre"
          icon={<Timer size={18} strokeWidth={2.5} />}
        >
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="flex flex-col items-center justify-center">
                <Timer size={32} strokeWidth={2.5} className="text-[--color-text-muted] mb-2" />
                <span className="font-mono text-[--color-text-primary] tracking-tighter text-2xl">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant={isRunning ? 'danger' : 'success'}
                size="lg"
                onClick={handleStartPause}
              >
                {isRunning ? (
                  <>
                    <Pause size={16} /> Pausar
                  </>
                ) : (
                  <>
                    <Play size={16} /> Iniciar
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={resetTimer}>
                <RefreshCw size={16} /> Reiniciar
              </Button>
            </div>
            <p className="mt-3 text-xs text-[--color-text-muted]">
              {isRunning ? 'Em andamento...' : 'Pronto para começar'}
            </p>
          </div>
        </Card>

        {/* Meta */}
        <Card title="Meta de tempo" subtitle="Defina quanto pretende estudar nesta sessão">
          <div className="space-y-4">
            <ProgressBar value={progress} showLabel colorClass="bg-gradient-to-r from-[#6366F1] to-[#4F46E5]" />
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[--color-text-secondary]">Meta:</span>
              <input
                type="number"
                min="1"
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-[#0D1424]/60 border border-[--color-border-primary]/40 rounded-lg px-2 py-1.5 text-xs text-[--color-text-primary] outline-none focus:border-[--color-accent-blue]/50"
              />
              <span className="text-[--color-text-muted]">minutos</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveGoal}
              className="w-full"
            >
              Salvar meta
            </Button>
            <p className="text-xs text-[--color-text-muted]">
              {elapsedSeconds >= goalSeconds && goalSeconds > 0
                ? 'Meta atingida! Parabéns.'
                : `Faltam ${formatTime(Math.max(0, goalSeconds - elapsedSeconds))} para a meta.`}
            </p>
          </div>
        </Card>

        {/* Resumo rápido */}
        <Card title="Sessão atual" subtitle={formatTime(elapsedSeconds) + ' acumulados'}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--color-text-secondary]">Tempo decorrido</span>
              <span className="font-mono text-[--color-text-primary]">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--color-text-secondary]">Meta definida</span>
              <span className="font-mono text-[--color-text-primary]">{formatTime(goalSeconds)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[--color-text-secondary]">Avanço</span>
              <span className="font-mono text-[--color-text-primary]">{Math.min(100, progress).toFixed(0)}%</span>
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => setShowNoteDialog(true)}
              disabled={elapsedSeconds === 0}
              className="w-full"
            >
              <CheckCircle size={14} /> Finalizar sessão
            </Button>
          </div>
        </Card>
      </div>

      {/* Histórico */}
      <Card title="Histórico de sessões" subtitle={sessions.length + ' sessões registradas'}>
        <div className={sessions.length === 0 ? 'text-center py-10' : ''}>
          {sessions.length === 0 && (
            <div className="flex flex-col items-center gap-3 text-[--color-text-muted]">
              <Clock size={32} opacity={0.5} />
              <p>Nenhuma sessão registrada ainda.</p>
              <p className="text-xs">Inicie o cronômetro e finalize uma sessão para acompanhar seu progresso.</p>
            </div>
          )}
          {sessions.length > 0 && (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-[--color-border-primary]/30 bg-[#0D1424]/40"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      size={14}
                      className={clsx(
                        session.completed ? 'text-[#10B981]' : 'text-[--color-text-muted]',
                      )}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[--color-text-primary] truncate">
                        {formatSessionDate(session.startedAt)}
                      </div>
                      <div className="text-[10px] text-[--color-text-muted]">
                        {formatTime(session.durationSeconds)} •
                        {session.goalSeconds
                          ? `meta ${formatTime(session.goalSeconds)}`
                          : 'sem meta'}
                      </div>
                      {session.note && (
                        <p className="text-[10px] text-[--color-text-muted] truncate mt-0.5" title={session.note}>
                          "{session.note}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={clsx(
                      'font-mono text-xs ' +
                        (session.completed
                          ? 'text-[#10B981]'
                          : 'text-[--color-text-secondary]'),
                    )}>
                      {session.completed ? 'Meta atingida' : formatTime(session.durationSeconds)}
                    </span>
                  </div>
                </div>
              ))}
              <Button
                variant="danger"
                size="sm"
                onClick={clearSessions}
                className="mt-3"
              >
                <Trash2 size={14} /> Limpar histórico
              </Button>
            </div>
          )}
        </div>
      </Card>

      {showNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNoteDialog(false)}
          />
          <div className="relative bg-[#0D1424]/90 border border-[--color-border-primary]/60 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-[--color-text-primary] mb-4">
              O que você estudou nesta sessão?
            </h3>
            <textarea
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Ex.: revisei subnetting e pratiquei comandos de roteamento estático…"
              className="w-full min-h-[100px] bg-[#020A14]/60 border border-[--color-border-primary]/40 rounded-lg px-3 py-2 text-sm text-[--color-text-primary] outline-none focus:border-[--color-accent-blue]/50 resize-y"
            />
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNoteDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  completeSession(sessionNote.trim() || undefined);
                  setShowNoteDialog(false);
                  setSessionNote('');
                }}
              >
                Salvar sessão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

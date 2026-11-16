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
  Download,
  Edit2,
  Filter,
  Eye,
  Maximize2,
  Minimize2,
  BarChart3,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { clsx } from 'clsx';
import { useStudyAreaStore, CATEGORY_LABELS, type StudyCategory, type StudySession } from '../stores/useStudyAreaStore';

function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
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

const CATEGORY_COLORS: Record<StudyCategory, string> = {
  subnetting: '#6366F1',
  roteamento: '#10B981',
  ipv6: '#3B82F6',
  switching: '#8B5CF6',
  seguranca: '#EF4444',
  outro: '#94A3B8',
};

export default function StudyAreaPage() {
  const navigate = useNavigate();
  const isRunning = useStudyAreaStore((s) => s.isRunning);
  const elapsedSeconds = useStudyAreaStore((s) => s.elapsedSeconds);
  const goalSeconds = useStudyAreaStore((s) => s.goalSeconds);
  const weeklyGoalSeconds = useStudyAreaStore((s) => s.weeklyGoalSeconds);
  const sessions = useStudyAreaStore((s) => s.sessions);
  const currentCategory = useStudyAreaStore((s) => s.currentCategory);
  const startTimer = useStudyAreaStore((s) => s.startTimer);
  const pauseTimer = useStudyAreaStore((s) => s.pauseTimer);
  const resetTimer = useStudyAreaStore((s) => s.resetTimer);
  const tick = useStudyAreaStore((s) => s.tick);
  const setGoal = useStudyAreaStore((s) => s.setGoal);
  const setWeeklyGoal = useStudyAreaStore((s) => s.setWeeklyGoal);
  const setCategory = useStudyAreaStore((s) => s.setCategory);
  const completeSession = useStudyAreaStore((s) => s.completeSession);
  const updateSession = useStudyAreaStore((s) => s.updateSession);
  const clearSessions = useStudyAreaStore((s) => s.clearSessions);

  const [goalMinutes, setGoalMinutes] = useState(Math.round(goalSeconds / 60));
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(
    Math.round(weeklyGoalSeconds / 60)
  );
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editDurationMinutes, setEditDurationMinutes] = useState(0);
  const [editCategory, setEditCategory] = useState<StudyCategory | undefined>(undefined);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [goalReachedNotifier, setGoalReachedNotifier] = useState(false);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const progress =
    goalSeconds && goalSeconds > 0
      ? Math.max(0, Math.min(100, (Number(elapsedSeconds || 0) / Number(goalSeconds)) * 100))
      : 0;

  const weeklyProgress = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekTotal = sessions
      .filter((s) => {
        const d = new Date(s.startedAt);
        return d >= weekStart && d <= now;
      })
      .reduce((acc, s) => acc + s.durationSeconds, 0);

    return weeklyGoalSeconds > 0
      ? Math.max(0, Math.min(100, (weekTotal / weeklyGoalSeconds) * 100))
      : 0;
  };

  const todayTotal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => new Date(s.startedAt).toDateString() === today.toDateString())
      .reduce((acc, s) => acc + s.durationSeconds, 0);
  };

  const weekTotal = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => {
        const d = new Date(s.startedAt);
        return d >= weekStart && d <= now;
      })
      .reduce((acc, s) => acc + s.durationSeconds, 0);
  };

  const monthlyTotal = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return sessions
      .filter((s) => new Date(s.startedAt) >= monthStart && new Date(s.startedAt) <= now)
      .reduce((acc, s) => acc + s.durationSeconds, 0);
  };

  const goalReached = elapsedSeconds > 0 && progress >= 100;

  useEffect(() => {
    if (goalReached && !goalReachedNotifier) {
      setGoalReachedNotifier(true);
    }
  }, [goalReached, goalReachedNotifier]);

  const handleStartPause = () => {
    if (isRunning) pauseTimer();
    else startTimer();
  };

  const handleSaveGoal = () => {
    const minutes = Math.max(1, Math.round(goalMinutes));
    setGoal(minutes);
    setGoalMinutes(minutes);
  };

  const handleSaveWeeklyGoal = () => {
    const minutes = Math.max(1, Math.round(weeklyGoalMinutes));
    setWeeklyGoal(minutes);
    setWeeklyGoalMinutes(minutes);
  };

  const handleComplete = () => {
    setShowNoteDialog(true);
  };

  const handleSaveSession = () => {
    completeSession(elapsedSeconds, sessionNote.trim() || undefined, currentCategory);
    setShowNoteDialog(false);
    setSessionNote('');
    resetTimer();
    setGoalReachedNotifier(false);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setEditNote(session.note ?? '');
    setEditDurationMinutes(Math.round(session.durationSeconds / 60));
    setEditCategory(session.category);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingSession) return;
    updateSession(editingSession.id, {
      durationSeconds: Math.max(0, editDurationMinutes * 60),
      ...(editNote ? { note: editNote } : {}),
      ...(editCategory ? { category: editCategory } : {}),
    });
    setShowEditDialog(false);
    setEditingSession(null);
  };

  const handleExport = () => {
    const headers = 'Data,Tempo (s),Meta (s),Categoria,Nota,Concluída';
    const rows = sessions
      .map(
      (s) =>
        `"${formatSessionDate(s.startedAt)}","${s.durationSeconds}","${s.goalSeconds ?? ''}","${
          s.category ? CATEGORY_LABELS[s.category] : ''
        }","${(s.note ?? '').replace(/"/g, '""')}","${s.completed ? 'Sim' : 'Não'}"`
      )
      .join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estudo-area-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDialog(false);
  };

  const dailyData = () => {
    const data: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      data[d.toISOString().slice(0, 10)] = 0;
    }
    sessions.forEach((s) => {
      const key = new Date(s.startedAt).toISOString().slice(0, 10);
      if (key in data) data[key] += s.durationSeconds;
    });
    return Object.entries(data);
  };

  return (
    <div
      className={clsx(
        'space-y-6 px-4 lg:px-8 py-6',
        showFocusMode ? 'lg:px-0' : ''
      )}
    >
      {!showFocusMode && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Voltar
          </Button>
        </div>
      )}

      {!showFocusMode && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[--color-text-primary]">
              Área de Estudo Livre
            </h1>
            <p className="text-xs text-[--color-text-muted]">
              Acompanhe o tempo da sua sessão de estudos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFocusMode(true)}
            >
              <Maximize2 size={14} /> Foco
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
              <Download size={14} /> Exportar CSV
            </Button>
          </div>
        </div>
      )}

      {!showFocusMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <Card title="Cronômetro de estudo">
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="flex flex-col items-center justify-center">
                <Timer
                  size={32}
                  strokeWidth={2.5}
                  className="text-[--color-text-muted] mb-2"
                />
                <span className={clsx(
                  'font-mono text-[--color-text-primary] tracking-tighter text-2xl',
                  goalReached ? 'text-[#10B981]' : ''
                )}>
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
              {goalReachedNotifier && (
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-medium flex items-center gap-2">
                  <CheckCircle size={14} fill="#10B981" />
                  Meta da sessão atingida!
                </div>
              )}
            </div>
          </Card>

          {/* Meta */}
          <Card title="Meta de tempo" subtitle="Defina quanto pretende estudar nesta sessão">
            <div className="space-y-4">
              <ProgressBar
                value={progress}
                showLabel
                colorClass={`from-[#6366F1] to-[#4F46E5]`}
              />
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[--color-text-secondary]">Meta:</span>
                <input
                  type="number"
                  min="1"
                  value={goalMinutes}
                  onChange={(e) =>
                    setGoalMinutes(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 bg-[#0D1424]/60 border border-[--color-border-primary]/40 rounded-lg px-2 py-1.5 text-xs text-[--color-text-primary] outline-none focus:border-[--color-accent-blue]/50"
                />
                <span className="text-[--color-text-muted]">minutos</span>
              </div>
              <Button variant="primary" size="sm" onClick={handleSaveGoal} className="w-full">
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
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-[--color-text-secondary]">Categoria:</span>
                <span className={clsx('font-mono text-xs px-2 py-0.5 rounded bg-[#0D1424]/40 border border-[--color-border-primary]/30')}>
                  {currentCategory ? CATEGORY_LABELS[currentCategory] : 'Sem categoria'}
                </span>
              </div>
              <Button
                variant="accent"
                size="sm"
                onClick={handleComplete}
                disabled={elapsedSeconds === 0}
                className="w-full"
              >
                <CheckCircle size={14} /> Finalizar sessão
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Categoria rápida */}
      {!showFocusMode && (
        <Card title="Categoria da sessão" subtitle="Escolha o que está estudando agora">
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const cat = key as StudyCategory;
              const isActive = currentCategory === cat;
              return (
                <Button
                  key={key}
                  variant={isActive ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className="flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  {label}
                </Button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Metas semanais e totais */}
      {!showFocusMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Meta semanal" subtitle="Defina quanto pretende estudar esta semana">
            <div className="space-y-4">
              <ProgressBar value={weeklyProgress()} showLabel colorClass="from-[#10B981] to-[#34D399]" />
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[--color-text-secondary]">Meta semanal:</span>
                <input
                  type="number"
                  min="1"
                  value={weeklyGoalMinutes}
                  onChange={(e) => setWeeklyGoalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-[#0D1424]/60 border border-[--color-border-primary]/40 rounded-lg px-2 py-1.5 text-xs text-[--color-text-primary] outline-none focus:border-[--color-accent-blue]/50"
                />
                <span className="text-[--color-text-muted]">minutos</span>
              </div>
              <Button variant="primary" size="sm" onClick={handleSaveWeeklyGoal} className="w-full">
                Salvar meta semanal
              </Button>
            </div>
          </Card>

          <Card title="Tempo hoje" subtitle="Sessões registradas hoje">
            <div className="text-2xl font-mono text-[--color-text-primary]">{formatTime(todayTotal())}</div>
          </Card>

          <Card title="Tempo esta semana" subtitle="Últimos 7 dias">
            <div className="text-2xl font-mono text-[--color-text-primary]">{formatTime(weekTotal())}</div>
          </Card>

          <Card title="Tempo este mês" subtitle="Período vigente">
            <div className="text-2xl font-mono text-[--color-text-primary]">{formatTime(monthlyTotal())}</div>
          </Card>
        </div>
      )}

      {/* Gráfico simples (últimos 7 dias) */}
      {!showFocusMode && (
        <Card title="Tempo por dia (últimos 7 dias)" subtitle="Barra por dia da semana">
          <div className="flex items-end gap-2 h-40">
            {dailyData().map(([date, seconds]) => {
              const dayLabel = new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' });
              const max = Math.max(...dailyData().map(([, v]) => v), 1);
              const height = Math.max((seconds / max) * 100, 5);
              return (
                <div key={date} className="flex flex-col items-center gap-1.5 w-full">
                  <div
                    className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      background: `linear-gradient(to top, ${CATEGORY_COLORS['outro']}, ${CATEGORY_COLORS['subnetting']})`,
                      height: `${height}%`,
                    }}
                    title={`${dayLabel}: ${formatTime(seconds)}`}
                  />
                  <span className="text-[10px] text-[--color-text-muted]">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Histórico */}
      {!showFocusMode && (
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
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-[--color-border-primary]/30 bg-[#0D1424]/40 group"
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
                        {session.category && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[session.category] }} />
                            <span className="text-[10px] text-[--color-text-muted]">{CATEGORY_LABELS[session.category]}</span>
                          </div>
                        )}
                        {session.note && (
                          <p className="text-[10px] text-[--color-text-muted] truncate mt-0.5" title={session.note}>
                            "{session.note}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'font-mono text-xs ' +
                          (session.completed
                            ? 'text-[#10B981]'
                            : 'text-[--color-text-secondary]'),
                      )}>
                        {session.completed ? 'Meta atingida' : formatTime(session.durationSeconds)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSession(session)}
                        className="p-1"
                      >
                        <Edit2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="danger" size="sm" onClick={clearSessions} className="mt-3">
                  <Trash2 size={14} /> Limpar histórico
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal: O que você estudou */}
      {showNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNoteDialog(false)} />
          <div className="relative bg-[#0D1424]/90 border border-[--color-border-primary]/60 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-[--color-text-primary] mb-4">
              O que você estudou nesta sessão?
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const cat = key as StudyCategory;
                const isActive = currentCategory === cat;
                return (
                  <Button
                    key={key}
                    variant={isActive ? 'accent' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className="flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                    {label}
                  </Button>
                );
              })}
            </div>
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
              <Button variant="primary" size="sm" onClick={handleSaveSession}>
                Salvar sessão
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar sessão */}
      {showEditDialog && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditDialog(false)} />
          <div className="relative bg-[#0D1424]/90 border border-[--color-border-primary]/60 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-[--color-text-primary] mb-4">
              Editar sessão
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[--color-text-muted] block mb-1">Duração (minutos)</label>
                <input
                  type="number"
                  min="0"
                  value={editDurationMinutes}
                  onChange={(e) => setEditDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#020A14]/60 border border-[--color-border-primary]/40 rounded-lg px-2 py-1.5 text-xs text-[--color-text-primary] outline-none focus:border-[--color-accent-blue]/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-[--color-text-muted] block mb-1">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                    const cat = key as StudyCategory;
                    const isActive = editCategory === cat;
                    return (
                      <Button
                        key={key}
                        variant={isActive ? 'accent' : 'outline'}
                        size="sm"
                        onClick={() => setEditCategory(cat)}
                        className="flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                        {label}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditCategory(undefined)}
                    className="flex items-center gap-1.5"
                  >
                    <Eye size={14} /> Sem categoria
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[--color-text-muted] block mb-1">Nota</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Ex.: revisei subnetting e pratiquei comandos de roteamento estático…"
                  className="w-full min-h-[80px] bg-[#020A14]/60 border border-[--color-border-primary]/40 rounded-lg px-2 py-1.5 text-xs text-[--color-text-primary] outline-none focus:border-[--color-accent-blue]/50 resize-y"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Salvar alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exportar */}
      {showExportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportDialog(false)} />
          <div className="relative bg-[#0D1424]/90 border border-[--color-border-primary]/60 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-[--color-text-primary] mb-4">
              Exportar histórico
            </h3>
            <p className="text-xs text-[--color-text-muted] mb-4">
              O arquivo CSV conterá todas as sessões registradas com data, duração, meta, categoria e nota.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleExport}>
                <Download size={14} /> Baixar CSV
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Focus mode overlay */}
      {showFocusMode && (
        <div className="fixed inset-0 z-[60] bg-[#020A14] flex flex-col items-center justify-center p-6 gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[--color-text-primary] mb-2">Modo Foco</h1>
            <p className="text-[--color-text-muted]">Sem distrações. Apenas você e o cronômetro.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Timer size={64} strokeWidth={4} className="text-[--color-text-muted]" />
            <span className={clsx('font-mono text-[--color-text-primary] tracking-tighter text-4xl', goalReached ? 'text-[#10B981]' : '')}>
              {formatTime(elapsedSeconds)}
            </span>
            <div className="flex items-center gap-3">
              <Button variant={isRunning ? 'danger' : 'success'} size="lg" onClick={handleStartPause}>
                {isRunning ? 'Pausar' : 'Iniciar'}
              </Button>
              <Button variant="outline" size="lg" onClick={resetTimer}>Reiniciar</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowFocusMode(false)}>
              <Minimize2 size={14} /> Sair do modo foco
            </Button>
          </div>
          {goalReachedNotifier && (
            <div className="px-4 py-2 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-sm font-medium">
              <CheckCircle size={16} fill="#10B981" /> Meta da sessão atingida!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

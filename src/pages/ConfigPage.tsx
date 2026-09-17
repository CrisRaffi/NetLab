import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  AlertTriangle,
  Settings,
  Info,
  ShieldCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { useProgressStore } from '../stores/useProgressStore';
import { useAuth } from '../features/auth/AuthContext';
import { getAuthLogs, type AuthEventType } from '../features/auth/authLog';

const EVENT_LABELS: Record<AuthEventType, { label: string; tone: string }> = {
  'login.success': { label: 'Login realizado', tone: '--color-accent-green' },
  'login.failed': { label: 'Tentativa de login falhou', tone: '--color-accent-red' },
  'register.success': { label: 'Conta criada', tone: '--color-accent-green' },
  'register.failed': { label: 'Tentativa de cadastro falhou', tone: '--color-accent-red' },
  'reset.sent': { label: 'Redefinição de senha solicitada', tone: '--color-accent-yellow' },
  'reset.failed': { label: 'Falha ao solicitar redefinição', tone: '--color-accent-red' },
  logout: { label: 'Saiu da conta', tone: '--color-text-muted' },
};

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

function formatAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute');
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return rtf.format(-diffH, 'hour');
  return rtf.format(-Math.round(diffH / 24), 'day');
}

export function ConfigPage() {
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [logs] = useState(() => getAuthLogs().slice(0, 8));

  const handleReset = () => {
    resetProgress();
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="page-container space-y-6 max-w-2xl">
      <PageHeader
        title="Configurações"
        subtitle="Preferências e dados da sua conta."
        accent="cyan"
        icon={<Settings size={19} />}
      />

      <Card title="Dados de Progresso" icon={<Trash2 size={15} />}>
        <p className="text-sm text-[--color-text-muted] mb-2">
          Resete todo o seu progresso. Esta ação é irreversível.
        </p>
        {showConfirm ? (
          <div className="rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/5 p-3">
            <div className="flex items-center gap-2 mb-2 text-[--color-accent-red]">
              <AlertTriangle size={15} />
              <span className="text-sm font-medium">Tem certeza?</span>
            </div>
            <p className="text-xs text-[--color-text-muted] mb-2">
              Todo o progresso, conquistas e XP serão perdidos.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleReset}>
                Sim, resetar tudo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowConfirm(true)}
          >
            Resetar progresso
          </Button>
        )}
        {resetDone && (
          <p className="text-xs text-[--color-accent-green] mt-2">
            Progresso resetado com sucesso.
          </p>
        )}
      </Card>

      <Card title="Conta e Segurança" icon={<ShieldCheck size={15} />}>
        <div className="text-sm text-[--color-text-muted] mb-2">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[--color-text-primary] font-semibold truncate">
                  {user.displayName ?? 'Aluno'}
                </p>
                <p className="text-xs break-all">{user.email}</p>
              </div>
              <Button variant="danger" size="sm" onClick={handleSignOut}>
                <LogOut size={12} /> Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[--color-text-primary] font-semibold">
                  Visitante
                </p>
                <p className="text-xs">Seu progresso fica só neste dispositivo.</p>
              </div>
              <Link
                to="/entrar"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 shrink-0"
              >
                <LogIn size={12} /> Entrar
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[--color-border-primary]/40">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary] mb-2">
            Eventos recentes de segurança
          </p>
          {logs.length === 0 ? (
            <p className="text-xs text-[--color-text-muted]">
              Nenhum evento registrado ainda.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {logs.map((e, i) => {
                const meta = EVENT_LABELS[e.type] ?? EVENT_LABELS.logout;
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span
                      className="flex items-center gap-2 truncate"
                      style={{ color: `var(${meta.tone})` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-70" />
                      <span className="truncate">{meta.label}</span>
                    </span>
                    <span className="text-[--color-text-muted] shrink-0 text-[10px]">
                      {formatAgo(e.at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      <Card
        title="Sobre"
        subtitle="Informações do projeto"
        icon={<Info size={15} />}
      >
        <div className="space-y-2 text-xs text-[--color-text-muted]">
          <p>
            <strong className="text-[--color-text-primary]">NetLab</strong>{' '}
            v0.1.0
          </p>
          <p>Laboratório Virtual de Redes de Computadores</p>
          <p>Phase 1: Foundation — completed</p>
          <p className="text-[--color-text-muted]/70 mt-2">
            Stack: React, TypeScript, Vite, Zustand, Tailwind CSS
          </p>
        </div>
      </Card>
    </div>
  );
}

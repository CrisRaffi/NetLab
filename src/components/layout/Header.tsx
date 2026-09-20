import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  CircleUserRound,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { logAuthEvent } from '../../features/auth/authLog';
import { clsx } from 'clsx';
import { CommandSearch } from './CommandSearch';

export function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    setShowUserMenu(false);
    await signOut();
    logAuthEvent('logout', { email: user?.email ?? undefined });
    navigate('/');
  }

  return (
    <header className="relative flex items-center justify-between gap-4 h-16 px-4 lg:px-6 bg-[--color-bg-secondary]/55 backdrop-blur-md shrink-0 z-30">
      <div
        aria-hidden
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[--color-accent-blue]/45 to-transparent"
      />
      {/* Menu (mobile) */}
      {onOpenMenu && (
        <button
          onClick={onOpenMenu}
          className="lg:hidden p-2.5 -ml-1.5 rounded-xl text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu size={19} />
        </button>
      )}
      {/* Search */}
      <div className="flex flex-1 max-w-xl mx-auto">
        <CommandSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className={clsx(
              'relative p-2.5 rounded-xl text-[--color-text-muted] transition-all cursor-pointer',
              showNotifications
                ? 'bg-white/5 text-[--color-text-primary]'
                : 'hover:text-[--color-text-primary] hover:bg-white/5',
            )}
            aria-label="Notificações"
          >
            <Bell size={17} />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2.5 w-72 rounded-2xl bg-[--color-bg-card] border border-[--color-border-primary] shadow-2xl shadow-black/50 overflow-hidden z-40 glass-strong animate-fade-in-up">
              <div className="px-4 py-3 border-b border-[--color-border-primary]/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-[--color-text-primary]">
                  Notificações
                </span>
                <span className="chip bg-[--color-accent-blue]/10 text-[--color-accent-blue]">
                  0
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 text-xs text-[--color-text-muted] text-center">
                <Sparkles size={18} className="text-[--color-accent-blue]/60" />
                Nenhuma notificação no momento
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2.5 pl-3 ml-1.5 border-l border-[--color-border-primary]/25 cursor-pointer"
              aria-label="Menu da conta"
            >
              <div className="flex h-9 w-9 rounded-full bg-gradient-to-br from-[--color-border-secondary] to-[#1C2538] border border-[--color-accent-blue]/25 items-center justify-center text-[--color-text-primary] text-xs font-bold">
                {(user.displayName ?? user.email ?? '?')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden lg:block leading-tight text-left">
                <p className="text-xs font-semibold text-[--color-text-primary] max-w-[180px] truncate">
                  {user.displayName ?? 'Aluno'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="flex items-center gap-1 text-[9px] text-[--color-status-connected] font-medium">
                    <span className="w-1 h-1 rounded-full bg-[--color-status-connected]" /> Online
                  </span>
                  <span className="text-[9px] text-[--color-text-muted] max-w-[160px] truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <ChevronDown size={12} className="hidden lg:block text-[--color-text-muted]/60" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2.5 w-64 rounded-2xl bg-[--color-bg-card] border border-[--color-border-primary] shadow-2xl shadow-black/50 overflow-hidden z-40 glass-strong animate-fade-in-up">
                <div className="px-4 py-3 border-b border-[--color-border-primary]/50">
                  <p className="text-xs font-semibold text-[--color-text-primary]">
                    {user.displayName ?? 'Aluno'}
                  </p>
                  <p className="text-[10px] text-[--color-text-muted] break-all">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[--color-text-secondary] hover:bg-white/5 hover:text-[--color-text-primary] transition-colors cursor-pointer"
                >
                  <LogOut size={13} className="text-[--color-accent-red]" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 ml-1.5 border-l border-[--color-border-primary]/25">
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[--color-text-muted] px-1">
              <CircleUserRound size={15} className="text-[--color-text-muted]/70" />
              Visitante
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
    </header>
  );
}
import { useState } from 'react';
import { Bell, Search, Activity, Sparkles, ChevronDown } from 'lucide-react';
import { useProgressStore } from '../../stores/useProgressStore';
import { getLevelFromXp } from '../../stores/useProgressStore';
import { clsx } from 'clsx';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="relative flex items-center justify-between gap-4 h-16 px-4 lg:px-6 bg-[--color-bg-secondary]/55 backdrop-blur-md shrink-0 z-30">
      <div
        aria-hidden
        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[--color-accent-blue]/45 to-transparent"
      />
      {/*  Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-xl bg-[--color-accent-blue]/30 blur-md" />
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[--color-accent-blue] via-[#4F46E5] to-[--color-accent-cyan] flex items-center justify-center text-white font-bold text-sm basis-9">
            NL
          </div>
        </div>
        <div className="hidden md:block leading-tight">
          <p className="text-sm font-bold text-[--color-text-primary] tracking-tight">NetLab</p>
          <p className="text-[9px] text-[--color-text-muted] uppercase tracking-[0.16em]">
            Simulador de Redes
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-1 max-w-xl mx-auto">
        <div className="relative w-full group">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--color-text-muted] transition-colors group-focus-within:text-[--color-accent-blue]" />
          <input
            type="text"
            placeholder="Buscar conceito, laboratório, comando..."
            className={clsx(
              'w-full bg-[#0D1424]/80 border border-[--color-border-primary]/45 rounded-xl pl-10 pr-16 py-2 text-sm',
              'text-[--color-text-primary] placeholder:text-[--color-text-muted]/60',
              'focus:outline-none focus:border-[--color-accent-blue] focus:ring-2 focus:ring-[--color-accent-blue]/15 focus:bg-[#0D1424]',
              'transition-all duration-200',
              'hover:border-[--color-border-secondary]/80'
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-2 py-1 rounded-md border border-white/10 bg-white/5 text-[9px] text-[--color-text-muted] font-mono">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {}}
          className="relative p-2.5 rounded-xl text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/5 transition-colors cursor-pointer"
          title="Status do sistema"
          aria-label="Status"
        >
          <Activity size={17} />
          <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[--color-status-connected]" />
        </button>

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
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[--color-accent-blue] ring-2 ring-[#0D1424]" />
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
        <div className="flex items-center gap-2.5 pl-3 ml-1.5 border-l border-[--color-border-primary]/25">
          <div className="flex h-9 w-9 rounded-full bg-gradient-to-br from-[--color-border-secondary] to-[#1C2538] border border-[--color-accent-blue]/25 items-center justify-center text-[--color-text-primary] text-xs font-bold">
            AL
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-xs font-semibold text-[--color-text-primary]">Aluno</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex items-center gap-1 text-[9px] text-[--color-status-connected] font-medium">
                <span className="w-1 h-1 rounded-full bg-[--color-status-connected]" /> Online
              </span>
              <span className="text-[9px] text-[--color-text-muted]">
                · Nv {getLevelFromXp(useProgressStore.getState().progress.xp)}
              </span>
            </div>
          </div>
          <ChevronDown size={12} className="hidden lg:block text-[--color-text-muted]/60" />
        </div>
      </div>
    </header>
  );
}
import { useState } from 'react';
import { Bell, Search, Activity, Sparkles, ChevronDown } from 'lucide-react';
import { useProgressStore } from '../../stores/useProgressStore';
import { getLevelFromXp } from '../../stores/useProgressStore';
import { clsx } from 'clsx';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="flex items-center justify-between gap-3 h-14 px-4 lg:px-5 bg-[#03111F] border-b border-white/5 shrink-0">
      {/*  Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--color-accent-blue] to-[--color-accent-cyan] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
          NL
        </div>
        <div className="hidden md:block leading-tight">
          <p className="text-sm font-bold text-[--color-text-primary] tracking-tight">NetLab</p>
          <p className="text-[9px] text-[--color-text-muted] uppercase tracking-widest">Simulador de Redes</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg mx-auto">
        <div className="relative flex-1 group">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted]" />
          <input
            type="text"
            placeholder="Buscar conceito, laboratório, comando..."
            className={clsx(
              'w-full bg-[#0A2037] border border-[--color-border-primary]/80 rounded-lg pl-9 pr-16 py-2 text-sm',
              'text-[--color-text-primary] placeholder:text-[--color-text-muted]/70',
              'focus:outline-none focus:border-[--color-accent-blue] focus:ring-2 focus:ring-[--color-accent-blue]/20',
              'transition-all duration-200',
              'hover:border-[--color-border-secondary]'
            )}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-[--color-text-muted] font-mono">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => {}}
          className="p-2 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/5 transition-colors cursor-pointer"
          title="Status do sistema"
          aria-label="Status"
        >
          <Activity size={16} />
          <span className="absolute mt-[5px] ml-[12px] w-1.5 h-1.5 rounded-full bg-[--color-status-connected] animate-pulse-soft" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Notificações"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[--color-accent-blue] ring-2 ring-[#03111F]" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[--color-bg-card] border border-[--color-border-primary] shadow-2xl shadow-black/50 overflow-hidden z-40 glass-strong animate-fade-in-up">
              <div className="px-4 py-3 border-b border-[--color-border-primary]/60 text-xs font-semibold text-[--color-text-primary]">
                Notificações
              </div>
              <div className="flex flex-col items-center gap-2 p-6 text-xs text-[--color-text-muted] text-center">
                <Sparkles size={18} className="text-[--color-accent-blue]/60" />
                Nenhuma notificação no momento
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-white/5">
          <div className="flex h-8 w-8 rounded-full bg-gradient-to-br from-[--color-border-secondary] to-[#0A2037] border border-[--color-accent-blue]/30 items-center justify-center text-[--color-text-primary] text-xs font-bold shadow-inner">
            AL
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-[--color-text-primary]">Aluno</p>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[9px] text-[--color-status-connected] font-medium">
                <span className="w-1 h-1 rounded-full bg-[--color-status-connected]" /> Online
              </span>
              <span className="text-[9px] text-[--color-text-muted]">
                · Nv {getLevelFromXp(useProgressStore.getState().progress.xp)}
              </span>
            </div>
          </div>
          <ChevronDown size={12} className="hidden lg:block text-[--color-text-muted]" />
        </div>
      </div>
    </header>
  );
}
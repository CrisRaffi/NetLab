import { useState } from 'react';
import { Bell, Search } from 'lucide-react';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="flex items-center justify-between h-14 px-5 bg-[--color-bg-secondary] border-b border-[--color-border-primary] shrink-0">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar conceito, laboratório, comando..."
            className="w-full bg-[--color-bg-input] border border-[--color-border-primary] rounded-md pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-lg bg-[--color-bg-card] border border-[--color-border-primary] shadow-xl shadow-black/40 overflow-hidden z-40">
              <div className="px-4 py-2.5 border-b border-[--color-border-primary] text-xs font-semibold text-slate-300">
                Notificações
              </div>
              <div className="p-4 text-xs text-slate-500 text-center">Nenhuma notificação no momento</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[--color-border-primary]">
          <div className="flex h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 items-center justify-center text-blue-400 text-xs font-bold">
            AL
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-200">Aluno</p>
            <p className="text-[10px] text-slate-500">Modo local</p>
          </div>
        </div>
      </div>
    </header>
  );
}
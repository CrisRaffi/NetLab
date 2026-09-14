import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  FlaskConical,
  Map,
  Bug,
  FileQuestion,
  Trophy,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useProgressStore } from '../../stores/useProgressStore';
import { getLevelFromXp } from '../../stores/useProgressStore';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mapa', label: 'Mapa de Aprendizado', icon: Map },
  { to: '/simulador', label: 'Laboratório Livre', icon: Network },
  { to: '/labs', label: 'Laboratórios', icon: FlaskConical },
  { to: '/troubleshooting', label: 'Troubleshooting', icon: Bug },
  { to: '/prova', label: 'Modo Prova', icon: FileQuestion },
];

const BOTTOM_ITEMS = [
  { to: '/conquistas', label: 'Conquistas', icon: Trophy },
  { to: '/config', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const progress = useProgressStore(s => s.progress);

  return (
    <aside className="flex flex-col w-14 lg:w-60 h-full bg-[--color-bg-secondary] border-r border-[--color-border-primary] shrink-0">
      <div className="flex items-center gap-3 px-3 lg:px-4 h-14 border-b border-[--color-border-primary] shrink-0">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          NL
        </div>
        <div className="hidden lg:block">
          <span className="text-sm font-bold text-slate-200">NetLab</span>
          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Simulador de Redes</span>
        </div>
      </div>

      <div className="hidden lg:block px-4 py-3 border-b border-[--color-border-primary]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">Nível {getLevelFromXp(progress.xp)}</span>
          <span className="text-slate-500 font-mono">{progress.xp} XP</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(progress.xp % 100)}%` }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 lg:px-4 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[--color-border-primary] py-2 shrink-0">
        {BOTTOM_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 lg:px-4 py-2.5 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
        <div className="hidden lg:flex items-center gap-2 px-4 py-3 text-xs text-slate-600 mt-1">
          <div className="flex h-6 w-6 rounded-md bg-slate-800 items-center justify-center text-slate-500 font-mono text-[10px]">?</div>
          <span className="flex-1">
            {progress.completedExercises.length} labs concluídos
          </span>
          <ChevronRight size={12} />
        </div>
      </div>
    </aside>
  );
}
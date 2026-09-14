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
import { clsx } from 'clsx';

const NAV_SECTIONS = [
  {
    label: 'Plataforma',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/mapa', label: 'Mapa de Aprendizado', icon: Map },
    ],
  },
  {
    label: 'Laboratório',
    items: [
      { to: '/simulador', label: 'Laboratório Livre', icon: Network },
      { to: '/labs', label: 'Laboratórios', icon: FlaskConical },
      { to: '/troubleshooting', label: 'Troubleshooting', icon: Bug },
      { to: '/prova', label: 'Modo Prova', icon: FileQuestion },
    ],
  },
];

const BOTTOM_ITEMS = [
  { to: '/conquistas', label: 'Conquistas', icon: Trophy },
  { to: '/config', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const progress = useProgressStore(s => s.progress);
  const level = getLevelFromXp(progress.xp);
  const xpInLevel = progress.xp % 100;
  const labsCompleted = progress.completedExercises.filter(id => !id.startsWith('brk-')).length;
  const achievementsUnlocked = progress.achievements.length;

  return (
    <aside className="flex flex-col w-16 lg:w-56 h-full bg-[--color-bg-secondary] border-r border-[--color-border-primary]/60 shrink-0 transition-[width] duration-200">
      {/* ─── Brand ─── */}
      <div className="flex items-center justify-center lg:justify-start gap-2.5 px-2 lg:px-3.5 h-14 border-b border-[--color-border-primary]/40 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--color-accent-blue] to-[--color-accent-cyan] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/20">
          NL
        </div>
        <div className="hidden lg:block min-w-0">
          <span className="text-sm font-bold text-[--color-text-primary] tracking-tight">NetLab</span>
          <span className="block text-[10px] text-[--color-text-muted] uppercase tracking-wider">Simulador de Redes</span>
        </div>
      </div>

      {/* ─── Progress (collapsed: ring / expanded: bar) ─── */}
      <div className="hidden lg:block px-3.5 py-3 border-b border-[--color-border-primary]/40">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="text-[--color-text-secondary] font-medium">Nível {level}</span>
          <span className="text-[--color-text-muted] font-mono text-[10px]">{progress.xp} XP</span>
        </div>
        <div className="h-1.5 rounded-full bg-[--color-bg-primary] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[--color-accent-blue] to-[--color-accent-cyan] rounded-full transition-all duration-500"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
      </div>

      {/* ─── Nav sections ─── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 lg:px-2.5 space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="hidden lg:block px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[--color-text-muted]/60">
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 px-2.5 lg:px-3 py-2 text-[13px] rounded-lg transition-all duration-150 mb-0.5',
                    isActive
                      ? 'bg-gradient-to-r from-[--color-accent-blue]/15 to-transparent text-[--color-accent-blue] font-medium shadow-[inset_0_0_0_1px_rgba(0,140,255,0.12)]'
                      : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/50'
                  )
                }
              >
                <item.icon size={17} className="shrink-0" />
                <span className="hidden lg:block truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ─── Bottom items + labs count ─── */}
      <div className="border-t border-[--color-border-primary]/40 py-2.5 px-2 lg:px-2.5 shrink-0 space-y-0.5">
        {BOTTOM_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-2.5 lg:px-3 py-2 text-[13px] rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-[--color-accent-blue]/15 to-transparent text-[--color-accent-blue] font-medium shadow-[inset_0_0_0_1px_rgba(0,140,255,0.12)]'
                  : 'text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/50'
              )
            }
          >
            <item.icon size={17} className="shrink-0" />
            <span className="hidden lg:block truncate">{item.label}</span>
          </NavLink>
        ))}

        {/* Labs completed + achievements */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2.5 mt-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-[--color-text-muted]">
              <FlaskConical size={11} />
              <span>{labsCompleted} labs concluídos</span>
            </div>
            {achievementsUnlocked > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-[--color-text-muted] mt-1">
                <Trophy size={11} />
                <span>{achievementsUnlocked} conquistas</span>
              </div>
            )}
          </div>
          <ChevronRight size={12} className="text-[--color-text-muted]/40 shrink-0" />
        </div>
      </div>
    </aside>
  );
}

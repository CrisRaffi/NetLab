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
  Gamepad2,
  Zap,
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
    label: 'Aprender',
    items: [
      { to: '/viagem', label: 'A Viagem do Pacote', icon: Gamepad2 },
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

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 px-3.5 py-2.5 text-[13.5px] rounded-xl transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-[--color-accent-blue]/22 to-[--color-accent-blue]/8 text-[--color-cyan-300] font-semibold shadow-[0_4px_16px_rgba(99,102,241,0.15),inset_0_0_0_1px_rgba(99,102,241,0.25)]'
      : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
  );

export function Sidebar() {
  const progress = useProgressStore(s => s.progress);
  const level = getLevelFromXp(progress.xp);
  const xpInLevel = progress.xp % 100;
  const labsCompleted = progress.completedExercises.filter(id => !id.startsWith('brk-')).length;
  const achievementsUnlocked = progress.achievements.length;

  return (
    <aside className="relative flex flex-col w-16 lg:w-64 h-full bg-[#020A14]/85 backdrop-blur-md border-r border-[--color-border-primary]/20 shrink-0 transition-[width] duration-200 z-20">
      {/* ─── Brand ─── */}
      <div className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-5 h-[72px] shrink-0">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-xl bg-[--color-accent-blue]/30 blur-lg" />
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[--color-accent-blue] via-[#4F46E5] to-[--color-accent-cyan] flex items-center justify-center text-white font-bold text-[15px] shadow-[0_2px_14px_rgba(0,140,255,0.35)]">
            NL
          </div>
        </div>
        <div className="hidden lg:block min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-[--color-text-primary] tracking-tight">
              NetLab
            </span>
            <Zap size={12} className="text-[--color-accent-cyan]" />
          </div>
          <span className="block text-[9px] text-[--color-text-muted] uppercase tracking-[0.16em] mt-0.5">
            Simulador de Redes
          </span>
        </div>
      </div>

      {/* ─── Progress (expanded) ─── */}
      <div className="hidden lg:block px-4 pb-6">
        <div className="rounded-2xl bg-[#0D1424]/80 px-4 py-3.5">
          <div className="flex items-center justify-between text-[11px] mb-2.5">
            <span className="text-[--color-text-secondary] font-semibold">
              Nível {level}
            </span>
            <span className="text-[--color-text-muted] font-mono text-[10px]">
              {progress.xp} XP
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[--color-bg-primary] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[--color-accent-blue] to-[--color-accent-cyan] rounded-full transition-all duration-500"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
          <p className="text-[9px] text-[--color-text-muted] mt-2.5">
            {100 - xpInLevel} XP para o próximo nível
          </p>
        </div>
      </div>

      {/* ─── Nav sections ─── */}
      <nav className="flex-1 overflow-y-auto px-3 lg:px-4 pt-1 pb-6 space-y-8">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="hidden lg:block section-label mb-3 pl-1">
              {section.label}
            </div>
            <div className="space-y-1.5">
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} className={navItemClass}>
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        className={clsx(
                          'shrink-0',
                          isActive ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted]',
                        )}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                      {isActive && (
                        <span className="hidden lg:block ml-auto h-1.5 w-1.5 rounded-full bg-[--color-accent-blue] shadow-[0_0_8px_rgba(0,140,255,0.9)]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Bottom: conquistas + configurações ─── */}
      <div className="px-3 lg:px-4 pb-5 shrink-0">
        <div className="space-y-1.5">
          {BOTTOM_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={navItemClass}>
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={clsx(
                      'shrink-0',
                      isActive ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted]',
                    )}
                  />
                  <span className="hidden lg:block truncate">{item.label}</span>
                  {isActive && (
                    <span className="hidden lg:block ml-auto h-1.5 w-1.5 rounded-full bg-[--color-accent-blue]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[--color-border-primary]/20">
          <div className="flex items-center justify-between text-[11px] text-[--color-text-muted]">
            <span className="flex items-center gap-2">
              <FlaskConical size={13} className="text-[--color-accent-cyan]" />
              Labs concluídos
            </span>
            <span className="font-mono text-[10px]">{labsCompleted}</span>
          </div>
          {achievementsUnlocked > 0 && (
            <div className="flex items-center justify-between text-[11px] text-[--color-text-muted] mt-2">
              <span className="flex items-center gap-2">
                <Trophy size={13} className="text-[--color-accent-yellow]" />
                Conquistas
              </span>
              <span className="font-mono text-[10px]">{achievementsUnlocked}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
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
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/mapa', label: 'Mapa de Aprendizado', icon: Map },
    ],
  },
  {
    label: 'Aprender',
    items: [{ to: '/viagem', label: 'A Viagem do Pacote', icon: Gamepad2 }],
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
    'flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200',
    isActive
      ? 'bg-[--color-accent-blue]/15 text-[--color-accent-cyan] font-semibold ring-inset-blue'
      : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
  );

export function Sidebar() {
  const progress = useProgressStore((s) => s.progress);
  const level = getLevelFromXp(progress.xp);
  const xpInLevel = progress.xp % 100;
  const labsCompleted = progress.completedExercises.filter(
    (id) => !id.startsWith('brk-'),
  ).length;
  const achievementsUnlocked = progress.achievements.length;

  return (
    <aside className="relative flex flex-col w-16 lg:w-52 h-full bg-[#020A14]/70 backdrop-blur-md border-r border-[--color-border-primary]/20 shrink-0 transition-[width] duration-200 z-20">
      {/* Brand */}
      <div className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 h-14 shrink-0">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-xl bg-[--color-accent-blue]/30 blur-lg" />
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[--color-accent-blue] via-[#4F46E5] to-[--color-accent-cyan] flex items-center justify-center text-white font-bold text-sm glow-logo">
            NL
          </div>
        </div>
        <div className="hidden lg:block min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[--color-text-primary] tracking-tight">
              NetLab
            </span>
            <Zap size={11} className="text-[--color-accent-cyan]" />
          </div>
          <span className="block text-[9px] text-[--color-text-muted] uppercase tracking-[0.14em] mt-0.5">
            Simulador de Redes
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="hidden lg:block px-2.5 pb-3 mt-2.5">
        <div className="rounded-xl bg-[#0D1424]/80 px-2.5 py-2.5">
          <div className="flex items-center justify-between text-xs mb-2">
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
          <p className="text-[9px] text-[--color-text-muted] mt-2">
            {100 - xpInLevel} XP para o próximo nível
          </p>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-2.5 lg:px-3 pt-1 pb-3 space-y-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="hidden lg:block section-label mb-1 pl-1">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={navItemClass}>
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={13}
                        className={clsx(
                          'shrink-0',
                          isActive
                            ? 'text-[--color-accent-blue]'
                            : 'text-[--color-text-muted]',
                        )}
                      />
                      <span className="hidden lg:block truncate">
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="hidden lg:block ml-auto h-1.5 w-1.5 rounded-full bg-[--color-accent-blue] glow-dot" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: conquistas + config */}
      <div className="px-2.5 lg:px-3 pb-3 shrink-0">
        <div className="space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navItemClass}>
              {({ isActive }) => (
                <>
                  <item.icon
                    size={13}
                    className={clsx(
                      'shrink-0',
                      isActive
                        ? 'text-[--color-accent-blue]'
                        : 'text-[--color-text-muted]',
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

        <div className="mt-4 pt-3 border-t border-[--color-border-primary]/20">
          <div className="flex items-center justify-between text-[10px] text-[--color-text-muted]">
            <span className="flex items-center gap-2">
              <FlaskConical size={12} className="text-[--color-accent-cyan]" />
              Labs concluídos
            </span>
            <span className="font-mono text-[9px]">{labsCompleted}</span>
          </div>
          {achievementsUnlocked > 0 && (
            <div className="flex items-center justify-between text-[10px] text-[--color-text-muted] mt-1.5">
              <span className="flex items-center gap-2">
                <Trophy size={12} className="text-[--color-accent-yellow]" />
                Conquistas
              </span>
              <span className="font-mono text-[9px]">
                {achievementsUnlocked}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
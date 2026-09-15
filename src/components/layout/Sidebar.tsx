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
    label: 'LaboratÃ³rio',
    items: [
      { to: '/simulador', label: 'LaboratÃ³rio Livre', icon: Network },
      { to: '/labs', label: 'LaboratÃ³rios', icon: FlaskConical },
      { to: '/troubleshooting', label: 'Troubleshooting', icon: Bug },
      { to: '/prova', label: 'Modo Prova', icon: FileQuestion },
    ],
  },
];

const BOTTOM_ITEMS = [
  { to: '/conquistas', label: 'Conquistas', icon: Trophy },
  { to: '/config', label: 'ConfiguraÃ§Ãµes', icon: Settings },
];

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-[--color-accent-blue]/22 to-[--color-accent-blue]/8 text-[--color-cyan-300] font-semibold nav-active-glow'
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
      {/* â”€â”€â”€ Brand â”€â”€â”€ */}
      <div className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-5 h-[72px] shrink-0">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-xl bg-[--color-accent-blue]/30 blur-lg" />
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[--color-accent-blue] via-[#4F46E5] to-[--color-accent-cyan] flex items-center justify-center text-white font-bold text-[15px] glow-logo">
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

      {/* â”€â”€â”€ Progress (expanded) â”€â”€â”€ */}
      <div className="hidden lg:block px-4 pb-6">
        <div className="rounded-2xl bg-[#0D1424]/80 px-4 py-3.5">
          <div className="flex items-center justify-between text-[11px] mb-2.5">
            <span className="text-[--color-text-secondary] font-semibold">
              NÃ­vel {level}
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
            {100 - xpInLevel} XP para o prÃ³ximo nÃ­vel
          </p>
        </div>
      </div>

      {/* â”€â”€â”€ Nav sections â”€â”€â”€ */}
      <nav className="flex-1 overflow-y-auto px-3 lg:px-4 pt-1 pb-6 space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="hidden lg:block section-label mb-1.5 pl-1">
              {section.label}
            </div>
            <div className="space-y-1.5">
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} className={navItemClass}>
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={16}
                        className={clsx(
                          'shrink-0',
                          isActive ? 'text-[--color-accent-blue]' : 'text-[--color-text-muted]',
                        )}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
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

      {/* â”€â”€â”€ Bottom: conquistas + configuraÃ§Ãµes â”€â”€â”€ */}
      <div className="px-3 lg:px-4 pb-5 shrink-0">
        <div className="space-y-1.5">
          {BOTTOM_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={navItemClass}>
              {({ isActive }) => (
                <>
                  <item.icon
                    size={16}
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
              Labs concluÃ­dos
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
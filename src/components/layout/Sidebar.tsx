import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Map,
  FlaskConical,
  Bug,
  FileQuestion,
  ClipboardList,
  Trophy,
  Settings,
  Gamepad2,
  Sparkles,
  Search,
  ChevronDown,
  Layers,
  Network,
  Router,
  ShieldCheck,
  Braces,
  Radio,
} from 'lucide-react';
import { useProgressStore } from '../../stores/useProgressStore';
import { getLevelFromXp } from '../../stores/useProgressStore';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  mobileHidden?: boolean;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Plataforma',
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/mapa', label: 'Mapa de Aprendizado', icon: Map },
    ],
  },
  {
    label: 'Matérias',
    icon: Layers,
    defaultOpen: true,
    items: [
      { to: '/viagem', label: 'A Viagem do Pacote', icon: Gamepad2 },
      {
        to: '/aprender/transporte-pdu',
        label: 'Transporte e PDUs',
        icon: Radio,
      },
      /* 
      { to: '/materia/fundamentos', label: 'Fundamentos', icon: Braces },
      { to: '/materia/roteamento', label: 'Roteamento', icon: Router },
      { to: '/materia/seguranca', label: 'Segurança', icon: ShieldCheck },
       */
    ],
  },
  {
    label: 'Laboratório',
    icon: FlaskConical,
    defaultOpen: true,
    items: [
      {
        to: '/simulador',
        label: 'Laboratório Livre',
        icon: Network,
        highlight: true,
        mobileHidden: true,
      },
      { to: '/labs', label: 'Laboratórios', icon: FlaskConical, mobileHidden: true },
      {
        to: '/troubleshooting',
        label: 'Troubleshooting',
        icon: Bug,
        mobileHidden: true,
      },
      { to: '/questionarios', label: 'Questionários', icon: ClipboardList },
      { to: '/prova', label: 'Modo Prova', icon: FileQuestion },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
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

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        clsx(
          navItemClass({ isActive }),
          item.highlight && 'nav-highlight',
          item.mobileHidden && 'hidden lg:flex',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={13}
            className={clsx(
              'shrink-0',
              item.highlight
                ? 'text-[--color-accent-cyan]'
                : isActive
                  ? 'text-[--color-accent-blue]'
                  : 'text-[--color-text-muted]',
            )}
          />
          <span className="block truncate">{item.label}</span>
          {item.highlight && (
            <span className="flex ml-auto items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-[--color-accent-cyan]">
              <Sparkles size={9} />
              Começar
            </span>
          )}
          {isActive && !item.highlight && (
            <span className="block ml-auto h-1.5 w-1.5 rounded-full bg-[--color-accent-blue] glow-dot" />
          )}
        </>
      )}
    </NavLink>
  );
}

function NavGroupBlock({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(group.defaultOpen ?? false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between section-label mb-1 pl-1 pr-2 py-1 rounded hover:bg-white/[0.04] cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <group.icon size={11} className="text-[--color-text-muted]" />
          {group.label}
        </span>
        <ChevronDown
          size={11}
          className={clsx('transition-transform', open ? '' : '-rotate-90')}
        />
      </button>
      <div className="block h-px mb-1 bg-[--color-border-primary]/10" />
      <div className={clsx('space-y-1', !open && 'hidden lg:hidden')}>
        {group.items.map((item) => (
          <NavItemLink key={item.to} item={item} />
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ open = false }: { open?: boolean }) {
  const progress = useProgressStore((s) => s.progress);
  const level = getLevelFromXp(progress.xp);
  const xpInLevel = progress.xp % 100;
  const labsCompleted = progress.completedExercises.filter(
    (id) => !id.startsWith('brk-'),
  ).length;
  const achievementsUnlocked = progress.achievements.length;
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    if (!query.trim()) return NAV_GROUPS;
    const q = query.toLowerCase();
    const filtered = NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
    return filtered;
  }, [query]);

  return (
    <aside
      className={clsx(
        'sidebar-drawer relative flex flex-col w-16 lg:w-64 h-full bg-[#020A14]/70 backdrop-blur-md border-r border-[--color-border-primary]/20 shrink-0 transition-[width] duration-200 z-20',
        open && 'open',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-6 shrink-0">
        <div className="relative shrink-0">
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-[--color-accent-blue]/40 to-[--color-accent-cyan]/20 blur-md" />
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[--color-accent-blue] via-[#4F46E5] to-[--color-accent-cyan] flex items-center justify-center text-white shadow-lg glow-logo">
            <Network size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div className="block min-w-0 leading-none">
          <span className="block text-[15px] font-bold tracking-tight">
            Net<span className="text-gradient">Lab</span>
          </span>
          <span className="block text-[9px] text-[--color-text-muted] uppercase tracking-[0.16em] mt-1">
            Simulador de Redes
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="block px-3 pb-3">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[--color-text-muted]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página..."
            className="w-full bg-[#0D1424]/80 border border-[--color-border-primary]/20 rounded-lg pl-10 pr-2 py-1.5 text-[11px] text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-blue]/50"
          />
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 lg:px-3 pt-1 pb-3 space-y-3">
        {groups.length === 0 && (
          <p className="block text-[10px] text-[--color-text-muted] px-1">
            Nenhuma página encontrada.
          </p>
        )}
        {groups.map((group) => (
          <NavGroupBlock key={group.label} group={group} />
        ))}
      </nav>

      {/* Bottom: progress + conquistas + config */}
      <div className="px-2.5 lg:px-3 pb-3 shrink-0">
        <div className="block mb-3">
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

        <div className="space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} />
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

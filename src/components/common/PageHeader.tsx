import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Accent = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: Accent;
  badge?: ReactNode;
  actions?: ReactNode;
}

const ACCENT_CHIP: Record<Accent, string> = {
  blue: 'bg-[--color-accent-blue]/10 border-[--color-accent-blue]/20 text-[--color-accent-blue]',
  green: 'bg-[--color-accent-green]/10 border-[--color-accent-green]/20 text-[--color-accent-green]',
  yellow: 'bg-[--color-accent-yellow]/10 border-[--color-accent-yellow]/20 text-[--color-accent-yellow]',
  red: 'bg-[--color-accent-red]/10 border-[--color-accent-red]/20 text-[--color-accent-red]',
  purple: 'bg-[--color-accent-purple]/10 border-[--color-accent-purple]/20 text-[--color-accent-purple]',
  cyan: 'bg-[--color-accent-cyan]/10 border-[--color-accent-cyan]/20 text-[--color-accent-cyan]',
};

export function PageHeader({ title, subtitle, icon, accent = 'blue', badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <span
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              ACCENT_CHIP[accent],
              'icon-glow-purple'
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[--color-text-primary] tracking-tight truncate">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-[--color-text-muted] mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export function Card({ title, subtitle, icon, actions, padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'card-flair relative rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm',
        'card-shadow',
        'hover:border-[--color-border-primary]/80 transition-colors duration-150',
        className
      )}
      {...props}
    >
      {(title || icon || actions) && (
        <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-[--color-border-primary]/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="text-[--color-accent-blue] shrink-0 icon-glow-blue">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm font-semibold text-[--color-text-primary] tracking-tight truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-[--color-text-muted] mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={clsx(PADDING_CLASSES[padding])}>{children}</div>
    </div>
  );
}
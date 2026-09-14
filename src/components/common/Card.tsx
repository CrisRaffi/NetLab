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
        'rounded-lg bg-[--color-bg-card] border border-[--color-border-primary]',
        className
      )}
      {...props}
    >
      {(title || icon || actions) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[--color-border-primary]">
          <div className="flex items-center gap-3">
            {icon && <span className="text-slate-400">{icon}</span>}
            <div>
              {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={clsx(PADDING_CLASSES[padding])}>{children}</div>
    </div>
  );
}
import { clsx } from 'clsx';

type BadgeTone = 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'cyan';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  default: 'bg-[--color-bg-tertiary] text-[--color-text-secondary] border-[--color-border-primary]/70',
  green: 'bg-[--color-accent-green]/10 text-[--color-accent-green] border-[--color-accent-green]/30 ring-tint-green',
  yellow: 'bg-[--color-accent-yellow]/10 text-[--color-accent-yellow] border-[--color-accent-yellow]/30',
  red: 'bg-[--color-accent-red]/10 text-[--color-accent-red] border-[--color-accent-red]/30',
  blue: 'bg-[--color-accent-blue]/10 text-[--color-accent-blue] border-[--color-accent-blue]/30 ring-tint-blue',
  purple: 'bg-[--color-accent-purple]/10 text-[--color-accent-purple] border-[--color-accent-purple]/30',
  cyan: 'bg-[--color-accent-cyan]/10 text-[--color-accent-cyan] border-[--color-accent-cyan]/30',
};

export function Badge({ tone = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors shrink-0',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

type StatusDotColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue';

export function StatusDot({ color }: { color: StatusDotColor }) {
  const dotClass = {
    green: 'bg-[--color-accent-green]',
    yellow: 'bg-[--color-accent-yellow]',
    red: 'bg-[--color-accent-red]',
    gray: 'bg-[--color-status-disabled]',
    blue: 'bg-[--color-accent-blue]',
  }[color];
  return <span className={clsx('inline-block w-2 h-2 rounded-full', dotClass)} />;
}
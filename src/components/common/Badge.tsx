import { clsx } from 'clsx';

type BadgeTone = 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'cyan';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

export function Badge({ tone = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border',
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
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-slate-500',
    blue: 'bg-blue-500',
  }[color];
  return <span className={clsx('inline-block w-2 h-2 rounded-full', dotClass)} />;
}
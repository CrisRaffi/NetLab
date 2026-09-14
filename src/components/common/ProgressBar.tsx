import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  className?: string;
  colorClass?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, colorClass, showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            colorClass ?? (clamped >= 80 ? 'bg-emerald-500' : clamped >= 40 ? 'bg-blue-500' : 'bg-yellow-500')
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 font-mono w-9 text-right">{clamped}%</span>
      )}
    </div>
  );
}
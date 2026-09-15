import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  className?: string;
  colorClass?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, colorClass, showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const defaultFill =
    clamped >= 80
      ? 'bg-gradient-to-r from-[#1FA655] to-[--color-accent-green]'
      : clamped >= 40
      ? 'bg-gradient-to-r from-[#0071D6] to-[--color-accent-blue]'
      : 'bg-gradient-to-r from-[#C58F00] to-[--color-accent-yellow]';
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-[--color-bg-tertiary]/70 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            colorClass ?? defaultFill
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[--color-text-muted] font-mono w-9 text-right">{clamped}%</span>
      )}
    </div>
  );
}
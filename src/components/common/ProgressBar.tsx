import { clsx } from 'clsx';

interface ProgressBarProps {
  value: any;
  className?: string;
  colorClass?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  colorClass,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  // Extrai cores hexadecimais do colorClass (ex: "from-[#6366F1] to-[#4F46E5]")
  const hexMatch = colorClass?.match(/#([0-9a-fA-F]{3,8})/g);
  const fromColor = hexMatch?.[0] ?? '#6366F1';
  const toColor = hexMatch?.[1] ?? '#4F46E5';

  const gradientStyle = {
    width: clamped === 0 ? 0 : Math.max(clamped, 4),
    backgroundImage: `linear-gradient(to right, ${fromColor}, ${toColor})`,
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-[--color-bg-tertiary]/70 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={gradientStyle}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[--color-text-muted] font-mono w-9 text-right">
          {clamped.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

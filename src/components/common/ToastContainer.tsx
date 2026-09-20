import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useToastStore, type ToastType } from '../../stores/useToastStore';

const TONE: Record<ToastType, { icon: React.ReactNode; cls: string; iconCls: string }> = {
  success: {
    icon: <CheckCircle2 size={16} />,
    cls: 'border-[--color-accent-green]/40',
    iconCls: 'text-[--color-accent-green]',
  },
  error: {
    icon: <XCircle size={16} />,
    cls: 'border-[--color-accent-red]/40',
    iconCls: 'text-[--color-accent-red]',
  },
  info: {
    icon: <Info size={16} />,
    cls: 'border-[--color-accent-blue]/40',
    iconCls: 'text-[--color-accent-cyan]',
  },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const tone = TONE[t.type];
        return (
          <div
            key={t.id}
            className={clsx(
              'glass-strong flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl shadow-black/50 animate-slide-in-right',
              tone.cls,
            )}
          >
            <span className={clsx('mt-0.5 shrink-0', tone.iconCls)}>
              {tone.icon}
            </span>
            <p className="min-w-0 flex-1 text-xs text-[--color-text-primary] leading-relaxed">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-0.5 text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] hover:bg-white/[0.06] cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
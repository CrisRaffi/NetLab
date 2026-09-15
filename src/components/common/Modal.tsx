import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full rounded-xl glass-strong border border-[--color-border-secondary]/70 shadow-2xl shadow-black/60 animate-fade-in-up',
          SIZE_CLASSES[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border-primary]/60">
            <h3 className="text-sm font-semibold text-[--color-text-primary]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[--color-bg-hover] text-[--color-text-muted] hover:text-[--color-text-primary] cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-5 text-[--color-text-secondary]">{children}</div>
      </div>
    </div>
  );
}
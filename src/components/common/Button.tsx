import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] hover:from-[#818CF8] hover:to-[#6366F1] text-white glow-blue border border-white/10 hover:border-white/20',
  secondary: 'bg-[--color-bg-tertiary]/80 hover:bg-[#273651] text-[--color-text-secondary] hover:text-[--color-text-primary] border border-[--color-border-primary]/40',
  outline: 'border border-[--color-border-secondary]/60 hover:border-[#6366F1]/50 hover:bg-[#111a2c] text-[--color-text-muted] hover:text-[--color-text-secondary]',
  ghost: 'hover:bg-[#111a2c] text-[--color-text-muted] hover:text-[--color-text-secondary]',
  danger: 'bg-gradient-to-br from-[#F43F5E] to-[#E11D48] hover:from-[#FB7185] hover:to-[#F43F5E] text-white glow-red border border-white/10 hover:border-white/20',
  success:
    'bg-gradient-to-br from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white glow-green border border-white/10 hover:border-white/20',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 hover:-translate-y-px active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent-blue]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
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
    'bg-gradient-to-b from-[#008CFF] to-[#0071D6] hover:from-[#00A8FF] hover:to-[#008CFF] text-white shadow-md shadow-blue-500/25',
  secondary: 'bg-[#123B61] hover:bg-[#1B4D7A] text-[#C4D8EC]',
  outline: 'border border-[#1E3957] hover:border-[#008CFF]/60 hover:bg-[#081C30] text-[#7891AA] hover:text-[#C4D8EC]',
  ghost: 'hover:bg-[#081C30] text-[#7891AA] hover:text-[#C4D8EC]',
  danger: 'bg-gradient-to-b from-[#F0485C] to-[#D63A4C] hover:from-[#FF5A6C] hover:to-[#F0485C] text-white shadow-md shadow-red-500/25',
  success:
    'bg-gradient-to-b from-[#27C66A] to-[#1FA655] hover:from-[#3DD67E] hover:to-[#27C66A] text-white shadow-md shadow-emerald-500/25',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 hover:-translate-y-px active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
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
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const VARIANTS = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20',
  secondary: 'bg-surface-raised hover:bg-gray-800 text-gray-100 border border-surface-border',
  ghost: 'hover:bg-surface-raised text-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', isLoading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

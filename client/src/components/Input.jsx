import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-gray-100',
          'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          error && 'border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
});

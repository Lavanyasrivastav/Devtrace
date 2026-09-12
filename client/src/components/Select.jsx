import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export const Select = forwardRef(function Select({ label, className, children, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

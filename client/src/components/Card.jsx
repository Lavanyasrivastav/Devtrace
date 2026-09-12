import { cn } from '../utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl border border-surface-border bg-surface-raised p-5', className)} {...props}>
      {children}
    </div>
  );
}

import { cn } from '../utils/cn';

export function MetricCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
        {Icon && <Icon className={cn('h-4 w-4', accent || 'text-gray-500')} />}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

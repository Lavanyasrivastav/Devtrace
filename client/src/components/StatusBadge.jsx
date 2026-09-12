import { cn } from '../utils/cn';

const STYLES = {
  open: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
  ignored: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export function StatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STYLES[status])}>
      {status}
    </span>
  );
}

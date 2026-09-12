import { cn } from '../utils/cn';

const STYLES = {
  up: 'bg-green-500/15 text-green-400 border-green-500/30',
  down: 'bg-red-500/15 text-red-400 border-red-500/30',
  degraded: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  unknown: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

const DOT_STYLES = {
  up: 'bg-green-400',
  down: 'bg-red-400',
  degraded: 'bg-yellow-400',
  unknown: 'bg-gray-400',
};

export function MonitorStatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STYLES[status])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT_STYLES[status])} />
      {status}
    </span>
  );
}

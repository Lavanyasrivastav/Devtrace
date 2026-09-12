import { cn } from '../utils/cn';

const STYLES = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  error: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export function SeverityBadge({ severity }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STYLES[severity])}>
      {severity}
    </span>
  );
}

import { cn } from '../utils/cn';

const STYLES = {
  owner: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  developer: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  viewer: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export function RoleBadge({ role }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STYLES[role])}>
      {role}
    </span>
  );
}

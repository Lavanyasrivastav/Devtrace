import { cn } from '../utils/cn';

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-surface-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            active === tab.value
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

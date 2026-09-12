import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Bug, Activity, Users, Settings, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useUIStore } from '../store/uiStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/errors', label: 'Errors', icon: Bug },
  { to: '/monitors', label: 'Monitors', icon: Activity },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 border-r border-surface-border bg-surface-raised transition-transform lg:translate-x-0 lg:static lg:z-auto',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="font-semibold">Menu</span>
          <button onClick={closeSidebar}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-500/10 text-brand-400' : 'text-gray-400 hover:bg-surface hover:text-gray-200'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

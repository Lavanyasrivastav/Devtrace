import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Menu, Sun, Moon, ChevronDown, LogOut, User } from 'lucide-react';
import { projectsApi } from '../api/projects';
import { useUIStore } from '../store/uiStore';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';

export function Topbar() {
  const { openSidebar, theme, toggleTheme } = useUIStore();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  const { data } = useQuery({ queryKey: ['projects'], queryFn: projectsApi.list });
  const projects = data?.data?.projects || [];
  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-surface-border bg-surface px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={openSidebar}>
          <Menu className="h-5 w-5 text-gray-300" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsProjectMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm"
          >
            <span className="max-w-[140px] truncate">{currentProject?.name || 'Select project'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-surface-border bg-surface-raised py-1 shadow-lg">
              {projects.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No projects yet</div>}
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProjectId(project.id);
                    setIsProjectMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface"
                >
                  <span className="truncate">{project.name}</span>
                  <span className="text-xs text-gray-500">{project.environment}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-400 hover:bg-surface-raised hover:text-gray-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-medium text-brand-400"
          >
            {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-surface-border bg-surface-raised py-1 shadow-lg">
              <div className="border-b border-surface-border px-3 py-2">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-surface"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

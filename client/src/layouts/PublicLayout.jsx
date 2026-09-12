import { Outlet, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-surface-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Activity className="h-5 w-5 text-brand-500" />
            DevTrace
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white px-3 py-1.5">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

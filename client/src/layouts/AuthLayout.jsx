import { Outlet, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 font-semibold text-xl">
          <Activity className="h-6 w-6 text-brand-500" />
          DevTrace
        </Link>
        <div className="rounded-xl border border-surface-border bg-surface-raised p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

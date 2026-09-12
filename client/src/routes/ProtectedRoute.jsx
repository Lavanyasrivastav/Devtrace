import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/Spinner';

export function ProtectedRoute() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-400">This page doesn't exist.</p>
      <Link to="/" className="text-brand-400 hover:text-brand-300 text-sm">
        Go home
      </Link>
    </div>
  );
}

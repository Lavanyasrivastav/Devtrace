import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/ToastProvider';
import { useSessionBootstrap } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15000,
    },
  },
});

function SessionGate({ children }) {
  useSessionBootstrap();
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <SessionGate>
            <AppRoutes />
          </SessionGate>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

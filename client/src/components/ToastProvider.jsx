import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const COLORS = {
  success: 'border-green-500/30 text-green-400',
  error: 'border-red-500/30 text-red-400',
  warning: 'border-yellow-500/30 text-yellow-400',
  info: 'border-blue-500/30 text-blue-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-center gap-2 rounded-lg border bg-surface-raised px-4 py-3 shadow-lg min-w-[280px]',
                COLORS[toast.type]
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm text-gray-100 flex-1">{toast.message}</span>
              <button onClick={() => dismiss(toast.id)}>
                <X className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

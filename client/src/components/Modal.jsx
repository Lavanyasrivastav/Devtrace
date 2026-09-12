import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X className="h-4 w-4 text-gray-500 hover:text-gray-300" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

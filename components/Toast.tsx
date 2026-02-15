"use client";

import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  toast: {
    type: 'success' | 'error';
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  } | null;
  onClose?: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-fade-in"
      style={{ backgroundColor: toast.type === 'success' ? '#D1FAE5' : '#FEE2E2' }}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span
        style={{ color: toast.type === 'success' ? '#065F46' : '#7F1D1D' }}
        className="text-sm font-medium"
      >
        {toast.message}
      </span>
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="ml-2 px-3 py-1 text-xs font-semibold rounded-md transition-colors"
          style={{
            backgroundColor: toast.type === 'success' ? '#059669' : '#DC2626',
            color: 'white'
          }}
        >
          {toast.action.label}
        </button>
      )}
      {toast.action && onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-black/10 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" style={{ color: toast.type === 'success' ? '#065F46' : '#7F1D1D' }} />
        </button>
      )}
    </div>
  );
}

"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
  toast: { type: 'success' | 'error'; message: string } | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-fade-in"
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
    </div>
  );
}

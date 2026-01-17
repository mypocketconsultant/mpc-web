"use client";

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToast({ id, type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
}

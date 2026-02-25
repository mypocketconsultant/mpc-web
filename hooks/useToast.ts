"use client";

import { useState, useCallback, useRef } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((
    type: 'success' | 'error',
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const id = Date.now().toString();
    setToast({ id, type, message, action });

    // Only auto-dismiss if there's no action button
    if (!action) {
      timeoutRef.current = setTimeout(() => setToast(null), 5000);
    }
  }, []);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

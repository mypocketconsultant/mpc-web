"use client";

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/apiService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  preferredModule: string;
  currentResumeId?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await apiService.get<{ data: { user: User } }>('/v1/auth/me');
        setUser(response.data.user);
        setError(null);
      } catch (err: any) {
        console.error('[useUser] Failed to fetch user:', err);
        setError(err.message || 'Failed to load user data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/dashboardApi';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated, user, userRole } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const tokens = await dashboardApi.login(username, password);
      
      // Get user info (you might need to add an endpoint for this or decode JWT)
      // For now, we'll use placeholder data
      const mockUser = {
        id: 1,
        username,
        email: `${username}@example.com`,
        first_name: username,
        last_name: 'User',
      };

      const mockRole = {
        id: 1,
        role: username === 'admin' ? 'admin' : username === 'editor' ? 'editor' : 'viewer',
        permissions: {},
      } as any;

      return { tokens, user: mockUser, role: mockRole };
    },
    onSuccess: ({ tokens, user, role }) => {
      setAuth(user, role, tokens.access, tokens.refresh);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ username, password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    dashboardApi.clearTokens();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return {
    login,
    logout,
    isLoading: isLoading || loginMutation.isPending,
    isAuthenticated,
    user,
    userRole,
  };
}

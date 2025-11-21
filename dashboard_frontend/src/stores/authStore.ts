import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserRole {
  id: number;
  role: 'viewer' | 'editor' | 'admin';
  permissions: Record<string, boolean>;
}

interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  setAuth: (user: User, userRole: UserRole, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isViewer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userRole: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, userRole, accessToken, refreshToken) => {
        set({
          user,
          userRole,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          userRole: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      hasPermission: (permission) => {
        const { userRole } = get();
        if (!userRole) return false;
        if (userRole.role === 'admin') return true;
        return userRole.permissions[permission] || false;
      },

      isAdmin: () => {
        const { userRole } = get();
        return userRole?.role === 'admin' || false;
      },

      isEditor: () => {
        const { userRole } = get();
        return userRole?.role === 'editor' || userRole?.role === 'admin' || false;
      },

      isViewer: () => {
        const { userRole } = get();
        return userRole?.role === 'viewer' || false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

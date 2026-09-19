import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PermissionKey } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: string;
  roleName: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (perm: PermissionKey) => boolean;
  hasAnyPermission: (perms: PermissionKey[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!getAuthToken();
  });

  const [user, setUser] = useState<User | null>(() => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const saved = localStorage.getItem('printezyour_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Verify and hydrate current user from backend
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user: refreshed } = await api.getMe();
      if (refreshed && refreshed.active) {
        setUser(refreshed);
        localStorage.setItem('printezyour_user', JSON.stringify(refreshed));
      } else {
        // Deactivated or invalid user account
        setUser(null);
        setAuthToken('');
        localStorage.removeItem('printezyour_user');
        localStorage.removeItem('printezyour_admin_token');
      }
    } catch (e) {
      // Token expired, revoked, or invalid on backend
      setUser(null);
      setAuthToken('');
      localStorage.removeItem('printezyour_user');
      localStorage.removeItem('printezyour_admin_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('printezyour_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('printezyour_user');
    }
  }, [user]);

  const role = user?.role || '';
  const roleName = user?.roleName || role;
  const isAuthenticated = !!user && !isLoading;

  const hasPermission = useCallback((perm: PermissionKey): boolean => {
    if (!user) return false;
    // Super admin has unrestricted access to everything
    if (user.role === 'SUPER_ADMIN' || user.role.toLowerCase() === 'owner') {
      return true;
    }
    const perms = user.effectivePermissions || [];
    return perms.includes(perm);
  }, [user]);

  const hasAnyPermission = useCallback((perms: PermissionKey[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role.toLowerCase() === 'owner') return true;
    const effective = user.effectivePermissions || [];
    return perms.some(p => effective.includes(p));
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email.trim(), password);
    if (res.success && res.user && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      localStorage.setItem('printezyour_user', JSON.stringify(res.user));
    } else {
      throw new Error('Authentication failed');
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    setAuthToken('');
    setUser(null);
    localStorage.removeItem('printezyour_user');
    localStorage.removeItem('printezyour_admin_token');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await api.changePassword(currentPassword, newPassword);
    await refreshUser();
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        roleName,
        isAuthenticated,
        isLoading,
        hasPermission,
        hasAnyPermission,
        login,
        logout,
        changePassword,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

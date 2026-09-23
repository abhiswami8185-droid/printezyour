import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, PermissionKey } from '../types';
import { api, getAuthToken, setAuthToken, onSessionExpired } from '../services/api';

const ADMIN_ACTIVE_KEY = 'printezyour_admin_active_session';
const EXPIRES_AT_KEY = 'printezyour_session_expires_at';
const TIMEOUT_MINS_KEY = 'printezyour_session_timeout_mins';
const NOTICE_KEY = 'printezyour_session_expired_notice';
const USER_KEY = 'printezyour_user';

interface AuthContextType {
  user: User | null;
  role: string;
  roleName: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasActiveAdminSession: boolean;
  secondsRemaining: number;
  sessionTimeoutMinutes: number;
  isExpiringSoon: boolean;
  hasPermission: (perm: PermissionKey) => boolean;
  hasAnyPermission: (perms: PermissionKey[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: 'USER_LOGOUT' | 'SESSION_EXPIRED') => void;
  extendSession: () => Promise<void>;
  exitAdminSession: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionActive, setSessionActive] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_ACTIVE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(TIMEOUT_MINS_KEY);
      const parsed = Number(saved);
      return parsed && parsed > 0 ? parsed : 30;
    } catch {
      return 30;
    }
  });

  const [expiresAt, setExpiresAt] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(EXPIRES_AT_KEY);
      const parsed = Number(saved);
      return parsed && parsed > Date.now() ? parsed : 0;
    } catch {
      return 0;
    }
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (expiresAt > Date.now()) {
      return Math.floor((expiresAt - Date.now()) / 1000);
    }
    return 0;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!getAuthToken() && sessionActive;
  });

  const [user, setUser] = useState<User | null>(() => {
    const token = getAuthToken();
    if (!token || !sessionActive) return null;
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const lastServerTouchRef = useRef<number>(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for cross-tab synchronization
  useEffect(() => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('printezyour_admin_session');
        channelRef.current = bc;
        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'LOGOUT') {
            handleLocalLogout(payload?.reason || 'USER_LOGOUT', false);
          } else if (type === 'SESSION_EXTENDED' && payload?.expiresAt) {
            setExpiresAt(payload.expiresAt);
            try {
              sessionStorage.setItem(EXPIRES_AT_KEY, String(payload.expiresAt));
            } catch {}
          }
        };
      }
    } catch (e) {
      // BroadcastChannel unsupported or blocked
    }

    // Fallback cross-tab listener using storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'printezyour_cross_tab_event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type === 'LOGOUT') {
            handleLocalLogout(data.reason || 'USER_LOGOUT', false);
          } else if (data.type === 'SESSION_EXTENDED' && data.expiresAt) {
            setExpiresAt(data.expiresAt);
            try {
              sessionStorage.setItem(EXPIRES_AT_KEY, String(data.expiresAt));
            } catch {}
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch {}
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const broadcastEvent = (type: string, payload?: any) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type, payload });
      } catch {}
    }
    try {
      localStorage.setItem(
        'printezyour_cross_tab_event',
        JSON.stringify({ type, payload, timestamp: Date.now() })
      );
    } catch {}
  };

  const handleLocalLogout = useCallback((reason: 'USER_LOGOUT' | 'SESSION_EXPIRED' = 'USER_LOGOUT', broadcast: boolean = true) => {
    setAuthToken('');
    setUser(null);
    setSessionActive(false);
    setExpiresAt(0);
    setSecondsRemaining(0);

    try {
      sessionStorage.removeItem(ADMIN_ACTIVE_KEY);
      sessionStorage.removeItem(EXPIRES_AT_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('printezyour_admin_token');

      if (reason === 'SESSION_EXPIRED') {
        sessionStorage.setItem(
          NOTICE_KEY,
          'Your admin session expired due to inactivity. Please log in again.'
        );
      } else {
        sessionStorage.removeItem(NOTICE_KEY);
      }
    } catch {}

    if (broadcast) {
      broadcastEvent('LOGOUT', { reason });
    }
  }, []);

  // Listen to API 401 SESSION_EXPIRED events
  useEffect(() => {
    const unsub = onSessionExpired((msg) => {
      handleLocalLogout('SESSION_EXPIRED', true);
    });
    return unsub;
  }, [handleLocalLogout]);

  // Verify and hydrate current user from backend
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    const isActive = sessionStorage.getItem(ADMIN_ACTIVE_KEY) === 'true';

    if (!token || !isActive) {
      setUser(null);
      setSessionActive(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.user && res.user.active) {
        setUser(res.user);
        setSessionActive(true);
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        } catch {}

        if (res.expiresAt) {
          setExpiresAt(res.expiresAt);
          try {
            sessionStorage.setItem(EXPIRES_AT_KEY, String(res.expiresAt));
          } catch {}
        }
      } else {
        handleLocalLogout('USER_LOGOUT', true);
      }
    } catch (e: any) {
      // If token expired on server
      if (e?.message?.toLowerCase().includes('inactivity') || e?.message?.toLowerCase().includes('expired')) {
        handleLocalLogout('SESSION_EXPIRED', true);
      } else {
        handleLocalLogout('USER_LOGOUT', true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLocalLogout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Synchronize user to localStorage when user changes
  useEffect(() => {
    if (user && sessionActive) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch {}
    }
  }, [user, sessionActive]);

  // Master live countdown interval (updates every 1000ms)
  useEffect(() => {
    if (!user || !sessionActive || !expiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        // Authoritative expiration reached!
        api.logout('SESSION_EXPIRED').catch(() => {});
        handleLocalLogout('SESSION_EXPIRED', true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, sessionActive, expiresAt, handleLocalLogout]);

  // Extend session on the server and update local countdown
  const extendSession = useCallback(async () => {
    if (!user || !sessionActive) return;

    try {
      const res = await api.extendSession();
      if (res.success && res.expiresAt) {
        setExpiresAt(res.expiresAt);
        const newSeconds = Math.max(0, Math.floor((res.expiresAt - Date.now()) / 1000));
        setSecondsRemaining(newSeconds);
        lastServerTouchRef.current = Date.now();

        try {
          sessionStorage.setItem(EXPIRES_AT_KEY, String(res.expiresAt));
        } catch {}

        broadcastEvent('SESSION_EXTENDED', { expiresAt: res.expiresAt });
      }
    } catch (err: any) {
      if (err.message && err.message.includes('expired')) {
        handleLocalLogout('SESSION_EXPIRED', true);
      }
    }
  }, [user, sessionActive, handleLocalLogout]);

  // Qualifying user activity tracking (mouse, clicks, keyboard, touch, scroll)
  // Throttled so network request occurs at most once every 30 seconds unless in warning state
  useEffect(() => {
    if (!user || !sessionActive) return;

    const handleQualifyingActivity = () => {
      const now = Date.now();
      const timeSinceLastServer = now - lastServerTouchRef.current;
      const isWarning = secondsRemaining > 0 && secondsRemaining <= 300;

      // If in warning window or it has been > 30 seconds since last sync, extend session on server
      if (isWarning || timeSinceLastServer >= 30_000) {
        extendSession();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let throttleTimeout: NodeJS.Timeout | null = null;

    const debouncedHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          handleQualifyingActivity();
        }, 1000);
      }
    };

    events.forEach(evt => window.addEventListener(evt, debouncedHandler, { passive: true }));

    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      events.forEach(evt => window.removeEventListener(evt, debouncedHandler));
    };
  }, [user, sessionActive, secondsRemaining, extendSession]);

  const role = user?.role || '';
  const roleName = user?.roleName || role;
  const isAuthenticated = !!user && !isLoading && sessionActive;
  const isExpiringSoon = isAuthenticated && secondsRemaining > 0 && secondsRemaining <= 300;

  const hasPermission = useCallback((perm: PermissionKey): boolean => {
    if (!user) return false;
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
      const timeout = res.timeoutMinutes || 30;
      const expAt = res.expiresAt || (Date.now() + timeout * 60 * 1000);

      setAuthToken(res.token);
      setUser(res.user);
      setSessionActive(true);
      setSessionTimeoutMinutes(timeout);
      setExpiresAt(expAt);
      setSecondsRemaining(Math.max(0, Math.floor((expAt - Date.now()) / 1000)));
      lastServerTouchRef.current = Date.now();

      try {
        sessionStorage.setItem(ADMIN_ACTIVE_KEY, 'true');
        sessionStorage.setItem(EXPIRES_AT_KEY, String(expAt));
        sessionStorage.setItem(TIMEOUT_MINS_KEY, String(timeout));
        sessionStorage.removeItem(NOTICE_KEY);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      } catch {}

      broadcastEvent('SESSION_EXTENDED', { expiresAt: expAt });
    } else {
      throw new Error('Authentication failed');
    }
  };

  const logout = (reason: 'USER_LOGOUT' | 'SESSION_EXPIRED' = 'USER_LOGOUT') => {
    api.logout(reason).catch(() => {});
    handleLocalLogout(reason, true);
  };

  // Called when exiting Admin panel to public storefront
  // Clears active visit flag so returning to /admin performs fresh access check
  const exitAdminSession = () => {
    try {
      sessionStorage.removeItem(ADMIN_ACTIVE_KEY);
    } catch {}
    setSessionActive(false);
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
        hasActiveAdminSession: sessionActive,
        secondsRemaining,
        sessionTimeoutMinutes,
        isExpiringSoon,
        hasPermission,
        hasAnyPermission,
        login,
        logout,
        extendSession,
        exitAdminSession,
        changePassword,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultGuestAuthContext: AuthContextType = {
  user: null,
  role: 'guest',
  roleName: 'Guest',
  isAuthenticated: false,
  isLoading: false,
  hasActiveAdminSession: false,
  secondsRemaining: 0,
  sessionTimeoutMinutes: 30,
  isExpiringSoon: false,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  login: async () => {},
  logout: () => {},
  extendSession: async () => {},
  exitAdminSession: () => {},
  changePassword: async () => ({ success: false, message: 'Not authenticated' }),
  refreshUser: async () => {}
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultGuestAuthContext;
};

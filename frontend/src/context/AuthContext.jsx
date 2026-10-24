
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { api, clearCsrfToken } from '../lib/api';

const AuthContext = createContext(null);

function normalizeUser(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    id: data.id,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshUser = useCallback(async (signal) => {
    const data = await api.get('/auth/me', { signal });
    const authenticatedUser = normalizeUser(data);

    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function initializeAuth() {
      try {
        await refreshUser(controller.signal);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        if (!controller.signal.aborted) {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsInitializing(false);
        }
      }
    }

    initializeAuth();

    return () => {
      controller.abort();
    };
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    await api.post('/auth/login', credentials);

    // Fetch the authoritative user profile from the backend.
    const authenticatedUser = await refreshUser();

    return authenticatedUser;
  }, [refreshUser]);

  const register = useCallback(async (registrationData) => {
    return api.post('/auth/register', registrationData);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');

    clearCsrfToken();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles) => Boolean(user && roles.includes(user.role)),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

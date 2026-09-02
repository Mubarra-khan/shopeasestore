import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, login } from '../api/auth.api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ecommerce_token';
const USER_KEY = 'ecommerce_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        const profile = response?.data?.data || response?.data;
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken('');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const loginUser = async (credentials) => {
    const response = await login(credentials);
    const payload = response?.data;
    const authToken = payload?.token;
    const authUser = payload?.data;

    if (!authToken || !authUser) {
      throw new Error('Invalid login response from backend');
    }

    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    return payload;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      role: user?.role || null,
      loginUser,
      logout,
      setUser,
      setToken,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

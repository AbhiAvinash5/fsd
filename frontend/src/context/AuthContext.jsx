import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('accessaudit_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessaudit_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('accessaudit_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired, clearing credentials.');
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const saveAuthSession = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('accessaudit_token', authToken);
    localStorage.setItem('accessaudit_user', JSON.stringify(authUser));
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.data.success) {
      saveAuthSession(res.data.token, res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res.data.success) {
      saveAuthSession(res.data.token, res.data.user);
    }
    return res.data;
  };

  const loginAsDemo = async () => {
    const res = await authApi.demoLogin();
    if (res.data.success) {
      saveAuthSession(res.data.token, res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessaudit_token');
    localStorage.removeItem('accessaudit_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        loginAsDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


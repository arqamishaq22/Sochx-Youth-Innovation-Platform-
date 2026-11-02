import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read token from localStorage on initial load
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || localStorage.getItem('sochx_token') || null;
  });

  // Read user from localStorage on initial load
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('sochx_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Clears all session credentials from localStorage and React state
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('sochx_token');
    localStorage.removeItem('user');
    localStorage.removeItem('sochx_user');
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  /**
   * Helper to persist user and token synchronously in localStorage and state
   */
  const saveSession = useCallback((authToken, authUser) => {
    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('sochx_token', authToken);
      setToken(authToken);
    }
    if (authUser) {
      const normalizedUser = {
        ...authUser,
        name: authUser.fullName || authUser.name || 'SochX Innovator',
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('sochx_user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    }
  }, []);

  /**
   * Demo / mock auth helper for fallback preview
   */
  const setDemoAuth = useCallback((demoUser, demoToken = 'mock-jwt-token-sochx') => {
    saveSession(demoToken, demoUser);
  }, [saveSession]);

  /**
   * Verify and refresh user data if valid token is present
   */
  const checkAuth = useCallback(async () => {
    const activeToken = localStorage.getItem('token') || localStorage.getItem('sochx_token');
    if (!activeToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.getMe();
      if (res.data?.user) {
        saveSession(activeToken, res.data.user);
      }
    } catch (err) {
      // If 401/403, clean up session
      if (err.status === 401 || err.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [saveSession, logout]);

  useEffect(() => {
    const handleUnauthorized = (event) => {
      logout();
      const message = event?.detail?.message || 'Session expired. Please log in again.';
      // Only alert and redirect if user is not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        alert(message);
        window.location.href = '/login';
      }
    };

    window.addEventListener('sochx:unauthorized', handleUnauthorized);
    checkAuth();

    return () => {
      window.removeEventListener('sochx:unauthorized', handleUnauthorized);
    };
  }, [checkAuth, logout]);

  /**
   * Authenticate user with email and password
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setAuthError(null);

      const res = await authAPI.login(credentials);
      const data = res.data;

      const receivedToken = data.token;
      const receivedUser = data.user || data;

      saveSession(receivedToken, receivedUser);

      return {
        success: true,
        user: receivedUser,
        token: receivedToken,
        message: data.message || 'Login successful',
      };
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);

      const res = await authAPI.register({
        fullName: userData.fullName || userData.name,
        name: userData.fullName || userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      const data = res.data;
      const receivedToken = data.token;
      const receivedUser = data.user || data;

      saveSession(receivedToken, receivedUser);

      return {
        success: true,
        user: receivedUser,
        token: receivedToken,
        message: data.message || 'User registered successfully',
      };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user?.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user, // Alias for backward compatibility
        token,
        isAuthenticated,
        isAdmin,
        loading,
        authError,
        login,
        register,
        logout,
        setDemoAuth,
        checkAuth,
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

export default AuthContext;

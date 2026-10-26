/**
 * Authentication & User Session Context
 * Manages JWT token persistence, user role state, notifications, and profile refreshes.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('feedneed_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/auth/me');
      setUser(data.user);
      const notifData = await apiRequest('/notifications');
      setNotifications(notifData.notifications || []);
      setUnreadCount(notifData.unreadCount || 0);
    } catch (err) {
      localStorage.removeItem('feedneed_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('feedneed_token', data.token);
    setUser(data.user);
    await fetchCurrentUser();
    return data;
  };

  const register = async (payload) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload,
    });
    localStorage.setItem('feedneed_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('feedneed_token');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllNotificationsRead = async () => {
    await apiRequest('/notifications/read', { method: 'PUT', body: {} });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

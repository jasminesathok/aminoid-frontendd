import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { emitToast } from './ToastContext';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    first_name: user.first_name ?? '',
    last_name:  user.last_name  ?? '',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on page refresh
  useEffect(() => {
    if (localStorage.getItem('persist:user') && !localStorage.getItem('token')) {
      localStorage.removeItem('persist:user');
      localStorage.removeItem('isLoggedIn');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/api/auth/me', { silent: true })
      .then(data => {
        const normalized = normalizeUser(data.user);
        setUser(normalized);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password }, { silent: true });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    const normalized = normalizeUser(data.user);
    setUser(normalized);
    emitToast('success', `Welcome back, ${normalized.first_name}!`);
    window.dispatchEvent(new Event('currencyChanged'));
    return normalized;
  };

  /**
   * signup — updated for multi-tenancy:
   *   - admin: enterpriseId is null (they ARE the enterprise root)
   *   - member: must supply enterpriseId (the admin's user id) so the backend
   *             can link them to the correct enterprise
   */
  const signup = async (
    firstName,
    lastName,
    email,
    password,
    role = 'member',
    companyName = null,
    enterpriseId = null   // ← NEW: required for member sign-up
  ) => {
    const payload = { firstName, lastName, email, password, role, companyName };
    // Only include enterpriseId for members
    if (role === 'member' && enterpriseId) {
      payload.enterpriseId = enterpriseId;
    }

    const data = await api.post('/api/auth/signup', payload, { silent: true });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    const normalized = normalizeUser(data.user);
    setUser(normalized);

    if (role === 'member') {
      emitToast('success', 'Account created! Waiting for admin approval.');
    } else {
      emitToast('success', `Account created! Welcome, ${normalized.first_name}.`);
    }
    
    window.dispatchEvent(new Event('currencyChanged'));

    return normalized;
  };

  const refreshUser = async () => {
    try {
      const data = await api.get('/api/auth/me', { silent: true });
      const normalized = normalizeUser(data.user);
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch (_) {}
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout', {}); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (
    !user ||
    !['Admin', 'ASHA'].includes(user.role) ||
    user.active === false ||
    (user.approval_status && user.approval_status !== 'approved')
  ) {
    return null;
  }

  const id = user.id || user._id;
  if (!id) return null;

  return {
    id: String(id),
    name: user.name || '',
    username: user.username || '',
    role: user.role,
    assigned_villages: Array.isArray(user.assigned_villages) ? user.assigned_villages : [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('asha_token');

    // Older versions cached the role-bearing user object in localStorage.
    // Never use that client-controlled value to establish an authenticated session.
    localStorage.removeItem('asha_user');

    if (!token) {
      setLoading(false);
      return () => { mounted = false; };
    }

    api.get('/auth/me')
      .then(({ data }) => {
        if (!mounted) return;
        const verifiedUser = normalizeUser(data?.user);
        if (!verifiedUser) {
          localStorage.removeItem('asha_token');
          setUser(null);
          return;
        }
        setUser(verifiedUser);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    const authenticatedUser = normalizeUser(data?.user);

    if (!data?.token || !authenticatedUser) {
      throw new Error('The server returned an invalid login response.');
    }

    localStorage.setItem('asha_token', data.token);
    localStorage.removeItem('asha_user');
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    localStorage.removeItem('asha_token');
    localStorage.removeItem('asha_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

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
    let token = null;

    // Storage can be disabled by browser privacy settings or sandbox policies.
    // In that case, fail closed and render the app as signed out.
    try {
      token = localStorage.getItem('asha_token');
      localStorage.removeItem('asha_user');
    } catch {
      if (mounted) setLoading(false);
      return () => { mounted = false; };
    }

    if (!token) {
      setLoading(false);
      return () => { mounted = false; };
    }

    api.get('/auth/me')
      .then(({ data }) => {
        if (!mounted) return;
        const verifiedUser = normalizeUser(data?.user);
        if (!verifiedUser) {
          try {
            localStorage.removeItem('asha_token');
          } catch {
            // The in-memory session is still cleared below.
          }
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

    try {
      localStorage.setItem('asha_token', data.token);
      localStorage.removeItem('asha_user');
    } catch {
      throw new Error('Browser storage is unavailable. Enable site storage and try again.');
    }
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    try {
      localStorage.removeItem('asha_token');
      localStorage.removeItem('asha_user');
    } catch {
      // Clear the in-memory session even when browser storage is unavailable.
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

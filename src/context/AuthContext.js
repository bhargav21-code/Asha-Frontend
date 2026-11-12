import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const getStoredToken = () => {
  try {
    return localStorage.getItem('asha_token');
  } catch {
    return null;
  }
};

const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Browser storage may be unavailable; in-memory state is still authoritative.
  }
};

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
  const [sessionCheckError, setSessionCheckError] = useState(false);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const sessionGeneration = useRef(0);

  useEffect(() => {
    let mounted = true;
    const handleSessionExpired = () => {
      sessionGeneration.current += 1;
      removeStoredItem('asha_token');
      removeStoredItem('asha_user');
      setUser(null);
      setSessionCheckError(false);
      setLoading(false);
    };
    window.addEventListener('asha:session-expired', handleSessionExpired);
    setSessionCheckError(false);
    setLoading(true);

    const restoreGeneration = ++sessionGeneration.current;
    const token = getStoredToken();

    // Older versions cached the role-bearing user object in localStorage.
    // Never use that client-controlled value to establish an authenticated session.
    removeStoredItem('asha_user');

    if (!token) {
      setUser(null);
      setSessionCheckError(false);
      setLoading(false);
      return () => {
        mounted = false;
        window.removeEventListener('asha:session-expired', handleSessionExpired);
      };
    }

    api.get('/auth/me')
      .then(({ data }) => {
        // Ignore stale restoration responses after login/logout or token replacement.
        if (
          !mounted ||
          sessionGeneration.current !== restoreGeneration ||
          getStoredToken() !== token
        ) return;

        const verifiedUser = normalizeUser(data?.user);
        if (!verifiedUser) {
          removeStoredItem('asha_token');
          setUser(null);
          return;
        }
        setUser(verifiedUser);
      })
      .catch((error) => {
        if (
          !mounted ||
          sessionGeneration.current !== restoreGeneration ||
          getStoredToken() !== token
        ) return;

        // Explicit authentication failures invalidate the saved session.
        // Network/server failures are indeterminate: retain the token and offer retry.
        if ([401, 403].includes(error.response?.status)) {
          removeStoredItem('asha_token');
          setSessionCheckError(false);
        } else {
          setSessionCheckError(true);
        }
        setUser(null);
      })
      .finally(() => {
        if (mounted && sessionGeneration.current === restoreGeneration) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      window.removeEventListener('asha:session-expired', handleSessionExpired);
    };
  }, [restoreAttempt]);

  const login = async (username, password) => {
    const loginGeneration = ++sessionGeneration.current;
    const { data } = await api.post('/auth/login', { username, password });
    if (sessionGeneration.current !== loginGeneration) {
      throw new Error('Login was cancelled because the session changed. Please try again.');
    }
    const authenticatedUser = normalizeUser(data?.user);

    if (!data?.token || !authenticatedUser) {
      throw new Error('The server returned an invalid login response.');
    }

    try {
      localStorage.setItem('asha_token', data.token);
    } catch {
      throw new Error('Browser storage is unavailable. Enable site storage and try again.');
    }
    removeStoredItem('asha_user');
    setUser(authenticatedUser);
    setSessionCheckError(false);
    setLoading(false);
    return authenticatedUser;
  };

  const retrySessionRestore = () => {
    if (!getStoredToken()) {
      setUser(null);
      setSessionCheckError(false);
      setLoading(false);
      return;
    }
    setSessionCheckError(false);
    setLoading(true);
    setRestoreAttempt((attempt) => attempt + 1);
  };

  const logout = () => {
    sessionGeneration.current += 1;
    removeStoredItem('asha_token');
    removeStoredItem('asha_user');
    setUser(null);
    setSessionCheckError(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, sessionCheckError, retrySessionRestore }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

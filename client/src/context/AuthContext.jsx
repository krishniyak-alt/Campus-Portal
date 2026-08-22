import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.token) {
          setUser(parsed);
        } else {
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to parse user info', err);
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
    setLoading(false);

    const handleAuthError = () => {
      setUser(null);
      localStorage.removeItem('userInfo');
    };

    window.addEventListener('auth:unauthorized', handleAuthError);
    return () => window.removeEventListener('auth:unauthorized', handleAuthError);
  }, []);

  const login = async (email, phone, password) => {
    // Handle both login(email, phone, password) and legacy login(email, password)
    const payload = typeof phone === 'string' && password ? { email, phone, password } : { email, password: phone || password };
    const { data } = await API.post('/auth/login', payload);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

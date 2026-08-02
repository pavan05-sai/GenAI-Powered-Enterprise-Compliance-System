import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // start loading to rehydrate from localStorage

  // Rehydrate session from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('veritas_user');
    const savedToken = localStorage.getItem('veritas_token');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        // Corrupted storage — clear it
        localStorage.removeItem('veritas_user');
        localStorage.removeItem('veritas_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { user: userData, token: userToken } = res.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('veritas_user', JSON.stringify(userData));
      localStorage.setItem('veritas_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed. Check your credentials.';
      return { success: false, error: errMsg };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      const { user: userData, token: userToken } = res.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('veritas_user', JSON.stringify(userData));
      localStorage.setItem('veritas_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed.';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('veritas_user');
    localStorage.removeItem('veritas_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

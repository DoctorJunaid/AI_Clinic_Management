import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

// Set base URL for axios
const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://ai-clinic-management-iota.vercel.app';
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:5000';
};

axios.defaults.baseURL = getBaseURL();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios to always send token if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      loadUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      setUser(res.data.data);
    } catch (err) {
      console.error('Error loading user', err);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', { email, password });
      sessionStorage.removeItem('saylani_seen_startup');
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('Login successful');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('saylani_seen_startup');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const updateSubscription = async (plan) => {
    try {
      await axios.put('/api/v1/auth/subscription', { plan });
      setUser(prev => ({
        ...prev,
        subscriptionPlan: plan
      }));
      toast.success(`Subscription updated to ${plan === 'pro' ? 'Pro Plan' : 'Free Plan'}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription update failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

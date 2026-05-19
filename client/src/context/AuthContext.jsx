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

  // Configure Axios request and response interceptors
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const activeToken = localStorage.getItem('token') || token;
        if (activeToken) {
          config.headers['Authorization'] = `Bearer ${activeToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only clear credentials if the response is explicitly a 401 Unauthorized authentication failure
        if (error.response && error.response.status === 401) {
          console.warn('Axios Interceptor: Unauthorized 401. Clearing session.');
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [token]);

  // Synchronize localStorage and initialize user session
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      loadUser();
    } else {
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
      console.error('Error loading user details:', err);
      // Retain token on slow connection/transient server 5xx errors;
      // Only clear token if the response is explicitly 401 Unauthorized
      if (err.response && err.response.status === 401) {
        setToken(null);
      }
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

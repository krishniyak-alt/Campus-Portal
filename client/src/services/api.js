import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const userStorage = localStorage.getItem('userInfo');
    if (userStorage) {
      const user = JSON.parse(userStorage);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or missing/invalid
      localStorage.removeItem('userInfo');
      window.dispatchEvent(new Event('auth:unauthorized'));
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

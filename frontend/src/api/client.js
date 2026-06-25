import axios from 'axios';

// Use environment variable if available, fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/`;

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add access token
client.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refreshes
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        if (tokens && tokens.refresh) {
          const res = await axios.post(`${API_URL}auth/token/refresh/`, {
            refresh: tokens.refresh,
          });
          if (res.status === 200) {
            tokens.access = res.data.access;
            localStorage.setItem('tokens', JSON.stringify(tokens));
            client.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
            return client(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;

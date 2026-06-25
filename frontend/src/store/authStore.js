import { create } from 'zustand';
import client from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: !!localStorage.getItem('tokens'),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await client.post('auth/login/', { username, password });
      const { access, refresh, role, email, id } = res.data;
      
      localStorage.setItem('tokens', JSON.stringify({ access, refresh }));
      
      set({ 
        user: { id, username, email, role }, 
        isAuthenticated: true, 
        loading: false 
      });
      
      await get().fetchProfile();
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.detail || 'Invalid username or password', 
        loading: false 
      });
      return false;
    }
  },

  googleLogin: async (tokenData) => {
    set({ loading: true, error: null });
    try {
      const res = await client.post('auth/google-login/', tokenData);
      const { access, refresh, username, role, email, id } = res.data;
      
      localStorage.setItem('tokens', JSON.stringify({ access, refresh }));
      
      set({ 
        user: { id, username, email, role }, 
        isAuthenticated: true, 
        loading: false 
      });
      
      await get().fetchProfile();
      return true;
    } catch (err) {
      set({ error: 'Google login failed', loading: false });
      return false;
    }
  },

  register: async (username, email, password, role) => {
    set({ loading: true, error: null });
    try {
      await client.post('auth/register/', { username, email, password, role });
      set({ loading: false });
      return true;
    } catch (err) {
      set({ 
        error: Object.values(err.response?.data || {}).flat()[0] || 'Registration failed', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('tokens');
    set({ user: null, profile: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const res = await client.get('auth/profile/');
      set({ profile: res.data });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await client.put('auth/profile/', profileData);
      set({ profile: res.data });
      return true;
    } catch (err) {
      console.error('Failed to update profile', err);
      return false;
    }
  },

  checkAuth: async () => {
    const tokens = localStorage.getItem('tokens');
    if (!tokens) return;
    
    try {
      const res = await client.get('auth/me/');
      set({ user: res.data, profile: res.data.profile, isAuthenticated: true });
    } catch (err) {
      get().logout();
    }
  }
}));

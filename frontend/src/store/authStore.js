import { create } from 'zustand';
import client from '../api/client';

const formatApiError = (err, fallback) => {
  const data = err.response?.data;
  if (!data) return { message: fallback, fields: {} };
  if (typeof data === 'string') return { message: data, fields: {} };
  if (data.detail) return { message: data.detail, fields: {} };

  const fields = {};
  let message = fallback;

  Object.entries(data).forEach(([key, value]) => {
    const msg = Array.isArray(value) ? value[0] : value;
    if (typeof msg === 'string') {
      fields[key] = msg;
      message = msg;
    }
  });

  return { message, fields };
};

const persistSession = (set, get, payload) => {
  const { access, refresh, id, username, email, role } = payload;
  localStorage.setItem('tokens', JSON.stringify({ access, refresh }));
  set({
    user: { id, username, email, role },
    isAuthenticated: true,
    loading: false,
    error: null,
    fieldErrors: {},
  });
};

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: !!localStorage.getItem('tokens'),
  authReady: false,
  loading: false,
  error: null,
  fieldErrors: {},

  initializeAuth: async () => {
    const tokens = localStorage.getItem('tokens');
    if (!tokens) {
      set({ authReady: true, isAuthenticated: false, user: null, profile: null });
      return;
    }

    try {
      const res = await client.get('auth/me/');
      set({
        user: res.data,
        profile: res.data.profile,
        isAuthenticated: true,
        authReady: true,
        error: null,
      });
    } catch {
      localStorage.removeItem('tokens');
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        authReady: true,
        error: null,
      });
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null, fieldErrors: {} });
    try {
      const res = await client.post('auth/login/', {
        username: username.trim(),
        password,
      });
      persistSession(set, get, res.data);
      await get().fetchProfile();
      return { success: true };
    } catch (err) {
      const { message } = formatApiError(err, 'Invalid username or password');
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  register: async ({ username, email, password, passwordConfirm }) => {
    set({ loading: true, error: null, fieldErrors: {} });
    try {
      const res = await client.post('auth/register/', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirm: passwordConfirm,
      });
      persistSession(set, get, res.data);
      await get().fetchProfile();
      return { success: true };
    } catch (err) {
      const { message, fields } = formatApiError(err, 'Registration failed');
      set({ error: message, fieldErrors: fields, loading: false });
      return { success: false, message, fields };
    }
  },

  logout: () => {
    localStorage.removeItem('tokens');
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      error: null,
      fieldErrors: {},
    });
  },

  clearAuthError: () => set({ error: null, fieldErrors: {} }),

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
    await get().initializeAuth();
  },
}));

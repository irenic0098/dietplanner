const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login/`,
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register/`,
  AUTH_REFRESH: `${API_BASE_URL}/api/auth/token/refresh/`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me/`,
  USER_PROFILE: `${API_BASE_URL}/api/auth/profile/`,

  NUTRITION_ENTRIES: `${API_BASE_URL}/api/nutrition/`,
  TRACKING: `${API_BASE_URL}/api/tracking/`,
  RECIPES_LIST: `${API_BASE_URL}/api/recipes/`,
  RECIPES_DETAIL: (id) => `${API_BASE_URL}/api/recipes/${id}/`,
  GAMIFICATION: `${API_BASE_URL}/api/gamification/`,
};

export const getDefaultHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getDefaultHeaders,
};

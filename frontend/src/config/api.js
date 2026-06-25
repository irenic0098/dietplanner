// API Configuration for Frontend
// This file should be imported and used to configure axios/fetch requests

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: `${API_BASE_URL}/api/accounts/login/`,
  AUTH_REGISTER: `${API_BASE_URL}/api/accounts/register/`,
  AUTH_REFRESH: `${API_BASE_URL}/api/accounts/token/refresh/`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/accounts/logout/`,
  
  // User Profile
  USER_PROFILE: `${API_BASE_URL}/api/accounts/profile/`,
  USER_UPDATE: `${API_BASE_URL}/api/accounts/profile/update/`,
  
  // Nutrition
  NUTRITION_ENTRIES: `${API_BASE_URL}/api/nutrition/entries/`,
  NUTRITION_DAILY: `${API_BASE_URL}/api/nutrition/daily/`,
  
  // Tracking
  TRACKING_LOG: `${API_BASE_URL}/api/tracking/log/`,
  TRACKING_HISTORY: `${API_BASE_URL}/api/tracking/history/`,
  
  // Recipes
  RECIPES_LIST: `${API_BASE_URL}/api/recipes/`,
  RECIPES_DETAIL: (id) => `${API_BASE_URL}/api/recipes/${id}/`,
  
  // Reports
  REPORTS_SUMMARY: `${API_BASE_URL}/api/reports/summary/`,
  REPORTS_GENERATE: `${API_BASE_URL}/api/reports/generate/`,
  
  // Gamification
  GAMIFICATION_ACHIEVEMENTS: `${API_BASE_URL}/api/gamification/achievements/`,
  GAMIFICATION_LEADERBOARD: `${API_BASE_URL}/api/gamification/leaderboard/`,
};

// Axios instance configuration (if using axios)
export const getAxiosConfig = () => ({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For CORS with credentials
});

// Default fetch headers
export const getDefaultHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getAxiosConfig,
  getDefaultHeaders,
};

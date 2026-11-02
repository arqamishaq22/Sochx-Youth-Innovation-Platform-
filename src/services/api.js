import axios from 'axios';

/**
 * SochX Centralized Axios HTTP Client
 * Connected to local Express + MySQL backend on port 5000.
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically retrieves Bearer JWT token from localStorage and attaches to Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('sochx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Standardizes error messages, notifies on offline/network failures, and handles 401/403 session expirations.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Capture Network Failure / Backend Server Offline
    if (!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const offlineMsg = 'Backend server is offline or unreachable. Please verify XAMPP MySQL and Node.js server are running.';
      window.dispatchEvent(
        new CustomEvent('sochx:toast', {
          detail: {
            type: 'error',
            message: offlineMsg,
          },
        })
      );

      const networkError = new Error(offlineMsg);
      networkError.isNetworkError = true;
      networkError.status = 0;
      return Promise.reject(networkError);
    }

    // 2. Capture 401 Unauthorized & 403 Forbidden (Token Expired)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and session
      localStorage.removeItem('token');
      localStorage.removeItem('sochx_token');
      localStorage.removeItem('user');
      localStorage.removeItem('sochx_user');

      // Dispatch unauthorized event with expiration notice
      window.dispatchEvent(
        new CustomEvent('sochx:unauthorized', {
          detail: {
            message: 'Session expired. Please log in again.',
          },
        })
      );
    }

    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected server error occurred. Please try again.';

    const enhancedError = new Error(customMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

/**
 * Modular API Helper: Authentication
 */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

/**
 * Modular API Helper: Ideas Feed, Details & Upvoting
 */
export const ideasAPI = {
  getAll: (params = {}) => api.get('/ideas', { params }),
  getById: (id) => api.get(`/ideas/${id}`),
  create: (data) => api.post('/ideas', data),
  update: (id, data) => api.put(`/ideas/${id}`, data),
  delete: (id) => api.delete(`/ideas/${id}`),
  upvote: (id) => api.post(`/ideas/${id}/upvote`),
  addComment: (id, commentText) => api.post(`/ideas/${id}/comments`, { commentText }),
};

/**
 * Modular API Helper: User Profile & Security
 */
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

/**
 * Modular API Helper: Admin Moderation & User Management
 */
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getIdeas: () => api.get('/admin/ideas'),
  updateIdeaStatus: (id, status) => api.put(`/admin/ideas/${id}/status`, { status }),
  deleteIdea: (id) => api.delete(`/admin/ideas/${id}`),
};

export default api;

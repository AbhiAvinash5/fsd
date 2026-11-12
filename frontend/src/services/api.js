import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to all requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessaudit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, redirect or clear token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('accessaudit_token');
        localStorage.removeItem('accessaudit_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  demoLogin: () => api.post('/auth/demo'),
  getMe: () => api.get('/auth/me')
};

export const auditApi = {
  scan: (url, multiPage = false, maxPages = 3) => api.post('/audits/scan', { url, multiPage, maxPages }),
  getAll: (search = '', limit = 50) => api.get('/audits', { params: { search, limit } }),
  getById: (id) => api.get(`/audits/${id}`),
  delete: (id) => api.delete(`/audits/${id}`),
  compare: (audit1, audit2) => api.get('/audits/compare', { params: { audit1, audit2 } }),
  getStats: () => api.get('/audits/stats/overview'),
  getAiAdvice: (issueId) => api.post(`/audits/issues/${issueId}/ai-advice`)
};

export default api;


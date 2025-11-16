import axios from 'axios';

// Базовый URL API
const API_BASE_URL = 'http://localhost:8000';

// Создание axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматическое добавление токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API функции
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getCurrentUser: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changeEmail: (data) => api.put('/api/auth/email', data),
  uploadAvatar: (photoUrl) => api.put('/api/auth/avatar', { photo_url: photoUrl }),
};

export const adminAPI = {
  getAllUsers: (city = null, search = null) => {
    const params = {};
    if (city) params.city = city;
    if (search) params.search = search;
    return api.get('/api/admin/users', { params });
  },
  makeModerator: (userId) => api.post(`/api/admin/users/${userId}/make-moderator`),
  removeModerator: (userId) => api.post(`/api/admin/users/${userId}/remove-moderator`),
  banUser: (userId) => api.post(`/api/admin/users/${userId}/ban`),
  unbanUser: (userId) => api.post(`/api/admin/users/${userId}/unban`),
};

export const nkoAPI = {
  getProfile: () => api.get('/api/nko/profile'),
  updateProfile: (data) => api.put('/api/nko/profile', data),
  changeEmail: (data) => api.put('/api/nko/email', data),
  uploadAvatar: (photoUrl) => api.put('/api/nko/avatar', { photo_url: photoUrl }),
};

export const moderatorAPI = {
  getDashboard: () => api.get('/api/moderator/dashboard'),
};

export const volunteerAPI = {
  addFavorite: (data) => api.post('/api/volunteers/favorites', data),
  getFavorites: (itemType = null) => {
    const params = itemType ? { item_type: itemType } : {};
    return api.get('/api/volunteers/favorites', { params });
  },
  removeFavorite: (favoriteId) => api.delete(`/api/volunteers/favorites/${favoriteId}`),
};

export default api;

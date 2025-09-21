import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),
};

export const socialAPI = {
  getAccounts: () => api.get('/api/social/accounts'),
  getTwitterAuthUrl: () => api.get('/api/social/twitter/auth'),
  connectTwitter: (data: { code: string; state: string }) =>
    api.post('/api/social/twitter/callback', data),
  getLinkedInAuthUrl: () => api.get('/api/social/linkedin/auth'),
  connectLinkedIn: (data: { code: string; state: string }) =>
    api.post('/api/social/linkedin/callback', data),
  getInstagramAuthUrl: () => api.get('/api/social/instagram/auth'),
  connectInstagram: (data: { code: string; state: string }) =>
    api.post('/api/social/instagram/callback', data),
  disconnectPlatform: (platform: string) =>
    api.delete(`/api/social/${platform}/disconnect`),
  testPost: (platform: string, message: string) =>
    api.post(`/api/social/${platform}/test`, { message }),
  getPlatformInfo: () => api.get('/api/social/info'),
};

export const postsAPI = {
  getPosts: (params?: any) => api.get('/api/posts', { params }),
  getPost: (postId: string) => api.get(`/api/posts/${postId}`),
  createPost: (data: any) => api.post('/api/posts', data),
  updatePost: (postId: string, data: any) => api.put(`/api/posts/${postId}`, data),
  deletePost: (postId: string) => api.delete(`/api/posts/${postId}`),
  postNow: (postId: string) => api.post(`/api/posts/${postId}/post-now`),
  getCalendar: (year: number, month: number) =>
    api.get(`/api/posts/calendar/${year}/${month}`),
  getAnalytics: (params?: any) => api.get('/api/posts/analytics/summary', { params }),
};

export const aiAPI = {
  startChat: () => api.post('/api/ai/chat/start'),
  sendMessage: (sessionId: string, message: string) =>
    api.post(`/api/ai/chat/${sessionId}/message`, { message }),
  generateContent: (data: {
    prompt: string;
    type?: string;
    platforms?: string[];
  }) => api.post('/api/ai/generate-content', data),
  getChatHistory: (sessionId: string) => api.get(`/api/ai/chat/${sessionId}/history`),
  getChatSessions: () => api.get('/api/ai/chat/sessions'),
};

export const contentAPI = {
  uploadMedia: (formData: FormData) => api.post('/api/content/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteMedia: (filename: string) => api.delete(`/api/content/uploads/${filename}`),
  getTemplates: () => api.get('/api/content/templates'),
  getHashtags: (category: string) => api.get(`/api/content/hashtags/${category}`),
};

export default api;
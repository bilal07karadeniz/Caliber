import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh');
        if (data.success && data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
};

// Users
export const userApi = {
  getProfile: (id?: string) => api.get(id ? `/users/${id}` : '/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
  updateSkills: (skills: any[]) => api.put('/users/me/skills', { skills }),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/users/me/avatar', fd);
  },
  getAllUsers: (params?: any) => api.get('/users', { params }),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
};

// Companies
export const companyApi = {
  update: (data: any) => api.put('/companies/profile', data),
  get: (userId: string) => api.get(`/companies/${userId}`),
  getAll: (params?: any) => api.get('/companies', { params }),
};

// Jobs
export const jobApi = {
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.patch(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  get: (id: string) => api.get(`/jobs/${id}`),
  getAll: (params?: any) => api.get('/jobs', { params }),
  getMyListings: (params?: any) => api.get('/jobs/my-listings', { params }),
};

// Applications
export const applicationApi = {
  apply: (data: { jobId: string; coverLetter?: string }) => api.post('/applications', data),
  getMy: (params?: any) => api.get('/applications/my', { params }),
  getForJob: (jobId: string, params?: any) => api.get(`/applications/job/${jobId}`, { params }),
  get: (id: string) => api.get(`/applications/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/applications/${id}/status`, { status }),
  withdraw: (id: string) => api.delete(`/applications/${id}`),
};

// Resumes
export const resumeApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('resume', file);
    return api.post('/resumes/upload', fd);
  },
  getAll: () => api.get('/resumes'),
  get: (id: string) => api.get(`/resumes/${id}`),
  download: (id: string) => api.get(`/resumes/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};

// Recommendations
export const recommendationApi = {
  getMy: () => api.get('/recommendations'),
  getCandidates: (jobId: string) => api.get(`/recommendations/job/${jobId}/candidates`),
  getMatch: (jobId: string) => api.get(`/recommendations/match/${jobId}`),
  refresh: () => api.post('/recommendations/refresh'),
};

// Skill Gap
export const skillGapApi = {
  analyzeForJob: (jobId: string) => api.get(`/skill-gap/job/${jobId}`),
  careerInsights: () => api.get('/skill-gap/career-insights'),
  learningPath: () => api.get('/skill-gap/learning-path'),
};

// Notifications
export const notificationApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSystemHealth: () => api.get('/admin/system-health'),
  getUserActivity: (params?: any) => api.get('/admin/user-activity', { params }),
  getAiMetrics: () => api.get('/admin/ai-metrics'),
  manageJob: (id: string, action: string) => api.patch(`/admin/jobs/${id}`, { action }),
};

// Privacy
export const privacyApi = {
  exportData: () => api.get('/privacy/export'),
  deleteAccount: (password: string) => api.delete('/privacy/delete-account', { data: { password } }),
};

export default api;

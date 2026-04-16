import axios from 'axios';

// En dev: usa /api (relativo) para que pase por el proxy/túnel ngrok
// En prod: usa VITE_API_URL o fallback absoluto
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:4000/api');

/** Base URL para archivos estáticos legacy (rutas relativas /uploads/...). */
const LEGACY_MEDIA_BASE = API_URL.startsWith('/') ? '' : API_URL.replace(/\/api\/?$/, '') || '';

/**
 * Resuelve una URL de media: si es absoluta (Cloudinary, etc.) la devuelve tal cual;
 * si es relativa (/uploads/...) le antepone el host del backend.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${LEGACY_MEDIA_BASE}${url}`;
}

/** @deprecated Usa resolveMediaUrl() en su lugar */
export const MEDIA_BASE_URL = LEGACY_MEDIA_BASE;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token y header ngrok cuando se accede por túnel
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Evitar bloqueo de ngrok en plan gratuito (página de advertencia que bloquea registro/login)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (
      origin.endsWith('.ngrok-free.app') ||
      origin.endsWith('.ngrok-free.dev') ||
      origin.endsWith('.ngrok.io')
    ) {
      config.headers['ngrok-skip-browser-warning'] = '1';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: 401 = sesión inválida, limpiar y redirigir a login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Admin services (solo admin)
export const adminService = {
  getUsersWithEnrollments: () => api.get('/admin/users'),
  updateUserPassword: (userId, password) => api.put(`/admin/users/${userId}/password`, { password }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => localStorage.removeItem('token'),
};

// Instructor services
export const instructorService = {
  getProfile: (id) => api.get(`/instructors/${id}`),
  getMyProfile: () => api.get('/instructors/me'),
  updateMyProfile: (data) => api.put('/instructors/me', data),
  uploadProfileImage: (formData) =>
    api.post('/instructors/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadCoverImage: (formData) =>
    api.post('/instructors/me/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  setProfileImageUrl: (imageUrl) =>
    api.put('/instructors/me/profile-image', { imageUrl }),
  setCoverImageUrl: (imageUrl) =>
    api.put('/instructors/me/cover-image', { imageUrl }),
};

// Course services
export const courseService = {
  getCourses: (search = '') =>
    api.get('/courses', { params: search ? { search: search.trim() } : {} }),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  createCheckout: (id) => api.post(`/courses/${id}/checkout`),
  rateCourse: (id, rating) => api.post(`/courses/${id}/rate`, { rating }),
};

// Video services
export const videoService = {
  uploadVideo: (courseId, formData) =>
    api.post(`/videos/${courseId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  createVideo: (courseId, data) =>
    api.post(`/videos/${courseId}/create`, data),
  getVideosByCourse: (courseId) => api.get(`/videos/${courseId}`),
  getVideoById: (courseId, videoId) => api.get(`/videos/${courseId}/${videoId}`),
  updateVideo: (courseId, videoId, data) => api.put(`/videos/${courseId}/${videoId}`, data),
  deleteVideo: (courseId, videoId) => api.delete(`/videos/${courseId}/${videoId}`),
};

// Section services
export const sectionService = {
  getByCourse: (courseId) => api.get(`/sections/${courseId}`),
  create: (courseId, data) => api.post(`/sections/${courseId}`, data),
  update: (courseId, sectionId, data) => api.put(`/sections/${courseId}/${sectionId}`, data),
  delete: (courseId, sectionId) => api.delete(`/sections/${courseId}/${sectionId}`),
};

// Course file services (archivos descargables)
export const courseFileService = {
  getByCourse: (courseId) => api.get(`/course-files/${courseId}`),
  upload: (courseId, formData) =>
    api.post(`/course-files/${courseId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  create: (courseId, data) =>
    api.post(`/course-files/${courseId}/create`, data),
  delete: (courseId, fileId) => api.delete(`/course-files/${courseId}/${fileId}`),
};

// Progress services
export const progressService = {
  markVideoWatched: (courseId, videoId) =>
    api.post(`/progress/${courseId}/${videoId}/mark-watched`),
  getProgress: (courseId) => api.get(`/progress/${courseId}/progress`),
  getAllProgress: (courseId) => api.get(`/progress/${courseId}/all-progress`),
  downloadDiploma: async (courseId, courseTitle = 'curso') => {
    try {
      const res = await api.get(`/progress/${courseId}/diploma`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = String(courseTitle).replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '').trim().slice(0, 50) || 'curso';
      link.setAttribute('download', `Diploma-${safeTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          const e = new Error(json.message || 'Error al descargar el diploma');
          e.response = { data: json };
          throw e;
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.response) throw parseErr;
        }
      }
      throw err;
    }
  },
};

async function getCloudinarySignature(folder) {
  const res = await api.post('/upload/sign', { folder });
  return res.data;
}

export async function uploadToCloudinary(file, folder, resourceType = 'auto', onProgress) {
  const sig = await getCloudinarySignature(folder);
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.api_key);
  form.append('timestamp', sig.timestamp);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    },
  );
  return res.data;
}

export { API_URL };
export default api;

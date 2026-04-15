import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/** Base URL para archivos estáticos (videos, subtítulos). En dev con proxy usa '' para evitar CORS. */
export const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, '') || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => localStorage.removeItem('token'),
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
  rateCourse: (id, rating) => api.post(`/courses/${id}/rate`, { rating }),
};

// Video services
export const videoService = {
  uploadVideo: (courseId, formData) =>
    api.post(`/videos/${courseId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
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

export { API_URL };
export default api;

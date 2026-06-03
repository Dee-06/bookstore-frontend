import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ---- Books ----
export const bookService = {
  getAll: (params) => API.get('/books', { params }),           // ?page=1&category=fiction&search=keyword
  getById: (id) => API.get(`/books/${id}`),
  create: (data) => API.post('/books', data),                  // Admin only
  update: (id, data) => API.put(`/books/${id}`, data),         // Admin only
  delete: (id) => API.delete(`/books/${id}`),                  // Admin only
  getCategories: () => API.get('/books/categories'),
};

// ---- Orders ----
export const orderService = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my-orders'),
  getById: (id) => API.get(`/orders/${id}`),
  getAll: () => API.get('/orders'),                            // Admin only
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
};

// ---- Payment (Paystack) ----
export const paymentService = {
  initiate: (data) => API.post('/payment/initiate', data),     // returns { authorizationUrl, reference }
  verify: (reference) => API.get(`/payment/verify/${reference}`),
};

// ---- Upload ----
export const uploadService = {
  // file is a File object from an <input type="file">
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return API.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default API;

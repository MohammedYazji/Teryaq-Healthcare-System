import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teryaq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.data?.message === 'jwt expired') {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

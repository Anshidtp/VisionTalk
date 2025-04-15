import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = 
      error.response?.data?.detail || 
      error.message || 
      'An unexpected error occurred';
    
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
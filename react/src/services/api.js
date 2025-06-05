import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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

// Add this method to your api object
api.getCached = async function(url, params = {}, options = {}) {
  try {
    const response = await this.get(url, { 
      params: {
        ...params,
        force_refresh: options.forceRefresh || false
      }
    });
    
    return {
      data: response.data,
      fromCache: response.data.fromCache || false
    };
  } catch (error) {
    console.error('Cached API request error:', error);
    throw error;
  }
};

export default api;
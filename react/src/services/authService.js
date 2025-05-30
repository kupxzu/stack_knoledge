import api from '@services/api';

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, token };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.errors?.login?.[0] || 'Login failed' 
      };
    }
  },

  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/user');
      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to get profile' };
    }
  },

  getStoredUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  getStoredToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getStoredToken();
  }
};
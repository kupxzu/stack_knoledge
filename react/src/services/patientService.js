import api from './api';

class PatientService {
  // Get patients with intelligent caching
  async getPatients(params = {}, options = { useCache: true }) {
    try {
      const response = await api.get('/patients', {
        params: {
          ...params,
          force_refresh: options.useCache ? false : true
        }
      });
      
      return {
        ...response.data,
        fromCache: response.data.from_cache || false
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }
  
  // Get single patient with caching
  async getPatient(id, options = {}) {
    try {
      const result = await api.getCached(`/patients/${id}`, {}, options);
      return result;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  // Create patient and invalidate cache
  async createPatient(patientData) {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  // Update patient and invalidate cache
  async updatePatient(id, patientData) {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  // Delete patient and invalidate cache
  async deletePatient(id) {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  // Get lookup data
  async getAddresses(params = {}) {
    return api.getCached('/patient-addresses', params);
  }

  async getRooms(params = {}) {
    return api.getCached('/patient-rooms', params);
  }

  async getPhysicians(params = {}) {
    return api.getCached('/patient-physicians', params);
  }

  // Force refresh methods
  async refreshPatients(params = {}) {
    return this.getPatients(params, { forceRefresh: true });
  }

  async refreshPatient(id) {
    return this.getPatient(id, { forceRefresh: true });
  }
}

export default new PatientService();
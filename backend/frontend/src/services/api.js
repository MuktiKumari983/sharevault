import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resourceService = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/resources', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },
  create: async (resource) => {
    const response = await api.post('/resources', resource);
    return response.data;
  },
};

export const bookingService = {
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  review: async (bookingId, reviewData) => {
    const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
    return response.data;
  },
  checkIn: async (bookingId, checkInData) => {
    const response = await api.post(`/bookings/${bookingId}/check-in`, checkInData);
    return response.data;
  },
  checkOut: async (bookingId, checkOutData) => {
    const response = await api.post(`/bookings/${bookingId}/check-out`, checkOutData);
    return response.data;
  },
  getHistory: async (userId) => {
    const response = await api.get(`/bookings/history/${userId}`);
    return response.data;
  },
};

export const aiService = {
  verifyEligibility: async (userQualification, resourceRequirement) => {
    const response = await api.post('/ai/verify-eligibility', {
      userQualification,
      resourceRequirement,
    });
    return response.data;
  },
};

export const auditService = {
  getAll: async () => {
    const response = await api.get('/audit-logs');
    return response.data;
  },
};

export default api;

import axios from 'axios';

// Forcé pour éviter les problèmes de variables d'environnement
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    if (response.data.token && response.data.user) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return {
        success: true,
        token: response.data.token,
        user: response.data.user
      };
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },
};

// Health Centers API
export const centersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/centers');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/centers/${id}`);
    return response.data;
  },

  getCurrent: async (centerId?: string) => {
    const response = await apiClient.get('/center', {
      params: { centerId }
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/centers', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/centers/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/centers/${id}/status`, { isActive });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/centers/${id}`);
    return response.data;
  },
};

// Patients API
export const patientsAPI = {
  getAll: async (centerId?: string, search?: string) => {
    const response = await apiClient.get('/patients', {
      params: { centerId, search }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/patients', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getAll: async (centerId?: string, category?: string) => {
    const response = await apiClient.get('/services', {
      params: { centerId, category }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/services', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/services/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/services/${id}/status`, { isActive });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  },
};

// Tickets API
export const ticketsAPI = {
  getAll: async (centerId?: string, status?: string, date?: string) => {
    const response = await apiClient.get('/tickets', {
      params: { centerId, status, date }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/tickets/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/tickets/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },

  getStats: async (centerId?: string) => {
    const response = await apiClient.get('/tickets/stats', {
      params: { centerId }
    });
    return response.data;
  },
};

// Medicines API
export const medicinesAPI = {
  getAll: async (centerId?: string, lowStock?: boolean, expiringSoon?: boolean) => {
    const response = await apiClient.get('/medicines', {
      params: { centerId, lowStock, expiringSoon }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/medicines/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/medicines', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/medicines/${id}`, data);
    return response.data;
  },

  updateStock: async (id: string, stock: number) => {
    const response = await apiClient.patch(`/medicines/${id}/stock`, { stock });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/medicines/${id}`);
    return response.data;
  },

  getStats: async (centerId?: string) => {
    const response = await apiClient.get('/medicines/stats', {
      params: { centerId }
    });
    return response.data;
  },
};

export default apiClient;
